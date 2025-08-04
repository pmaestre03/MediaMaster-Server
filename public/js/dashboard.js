var user_mail = localStorage.getItem('user_mail');
var user_id = localStorage.getItem('user_id');
var user_name = localStorage.getItem('user_name');
const url = "https://mediamaster.pmaestrefernandez.com"; // URL base de la aplicación

$(document).ready(function () {

    if (window.location.pathname === '/search' || window.location.pathname === '/dashboard') {
        if (!user_mail) {
            window.location.href = url;
        }
    } else if (window.location.pathname === '/login' || window.location.pathname === '/register' || window.location.pathname === '/forgot' || window.location.pathname === '/resetPassword' || window.location.pathname === '/') {
        if (user_mail) {
            window.location.href = url + '/dashboard';
        }
    }

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

    $("#signOut, .signOut").click(function () {
        localStorage.removeItem('user_mail');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_name');
        window.location.href = url;
    });


    function getUsersList(user_id) {
        $.ajax({
            url: url + '/viewUserLists',
            type: 'POST',
            headers: {
                'Content-Type': 'application/json',
                user_id: user_id
            },
        })
            .done(function (data) {
                $("#mylists").empty();
                data.forEach(function (list) {
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
                        listContainer = "<h3>" + list.list_name + "</h3><h4 class='empty-feedback'>This list is empty!</h4><a class='get-started-button' href='" + url + "/search'>Get Started</a>";
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
                // mirar si el usuario no tiene listas
                if ($("#mylists").is(':empty')) {
                    console.log("entramos en esta vacio el div")
                    $("#mylists").append("<h3 class='no-list-message'>You do not have any lists!</h3><button id='start-creating' class='get-started-button'>Get Started</button>");

                    $("#start-creating").click(function () {
                        $("#createList").click();
                    })
                }
            });
    }

    function getUsersCollaborationList(user_id) {
        $.ajax({
            url: 'https://mediamaster.pmaestrefernandez.com/viewCollaboratorLists',
            type: 'POST',
            headers: {
                'Content-Type': 'application/json',
                user_id: user_id
            },
        })
            .done(function (data) {
                console.log(data);
                $("#mySharedLists").empty();
                data.forEach(function (list) {
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
                        listContainer = "<h3>" + list.list_name + "</h3><h4 class='empty-feedback'>This list is empty!</h4><a class='get-started-button' href='https://mediamaster.pmaestrefernandez.com/search'>Get Started</a>";
                        //console.log("esta vacio");
                        $("#mySharedLists").append(listContainer);
                    } else {
                        $("#mySharedLists").append(listContainer);
                        //console.log("no esta vacio");

                        getImages(selectedPosters).then(function (imagesUrls) {
                            //console.log(imagesUrls);
                            displayPosters(imagesUrls, list.list_id);
                        }).catch(function (error) {
                            console.error("Error al obtener las imágenes:", error);
                        });
                    }
                });
                // mirar si el usuario no tiene listas
                if ($("#mySharedLists").is(':empty')) {
                    $("#mySharedLists").append("<h3 class='no-list-message'>You do not have any shared lists!</h3>");
                }
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
            infoURL = url + "/api/details?category=" + category + "&id=" + id;
        } else if (category == 'books') {
            infoURL = url + "/api/details?category=" + category + "&id=" + id;
        } else if (category == 'games') {
            infoURL = url + "/api/details?category=" + category + "&id=" + id;
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
            console.log(url);
        });
    }

    $(".createList, .createList").on('click', function (event) {
        event.preventDefault();
        $("#createListDiv").css('display', 'grid');
        $(".layout").css('filter', 'blur(5px)');
        $(".layout").addClass('disable-buttons');
    });


    $("#closeListsView").on('click', function (event) {
        event.preventDefault();
        $("#createListDiv").css('display', 'none');
        $(".layout").css('filter', 'blur(0)');
        $("#listName").val('');
        $(".layout").removeClass('disable-buttons');
    });

    $("#createListInput").on('click', function (event) {
        event.preventDefault();
        var listName = $("#listName").val();
        if (listName === "") {
            showNotification('Please enter a name', 'orange');
            return;
        }
        createList(user_id, listName);
    })

    function createList(userId, listName) {
        $.ajax({
            url: url + '/createList',
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
                    $(".layout").css('filter', 'blur(0)');
                    $("#createListDiv").css('display', 'none');
                    $("#listName").val('');
                    $(".layout").removeClass('disable-buttons');
                    getUsersList(user_id);
                    showNotification('List created successfully', 'green');
                }
            },
            error: function (error, status, xhr) {
                console.error(error);
            }
        });
    }

    $('#mylists, #mySharedLists').on('click', '.see-details', function (event) {
        console.log("click");
        var list_id = $(this).find('ul').attr('id');
        localStorage.setItem('list_id', list_id);
        console.log(list_id);
        window.location.href = url + '/viewDetailedList';
    });

    // execute dashboard things here
    $("#welcome_messagge").text("Welcome, " + user_name);

    getUsersList(user_id);
    getUsersCollaborationList(user_id);
    $("#mobileMenuBtn").click(function () {
        $(".navigation ul").slideToggle();
    });

});