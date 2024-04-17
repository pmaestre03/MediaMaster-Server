const userMail = localStorage.getItem('user_mail');
const userId = localStorage.getItem('user_id');
const userName = localStorage.getItem('user_name');

if (!userMail || !userId) {
  window.location.href = 'https://mediamaster.ieti.site/';
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
      $("#mylists").empty();
      data.forEach(function (list) {
        /*$("#mylists").append("<li><h3>" + list.list_name + "</h3>" + "<a href='https://mediamaster.ieti.site/viewDetailed?id=" + list.list_id + "'><ul></ul></a></li>");
        $("#mylists").append("<li>Movies: " + list.movie_id + "</li>");
        $("#mylists").append("<li>Series: " + list.serie_id + "</li>");
        $("#mylists").append("<li>Books: " + list.book_id + "</li>");
        $("#mylists").append("<li>Games: " + list.game_id + "</li>");
        $("#mylists").append("<li>========================================</li>");*/

        $("#mylists").append("<a href='https://mediamaster.ieti.site/viewDetailed?id=" + list.list_id + "'><ul id='" + list.list_id + "'><li><h3>" + list.list_name + "</h3></li></ul></a>");

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
        console.log(selectedPosters);

        if (isEmpty(ids)) {
          console.log("esta vacio"); // meter feedback al usuario de que la lista esta vacia
        } else {
          console.log("no esta vacio");
          getImages(selectedPosters);
        }

        

        $("#" + list.list_id).append("<li><img src=''></li>");

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
  $.each(object, function(category, ids) {
    console.log("Categoría:", category);

    $.each(ids, function(i, id) {
      console.log("Elemento", i + 1 + ":", id);
      searchItem(id, category);
    });
    
    console.log("----------------------");
  });
}

function searchItem(id, category) {
  var infoURL = '';

  if (category == 'movie' || category == 'tv') {
    infoURL = "https://mediamaster.ieti.site/api/details?category=" + category + "&id=" + id;
  } else if (category == 'books') {
    infoURL = "https://mediamaster.ieti.site/api/details?category=" + category + "&id=" + id;
  } else if (category == 'games') {
    infoURL = "https://mediamaster.ieti.site/api/details?category=" + category + "&id=" + id;
  }

  $.ajax({
    url: infoURL,
    dataType: "json",
    success: function (data) {
      var html = '';
      var largeImageUrl = data.imageUrl;

      if (category == 'movie' || category == 'tv') {
        if (data.id) {
          var genres = data.genres.map(function (genre) {
            return genre.name;
          }).join(', ');
          var companies = data.production_companies.map(function (company) {
            return company.name;
          }).join(', ');
          console.log(data);
          var releaseDate = category == 'movie' ? data.release_date : data.first_air_date;
          html = '<div class="details-container">' +
            '<h2>' + (category == 'movie' ? data.title : data.name) + '</h2>' +
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
      } else if (category == 'books') {
        var volumeInfo = data.volumeInfo;
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
          '<p><strong>Publisher:</strong> ' + (volumeInfo.publisher ? volumeInfo.publisher : 'Unknown') + '</p>';
      } else if (category == 'games') {
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
          '<p><strong>Franchises:</strong> ' + data.franchises.map(franchises => franchises.name).join(', ') + '</p>';
      }
      html +=
        /* '<select id="listas">' +
        '<option value="favourites">Favourites</option>' +
        '<option value="2">Pendientes</option>' +
        '</select> <button id="saveLists">Save</button>' +
        */
        '</div>' +
        '</div>' +
        '</div>';
      $("#details").html(html);
      $("#searchInfo").val('');
      var detailsContainer = document.querySelector('.details-container');
      var height = detailsContainer.offsetHeight;
      if (height > 650) {
        // Aplicar estilos cuando la altura de la ventana es mayor que 650px
        document.querySelector('footer').style.position = 'relative';
        document.querySelector('footer').style.width = 'auto';
      } else {
        // Aplicar estilos cuando la altura de la ventana es menor o igual a 650px
        document.querySelector('footer').style.position = 'absolute';
        document.querySelector('footer').style.width = '50%';
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log("Error en la solicitud:", jqXHR);
      console.log("Texto del estado:", textStatus);
      console.log("Error lanzado:", errorThrown);
    }
  });
}


$(function() {
  $("#welcome_messagge").text("Welcome, " + userName);
  

  getUsersList(userMail, userId);
});


