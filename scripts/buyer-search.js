// buyer-search.js
// HarvConnect Buyer Search Page - Advanced Search & Filtering

document.addEventListener('DOMContentLoaded', async () => {
  // ==================== AUTHENTICATION GUARD ====================
  if (!BuyerApp.requireAuth()) {
    return;
  }

  // ==================== INITIALIZATION ====================
  const user = BuyerApp.getUser();
  BuyerApp.state.user = user;
  
  // Update UI with user info
  const userInitials = document.getElementById('userInitials');
  if (userInitials) {
    userInitials.textContent = BuyerApp.getInitials(user?.fullName);
  }

  // ==================== LOAD DATA ====================
  await initializeSearchPage();

  // ==================== SETUP EVENT LISTENERS ====================
  setupEventListeners();
});

// ==================== INITIALIZATION ====================

async function initializeSearchPage() {
  const searchResults = document.getElementById('searchResults');
  if (!searchResults) return;

  // Show loading
  BuyerApp.showLoading('searchResults');
  searchResults.setAttribute('aria-busy', 'true');

  try {
    // Fetch products
    const products = await BuyerApp.fetchProducts();
    BuyerApp.state.products = products;

    // Populate filter dropdowns
    populateFilterDropdowns(products);

    // Check for URL parameters
    const params = BuyerApp.getUrlParams();
    const searchQuery = params.q || '';
    const categoryFilter = params.category || '';

    // Set search input if query provided
    if (searchQuery) {
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.value = searchQuery;
      }
      document.getElementById('searchTitle').textContent = `Search Results for "${searchQuery}"`;
    }

    // Apply filters and render
    applyFiltersAndRender(products, {
      query: searchQuery,
      category: categoryFilter
    });

    searchResults.setAttribute('aria-busy', 'false');
  } catch (error) {
    console.error('Failed to initialize search page:', error);
    BuyerApp.showError('searchResults', 'Unable to load products. Please try again.', 'initializeSearchPage()');
    searchResults.setAttribute('aria-busy', 'false');
  }
}

// ==================== FILTER LOGIC ====================

function populateFilterDropdowns(products) {
  // Populate farmers
  const farmerFilter = document.getElementById('farmerFilter');
  if (farmerFilter) {
    const farmers = [...new Set(products.map(p => p.farmerName).filter(Boolean))].sort();
    farmers.forEach(farmer => {
      const option = document.createElement('option');
      option.value = farmer;
      option.textContent = farmer;
      farmerFilter.appendChild(option);
    });
  }

  // Populate locations
  const locationFilter = document.getElementById('locationFilter');
  if (locationFilter) {
    const locations = [...new Set(products.map(p => p.location).filter(Boolean))].sort();
    locations.forEach(location => {
      const option = document.createElement('option');
      option.value = location;
      option.textContent = location;
      locationFilter.appendChild(option);
    });
  }
}

function applyFiltersAndRender(products, filters = {}) {
  let filtered = [...products];

  // Apply search query
  if (filters.query) {
    const searchTerm = filters.query.toLowerCase();
    filtered = filtered.filter(product => 
      product.name?.toLowerCase().includes(searchTerm) ||
      product.farmerName?.toLowerCase().includes(searchTerm) ||
      product.location?.toLowerCase().includes(searchTerm) ||
      product.category?.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm)
    );
  }

  // Apply category filter
  if (filters.category) {
    filtered = filtered.filter(product => product.category === filters.category);
  }

  // Apply farmer filter
  const farmerFilter = document.getElementById('farmerFilter');
  if (farmerFilter && farmerFilter.value) {
    filtered = filtered.filter(product => product.farmerName === farmerFilter.value);
  }

  // Apply location filter
  const locationFilter = document.getElementById('locationFilter');
  if (locationFilter && locationFilter.value) {
    filtered = filtered.filter(product => product.location === locationFilter.value);
  }

  // Apply sorting
  const sortFilter = document.getElementById('sortFilter');
  if (sortFilter && sortFilter.value) {
    filtered = sortProducts(filtered, sortFilter.value);
  }

  // Update results count
  const resultsCount = document.getElementById('resultsCount');
  if (resultsCount) {
    resultsCount.textContent = `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`;
  }

  // Update results title
  const resultsTitle = document.getElementById('resultsTitle');
  if (resultsTitle) {
    if (filters.query) {
      resultsTitle.textContent = `Search Results for "${filters.query}"`;
    } else if (filters.category) {
      const categoryName = BuyerApp.CATEGORIES.find(c => c.id === filters.category)?.name || filters.category;
      resultsTitle.textContent = categoryName;
    } else {
      resultsTitle.textContent = 'All Products';
    }
  }

  // Render results
  BuyerApp.renderProductCards(filtered, 'searchResults');

  // Show empty state if no results
  if (filtered.length === 0) {
    BuyerApp.showEmptyState(
      'searchResults',
      'ph-magnifying-glass',
      'No Products Found',
      'Try adjusting your filters or search terms to find what you\'re looking for.',
      'Clear Filters',
      'clearAllFilters()'
    );
  }
}

