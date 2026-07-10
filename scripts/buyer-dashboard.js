// buyer-dashboard.js
// HarvConnect Buyer Dashboard - Main Controller

document.addEventListener('DOMContentLoaded', async () => {
  // ==================== AUTHENTICATION GUARD ====================
  if (!BuyerApp.requireAuth()) {
    return;
  }

  // ==================== INITIALIZATION ====================
  const user = BuyerApp.getUser();
  BuyerApp.state.user = user;
  
  // Update UI with user info
  const firstName = BuyerApp.getFirstName(user?.fullName);
  const welcomeMessage = document.getElementById('welcomeMessage');
  const userInitials = document.getElementById('userInitials');

  if (welcomeMessage) {
    welcomeMessage.textContent = `Welcome back, ${firstName}!`;
  }

  if (userInitials) {
    userInitials.textContent = BuyerApp.getInitials(user?.fullName);
  }

  // ==================== RENDER CATEGORIES ====================
  renderCategories();

  // ==================== LOAD PRODUCTS ====================
  await loadProducts();

  // ==================== SETUP EVENT LISTENERS ====================
  setupEventListeners();

  // ==================== DETECT LOCATION ====================
  detectUserLocation();
});

// ==================== CATEGORY RENDERING ====================

function renderCategories() {
  const container = document.getElementById('categoriesContainer');
  if (!container) return;

  const categoriesHTML = BuyerApp.CATEGORIES.map(category => `
    <button 
      class="category-chip" 
      data-category="${category.id}"
      role="tab"
      aria-selected="false"
      aria-label="Filter by ${category.name}"
    >
      <i class="ph ${category.icon}"></i>
      <span>${category.name}</span>
    </button>
  `).join('');

  container.innerHTML = categoriesHTML;

  // Add click handlers
  container.querySelectorAll('.category-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const category = chip.dataset.category;
      
      // Toggle active state
      const isActive = chip.classList.contains('active');
      
      // Remove active from all
      container.querySelectorAll('.category-chip').forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-selected', 'false');
      });
      
      // If wasn't active, make it active
      if (!isActive) {
        chip.classList.add('active');
        chip.setAttribute('aria-selected', 'true');
        filterByCategory(category);
      } else {
        // If was active, show all
        loadProducts();
      }
    });
  });
}

// ==================== PRODUCT LOADING ====================

async function loadProducts() {
  const grid = document.getElementById('produceGrid');
  if (!grid) return;

  // Show loading skeleton
  BuyerApp.showLoading('produceGrid');
  grid.setAttribute('aria-busy', 'true');

  try {
    const products = await BuyerApp.fetchProducts();
    BuyerApp.state.products = products;
    
    // Render products
    BuyerApp.renderProductCards(products, 'produceGrid');
    
    grid.setAttribute('aria-busy', 'false');
    
    // Load nearby products after main products load
    loadNearbyProducts();
  } catch (error) {
    console.error('Failed to load products:', error);
    BuyerApp.showError('produceGrid', 'Unable to load products. Please check your connection.', 'loadProducts()');
    grid.setAttribute('aria-busy', 'false');
  }
}

function filterByCategory(categoryId) {
  const grid = document.getElementById('produceGrid');
  if (!grid) return;

  // Show loading
  BuyerApp.showLoading('produceGrid');
  grid.setAttribute('aria-busy', 'true');

  // Simulate filtering (in real app, this would be an API call)
  setTimeout(() => {
    const filtered = BuyerApp.state.products.filter(product => 
      product.category === categoryId
    );
    
    BuyerApp.renderProductCards(filtered, 'produceGrid');
    grid.setAttribute('aria-busy', 'false');
  }, 300);
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
  // Search input with debounce
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    const debouncedSearch = BuyerApp.debounce((query) => {
      performSearch(query);
    }, 300);

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      debouncedSearch(query);
    });

    // Navigate to search page on Enter
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = e.target.value.trim();
        if (query) {
          BuyerApp.navigateTo('search', { q: query });
        } else {
          BuyerApp.navigateTo('search');
        }
      }
    });
  }

  // View All button
  const viewAllBtn = document.getElementById('viewAllBtn');
  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', () => {
      BuyerApp.navigateTo('search');
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to logout?')) {
        BuyerApp.logout();
      }
    });
  }

  // Notification bell
  const notificationBell = document.getElementById('notificationBell');
  if (notificationBell) {
    notificationBell.addEventListener('click', () => {
      BuyerApp.showNotification('No new notifications', 'info');
    });
  }
}

// ==================== SEARCH FUNCTIONALITY ====================

function performSearch(query) {
  if (!query) {
    loadProducts();
    return;
  }

  const grid = document.getElementById('produceGrid');
  if (!grid) return;

  grid.setAttribute('aria-busy', 'true');

  // Filter products locally
  const searchTerm = query.toLowerCase();
  const filtered = BuyerApp.state.products.filter(product => 
    product.name?.toLowerCase().includes(searchTerm) ||
    product.farmerName?.toLowerCase().includes(searchTerm) ||
    product.location?.toLowerCase().includes(searchTerm) ||
    product.category?.toLowerCase().includes(searchTerm)
  );

  BuyerApp.renderProductCards(filtered, 'produceGrid');
  grid.setAttribute('aria-busy', 'false');

  if (filtered.length === 0) {
    BuyerApp.showEmptyState(
      'produceGrid',
      'ph-magnifying-glass',
      'No Results Found',
      `We couldn't find any products matching "${query}". Try a different search term.`,
      'Clear Search',
      'document.getElementById("searchInput").value = ""; loadProducts();'
    );
  }
}

// ==================== LOCATION DETECTION ====================

function detectUserLocation() {
  const nearbySection = document.getElementById('nearbySection');
  const locationText = document.getElementById('locationText');
  
  if (!nearbySection || !locationText) return;

  if (!navigator.geolocation) {
    locationText.textContent = 'Location not available';
    return;
  }

  locationText.textContent = 'Detecting location...';

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      locationText.innerHTML = '<i class="ph ph-check-circle"></i> Location detected';
      
      // Show nearby section
      nearbySection.style.display = 'block';
      
      // Load nearby products (in real app, would use coordinates)
      loadNearbyProducts(latitude, longitude);
    },
    (error) => {
      console.warn('Geolocation error:', error);
      locationText.textContent = 'Location access denied';
      
      // Still show section with demo data
      nearbySection.style.display = 'block';
      loadNearbyProducts(null, null);
    },
    {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000
    }
  );
}

async function loadNearbyProducts(lat, lng) {
  const grid = document.getElementById('nearbyGrid');
  if (!grid) return;

  // Show loading
  BuyerApp.showLoading('nearbyGrid');

  // In a real app, this would filter by distance using coordinates
  // For now, just show a subset of products
  setTimeout(() => {
    const nearby = BuyerApp.state.products.slice(0, 3);
    BuyerApp.renderProductCards(nearby, 'nearbyGrid');
  }, 500);
}

// ==================== EXPORT FOR GLOBAL ACCESS ====================

window.loadProducts = loadProducts;
window.filterByCategory = filterByCategory;
window.performSearch = performSearch;
window.loadNearbyProducts = loadNearbyProducts;