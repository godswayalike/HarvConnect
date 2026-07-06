// product-details.js
// HarvConnect Product Details Page

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

  // ==================== LOAD PRODUCT ====================
  await loadProductDetails();

  // ==================== SETUP EVENT LISTENERS ====================
  setupEventListeners();
});

// ==================== PRODUCT LOADING ====================

async function loadProductDetails() {
  const container = document.getElementById('productDetails');
  if (!container) return;

  // Get product ID from URL
  const params = BuyerApp.getUrlParams();
  const productId = params.id;

  if (!productId) {
    BuyerApp.showError('productDetails', 'No product specified.', 'BuyerApp.navigateTo("dashboard")');
    return;
  }

  // Show loading
  BuyerApp.showLoading('productDetails');
  container.setAttribute('aria-busy', 'true');

  try {
    // Fetch product
    const product = await BuyerApp.fetchProduct(productId);
    
    if (!product) {
      throw new Error('Product not found');
    }

    // Store in state
    BuyerApp.state.currentProduct = product;

    // Render product details
    renderProductDetails(product);
    
    container.setAttribute('aria-busy', 'false');
  } catch (error) {
    console.error('Failed to load product details:', error);
    
    // Try demo data
    const demoProduct = BuyerApp.DEMO_PRODUCTS.find(p => p.id === productId);
    if (demoProduct) {
      renderProductDetails(demoProduct);
      container.setAttribute('aria-busy', 'false');
    } else {
      BuyerApp.showError(
        'productDetails', 
        'Unable to load product details. Please try again.',
        'loadProductDetails()'
      );
      container.setAttribute('aria-busy', 'false');
    }
  }
}

// ==================== RENDER PRODUCT DETAILS ====================

function renderProductDetails(product) {
  const container = document.getElementById('productDetails');
  if (!container) return;

  const inCart = BuyerApp.state.cart.find(item => item.id === product.id);
  const cartQuantity = inCart ? inCart.quantity : 0;

  container.innerHTML = `
    <div class="product-detail-container">
      <!-- Back Button -->
      <button class="back-button" onclick="history.back()">
        <i class="ph ph-arrow-left"></i>
        <span>Back</span>
      </button>

      <!-- Product Main Content -->
      <div class="product-detail-main">
        <!-- Product Image -->
        <div class="product-detail-image">
          ${product.image 
            ? `<img src="${product.image}" alt="${product.name}" />`
            : `<div class="product-image-placeholder">
                <i class="ph ph-plant"></i>
               </div>`
          }
          ${product.available === false ? '<div class="product-badge unavailable">Out of Stock</div>' : ''}
          ${product.stock < 10 && product.available ? '<div class="product-badge low-stock">Low Stock</div>' : ''}
        </div>

        <!-- Product Info -->
        <div class="product-detail-info">
          <div class="product-detail-header">
            <h1 class="product-detail-name">${product.name || 'Fresh Produce'}</h1>
            <div class="product-detail-rating">
              ${BuyerApp.renderStarRating(product.rating)}
              <span class="rating-value">${(product.rating || 0).toFixed(1)}</span>
              <span class="rating-count">(24 reviews)</span>
            </div>
          </div>

          <div class="product-detail-meta">
            <div class="meta-item">
              <i class="ph ph-user"></i>
              <div>
                <p class="meta-label">Farmer</p>
                <p class="meta-value">${product.farmerName || 'HarvConnect Farmer'}</p>
              </div>
            </div>
            <div class="meta-item">
              <i class="ph ph-map-pin"></i>
              <div>
                <p class="meta-label">Location</p>
                <p class="meta-value">${product.location || 'Location pending'}</p>
              </div>
            </div>
            <div class="meta-item">
              <i class="ph ph-package"></i>
              <div>
                <p class="meta-label">Category</p>
                <p class="meta-value">${product.category || 'Fresh Produce'}</p>
              </div>
            </div>
            <div class="meta-item">
              <i class="ph ph-thermometer"></i>
              <div>
                <p class="meta-label">Availability</p>
                <p class="meta-value">${product.available !== false ? 'In Stock' : 'Out of Stock'}</p>
              </div>
            </div>
          </div>

          <div class="product-detail-description">
            <h3>Description</h3>
            <p>${product.description || 'Fresh, high-quality produce sourced directly from local farmers. Perfect for your daily cooking needs.'}</p>
          </div>

          <div class="product-detail-pricing">
            <div class="price-main">
              <span class="price-amount">${BuyerApp.formatPrice(product.price)}</span>
              <span class="price-unit">/ ${product.unit || 'unit'}</span>
            </div>
            ${product.stock ? `<p class="stock-info">${product.stock} units available</p>` : ''}
          </div>

          <div class="product-detail-actions">
            <div class="quantity-selector">
              <button class="quantity-btn" id="decreaseQty" ${cartQuantity === 0 ? 'disabled' : ''}>
                <i class="ph ph-minus"></i>
              </button>
              <input 
                type="number" 
                id="quantityInput" 
                class="quantity-input" 
                value="${cartQuantity || 1}" 
                min="1" 
                max="${product.stock || 99}"
                ${product.available === false ? 'disabled' : ''}
              />
              <button class="quantity-btn" id="increaseQty" ${cartQuantity >= (product.stock || 99) ? 'disabled' : ''}>
                <i class="ph ph-plus"></i>
              </button>
            </div>
            
            <button 
              class="btn btn-primary btn-lg add-to-cart-main" 
              id="addToCartBtn"
              ${product.available === false ? 'disabled' : ''}
            >
              <i class="ph ph-shopping-cart"></i>
              ${product.available === false ? 'Out of Stock' : cartQuantity > 0 ? `Add ${cartQuantity} More` : 'Add to Cart'}
            </button>

            <button class="btn btn-secondary btn-lg" id="buyNowBtn" ${product.available === false ? 'disabled' : ''}>
              <i class="ph ph-lightning"></i>
              Buy Now
            </button>
          </div>

          <div class="product-detail-features">
            <div class="feature">
              <i class="ph ph-truck"></i>
              <span>Fast Delivery</span>
            </div>
            <div class="feature">
              <i class="ph ph-shield-check"></i>
              <span>Quality Assured</span>
            </div>
            <div class="feature">
              <i class="ph ph-arrow-u-up-left"></i>
              <span>Fresh from Farm</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Products -->
      <div class="related-products-section" id="relatedProducts">
        <div class="section-header">
          <h2>You May Also Like</h2>
        </div>
        <div class="products-grid" id="relatedGrid">
          <!-- Related products rendered here -->
        </div>
      </div>
    </div>
  `;

  // Load related products
  loadRelatedProducts(product);
}

