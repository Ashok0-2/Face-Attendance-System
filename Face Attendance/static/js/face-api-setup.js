// face-api-setup.js
async function loadFaceApiModels() {
    try {
        console.log("⏳ Loading face-api.js models...");
        await faceapi.nets.tinyFaceDetector.load('/static/models/tiny_face_detector');
        await faceapi.nets.faceLandmark68Net.load('/static/models/face_landmark_68');
        await faceapi.nets.faceRecognitionNet.load('/static/models/face_recognition');
        console.log("✅ face-api.js models loaded successfully.");
    } catch (err) {
        console.error("❌ Failed to load face-api.js models:", err);
    }
}
