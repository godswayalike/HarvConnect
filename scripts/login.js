document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const roleSelect = document.getElementById('role');
    const togglePasswordBtn = document.querySelector('.toggle-password');
    const toggleIcon = document.getElementById('togglePasswordIcon');
    const formMessage = document.getElementById('formMessage');
    const submitBtn = document.getElementById('submitBtn');

    // --- Password Visibility Toggle ---
    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        if (type === 'text') {
            toggleIcon.classList.remove('ph-eye-slash');
            toggleIcon.classList.add('ph-eye');
        } else {
            toggleIcon.classList.remove('ph-eye');
            toggleIcon.classList.add('ph-eye-slash');
        }
    });

    // --- Validation Helpers ---
    const showError = (inputId, message) => {
        const input = document.getElementById(inputId);
        const errorSpan = document.getElementById(`${inputId}Error`);
        input.classList.add('input-error');
        errorSpan.textContent = message;
        errorSpan.style.display = 'block';
    };

    const clearErrors = () => {
        ['email', 'password', 'role'].forEach(id => {
            const input = document.getElementById(id);
            const errorSpan = document.getElementById(`${id}Error`);
            input.classList.remove('input-error');
            errorSpan.style.display = 'none';
        });
        formMessage.className = 'form-message';
        formMessage.textContent = '';
    };

    // --- Form Submission ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();
        let isValid = true;

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const role = roleSelect.value;

        // Validation
        if (!email) {
            showError('email', 'Email address is required.');
            isValid = false;
        }
        if (!password) {
            showError('password', 'Password is required.');
            isValid = false;
        }
        if (!role) {
            showError('role', 'Please select a role.');
            isValid = false;
        }

        if (!isValid) return;

        // UI Loading State
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';

        try {
            // Integrating with the login endpoint outlined in the docs 
            const response = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role })
            });

            // Parsing the standardized JSON structure 
            const result = await response.json();

            if (result.success) {
                formMessage.textContent = 'Login successful! Redirecting...';
                formMessage.classList.add('success');
                
                // Store auth token if provided in data object
                if (result.data && result.data.token) {
                    localStorage.setItem('harvconnect_token', result.data.token);
                }
                
                // Save role for routing logic
                localStorage.setItem('harvconnect_user_role', role);

                // Route to appropriate dashboard based on role
                setTimeout(() => {
                    if (role === 'Farmer') window.location.href = 'farmer-dashboard.html';
                    else if (role === 'Buyer') window.location.href = 'buyer-dashboard.html';
                    else window.location.href = 'transport-dashboard.html';
                }, 1500);

            } else {
                formMessage.textContent = result.message || 'Invalid credentials. Please try again.';
                formMessage.classList.add('error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Login';
            }

        } catch (error) {
            console.error('Login Error:', error);
            formMessage.textContent = 'A network error occurred. Please try again later.';
            formMessage.classList.add('error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
        }
    });
});
