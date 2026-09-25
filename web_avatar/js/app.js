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
    placeholderAvatar.rotation.y += 0.01; // Gentle idle rotation
    renderer.render(scene, camera);
}
animate();

// UI Action Handlers
function translateText() {
    const text = document.getElementById('inputText').value;
    if (!text) return;
    document.getElementById('glossOutput').innerText = "TRANSLATING: " + text.toUpperCase();
}

function toggleRecord() {
    const btn = document.getElementById('recordBtn');
    btn.innerText = btn.innerText.includes("Record") ? "🛑 Stop Recording" : "🎤 Record Voice";
}