// checkout.js
// HarvConnect Checkout Page

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

  // ==================== LOAD CHECKOUT ====================
  await loadCheckout();

  // ==================== SETUP EVENT LISTENERS ====================
  setupEventListeners();
});

// ==================== CHECKOUT LOADING ====================

async function loadCheckout() {
  const container = document.getElementById('checkoutContent');
  if (!container) return;

  // Load cart
  BuyerApp.loadCart();

  // Check if cart is empty
  if (BuyerApp.state.cart.length === 0) {
    renderEmptyCart(container);
    return;
  }

  // Render checkout
  renderCheckout(container);
}

function renderEmptyCart(container) {
  container.innerHTML = `
    <div class="checkout-container">
      <div class="welcome-card">
        <div class="welcome-content">
          <p class="eyebrow">Checkout</p>
          <h1>Your Cart is Empty</h1>
          <p class="welcome-copy">
            Looks like you haven't added any items to your cart yet. 
            Start shopping to fill it up!
          </p>
        </div>
      </div>

      <div class="empty-state">
        <i class="ph ph-shopping-cart"></i>
        <h3>No Items in Cart</h3>
        <p>Add some fresh produce to get started</p>
        <button class="btn btn-primary" onclick="BuyerApp.navigateTo('dashboard')">
          <i class="ph ph-squares-four"></i>
          Browse Products
        </button>
      </div>
    </div>
  `;
}

function renderCheckout(container) {
  const subtotal = BuyerApp.getCartTotal();
  const deliveryFee = subtotal > 500 ? 0 : 50; // Free delivery over GH₵ 500
  const total = subtotal + deliveryFee;

  container.innerHTML = `
    <div class="checkout-container">
      <!-- Checkout Header -->
      <div class="welcome-card">
        <div class="welcome-content">
          <p class="eyebrow">Checkout</p>
          <h1>Complete Your Order</h1>
          <p class="welcome-copy">
            Review your items and proceed to payment.
          </p>
        </div>
      </div>

      <div class="checkout-main">
        <!-- Cart Items -->
        <div class="checkout-section">
          <h2 class="section-title">
            <i class="ph ph-shopping-cart"></i>
            Cart Items (${BuyerApp.getCartCount()})
          </h2>
          <div class="cart-items" id="cartItems">
            ${renderCartItems()}
          </div>
        </div>

        <!-- Delivery Information -->
        <div class="checkout-section">
          <h2 class="section-title">
            <i class="ph ph-map-pin"></i>
            Delivery Information
          </h2>
          <div class="form-group">
            <label class="form-label" for="deliveryAddress">Delivery Address</label>
            <textarea 
              class="form-textarea" 
              id="deliveryAddress" 
              placeholder="Enter your delivery address..."
              rows="3"
            ></textarea>
          </div>
          <div class="form-group">
            <label class="form-label" for="deliveryPhone">Phone Number</label>
            <input 
              type="tel" 
              class="form-input" 
              id="deliveryPhone" 
              placeholder="e.g., 024 123 4567"
            />
          </div>
          <div class="form-group">
            <label class="form-label" for="deliveryNotes">Delivery Notes (Optional)</label>
            <textarea 
              class="form-textarea" 
              id="deliveryNotes" 
              placeholder="Any special instructions..."
              rows="2"
            ></textarea>
          </div>
        </div>

        <!-- Payment Method -->
        <div class="checkout-section">
          <h2 class="section-title">
            <i class="ph ph-currency-ghana"></i>
            Payment Method
          </h2>
          <div class="payment-methods">
            <label class="payment-option">
              <input type="radio" name="paymentMethod" value="momo" checked />
              <div class="payment-card">
                <i class="ph ph-phone"></i>
                <div>
                  <h4>Mobile Money</h4>
                  <p>Pay with M-Pesa, MTN, Vodafone, AirtelTigo</p>
                </div>
              </div>
            </label>
            <label class="payment-option">
              <input type="radio" name="paymentMethod" value="cash" />
              <div class="payment-card">
                <i class="ph ph-money"></i>
                <div>
                  <h4>Cash on Delivery</h4>
                  <p>Pay when you receive your order</p>
                </div>
              </div>
            </label>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="checkout-section">
          <h2 class="section-title">
            <i class="ph ph-receipt"></i>
            Order Summary
          </h2>
          <div class="order-summary">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>${BuyerApp.formatPrice(subtotal)}</span>
            </div>
            <div class="summary-row">
              <span>Delivery Fee</span>
              <span>${deliveryFee === 0 ? '<span class="text-success">FREE</span>' : BuyerApp.formatPrice(deliveryFee)}</span>
            </div>
            ${deliveryFee > 0 ? `<p class="delivery-note">Free delivery on orders over GH₵ 500</p>` : ''}
            <div class="summary-row summary-total">
              <span>Total</span>
              <span>${BuyerApp.formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Checkout Actions -->
      <div class="checkout-actions">
        <button class="btn btn-secondary btn-lg" onclick="BuyerApp.navigateTo('dashboard')">
          <i class="ph ph-arrow-left"></i>
          Continue Shopping
        </button>
        <button class="btn btn-primary btn-lg" id="placeOrderBtn">
          <i class="ph ph-check-circle"></i>
          Place Order
        </button>
      </div>
    </div>
  `;

  // Setup payment method selection
  setupPaymentMethods();
}

