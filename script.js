document.addEventListener("DOMContentLoaded", () => {
    // --- Screen Transition Logic ---
    const splashScreen = document.getElementById('splash-screen');
    const roleScreen = document.getElementById('role-selection-screen');

    // Display splash screen for 2.5 seconds, then fade to role selection
    setTimeout(() => {
        splashScreen.classList.remove('active');
        roleScreen.classList.add('active');
    }, 2500);


    // --- Role Selection Logic ---
    const roleCards = document.querySelectorAll('.role-card');

    roleCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const selectedRole = card.getAttribute('data-role');
            
            // Highlight selection visually
            roleCards.forEach(c => c.style.borderColor = '#F0F0F0');
            card.style.borderColor = 'var(--primary-green)';

            // Save the selected role to localStorage so it can be used on the next screen during the POST /api/v1/auth/register request
            localStorage.setItem('harvconnect_user_role', selectedRole);

            console.log(`Role selected: ${selectedRole}. Proceeding to registration...`);
            
            // TODO: Route to the Registration Screen
            window.location.href = 'register.html'; 
        });
    });

    // --- Login Link Logic ---
    const loginLink = document.getElementById('login-link');
    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        console.log("Navigating to Login screen...");
        // TODO: Route to Login Screen
        window.location.href = './pages/login.html';
    });
});