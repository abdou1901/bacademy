document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.querySelector('input[name="email"]').value;
    const password = document.querySelector('input[name="password"]').value;

    fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data.message === 'User logged in successfully') {
            window.location.href = 'user.html'; // Redirect to user.html
        } else {
            alert(data.message);
        }
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
