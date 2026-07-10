/**
 * Opens the notification modal reader view panel, reads the comprehensive text content,
 * and marks the targeted layout item card node as read.
 * @param {HTMLElement} element - The native DOM card block item triggered
 */
function openNotification(element) {
    // 1. Target and collect specific notification metadata structures
    const titleText = element.querySelector('.notif-title').textContent;
    const fullMessageText = element.querySelector('.notif-full-text').textContent;
    const timeText = element.querySelector('.notif-time').textContent;
    const coreIconClass = element.querySelector('.notif-icon i').className;

    // 2. Map and transfer texts inside the built-in structural template items
    document.getElementById('modalTitle').textContent = titleText;
    document.getElementById('modalBodyText').textContent = fullMessageText;
    document.getElementById('modalTime').textContent = timeText;
    document.getElementById('modalIcon').className = coreIconClass;

    // 3. Unhide and display the layout backdrop system frame
    const modalBackdrop = document.getElementById('notificationModal');
    modalBackdrop.classList.remove('hidden-overlay');
    
    // Prevent standard behind-page window scrolling while reading
    document.body.style.overflow = 'hidden';

    // 4. Safely evaluate and clear the unread layout marker elements
    if (element.classList.contains('unread')) {
        element.classList.remove('unread');
        
        // Locate and clear out the active red/green numeric visual tracker badge
        const activeBadge = element.querySelector('.unread-badge');
        if (activeBadge) {
            activeBadge.remove();
        }
    }
}

/**
 * Collapses the active view template and restores native screen tracking logic parameters
 */
function closeNotification() {
    const modalBackdrop = document.getElementById('notificationModal');
    modalBackdrop.classList.add('hidden-overlay');
    
    // Release document tracking scrolls
    document.body.style.overflow = '';
}