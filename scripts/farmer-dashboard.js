const LISTINGS_STORAGE_KEY = 'harvconnect_active_listings';
const DEFAULT_LISTING_COUNT = 8;

function updateActiveListingsCount() {
    const listingsDisplay = document.getElementById('activeListingsCount');

    if (!listingsDisplay) return;

    const storedValue = parseInt(localStorage.getItem(LISTINGS_STORAGE_KEY), 10);
    const activeListings = Number.isNaN(storedValue) ? DEFAULT_LISTING_COUNT : storedValue;

    if (!localStorage.getItem(LISTINGS_STORAGE_KEY)) {
        localStorage.setItem(LISTINGS_STORAGE_KEY, String(DEFAULT_LISTING_COUNT));
    }

    listingsDisplay.textContent = String(activeListings);
}

document.addEventListener("DOMContentLoaded", () => {
    // Dynamic User Greeting Mapping
    // Retrieves the user's name if saved during the login/signup process
    const storedName = localStorage.getItem('harvconnect_user_name');
    const userNameDisplay = document.getElementById('userNameDisplay');
    
    if (storedName) {
        // Formats the name to Ensure capitalization (e.g., "mensah john" -> "Mensah John")
        const formattedName = storedName.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        userNameDisplay.textContent = formattedName;
    }

    // Active Navigation State Handler (For multi-page usability)
    const navItems = document.querySelectorAll('.nav-item');
    const currentPath = window.location.pathname;

    navItems.forEach(item => {
        // Clear default active states
        item.classList.remove('active');
        
        // Find if the href matches the current browser URL
        if (item.getAttribute('href') && currentPath.includes(item.getAttribute('href'))) {
            item.classList.add('active');
            
            // Swap to filled icon if Phosphor icons are used
            const icon = item.querySelector('i');
            if(icon) {
                icon.classList.remove('ph');
                icon.classList.add('ph-fill');
            }
        }
    });

    // Notification Button Placeholder
    const notificationBtn = document.querySelector('.notification-btn');
    if(notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            alert("You have no new notifications right now.");
        });
    }

    updateActiveListingsCount();

    window.addEventListener('harvconnect:listingsUpdated', updateActiveListingsCount);
    window.addEventListener('storage', (event) => {
        if (event.key === LISTINGS_STORAGE_KEY) {
            updateActiveListingsCount();
        }
    });
});


