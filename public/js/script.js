// import { apiKeys } from './apiKeys2.js';
var user_mail = localStorage.getItem('user_mail');
var user_id = localStorage.getItem('user_id');
var user_name = localStorage.getItem('user_name');

$(document).ready(function () {

    if (window.location.pathname === '/search' || window.location.pathname === '/dashboard') {
        if (!user_mail) {
            window.location.href = 'http://localhost:3000/';
        }
    } else if (window.location.pathname === '/login' || window.location.pathname === '/register' || window.location.pathname === '/forgot' || window.location.pathname === '/resetPassword' || window.location.pathname === '/') {
        if (user_mail) {
            window.location.href = 'http://localhost:3000/dashboard';
        }
    }

    // Toastify
    function showNotification(text, color) {
        Toastify({
            text: text,
            duration: 3000,
            newWindow: true,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background: color,
            },
            onClick: function () { } // Callback after click
        }).showToast();
    }

    // Busqueda de información para Index y Search
    $("#search-container").on('input', '#searchInfo', function () {
        $("#searchInfo").autocomplete({
            source: function (request, response) {
                var category = $("input[name='category']:checked").val();
                var query = $("#searchInfo").val();
                //console.log(query);
                if (query.length >= 2) {
                    // Mostrar el indicador de carga
                    $("#contenedor-carga").css("display", "grid");
                    $.ajax({
                        url: 'http://localhost:3000/api/search?category=' + category + '&query=' + query,
                        dataType: "json",
                        success: function (data) {
                            // Ocultar el indicador de carga
                            $("#contenedor-carga").css("display", "none");
                            var results = data.results;
                            response(results);
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            // Ocultar el indicador de carga en caso de error
                            $("#contenedor-carga").css("display", "none");
                            console.log("Error en la solicitud:", jqXHR);
                            console.log("Texto del estado:", textStatus);
                            console.log("Error lanzado:", errorThrown);
                        }
                    });
                }
            },
            minLength: 2,
            select: function (event, ui) {
                searchItem(ui.item);
            }
        }).data("ui-autocomplete")._renderItem = function (ul, item) {
            var listItem = $("<li class='list'>");
            var listItemContent = '<div><img src="' + (item.image ? item.image : '') + '" alt="' + item.label + '" style="width: 60px; height: 80px; margin-right: 10px;">' + '<br>' + item.label + '</div>';
            return listItem.append(listItemContent).appendTo(ul);
        };

        $("#searchInfo").autocomplete("widget").addClass("custom-autocomplete");

        $("#searchInfo").keypress(function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                searchItem();
            }
        });
    });

    // Cambio de categoría al hacer clic en un botón de radio
    $("input[name='category']").change(function () {
        $("#searchInfo").val(''); // Limpiar el campo de búsqueda al cambiar de categoría
    });

    function searchItem(selectedItem, category) {
        console.log(selectedItem);
        var selectedInfo = selectedItem ? selectedItem : $("#searchInfo").val() ;
        $("#details").empty();
        var category = $("input[name='category']:checked").val() || category;
        var infoURL = '';
        infoURL = "http://localhost:3000/api/details?category=" + category + "&id=" + (selectedInfo.id || selectedInfo);

        $.ajax({
            url: infoURL,
            dataType: "json",
            success: function (data) {
                //console.log(data);
                var html = '';
                var largeImageUrl = data.imageUrl;

                if (category === 'movie' || category === 'tv') {
                    if (data.id) {
                        var genres = data.genres.map(function (genre) {
                            return genre.name;
                        }).join(', ');
                        var companies = data.production_companies.map(function (company) {
                            return company.name;
                        }).join(', ');
                        //console.log(data);
                        var releaseDate = category === 'movie' ? data.release_date : data.first_air_date;
                        html = '<div class="details-container">' +
                            '<h2>' + (category === 'movie' ? data.title : data.name) + '</h2>' +
                            '<div class="info">' +
                            '<img src="' + largeImageUrl + '" alt="' + data.name + ' Poster">' +
                            '<div class="description">' + data.overview + '</div>' +
                            '</div>' +
                            '<div class="additional-info">' +
                            '<p><strong>Genres:</strong> ' + genres + '</p>' +
                            '<p><strong>Release Date:</strong> ' + releaseDate + '</p>' +
                            '<p><strong>Companies:</strong> ' + companies + '</p>';
                    } else {
                        html = "<p>No se encontraron detalles para esta búsqueda</p>";
                    }
                } else if (category === 'books') {
                    var volumeInfo = data.volumeInfo;
                    largeImageUrl = volumeInfo.imageLinks.thumbnail;
                    //console.log(volumeInfo);
                    html = '<div class="details-container">' +
                        '<h2>' + volumeInfo.title + '</h2>' +
                        '<div class="info">' +
                        '<img src="' + largeImageUrl + '" alt="' + volumeInfo.title + ' Poster">' +
                        '<div class="description">' + volumeInfo.description + '</div>' +
                        '</div>' +
                        '<div class="additional-info">' +
                        '<p><strong>Authors:</strong> ' + (volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown') + '</p>' +
                        '<p><strong>Published Date:</strong> ' + volumeInfo.publishedDate + '</p>' +
                        '<p><strong>Publisher:</strong> ' + (volumeInfo.publisher ? volumeInfo.publisher : 'Unknown') + '</p>';
                } else if (category === 'games') {
                    //console.log(data)
                    html = '<div class="details-container">' +
                        '<h2>' + data.name + '</h2>' +
                        '<div class="info">' +
                        '<img src="' + largeImageUrl + '" alt="' + data.name + ' Poster">' +
                        '<div class="description">' + data.description + '</div>' +
                        '</div>' +
                        '<div class="additional-info">' +
                        '<p><strong>Release Date:</strong> ' + data.release_date + '</p>' +
                        '<p><strong>Genres:</strong> ' + data.genres.map(genre => genre.name).join(', ') + '</p>' +
                        '<p><strong>Franchises:</strong> ' + data.franchises.map(franchise => franchise.name).join(', ') + '</p>';
                }
                if (!user_mail) {
                    html +=
                        '</div>' +
                        '</div>' +
                        '</div>';
                    $("#details").html(html) ;
                    $("#searchInfo").val('');
                } if (window.location.pathname === '/search') {
                    html +=
                        '<button id="saveItem" value="' + selectedInfo.id + '">Add to list</button></div></div>';;
                    $("#details").append(html);
                    showListsAndAddToLists(selectedInfo.id, category);
                    $("#searchInfo").val('');
                }
                $("#detailedList").append(html);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error en la solicitud:", jqXHR);
                console.log("Texto del estado:", textStatus);
                console.log("Error lanzado:", errorThrown);
            }
        });
    }
    /**************************************************************************************************************/

    // Login
    function loginUser(email, password) {
        $.ajax({
            url: 'http://localhost:3000/login',
            method: 'POST',
            data: {
                email: email,
                password: password
            },
            success: function (data) {
                //console.log(data);
                if (data.success) {
                    localStorage.setItem('user_id', data.userData[0].user_id);
                    localStorage.setItem('user_mail', email);
                    localStorage.setItem('user_name', data.userData[0].user_name);
                    window.location.href = 'http://localhost:3000/dashboard';
                } else {
                    showNotification('User or Password incorrect', 'red');
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error en la solicitud:", jqXHR);
                console.log("Texto del estado:", textStatus);
                console.log("Error lanzado:", errorThrown);
            }
        });
    }

    $("#loginForm").on('submit', function (event) {
        event.preventDefault();
        var email = $("#email").val();
        var password = $("#password").val();
        loginUser(email, password);
    });

    /**************************************************************************************************************/

    // Register
    $("#registerForm").on('submit', function (event) {
        event.preventDefault();
        var email = $("#email").val();
        var user = $("#user").val();
        var password = $("#password").val();
        var password2 = $("#password2").val();
        if (password !== password2) {
            showNotification('Passwords do not match', 'red');
        } else {
            registerUser(email, user, password);
        }
    });

    function registerUser(email, user, password) {
        //console.log(email, user, password);
        $.ajax({
            url: 'http://localhost:3000/register',
            method: 'POST',
            data: {
                email: email,
                user: user,
                password: password
            },
            success: function (data) {
                //console.log(data);
                if (!data.success) {
                    showNotification('User already exists', 'red');
                } else {
                    showNotification('User created', 'green');
                    window.location.href = 'http://localhost:3000/login';
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error en la solicitud:", jqXHR);
                console.log("Texto del estado:", textStatus);
                console.log("Error lanzado:", errorThrown);
            }
        });
    }

    /**************************************************************************************************************/

    // Forgot Password
    $("#forgotForm").on('submit', function (event) {
        event.preventDefault();
        var email = $("#email").val();
        forgotPassword(email);
    });

    function forgotPassword(email) {
        //console.log(email);
        $.ajax({
            url: 'http://localhost:3000/forgot',
            method: 'POST',
            data: {
                email: email
            },
            success: function (data) {
                //console.log(data);
                if (!data.success) {
                    showNotification('User does not exist', 'red');
                } else {
                    showNotification('Recovery email sent successfully', 'green');
                }
                $("#email").val('');
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error en la solicitud:", jqXHR);
                console.log("Texto del estado:", textStatus);
                console.log("Error lanzado:", errorThrown);
            }
        });
    }

    /**************************************************************************************************************/

    // Reset Password
    $("#recoverPasswd").submit(function (e) {
        e.preventDefault();
        var password = $("#password").val();
        var repeatPassword = $("#repeatPassword").val();
        if (password != repeatPassword) {
            showNotification("Passwords do not match", 'orange');
            return;
        } else {
            var token = new URLSearchParams(window.location.search).get("token");
            $.ajax({
                type: "POST",
                url: "http://localhost:3000/resetPassword",
                data: { token: token, password: password },
                success: function (data) {
                    if (data.success) {
                        $("#recoverPasswd").hide();
                        showNotification(data.message, 'green');
                    } else {
                        showNotification(data.error, 'red');
                    }
                },
                error: function (xhr, status, error) {
                    showNotification("An error occurred while processing your request", 'red');
                }
            });
        }
    });

    /**************************************************************************************************************/

    // Search
    if (window.location.pathname === '/search') {
        $("#welcome").append('Welcome, ' + user_name + '!')
        $("#signOut").click(function () {
            localStorage.removeItem('user_mail');
            localStorage.removeItem('user_id');
            localStorage.removeItem('user_name');
            window.location.href = 'http://localhost:3000/';
        });

        function getUsersList(user_mail, user_id) {
            $.ajax({
                url: 'http://localhost:3000/viewUserLists',
                type: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    user_mail: user_mail,
                    user_id: user_id
                },
            })
                .done(function (data) {
                    listas = data;
                    $("#myLists").empty();
                    html = '<form action="" method="" id="addElementOnList">';
                    data.forEach(function (list) {
                        html += "<div id=allLists>"
                        $("#myLists").append('<p><a href="" value="' + list.list_id + '">' + list.list_name + '</p>');
                        html += '<label><input type="checkbox" name="list" value="' + list.list_id + '"> ' + list.list_name + '</label><br>';
                    });

                    html += '</div></form>';
                    $("#addToLists").append(html);
                });
        }

        function showListsAndAddToLists(item_id, category) {
            // Desvincular controladores de eventos previos
            $("#saveItem").off('click');
            $("#saveToList").off('click');
            $("#closeListsView").off('click');

            $("#saveItem").on('click', function (event) {
                //console.log(item_id);
                $("#addToLists").css('display', 'grid');


                $(".layout").css('filter', 'blur(5px)');
                $(".layout").addClass('disable-buttons');
            });

            $("#saveToList").on('click', function (event) {
                event.preventDefault();
                $("#success").html('Added on Lists:');
                $("#duplicated").html('Duplicated on Lists:');
                $("input[name='list']:checked").each(function () {
                    //console.log($(this).val());
                    if (category === 'books') {
                        category_id = 'book_id';
                    } else if (category === 'movie') {
                        category_id = 'movie_id';
                    } else if (category === 'tv') {
                        category_id = 'serie_id';
                    } else if (category === 'games') {
                        category_id = 'game_id';
                    }
                    saveItem($(this).val(), category_id, item_id);
                });
            });

            $("#closeListsView").on('click', function (event) {
                event.preventDefault();
                $(".layout").css('filter', 'blur(0)');
                $("#addToLists").css('display', 'none');
                $(".layout").removeClass('disable-buttons');
            });
        }

        function saveItem(list_id, category, item_id) {
            //console.log(list_id, category, item_id);
            $.ajax({
                url: 'http://localhost:3000/addMediaToList',
                type: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify({
                    list_id: list_id,
                    category: category,
                    item_id: item_id
                }),
                success: function (data) {
                    if (data.success) {
                        $("#success").append(' ' + data.lists).css('color', 'green');
                    } else {
                        $("#duplicated").append(' ' + data.lists).css('color', 'orange');
                    }
                    $("input[name='list']").prop('checked', false);
                    list_id = null;
                    item_id = null;
                    category = null;
                },
            })
        }
        getUsersList(user_mail, user_id);
    }

    // dashboard
    else if (window.location.pathname === '/dashboard') {
        $("#signOut").click(function () {
            localStorage.removeItem('user_mail');
            localStorage.removeItem('user_id');
            localStorage.removeItem('user_name');
            window.location.href = 'http://localhost:3000/';
        });
        function getUsersList(user_mail, user_id) {
            $.ajax({
                url: 'http://localhost:3000/viewUserLists',
                type: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    user_mail: user_mail,
                    user_id: user_id
                },
            })
                .done(function (data) {
                    $("#mylists").empty();
                    data.forEach(function (list) {
                        /*$("#mylists").append("<li><h3>" + list.list_name + "</h3>" + "<a href='http://localhost:3000/viewDetailedList?id=" + list.list_id + "'><ul></ul></a></li>");
                        $("#mylists").append("<li>Movies: " + list.movie_id + "</li>");
                        $("#mylists").append("<li>Series: " + list.serie_id + "</li>");
                        $("#mylists").append("<li>Books: " + list.book_id + "</li>");
                        $("#mylists").append("<li>Games: " + list.game_id + "</li>");
                        $("#mylists").append("<li>========================================</li>");*/

                        let listContainer = "<div class='see-details'><h3>" + list.list_name + "</h3><ul class='list' id='" + list.list_id + "'></ul></div><p class='overlay-text'>See More</p>";

                        let movieArray = list.movie_id ? list.movie_id.split(",") : [];
                        let seriesArray = list.serie_id ? list.serie_id.split(",") : [];
                        let booksArray = list.book_id ? list.book_id.split(",") : [];
                        let gamesArray = list.game_id ? list.game_id.split(",") : [];

                        var ids = {
                            movie: [],
                            tv: [],
                            books: [],
                            games: []
                        }

                        movieArray.forEach(id => {
                            ids.movie.push(parseInt(id));
                        });

                        seriesArray.forEach(id => {
                            ids.tv.push(parseInt(id));
                        });

                        booksArray.forEach(id => {
                            ids.books.push(parseInt(id));
                        });

                        gamesArray.forEach(id => {
                            ids.games.push(parseInt(id));
                        });

                        var selectedPosters = selectRandomElements(ids, 5);
                        //console.log(selectedPosters);

                        if (isEmpty(ids)) { // meter feedback al usuario de que la lista esta vacia
                            listContainer = "<h3>" + list.list_name + "</h3><h4 class='empty-feedback'>This list is empty!</h4><a class='get-started-button' href='http://localhost:3000/search'>Get Started</a>";
                            //console.log("esta vacio");
                            $("#mylists").append(listContainer);
                        } else {
                            $("#mylists").append(listContainer);
                            //console.log("no esta vacio");

                            getImages(selectedPosters).then(function (imagesUrls) {
                                //console.log(imagesUrls);
                                displayPosters(imagesUrls, list.list_id);
                            }).catch(function (error) {
                                console.error("Error al obtener las imágenes:", error);
                            });
                        }
                    });
                });
        }

        function selectRandomElements(object, min) {
            var selectedElements = {};
            var totalElements = 0;

            // Verificar si el número mínimo especificado es mayor que cero
            if (min <= 0) return selectedElements;

            for (var lista in object) {
                // Verificar si la lista no está vacía y si aún necesitamos más elementos
                if (object[lista].length > 0 && totalElements < min) {
                    // Calcular cuántos elementos podemos seleccionar de esta lista
                    var remainingElements = min - totalElements;
                    var elementsToSelect = Math.min(remainingElements, object[lista].length);

                    // Crear una copia de la lista para evitar modificar la original
                    var copyOfList = object[lista].slice();

                    // Seleccionar aleatoriamente elementos de la lista hasta alcanzar el límite
                    for (var i = 0; i < elementsToSelect; i++) {
                        var randomIndex = Math.floor(Math.random() * copyOfList.length);
                        var selectedElement = copyOfList.splice(randomIndex, 1)[0];

                        // Añadir el elemento seleccionado al objeto resultante
                        if (!selectedElements[lista]) {
                            selectedElements[lista] = [];
                        }
                        selectedElements[lista].push(selectedElement);
                        totalElements++;
                    }
                }

                // Si ya hemos seleccionado suficientes elementos, salir del bucle
                if (totalElements >= min) {
                    break;
                }
            }

            return selectedElements;
        }

        function isEmpty(object) {
            for (var propiedad in object) {
                if (object.hasOwnProperty(propiedad) && $.isArray(object[propiedad]) && object[propiedad].length > 0) {
                    return false; // Si encuentra al menos una lista no vacía, devuelve false
                }
            }
            return true; // Si todas las listas están vacías o no existen, devuelve true
        }

        function getImages(object) {
            var imagesArray = [];
            var promises = [];

            $.each(object, function (category, ids) {
                //console.log("Categoría:", category);

                $.each(ids, function (i, id) {
                    //console.log("Elemento", i + 1 + ":", id);

                    // Llamada a la función que devuelve una promesa
                    var promise = searchItem(id, category);
                    promises.push(promise);

                });

                //console.log("----------------------");
            });

            // Esperar a que todas las promesas se resuelvan
            return Promise.all(promises).then(function (results) {
                // Agregar resultados válidos al array de imágenes
                results.forEach(function (result) {
                    if (result) {
                        imagesArray.push(result);
                    }
                });
                return imagesArray;
            });
        }

        function searchItem(id, category) {
            var infoURL = '';

            if (category == 'movie' || category == 'tv') {
                infoURL = "http://localhost:3000/api/details?category=" + category + "&id=" + id;
            } else if (category == 'books') {
                infoURL = "http://localhost:3000/api/details?category=" + category + "&id=" + id;
            } else if (category == 'games') {
                infoURL = "http://localhost:3000/api/details?category=" + category + "&id=" + id;
            }

            // Devolver una promesa
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: infoURL,
                    dataType: "json",
                    success: function (data) {
                        var largeImageUrl = data.imageUrl;

                        if (category == 'books') {
                            var volumeInfo = data.volumeInfo;
                            largeImageUrl = volumeInfo.imageLinks.thumbnail;
                        }

                        resolve(largeImageUrl);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log("Error en la solicitud:", jqXHR);
                        console.log("Texto del estado:", textStatus);
                        console.log("Error lanzado:", errorThrown);
                        resolve(null); // Resolver con nulo en caso de error
                    }
                });
            });
        }


        function displayPosters(imagesArray, ulId) {
            imagesArray.forEach(url => {
                $("#" + ulId).append("<li><img class='poster' src='" + url + "'></li>");
                //console.log(url);
            });
        }

        $("#createList").on('click', function (event) {
            event.preventDefault();
            $("#createListDiv").css('display', 'grid');
            $(".layout").css('filter', 'blur(5px)');
            $(".layout").addClass('disable-buttons');
        });

        $("#closeListsView").on('click', function (event) {
            event.preventDefault();
            $("#createListDiv").css('display', 'none');
            $(".layout").css('filter', 'blur(0)');
            $(".layout").removeClass('disable-buttons');
        });

        $("#createListInput").on('click', function (event) {
            event.preventDefault();
            var listName = $("#listName").val();
            createList(user_id, listName);
        })

        function createList(userId, listName) {
            $.ajax({
                url: 'http://localhost:3000/createList',
                type: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: JSON.stringify({
                    userId: userId,
                    listName: listName
                }),
                success: function (data) {
                    //console.log(data);
                    if (data.success) {
                        getUsersList(user_mail, userId);
                    }
                },
                error: function (error, status, xhr) {
                    console.error(error);
                }
            });
        }

        $('#mylists').on('click', '.see-details', function (event) {
            console.log("click");
            var list_id = $(this).find('ul').attr('id');
            localStorage.setItem('list_id', list_id);
            console.log(list_id);
            window.location.href = 'http://localhost:3000/viewDetailedList';
        });

        // execute dashboard things here
        $("#welcome_messagge").text("Welcome, " + user_name);

        getUsersList(user_mail, user_id);
    }

    // viewDetailedList
    else if (window.location.pathname === '/viewDetailedList') {

        $("#signOut").click(function () {
            localStorage.removeItem('user_mail');
            localStorage.removeItem('user_id');
            localStorage.removeItem('user_name');
            window.location.href = 'http://localhost:3000/';
        });

        var list_id = localStorage.getItem('list_id');

        async function obtenerInfo(ids, category) {
            let baseUrl;
            let apiKey;
            if (category === 'movie') {
                apiKey = '48170e08d31ae025a5278d4a18dd2e4d';
                baseUrl = 'https://api.themoviedb.org/3/movie/'; // URL base para la API de películas
            }
            else if (category === 'tv') {
                apiKey = '48170e08d31ae025a5278d4a18dd2e4d';
                baseUrl = 'https://api.themoviedb.org/3/tv/'; // URL base para la API de series
            }
            else if (category === 'games') {
                apiKey = 'edb74483e47826757e454d9131b7945ac39b71a4';
                baseUrl = 'https://www.gamespot.com/api/games/?format=json&filter=id:'; // URL base para la API de juegos
            }
            else if (category === 'books') {
                baseUrl = 'https://www.googleapis.com/books/v1/volumes?q='; // URL base para la API de libros
            }

            // Función para hacer la solicitud a la API por ID de película
            async function getInfo(id) {
                let url;
                if (category === 'movie' || category === 'tv') {
                    url = `${baseUrl}${id}?api_key=${apiKey}`;
                } else if (category === 'books') {
                    url = `${baseUrl}${id}`;
                } else if (category === 'games') {
                    url = `${baseUrl}${id}&api_key=${apiKey}`;
                }
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        return await response.json();
                    } else {
                        console.error(`No se pudo obtener información para la película con ID: ${id}`);
                        return null;
                    }
                } catch (error) {
                    console.error('Error al obtener información de la película:', error);
                    return null;
                }
            }

            // Realizar todas las solicitudes de manera asíncrona
            const promesas = ids.map(getInfo);
            return Promise.all(promesas);
        }
        
        $.ajax({
            url: 'http://localhost:3000/viewDetailedList',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ list_id: list_id }),
        })
            .done(function (data) {
                for (const category in data) {
                    if (data.hasOwnProperty(category) && data[category].length > 0) {
                        const items = data[category];
                        for (const item in items) {
                            console.log(category, items[item]);
                            searchItem(items[item], category);
                        }
                    }
                }
            });
    }
});


