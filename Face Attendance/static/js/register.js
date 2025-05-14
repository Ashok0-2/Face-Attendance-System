


// let video, canvas, cameraStream, detectionInterval;

// async function startCamera() {
//     video = document.getElementById('video');
//     canvas = document.getElementById('canvas');
//     console.log("🎥 Starting camera...");

//     try {
//         cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
//         video.srcObject = cameraStream;

//         video.onloadedmetadata = () => {
//             video.play();
//             detectFaceLoop();
//         };
//     } catch (err) {
//         alert("Camera error: " + err.message);
//     }
// }

// function stopCamera() {
//     if (cameraStream) {
//         cameraStream.getTracks().forEach(track => track.stop());
//     }
//     if (detectionInterval) {
//         clearInterval(detectionInterval);
//     }
// }

// async function detectFaceLoop() {
//     const captureBtn = document.getElementById('captureBtn');
//     const noFace = document.getElementById('noFaceDetected');

//     const options = new faceapi.TinyFaceDetectorOptions({
//         inputSize: 320,
//         scoreThreshold: 0.4
//     });

//     detectionInterval = setInterval(async () => {
//         if (!video || video.paused || video.ended) return;

//         const detections = await faceapi.detectAllFaces(video, options);

//         if (detections.length > 0) {
//             captureBtn.disabled = false;
//             noFace.classList.add("hidden");
//         } else {
//             captureBtn.disabled = true;
//             noFace.classList.remove("hidden");
//         }
//     }, 500);
// }

// document.addEventListener('DOMContentLoaded', async () => {
//     await loadFaceApiModels(); // Make sure this is defined in face-api-setup.js

//     const placeholder = document.getElementById('cameraPlaceholder');
//     const cameraContainer = document.getElementById('cameraContainer');
//     const capturedContainer = document.getElementById('capturedImageContainer');
//     const capturedImg = document.getElementById('capturedImage');
//     const captureBtn = document.getElementById('captureBtn');
//     const retakeBtn = document.getElementById('retakeBtn');

//     if (!placeholder) {
//         console.error("❌ Placeholder element not found!");
//         return;
//     }

//     placeholder.addEventListener('click', async () => {
//         placeholder.classList.add('hidden');
//         cameraContainer.classList.remove('hidden');
//         await startCamera();
//     });

  
    
// // working capture button and storing

//     captureBtn.addEventListener('click', async () => {
//         canvas.width = video.videoWidth;
//         canvas.height = video.videoHeight;
    
//         const ctx = canvas.getContext('2d');
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//         canvas.classList.remove('hidden');
//         ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
//         const imgData = canvas.toDataURL('image/png');
    
//         // Send to backend
//         const response = await fetch('/register-face', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ image: imgData, username: 'user1' }) // Replace 'user1' dynamically
//         });
    
//         const result = await response.json();
//         console.log(result.message);
        
//         capturedImg.src = imgData;
//         cameraContainer.classList.add('hidden');
//         capturedContainer.classList.remove('hidden');
//         stopCamera();
//     });
    

//     retakeBtn.addEventListener('click', async () => {
//         // Hide the captured image container
//         capturedContainer.classList.add('hidden');
    
//         // Clear the previous image and canvas
//         capturedImg.src = '';             
//         const ctx = canvas.getContext('2d');
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//         canvas.classList.add('hidden');
    
//         // Show the camera again
//         cameraContainer.classList.remove('hidden');
    
//         // Restart the camera and face detection
//         await startCamera();
//     });
// });


let video, canvas, cameraStream, detectionInterval, capturedImgData = null;

async function startCamera() {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    console.log("🎥 Starting camera...");

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = cameraStream;

        video.onloadedmetadata = () => {
            video.play();
            detectFaceLoop();
        };
    } catch (err) {
        alert("Camera error: " + err.message);
    }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
    }
    if (detectionInterval) {
        clearInterval(detectionInterval);
    }
}

async function detectFaceLoop() {
    const captureBtn = document.getElementById('captureBtn');
    const noFace = document.getElementById('noFaceDetected');

    const options = new faceapi.TinyFaceDetectorOptions({
        inputSize: 320,
        scoreThreshold: 0.4
    });

    detectionInterval = setInterval(async () => {
        if (!video || video.paused || video.ended) return;

        const detections = await faceapi.detectAllFaces(video, options);

        if (detections.length > 0) {
            captureBtn.disabled = false;
            noFace.classList.add("hidden");
        } else {
            captureBtn.disabled = true;
            noFace.classList.remove("hidden");
        }
    }, 500);
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadFaceApiModels();

    const placeholder = document.getElementById('cameraPlaceholder');
    const cameraContainer = document.getElementById('cameraContainer');
    const capturedContainer = document.getElementById('capturedImageContainer');
    const capturedImg = document.getElementById('capturedImage');
    const captureBtn = document.getElementById('captureBtn');
    const retakeBtn = document.getElementById('retakeBtn');
    const registerBtn = document.getElementById('registerBtn');

    placeholder.addEventListener('click', async () => {
        placeholder.classList.add('hidden');
        cameraContainer.classList.remove('hidden');
        await startCamera();
    });

    captureBtn.addEventListener('click', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.classList.remove('hidden');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        capturedImgData = canvas.toDataURL('image/png');
        capturedImg.src = capturedImgData;

        cameraContainer.classList.add('hidden');
        capturedContainer.classList.remove('hidden');
        stopCamera();
    });

    registerBtn.addEventListener('click', async () => {
        const fullName = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const idNumber = document.getElementById('id').value;
    
        if (!capturedImgData) {
            alert("Please capture your face before registering.");
            return;
        }
    
        try {
            const response = await fetch('/register-face', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: fullName,
                    email: email,
                    id_number: idNumber,
                    image: capturedImgData   // base64 image string
                })
            });
            
    
            const result = await response.json();
            console.log(result.message); // Logs response message
    
            // ✅ This is the part you need to REPLACE or UPDATE
            if (result.status === 'success') {
                document.getElementById("toast").classList.remove("hidden");
                setTimeout(() => {
                    window.location.href = "/login";
                }, 2000);
            } else {
                alert(result.message || "Registration failed.");
            }
    
        } catch (error) {
            console.error("❌ Network or server error:", error);
            alert("Something went wrong. Please try again.");
        }
    });
    

    retakeBtn.addEventListener('click', async () => {
        capturedContainer.classList.add('hidden');
        capturedImg.src = '';
        capturedImgData = null;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.classList.add('hidden');
        cameraContainer.classList.remove('hidden');
        await startCamera();
    });
});














