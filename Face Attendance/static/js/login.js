// document.addEventListener('DOMContentLoaded', () => {
//     const loginForm = document.getElementById('loginForm');
//     const loginBtn = document.getElementById('loginBtn');
//     const idInput = document.getElementById('id');
//     const cameraPlaceholder = document.getElementById('cameraPlaceholder');
//     const cameraContainer = document.getElementById('cameraContainer');
//     const verifyingContainer = document.getElementById('verifyingContainer');
//     const video = document.getElementById('video');
//     const canvas = document.getElementById('canvas');
//     const captureBtn = document.getElementById('captureBtn');
//     const noFaceDetected = document.getElementById('noFaceDetected');
//     const toast = document.getElementById('toast');

//     let stream = null;
//     let faceDetectionInterval = null;

//     // Declare functions (replace with actual implementations or imports)
//     async function initCamera(videoElement) {
//         // Placeholder implementation
//         console.warn("initCamera function is a placeholder. Implement camera initialization logic.");
//         return new Promise(resolve => setTimeout(() => resolve({}), 500)); // Simulate camera initialization
//     }

//     async function detectFace(videoElement) {
//         // Placeholder implementation
//         console.warn("detectFace function is a placeholder. Implement face detection logic.");
//         return new Promise(resolve => setTimeout(() => resolve(Math.random() > 0.5), 200)); // Simulate face detection
//     }

//     function drawFaceBox(canvasElement) {
//         // Placeholder implementation
//         console.warn("drawFaceBox function is a placeholder. Implement face box drawing logic.");
//     }

//     function clearCanvas(canvasElement) {
//         // Placeholder implementation
//         console.warn("clearCanvas function is a placeholder. Implement canvas clearing logic.");
//     }

//     async function getFaceDescriptor(videoElement) {
//         // Placeholder implementation
//         console.warn("getFaceDescriptor function is a placeholder. Implement face descriptor extraction logic.");
//         return new Promise(resolve => {
//             const descriptor = new Float32Array(128); // Example: 128-dimensional descriptor
//             for (let i = 0; i < descriptor.length; i++) {
//                 descriptor[i] = Math.random(); // Fill with random values
//             }
//             setTimeout(() => resolve(descriptor), 300);
//         });
//     }

//     function stopCamera(stream) {
//         if (stream) {
//             stream.getTracks().forEach(track => track.stop());
//         }
//     }

//     function compareFaceDescriptors(descriptor1, descriptor2, threshold = 0.6) {
//         let distance = 0;
//         for (let i = 0; i < descriptor1.length; i++) {
//             distance += Math.pow(descriptor1[i] - descriptor2[i], 2);
//         }
//         distance = Math.sqrt(distance);
//         return distance < threshold;
//     }

//     // Check if user is already logged in
//     if (sessionStorage.getItem('currentUser')) {
//         window.location.href = 'dashboard.html';
//     }

//     // Initialize camera when placeholder is clicked
//     cameraPlaceholder.addEventListener('click', async () => {
//         const id = idInput.value.trim();
        
//         if (!id) {
//             showToast('Error', 'Please enter your ID number first', 'error');
//             return;
//         }
        
//         try {
//             cameraPlaceholder.classList.add('hidden');
//             cameraContainer.classList.remove('hidden');
            
//             stream = await initCamera(video);
            
//             // Wait for video to be ready
//             video.onloadedmetadata = () => {
//                 // Set canvas dimensions to match video
//                 canvas.width = video.videoWidth;
//                 canvas.height = video.videoHeight;
                
//                 // Start face detection
//                 startFaceDetection();
//             };
//         } catch (error) {
//             showToast('Error', 'Could not access camera. Please ensure you have granted camera permissions.', 'error');
//             cameraPlaceholder.classList.remove('hidden');
//             cameraContainer.classList.add('hidden');
//         }
//     });

//     // Start face detection loop
//     function startFaceDetection() {
//         faceDetectionInterval = setInterval(async () => {
//             const hasFace = await detectFace(video);
            
//             if (hasFace) {
//                 captureBtn.disabled = false;
//                 noFaceDetected.classList.add('hidden');
//                 drawFaceBox(canvas);
//             } else {
//                 captureBtn.disabled = true;
//                 noFaceDetected.classList.remove('hidden');
//                 clearCanvas(canvas);
//             }
//         }, 500);
//     }

