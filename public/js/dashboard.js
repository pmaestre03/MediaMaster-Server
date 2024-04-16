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
          movies: [],
          series: [],
          books: [],
          games: []
        }

        movieArray.forEach(id => {
          ids.movies.push(parseInt(id));
        });

        seriesArray.forEach(id => {
          ids.series.push(parseInt(id));
        });

        booksArray.forEach(id => {
          ids.books.push(parseInt(id));
        });

        gamesArray.forEach(id => {
          ids.games.push(parseInt(id));
        });

        var selectedPosters = selectRandomElements(ids, 5);
        console.log(selectedPosters);

        

        $("#" + list.list_id).append("<li><img src=''></li>");

      });
    });
}

function selectRandomElements(objeto, cantidadMinima) {
  var elementosSeleccionados = {};
  var elementosTotales = 0; // Contador para llevar un registro de cuántos elementos hemos seleccionado
  
  // Iterar sobre cada lista del objeto
  for (var lista in objeto) {
      // Verificar si la lista está vacía
      if (objeto[lista].length === 0) continue;
      
      // Seleccionar aleatoriamente hasta 5 elementos de la lista
      for (var i = 0; i < Math.min(cantidadMinima - elementosTotales, objeto[lista].length); i++) {
          var indiceAleatorio = Math.floor(Math.random() * objeto[lista].length);
          var elementoSeleccionado = objeto[lista][indiceAleatorio];
          
          // Añadir el elemento seleccionado al objeto, con la clave indicando la lista de origen
          if (!elementosSeleccionados[lista]) {
              elementosSeleccionados[lista] = [];
          }
          elementosSeleccionados[lista].push(elementoSeleccionado);
          elementosTotales++; // Incrementar el contador de elementos seleccionados
          
          // Si hemos alcanzado 5 elementos, salir del bucle
          if (elementosTotales === cantidadMinima) {
              break;
          }
      }
      
      // Si ya hemos seleccionado 5 elementos, salir del bucle exterior
      if (elementosTotales === cantidadMinima) {
          break;
      }
  }
  
  return elementosSeleccionados;
}


function getImages() {

}

function searchItem(id, category) {
  var infoURL = '';

  if (category === 'movie' || category === 'tv') {
    infoURL = "https://mediamaster.ieti.site/api/details?category=" + category + "&id=" + id;
  } else if (category === 'books') {
    infoURL = "https://mediamaster.ieti.site/api/details?category=" + category + "&id=" + id;
  } else if (category === 'games') {
    infoURL = "https://mediamaster.ieti.site/api/details?category=" + category + "&id=" + id;
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
          '<div class="additional-info">' +
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


