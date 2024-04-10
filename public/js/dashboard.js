const userMail = localStorage.getItem('user_mail');
const userId = localStorage.getItem('user_id');
const userName = localStorage.getItem('user_name');

if (!userMail || !userId) {
  window.location.href = 'https://mediamaster.ieti.site/';
}

$(function() {
  $("#welcome_messagge").text("Welcome, " + userName);

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
        data.forEach(function (list) {
          $("#myList").append("<li><h3>" + list.list_name + "</h3>" + "<a href='https://mediamaster.ieti.site/viewDetailed?id=" + list.list_id + "'><ul></ul></a></li>");
          $("#myList").append("<li>Movies: " + list.movie_id + "</li>");
          $("#myList").append("<li>Series: " + list.serie_id + "</li>");
          $("#myList").append("<li>Books: " + list.book_id + "</li>");
          $("#myList").append("<li>Games: " + list.game_id + "</li>");
          $("#myList").append("<li>========================================</li>");
        });
      });
  }

  getUsersList(userMail, userId);
});