//     // Capture button click
//     captureBtn.addEventListener('click', async () => {
//         try {
//             const id = idInput.value.trim();
            
//             // Get face descriptor
//             const descriptor = await getFaceDescriptor(video);
            
//             // Stop camera and face detection
//             stopCamera(stream);
//             clearInterval(faceDetectionInterval);
            
//             // Show verifying state
//             cameraContainer.classList.add('hidden');
//             verifyingContainer.classList.remove('hidden');
            
//             // In a real app, this would be a server request
//             // For demo purposes, we'll use localStorage
            
//             const users = JSON.parse(localStorage.getItem('users') || '[]');
//             const user = users.find(u => u.id === id);
            
//             if (!user) {
//                 verifyingContainer.classList.add('hidden');
//                 cameraPlaceholder.classList.remove('hidden');
//                 showToast('Error', 'No user found with this ID', 'error');
//                 return;
//             }
            
//             // Convert stored descriptor back to Float32Array
//             const storedDescriptor = new Float32Array(user.faceDescriptor);
            
//             // Compare face descriptors
//             const match = compareFaceDescriptors(descriptor, storedDescriptor);
            
//             // Simulate verification delay
//             setTimeout(() => {
//                 verifyingContainer.classList.add('hidden');
                
//                 if (match) {
//                     showToast('Success', `Welcome back, ${user.name}!`, 'success');
                    
//                     // Store current user in session
//                     sessionStorage.setItem('currentUser', JSON.stringify(user));
                    
//                     // Redirect to dashboard
//                     setTimeout(() => {
//                         window.location.href = 'dashboard.html';
//                     }, 1000);
//                 } else {
//                     cameraPlaceholder.classList.remove('hidden');
//                     showToast('Error', 'Face verification failed. The face doesn\'t match our records.', 'error');
//                 }
//             }, 1500);
//         } catch (error) {
//             verifyingContainer.classList.add('hidden');
//             cameraPlaceholder.classList.remove('hidden');
//             showToast('Error', 'An error occurred during verification. Please try again.', 'error');
//         }
//     });

//     // Login button click
//     loginBtn.addEventListener('click', () => {
//         const id = idInput.value.trim();
        
//         if (!id) {
//             showToast('Error', 'Please enter your ID number', 'error');
//             return;
//         }
        
//         cameraPlaceholder.click();
//     });

//     // Show toast notification
//     function showToast(title, message, type = 'success') {
//         const toastTitle = toast.querySelector('.toast-title');
//         const toastDescription = toast.querySelector('.toast-description');
        
//         toastTitle.textContent = title;
//         toastDescription.textContent = message;
        
//         toast.className = 'toast';
//         if (type === 'error') {
//             toast.classList.add('error');
//         } else {
//             toast.classList.add('success');
//         }
        
//         toast.classList.remove('hidden');
        
//         // Hide toast after 3 seconds
//         setTimeout(() => {
//             toast.classList.add('hidden');
//         }, 3000);
//     }
// });


console.log("Login.js loaded");
console.log("faceapi exists:", typeof faceapi !== "undefined");



