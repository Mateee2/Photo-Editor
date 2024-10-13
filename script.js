// Selecting elements
const imageUpload = document.getElementById('imageUpload');
const uploadedImage = document.getElementById('uploadedImage');
const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');
const downloadBtn = document.getElementById('downloadBtn');

let originalImageSrc = '';  // To store the original uploaded image
let filterHistory = [];     // Stack to track canvas history for undo
let redoStack = [];         // Stack to track redo operations

// Handle image upload
imageUpload.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                // Set the maximum size for the image (for example, 100% of the canvas size)
                const maxWidth = window.innerWidth * 0.9;  // Maximum width 90% of the viewport width
                const maxHeight = window.innerHeight * 0.7; // Maximum height 70% of the viewport height

                // Calculate the new image dimensions while maintaining aspect ratio
                let width = img.width;
                let height = img.height;

                // Scale the image proportionally to fit within the maxWidth and maxHeight
                if (width > maxWidth) {
                    height = (height / width) * maxWidth;
                    width = maxWidth;
                }
                if (height > maxHeight) {
                    width = (width / height) * maxHeight;
                    height = maxHeight;
                }

                // Set canvas size to match the scaled image size
                canvas.width = width;
                canvas.height = height;

                // Store the original image for "Original Photo" button
                originalImageSrc = event.target.result;

                // Draw the scaled image onto the canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, width, height);

                // Display the uploaded image (without filters)
                uploadedImage.src = originalImageSrc;

                // Store the initial state of the canvas in filterHistory
                filterHistory = [canvas.toDataURL()];  // Reset history with original state
                redoStack = [];  // Clear redo stack when a new image is uploaded
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Apply filters and store the canvas state
function applyFilter(filter) {
    const img = new Image();
    img.src = uploadedImage.src;
    img.onload = function() {
        // Set the canvas size to match the image size (in case it was resized)
        const width = canvas.width;
        const height = canvas.height;

        // Clear the canvas and apply the filter
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.filter = filter;
        ctx.drawImage(img, 0, 0, width, height);

        // Update the displayed image with the filtered canvas image
        uploadedImage.src = canvas.toDataURL();

        // Add the new canvas state to filterHistory and clear redoStack
        filterHistory.push(canvas.toDataURL());
        redoStack = [];  // Clear redo stack when a new filter is applied
    };
}

// Undo the last filter applied
function undo() {
    if (filterHistory.length > 1) {
        // Move the current state to redoStack
        redoStack.push(filterHistory.pop());
        const previousState = filterHistory[filterHistory.length - 1];

        // Load the previous state from filterHistory
        const img = new Image();
        img.src = previousState;
        img.onload = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            uploadedImage.src = previousState;
        };
    }
}

// Redo the last undone action
function redo() {
    if (redoStack.length > 0) {
        const redoState = redoStack.pop();
        filterHistory.push(redoState);

        const img = new Image();
        img.src = redoState;
        img.onload = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            uploadedImage.src = redoState;
        };
    }
}

// Download the filtered image
downloadBtn.addEventListener('click', function() {
    const link = document.createElement('a');
    link.href = canvas.toDataURL();  // Get the image from the canvas (with filters)
    link.download = 'edited-image.png';
    link.click();
});
