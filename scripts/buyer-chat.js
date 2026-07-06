// buyer-chat.js
// HarvConnect Buyer Chat Page

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

  // ==================== LOAD CHAT ====================
  await loadChat();

  // ==================== SETUP EVENT LISTENERS ====================
  setupEventListeners();
});

// ==================== CHAT LOADING ====================

async function loadChat() {
  const conversationsList = document.getElementById('conversationsList');
  const chatArea = document.getElementById('chatArea');
  
  if (!conversationsList || !chatArea) return;

  // Show loading
  BuyerApp.showLoading('conversationsList');

  try {
    // Try to fetch conversations from API
    const response = await BuyerApp.apiRequest('/conversations');
    const conversations = response?.data?.conversations || response?.conversations || [];
    
    if (conversations.length > 0) {
      // Render conversations from API
      renderConversations(conversations);
      selectConversation(conversations[0]);
    } else {
      // No conversations - show coming soon message
      renderComingSoon(conversationsList, chatArea);
    }
  } catch (error) {
    // Chat API not available - show friendly placeholder
    console.warn('Chat feature not available:', error);
    renderComingSoon(conversationsList, chatArea);
  }
}

function renderComingSoon(conversationsList, chatArea) {
  // Show placeholder in conversations list
  conversationsList.innerHTML = `
    <div class="empty-state-small">
      <i class="ph ph-chat-circle-dots"></i>
      <p>Chat Coming Soon</p>
    </div>
  `;

  // Show placeholder in chat area
  chatArea.innerHTML = `
    <div class="chat-coming-soon">
      <div class="coming-soon-content">
        <i class="ph ph-chat-circle-dots"></i>
        <h3>Messaging Feature Coming Soon</h3>
        <p>We're working on a messaging system that will allow you to chat directly with farmers about their products, delivery details, and more.</p>
        <div class="coming-soon-features">
          <div class="feature-item">
            <i class="ph ph-check-circle"></i>
            <span>Direct farmer communication</span>
          </div>
          <div class="feature-item">
            <i class="ph ph-check-circle"></i>
            <span>Real-time messaging</span>
          </div>
          <div class="feature-item">
            <i class="ph ph-check-circle"></i>
            <span>Order updates and notifications</span>
          </div>
        </div>
        <button class="btn btn-primary" onclick="BuyerApp.navigateTo('dashboard')">
          <i class="ph ph-squares-four"></i>
          Browse Products
        </button>
      </div>
    </div>
  `;
}

// ==================== CONVERSATIONS ====================

async function loadDemoConversations() {
  // Demo conversations data - kept for reference but not used
  // Chat feature is disabled until backend API is available
  return [];
}

function renderConversations(conversations) {
  const container = document.getElementById('conversationsList');
  if (!container) return;

  if (conversations.length === 0) {
    container.innerHTML = `
      <div class="empty-state-small">
        <i class="ph ph-chat-circle-dots"></i>
        <p>No conversations yet</p>
      </div>
    `;
    return;
  }

  container.innerHTML = conversations.map(conv => `
    <div class="conversation-item ${conv.unread > 0 ? 'unread' : ''}" data-conversation-id="${conv.id}">
      <div class="conversation-avatar">
        ${conv.farmerAvatar 
          ? `<img src="${conv.farmerAvatar}" alt="${conv.farmerName}" />`
          : `<div class="avatar-placeholder">${conv.farmerName?.charAt(0) || 'F'}</div>`
        }
        ${conv.unread > 0 ? `<span class="unread-badge">${conv.unread}</span>` : ''}
      </div>
      <div class="conversation-content">
        <div class="conversation-header">
          <h4>${conv.farmerName || 'Farmer'}</h4>
          <span class="conversation-time">${formatTime(conv.lastMessageTime)}</span>
        </div>
        <p class="conversation-preview">${conv.lastMessage || 'No messages'}</p>
      </div>
    </div>
  `).join('');

  // Add click handlers
  container.querySelectorAll('.conversation-item').forEach(item => {
    item.addEventListener('click', () => {
      const convId = item.dataset.conversationId;
      const conversation = conversations.find(c => c.id === convId);
      if (conversation) {
        selectConversation(conversation);
      }
    });
  });
}

function selectConversation(conversation) {
  const chatArea = document.getElementById('chatArea');
  if (!chatArea) return;

  // Mark as read
  conversation.unread = 0;

  // Update conversations list
  const conversationsList = document.getElementById('conversationsList');
  if (conversationsList) {
    const item = conversationsList.querySelector(`[data-conversation-id="${conversation.id}"]`);
    if (item) {
      item.classList.remove('unread');
      const badge = item.querySelector('.unread-badge');
      if (badge) {
        badge.remove();
      }
    }
  }

  // Render chat
  renderChat(chatArea, conversation);
}

