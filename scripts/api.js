// api.js
// HarvConnect Global API Client

// Setting my live Railway URL here so if I ever change servers, I only update it in one place.
const API_BASE_URL =
  "https://harvconnect-backend-api-v1-production.up.railway.app/api/v1";

const STORAGE_KEYS = {
  TOKEN: "harvconnect_token",
  USER: "harvconnect_user",
};

class HarvConnectAPI {
  // Pulling the token directly from local storage whenever it's needed
  static get token() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  static get user() {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  }

  static setSession(token, user) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  static clearSession() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  // My core request wrapper. Every API call routes through this bad boy.
  static async request(endpoint, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {}),
    };

    // If the user is logged in, automatically attach their VIP pass (the JWT token)
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    let payload = {};

    try {
      payload = await response.json();
    } catch (_) {
      // If the backend crashes and sends HTML instead of JSON, I catch it here silently so the frontend doesn't explode.
    }

    if (!response.ok) {
      // If the backend says the token is expired (401), I kick them out immediately to protect the app.
      if (response.status === 401) {
        this.clearSession();
      }

      throw new Error(payload.message || "An unexpected error occurred.");
    }

    return payload;
  }

  // --------------------
  // Authentication
  // --------------------

  static async login(email, password) {
    const response = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (response.success) {
      this.setSession(response.data.token, response.data.user);
    }

    return response;
  }

  static async register(userData) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  static logout() {
    this.clearSession();
    // Assuming the login page is in the same directory, or they get bumped to the root index.
    window.location.href = "login.html";
  }

  static async getProfile() {
    return this.request("/auth/me");
  }

  // --------------------
  // Marketplace
  // --------------------

  static async getProducts() {
    return this.request("/products");
  }

  static async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  // --------------------
  // AI Recommendations
  // --------------------

  static async getRecommendations(commodity) {
    return this.request(
      `/recommendations?commodity=${encodeURIComponent(commodity)}`,
    );
  }

  // --------------------
  // Orders
  // --------------------

  static async createOrder(order) {
    return this.request("/orders", {
      method: "POST",
      body: JSON.stringify(order),
    });
  }

  static async getOrders() {
    return this.request("/orders");
  }

  // --------------------
  // Payments
  // --------------------

  static async requestMomoPayment(phoneNumber, amount, network) {
    return this.request("/payments/momo/request", {
      method: "POST",
      body: JSON.stringify({
        phoneNumber,
        amount,
        network,
      }),
    });
  }

  // --------------------
  // Reviews
  // --------------------

  static async submitReview(farmerId, rating, comment) {
    return this.request("/reviews", {
      method: "POST",
      body: JSON.stringify({
        farmerId,
        rating,
        comment,
      }),
    });
  }

  // --------------------
  // Health
  // --------------------

  static async health() {
    return this.request("/health");
  }
}

// Exposing my class to the global window object so any HTML page can talk to it
window.HarvConnectAPI = HarvConnectAPI;
