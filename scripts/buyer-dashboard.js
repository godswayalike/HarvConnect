document.addEventListener("DOMContentLoaded", async () => {
  // Route guard: ensure the user is authenticated and is a BUYER.
  const token = localStorage.getItem("harvconnect_token");
  const userString = localStorage.getItem("harvconnect_user");
  const roleFromStorage = localStorage.getItem("harvconnect_user_role") || "";

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  let user = null;
  if (userString) {
    try {
      user = JSON.parse(userString);
    } catch (error) {
      console.error("Invalid user data stored in localStorage.", error);
    }
  }

  const normalizedRole = (user?.role || roleFromStorage || "")
    .toString()
    .trim()
    .toUpperCase();

  if (normalizedRole !== "BUYER") {
    alert("Access denied. This dashboard is for buyers.");
    window.location.href = "login.html";
    return;
  }

  // Personalize the header and welcome state.
  const fullName = user?.fullName?.trim() || "Buyer";
  const firstName = fullName.split(" ")[0] || "Buyer";

  const welcomeMessage = document.getElementById("welcomeMessage");
  const userInitials = document.getElementById("userInitials");

  if (welcomeMessage) {
    welcomeMessage.textContent = `Welcome back, ${firstName}!`;
  }

  if (userInitials) {
    userInitials.textContent = (firstName.charAt(0) || "B").toUpperCase();
  }

  // Fetch live marketplace products from the backend when available.
  const BASE_URL =
    "https://harvconnect-backend-api-v1-production.up.railway.app";

  try {
    const response = await fetch(`${BASE_URL}/api/v1/produce`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const payload = await response.json();
      const products = payload.products || payload.data || payload;
      renderProduce(products);
    } else {
      throw new Error("Marketplace API returned an error response.");
    }
  } catch (error) {
    console.warn("Falling back to demo product data.", error);
    loadDemoData();
  }

  // Logout behavior.
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "login.html";
    });
  }
});

function renderProduce(products) {
  const grid = document.getElementById("produceGrid");
  const list = Array.isArray(products) ? products : [];

  if (!grid) return;

  if (!list.length) {
    grid.innerHTML =
      '<div class="empty-state">No produce available right now.</div>';
    return;
  }

  grid.innerHTML = list
    .map(
      (product) => `
        <article class="produce-card">
          <div class="produce-image">${(product.name || "Fresh Produce").charAt(0).toUpperCase()}</div>
          <h3>${product.name || "Fresh Produce"}</h3>
          <p class="produce-meta">${product.farmerName || "HarvConnect Farmer"} • ${product.location || "Location pending"}</p>
          <div class="price">GH₵ ${product.price || "0"} / ${product.unit || "unit"}</div>
          <button class="add-to-cart-btn">Add to Cart</button>
        </article>
      `,
    )
    .join("");
}

function loadDemoData() {
  const demoProducts = [
    {
      name: "Fresh Maize",
      farmerName: "Saviour Farms",
      location: "Volta Region",
      price: "150",
      unit: "bag",
    },
    {
      name: "Organic Tomatoes",
      farmerName: "Abena's Greens",
      location: "Oti Region",
      price: "80",
      unit: "basket",
    },
    {
      name: "Cassava Tubers",
      farmerName: "Kojo Agrotech",
      location: "Eastern Region",
      price: "120",
      unit: "sack",
    },
  ];

  renderProduce(demoProducts);
}
