$(document).ready(function () {

         function loginUser(email, password) {
                  $.ajax({
                           url: 'http://localhost:3000/login',
                           method: 'POST',
                           data: {
                                    email: email,
                                    password: password
                           },
                           success: function (data) {
                                    console.log(data);
                                    if (data.success) {
                                             localStorage.setItem('user_id', data.userData[0].user_id);
                                             localStorage.setItem('user_mail', email);
                                             localStorage.setItem('user_name', data.userData[0].user_name);
                                             window.location.href = 'http://localhost:3000/';
                                    } else {
                                             document.getElementById('error').innerHTML = 'User or Password incorrect';
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

});