// Live Google Colab API URL
const API_BASE_URL = "https://handiness-delay-preoccupy.ngrok-free.dev";

// 1. Setup 3D Viewport Scene
const container = document.querySelector('.avatar-panel');
const canvas = document.getElementById('avatarCanvas');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

// Camera focused on upper body
const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 1.2, 2.8);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Studio Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(2, 5, 5);
scene.add(directionalLight);

// 2. Build Corrected 3D Humanoid Avatar Group
const avatarGroup = new THREE.Group();
const matBody = new THREE.MeshStandardMaterial({ color: 0x2196F3, roughness: 0.3 }); // Blue limbs/torso
const matJoint = new THREE.MeshStandardMaterial({ color: 0x4CAF50, roughness: 0.3 }); // Green joints
const matHead = new THREE.MeshStandardMaterial({ color: 0xE0E0E0, roughness: 0.2 }); // Light head
const matHand = new THREE.MeshStandardMaterial({ color: 0xFFC107, roughness: 0.3 }); // Yellow hands

// Head
const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 32, 32), matHead);
head.position.set(0, 1.45, 0);
avatarGroup.add(head);

// Torso
const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.6, 16), matBody);
torso.position.set(0, 0.95, 0);
avatarGroup.add(torso);

// --- RIGHT ARM STRUCTURE ---
const rightArmGroup = new THREE.Group();
rightArmGroup.position.set(0.25, 1.2, 0); // Pivot at right shoulder

// Right Shoulder Joint
const rightShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), matJoint);
rightArmGroup.add(rightShoulder);

// Right Upper Arm
const rightUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.3, 16), matBody);
rightUpperArm.position.set(0, -0.15, 0); // Extends downward from shoulder
rightArmGroup.add(rightUpperArm);

// Right Forearm Group (Pivots at Right Elbow)
const rightForearmGroup = new THREE.Group();
rightForearmGroup.position.set(0, -0.3, 0); // Positioned at bottom of upper arm

const rightElbow = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), matJoint);
rightForearmGroup.add(rightElbow);

const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.28, 16), matBody);
rightForearm.position.set(0, -0.14, 0);
rightForearmGroup.add(rightForearm);

// Right Hand
const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.02), matHand);
rightHand.position.set(0, -0.3, 0);
rightForearmGroup.add(rightHand);

rightArmGroup.add(rightForearmGroup);
avatarGroup.add(rightArmGroup);

// --- LEFT ARM STRUCTURE ---
const leftArmGroup = new THREE.Group();
leftArmGroup.position.set(-0.25, 1.2, 0); // Pivot at left shoulder

// Left Shoulder Joint
const leftShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), matJoint);
leftArmGroup.add(leftShoulder);

// Left Upper Arm
const leftUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.3, 16), matBody);
leftUpperArm.position.set(0, -0.15, 0); // Extends downward from shoulder
leftArmGroup.add(leftUpperArm);

// Left Forearm Group (Pivots at Left Elbow)
const leftForearmGroup = new THREE.Group();
leftForearmGroup.position.set(0, -0.3, 0); // Positioned at bottom of upper arm

const leftElbow = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), matJoint);
leftForearmGroup.add(leftElbow);

const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.28, 16), matBody);
leftForearm.position.set(0, -0.14, 0);
leftForearmGroup.add(leftForearm);

// Left Hand
const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.02), matHand);
leftHand.position.set(0, -0.3, 0);
leftForearmGroup.add(leftHand);

leftArmGroup.add(leftForearmGroup);
avatarGroup.add(leftArmGroup);

