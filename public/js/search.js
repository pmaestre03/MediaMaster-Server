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
                        url: url + '/api/search?category=' + category + '&query=' + query,
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
                //console.log(ui.item.id);
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
        var selectedInfo = selectedItem ? selectedItem : $("#searchInfo").val();
        $("#details").empty();
        var category = $("input[name='category']:checked").val() || category;
        var infoURL = '';
        infoURL = url + "/api/details?category=" + category + "&id=" + (selectedInfo.id ? selectedInfo.id : selectedInfo);

        $.ajax({
            url: infoURL,
            dataType: "json",
            success: function (data) {
                console.log(data)
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
                        html = '<div class="details-container" id="' + (selectedInfo.id ? selectedInfo.id : selectedInfo) + '">' +
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
                    html = '<div class="details-container" id="' + (selectedInfo.id ? selectedInfo.id : selectedInfo) + '">' +
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
                    html = '<div class="details-container" id="' + (selectedInfo.id ? selectedInfo.id : selectedInfo) + '">' +
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
                    $("#details").html(html);
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

    $("#welcome").append('Welcome, ' + user_name + '!')
    $("#signOut, .signOut").click(function () {
        localStorage.removeItem('user_mail');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_name');
        window.location.href = url;
    });

    function getUsersList(user_mail, user_id) {
        $.ajax({
            url: url + '/viewUserLists',
            type: 'POST',
            headers: {
                'Content-Type': 'application/json',
                user_mail: user_mail,
                user_id: user_id
            },
        })
            .done(function (data) {
                listas = data;
                html = "";
                data.forEach(function (list) {
                    $("#myLists").append('<p><a value="' + list.list_id + '" id="' + list.list_id + '">' + list.list_name + '</p>');
                    html += '<label><input type="checkbox" name="list" value="' + list.list_id + '" id="' + list.list_id + '"> ' + list.list_name + '</label><br>';
                });
                $("#addElementOnList").append(html);
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
                listas = data;
                html = "";
                data.forEach(function (list) {
                    $("#sharedLists").append('<p><a value="' + list.list_id + '" id="' + list.list_id + '">' + list.list_name + '</p>');
                    html += '<label><input type="checkbox" name="list" value="' + list.list_id + '" id="' + list.list_id + '"> ' + list.list_name + '</label><br>';
                });
                $("#addElementOnList").append(html);
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
            url: url + '/addMediaToList',
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
                    showNotification('Item added successfully on '+data.lists, 'green');
                } else {
                    showNotification('Item already exists on '+data.lists, 'orange');
                }
                $("input[name='list']").prop('checked', false);
                list_id = null;
                item_id = null;
                category = null;
            },
        })
    }

    $("#myLists, #sharedLists").on('click', 'a', function (event) {
        event.preventDefault();
        var list_id = $(this).attr('value');
        localStorage.setItem('list_id', list_id);
        window.location.href = url + '/viewDetailedList';
    });

    getUsersList(user_mail, user_id);
    getUsersCollaborationList(user_id);

});