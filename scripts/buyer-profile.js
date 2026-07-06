// buyer-profile.js
// HarvConnect Buyer Profile Page

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

  // ==================== LOAD PROFILE ====================
  await loadProfile();

  // ==================== SETUP EVENT LISTENERS ====================
  setupEventListeners();
});

// ==================== PROFILE LOADING ====================

async function loadProfile() {
  const container = document.getElementById('profileContent');
  if (!container) return;

  // Show loading
  BuyerApp.showLoading('profileContent');

  try {
    // Fetch user profile from API
    const profile = await BuyerApp.apiRequest('/auth/me');
    renderProfile(container, profile);
  } catch (error) {
    console.error('Failed to load profile:', error);
    // Use cached user data
    const user = BuyerApp.getUser();
    renderProfile(container, user);
  }
}

function renderProfile(container, user) {
  if (!container) return;

  const fullName = user?.fullName || 'Buyer';
  const email = user?.email || 'buyer@example.com';
  const phone = user?.phone || 'Not provided';
  const location = user?.location || 'Not provided';
  const role = user?.role || 'BUYER';
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  }) : '2024';

  container.innerHTML = `
    <div class="profile-container">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="profile-avatar-large">
          ${BuyerApp.getInitials(fullName)}
        </div>
        <div class="profile-header-info">
          <h1>${fullName}</h1>
          <p class="profile-role">${role}</p>
          <p class="profile-member-since">Member since ${memberSince}</p>
        </div>
      </div>

      <!-- Profile Sections -->
      <div class="profile-sections">
        <!-- Personal Information -->
        <div class="profile-section">
          <div class="section-header">
            <h2>
              <i class="ph ph-user"></i>
              Personal Information
            </h2>
            <button class="section-action" id="editPersonalBtn">
              <i class="ph ph-pencil-simple"></i>
              Edit
            </button>
          </div>
          
          <div class="profile-info-grid" id="personalInfo">
            <div class="info-item">
              <label>Full Name</label>
              <p>${fullName}</p>
            </div>
            <div class="info-item">
              <label>Email</label>
              <p>${email}</p>
            </div>
            <div class="info-item">
              <label>Phone</label>
              <p>${phone}</p>
            </div>
            <div class="info-item">
              <label>Location</label>
              <p>${location}</p>
            </div>
          </div>

          <!-- Edit Form (Hidden by default) -->
          <form class="profile-edit-form" id="personalEditForm" style="display: none;">
            <div class="form-group">
              <label class="form-label" for="editFullName">Full Name</label>
              <input type="text" class="form-input" id="editFullName" value="${fullName}" />
            </div>
            <div class="form-group">
              <label class="form-label" for="editPhone">Phone</label>
              <input type="tel" class="form-input" id="editPhone" value="${phone === 'Not provided' ? '' : phone}" />
            </div>
            <div class="form-group">
              <label class="form-label" for="editLocation">Location</label>
              <input type="text" class="form-input" id="editLocation" value="${location === 'Not provided' ? '' : location}" />
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" id="cancelEditBtn">Cancel</button>
              <button type="submit" class="btn btn-primary">
                <i class="ph ph-check"></i>
                Save Changes
              </button>
            </div>
          </form>
        </div>

        <!-- Account Settings -->
        <div class="profile-section">
          <div class="section-header">
            <h2>
              <i class="ph ph-gear"></i>
              Account Settings
            </h2>
          </div>
          
          <div class="settings-list">
            <div class="setting-item">
              <div class="setting-info">
                <i class="ph ph-bell"></i>
                <div>
                  <h4>Notifications</h4>
                  <p>Manage your notification preferences</p>
                </div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" checked />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <i class="ph ph-envelope"></i>
                <div>
                  <h4>Email Notifications</h4>
                  <p>Receive order updates via email</p>
                </div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" checked />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <i class="ph ph-shield-check"></i>
                <div>
                  <h4>Two-Factor Authentication</h4>
                  <p>Add an extra layer of security</p>
                </div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- Delivery Addresses -->
        <div class="profile-section">
          <div class="section-header">
            <h2>
              <i class="ph ph-map-pin"></i>
              Delivery Addresses
            </h2>
            <button class="section-action" id="addAddressBtn">
              <i class="ph ph-plus"></i>
              Add New
            </button>
          </div>
          
          <div class="addresses-list" id="addressesList">
            <div class="address-card">
              <div class="address-header">
                <h4>Home</h4>
                <span class="address-badge default">Default</span>
              </div>
              <p>123 Main Street, Accra, Ghana</p>
              <p>024 123 4567</p>
            </div>
            <div class="address-card">
              <div class="address-header">
                <h4>Work</h4>
              </div>
              <p>456 Business Ave, Accra, Ghana</p>
              <p>024 987 6543</p>
            </div>
          </div>
        </div>

        <!-- Order Statistics -->
        <div class="profile-section">
          <div class="section-header">
            <h2>
              <i class="ph ph-chart-bar"></i>
              Order Statistics
            </h2>
          </div>
          
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="ph ph-shopping-cart"></i>
              </div>
              <div class="stat-info">
                <h3>${user?.orderCount || 0}</h3>
                <p>Total Orders</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <i class="ph ph-currency-ghana"></i>
              </div>
              <div class="stat-info">
                <h3>${BuyerApp.formatPrice(user?.totalSpent || 0)}</h3>
                <p>Total Spent</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <i class="ph ph-star"></i>
              </div>
              <div class="stat-info">
                <h3>${(user?.averageRating || 0).toFixed(1)}</h3>
                <p>Average Rating</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <i class="ph ph-calendar-check"></i>
              </div>
              <div class="stat-info">
                <h3>${user?.memberSince || memberSince}</h3>
                <p>Member Since</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="profile-section danger-zone">
          <div class="section-header">
            <h2>
              <i class="ph ph-warning"></i>
              Danger Zone
            </h2>
          </div>
          
          <div class="danger-actions">
            <div class="danger-item">
              <div>
                <h4>Delete Account</h4>
                <p>Permanently delete your account and all data</p>
              </div>
              <button class="btn btn-danger" id="deleteAccountBtn">
                <i class="ph ph-trash"></i>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Setup edit functionality
  setupEditFunctionality();
}

// ==================== EDIT FUNCTIONALITY ====================

function setupEditFunctionality() {
  const editPersonalBtn = document.getElementById('editPersonalBtn');
  const personalInfo = document.getElementById('personalInfo');
  const personalEditForm = document.getElementById('personalEditForm');
  const cancelEditBtn = document.getElementById('cancelEditBtn');

  if (editPersonalBtn && personalInfo && personalEditForm) {
    editPersonalBtn.addEventListener('click', () => {
      personalInfo.style.display = 'none';
      personalEditForm.style.display = 'block';
      editPersonalBtn.style.display = 'none';
    });
  }

  if (cancelEditBtn && personalInfo && personalEditForm) {
    cancelEditBtn.addEventListener('click', () => {
      personalInfo.style.display = 'block';
      personalEditForm.style.display = 'none';
      editPersonalBtn.style.display = 'flex';
    });
  }

  // Form submission
  const personalEditFormEl = document.getElementById('personalEditForm');
  if (personalEditFormEl) {
    personalEditFormEl.addEventListener('submit', async (e) => {
      e.preventDefault();

      const fullName = document.getElementById('editFullName')?.value.trim();
      const phone = document.getElementById('editPhone')?.value.trim();
      const location = document.getElementById('editLocation')?.value.trim();

      try {
        // Update profile via API
        await BuyerApp.apiRequest('/profile/buyer', {
          method: 'PATCH',
          body: JSON.stringify({
            fullName,
            phone,
            location
          })
        });

        BuyerApp.showNotification('Profile updated successfully!', 'success');

        // Reload profile
        await loadProfile();
      } catch (error) {
        console.error('Failed to update profile:', error);
        BuyerApp.showNotification('Unable to update profile. Please try again.', 'error');
      }
    });
  }

  // Delete account button
  const deleteAccountBtn = document.getElementById('deleteAccountBtn');
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        if (confirm('This will permanently delete all your data. Are you absolutely sure?')) {
          BuyerApp.showNotification('Account deletion is not available in demo mode', 'info');
        }
      }
    });
  }

  // Add address button
  const addAddressBtn = document.getElementById('addAddressBtn');
  if (addAddressBtn) {
    addAddressBtn.addEventListener('click', () => {
      BuyerApp.showNotification('Address management coming soon!', 'info');
    });
  }
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
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

// ==================== EXPORT FOR GLOBAL ACCESS ====================

window.loadProfile = loadProfile;