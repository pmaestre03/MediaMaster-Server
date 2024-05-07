var user_mail = localStorage.getItem('user_mail');
var user_id = localStorage.getItem('user_id');
var user_name = localStorage.getItem('user_name');
const url = "https://mediamaster.ieti.site";

$(document).ready(function () {

    if (window.location.pathname === '/search' || window.location.pathname === '/dashboard') {
        if (!user_mail) {
            window.location.href = url;
        }
    } else if (window.location.pathname === '/login' || window.location.pathname === '/register' || window.location.pathname === '/forgot' || window.location.pathname === '/resetPassword' || window.location.pathname === '/') {
        if (user_mail) {
            window.location.href = url + '/dashboard';
        }
    }

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

    $("#registerForm").on('submit', function (event) {
        event.preventDefault();
        var email = $("#email").val();
        var user = $("#user").val();
        var password = $("#password").val();
        var password2 = $("#password2").val();
        if (password !== password2) {
            showNotification('Passwords do not match', 'red');
        } else {
            registerUser(email, user, password);
        }
    });

    function registerUser(email, user, password) {
        //console.log(email, user, password);
        $.ajax({
            url: url + '/register',
            method: 'POST',
            data: {
                email: email,
                user: user,
                password: password
            },
            success: function (data) {
                //console.log(data);
                if (!data.success) {
                    showNotification('User already exists', 'red');
                } else {
                    showNotification('User created', 'green');
                    window.location.href = url + '/login';
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