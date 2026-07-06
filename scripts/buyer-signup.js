document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("buyerSignupForm");
  const togglePasswordBtn = document.querySelector(".toggle-password");
  const passwordInput = document.getElementById("password");
  const toggleIcon = document.getElementById("togglePasswordIcon");
  const formMessage = document.getElementById("formMessage");
  const submitBtn = document.getElementById("submitBtn");

  // --- Back Button Logic ---
  document.querySelector(".back-btn").addEventListener("click", () => {
    window.history.back(); // Or route explicitly: window.location.href = 'index.html';
  });

  // --- Password Visibility Toggle ---
  togglePasswordBtn.addEventListener("click", () => {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);

    // Toggle icon visual
    if (type === "text") {
      toggleIcon.classList.remove("ph-eye-slash");
      toggleIcon.classList.add("ph-eye");
    } else {
      toggleIcon.classList.remove("ph-eye");
      toggleIcon.classList.add("ph-eye-slash");
    }
  });

  // --- Validation Helper Functions ---
  const showError = (inputId, message) => {
    const input = document.getElementById(inputId);
    const errorSpan = document.getElementById(`${inputId}Error`);
    input.classList.add("input-error");
    errorSpan.textContent = message;
    errorSpan.style.display = "block";
  };

  const clearError = (inputId) => {
    const input = document.getElementById(inputId);
    const errorSpan = document.getElementById(`${inputId}Error`);
    input.classList.remove("input-error");
    errorSpan.style.display = "none";
  };

  const clearAllErrors = () => {
    ["fullName", "phone", "email", "password"].forEach((id) => clearError(id));
    formMessage.className = "form-message";
    formMessage.textContent = "";
  };

  // --- Strict Frontend Validation matching Backend Docs ---
  const validateForm = () => {
    let isValid = true;
    clearAllErrors();

    // Full Name Validation: Required [cite: 5]
    const fullName = document.getElementById("fullName").value.trim();
    if (!fullName) {
      showError("fullName", "Full Name is required.");
      isValid = false;
    }

    // Phone Validation: Ghana format preferred [cite: 5]
    const phone = document.getElementById("phone").value.trim();
    // Matches +233 or 0, followed by 9 digits starting with 2-5
    const ghanaPhoneRegex = /^(?:(?:\+233)|(?:0))(?:[2-5]\d{8})$/;
    if (!phone) {
      showError("phone", "Phone number is required.");
      isValid = false;
    } else if (!ghanaPhoneRegex.test(phone)) {
      showError(
        "phone",
        "Please enter a valid Ghana phone number (e.g., 055... or +233...).",
      );
      isValid = false;
    }

    // Email Validation: Required, valid format [cite: 5]
    const email = document.getElementById("email").value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      showError("email", "Email is required.");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      showError("email", "Please enter a valid email address.");
      isValid = false;
    }

    // Password Validation: Min 8 chars, uppercase, lowercase, number, special char [cite: 5]
    const password = document.getElementById("password").value;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!password) {
      showError("password", "Password is required.");
      isValid = false;
    } else if (!passwordRegex.test(password)) {
      showError(
        "password",
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
      );
      isValid = false;
    }

    return isValid;
  };

  // --- Form Submission & API Integration ---
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const selectedRole = (
      localStorage.getItem("harvconnect_user_role") || "Buyer"
    ).trim();
    const normalizedRole =
      selectedRole === "Farmer"
        ? "FARMER"
        : selectedRole === "Buyer"
          ? "BUYER"
          : selectedRole === "Transport"
            ? "TRANSPORT"
            : selectedRole.toUpperCase();

    // Collect ONLY the core registration fields the Auth endpoint expects
    const formData = {
      fullName: document.getElementById("fullName").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value,
      role: normalizedRole,
    };

    // UI Loading State
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating Account...";

    try {
      const result = await HarvConnectAPI.register(formData);

      if (result.success) {
        formMessage.textContent =
          "Registration successful! Check your email for the verification code.";
        formMessage.classList.add("success");

        setTimeout(() => {
          window.location.href = result?.data?.user?.isVerified
            ? "login.html"
            : "verify-email.html";
        }, 2000);
      } else {
        formMessage.textContent =
          result.message || "Registration failed. Please try again.";
        formMessage.classList.add("error");
        submitBtn.disabled = false;
        submitBtn.textContent = "Sign Up";
      }
    } catch (error) {
      console.error("Registration Error:", error);
      // Fallback error for network failures
      formMessage.textContent =
        "A network error occurred. Please try again later.";
      formMessage.classList.add("error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign Up";
    }
  });
});
