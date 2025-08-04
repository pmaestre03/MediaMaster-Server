const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();
const port = 3000; // Puerto en el que se ejecutará el servidor
const path = require('path');
const { list } = require('pm2');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const uuid = require('uuid');

// Importación de credenciales
const externalKeys = require('./apiKeys.js');
const mysqlCredentials = require('./mysqlCredentials.js');
const mailCredentials = require('./mailCredentials.js');
// Usa cors en todos los directorios 
app.use(cors());
app.use(bodyParser.json());

app.listen(port, '127.0.0.1', () => {
  console.log('Servidor escuchando en http://127.0.0.1:3000');
});




app.use(cors({
  origin: 'http://localhost:3000', // o '*' para permitir todos (menos seguro)
}));

// Configura express para servir archivos estáticos desde el directorio "public"
app.use(express.static('public'));
app.use(express.json()); // Agrega este middleware para analizar el cuerpo de la solicitud en formato JSON
app.use(express.urlencoded({ extended: true }));
// API key configuration
const apiKeys = {
    movie: externalKeys.movie,
    tv: externalKeys.tv,
    games: externalKeys.games
};

// MYSQL Connection
const connection = mysql.createConnection({
    host: mysqlCredentials.host,
    user: mysqlCredentials.user,
    password: mysqlCredentials.password,
    database: mysqlCredentials.database
});

// Nodemailer
let transporter = nodemailer.createTransport({
    host: mailCredentials.host,          // smtp.ionos.es
    port: mailCredentials.port,          // 587
    secure: mailCredentials.secure,      // false (TLS)
    auth: {
        user: mailCredentials.auth.user,
        pass: mailCredentials.auth.pass
    }
});



app.post('/', (req, res) => {
    const user_mail = req.headers['user_mail'];
    const user_id = req.headers['user_id'];
    if (user_mail !== undefined && user_id !== undefined) {
        res.redirect('/search');
    } else {
        res.redirect('/index');
    }
});

app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'search.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/forgot', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'forgot.html'));
});

app.get('/resetPassword', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'resetPassword.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/viewDetailedList', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'viewDetailedList.html'));
});

