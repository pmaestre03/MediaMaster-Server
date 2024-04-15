var user_mail = localStorage.getItem('user_mail');
var user_id = localStorage.getItem('user_id');
var user_name = localStorage.getItem('user_name');
if (!user_mail && !user_id) {
         window.location.href = 'https://mediamaster.ieti.site/login';
}
$(document).ready(function () {
         $("#welcome").append('Welcome, ' + user_name + '!')
         $("#signOut").click(function () {
                  localStorage.removeItem('user_mail');
                  localStorage.removeItem('user_id');
                  window.location.href = 'https://mediamaster.ieti.site/login';
         });

         $("#search-container").on('input', '#searchInfo', function () {
                  $("#searchInfo").autocomplete({
                           source: function (request, response) {
                                    var category = $("input[name='category']:checked").val();
                                    var query = $("#searchInfo").val();
                                    console.log(query);
                                    if (query.length >= 2) {
                                             // Mostrar el indicador de carga
                                             $("#loadingIndicator").show();
                                             $.ajax({
                                                      url: 'https://mediamaster.ieti.site/api/search?category=' + category + '&query=' + query,
                                                      dataType: "json",
                                                      success: function (data) {
                                                               // Ocultar el indicador de carga
                                                               $("#loadingIndicator").hide();
                                                               var results = data.results;
                                                               response(results);
                                                      },
                                                      error: function (jqXHR, textStatus, errorThrown) {
                                                               // Ocultar el indicador de carga en caso de error
                                                               $("#loadingIndicator").hide();
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
                  $("#addToLists").css('display', 'none');
                  var selectedInfo = selectedItem ? selectedItem : $("#searchInfo").val();
                  $("#details").empty();
                  var category = $("input[name='category']:checked").val();
                  var infoURL = '';
                  if (category === 'movie' || category === 'tv') {
                           infoURL = "https://mediamaster.ieti.site/api/details?category=" + category + "&id=" + selectedInfo.id;
                  } else if (category === 'books') {
                           infoURL = "https://mediamaster.ieti.site/api/details?category=" + category + "&id=" + selectedInfo.id;
                  } else if (category === 'games') {
                           infoURL = "https://mediamaster.ieti.site/api/details?category=" + category + "&id=" + selectedInfo.id;
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
                                                               '<div id="additional-info" class="additional-info">' +
                                                               '<p><strong>Genres:</strong> ' + genres + '</p>' +
                                                               '<p><strong>Release Date:</strong> ' + releaseDate + '</p>' +
                                                               '<p><strong>Companies:</strong> ' + companies + '</p>';
                                             } else {
                                                      html = "<p>No se encontraron detalles para esta búsqueda</p>";
                                             }
                                    } else if (category === 'books') {
                                             var volumeInfo = data.volumeInfo;
                                             largeImageUrl = volumeInfo.imageLinks.thumbnail;
                                             console.log(volumeInfo);
                                             html = '<div class="details-container">' +
                                                      '<h2>' + volumeInfo.title + '</h2>' +
                                                      '<div class="info">' +
                                                      '<img src="' + largeImageUrl + '" alt="' + volumeInfo.title + ' Poster">' +
                                                      '<div class="description">' + volumeInfo.description + '</div>' +
                                                      '</div>' +
                                                      '<div id="additional-info"  class="additional-info">' +
                                                      '<p><strong>Authors:</strong> ' + (volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown') + '</p>' +
                                                      '<p><strong>Published Date:</strong> ' + volumeInfo.publishedDate + '</p>' +
                                                      '<p><strong>Publisher:</strong> ' + (volumeInfo.publisher ? volumeInfo.publisher : 'Unknown') + '</p>';
                                    } else if (category === 'games') {
                                             console.log(data)
                                             html = '<div class="details-container">' +
                                                      '<h2>' + data.name + '</h2>' +
                                                      '<div class="info">' +
                                                      '<img src="' + largeImageUrl + '" alt="' + data.name + ' Poster">' +
                                                      '<div class="description">' + data.description + '</div>' +
                                                      '</div>' +
                                                      '<div id="additional-info"  class="additional-info">' +
                                                      '<p><strong>Release Date:</strong> ' + data.release_date + '</p>' +
                                                      '<p><strong>Genres:</strong> ' + data.genres.map(genre => genre.name).join(', ') + '</p>' +
                                                      '<p><strong>Franchises:</strong> ' + data.franchises.map(franchises => franchises.name).join(', ') + '</p>';
                                    }
                                    console.log(category);
                                    html += '<button id="saveItem" value="' + selectedInfo.id + '">Add to list</button></div></div>';
                                    $("#details").append(html);
                                    showListsAndAddToLists(selectedInfo.id, category);
                                    closeLists();

                                    /*
                                              '<select id="listas">' +
                                             '<option value="favourites">Favourites</option>' +
                                             '<option value="2">Pendientes</option>' +
                                             '</select> <button id="saveLists">Save</button>' +
                                             */

                                    $("#searchInfo").val('');
                           },
                           error: function (jqXHR, textStatus, errorThrown) {
                                    console.log("Error en la solicitud:", jqXHR);
                                    console.log("Texto del estado:", textStatus);
                                    console.log("Error lanzado:", errorThrown);
                           }
                  });
         }

         function getUsersList(user_mail, user_id) {
                  $.ajax({
                           url: 'https://mediamaster.ieti.site/viewUserLists',
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

                                    html += '</div><input type="submit" value="saveElement" id="saveToList"><input type="submit" value="close" id="closeListsView"></form>';
                                    $("#addToLists").append(html);
                           });
         }

         function showListsAndAddToLists(item_id, category) {
                  // Desvincular controladores de eventos previos
                  $("#saveItem").off('click');
                  $("#saveToList").off('click');
                  $("#closeListsView").off('click');

                  $("#saveItem").on('click', function (event) {
                           console.log(item_id);
                           $("#addToLists").css('display', 'block');
                           $("main").css('filter', 'blur(5px)');
                           $("main").addClass('disable-buttons');
                  });

                  $("#saveToList").on('click', function (event) {
                           event.preventDefault();
                           $("input[name='list']:checked").each(function () {
                                    console.log($(this).val());
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
                           $("main").css('filter', 'blur(0)');
                           $("#addToLists").css('display', 'none');
                           $("main").removeClass('disable-buttons');
                  });
         }

         function closeLists() {
                  $("#closeListsView").on('click', function (event) {
                           event.preventDefault();
                           $("main").css('filter', 'blur(0)');
                           $("#addToLists").css('display', 'none');
                           $("main").removeClass('disable-buttons');
                  });
         }

         function saveItem(list_id, category, item_id) {
                  console.log(list_id, category, item_id);
                  $.ajax({
                           url: 'https://mediamaster.ieti.site/addMediaToList',
                           type: 'POST',
                           headers: {
                                    'Content-Type': 'application/json'
                           },
                           data: JSON.stringify({
                                    list_id: list_id,
                                    category: category,
                                    item_id: item_id
                           })
                  })
                           .done(function (data) {
                                    console.log(data);
                                    // Cerrar la ventana de listas y desactivar los checkboxes
                                    closeLists();
                                    $("input[name='list']").prop('checked', false);
                                    // Limpiar las variables
                                    list_id = null;
                                    item_id = null;
                                    category = null;
                                    closeLists();
                           });
         }


         getUsersList(user_mail, user_id);
});
