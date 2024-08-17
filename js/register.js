document.getElementById('registrationForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.querySelector('input[name="username"]').value;
    const email = document.querySelector('input[name="email"]').value;
    const password = document.querySelector('input[name="password"]').value;
    const confirmPassword = document.querySelector('input[name="confirmPassword"]').value;

    fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password, confirmPassword })
    })
    .then(response => response.text())
    .then(data => {
        console.log(data);
        alert(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
document.addEventListener('DOMContentLoaded', function() {
    fetch('http://localhost:5000/user-info')
    .then(response => {
        if (response.status === 200) {
            window.location.href = 'user.html'; // Redirect if already logged in
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
