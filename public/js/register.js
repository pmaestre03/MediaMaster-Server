$(document).ready(function () {

         $("#registerForm").on('submit', function (event) {
                  event.preventDefault();
                  var email = $("#email").val();
                  var user = $("#user").val();
                  var password = $("#password").val();
                  var password2 = $("#password2").val();
                  if (password !== password2) {
                           document.getElementById('message').innerHTML = 'Passwords do not match';
                  } else {
                           registerUser(email, user, password);
                  }
         });

         function registerUser(email, user, password) {
                  console.log(email, user, password);
                  $.ajax({
                           url: 'https://mediamaster.ieti.site/register',
                           method: 'POST',
                           data: {
                                    email: email,
                                    user: user,
                                    password: password
                           },
                           success: function (data) {
                                    console.log(data);
                                    if (!data.success) {
                                             document.getElementById('message').innerHTML = 'User already exists';
                                    } else {
                                             document.getElementById('message').innerHTML = 'User created';
                                             document.getElementById('message').css('color', 'green');
                                             document.getElementById('registerForm').reset();
                                    }
                           },
                           error: function (jqXHR, textStatus, errorThrown) {
                                    console.log("Error en la solicitud:", jqXHR);
                                    console.log("Texto del estado:", textStatus);
                                    console.log("Error lanzado:", errorThrown);
                           }
                  });
         }

});