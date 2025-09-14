// Game variables
let gameCanvas;
let playerCar;
let obstacles = [];
let score = 0;
let gameSpeed = 2;
let gameRunning = false;
let gameOver = false;

// Image assets
let images = {};
let imagesLoaded = false;
let dinoAnimations = {
    walk: [],
    run: [],
    idle: []
};

// Animation frame tracking
let animationFrame = 0;
let animationSpeed = 0.2; // How fast to cycle through animation frames

// Difficulty settings
let difficultySettings = {
    easy: { spawnRate: 0.003, name: 'Easy' },      // Very few cars
    medium: { spawnRate: 0.008, name: 'Medium' },  // Medium cars
    hard: { spawnRate: 0.015, name: 'Hard' }       // Many cars
};
let currentDifficulty = 'easy';

// Face detection variables
let faceDetection;
let camera;
let faceDetected = null;
let steeringAngle = 0; // -1 (left) to 1 (right)
let gameStarted = false;

// UI elements
let handStatusEl;
let gameStatusEl;
let startBtn;
let resetBtn;
let difficultySelect;

// Load images
function loadImages() {
    const imagePromises = [];

    // Load Cybertruck
    images.cybertruck = new Image();
    imagePromises.push(new Promise((resolve) => {
        images.cybertruck.onload = resolve;
        images.cybertruck.src = 'images/cybertruck.png';
    }));

    // Load dinosaur walk animation
    for (let i = 1; i <= 10; i++) {
        const img = new Image();
        imagePromises.push(new Promise((resolve) => {
            img.onload = resolve;
            img.src = `images/png/Walk (${i}).png`;
        }));
        dinoAnimations.walk.push(img);
    }

    // Load dinosaur run animation
    for (let i = 1; i <= 8; i++) {
        const img = new Image();
        imagePromises.push(new Promise((resolve) => {
            img.onload = resolve;
            img.src = `images/png/Run (${i}).png`;
        }));
        dinoAnimations.run.push(img);
    }

    // Load dinosaur idle animation
    for (let i = 1; i <= 10; i++) {
        const img = new Image();
        imagePromises.push(new Promise((resolve) => {
            img.onload = resolve;
            img.src = `images/png/Idle (${i}).png`;
        }));
        dinoAnimations.idle.push(img);
    }

    // Wait for all images to load
    Promise.all(imagePromises).then(() => {
        imagesLoaded = true;
        console.log('All images loaded successfully!');
    });
}

// Initialize the game when page loads
function setup() {
    // Load images first
    loadImages();

    // Get canvas element and set up p5.js
    gameCanvas = document.getElementById('gameCanvas');
    let canvas = createCanvas(480, 600);
    canvas.parent('gameCanvas');
    canvas.remove(); // Remove p5.js default canvas

    // Use the existing canvas
    let ctx = gameCanvas.getContext('2d');

    // Initialize Cybertruck (adjusted for screen size)
    playerCar = {
        x: 240,  // Center of 480px width
        y: 550,  // Near bottom of 600px height
        width: 80,   // Wider for Cybertruck image
        height: 100,  // Taller for Cybertruck image
        type: 'cybertruck'
    };

    // Get UI elements
    handStatusEl = document.getElementById('handStatus');
    gameStatusEl = document.getElementById('gameStatus');
    startBtn = document.getElementById('startBtn');
    resetBtn = document.getElementById('resetBtn');
    difficultySelect = document.getElementById('difficulty');

    // Set up button events
    startBtn.addEventListener('click', toggleGame);
    resetBtn.addEventListener('click', resetGame);

    // Set up difficulty selector
    difficultySelect.addEventListener('change', function() {
        currentDifficulty = this.value;
        console.log('Difficulty changed to:', difficultySettings[currentDifficulty].name);
    });

    // Initialize face detection
    initializeFaceDetection();

    // Start game loop
    setInterval(gameLoop, 1000/60); // 60 FPS
}

