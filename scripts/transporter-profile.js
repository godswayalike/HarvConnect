document.addEventListener("DOMContentLoaded", () => {
    // 1. Handle regular menu item clicks
    const menuItems = document.querySelectorAll('.menu-card:not(.logout-card) .menu-item');
    
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const action = item.getAttribute('data-action');
            
            // Map the actions to their respective behaviors
            switch(action) {
                case 'order-history':
                    window.location.href = 'orders.html';
                    break;
                case 'notifications':
                    alert('Opening Notifications Panel...');
                    break;
                case 'settings':
                    alert('Opening Settings Configuration...');
                    break;
                case 'support':
                    alert('Redirecting to Help Center...');
                    break;
                default:
                    console.log('Action not mapped');
            }
        });
    });

    // 2. Handle Custom Logout Modal
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutModal = document.getElementById('logoutModal');
    const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
    const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');

    if (logoutBtn && logoutModal) {
        // Open modal
        logoutBtn.addEventListener('click', () => {
            logoutModal.classList.add('active');
        });

        // Close modal on "No, stay"
        cancelLogoutBtn.addEventListener('click', () => {
            logoutModal.classList.remove('active');
        });

        // Execute logout on "Yes, leave"
        confirmLogoutBtn.addEventListener('click', () => {
            // Here you would clear auth tokens: localStorage.removeItem('authToken');
            
            // Redirect to login page
            window.location.href = 'login.html'; 
        });

        // Optional UX enhancement: Close modal if user clicks the dark background overlay
        logoutModal.addEventListener('click', (e) => {
            if (e.target === logoutModal) {
                logoutModal.classList.remove('active');
            }
        });
    }
});