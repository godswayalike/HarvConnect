// buyer-orders.js
// HarvConnect Buyer Orders Page

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

  // ==================== LOAD ORDERS ====================
  await loadOrders();

  // ==================== SETUP EVENT LISTENERS ====================
  setupEventListeners();
});

// ==================== ORDER LOADING ====================

async function loadOrders() {
  const ordersList = document.getElementById('ordersList');
  if (!ordersList) return;

  // Show loading
  BuyerApp.showLoading('ordersList');
  ordersList.setAttribute('aria-busy', 'true');

  try {
    // Fetch orders from API
    const orders = await BuyerApp.fetchOrders();
    BuyerApp.state.orders = orders;

    // Render orders
    renderOrders(orders);
    
    ordersList.setAttribute('aria-busy', 'false');
  } catch (error) {
    console.error('Failed to load orders:', error);
    renderDemoOrders();
    ordersList.setAttribute('aria-busy', 'false');
  }
}

function renderOrders(orders) {
  const ordersList = document.getElementById('ordersList');
  if (!ordersList) return;

  // Get active tab
  const activeTab = document.querySelector('.order-tab.active');
  const tabType = activeTab?.dataset.tab || 'ongoing';

  // Filter orders by status
  let filteredOrders = orders;
  if (tabType === 'ongoing') {
    filteredOrders = orders.filter(o => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status?.toLowerCase()));
  } else if (tabType === 'completed') {
    filteredOrders = orders.filter(o => o.status?.toLowerCase() === 'delivered');
  } else if (tabType === 'cancelled') {
    filteredOrders = orders.filter(o => ['cancelled', 'refunded'].includes(o.status?.toLowerCase()));
  }

  // Show empty state if no orders
  if (filteredOrders.length === 0) {
    const emptyMessages = {
      ongoing: { icon: 'ph-clock', title: 'No Ongoing Orders', message: 'You don\'t have any ongoing orders. Start shopping to place your first order!' },
      completed: { icon: 'ph-check-circle', title: 'No Completed Orders', message: 'You haven\'t completed any orders yet.' },
      cancelled: { icon: 'ph-x-circle', title: 'No Cancelled Orders', message: 'You don\'t have any cancelled orders.' }
    };

    const empty = emptyMessages[tabType];
    BuyerApp.showEmptyState(
      'ordersList',
      empty.icon,
      empty.title,
      empty.message,
      tabType === 'ongoing' ? 'Start Shopping' : 'Browse Products',
      tabType === 'ongoing' ? 'BuyerApp.navigateTo("dashboard")' : 'BuyerApp.navigateTo("search")'
    );
    return;
  }

  // Render orders
  const ordersHTML = filteredOrders.map(order => renderOrderCard(order)).join('');
  ordersList.innerHTML = `<div class="orders-container">${ordersHTML}</div>`;

  // Attach event listeners
  attachOrderEventListeners(ordersList);
}