// Initialize MediaPipe face detection
function initializeFaceDetection() {
    // Configure MediaPipe Face Detection
    faceDetection = new FaceDetection({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
        }
    });

    faceDetection.setOptions({
        model: 'short',
        minDetectionConfidence: 0.5
    });

    faceDetection.onResults(onFaceResults);

    // Set up camera
    const videoElement = document.getElementById('video');
    camera = new Camera(videoElement, {
        onFrame: async () => {
            await faceDetection.send({image: videoElement});
        },
        width: 320,
        height: 240
    });

    camera.start();
    handStatusEl.textContent = 'Camera ready! 👤 Show your face | Click Start or press Space to begin';
}

// Process face detection results
function onFaceResults(results) {
    if (results.detections && results.detections.length > 0) {
        // Use first detected face
        const face = results.detections[0];
        faceDetected = face;

        // Calculate steering from head position
        calculateSteeringFromHead(face);

        // Update status
        handStatusEl.textContent = `✅ Face detected | ${!gameRunning ? '👤 Move head to steer | Click Start' : 'Playing - Move head left/right!'}`;
    } else {
        handStatusEl.textContent = '👤 Show your face in the camera to steer!';
        steeringAngle = 0; // Center the car when no face detected
        faceDetected = null;
    }
}

// Calculate steering from head/face position
function calculateSteeringFromHead(face) {
    // Get face bounding box
    const boundingBox = face.boundingBox;

    // Calculate face center X position (normalized 0-1)
    const faceCenterX = boundingBox.xCenter;

    // Calculate head position relative to screen center (0.5 is center)
    const screenCenter = 0.5;
    const headOffset = screenCenter - faceCenterX; // FIXED: reversed calculation for correct direction

    // Convert head position to steering angle
    // Left head movement = left steering, right head movement = right steering
    let rawSteering = headOffset * 3.0; // Good sensitivity for head movement

    // Clamp to valid range
    rawSteering = Math.max(-1, Math.min(1, rawSteering));

    // Apply gentle sensitivity curve for natural head movement control
    const sensitizedAngle = Math.sign(rawSteering) * Math.pow(Math.abs(rawSteering), 0.9) * 0.9;

    // Smooth the steering for natural head movement
    steeringAngle = steeringAngle * 0.8 + sensitizedAngle * 0.2;
}

// Add keyboard support for starting game
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        event.preventDefault();
        if (!gameRunning && !gameOver) {
            toggleGame();
        } else if (gameOver) {
            resetGame();
        }
    }
});

// Main game loop
function gameLoop() {
    updateGame();
    drawGame();
}

// Update game logic
function updateGame() {
    if (!gameRunning || gameOver) return;

    // Move player car based on steering
    playerCar.x += steeringAngle * 5;

    // Keep car on screen (adjusted for 480px width)
    playerCar.x = Math.max(playerCar.width/2, Math.min(480 - playerCar.width/2, playerCar.x));

    // Move obstacles down
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].y += gameSpeed;

        // Remove obstacles that are off screen (adjusted for 600px height)
        if (obstacles[i].y > 600) {
            obstacles.splice(i, 1);
            score += 10; // Score for avoiding an obstacle
        }
    }

    // Add new obstacles based on selected difficulty
    const currentSpawnRate = difficultySettings[currentDifficulty].spawnRate;
    if (Math.random() < currentSpawnRate) {
        addObstacle();
    }

    // Check collisions
    checkCollisions();

    // Increase game speed gradually (slower increase for gentler difficulty)
    gameSpeed = 2 + score * 0.0005;  // Changed from 0.001 to 0.0005 (slower speed increase)

    // Update status with difficulty info
    const difficultyName = difficultySettings[currentDifficulty].name;
    gameStatusEl.textContent = `Score: ${score} | Speed: ${gameSpeed.toFixed(1)} | Difficulty: ${difficultyName}`;
}