// Search route
app.get('/api/search', (req, res) => {
    const { category, query } = req.query;
    const apiKey = apiKeys[category];
    const searchURLs = {
        movie: 'https://api.themoviedb.org/3/search/movie',
        tv: 'https://api.themoviedb.org/3/search/tv',
        books: 'https://www.googleapis.com/books/v1/volumes',
        games: 'http://www.gamespot.com/api/games/'
    };

    let params = {};

    if (category === 'movie' || category === 'tv') {
        params = {
            api_key: apiKey,
            query: query
        };
    } else if (category === 'books') {
        params = {
            q: query
        };
    } else if (category === 'games') {
        params = {
            api_key: apiKey,
            filter: `name:${query}`,
            format: 'json'
        };
    }

    // Construye la URL de búsqueda usando la categoría proporcionada en la solicitud
    const searchURL = searchURLs[category];
    //console.log('Search URL:', searchURL);
    //console.log('Params:', params);

    axios.get(searchURL, {
        params: params
    })
        .then(response => {
            let resultsWithImages = [];

            if (category === 'books') {
                // Para la categoría de libros, la estructura de respuesta es diferente
                resultsWithImages = response.data.items.map(item => {
                    //console.log(item)
                    const volumeInfo = item.volumeInfo;
                    return {
                        id: item.id,
                        label: volumeInfo.title,
                        image: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : null
                    };
                });
            } else if (category === 'games') {
                // Aquí se debe manejar la respuesta de búsqueda de juegos para incluir las imágenes correctamente
                resultsWithImages = response.data.results.map(result => {
                    //console.log('Result:', result.image); // Agrega un console.log para mostrar las imágenes de los juegos
                    return {
                        id: result.id,
                        label: result.name,
                        image: result.image ? result.image.original : null // Ajusta aquí según la estructura real de los datos de respuesta
                    };
                });
            } else {
                // Mapea los resultados para incluir la URL de la imagen
                resultsWithImages = response.data.results.map(result => {
                    //console.log('Result:', result.poster_path);     // Agrega un console.log para mostrar los resultados
                    return {
                        id: result.id,
                        label: result.title || result.name,
                        image: result.poster_path ? `https://image.tmdb.org/t/p/w500${result.poster_path}` : null
                    };
                });
            }

            // Envia la respuesta con los resultados modificados
            res.json({ results: resultsWithImages });
        })
        .catch(error => {
            console.error('Search Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
});



// Detalles de ruta
app.get('/api/details', (req, res) => {
    const { category, id } = req.query;
    const apiKey = apiKeys[category];

    const detailsURLs = {
        movie: `https://api.themoviedb.org/3/${category}/${id}`,
        tv: `https://api.themoviedb.org/3/${category}/${id}`,
        games: `https://www.gamespot.com/api/games/?format=json&filter=id:${id}`,
        books: `https://www.googleapis.com/books/v1/volumes?q=${id}`
    };

    let params = {};
    if (category === 'movie' || category === 'tv') {
        params = {
            api_key: apiKey
        };
    } else if (category === 'games') {
        params = {
            api_key: apiKey,
        };
    }
    axios.get(detailsURLs[category], {
        params: params
    })
        .then(response => {
            let responseData = response.data;
            if (category === 'books') {
                responseData = responseData.items[0]; // Aquí se selecciona el primer elemento del arreglo
            } if (category === 'games') {
                responseData = responseData.results[0];
            }

            let imageUrl = null;
            if (category === 'movie' || category === 'tv') {
                imageUrl = responseData.poster_path ? `https://image.tmdb.org/t/p/w500${responseData.poster_path}` : null;
            } else if (category === 'games') {
                // Verifica si la propiedad 'original' está presente en el objeto de imagen
                imageUrl = responseData.image && responseData.image.original ? responseData.image.original : null;
            } else if (category === 'books') {
                imageUrl = responseData.volumeInfo.imageLinks ? responseData.volumeInfo.imageLinks.thumbnail : null;
            }
            responseData.imageUrl = imageUrl;
            //console.log('Response Data:', responseData); // Agrega un console.log para mostrar la respuesta de los detalles
            res.json(responseData);
        })
        .catch(error => {
            //console.log('Error:', error); // Agrega un console.log para mostrar el error
            res.status(500).json({ error: error });
        });


    // Agrega un console.log para mostrar la URL completa de la consulta
    //console.log('Detalles URL:', detailsURLs[category]);
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Encriptar la contraseña antes de consultarla en la base de datos
    const hashedPassword = crypto.createHash('sha512').update(password).digest('hex');

    connection.query(
        'SELECT * FROM users WHERE user_mail = ? AND user_password = ?',
        [email, hashedPassword],
        (error, results) => {
            if (error) {
                res.status(500).json({ error: 'Internal server error' });
            } else {
                if (results.length > 0) {
                    res.json({ success: true, userData: results });
                } else {
                    res.json({ success: false });
                }
            }
        }
    );
});

app.post('/register', (req, res) => {
    const { email, user, password } = req.body;

    // Encriptar la contraseña antes de almacenarla en la base de datos
    const hashedPassword = crypto.createHash('sha512').update(password).digest('hex');

    connection.query(
        'SELECT * FROM users WHERE user_mail = ?',
        [email],
        (error, results) => {
            if (error) {
                res.status(500).json({ error: 'Internal server error' });
            } else {
                if (results.length > 0) {
                    res.json({ success: false, message: 'User already exists' });
                } else {
                    connection.query(
                        'INSERT INTO users (user_mail, user_name, user_password) VALUES (? , ? , ?)',
                        [email, user, hashedPassword], // Almacenar el hash de la contraseña
                        (error, results) => {
                            if (error) {
                                res.status(500).json({ error: 'Internal server error' });
                            } else {
                                res.json({ success: true });
                            }
                        }
                    );
                }
            }
        }
    );
});


app.post('/viewUserLists', (req, res) => {
    const userId = req.headers['user_id'];
    //console.log('User ID:', userId);
    connection.connect((err) => {
        if (err) {
            return;
        }
        connection.query('SELECT * FROM lists WHERE creator_id = ?', [userId], (err, results, fields) => {
            //console.log('Results:', results);
            if (err) {
                console.error('Error al ejecutar la consulta:', err);
                return;
            }
            res.json(results);
        });
    });
});

app.post('/viewCollaboratorLists', (req, res) => {
    const userId = req.headers['user_id'];
    connection.connect((err) => {
        if (err) {
            return;
        }
        connection.query(`
            SELECT lc.*, l.*
            FROM list_collaborators lc
            INNER JOIN lists l ON lc.list_id = l.list_id
            WHERE lc.user_id = ?
        `, [userId], (err, results, fields) => {
            if (err) {
                console.error('Error al ejecutar la consulta:', err);
                return;
            }
            res.json(results);
        });
    });
});


app.post('/addMediaToList', (req, res) => {
    const { list_id, category, item_id } = req.body;
    let lists = '';
    // Verificar si ya existe el item_id en la lista para la categoría dada
    connection.query(
        `SELECT list_name,${category} FROM lists WHERE list_id = ?`,
        [list_id],
        (error, results) => {
            if (error) {
                res.status(500).json({ error: 'Internal server error' });
            } else {
                // Si la consulta no devuelve resultados o la categoría es nula, significa que el item_id no existe
                if (results.length === 0 || results[0][category] === null || !results[0][category].includes(item_id)) {
                    // No existe el item_id en la lista, proceder con la actualización
                    if (results.length === 0 || results[0][category] === null) {
                        results.forEach(list => {
                            lists += list.list_name;
                        });
                        // No hay elementos en la categoría, insertar el nuevo elemento simplemente
                        connection.query(
                            `UPDATE lists SET ${category} = ? WHERE list_id = ?`,
                            [item_id, list_id],
                            (error, results) => {
                                if (error) {
                                    res.status(500).json({ error: 'Internal server error' });
                                } else {
                                    res.json({ success: true, lists });
                                }
                            }
                        );
                    } else {
                        // Hay elementos en la categoría, concatenar el nuevo elemento con comas
                        const existingItems = results[0][category];
                        const updatedItems = `${existingItems},${item_id}`;
                        results.forEach(list => {
                            lists += list.list_name;
                        });
                        connection.query(
                            `UPDATE lists SET ${category} = ? WHERE list_id = ?`,
                            [updatedItems, list_id],
                            (error, results) => {
                                if (error) {
                                    res.status(500).json({ error: 'Internal server error' });
                                } else {
                                    res.json({ success: true, lists });
                                }
                            }
                        );
                    }

                } else {
                    // El item_id ya existe en la lista, enviar una respuesta indicando que no se realizó ninguna acción
                    results.forEach(list => {
                        lists += list.list_name;
                    });
                    //console.log('List:', lists);
                    res.json({ success: false, lists });
                }
            }
        }
    );
});

app.post('/forgot', (req, res) => {
    const { email } = req.body;
    connection.query(
        'SELECT * FROM users WHERE user_mail = ?',
        [email],
        (error, results) => {
            if (error) {
                console.error('Error en SELECT:', error);
                return res.status(500).json({ error: 'Error en SELECT', details: error.message });
            }

            if (results.length > 0) {
                const token = uuid.v4();
                connection.query(
                    'INSERT INTO forgotPassword (user_mail, token, used) VALUES (?, ?, 0)',
                    [email, token],
                    (error, results) => {
                        if (error) {
                            console.error('Error en INSERT:', error);
                            return res.status(500).json({ error: 'Error en INSERT', details: error.message });
                        }

                        const mailOptions = {
                            from: `MediaMaster Team <${mailCredentials.user}>`,
                            to: email,
                            subject: 'Password Recovery',
                            html: `
                                <p>Dear User,</p>
                                <p>We received a request to reset your password for your MediaMaster account.</p>
                                <p>To proceed with the password reset, please click on the following link:</p>
                                <p><a href="https://mediamaster.pmaestrefernandez.com/resetPassword?token=${token}">Reset Password</a></p>
                                <p>If you did not request this password reset, please ignore this email.</p>
                                <p>Best regards,<br>MediaMaster Team</p>
                            `
                        };

                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                console.error('Error al enviar correo:', error);
                                return res.status(500).json({ error: 'Error enviando email', details: error.message });
                            }

                            res.json({ success: true });
                        });
                    }
                );
            } else {
                res.json({ success: false });
            }
        }
    );
});



