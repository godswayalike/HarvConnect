document.addEventListener("DOMContentLoaded", () => {
    const dashboardBtn = document.getElementById('dashboardBtn');

    dashboardBtn.addEventListener('click', () => {
        window.location.href = '../pages/login.html';
    });
});