// Add a new dinosaur obstacle with size variations
function addObstacle() {
    const dinoTypes = [
        {
            type: 'trex',
            baseWidth: 50,
            baseHeight: 70,
            colors: ['#8B4513', '#A0522D', '#654321'] // Different brown shades
        },
        {
            type: 'ankylosaurus',
            baseWidth: 60,
            baseHeight: 45,
            colors: ['#556B2F', '#6B8E23', '#808000'] // Different olive shades
        },
        {
            type: 'stegosaurus',
            baseWidth: 65,
            baseHeight: 55,
            colors: ['#6B8E23', '#9ACD32', '#228B22'] // Different green shades
        }
    ];

    // Random size variation (small, medium, large)
    const sizeVariations = [
        { scale: 0.7, name: 'small' },   // Small dinosaur
        { scale: 1.0, name: 'medium' },  // Normal size
        { scale: 1.4, name: 'large' }    // Large dinosaur
    ];

    const randomDino = dinoTypes[Math.floor(Math.random() * dinoTypes.length)];
    const randomSize = sizeVariations[Math.floor(Math.random() * sizeVariations.length)];
    const randomColor = randomDino.colors[Math.floor(Math.random() * randomDino.colors.length)];

    const finalWidth = Math.floor(randomDino.baseWidth * randomSize.scale);
    const finalHeight = Math.floor(randomDino.baseHeight * randomSize.scale);

    obstacles.push({
        x: Math.random() * (480 - finalWidth), // Random x position
        y: -finalHeight, // Start above screen
        width: finalWidth,
        height: finalHeight,
        type: randomDino.type,
        color: randomColor,
        size: randomSize.name,
        scale: randomSize.scale
    });
}

// Check for collisions
function checkCollisions() {
    for (let obstacle of obstacles) {
        if (isColliding(playerCar, obstacle)) {
            gameOver = true;
            gameRunning = false;
            handStatusEl.textContent = `💥 Game Over! Final Score: ${score}`;
            startBtn.textContent = 'Play Again';
            break;
        }
    }
}

// Simple collision detection
function isColliding(car1, car2) {
    return car1.x < car2.x + car2.width &&
           car1.x + car1.width > car2.x &&
           car1.y < car2.y + car2.height &&
           car1.y + car1.height > car2.y;
}

// Draw the game
function drawGame() {
    const ctx = gameCanvas.getContext('2d');

    // Update animation frame for sprite animations
    if (gameRunning) {
        animationFrame += animationSpeed;
    }

    // Draw forest background
    drawForestBackground(ctx);

    // Draw Cybertruck
    drawCybertruck(ctx, playerCar);

    // Draw dinosaur obstacles
    for (let obstacle of obstacles) {
        drawDinosaur(ctx, obstacle);
    }

    // Draw steering indicator (adjusted for screen size)
    if (Math.abs(steeringAngle) > 0.1) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        const direction = steeringAngle > 0 ? '→' : '←';
        ctx.fillText(direction, 240, 50);
    }

    // Draw game over message (adjusted for screen size)
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, 480, 600);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', 240, 280);

        ctx.font = '22px Arial';
        ctx.fillText(`Score: ${score}`, 240, 320);

        ctx.font = '16px Arial';
        ctx.fillText('Click "Play Again" to restart', 240, 360);
    }
}

// Draw forest background
function drawForestBackground(ctx) {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 600);
    gradient.addColorStop(0, '#87CEEB');  // Sky blue
    gradient.addColorStop(0.7, '#98FB98'); // Pale green
    gradient.addColorStop(1, '#228B22');   // Forest green
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 480, 600);

    // Draw trees in background
    for (let i = 0; i < 15; i++) {
        const x = (i * 35) + (i % 3) * 10;
        const y = 100 + Math.random() * 50;
        drawTree(ctx, x, y, 30 + Math.random() * 20);
    }

    // Draw grass path
    ctx.fillStyle = '#9ACD32'; // Yellow green grass
    ctx.fillRect(80, 0, 320, 600); // Center path for Cybertruck

    // Add some grass texture
    ctx.fillStyle = '#32CD32'; // Lime green
    for (let i = 0; i < 50; i++) {
        const x = 80 + Math.random() * 320;
        const y = Math.random() * 600;
        ctx.fillRect(x, y, 2, 8);
    }
}

