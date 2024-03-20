/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova is now initialized. Have fun!
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);

    $(document).ready(function () {
        $("#search-container").on('input', '#searchInfo', function () {
            $("#searchInfo").autocomplete({
                source: function (request, response) {
                    var category = $("input[name='category']:checked").val();
                    var query = $("#searchInfo").val();
                    if (query.length >= 2) {
                        $.ajax({
                            url: 'http://localhost:8000/api/search?category=' + category + '&query=' + query,
                            dataType: "json",
                            success: function (data) {
                                var results = data.results;
                                response(results);
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
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

        function searchItem(selectedItem) {
            var selectedInfo = selectedItem ? selectedItem : $("#searchInfo").val();
            $("#details").empty();
            var category = $("input[name='category']:checked").val();
            var infoURL = '';
            if (category === 'movie' || category === 'tv') {
                infoURL = "http://localhost:8000/api/details?category=" + category + "&id=" + selectedInfo.id;
            } else if (category === 'books') {
                infoURL = "https://www.googleapis.com/books/v1/volumes?q=" + selectedInfo.id;
            } else if (category === 'games') {
                infoURL = "http://localhost:8000/api/details?category=" + category + "&id=" + selectedInfo.id;
            }

            $.ajax({
                url: infoURL,
                dataType: "json",
                success: function (data) {
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
                            console.log(data);
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
                                '<p><strong>Companies:</strong> ' + companies + '</p>' +
                                '</div>' +
                                '</div>';
                        } else {
                            html = "<p>No se encontraron detalles para esta búsqueda</p>";
                        }
                    } else if (category === 'books') {
                        var volumeInfo = data.items[0].volumeInfo;
                        largeImageUrl = volumeInfo.imageLinks.thumbnail;
                        console.log(volumeInfo);
                        html = '<div class="details-container">' +
                            '<h2>' + volumeInfo.title + '</h2>' +
                            '<div class="info">' +
                            '<img src="' + largeImageUrl + '" alt="' + volumeInfo.title + ' Poster">' +
                            '<div class="description">' + volumeInfo.description + '</div>' +
                            '</div>' +
                            '<div class="additional-info">' +
                            '<p><strong>Authors:</strong> ' + (volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown') + '</p>' +
                            '<p><strong>Published Date:</strong> ' + volumeInfo.publishedDate + '</p>' +
                            '<p><strong>Publisher:</strong> ' + (volumeInfo.publisher ? volumeInfo.publisher : 'Unknown') + '</p>' +
                            '</div>' +
                            '</div>';
                    } else if (category === 'games') {
                        console.log(data)
                        html = '<div class="details-container">' +
                            '<h2>' + data.name + '</h2>' +
                            '<div class="info">' +
                            '<img src="' + largeImageUrl + '" alt="' + data.name + ' Poster">' +
                            '<div class="description">' + data.description + '</div>' +
                            '</div>' +
                            '<div class="additional-info">' +
                            '<p><strong>Release Date:</strong> ' + data.release_date + '</p>' +
                            '<p><strong>Genres:</strong> ' + data.genres.map(genre => genre.name).join(', ') + '</p>' +
                            '<p><strong>Franchises:</strong> ' + data.franchises.map(franchises => franchises.name).join(', ') + '</p>' +
                            '</div>' +
                            '</div>';
                    }

                    $("#details").html(html);
                    $("#searchInfo").val('');
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log("Error en la solicitud:", jqXHR);
                    console.log("Texto del estado:", textStatus);
                    console.log("Error lanzado:", errorThrown);
                }
            });
        }
    });
}