function renderOrderCard(order) {
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const statusColors = {
    pending: 'warning',
    confirmed: 'info',
    processing: 'info',
    shipped: 'info',
    delivered: 'success',
    cancelled: 'error',
    refunded: 'error'
  };

  const statusColor = statusColors[order.status?.toLowerCase()] || 'info';

  return `
    <div class="order-card" data-order-id="${order.id}">
      <div class="order-header">
        <div class="order-info">
          <h3 class="order-id">Order #${order.id?.slice(-8) || 'Unknown'}</h3>
          <p class="order-date">${orderDate}</p>
        </div>
        <span class="order-status status-${statusColor}">${order.status || 'Pending'}</span>
      </div>

      <div class="order-items">
        ${(order.items || []).map(item => `
          <div class="order-item">
            <div class="item-image">
              ${item.image 
                ? `<img src="${item.image}" alt="${item.name}" />`
                : `<div class="item-image-placeholder"><i class="ph ph-package"></i></div>`
              }
            </div>
            <div class="item-details">
              <h4>${item.name || 'Product'}</h4>
              <p>Qty: ${item.quantity || 1} × ${BuyerApp.formatPrice(item.price)}</p>
            </div>
            <div class="item-total">
              ${BuyerApp.formatPrice((item.price || 0) * (item.quantity || 1))}
            </div>
          </div>
        `).join('')}
      </div>

      <div class="order-footer">
        <div class="order-total">
          <span>Total:</span>
          <span class="total-amount">${BuyerApp.formatPrice(order.total || order.amount || 0)}</span>
        </div>
        <div class="order-actions">
          ${order.status?.toLowerCase() === 'delivered' ? `
            <button class="btn btn-secondary btn-sm reorder-btn" data-order-id="${order.id}">
              <i class="ph ph-arrow-counter-clockwise"></i>
              Reorder
            </button>
          ` : ''}
          ${['pending', 'confirmed'].includes(order.status?.toLowerCase()) ? `
            <button class="btn btn-ghost btn-sm cancel-order-btn" data-order-id="${order.id}">
              <i class="ph ph-x"></i>
              Cancel
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

function renderDemoOrders() {
  const ordersList = document.getElementById('ordersList');
  if (!ordersList) return;

  const demoOrders = [
    {
      id: 'demo-order-1',
      status: 'processing',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      items: [
        { name: 'Fresh Tomatoes', price: 80, quantity: 2, image: null },
        { name: 'Organic Pepper', price: 120, quantity: 1, image: null }
      ],
      total: 280
    },
    {
      id: 'demo-order-2',
      status: 'delivered',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      items: [
        { name: 'Garden Eggs', price: 95, quantity: 1, image: null }
      ],
      total: 95
    }
  ];

  BuyerApp.state.orders = demoOrders;
  renderOrders(demoOrders);
}

// ==================== EVENT LISTENERS ====================

function attachOrderEventListeners(container) {
  // Reorder buttons
  container.querySelectorAll('.reorder-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const orderId = btn.dataset.orderId;
      await reorderItems(orderId);
    });
  });

  // Cancel order buttons
  container.querySelectorAll('.cancel-order-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const orderId = btn.dataset.orderId;
      if (confirm('Are you sure you want to cancel this order?')) {
        await cancelOrder(orderId);
      }
    });
  });
}

function setupEventListeners() {
  // Order tabs
  const orderTabs = document.querySelectorAll('.order-tab');
  orderTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      orderTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Re-render orders
      renderOrders(BuyerApp.state.orders);
    });
  });

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

  // Search input
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = e.target.value.trim();
        if (query) {
          BuyerApp.navigateTo('search', { q: query });
        }
      }
    });
  }
}

// ==================== ORDER ACTIONS ====================

async function reorderItems(orderId) {
  const order = BuyerApp.state.orders.find(o => o.id === orderId);
  if (!order || !order.items) {
    BuyerApp.showNotification('Unable to reorder items', 'error');
    return;
  }

  // Add items to cart
  order.items.forEach(item => {
    const product = {
      id: item.productId || item.id,
      name: item.name,
      price: item.price,
      unit: item.unit || 'unit',
      farmerName: item.farmerName || 'Unknown',
      stock: 99
    };
    BuyerApp.addToCart(product, item.quantity || 1);
  });

  BuyerApp.showNotification('Items added to cart!', 'success');
  
  // Navigate to checkout
  setTimeout(() => {
    BuyerApp.navigateTo('checkout');
  }, 1000);
}

async function cancelOrder(orderId) {
  try {
    await BuyerApp.apiRequest(`/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'cancelled' })
    });

    BuyerApp.showNotification('Order cancelled successfully', 'success');
    
    // Refresh orders
    await loadOrders();
  } catch (error) {
    console.error('Failed to cancel order:', error);
    BuyerApp.showNotification('Unable to cancel order. Please try again.', 'error');
  }
}

// ==================== EXPORT FOR GLOBAL ACCESS ====================

window.loadOrders = loadOrders;
window.reorderItems = reorderItems;
window.cancelOrder = cancelOrder;