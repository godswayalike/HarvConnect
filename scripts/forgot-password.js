document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("forgotPasswordForm");
  const emailInput = document.getElementById("email");
  const formMessage = document.getElementById("formMessage");
  const submitBtn = document.getElementById("submitBtn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const emailError = document.getElementById("emailError");

    if (!email) {
      emailInput.classList.add("input-error");
      emailError.textContent = "Email is required.";
      emailError.style.display = "block";
      return;
    }

    emailInput.classList.remove("input-error");
    emailError.style.display = "none";
    submitBtn.disabled = true;
    submitBtn.textContent = "Verifying...";

    const BASE_URL =
      "https://harvconnect-backend-api-v1-production.up.railway.app";

    try {
      // Target the specific forgot password endpoint [cite: 5]
      const response = await fetch(`${BASE_URL}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // Handle the consistent JSON response structure [cite: 7]
      const result = await response.json();

      if (result.success) {
        // Save email to localStorage so the next screen can use it for the reset payload
        localStorage.setItem("harvconnect_reset_email", email);

        formMessage.textContent = "Instructions sent! Redirecting...";
        formMessage.className = "form-message success";

        setTimeout(() => {
          window.location.href = "reset-password.html";
        }, 1500);
      } else {
        formMessage.textContent = result.message || "Error verifying email.";
        formMessage.className = "form-message error";
        submitBtn.disabled = false;
        submitBtn.textContent = "Next";
      }
    } catch (error) {
      formMessage.textContent = "Network error. Please try again.";
      formMessage.className = "form-message error";
      submitBtn.disabled = false;
      submitBtn.textContent = "Next";
    }
  });
});