// ==================== RELATED PRODUCTS ====================

function loadRelatedProducts(currentProduct) {
  const relatedGrid = document.getElementById('relatedGrid');
  if (!relatedGrid) return;

  // Get products from same category, excluding current
  const related = BuyerApp.state.products
    .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
    .slice(0, 4);

  if (related.length === 0) {
    // If no related by category, show random products
    const random = BuyerApp.state.products
      .filter(p => p.id !== currentProduct.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
    
    BuyerApp.renderProductCards(random, 'relatedGrid');
  } else {
    BuyerApp.renderProductCards(related, 'relatedGrid');
  }
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
  // Quantity controls
  const decreaseBtn = document.getElementById('decreaseQty');
  const increaseBtn = document.getElementById('increaseQty');
  const quantityInput = document.getElementById('quantityInput');

  if (decreaseBtn && quantityInput) {
    decreaseBtn.addEventListener('click', () => {
      const current = parseInt(quantityInput.value) || 1;
      if (current > 1) {
        quantityInput.value = current - 1;
        updateAddToCartButton();
      }
    });
  }

  if (increaseBtn && quantityInput) {
    increaseBtn.addEventListener('click', () => {
      const current = parseInt(quantityInput.value) || 1;
      const max = parseInt(quantityInput.max) || 99;
      if (current < max) {
        quantityInput.value = current + 1;
        updateAddToCartButton();
      }
    });
  }

  if (quantityInput) {
    quantityInput.addEventListener('change', () => {
      const min = parseInt(quantityInput.min) || 1;
      const max = parseInt(quantityInput.max) || 99;
      let value = parseInt(quantityInput.value) || min;
      value = Math.max(min, Math.min(value, max));
      quantityInput.value = value;
      updateAddToCartButton();
    });
  }

  // Add to cart button
  const addToCartBtn = document.getElementById('addToCartBtn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      const product = BuyerApp.state.currentProduct;
      const quantity = parseInt(quantityInput?.value) || 1;
      
      if (product) {
        BuyerApp.addToCart(product, quantity);
        updateAddToCartButton();
        BuyerApp.showNotification(`${product.name} added to cart!`, 'success');
      }
    });
  }

  // Buy now button
  const buyNowBtn = document.getElementById('buyNowBtn');
  if (buyNowBtn) {
    buyNowBtn.addEventListener('click', () => {
      const product = BuyerApp.state.currentProduct;
      const quantity = parseInt(quantityInput?.value) || 1;
      
      if (product) {
        BuyerApp.addToCart(product, quantity);
        BuyerApp.navigateTo('checkout');
      }
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

function updateAddToCartButton() {
  const addToCartBtn = document.getElementById('addToCartBtn');
  const quantityInput = document.getElementById('quantityInput');
  const product = BuyerApp.state.currentProduct;

  if (!addToCartBtn || !quantityInput || !product) return;

  const quantity = parseInt(quantityInput.value) || 1;
  const inCart = BuyerApp.state.cart.find(item => item.id === product.id);
  const cartQuantity = inCart ? inCart.quantity : 0;

  if (product.available === false) {
    addToCartBtn.disabled = true;
    addToCartBtn.innerHTML = '<i class="ph ph-shopping-cart"></i> Out of Stock';
  } else if (cartQuantity > 0) {
    addToCartBtn.disabled = false;
    addToCartBtn.innerHTML = `<i class="ph ph-shopping-cart"></i> Add ${quantity} More`;
  } else {
    addToCartBtn.disabled = false;
    addToCartBtn.innerHTML = '<i class="ph ph-shopping-cart"></i> Add to Cart';
  }
}

// ==================== EXPORT FOR GLOBAL ACCESS ====================

window.loadProductDetails = loadProductDetails;