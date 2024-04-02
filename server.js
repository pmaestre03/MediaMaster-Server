const express = require('express');
const axios = require('axios');
const cors = require('cors');
const externalKeys = require('./apiKeys.js');

const app = express();
const port = 3000;
const host = '0.0.0.0'; // Esto escuchará en todas las interfaces de red

// Usa cors en todos los directorios 
app.use(cors());

// Configura express para servir archivos estáticos desde el directorio "public"
app.use(express.static('public'));

// API key configuration
const apiKeys = {
         movie: externalKeys.movie,
         tv: externalKeys.tv,
         games: externalKeys.games
};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
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
                  games: `http://www.gamespot.com/api/games/`,
         };

         let params = {};

         if (category === 'movie' || category === 'tv') {
                  params = {
                           api_key: apiKey
                  };
         } else if (category === 'games') {
                  params = {
                           api_key: apiKey,
                           filter: `id:${id}`,
                           format: 'json',
                  };
         } else if (category === 'books') {
                  // Aquí, para libros, simplemente enviamos el ID del libro a la respuesta
                  res.json({ id: id });
                  return; // Salir de la función para evitar que continúe ejecutando el código siguiente
         }

         axios.get(detailsURLs[category], {
                  params: params
         })
                  .then(response => {
                           let responseData = response.data;
                           if (category === 'games') {
                                    responseData = responseData.results[0]; // Ajuste aquí
                           }

                           // Incluye la URL de la imagen grande en la respuesta JSON
                           let imageUrl = null;
                           if (category === 'movie' || category === 'tv') {
                                    imageUrl = responseData.poster_path ? `https://image.tmdb.org/t/p/w500${responseData.poster_path}` : null;
                           } else if (category === 'games') {
                                    // Verifica si la propiedad 'original' está presente en el objeto de imagen
                                    imageUrl = responseData.image && responseData.image.original ? responseData.image.original : null;
                           }
                           responseData.imageUrl = imageUrl;

                           res.json(responseData);
                  })
                  .catch(error => {
                           res.status(500).json({ error: 'Internal server error' });
                  });

         // Agrega un console.log para mostrar la URL completa de la consulta
         //console.log('Detalles URL:', detailsURLs[category]);
});

app.listen(port, host, () => {
         console.log(`Server is running on http://${host}:${port}`);
});
