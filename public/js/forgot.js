$(document).ready(function () {

    $("#forgotForm").on('submit', function (event) {
        event.preventDefault();
        var email = $("#email").val();
        forgotPassword(email);
    });

    function forgotPassword(email) {
        console.log(email);
        $.ajax({
            url: 'https://mediamaster.ieti.site/forgot',
            method: 'POST',
            data: {
                email: email
            },
            success: function (data) {
                console.log(data);
                if (!data.success) {
                    $('#message').html('User does not exist').css('color', 'red')
                } else {
                    $('#message').html('Recovery email sent successfully').css('color', 'green')
                }
                $("#email").val('');
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error en la solicitud:", jqXHR);
                console.log("Texto del estado:", textStatus);
                console.log("Error lanzado:", errorThrown);
            }
        });
    }

});