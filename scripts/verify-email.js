document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('verifyForm');
    const otpInput = document.getElementById('otpCode');
    const formMessage = document.getElementById('formMessage');
    const submitBtn = document.getElementById('submitBtn');
    const resendLink = document.getElementById('resendCode');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = otpInput.value.trim();

        if (!code) {
            otpInput.classList.add('input-error');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Verifying...';
        otpInput.classList.remove('input-error');

        const BASE_URL = 'https://harvconnect-backend-api-v1-production.up.railway.app';

        try {
            // Integrating with the endpoint from your documentation
            const response = await fetch(`${BASE_URL}/api/v1/auth/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code })
            });

            // Handling the expected JSON structure: { success, message, data }
            const result = await response.json(); 

            if (result.success) {
                formMessage.textContent = 'Email verified successfully! Redirecting to login...';
                formMessage.className = 'form-message success';
                
                // Route the user to the Login screen
                setTimeout(() => {
                    window.location.href = '../pages/login.html';
                }, 2000);
            } else {
                formMessage.textContent = result.message || 'Invalid verification code.';
                formMessage.className = 'form-message error';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Verify Account';
            }
        } catch (error) {
            formMessage.textContent = 'Network error. Please try again.';
            formMessage.className = 'form-message error';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Verify Account';
        }
    });

    // Optional: Resend Code Logic targeting POST /api/v1/auth/resend-verification
    resendLink.addEventListener('click', async (e) => {
        e.preventDefault();
        // Add your resend API fetch call here
        alert("Verification code resent to your email.");
    });
});
