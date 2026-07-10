document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById('loginBtn');

    loginBtn.addEventListener('click', () => {
        window.location.href = '../pages/login.html';
    });
});