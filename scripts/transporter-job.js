// Keep track of the active job scope ID across layout states safely
let currentTargetJobId = null;

/**
 * Initializes and triggers the prompt confirmation view screen overlay
 * @param {string} jobId - The target DOM target node item id reference
 */
function openConfirmationModal(jobId) {
    currentTargetJobId = jobId;
    
    const overlay = document.getElementById('flowModalOverlay');
    const stepConf = document.getElementById('modalStepConfirmation');
    const stepSucc = document.getElementById('modalStepSuccess');
    
    // Reset structural state rules inside the overlay layout components
    stepConf.classList.remove('hidden-step');
    stepSucc.classList.add('hidden-step');
    overlay.classList.remove('hidden-overlay');

    // Attach runtime execution payload tracking exactly to the submission click event
    const confirmButton = document.getElementById('modalConfirmBtn');
    confirmButton.onclick = () => {
        transitionToSuccessStep();
    };
}

/**
 * Dispatches active screen toggling to progress across the verification workflow
 */
function transitionToSuccessStep() {
    const stepConf = document.getElementById('modalStepConfirmation');
    const stepSucc = document.getElementById('modalStepSuccess');
    
    stepConf.classList.add('hidden-step');
    stepSucc.classList.remove('hidden-step');
}

/**
 * Cleanly collapses the modal viewport without processing parameters
 */
function closeFlowModal() {
    const overlay = document.getElementById('flowModalOverlay');
    overlay.classList.add('hidden-overlay');
    currentTargetJobId = null;
}

/**
 * Processes state updates converting cards from "Available" to "Active / In Progress"
 */
function completeFlowAndRefreshCard() {
    if (currentTargetJobId) {
        const targetCard = document.getElementById(currentTargetJobId);
        if (targetCard) {
            // Update structural configuration classes
            targetCard.classList.add('state-accepted');
            
            // Reconfigure primary text engine inputs within action boundaries
            const actionContainer = targetCard.querySelector('.job-action-area');
            actionContainer.innerHTML = `
                <button class="btn-action-primary delivery-trigger" onclick="markAsDelivered('${currentTargetJobId}')">Mark as delivered</button>
            `;
        }
    }
    closeFlowModal();
}

/**
 * Transitions active job cards to a historical 'Completed' configuration state
 * @param {string} jobId - Selected card identity node string
 */
function markAsDelivered(jobId) {
    const targetCard = document.getElementById(jobId);
    if (targetCard) {
        targetCard.classList.remove('state-accepted');
        targetCard.classList.add('state-completed');
        
        // Match status visual indicators perfectly with sample asset profiles
        const pricingMetaBox = targetCard.querySelector('.job-meta-pricing');
        const distanceLabel = targetCard.querySelector('.job-distance');
        if (distanceLabel) distanceLabel.remove();
        
        // Append explicit status context markup
        const completedBadge = document.createElement('span');
        completedBadge.className = 'status-badge-completed';
        completedBadge.textContent = 'Completed';
        pricingMetaBox.appendChild(completedBadge);
    }
}