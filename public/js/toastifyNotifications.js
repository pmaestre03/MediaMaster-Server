export function showNotification(text, color) {
    Toastify({
        text: text,
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background: color,
        },
        onClick: function () { }
    }).showToast();
}
