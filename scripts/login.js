document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const roleSelect = document.getElementById("role");
  const togglePasswordBtn = document.querySelector(".toggle-password");
  const toggleIcon = document.getElementById("togglePasswordIcon");
  const formMessage = document.getElementById("formMessage");
  const submitBtn = document.getElementById("submitBtn");

  const normalizeRole = (value) => {
    const role = (value || "").toString().trim();
    if (!role) return "";

    const mapping = {
      Farmer: "FARMER",
      Buyer: "BUYER",
      "Transport Provider": "TRANSPORT",
      FARMER: "FARMER",
      BUYER: "BUYER",
      TRANSPORT: "TRANSPORT",
      TRANSPORT_PROVIDER: "TRANSPORT",
    };

    return mapping[role] || role.toUpperCase();
  };

  // --- Password Visibility Toggle ---
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener("click", () => {
      const type =
        passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);

      if (type === "text") {
        toggleIcon.classList.remove("ph-eye-slash");
        toggleIcon.classList.add("ph-eye");
      } else {
        toggleIcon.classList.remove("ph-eye");
        toggleIcon.classList.add("ph-eye-slash");
      }
    });
  }

  // --- Validation Helpers ---
  const showError = (inputId, message) => {
    const input = document.getElementById(inputId);
    const errorSpan = document.getElementById(`${inputId}Error`);
    input.classList.add("input-error");
    errorSpan.textContent = message;
    errorSpan.style.display = "block";
  };

  const clearErrors = () => {
    ["email", "password", "role"].forEach((id) => {
      const input = document.getElementById(id);
      const errorSpan = document.getElementById(`${id}Error`);
      input.classList.remove("input-error");
      errorSpan.style.display = "none";
    });
    formMessage.className = "form-message";
    formMessage.textContent = "";
  };

  // --- Form Submission ---
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();
    let isValid = true;

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const role = roleSelect.value;

    // Validation
    if (!email) {
      showError("email", "Email address is required.");
      isValid = false;
    }
    if (!password) {
      showError("password", "Password is required.");
      isValid = false;
    }
    if (!role) {
      showError("role", "Please select a role.");
      isValid = false;
    }

    if (!isValid) return;

    // UI Loading State
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    try {
      const result = await HarvConnectAPI.login(email, password);

      if (result.success) {
        const storedUser = result.data?.user || {};
        const normalizedRole = normalizeRole(
          storedUser.role || role || "BUYER",
        );

        formMessage.textContent = "Login successful! Redirecting...";
        formMessage.classList.add("success");

        if (result.data?.token) {
          localStorage.setItem("harvconnect_token", result.data.token);
        }

        localStorage.setItem("harvconnect_user", JSON.stringify(storedUser));
        localStorage.setItem("harvconnect_user_role", normalizedRole);

        setTimeout(() => {
          if (normalizedRole === "FARMER") {
            window.location.href = "farmer-dashboard.html";
          } else if (normalizedRole === "BUYER") {
            window.location.href = "buyer-dashboard.html";
          } else {
            window.location.href = "transport-dashboard.html";
          }
        }, 1500);
      } else {
        formMessage.textContent =
          result.message || "Invalid credentials. Please try again.";
        formMessage.classList.add("error");
        submitBtn.disabled = false;
        submitBtn.textContent = "Login";
      }
    } catch (error) {
      console.error("Login Error:", error);
      formMessage.textContent =
        "A network error occurred. Please try again later.";
      formMessage.classList.add("error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Login";
    }
  });
});