// Lower Base / Pelvis
const basePillar = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.5, 16), matBody);
basePillar.position.set(0, 0.4, 0);
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

    document.getElementById('glossOutput').innerText = "Translating via Colab Engine...";

    try {
        const response = await fetch(`${API_BASE_URL}/translate_text`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });

        const data = await response.json();
        if (response.ok) {
            document.getElementById('glossOutput').innerText = data.glosses.join(" ");
            animateAvatarGestures(data.glosses);
        } else {
            document.getElementById('glossOutput').innerText = "Translation Error: " + data.detail;
        }
    } catch (error) {
        document.getElementById('glossOutput').innerText = "API Connection Failed. Ensure Colab server is running.";
        console.error("Fetch Error:", error);
    }
}

// Dictionary mapping Glosses to specific 3D joint rotations (Angles in Radians)
const SIGN_DICTIONARY = {
    "I": [
        { rArmX: -0.8, rArmZ: -0.2, rElbowX: -1.2, lArmX: 0, lArmZ: 0, lElbowX: 0, duration: 400 }
    ],
    "GO": [
        { rArmX: -0.6, rArmZ: -0.5, rElbowX: -0.8, lArmX: -0.6, lArmZ: 0.5, lElbowX: -0.8, duration: 400 },
        { rArmX: -1.0, rArmZ: -0.2, rElbowX: -0.3, lArmX: -1.0, lArmZ: 0.2, lElbowX: -0.3, duration: 400 }
    ],
    "HOME": [
        { rArmX: -1.2, rArmZ: -0.3, rElbowX: -1.4, lArmX: 0, lArmZ: 0, lElbowX: 0, duration: 500 }
    ]
};

// Sequential Pose Player
async function animateAvatarGestures(glosses) {
    if (!glosses || glosses.length === 0) return;

    for (let gloss of glosses) {
        const poses = SIGN_DICTIONARY[gloss] || [
            { rArmX: -0.8, rArmZ: -0.3, rElbowX: -0.8, lArmX: -0.8, lArmZ: 0.3, lElbowX: -0.8, duration: 400 },
            { rArmX: 0, rArmZ: 0, rElbowX: 0, lArmX: 0, lArmZ: 0, lElbowX: 0, duration: 400 }
        ];

        for (let pose of poses) {
            await applyPose(pose);
        }
    }

    // Return to default neutral posture
    await applyPose({ rArmX: 0, rArmZ: 0, rElbowX: 0, lArmX: 0, lArmZ: 0, lElbowX: 0, duration: 300 });
}

function applyPose(targetPose) {
    return new Promise((resolve) => {
        let startTime = performance.now();
        let startRArmX = rightArmGroup.rotation.x;
        let startRArmZ = rightArmGroup.rotation.z;
        let startRElbowX = rightForearmGroup.rotation.x;

        let startLArmX = leftArmGroup.rotation.x;
        let startLArmZ = leftArmGroup.rotation.z;
        let startLElbowX = leftForearmGroup.rotation.x;

        function step(currentTime) {
            let elapsed = currentTime - startTime;
            let progress = Math.min(elapsed / targetPose.duration, 1.0);

            // Interpolate Right Arm
            rightArmGroup.rotation.x = startRArmX + (targetPose.rArmX - startRArmX) * progress;
            rightArmGroup.rotation.z = startRArmZ + (targetPose.rArmZ - startRArmZ) * progress;
            rightForearmGroup.rotation.x = startRElbowX + (targetPose.rElbowX - startRElbowX) * progress;

            // Interpolate Left Arm
            leftArmGroup.rotation.x = startLArmX + (targetPose.lArmX - startLArmX) * progress;
            leftArmGroup.rotation.z = startLArmZ + (targetPose.lArmZ - startLArmZ) * progress;
            leftForearmGroup.rotation.x = startLElbowX + (targetPose.lElbowX - startLElbowX) * progress;

            if (progress < 1.0) {
                requestAnimationFrame(step);
            } else {
                resolve();
            }
        }
        requestAnimationFrame(step);
    });
}

function toggleRecord() {
    const btn = document.getElementById('recordBtn');
    btn.innerText = btn.innerText.includes("Record") ? "🛑 Stop Recording" : "🎤 Record Voice";
}