app.post('/resetPassword', (req, res) => {
    const { token, password } = req.body;
    const hashedPassword = crypto.createHash('sha512').update(password).digest('hex');

    connection.query(
        'SELECT * FROM forgotPassword WHERE token = ? AND used = 0',
        [token],
        (error, results) => {
            //console.log('Results:', results);
            //console.log('Error:', error);
            if (error) {
                res.status(500).json({ error: 'Internal server error' });
            } else {
                if (results.length === 0) {
                    // No se encontró un token válido o no utilizado
                    res.status(400).json({ error: 'Invalid or expired token' });
                } else {
                    // Marcar el token como usado en la base de datos
                    connection.query(
                        'UPDATE forgotPassword SET used = 1 WHERE token = ?',
                        [token],
                        (error, updateResult) => {
                            if (error) {
                                res.status(500).json({ error: 'Internal server error' });
                            } else {
                                connection.query(
                                    'UPDATE users SET user_password = ? WHERE user_mail = ?',
                                    [hashedPassword, results[0].user_mail],
                                    (error, updateResult) => {
                                        if (error) {
                                            res.status(500).json({ error: 'Internal server error' });
                                        } else {
                                            res.json({ success: true, message: 'Password updated successfully' });
                                        }
                                    }
                                );
                            }
                        }
                    );
                }
            }
        }
    );
});

