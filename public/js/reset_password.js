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

    $("#recoverPasswd").submit(function (e) {
        e.preventDefault();
        var password = $("#password").val();
        var repeatPassword = $("#repeatPassword").val();
        if (password != repeatPassword) {
            showNotification("Passwords do not match", 'orange');
            return;
        } else {
            var token = new URLSearchParams(window.location.search).get("token");
            $.ajax({
                type: "POST",
                url: url + "/resetPassword",
                data: { token: token, password: password },
                success: function (data) {
                    if (data.success) {
                        $("#recoverPasswd").hide();
                        showNotification(data.message, 'green');
                        window.location.href = url + '/login';
                    } else {
                        showNotification(data.error, 'red');
                    }
                },
                error: function (xhr, status, error) {
                    showNotification("An error occurred while processing your request", 'red');
                }
            });
        }
    });
});