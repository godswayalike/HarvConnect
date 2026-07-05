document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('transporterSignupForm');
    const togglePasswordBtn = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('togglePasswordIcon');
    const formMessage = document.getElementById('formMessage');
    const submitBtn = document.getElementById('submitBtn');

    // --- Back Button Logic ---
    document.querySelector('.back-btn').addEventListener('click', () => {
        window.history.back(); // Or route explicitly: window.location.href = 'index.html';
    });

    // --- Password Visibility Toggle ---
    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle icon visual
        if (type === 'text') {
            toggleIcon.classList.remove('ph-eye-slash');
            toggleIcon.classList.add('ph-eye');
        } else {
            toggleIcon.classList.remove('ph-eye');
            toggleIcon.classList.add('ph-eye-slash');
        }
    });

    // --- Validation Helper Functions ---
    const showError = (inputId, message) => {
        const input = document.getElementById(inputId);
        const errorSpan = document.getElementById(`${inputId}Error`);
        input.classList.add('input-error');
        errorSpan.textContent = message;
        errorSpan.style.display = 'block';
    };

    const clearError = (inputId) => {
        const input = document.getElementById(inputId);
        const errorSpan = document.getElementById(`${inputId}Error`);
        input.classList.remove('input-error');
        errorSpan.style.display = 'none';
    };

    const clearAllErrors = () => {
        ['fullName', 'phone', 'email', 'password'].forEach(id => clearError(id));
        formMessage.className = 'form-message';
        formMessage.textContent = '';
    };

    // --- Strict Frontend Validation matching Backend Docs ---
    const validateForm = () => {
        let isValid = true;
        clearAllErrors();

        // Full Name Validation: Required [cite: 5]
        const fullName = document.getElementById('fullName').value.trim();
        if (!fullName) {
            showError('fullName', 'Full Name is required.');
            isValid = false;
        }

        // Phone Validation: Ghana format preferred [cite: 5]
        const phone = document.getElementById('phone').value.trim();
        // Matches +233 or 0, followed by 9 digits starting with 2-5
        const ghanaPhoneRegex = /^(?:(?:\+233)|(?:0))(?:[2-5]\d{8})$/;
        if (!phone) {
            showError('phone', 'Phone number is required.');
            isValid = false;
        } else if (!ghanaPhoneRegex.test(phone)) {
            showError('phone', 'Please enter a valid Ghana phone number (e.g., 055... or +233...).');
            isValid = false;
        }

        // Email Validation: Required, valid format [cite: 5]
        const email = document.getElementById('email').value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            showError('email', 'Email is required.');
            isValid = false;
        } else if (!emailRegex.test(email)) {
            showError('email', 'Please enter a valid email address.');
            isValid = false;
        }

        // Password Validation: Min 8 chars, uppercase, lowercase, number, special char [cite: 5]
        const password = document.getElementById('password').value;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!password) {
            showError('password', 'Password is required.');
            isValid = false;
        } else if (!passwordRegex.test(password)) {
            showError('password', 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
            isValid = false;
        }

        return isValid;
    };

    // --- Form Submission & API Integration ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        // Collect registration fields [cite: 2]
        const formData = {
            fullName: document.getElementById('fullName').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
            role: localStorage.getItem('harvconnect_user_role') || 'Transport_Provider', 
            // Note: Location and Produce Type are captured here but may need to be 
            // routed to the profile completion endpoint PATCH /api/v1/farmers/profile later
            location: document.getElementById('location').value.trim(),
            produceType: document.getElementById('produceType').value.trim()
        };

        // UI Loading State
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account...';

        try {
            // Target the specific registration endpoint [cite: 5]
            const response = await fetch('/api/v1/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            // Handle the consistent backend JSON response format [cite: 7]
            const result = await response.json();

            if (result.success) {
                formMessage.textContent = 'Registration successful! Check your email for the verification code.';
                formMessage.classList.add('success');
                
                // Route to Verify Email screen
                setTimeout(() => {
                    // window.location.href = 'verify-email.html';
                    console.log('Routing to verify email...', result.data);
                }, 2000);
            } else {
                // Display the specific error message provided by the backend API [cite: 7]
                formMessage.textContent = result.message || 'Registration failed. Please try again.';
                formMessage.classList.add('error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign Up';
            }

        } catch (error) {
            console.error('Registration Error:', error);
            // Fallback error for network failures
            formMessage.textContent = 'A network error occurred. Please try again later.';
            formMessage.classList.add('error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign Up';
        }
    });
});