function renderChat(container, conversation) {
  container.innerHTML = `
    <div class="chat-main">
      <!-- Chat Header -->
      <div class="chat-header">
        <div class="chat-header-info">
          <div class="chat-avatar">
            ${conversation.farmerAvatar 
              ? `<img src="${conversation.farmerAvatar}" alt="${conversation.farmerName}" />`
              : `<div class="avatar-placeholder">${conversation.farmerName?.charAt(0) || 'F'}</div>`
            }
          </div>
          <div>
            <h3>${conversation.farmerName || 'Farmer'}</h3>
            <p class="chat-status">Online</p>
          </div>
        </div>
        <div class="chat-actions">
          <button class="btn btn-ghost btn-sm" title="View Profile">
            <i class="ph ph-user"></i>
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div class="chat-messages" id="chatMessages">
        ${conversation.messages?.map(msg => renderMessage(msg)).join('') || ''}
      </div>

      <!-- Message Input -->
      <div class="chat-input-container">
        <div class="chat-input-wrapper">
          <textarea 
            class="chat-input" 
            id="messageInput" 
            placeholder="Type a message..." 
            rows="1"
          ></textarea>
          <button class="btn btn-primary" id="sendMessageBtn">
            <i class="ph ph-paper-plane-right"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  // Scroll to bottom
  scrollToBottom();

  // Setup message input
  setupMessageInput(conversation);
}

function renderMessage(message) {
  const isBuyer = message.sender === 'buyer';
  const time = formatTime(message.timestamp);

  return `
    <div class="message ${isBuyer ? 'message-sent' : 'message-received'}">
      <div class="message-content">
        <p>${message.text}</p>
        <span class="message-time">${time}</span>
      </div>
    </div>
  `;
}

function renderEmptyChat(container) {
  container.innerHTML = `
    <div class="chat-empty">
      <i class="ph ph-chat-circle-dots"></i>
      <h3>Select a Conversation</h3>
      <p>Choose a conversation from the list to start chatting with a farmer.</p>
    </div>
  `;
}

// ==================== MESSAGE HANDLING ====================

function setupMessageInput(conversation) {
  const messageInput = document.getElementById('messageInput');
  const sendButton = document.getElementById('sendMessageBtn');

  if (!messageInput || !sendButton) return;

  // Auto-resize textarea
  messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
  });

  // Send on Enter (Shift+Enter for new line)
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(conversation);
    }
  });

  // Send button click
  sendButton.addEventListener('click', () => {
    sendMessage(conversation);
  });
}

async function sendMessage(conversation) {
  const messageInput = document.getElementById('messageInput');
  if (!messageInput) return;

  const text = messageInput.value.trim();
  if (!text) return;

  // Create message
  const message = {
    id: `msg-${Date.now()}`,
    sender: 'buyer',
    text: text,
    timestamp: new Date().toISOString()
  };

  // Add to conversation
  conversation.messages.push(message);
  conversation.lastMessage = text;
  conversation.lastMessageTime = message.timestamp;

  // Clear input
  messageInput.value = '';
  messageInput.style.height = 'auto';

  // Render message
  const chatMessages = document.getElementById('chatMessages');
  if (chatMessages) {
    chatMessages.insertAdjacentHTML('beforeend', renderMessage(message));
    scrollToBottom();
  }

  // Update conversation list
  updateConversationInList(conversation);

  // Simulate farmer response (in real app, this would be via WebSocket or polling)
  simulateFarmerResponse(conversation);
}

function simulateFarmerResponse(conversation) {
  // Simulate typing delay
  setTimeout(() => {
    const responses = [
      'Thank you for your message! I\'ll get back to you shortly.',
      'Sure, I can help with that.',
      'Let me check and confirm for you.',
      'Great! I\'ll prepare your order.',
      'Thanks for reaching out!'
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    const response = {
      id: `msg-${Date.now()}`,
      sender: 'farmer',
      text: randomResponse,
      timestamp: new Date().toISOString()
    };

    conversation.messages.push(response);
    conversation.lastMessage = randomResponse;
    conversation.lastMessageTime = response.timestamp;

    // Render response
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
      chatMessages.insertAdjacentHTML('beforeend', renderMessage(response));
      scrollToBottom();
    }

    // Update conversation list
    updateConversationInList(conversation);

    // Show notification
    BuyerApp.showNotification(`New message from ${conversation.farmerName}`, 'info');
  }, 2000 + Math.random() * 3000);
}

function updateConversationInList(conversation) {
  const conversationsList = document.getElementById('conversationsList');
  if (!conversationsList) return;

  const item = conversationsList.querySelector(`[data-conversation-id="${conversation.id}"]`);
  if (item) {
    const preview = item.querySelector('.conversation-preview');
    const time = item.querySelector('.conversation-time');
    
    if (preview) {
      preview.textContent = conversation.lastMessage || 'No messages';
    }
    if (time) {
      time.textContent = formatTime(conversation.lastMessageTime);
    }
  }
}

// ==================== UTILITIES ====================

function formatTime(timestamp) {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  // Less than 1 minute
  if (diff < 60 * 1000) {
    return 'Just now';
  }
  
  // Less than 1 hour
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes}m ago`;
  }
  
  // Less than 24 hours
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours}h ago`;
  }
  
  // Less than 7 days
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days}d ago`;
  }
  
  // Otherwise show date
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function scrollToBottom() {
  const chatMessages = document.getElementById('chatMessages');
  if (chatMessages) {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
  // New message button
  const newMessageBtn = document.getElementById('newMessageBtn');
  if (newMessageBtn) {
    newMessageBtn.addEventListener('click', () => {
      BuyerApp.showNotification('New conversation feature coming soon!', 'info');
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

window.loadChat = loadChat;
window.sendMessage = sendMessage;