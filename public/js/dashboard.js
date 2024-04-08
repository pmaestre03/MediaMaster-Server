$(function() {
    const userMail = localStorage.getItem('user_mail');
    const userId = localStorage.getItem('user_id');

    console.log(userMail);
    console.log(userId);

    


    // esto se tendra que automatizar despues de hacer login
    /*fetch('/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'user-mail': userMail,
          'user-id': userId
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch');
        }
        // Manejar la respuesta del servidor
      })
      .catch(error => {
        console.error('Error:', error);
      });*/
});


