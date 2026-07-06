// buyer-shared.js
// HarvConnect Buyer Module - Shared Utilities & State Management

const BuyerApp = (() => {
  // ==================== STATE MANAGEMENT ====================
  const state = {
    cart: [],
    currentPage: 'dashboard',
    searchQuery: '',
    selectedCategory: null,
    products: [],
    orders: [],
    user: null,
    isLoading: false,
    error: null
  };

  // ==================== CONSTANTS ====================
  const API_BASE_URL = 'https://harvconnect-backend-api-v1-production.up.railway.app/api/v1';
  const STORAGE_KEYS = {
    TOKEN: 'harvconnect_token',
    USER: 'harvconnect_user',
    ROLE: 'harvconnect_user_role',
    CART: 'harvconnect_cart'
  };

  const CATEGORIES = [
    { id: 'tomatoes', name: 'Tomatoes', icon: 'ph-plant' },
    { id: 'pepper', name: 'Pepper', icon: 'ph-plant' },
    { id: 'garden-eggs', name: 'Garden Eggs', icon: 'ph-egg' },
    { id: 'okra', name: 'Okra', icon: 'ph-plant' },
    { id: 'lettuce', name: 'Lettuce', icon: 'ph-leaf' },
    { id: 'onions', name: 'Onions', icon: 'ph-circle' },
    { id: 'cucumber', name: 'Cucumber', icon: 'ph-plant' },
    { id: 'cabbage', name: 'Cabbage', icon: 'ph-circle' }
  ];

  const DEMO_PRODUCTS = [
    {
      id: 'demo-1',
      name: 'Fresh Tomatoes',
      category: 'tomatoes',
      farmerName: 'Saviour Farms',
      farmerId: 'farmer-1',
      location: 'Volta Region',
      price: 80,
      unit: 'basket',
      rating: 4.5,
      available: true,
      image: null,
      description: 'Fresh, ripe tomatoes harvested this morning. Perfect for cooking and salads.',
      stock: 50
    },
    {
      id: 'demo-2',
      name: 'Organic Pepper',
      category: 'pepper',
      farmerName: 'Abena\'s Greens',
      farmerId: 'farmer-2',
      location: 'Oti Region',
      price: 120,
      unit: 'bag',
      rating: 4.8,
      available: true,
      image: null,
      description: 'Spicy organic pepper grown without pesticides. Adds perfect heat to any dish.',
      stock: 30
    },
    {
      id: 'demo-3',
      name: 'Garden Eggs',
      category: 'garden-eggs',
      farmerName: 'Kojo Agrotech',
      farmerId: 'farmer-3',
      location: 'Eastern Region',
      price: 95,
      unit: 'sack',
      rating: 4.3,
      available: true,
      image: null,
      description: 'Nutritious garden eggs, great for stews and healthy eating.',
      stock: 25
    },
    {
      id: 'demo-4',
      name: 'Fresh Okra',
      category: 'okra',
      farmerName: 'Ama Farms',
      farmerId: 'farmer-4',
      location: 'Greater Accra',
      price: 60,
      unit: 'basket',
      rating: 4.6,
      available: true,
      image: null,
      description: 'Crisp fresh okra, perfect for soups and stews.',
      stock: 40
    },
    {
      id: 'demo-5',
      name: 'Lettuce',
      category: 'lettuce',
      farmerName: 'Fresh Greens Co.',
      farmerId: 'farmer-5',
      location: 'Ashanti Region',
      price: 45,
      unit: 'head',
      rating: 4.7,
      available: true,
      image: null,
      description: 'Crisp lettuce leaves, perfect for salads and sandwiches.',
      stock: 35
    },
    {
      id: 'demo-6',
      name: 'Red Onions',
      category: 'onions',
      farmerName: 'Saviour Farms',
      farmerId: 'farmer-1',
      location: 'Volta Region',
      price: 150,
      unit: 'bag',
      rating: 4.4,
      available: true,
      image: null,
      description: 'Premium red onions with excellent flavor profile.',
      stock: 60
    }
  ];

  // ==================== UTILITY FUNCTIONS ====================
  
  /**
   * Debounce function to limit API calls
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Format price in Ghana Cedis
   */
  function formatPrice(amount) {
    return `GH₵ ${parseFloat(amount || 0).toFixed(2)}`;
  }

  /**
   * Get user initials from name
   */
  function getInitials(name) {
    if (!name) return 'B';
    const parts = name.trim().split(' ');
    return (parts[0]?.charAt(0) || 'B').toUpperCase();
  }

  /**
   * Get first name from full name
   */
  function getFirstName(fullName) {
    if (!fullName) return 'Buyer';
    return fullName.trim().split(' ')[0] || 'Buyer';
  }

  /**
   * Generate star rating HTML
   */
  function renderStarRating(rating) {
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
      stars += '<i class="ph-fill ph-star"></i>';
    }
    if (hasHalfStar) {
      stars += '<i class="ph-fill ph-star-half"></i>';
    }
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars += '<i class="ph ph-star"></i>';
    }
    
    return stars;
  }

  // ==================== AUTHENTICATION ====================

  function getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  function getUser() {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Invalid user data in localStorage', e);
      }
    }
    return null;
  }

  function getUserRole() {
    return localStorage.getItem(STORAGE_KEYS.ROLE) || '';
  }

  function isAuthenticated() {
    const token = getToken();
    const role = getUserRole();
    return !!(token && role.toUpperCase() === 'BUYER');
  }

  function requireAuth() {
    if (!isAuthenticated()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.ROLE);
    localStorage.removeItem(STORAGE_KEYS.CART);
    window.location.href = 'login.html';
  }

  // ==================== API FUNCTIONS ====================

  async function apiRequest(endpoint, options = {}) {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers || {})
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      let payload = {};
      try {
        payload = await response.json();
      } catch (_) {
        // Response is not JSON
      }

      if (!response.ok) {
        if (response.status === 401) {
          logout();
        }
        throw new Error(payload.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return payload;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  async function fetchProducts() {
    try {
      const response = await apiRequest('/products');
      // Handle backend response structure: { success, data: { products, meta } }
      const products = response?.data?.products || response?.products || response?.data || response || [];
      return Array.isArray(products) ? products : [];
    } catch (error) {
      console.warn('Failed to fetch products from API, using demo data:', error);
      return DEMO_PRODUCTS;
    }
  }

  async function fetchProduct(id) {
    try {
      const response = await apiRequest(`/products/${id}`);
      // Handle backend response structure: { success, data: { product } }
      return response?.data?.product || response?.product || response?.data || response;
    } catch (error) {
      console.warn('Failed to fetch product from API, using demo data:', error);
      return DEMO_PRODUCTS.find(p => p.id === id) || null;
    }
  }

  async function fetchOrders() {
    try {
      const response = await apiRequest('/orders');
      const orders = response.orders || response.data || response || [];
      return Array.isArray(orders) ? orders : [];
    } catch (error) {
      console.warn('Failed to fetch orders:', error);
      return [];
    }
  }

  async function createOrder(orderData) {
    try {
      const response = await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });
      return response.order || response.data || response;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  }

  // ==================== CART MANAGEMENT ====================

  function loadCart() {
    try {
      const cart = localStorage.getItem(STORAGE_KEYS.CART);
      state.cart = cart ? JSON.parse(cart) : [];
    } catch (e) {
      state.cart = [];
    }
    return state.cart;
  }

  function saveCart() {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(state.cart));
  }

  function addToCart(product, quantity = 1) {
    const existingIndex = state.cart.findIndex(item => item.id === product.id);
    
    if (existingIndex >= 0) {
      state.cart[existingIndex].quantity += quantity;
    } else {
      state.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        farmerName: product.farmerName,
        farmerId: product.farmerId,
        image: product.image,
        quantity: quantity,
        stock: product.stock || 99
      });
    }
    
    saveCart();
    updateCartBadge();
    return state.cart;
  }

  function removeFromCart(productId) {
    state.cart = state.cart.filter(item => item.id !== productId);
    saveCart();
    updateCartBadge();
    return state.cart;
  }

  function updateCartQuantity(productId, quantity) {
    const item = state.cart.find(item => item.id === productId);
    if (item) {
      item.quantity = Math.max(1, Math.min(quantity, item.stock || 99));
    }
    saveCart();
    updateCartBadge();
    return state.cart;
  }

  function getCartTotal() {
    return state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  function getCartCount() {
    return state.cart.reduce((count, item) => count + item.quantity, 0);
  }

  function clearCart() {
    state.cart = [];
    saveCart();
    updateCartBadge();
  }

  // ==================== UI HELPERS ====================

  function updateCartBadge() {
    const count = getCartCount();
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="loading-skeleton">
        ${Array(6).fill(`
          <div class="skeleton-card">
            <div class="skeleton-image"></div>
            <div class="skeleton-content">
              <div class="skeleton-title"></div>
              <div class="skeleton-text"></div>
              <div class="skeleton-text short"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function showError(containerId, message, retryCallback) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="error-state">
        <i class="ph ph-warning-circle"></i>
        <h3>Oops! Something went wrong</h3>
        <p>${message || 'We couldn\'t load the data. Please try again.'}</p>
        <button class="btn-primary" onclick="${retryCallback}">
          <i class="ph ph-arrow-counter-clockwise"></i>
          Try Again
        </button>
      </div>
    `;
  }

  function showEmptyState(containerId, icon, title, message, actionText, actionCallback) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="empty-state">
        <i class="ph ${icon}"></i>
        <h3>${title}</h3>
        <p>${message}</p>
        ${actionText ? `<button class="btn-primary" onclick="${actionCallback}">${actionText}</button>` : ''}
      </div>
    `;
  }

  // ==================== NAVIGATION ====================

  function navigateTo(page, params = {}) {
    const pages = {
      'dashboard': 'buyer-dashboard.html',
      'search': 'buyer-search.html',
      'product-details': 'product-details.html',
      'orders': 'buyer-orders.html',
      'checkout': 'checkout.html',
      'chat': 'buyer-chat.html',
      'profile': 'buyer-profile.html'
    };

    const url = pages[page];
    if (url) {
      if (Object.keys(params).length > 0) {
        const queryString = new URLSearchParams(params).toString();
        window.location.href = `${url}?${queryString}`;
      } else {
        window.location.href = url;
      }
    }
  }

  function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return Object.fromEntries(params.entries());
  }

  // ==================== PRODUCT CARD RENDERER ====================

  function renderProductCard(product, showAddToCart = true) {
    const inCart = state.cart.find(item => item.id === product.id);
    const cartQuantity = inCart ? inCart.quantity : 0;

    return `
      <article class="product-card" data-product-id="${product.id}">
        <div class="product-image">
          ${product.image 
            ? `<img src="${product.image}" alt="${product.name}" loading="lazy" />`
            : `<div class="product-image-placeholder">
                <i class="ph ph-plant"></i>
               </div>`
          }
          ${product.available === false ? '<div class="product-badge unavailable">Out of Stock</div>' : ''}
          ${product.stock < 10 && product.available ? '<div class="product-badge low-stock">Low Stock</div>' : ''}
        </div>
        
        <div class="product-content">
          <div class="product-header">
            <h3 class="product-name">${product.name || 'Fresh Produce'}</h3>
            <div class="product-rating">
              ${renderStarRating(product.rating)}
              <span class="rating-value">${(product.rating || 0).toFixed(1)}</span>
            </div>
          </div>
          
          <p class="product-farmer">
            <i class="ph ph-user"></i>
            ${product.farmerName || 'HarvConnect Farmer'}
          </p>
          
          <p class="product-location">
            <i class="ph ph-map-pin"></i>
            ${product.location || 'Location pending'}
          </p>
          
          <div class="product-footer">
            <div class="product-price">
              <span class="price-amount">${formatPrice(product.price)}</span>
              <span class="price-unit">/ ${product.unit || 'unit'}</span>
            </div>
            
            <div class="product-actions">
              <button class="btn-secondary view-details-btn" data-product-id="${product.id}">
                <i class="ph ph-eye"></i>
                View
              </button>
              ${showAddToCart && product.available !== false ? `
                <button class="btn-primary add-to-cart-btn" data-product-id="${product.id}" ${cartQuantity > 0 ? 'disabled' : ''}>
                  <i class="ph ph-shopping-cart"></i>
                  ${cartQuantity > 0 ? `In Cart (${cartQuantity})` : 'Add'}
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function renderProductCards(products, containerId, showAddToCart = true) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!products || products.length === 0) {
      showEmptyState(
        containerId,
        'ph-package',
        'No Products Found',
        'We couldn\'t find any products matching your criteria.',
        'Browse All',
        'BuyerApp.navigateTo("dashboard")'
      );
      return;
    }

    const fragment = document.createDocumentFragment();
    const wrapper = document.createElement('div');
    wrapper.className = 'products-grid';
    wrapper.innerHTML = products.map(product => renderProductCard(product, showAddToCart)).join('');
    fragment.appendChild(wrapper);
    container.innerHTML = '';
    container.appendChild(fragment);

    // Attach event listeners
    attachProductCardListeners(container);
  }

  function attachProductCardListeners(container) {
    // Make entire product card clickable
    container.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // Don't navigate if clicking on a button
        if (e.target.closest('button')) {
          return;
        }
        const productId = card.dataset.productId;
        navigateTo('product-details', { id: productId });
      });
    });

    // Add to cart buttons
    container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const productId = btn.dataset.productId;
        const product = state.products.find(p => p.id === productId) || 
                       DEMO_PRODUCTS.find(p => p.id === productId);
        
        if (product) {
          addToCart(product);
          // Re-render to update button state
          renderProductCards(state.products, 'produceGrid');
          
          // Show notification
          showNotification(`${product.name} added to cart!`, 'success');
        }
      });
    });
  }

  // ==================== NOTIFICATIONS ====================

  function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer') || createNotificationContainer();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <i class="ph ph-${type === 'success' ? 'check-circle' : type === 'error' ? 'warning-circle' : 'info'}"></i>
      <span>${message}</span>
    `;
    
    container.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto remove
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notificationContainer';
    container.className = 'notification-container';
    document.body.appendChild(container);
    return container;
  }

  // ==================== INITIALIZATION ====================

  function init() {
    loadCart();
    state.user = getUser();
    updateCartBadge();
  }

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ==================== PUBLIC API ====================

  return {
    // State
    state,
    CATEGORIES,
    DEMO_PRODUCTS,
    
    // Auth
    getToken,
    getUser,
    getUserRole,
    isAuthenticated,
    requireAuth,
    logout,
    
    // API
    apiRequest,
    fetchProducts,
    fetchProduct,
    fetchOrders,
    createOrder,
    
    // Cart
    loadCart,
    saveCart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    getCartTotal,
    getCartCount,
    clearCart,
    
    // UI
    formatPrice,
    getInitials,
    getFirstName,
    renderStarRating,
    renderProductCard,
    renderProductCards,
    showLoading,
    showError,
    showEmptyState,
    showNotification,
    
    // Navigation
    navigateTo,
    getUrlParams,
    
    // Utilities
    debounce
  };
})();

// Expose to global scope
window.BuyerApp = BuyerApp;