document.addEventListener("DOMContentLoaded", () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const orderCards = document.querySelectorAll('.order-card');

    // Tab Filtering Logic
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 1. Remove active state from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // 2. Add active state to clicked tab
            button.classList.add('active');

            // 3. Get the filter value (all, pending, active, completed)
            const filterValue = button.getAttribute('data-filter');

            // 4. Filter the cards
            orderCards.forEach(card => {
                const cardStatus = card.getAttribute('data-status');
                
                if (filterValue === 'all' || cardStatus === filterValue) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // Mock functionality for action buttons (Optional, for prototyping)
    const acceptButtons = document.querySelectorAll('.btn-fill-green');
    acceptButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.order-card');
            alert('Order Accepted! Moving to Active/In Transit.');
            
            // In a real app, this would trigger an API call to update the database.
            // Example frontend update for the prototype:
            card.setAttribute('data-status', 'active');
            card.querySelector('.status-label').textContent = 'IN TRANSIT';
            card.querySelector('.order-actions').innerHTML = '<button class="btn btn-outline-dark">Track delivery</button>';
        });
    });
});
