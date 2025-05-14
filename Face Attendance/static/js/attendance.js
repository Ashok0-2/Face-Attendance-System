document.addEventListener('DOMContentLoaded', () => {
    const checkInTypeBtn = document.getElementById('checkInTypeBtn');
    const checkOutTypeBtn = document.getElementById('checkOutTypeBtn');
    const markAttendanceBtn = document.getElementById('markAttendanceBtn');
    const cameraPlaceholder = document.getElementById('cameraPlaceholder');
    const cameraContainer = document.getElementById('cameraContainer');
    const verifyingContainer = document.getElementById('verifyingContainer');
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const captureBtn = document.getElementById('captureBtn');
    const noFaceDetected = document.getElementById('noFaceDetected');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const toast = document.getElementById('toast');

    let stream = null;
    let faceDetectionInterval = null;
    let attendanceType = 'check-in'; // Default to check-in
    
    // Get current user
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    // Set attendance type buttons
    checkInTypeBtn.addEventListener('click', () => {
        attendanceType = 'check-in';
        checkInTypeBtn.classList.add('btn-primary');
        checkInTypeBtn.classList.remove('btn-outline');
        checkOutTypeBtn.classList.add('btn-outline');
        checkOutTypeBtn.classList.remove('btn-primary');
        markAttendanceBtn.textContent = 'Check In';
    });
    
    checkOutTypeBtn.addEventListener('click', () => {
        attendanceType = 'check-out';
        checkOutTypeBtn.classList.add('btn-primary');
        checkOutTypeBtn.classList.remove('btn-outline');
        checkInTypeBtn.classList.add('btn-outline');
        checkInTypeBtn.classList.remove('btn-primary');
        markAttendanceBtn.textContent = 'Check Out';
    });

    // Initialize camera when placeholder is clicked
    cameraPlaceholder.addEventListener('click', async () => {
        try {
            cameraPlaceholder.classList.add('hidden');
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
            const descriptor = await getFaceDescriptor(video);
            
            // Stop camera and face detection
            stopCamera(stream);
            clearInterval(faceDetectionInterval);
            
            // Show verifying state
            cameraContainer.classList.add('hidden');
            verifyingContainer.classList.remove('hidden');
            
            // Convert stored descriptor back to Float32Array
            const storedDescriptor = new Float32Array(currentUser.faceDescriptor);
            
            // Compare face descriptors
            const match = compareFaceDescriptors(descriptor, storedDescriptor);
            
            // Simulate verification delay
            setTimeout(() => {
                verifyingContainer.classList.add('hidden');
                
                if (match) {
                    // Get all attendance records
                    const allRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
                    
                    // Check if already marked attendance today
                    const today = new Date().toISOString().split('T')[0];
                    const alreadyMarked = allRecords.some(record => {
                        const recordDate = new Date(record.timestamp).toISOString().split('T')[0];
                        return record.userId === currentUser.id && 
                               recordDate === today && 
                               record.type === attendanceType;
                    });
                    
                    if (alreadyMarked) {
                        cameraPlaceholder.classList.remove('hidden');
                        showToast('Error', `You have already ${attendanceType === 'check-in' ? 'checked in' : 'checked out'} today.`, 'error');
                        return;
                    }
                    
                    // Create new attendance record
                    const newRecord = {
                        id: Date.now().toString(),
                        userId: currentUser.id,
                        userName: currentUser.name,
                        timestamp: new Date().toISOString(),
                        type: attendanceType
                    };
                    
                    // Add record to storage
                    allRecords.push(newRecord);
                    localStorage.setItem('attendanceRecords', JSON.stringify(allRecords));
                    
                    showToast('Success', `You have ${attendanceType === 'check-in' ? 'checked in' : 'checked out'} at ${new Date().toLocaleTimeString()}`, 'success');
                    
                    // Redirect to dashboard after a delay
                    setTimeout(() => {
                        window.location.href = '/dashboard';
                    }, 1500);
                } else {
                    cameraPlaceholder.classList.remove('hidden');
                    showToast('Error', 'Face verification failed. The face doesn\'t match our records.', 'error');
                }
            }, 1500);
        } catch (error) {
            verifyingContainer.classList.add('hidden');
            cameraPlaceholder.classList.remove('hidden');
            showToast('Error', 'An error occurred during verification. Please try again.', 'error');
        }
    });

    // Mark attendance button click
    markAttendanceBtn.addEventListener('click', () => {
        cameraPlaceholder.click();
    });

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

    // Mock functions for face detection and camera operations
    async function initCamera(videoElement) {
        console.log('Initializing camera...');
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;
        videoElement.play();
        return stream;
    }
    

    async function detectFace(videoElement) {
        // Replace with actual face detection logic
        console.log('Detecting face...');
        return new Promise(resolve => setTimeout(() => {
            resolve(true);
        }, 500));
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
        // Replace with actual face descriptor retrieval logic
        console.log('Getting face descriptor...');
        return new Promise(resolve => setTimeout(() => {
            resolve(new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5]));
        }, 500));
    }

    function stopCamera(stream) {
        if (stream && stream.getTracks) {
            stream.getTracks().forEach(track => track.stop());
            console.log('Camera stopped.');
        }
    }
    

    function compareFaceDescriptors(descriptor1, descriptor2) {
        // Replace with actual face descriptor comparison logic
        console.log('Comparing face descriptors...');
        return true;
    }
});