document.addEventListener('DOMContentLoaded', async () => {

    //for testing
    console.log("Login.js loaded");

    const cameraPlaceholder = document.getElementById('cameraPlaceholder');
    console.log("cameraPlaceholder:", cameraPlaceholder);

    if (cameraPlaceholder) {
        cameraPlaceholder.addEventListener('click', () => {
            console.log("Camera placeholder clicked");
        });
    } else {
        console.error("cameraPlaceholder is NULL");
    }

    //........

    const loginBtn = document.getElementById('loginBtn');
    const idInput = document.getElementById('id');


    console.log("cameraPlaceholder:", cameraPlaceholder);

    const cameraContainer = document.getElementById('cameraContainer');
    const verifyingContainer = document.getElementById('verifyingContainer');
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const captureBtn = document.getElementById('captureBtn');
    const noFaceDetected = document.getElementById('noFaceDetected');
    const toast = document.getElementById('toast');

    let stream = null;
    let faceDetectionInterval = null;

    // Load face-api.js models
    async function loadFaceApiModels() {
        console.log("Loading models...");
        await faceapi.nets.tinyFaceDetector.loadFromUri('/static/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/static/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/static/models');
        console.log("Models loaded.");
    }

    if (typeof faceapi !== 'undefined') {
        await loadFaceApiModels();
    } else {
        console.error("faceapi is not defined. Models cannot be loaded.");
    }

    function showToast(title, message, type = 'success') {
        const toastTitle = toast.querySelector('.toast-title');
        const toastDescription = toast.querySelector('.toast-description');
        
        toastTitle.textContent = title;
        toastDescription.textContent = message;

        toast.className = 'toast';
        if (type === 'error') toast.classList.add('error');
        else toast.classList.add('success');

        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 3000);
    }

    async function initCamera(videoElement) {
        console.log("initCamera called");
    
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.log("Camera API not supported");
            throw new Error("Camera API not supported.");
        }
    
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });
    
        console.log("Stream received from getUserMedia");
    
        videoElement.srcObject = stream;
        console.log("Stream assigned to video element");
    
        return stream;
    }
    
    
    

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }

    function startFaceDetection() {
        faceDetectionInterval = setInterval(async () => {
            const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();

            if (detections) {
                captureBtn.disabled = false;
                noFaceDetected.classList.add('hidden');
                const dims = faceapi.matchDimensions(canvas, video, true);
                const resized = faceapi.resizeResults(detections, dims);
                faceapi.draw.drawDetections(canvas, resized);
            } else {
                captureBtn.disabled = true;
                noFaceDetected.classList.remove('hidden');
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }, 500);
    }

    cameraPlaceholder.addEventListener('click', async () => {
        //for check
        console.log("camera Place holder clicked");

        const id = idInput.value.trim();
        if (!id) {
            showToast('Error', 'Please enter your ID number first', 'error');
            return;
        }

        try {
            console.log("Starting camera...");
        
            cameraPlaceholder.classList.add('hidden');
            cameraContainer.classList.remove('hidden');
        
            stream = await initCamera(video);
            console.log("Camera started");
        
            video.onloadedmetadata = () => {
                console.log("Metadata loaded");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                startFaceDetection();
            };
        } catch (err) {
            console.error("Error accessing camera:", err);
            showToast('Error', 'Could not access camera. Grant permission.', 'error');
            cameraPlaceholder.classList.remove('hidden');
            cameraContainer.classList.add('hidden');
        }
        
    });

    captureBtn.addEventListener('click', async () => {
        const id = idInput.value.trim();

        const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();

        if (!detection) {
            showToast('Error', 'No face detected', 'error');
            return;
        }

        const descriptor = detection.descriptor;
        stopCamera();
        clearInterval(faceDetectionInterval);
        cameraContainer.classList.add('hidden');
        verifyingContainer.classList.remove('hidden');

        // Fetch stored face descriptor from server
        try {
            const response = await fetch(`/static/face_data/${id}_latest.png`);
            const blob = await response.blob();
            const image = await faceapi.bufferToImage(blob);
            const storedDetection = await faceapi.detectSingleFace(image, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();

            if (!storedDetection) {
                showToast('Error', 'Stored face image not valid.', 'error');
                verifyingContainer.classList.add('hidden');
                cameraPlaceholder.classList.remove('hidden');
                return;
            }

            const match = faceapi.euclideanDistance(descriptor, storedDetection.descriptor) < 0.5;

            setTimeout(() => {
                verifyingContainer.classList.add('hidden');
                if (match) {
                    sessionStorage.setItem('currentUser', id);
                    showToast('Success', 'Login successful', 'success');
                    setTimeout(() => {
                        window.location.href = '/dashboard';
                    }, 1000);
                } else {
                    showToast('Error', 'Face does not match.', 'error');
                    cameraPlaceholder.classList.remove('hidden');
                }
            }, 1500);

        } catch (err) {
            console.error(err);
            showToast('Error', 'Error verifying face', 'error');
            verifyingContainer.classList.add('hidden');
            cameraPlaceholder.classList.remove('hidden');
        }
    });

    loginBtn.addEventListener('click', () => {
        const id = idInput.value.trim();
        if (!id) {
            showToast('Error', 'Please enter your ID number', 'error');
            return;
        }
        cameraPlaceholder.click();
    });
});
