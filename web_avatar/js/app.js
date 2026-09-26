// Live Google Colab API URL
const API_BASE_URL = "https://handiness-delay-preoccupy.ngrok-free.dev";

// 1. Setup 3D Viewport Scene
const container = document.querySelector('.avatar-panel');
const canvas = document.getElementById('avatarCanvas');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

// Camera focused on upper body
const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 1.3, 2.8);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Studio Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(2, 5, 5);
scene.add(directionalLight);

// 2. Build Self-Contained 3D Humanoid Avatar Group
const avatarGroup = new THREE.Group();
const matBody = new THREE.MeshStandardMaterial({ color: 0x2196F3, roughness: 0.3 }); // Blue body
const matJoint = new THREE.MeshStandardMaterial({ color: 0x4CAF50, roughness: 0.3 }); // Green joints
const matHead = new THREE.MeshStandardMaterial({ color: 0xE0E0E0, roughness: 0.2 }); // Light head

// Head
const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 32, 32), matHead);
head.position.set(0, 1.45, 0);
avatarGroup.add(head);

// Torso
const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.6, 16), matBody);
torso.position.set(0, 0.95, 0);
avatarGroup.add(torso);

// Right Shoulder Joint & Arm Pivot
const rightShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), matJoint);
rightShoulder.position.set(0.28, 1.2, 0);
avatarGroup.add(rightShoulder);

const rightArmGroup = new THREE.Group();
rightArmGroup.position.set(0.28, 1.2, 0);

const rightUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 16), matBody);
rightUpperArm.position.set(0.15, -0.1, 0);
rightUpperArm.rotation.z = -Math.PI / 3;
rightArmGroup.add(rightUpperArm);

const rightForearmGroup = new THREE.Group();
rightForearmGroup.position.set(0.28, -0.2, 0);

const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.3, 16), matJoint);
rightForearm.position.set(0, -0.15, 0);
rightForearmGroup.add(rightForearm);

rightArmGroup.add(rightForearmGroup);
avatarGroup.add(rightArmGroup);

// Left Shoulder & Arm
const leftShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), matJoint);
leftShoulder.position.set(-0.28, 1.2, 0);
avatarGroup.add(leftShoulder);

const leftUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 16), matBody);
leftUpperArm.position.set(-0.15, -0.1, 0);
leftUpperArm.rotation.z = Math.PI / 3;
avatarGroup.add(leftUpperArm);

// Lower Base / Legs
const basePillar = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.6, 16), matBody);
basePillar.position.set(0, 0.35, 0);
avatarGroup.add(basePillar);

avatarGroup.position.set(0, -0.3, 0);
scene.add(avatarGroup);

// Continuous Render Loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// 3. API Translation Handler
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
            
            // Trigger 3D signing posture animation
            animateAvatarGestures();
        } else {
            document.getElementById('glossOutput').innerText = "Translation Error: " + data.detail;
        }
    } catch (error) {
        document.getElementById('glossOutput').innerText = "API Connection Failed. Ensure Colab server is running.";
        console.error("Fetch Error:", error);
    }
}

// Fluid signing motion animation sequence
function animateAvatarGestures() {
    let step = 0;
    const interval = setInterval(() => {
        step += 0.08;
        
        // Rotate right arm & forearm to perform signing movements
        rightArmGroup.rotation.z = Math.sin(step) * 0.6;
        rightArmGroup.rotation.x = Math.cos(step) * 0.4;
        rightForearmGroup.rotation.y = Math.sin(step * 2) * 0.8;
        head.rotation.y = Math.sin(step) * 0.15;

        if (step >= Math.PI * 3) {
            clearInterval(interval);
            // Reset to default standing pose
            rightArmGroup.rotation.set(0, 0, 0);
            rightForearmGroup.rotation.set(0, 0, 0);
            head.rotation.set(0, 0, 0);
        }
    }, 30);
}

function toggleRecord() {
    const btn = document.getElementById('recordBtn');
    btn.innerText = btn.innerText.includes("Record") ? "🛑 Stop Recording" : "🎤 Record Voice";
}