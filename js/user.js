document.addEventListener('DOMContentLoaded', function() {
    fetch('http://localhost:5000/user-info')
    .then(response => response.json())
    .then(data => {
        document.getElementById('username').textContent = data.username;
    })
    .catch(error => {
        console.error('Error:', error);
        window.location.href = 'login.html'; // Redirect to login if not authenticated
    });

    document.getElementById('logout').addEventListener('click', function() {
        fetch('http://localhost:5000/logout', {
            method: 'POST'
        })
        .then(() => {
            window.location.href = 'login.html'; // Redirect to login after logout
        });
    });
});
