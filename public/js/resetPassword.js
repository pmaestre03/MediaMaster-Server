$(document).ready(function () {
    $("#recoverPasswd").submit(function (e) {
        e.preventDefault();
        var password = $("#password").val();
        var repeatPassword = $("#repeatPassword").val();
        if (password != repeatPassword) {
            $("#message").html("Passwords do not match");
            $("#message").css("color", "red");
            return;
        } else {
            var token = new URLSearchParams(window.location.search).get("token");
            $.ajax({
                type: "POST",
                url: "https://mediamaster.ieti.site/resetPassword",
                data: { token: token, password: password },
                success: function (data) {
                    if (data.success) {
                        $("#recoverPasswd").hide();
                        $("#message").html(data.message);
                        $("#message").css("color", "green");
                    } else {
                        $("#message").html(data.error);
                        $("#message").css("color", "red");
                    }
                },
                error: function (xhr, status, error) {
                    $("#message").html("An error occurred while processing your request");
                    $("#message").css("color", "red");
                }
            });
        }
    });
});
