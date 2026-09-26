// Live Google Colab API URL
const API_BASE_URL = "https://handiness-delay-preoccupy.ngrok-free.dev";

// Setup 3D Viewport Scene
const container = document.querySelector('.avatar-panel');
const canvas = document.getElementById('avatarCanvas');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

// Camera focused on upper-body posture
const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 1.4, 2.5);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Studio Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(0, 10, 10);
scene.add(directionalLight);

// Wireframe Skeleton (Placeholder until GLTF model loads)
const geometry = new THREE.CylinderGeometry(0.1, 0.1, 1.2, 16);
const material = new THREE.MeshStandardMaterial({ color: 0x4CAF50, wireframe: true });
const placeholderAvatar = new THREE.Mesh(geometry, material);
placeholderAvatar.position.set(0, 1.0, 0);
scene.add(placeholderAvatar);

// Continuous Animation Frame Loop
function animate() {
    requestAnimationFrame(animate);
    placeholderAvatar.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();

// API Translation Handler
async function translateText() {
    const inputField = document.getElementById('inputText');
    const text = inputField.value.trim();
    if (!text) return;

    document.getElementById('glossOutput').innerText = "Connecting to Google Colab engine...";

    try {
        const response = await fetch(`${API_BASE_URL}/translate_text`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });

        const data = await response.json();
        if (response.ok) {
            document.getElementById('glossOutput').innerText = data.glosses.join(" ");
            console.log("Keypoint Mapping Payload:", data.keypoint_matches);
        } else {
            document.getElementById('glossOutput').innerText = "Translation Error: " + data.detail;
        }
    } catch (error) {
        document.getElementById('glossOutput').innerText = "API Connection Failed. Ensure Colab server is running.";
        console.error("Fetch Error:", error);
    }
}

function toggleRecord() {
    const btn = document.getElementById('recordBtn');
    btn.innerText = btn.innerText.includes("Record") ? "🛑 Stop Recording" : "🎤 Record Voice";
}