document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profileForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const userIdInput = document.getElementById('userId');
    const registrationDateInput = document.getElementById('registrationDate');
    const updateProfileBtn = document.getElementById('updateProfileBtn');
    const updateFaceBtn = document.getElementById('updateFaceBtn');
    const cameraPlaceholder = document.getElementById('cameraPlaceholder');
    const cameraContainer = document.getElementById('cameraContainer');
    const capturedImageContainer = document.getElementById('capturedImageContainer');
    const capturedImage = document.getElementById('capturedImage');
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const captureBtn = document.getElementById('captureBtn');
    const retakeBtn = document.getElementById('retakeBtn');
    const noFaceDetected = document.getElementById('noFaceDetected');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const toast = document.getElementById('toast');

    let stream = null;
    let faceDetectionInterval = null;
    let faceDescriptor = null;
    
    // Get current user
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    // Populate form with user data
    nameInput.value = currentUser.name;
    emailInput.value = currentUser.email;
    userIdInput.value = currentUser.id;
    registrationDateInput.value = new Date(currentUser.registeredAt).toLocaleDateString();
    
    // Update profile button click
    updateProfileBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        
        if (!name || !email) {
            showToast('Error', 'Please fill all required fields', 'error');
            return;
        }
        
        // Show loading overlay
        loadingOverlay.classList.remove('hidden');
        updateProfileBtn.disabled = true;
        
        // In a real app, this would be a server request
        // For demo purposes, we'll use localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        
        if (userIndex === -1) {
            loadingOverlay.classList.add('hidden');
            updateProfileBtn.disabled = false;
            showToast('Error', 'User not found.', 'error');
            return;
        }
        
        // Update user data
        users[userIndex] = {
            ...users[userIndex],
            name,
            email,
        };
        
        localStorage.setItem('users', JSON.stringify(users));
        
        // Update session storage
        const updatedUser = {
            ...currentUser,
            name,
            email,
        };
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        // Simulate update delay
        setTimeout(() => {
            loadingOverlay.classList.add('hidden');
            updateProfileBtn.disabled = false;
            showToast('Success', 'Profile updated successfully', 'success');
            
            // Update welcome message
            const welcomeUser = document.getElementById('welcomeUser');
            if (welcomeUser) {
                welcomeUser.textContent = `Welcome, ${name}`;
            }
        }, 1000);
    });
    
    // Update face button click
    updateFaceBtn.addEventListener('click', () => {
        cameraPlaceholder.click();
    });

    // Initialize camera when placeholder is clicked
    cameraPlaceholder.addEventListener('click', async () => {
        try {
            cameraPlaceholder.classList.add('hidden');
            capturedImageContainer.classList.add('hidden');
            cameraContainer.classList.remove('hidden');
            
            stream = await initCamera(video);
            
            // Wait for video to be ready
            video.onloadedmetadata = () => {
                // Set canvas dimensions to match video
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                // Start face detection
                startFaceDetection();
            };
        } catch (error) {
            showToast('Error', 'Could not access camera. Please ensure you have granted camera permissions.', 'error');
            cameraPlaceholder.classList.remove('hidden');
            cameraContainer.classList.add('hidden');
        }
    });

    // Start face detection loop
    function startFaceDetection() {
        faceDetectionInterval = setInterval(async () => {
            const hasFace = await detectFace(video);
            
            if (hasFace) {
                captureBtn.disabled = false;
                noFaceDetected.classList.add('hidden');
                drawFaceBox(canvas);
            } else {
                captureBtn.disabled = true;
                noFaceDetected.classList.remove('hidden');
                clearCanvas(canvas);
            }
        }, 500);
    }

    // Capture button click
    captureBtn.addEventListener('click', async () => {
        try {
            // Get face descriptor
            faceDescriptor = await getFaceDescriptor(video);
            
            // Capture image
            const imageData = captureImage(video);
            
            if (imageData) {
                // Display captured image
                capturedImage.src = imageData;
                cameraContainer.classList.add('hidden');
                capturedImageContainer.classList.remove('hidden');
                
                // Stop camera and face detection
                stopCamera(stream);
                clearInterval(faceDetectionInterval);
                
                // Update face descriptor in storage
                updateFaceDescriptor(faceDescriptor);
            }
        } catch (error) {
            showToast('Error', 'An error occurred while capturing your face. Please try again.', 'error');
        }
    });

    // Retake button click
    retakeBtn.addEventListener('click', async () => {
        capturedImageContainer.classList.add('hidden');
        cameraPlaceholder.classList.remove('hidden');
        faceDescriptor = null;
    });
    
    // Update face descriptor in storage
    function updateFaceDescriptor(descriptor) {
        // Show loading overlay
        loadingOverlay.classList.remove('hidden');
        
        // In a real app, this would be a server request
        // For demo purposes, we'll use localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        
        if (userIndex === -1) {
            loadingOverlay.classList.add('hidden');
            showToast('Error', 'User not found.', 'error');
            return;
        }
        
        // Update user's face descriptor
        users[userIndex] = {
            ...users[userIndex],
            faceDescriptor: Array.from(descriptor),
        };
        
        localStorage.setItem('users', JSON.stringify(users));
        
        // Update session storage
        const updatedUser = {
            ...currentUser,
            faceDescriptor: Array.from(descriptor),
        };
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        // Simulate update delay
        setTimeout(() => {
            loadingOverlay.classList.add('hidden');
            showToast('Success', 'Face recognition data updated successfully', 'success');
        }, 1000);
    }

    // Show toast notification
    function showToast(title, message, type = 'success') {
        const toastTitle = toast.querySelector('.toast-title');
        const toastDescription = toast.querySelector('.toast-description');
        
        toastTitle.textContent = title;
        toastDescription.textContent = message;
        
        toast.className = 'toast';
        if (type === 'error') {
            toast.classList.add('error');
        } else {
            toast.classList.add('success');
        }
        
        toast.classList.remove('hidden');
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }

    // Mock functions for face detection and camera initialization
    async function initCamera(videoElement) {
        // Replace with actual camera initialization logic
        console.log('Initializing camera...');
        return new Promise(resolve => {
            setTimeout(() => {
                resolve('mockStream');
            }, 500);
        });
    }

    async function detectFace(videoElement) {
        // Replace with actual face detection logic
        console.log('Detecting face...');
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(true); // Simulate face detected
            }, 200);
        });
    }

    function drawFaceBox(canvasElement) {
        // Replace with actual face box drawing logic
        console.log('Drawing face box...');
    }

    function clearCanvas(canvasElement) {
        // Replace with actual canvas clearing logic
        console.log('Clearing canvas...');
    }

    async function getFaceDescriptor(videoElement) {
        // Replace with actual face descriptor extraction logic
        console.log('Getting face descriptor...');
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(new Float32Array(128).fill(0.1)); // Simulate face descriptor
            }, 300);
        });
    }

    function captureImage(videoElement) {
        // Replace with actual image capture logic
        console.log('Capturing image...');
        return 'data:image/png;base64,mockImageData';
    }

    function stopCamera(stream) {
        // Replace with actual camera stopping logic
        console.log('Stopping camera...');
    }
});