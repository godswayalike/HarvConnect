/**
 * Opens the confirmation modal and dynamically sets the driver's name in the UI.
 * @param {string} driverName - The name of the driver selected from the list.
 */
function openDriverModal(driverName) {
    // Dynamically insert the selected driver's name into the modal header
    const modalTitle = document.getElementById('modalDriverName');
    modalTitle.textContent = `Confirm ${driverName}?`;

    // Unhide the modal backdrop
    const modal = document.getElementById('driverModal');
    modal.classList.remove('hidden-overlay');
}

/**
 * Closes the confirmation modal without taking action.
 */
function closeDriverModal() {
    const modal = document.getElementById('driverModal');
    modal.classList.add('hidden-overlay');
}

/**
 * Executes the acceptance route when the user clicks "Yes" in the modal.
 * Redirects the application to the tracking/matched interface.
 */
function confirmSelection() {
    window.location.href = '../pages/driver-matched.html';
}