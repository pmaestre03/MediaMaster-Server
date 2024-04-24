var user_mail = localStorage.getItem('user_mail');
var user_id = localStorage.getItem('user_id');

if (user_mail || user_id) {
    window.location.href = 'https://mediamaster.ieti.site/dashboard';
} 

$(document).ready(function () {

         function loginUser(email, password) {
                  $.ajax({
                           url: 'https://mediamaster.ieti.site/login',
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
                                             window.location.href = 'https://mediamaster.ieti.site/';
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
});