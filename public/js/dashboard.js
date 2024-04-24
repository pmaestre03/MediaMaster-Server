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

        $("#mylists").append("<a class='see-details' href='https://mediamaster.ieti.site/viewDetailed?id=" + list.list_id + "'><h3>" + list.list_name + "</h3><ul class='list' id='" + list.list_id + "'></ul></a><p class='overlay-text'>See More</p>");

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

          getImages(selectedPosters).then(function(imagesUrls) {
            console.log(imagesUrls);
            displayPosters(imagesUrls, list.list_id);
          }).catch(function(error) {
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

  $.each(object, function(category, ids) {
    console.log("Categoría:", category);

    $.each(ids, function(i, id) {
      console.log("Elemento", i + 1 + ":", id);

      // Llamada a la función que devuelve una promesa
      var promise = searchItem(id, category);
      promises.push(promise);
      
    });
    
    console.log("----------------------");
  });

  // Esperar a que todas las promesas se resuelvan
  return Promise.all(promises).then(function(results) {
    // Agregar resultados válidos al array de imágenes
    results.forEach(function(result) {
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
    infoURL = "https://mediamaster.ieti.site/api/details?category=" + category + "&id=" + id;
  } else if (category == 'books') {
    infoURL = "https://mediamaster.ieti.site/api/details?category=" + category + "&id=" + id;
  } else if (category == 'games') {
    infoURL = "https://mediamaster.ieti.site/api/details?category=" + category + "&id=" + id;
  }

  // Devolver una promesa
  return new Promise(function(resolve, reject) {
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


$(function() {
  $("#welcome_messagge").text("Welcome, " + userName);
  

  getUsersList(userMail, userId);
});


