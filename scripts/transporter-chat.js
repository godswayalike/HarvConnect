document.addEventListener("DOMContentLoaded", () => {
    // Views
    const messagesListView = document.getElementById('messagesListView');
    const chatRoomView = document.getElementById('chatRoomView');
    const mainNav = document.getElementById('mainNav');
    
    // Elements
    const chatItems = document.querySelectorAll('.chat-item');
    const backBtn = document.getElementById('backToList');
    const activeName = document.getElementById('activeName');
    const activeAvatar = document.getElementById('activeAvatar');
    const chatHistory = document.getElementById('chatHistory');
    const chatForm = document.getElementById('chatForm');
    const messageInput = document.getElementById('messageInput');

    // 1. Open a Chat
    chatItems.forEach(item => {
        item.addEventListener('click', function() {
            const name = this.getAttribute('data-name');
            const avatarContent = this.querySelector('.avatar').textContent;
            const avatarClass = Array.from(this.querySelector('.avatar').classList).find(c => c.startsWith('bg-'));
            const lastMessageText = this.querySelector('.last-message').textContent;

            // Set Chat Room Header Info
            activeName.textContent = name;
            activeAvatar.textContent = avatarContent;
            activeAvatar.className = `avatar small ${avatarClass}`;

            // Remove unread badge and styling
            const badge = this.querySelector('.unread-badge');
            if (badge) {
                badge.remove(); // Removes the badge from the DOM
                this.querySelector('.last-message').classList.add('read'); // Changes text to unread state styling
            }

            // Populate mock chat history
            loadMockChatHistory(lastMessageText);

            // Switch Views
            messagesListView.classList.remove('active');
            chatRoomView.classList.add('active');
            
            // Hide bottom nav on mobile for keyboard space
            if (window.innerWidth < 768) {
                mainNav.classList.add('hidden');
            }
        });
    });

    // 2. Go Back to List
    backBtn.addEventListener('click', () => {
        chatRoomView.classList.remove('active');
        messagesListView.classList.add('active');
        mainNav.classList.remove('hidden');
    });

    // 3. Send a Message
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = messageInput.value.trim();
        
        if (text !== '') {
            // Create sent bubble
            const bubble = document.createElement('div');
            bubble.className = 'message-bubble sent';
            
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            bubble.innerHTML = `
                ${text}
                <span class="msg-time">${time}</span>
            `;
            
            chatHistory.appendChild(bubble);
            messageInput.value = '';
            
            // Scroll to bottom
            chatHistory.scrollTop = chatHistory.scrollHeight;

            // Optional: Simulate a reply from the buyer/driver after 1.5 seconds
            setTimeout(() => {
                const reply = document.createElement('div');
                reply.className = 'message-bubble received';
                reply.innerHTML = `
                    Okay, noted.
                    <span class="msg-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                `;
                chatHistory.appendChild(reply);
                chatHistory.scrollTop = chatHistory.scrollHeight;
            }, 1500);
        }
    });

    // Helper: Loads mock messages into the chat window
    function loadMockChatHistory(lastMessage) {
        chatHistory.innerHTML = ''; // Clear previous
        
        // Add a mock older message
        chatHistory.innerHTML += `
            <div class="message-bubble received">
                Hello, I wanted to inquire about your listing.
                <span class="msg-time">09:41 AM</span>
            </div>
            <div class="message-bubble sent">
                Hi! Yes, how can I help you?
                <span class="msg-time">09:45 AM</span>
            </div>
            <div class="message-bubble received">
                ${lastMessage}
                <span class="msg-time">Just now</span>
            </div>
        `;
        
        // Ensure scroll is at the bottom
        setTimeout(() => {
            chatHistory.scrollTop = chatHistory.scrollHeight;
        }, 10);
    }
});