app.post('/createList', (req, res) => {
    const { listName, userId } = req.body;
    connection.query(
        'INSERT INTO lists (creator_id,list_name) VALUES (?, ?)',
        [userId, listName],
        (error, results) => {
            if (error) {
                console.error('Error:', error);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                //console.log('List Name:', listName);
                //console.log('User ID:', userId);
                res.json({ success: true });
            }
        }
    );
});

app.post('/viewDetailedList', (req, res) => {
    const { list_id } = req.body;
    const apiKeys = {
        movie: externalKeys.movie,
        tv: externalKeys.tv,
        games: externalKeys.games
    };
    connection.query(
        'SELECT * FROM lists WHERE list_id = ?',
        [list_id],
        (error, results) => {
            if (error) {
                res.status(500).json({ error: 'Internal server error' });
            } else {
                //console.log('Results:', results);
                lists = {
                    movie: [],
                    tv: [],
                    book: [],
                    games: []
                };
                lists.movie = results[0].movie_id?.split(',');
                lists.tv = results[0].serie_id?.split(',');
                lists.games = results[0].game_id?.split(',');
                lists.book = results[0].book_id?.split(',');
                //console.log('Lists:', lists);
                list_name = results[0].list_name
                res.json({ lists, list_name, owner: results[0].creator_id });
            }
        }
    );
});


app.post('/deleteList', (req, res) => {
    const { list_id } = req.body;
    //console.log('List ID:', list_id);
    connection.beginTransaction(function (err) {
        if (err) {
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        connection.query(
            'DELETE FROM list_collaborators WHERE list_id = ?',
            [list_id],
            (error, results) => {
                //console.log('Results:', results);
                if (error) {
                    connection.rollback(function () {
                        res.status(500).json({ error: 'Internal server error' });
                    });
                } else {
                    connection.query(
                        'DELETE FROM lists WHERE list_id = ?',
                        [list_id],
                        (error, results) => {
                            //console.log('Results:', results);
                            if (error) {
                                connection.rollback(function () {
                                    res.status(500).json({ error: 'Internal server error' });
                                });
                            } else {
                                connection.commit(function (err) {
                                    if (err) {
                                        connection.rollback(function () {
                                            res.status(500).json({ error: 'Internal server error' });
                                        });
                                    } else {
                                        res.json({ success: true });
                                    }
                                });
                            }
                        }
                    );
                }
            }
        );
    });
});


app.post('/deleteItem', (req, res) => {
    const { list_id, category, item_id } = req.body;
    connection.query(
        `SELECT ${category} FROM lists WHERE list_id = ?`,
        [list_id],
        (error, results) => {
            if (error) {
                res.status(500).json({ error: 'Internal server error' });
            } else {
                const items = results[0][category].split(',');
                const updatedItems = items.filter(id => id !== item_id).join(',');
                connection.query(
                    `UPDATE lists SET ${category} = ? WHERE list_id = ?`,
                    [updatedItems, list_id],
                    (error, results) => {
                        if (error) {
                            res.status(500).json({ error: 'Internal server error' });
                        } else {
                            res.json({ success: true });
                        }
                    }
                );
            }
        }
    );
});

app.post('/inviteUser', (req, res) => {
    const { list_id, user_mail } = req.body;

    connection.query(
        'SELECT * FROM users WHERE user_mail = ?',
        [user_mail],
        (error, results) => {
            //console.log('Results:', results);
            if (error) {
                res.status(500).json({ error: 'Internal server error' });
            } else {
                if (results.length > 0) {
                    connection.query(
                        'INSERT INTO list_collaborators (list_id, user_id,accept_invite) VALUES (?, ?,1)',
                        [list_id, results[0].user_id],
                        (error, results) => {
                            if (error) {
                                res.status(500).json({ error: 'Internal server error' });
                            } else {
                                res.json({ success: true });
                                const mailOptions = {
                                    from: `MediaMaster Team <${mailCredentials.user}>`,
                                    to: user_mail,
                                    subject: 'Invitation to Collaborate on a List',
                                    html: `
                                        <p>Dear Colleague,</p>
                                        <p>You have been invited to collaborate on a list in MediaMaster.</p>
                                        <p>This collaboration opportunity will allow you to contribute and work together efficiently.</p>
                                        <p>If you have any questions or need assistance, please feel free to contact us.</p>
                                        <p>Best regards,<br>MediaMaster Team</p>
                                    `
                                };
                                transporter.sendMail(mailOptions, (error, info) => {
                                    if (error) {
                                        res.status(500).json({ error: 'Internal server error' });
                                    } else {
                                        res.json({ success: true });
                                    }
                                });
                            }
                        }
                    );
                } else {
                    res.json({ success: false });
                }
            }
        }
    );
});