// Draw a simple tree
function drawTree(ctx, x, y, height) {
    // Tree trunk
    ctx.fillStyle = '#8B4513'; // Saddle brown
    ctx.fillRect(x - 5, y, 10, height);

    // Tree leaves
    ctx.fillStyle = '#228B22'; // Forest green
    ctx.beginPath();
    ctx.arc(x, y - height/3, height/3, 0, 2 * Math.PI);
    ctx.fill();
}

// Draw Cybertruck - more detailed and realistic
function drawCybertruck(ctx, truck) {
    if (!imagesLoaded || !images.cybertruck) return;

    const x = truck.x - truck.width/2;
    const y = truck.y - truck.height/2;

    // Add shadow for depth
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(x + 2, y + truck.height + 2, truck.width - 2, 4);

    // Draw the Cybertruck image
    ctx.drawImage(images.cybertruck, x, y, truck.width, truck.height);
}

// Helper function to darken/lighten colors
function shadeColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

// Draw different types of dinosaurs
function drawDinosaur(ctx, dino) {
    if (!imagesLoaded || dinoAnimations.walk.length === 0) return;

    const x = dino.x - dino.width/2;
    const y = dino.y - dino.height/2;

    // Add shadow for depth
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(x + 2, y + dino.height + 2, dino.width - 2, 3);

    // Choose animation based on game speed and dinosaur type
    let animationArray;
    if (gameSpeed > 4) {
        animationArray = dinoAnimations.run;
    } else if (gameSpeed > 2) {
        animationArray = dinoAnimations.walk;
    } else {
        animationArray = dinoAnimations.idle;
    }

    // Get current animation frame
    const frameIndex = Math.floor(animationFrame) % animationArray.length;
    const currentFrame = animationArray[frameIndex];

    // Draw the dinosaur sprite
    ctx.drawImage(currentFrame, x, y, dino.width, dino.height);
}

