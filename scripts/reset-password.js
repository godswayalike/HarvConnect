document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('resetPasswordForm');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const formMessage = document.getElementById('formMessage');
    const submitBtn = document.getElementById('submitBtn');

    // Password Visibility Toggle Logic
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = btn.querySelector('i');
            
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            icon.className = type === 'text' ? 'ph ph-eye' : 'ph ph-eye-slash';
        });
    });

    const showError = (inputId, message) => {
        const input = document.getElementById(inputId);
        const errorSpan = document.getElementById(`${inputId}Error`);
        input.classList.add('input-error');
        errorSpan.textContent = message;
        errorSpan.style.display = 'block';
    };

    const clearErrors = () => {
        ['newPassword', 'confirmPassword'].forEach(id => {
            document.getElementById(id).classList.remove('input-error');
            document.getElementById(`${id}Error`).style.display = 'none';
        });
        formMessage.style.display = 'none';
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();
        let isValid = true;

        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Enforce strict password rules from backend documentation [cite: 5]
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!passwordRegex.test(newPassword)) {
            showError('newPassword', 'Must be at least 8 chars, include an uppercase, lowercase, number, and special character.');
            isValid = false;
        }

        if (newPassword !== confirmPassword) {
            showError('confirmPassword', 'Passwords do not match.');
            isValid = false;
        }

        if (!isValid) return;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Updating...';

        const email = localStorage.getItem('harvconnect_reset_email');

        try {
            // Target the specific reset password endpoint [cite: 5]
            const response = await fetch('/api/v1/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, newPassword: newPassword })
            });

            // Handle the consistent JSON response structure [cite: 7]
            const result = await response.json();

            if (result.success) {
                // Clear the temporary email
                localStorage.removeItem('harvconnect_reset_email');
                
                // Route seamlessly to the success screen
                window.location.href = 'reset-success.html';
            } else {
                formMessage.textContent = result.message || 'Error resetting password.';
                formMessage.className = 'form-message error';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Continue';
            }
        } catch (error) {
            formMessage.textContent = 'Network error. Please try again.';
            formMessage.className = 'form-message error';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Continue';
        }
    });
});
