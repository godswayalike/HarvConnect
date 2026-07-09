let activeOrderCard = null;

document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const orderCards = document.querySelectorAll('.order-card');
    const ordersList = document.getElementById('ordersList');

    function filterOrders(filterValue) {
        orderCards.forEach(card => {
            const cardStatus = card.getAttribute('data-status');
            const shouldShow = filterValue === 'all' || cardStatus === filterValue;
            card.classList.toggle('hidden', !shouldShow);
        });
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterOrders(button.getAttribute('data-filter'));
        });
    });

    ordersList.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button) return;

        const card = button.closest('.order-card');
        if (!card) return;

        if (button.classList.contains('btn-fill-green')) {
            activeOrderCard = card;
            openAcceptModal(card);
        }

        if (button.classList.contains('btn-outline-red')) {
            activeOrderCard = card;
            openDeclineModal(card);
        }
    });

    document.querySelectorAll('.modal-backdrop').forEach(modal => {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeOrderModal(modal.id);
            }
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const openModal = document.querySelector('.modal-backdrop:not(.hidden-overlay)');
            if (openModal) {
                closeOrderModal(openModal.id);
            }
        }
    });
});

function openAcceptModal(card = null) {
    if (card) {
        activeOrderCard = card;
    }
    openModal('acceptConfirmModal');
}

function openDeclineModal(card = null) {
    if (card) {
        activeOrderCard = card;
    }
    openModal('declineConfirmModal');
}

function openModal(modalId) {
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
        modal.classList.add('hidden-overlay');
    });

    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden-overlay');
    }
}

function closeOrderModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden-overlay');
    }
}

function showAcceptSuccess() {
    closeOrderModal('acceptConfirmModal');

    if (activeOrderCard) {
        activeOrderCard.setAttribute('data-status', 'active');
        const statusLabel = activeOrderCard.querySelector('.status-label');
        if (statusLabel) {
            statusLabel.textContent = 'IN TRANSIT';
        }

        const actions = activeOrderCard.querySelector('.order-actions');
        if (actions) {
            actions.innerHTML = '<button type="button" class="btn btn-outline-dark">Track delivery</button>';
        }
    }

    openModal('acceptSuccessModal');
}

function showDeclineSuccess() {
    closeOrderModal('declineConfirmModal');

    if (activeOrderCard) {
        activeOrderCard.setAttribute('data-status', 'completed');
        const statusLabel = activeOrderCard.querySelector('.status-label');
        if (statusLabel) {
            statusLabel.textContent = 'DECLINED';
        }

        const actions = activeOrderCard.querySelector('.order-actions');
        if (actions) {
            actions.innerHTML = '<span class="status-label">DECLINED</span>';
        }
    }

    openModal('declineSuccessModal');
}

function goToTransport() {
    closeOrderModal('acceptSuccessModal');

    if (activeOrderCard) {
        activeOrderCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}