// Draw T-Rex - more detailed and realistic
function drawTRex(ctx, x, y, width, height, color) {
    // Add shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x + 2, y + height + 2, width - 2, 3);

    // Body with gradient
    const bodyGradient = ctx.createLinearGradient(x, y, x + width, y + height);
    bodyGradient.addColorStop(0, color);
    bodyGradient.addColorStop(0.7, shadeColor(color, -20));
    bodyGradient.addColorStop(1, shadeColor(color, -40));
    ctx.fillStyle = bodyGradient;

    // Main body (oval-like)
    ctx.beginPath();
    ctx.ellipse(x + width/2, y + height*0.6, width*0.3, height*0.25, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Head (larger and more detailed)
    ctx.beginPath();
    ctx.ellipse(x + width*0.2, y + height*0.25, width*0.25, height*0.2, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Snout
    ctx.fillStyle = shadeColor(color, -10);
    ctx.beginPath();
    ctx.ellipse(x + width*0.05, y + height*0.28, width*0.15, height*0.08, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Powerful legs
    ctx.fillStyle = shadeColor(color, -15);
    // Left leg
    ctx.fillRect(x + width*0.35, y + height*0.75, width*0.12, height*0.25);
    // Right leg
    ctx.fillRect(x + width*0.55, y + height*0.75, width*0.12, height*0.25);

    // Feet with claws
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(x + width*0.32, y + height*0.95, width*0.18, height*0.08);
    ctx.fillRect(x + width*0.52, y + height*0.95, width*0.18, height*0.08);

    // Tiny arms (characteristic of T-Rex)
    ctx.fillStyle = shadeColor(color, -30);
    ctx.fillRect(x + width*0.45, y + height*0.45, width*0.08, height*0.15);
    ctx.fillRect(x + width*0.55, y + height*0.45, width*0.08, height*0.15);

    // Tail
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x + width*0.85, y + height*0.65, width*0.2, height*0.12, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Eyes (menacing)
    ctx.fillStyle = '#FF4444';
    ctx.beginPath();
    ctx.arc(x + width*0.15, y + height*0.2, width*0.03, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + width*0.25, y + height*0.2, width*0.03, 0, 2 * Math.PI);
    ctx.fill();

    // Teeth
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 4; i++) {
        const toothX = x + width*0.02 + i * width*0.03;
        ctx.fillRect(toothX, y + height*0.3, width*0.015, height*0.04);
    }
}

// Draw Ankylosaurus - more detailed and realistic
function drawAnkylosaurus(ctx, x, y, width, height, color) {
    // Add shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x + 2, y + height + 2, width - 2, 3);

    // Body with gradient (low and wide, armored look)
    const bodyGradient = ctx.createLinearGradient(x, y, x + width, y + height);
    bodyGradient.addColorStop(0, color);
    bodyGradient.addColorStop(0.5, shadeColor(color, -15));
    bodyGradient.addColorStop(1, shadeColor(color, -30));
    ctx.fillStyle = bodyGradient;

    // Main body (wide and low)
    ctx.beginPath();
    ctx.ellipse(x + width*0.5, y + height*0.6, width*0.4, height*0.2, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Head (small and low)
    ctx.beginPath();
    ctx.ellipse(x + width*0.15, y + height*0.55, width*0.15, height*0.12, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Four short, sturdy legs
    ctx.fillStyle = shadeColor(color, -20);
    // Front legs
    ctx.fillRect(x + width*0.25, y + height*0.75, width*0.08, height*0.25);
    ctx.fillRect(x + width*0.35, y + height*0.75, width*0.08, height*0.25);
    // Back legs
    ctx.fillRect(x + width*0.55, y + height*0.75, width*0.08, height*0.25);
    ctx.fillRect(x + width*0.65, y + height*0.75, width*0.08, height*0.25);

    // Armor plates on back
    ctx.fillStyle = shadeColor(color, -40);
    for (let i = 0; i < 5; i++) {
        const plateX = x + width*0.25 + i * width*0.1;
        ctx.beginPath();
        ctx.ellipse(plateX, y + height*0.45, width*0.04, height*0.08, 0, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Armor spikes along sides
    ctx.fillStyle = '#4A4A4A';
    for (let i = 0; i < 6; i++) {
        const spikeX = x + width*0.2 + i * width*0.12;
        ctx.beginPath();
        ctx.moveTo(spikeX, y + height*0.55);
        ctx.lineTo(spikeX + width*0.02, y + height*0.45);
        ctx.lineTo(spikeX + width*0.04, y + height*0.55);
        ctx.closePath();
        ctx.fill();
    }

    // Massive club tail
    ctx.fillStyle = shadeColor(color, -25);
    ctx.beginPath();
    ctx.ellipse(x + width*0.9, y + height*0.6, width*0.12, height*0.15, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Club spikes
    ctx.fillStyle = '#3A3A3A';
    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const spikeX = x + width*0.9 + Math.cos(angle) * width*0.08;
        const spikeY = y + height*0.6 + Math.sin(angle) * height*0.1;
        ctx.fillRect(spikeX, spikeY, width*0.03, height*0.05);
    }

    // Eyes
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(x + width*0.1, y + height*0.5, width*0.02, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + width*0.18, y + height*0.5, width*0.02, 0, 2 * Math.PI);
    ctx.fill();
}

// Draw Stegosaurus
function drawStegosaurus(ctx, x, y, width, height, color) {
    // Add shadow for depth
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(x + 2, y + height - 2, width - 2, 3);

    // Body with gradient
    const bodyGradient = ctx.createLinearGradient(x, y + 20, x, y + height - 10);
    bodyGradient.addColorStop(0, color);
    bodyGradient.addColorStop(0.5, shadeColor(color, 20));
    bodyGradient.addColorStop(1, shadeColor(color, -15));
    ctx.fillStyle = bodyGradient;

    // Main body (curved)
    ctx.beginPath();
    ctx.ellipse(x + width/2, y + height/2 + 5, width/2 - 15, height/3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body top line
    ctx.beginPath();
    ctx.ellipse(x + width/2, y + height/2 - 5, width/2 - 18, height/4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head with gradient (small and low)
    const headGradient = ctx.createLinearGradient(x, y + 18, x + 20, y + 32);
    headGradient.addColorStop(0, shadeColor(color, 10));
    headGradient.addColorStop(1, shadeColor(color, -10));
    ctx.fillStyle = headGradient;

    ctx.beginPath();
    ctx.ellipse(x + 10, y + 25, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x + 6, y + 23, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Legs with gradient
    const legGradient = ctx.createLinearGradient(x, y + height - 18, x, y + height);
    legGradient.addColorStop(0, shadeColor(color, 5));
    legGradient.addColorStop(1, shadeColor(color, -20));
    ctx.fillStyle = legGradient;

    // Four sturdy legs
    const legPositions = [22, 32, width - 34, width - 24];
    legPositions.forEach(legX => {
        ctx.beginPath();
        ctx.ellipse(x + legX + 3, y + height - 8, 4, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Feet
        ctx.fillStyle = shadeColor(color, -30);
        ctx.fillRect(x + legX, y + height - 3, 8, 3);
    });

    // Iconic back plates with realistic coloring
    const plateColors = ['#8FBC8F', '#7FBC7F', '#9FCC9F', '#8FAC8F'];
    for (let i = 0; i < 5; i++) {
        const plateX = x + 25 + i * 8;
        const plateHeight = 18 + Math.sin(i * 0.6) * 6;
        const plateColor = plateColors[i % plateColors.length];

        // Plate gradient
        const plateGradient = ctx.createLinearGradient(plateX, y, plateX + 8, y + 20);
        plateGradient.addColorStop(0, plateColor);
        plateGradient.addColorStop(0.7, shadeColor(plateColor, 15));
        plateGradient.addColorStop(1, shadeColor(plateColor, -10));
        ctx.fillStyle = plateGradient;

        // Draw plate as triangle
        ctx.beginPath();
        ctx.moveTo(plateX + 1, y + 20 - plateHeight * 0.3);
        ctx.lineTo(plateX + 4, y + 5);
        ctx.lineTo(plateX + 7, y + 20 - plateHeight * 0.3);
        ctx.closePath();
        ctx.fill();

        // Plate highlight
        ctx.fillStyle = shadeColor(plateColor, 25);
        ctx.beginPath();
        ctx.moveTo(plateX + 2, y + 18 - plateHeight * 0.3);
        ctx.lineTo(plateX + 4, y + 7);
        ctx.lineTo(plateX + 4.5, y + 18 - plateHeight * 0.3);
        ctx.closePath();
        ctx.fill();
    }

    // Neck
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.ellipse(x + 18, y + 22, 6, 4, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Tail with spikes
    const tailGradient = ctx.createLinearGradient(x + width - 20, y + 25, x + width + 5, y + 40);
    tailGradient.addColorStop(0, color);
    tailGradient.addColorStop(1, shadeColor(color, -15));
    ctx.fillStyle = tailGradient;

    // Tail body
    ctx.beginPath();
    ctx.ellipse(x + width - 10, y + 32, 12, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Tail spikes (thagomizer)
    const spikePositions = [
        {x: x + width - 8, y: y + 26, size: 6},
        {x: x + width - 3, y: y + 28, size: 8},
        {x: x + width - 6, y: y + 34, size: 6},
        {x: x + width - 1, y: y + 36, size: 7}
    ];

    ctx.fillStyle = '#A0522D'; // Sienna for spikes
    spikePositions.forEach(spike => {
        ctx.beginPath();
        ctx.moveTo(spike.x, spike.y);
        ctx.lineTo(spike.x + spike.size * 0.7, spike.y - spike.size);
        ctx.lineTo(spike.x + spike.size, spike.y + 2);
        ctx.closePath();
        ctx.fill();

        // Spike highlight
        ctx.fillStyle = '#CD853F';
        ctx.beginPath();
        ctx.moveTo(spike.x + 1, spike.y);
        ctx.lineTo(spike.x + spike.size * 0.7, spike.y - spike.size + 1);
        ctx.lineTo(spike.x + 2, spike.y);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#A0522D';
    });
}

// Toggle game start/stop
function toggleGame() {
    if (gameOver) {
        // Restart game
        resetGame();
    }

    gameRunning = !gameRunning;

    if (gameRunning) {
        startBtn.textContent = 'Pause Game';
        handStatusEl.textContent = 'Game started! Use your hands to steer! 🎮';
    } else {
        startBtn.textContent = 'Resume Game';
        handStatusEl.textContent = 'Game paused. Click Resume to continue.';
    }
}

// Reset game
function resetGame() {
    obstacles = [];
    score = 0;
    gameSpeed = 2;
    gameOver = false;
    gameRunning = false;
    playerCar.x = 200;
    steeringAngle = 0;

    startBtn.textContent = 'Start Game';
    handStatusEl.textContent = 'Game reset! Ready to play again 🚗';
    gameStatusEl.textContent = 'Score: 0 | Speed: 1';
}

// Leaderboard functionality
const LEADERBOARD_KEY = 'cybertruckLeaderboard';
let leaderboard = [];

// Load leaderboard from localStorage
function loadLeaderboard() {
    const saved = localStorage.getItem(LEADERBOARD_KEY);
    if (saved) {
        leaderboard = JSON.parse(saved);
    } else {
        // Initialize with some demo scores
        leaderboard = [
            { name: 'CyberPilot', score: 500 },
            { name: 'DinoHunter', score: 350 },
            { name: 'TruckMaster', score: 200 },
            { name: 'SpeedRacer', score: 150 },
            { name: 'RoadWarrior', score: 100 }
        ];
        saveLeaderboard();
    }
    updateLeaderboardDisplay();
}

// Save leaderboard to localStorage
function saveLeaderboard() {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
}

// Add a new score to the leaderboard
function addToLeaderboard(name, score) {
    leaderboard.push({ name, score });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 5); // Keep only top 5
    saveLeaderboard();
    updateLeaderboardDisplay();
}

// Update the leaderboard display
function updateLeaderboardDisplay() {
    const leaderboardList = document.getElementById('leaderboardList');
    if (!leaderboardList) return;

    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<li class="leaderboard-empty">No scores yet. Be the first!</li>';
        return;
    }

    leaderboardList.innerHTML = '';
    leaderboard.forEach((entry, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'leaderboard-item';
        
        // Highlight current score if it matches
        if (gameOver && entry.score === score && !document.querySelector('.current-player')) {
            listItem.classList.add('current-player');
        }

        const rank = document.createElement('div');
        rank.className = 'leaderboard-rank';
        if (index === 0) rank.classList.add('gold');
        else if (index === 1) rank.classList.add('silver');
        else if (index === 2) rank.classList.add('bronze');
        rank.textContent = `#${index + 1}`;

        const player = document.createElement('div');
        player.className = 'leaderboard-player';
        player.textContent = entry.name;

        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'leaderboard-score';
        scoreDiv.textContent = entry.score;

        listItem.appendChild(rank);
        listItem.appendChild(player);
        listItem.appendChild(scoreDiv);
        leaderboardList.appendChild(listItem);
    });
}

// Check if score qualifies for leaderboard
function checkHighScore() {
    if (score > 0 && (leaderboard.length < 5 || score > leaderboard[leaderboard.length - 1].score)) {
        // Ask for player name
        setTimeout(() => {
            const playerName = prompt(`🎉 High Score: ${score}! Enter your name for the leaderboard:`) || 'Anonymous';
            addToLeaderboard(playerName, score);
        }, 500);
    }
}

// Modified checkCollisions to include high score check
const originalCheckCollisions = checkCollisions;
checkCollisions = function() {
    for (let obstacle of obstacles) {
        if (isColliding(playerCar, obstacle)) {
            gameOver = true;
            gameRunning = false;
            handStatusEl.textContent = `💥 Game Over! Final Score: ${score}`;
            startBtn.textContent = 'Play Again';
            checkHighScore(); // Check for high score
            break;
        }
    }
};

// Load leaderboard on page load
document.addEventListener('DOMContentLoaded', loadLeaderboard);

// Initialize when page loads
window.addEventListener('load', setup);