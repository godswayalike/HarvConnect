document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById('produceImage');
    const uploadBox = document.getElementById('imageUploadBox');
    const uploadContent = document.getElementById('uploadContent');
    const form = document.getElementById('addProduceForm');
    const submitBtn = document.getElementById('submitBtn');
    const formMessage = document.getElementById('formMessage');

    let hasImage = false;

    // 1. Handle Native Camera / File Selection Preview
    fileInput.addEventListener('change', function(e) {
        const file = this.files[0];
        
        if (file) {
            // Validate it's an image
            if (!file.type.startsWith('image/')) {
                alert('Please upload a valid image file.');
                return;
            }

            // Create a preview using FileReader
            const reader = new FileReader();
            reader.onload = function(event) {
                // Clear the box and add the image preview
                uploadContent.style.display = 'none';
                
                // Remove existing preview if changing photo
                const existingPreview = uploadBox.querySelector('.preview-image');
                if (existingPreview) existingPreview.remove();

                const img = document.createElement('img');
                img.src = event.target.result;
                img.className = 'preview-image';
                uploadBox.appendChild(img);
                
                hasImage = true;
                document.getElementById('imageError').style.display = 'none';
                uploadBox.style.borderStyle = 'solid';
            };
            reader.readAsDataURL(file);
        }
    });

    // 2. Handle Form Submission
    const updateActiveListingsCount = (delta = 1) => {
        const currentListings = parseInt(localStorage.getItem('harvconnect_active_listings'), 10);
        const nextCount = Number.isNaN(currentListings) ? 8 + delta : currentListings + delta;

        localStorage.setItem('harvconnect_active_listings', String(nextCount));
        window.dispatchEvent(new CustomEvent('harvconnect:listingsUpdated', {
            detail: { count: nextCount }
        }));
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Basic image validation
        if (!hasImage) {
            document.getElementById('imageError').style.display = 'block';
            uploadBox.style.borderColor = 'var(--error-red)';
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Adding Produce...';

        // Collect data (Using FormData to handle the image file upload)
        const formData = new FormData(form);

        try {
            // Mocking the API call to standard backend format
            // In reality, this would map to something like: POST /api/v1/farmers/produce
            const mockApiResponse = await new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        success: true,
                        message: "Produce added successfully",
                        data: {}
                    });
                }, 1200);
            });

            // Follows the consistent JSON structure specified in the backend docs [cite: 7]
            if (mockApiResponse.success) {
                
                // 3. Update Dashboard Listings Counter
                updateActiveListingsCount(1);

                // Re-route to dashboard
                window.location.href = 'farmer-dashboard.html';
                
            } else {
                throw new Error(mockApiResponse.message);
            }

        } catch (error) {
            formMessage.textContent = error.message || 'Error adding produce. Please try again.';
            formMessage.className = 'form-message error';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Add Produce';
        }
    });
});