function renderCartItems() {
  return BuyerApp.state.cart.map(item => `
    <div class="cart-item" data-product-id="${item.id}">
      <div class="cart-item-image">
        ${item.image 
          ? `<img src="${item.image}" alt="${item.name}" />`
          : `<div class="item-image-placeholder"><i class="ph ph-package"></i></div>`
        }
      </div>
      <div class="cart-item-details">
        <h4>${item.name}</h4>
        <p class="cart-item-farmer">${item.farmerName || 'HarvConnect Farmer'}</p>
        <p class="cart-item-price">${BuyerApp.formatPrice(item.price)} / ${item.unit || 'unit'}</p>
      </div>
      <div class="cart-item-quantity">
        <button class="quantity-btn" onclick="updateCartItemQuantity('${item.id}', -1)">
          <i class="ph ph-minus"></i>
        </button>
        <span class="quantity-value">${item.quantity}</span>
        <button class="quantity-btn" onclick="updateCartItemQuantity('${item.id}', 1)">
          <i class="ph ph-plus"></i>
        </button>
      </div>
      <div class="cart-item-total">
        ${BuyerApp.formatPrice(item.price * item.quantity)}
      </div>
      <button class="cart-item-remove" onclick="removeCartItem('${item.id}')">
        <i class="ph ph-trash"></i>
      </button>
    </div>
  `).join('');
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
  // Place order button
  const placeOrderBtn = document.getElementById('placeOrderBtn');
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', placeOrder);
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

function setupPaymentMethods() {
  const paymentOptions = document.querySelectorAll('.payment-option');
  paymentOptions.forEach(option => {
    option.addEventListener('click', () => {
      paymentOptions.forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
    });
  });
}

// ==================== CART MANAGEMENT ====================

function updateCartItemQuantity(productId, change) {
  const item = BuyerApp.state.cart.find(item => item.id === productId);
  if (!item) return;

  const newQuantity = item.quantity + change;
  
  if (newQuantity <= 0) {
    removeCartItem(productId);
  } else {
    BuyerApp.updateCartQuantity(productId, newQuantity);
    refreshCheckout();
  }
}

function removeCartItem(productId) {
  if (confirm('Remove this item from cart?')) {
    BuyerApp.removeFromCart(productId);
    refreshCheckout();
    BuyerApp.showNotification('Item removed from cart', 'info');
  }
}

function refreshCheckout() {
  const container = document.getElementById('checkoutContent');
  if (!container) return;

  if (BuyerApp.state.cart.length === 0) {
    renderEmptyCart(container);
  } else {
    renderCheckout(container);
  }
}

// ==================== ORDER PLACEMENT ====================

async function placeOrder() {
  const placeOrderBtn = document.getElementById('placeOrderBtn');
  if (!placeOrderBtn) return;

  // Validate form
  const deliveryAddress = document.getElementById('deliveryAddress')?.value.trim();
  const deliveryPhone = document.getElementById('deliveryPhone')?.value.trim();

  if (!deliveryAddress) {
    BuyerApp.showNotification('Please enter your delivery address', 'error');
    return;
  }

  if (!deliveryPhone) {
    BuyerApp.showNotification('Please enter your phone number', 'error');
    return;
  }

  // Get payment method
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'momo';

  // Disable button and show loading
  placeOrderBtn.disabled = true;
  placeOrderBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Placing Order...';

  try {
    // Create order
    const orderData = {
      items: BuyerApp.state.cart.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit,
        farmerId: item.farmerId,
        farmerName: item.farmerName
      })),
      deliveryAddress,
      deliveryPhone,
      deliveryNotes: document.getElementById('deliveryNotes')?.value || '',
      paymentMethod,
      total: BuyerApp.getCartTotal()
    };

    const order = await BuyerApp.createOrder(orderData);

    // Clear cart
    BuyerApp.clearCart();

    // Show success
    BuyerApp.showNotification('Order placed successfully!', 'success');

    // Navigate to orders page
    setTimeout(() => {
      BuyerApp.navigateTo('orders');
    }, 1500);

  } catch (error) {
    console.error('Failed to place order:', error);
    BuyerApp.showNotification('Unable to place order. Please try again.', 'error');
    
    // Re-enable button
    placeOrderBtn.disabled = false;
    placeOrderBtn.innerHTML = '<i class="ph ph-check-circle"></i> Place Order';
  }
}

// ==================== EXPORT FOR GLOBAL ACCESS ====================

window.updateCartItemQuantity = updateCartItemQuantity;
window.removeCartItem = removeCartItem;
window.placeOrder = placeOrder;