function sortProducts(products, sortBy) {
  const sorted = [...products];

  switch (sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    case 'price-high':
      return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    case 'rating':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'name':
      return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    case 'relevance':
    default:
      return sorted;
  }
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
  }

  // Category chips
  const categoriesContainer = document.getElementById('categoriesContainer');
  if (categoriesContainer) {
    renderCategories(categoriesContainer);
  }

  // Farmer filter
  const farmerFilter = document.getElementById('farmerFilter');
  if (farmerFilter) {
    farmerFilter.addEventListener('change', () => {
      applyFiltersAndRender(BuyerApp.state.products);
    });
  }

  // Location filter
  const locationFilter = document.getElementById('locationFilter');
  if (locationFilter) {
    locationFilter.addEventListener('change', () => {
      applyFiltersAndRender(BuyerApp.state.products);
    });
  }

  // Sort filter
  const sortFilter = document.getElementById('sortFilter');
  if (sortFilter) {
    sortFilter.addEventListener('change', () => {
      applyFiltersAndRender(BuyerApp.state.products);
    });
  }

  // Clear filters button
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', clearAllFilters);
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

// ==================== CATEGORY RENDERING ====================

function renderCategories(container) {
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
        
        // Apply category filter
        applyFiltersAndRender(BuyerApp.state.products, { category });
      } else {
        // If was active, show all
        applyFiltersAndRender(BuyerApp.state.products);
      }
    });
  });
}

// ==================== SEARCH FUNCTIONALITY ====================

function performSearch(query) {
  const searchInput = document.getElementById('searchInput');
  const searchTitle = document.getElementById('searchTitle');

  if (searchTitle && query) {
    searchTitle.textContent = `Search Results for "${query}"`;
  } else if (searchTitle) {
    searchTitle.textContent = 'Find Fresh Produce';
  }

  applyFiltersAndRender(BuyerApp.state.products, { query });
}

// ==================== FILTER MANAGEMENT ====================

function clearAllFilters() {
  // Clear search input
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.value = '';
  }

  // Clear category selection
  const categoriesContainer = document.getElementById('categoriesContainer');
  if (categoriesContainer) {
    categoriesContainer.querySelectorAll('.category-chip').forEach(chip => {
      chip.classList.remove('active');
      chip.setAttribute('aria-selected', 'false');
    });
  }

  // Clear dropdowns
  const farmerFilter = document.getElementById('farmerFilter');
  if (farmerFilter) {
    farmerFilter.value = '';
  }

  const locationFilter = document.getElementById('locationFilter');
  if (locationFilter) {
    locationFilter.value = '';
  }

  const sortFilter = document.getElementById('sortFilter');
  if (sortFilter) {
    sortFilter.value = 'relevance';
  }

  // Reset title
  const searchTitle = document.getElementById('searchTitle');
  if (searchTitle) {
    searchTitle.textContent = 'Find Fresh Produce';
  }

  // Re-render all products
  applyFiltersAndRender(BuyerApp.state.products);

  BuyerApp.showNotification('Filters cleared', 'info');
}

// ==================== EXPORT FOR GLOBAL ACCESS ====================

window.clearAllFilters = clearAllFilters;
window.performSearch = performSearch;