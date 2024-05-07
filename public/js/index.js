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
        infoURL = "http://localhost:3000/api/details?category=" + category + "&id=" + (selectedInfo.id ? selectedInfo.id : selectedInfo);

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

});