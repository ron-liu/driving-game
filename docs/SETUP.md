# 🛠️ Setup & Development Guide

## 🚀 Quick Start (No Technical Experience Required)

### Option 1: Simple File Opening
1. **Download** or copy the project files to your computer
2. **Navigate** to the project folder
3. **Double-click** `index.html` to open in your web browser
4. **Allow camera access** when prompted
5. **Start playing!**

### Option 2: Local Web Server (Recommended for Development)
```bash
# If you have Python installed:
cd driving-game
python -m http.server 8000

# Then open: http://localhost:8000
```

---

## 💻 Development Environment Setup

### Required Software
**Essential (Free)**
- **Web Browser**: Chrome, Firefox, Safari, or Edge (latest version)
- **Text Editor**: Any of these excellent free options:
  - [Visual Studio Code](https://code.visualstudio.com/) (Recommended)
  - [Atom](https://atom.io/)
  - [Sublime Text](https://www.sublimetext.com/)
  - Even Notepad/TextEdit works!

**Optional (For Advanced Features)**
- **Python** (for local web server): [python.org](https://python.org)
- **Node.js** (for package management): [nodejs.org](https://nodejs.org)
- **Git** (for version control): [git-scm.com](https://git-scm.com)

### Browser Requirements
- **Camera Permission**: Required for hand tracking
- **Modern JavaScript Support**: ES6+ features
- **Canvas API**: For game graphics
- **WebRTC**: For camera access

#### Tested Browsers
- ✅ Chrome 90+ (Recommended)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ❌ Internet Explorer (Not supported)

---

## 📁 Project Structure Explained

```
driving-game/
├── index.html              # Main game page (open this!)
├── game.js                 # Game logic and hand tracking
├── README.md              # Project overview and features
├── PROGRESS.md            # Development tracking
└── docs/                  # Additional documentation
    ├── ROADMAP.md         # Future features and enhancements
    ├── LEARNING.md        # Educational goals and teaching guide
    └── SETUP.md          # This setup guide
```

### File Responsibilities

**`index.html`** - The main web page containing:
- HTML structure and layout
- CSS styling for beautiful appearance
- External library imports (MediaPipe, p5.js)
- Video feed and game canvas elements
- Control buttons and status displays

**`game.js`** - The complete game logic including:
- MediaPipe hand tracking setup and processing
- Game state management (start, pause, game over)
- Player car movement and obstacle generation
- Collision detection and scoring system
- Canvas rendering and visual effects

---

## 🔧 Customization Guide

### 🎨 Easy Visual Modifications

#### Change Colors
```javascript
// In game.js, find these lines:

// Player car color (around line 45)
playerCar = {
    color: '#00ff00'  // Green - change to any color!
};

// Obstacle car color (around line 200)
obstacles.push({
    color: '#ff0000'  // Red - change to any color!
});
```

#### Color Reference
```css
'#ff0000' = Red      '#00ff00' = Green    '#0000ff' = Blue
'#ffff00' = Yellow   '#ff00ff' = Magenta  '#00ffff' = Cyan
'#ffa500' = Orange   '#800080' = Purple   '#ffc0cb' = Pink
'#000000' = Black    '#ffffff' = White    '#808080' = Gray
```

#### Adjust Game Canvas Size
```html
<!-- In index.html, find this line: -->
<canvas id="gameCanvas" width="400" height="600"></canvas>

<!-- Change width/height to your preferred size -->
<canvas id="gameCanvas" width="800" height="600"></canvas>
```

#### Modify UI Colors and Styles
```html
<!-- In index.html, look for the <style> section -->
<style>
    body {
        background: linear-gradient(135deg, #1e3c72, #2a5298);
        /* Change these colors for different background */
    }

    button {
        background: linear-gradient(45deg, #ff6b6b, #ee5a24);
        /* Change these for different button colors */
    }
</style>
```

### ⚙️ Gameplay Modifications

#### Difficulty Adjustments
```javascript
// Make obstacles appear more/less frequently
if (Math.random() < 0.02) {  // Current: 2% chance per frame
    // Change to 0.01 for easier (1% chance)
    // Change to 0.03 for harder (3% chance)
    addObstacle();
}

// Control speed increase rate
gameSpeed = 2 + score * 0.001;  // Current rate
// Change to 0.0005 for slower increase
// Change to 0.002 for faster increase
```

#### Scoring System
```javascript
// Points awarded for avoiding obstacles
score += 10;  // Change this number for different point values

// Starting game speed
let gameSpeed = 2;  // Change for faster/slower start
```

#### Car Movement Sensitivity
```javascript
// Steering sensitivity
playerCar.x += steeringAngle * 5;  // Current multiplier is 5
// Change to 3 for less sensitive steering
// Change to 7 for more sensitive steering

// Hand tracking sensitivity
steeringAngle = Math.max(-1, Math.min(1, deltaX * 5));
// Change the final 5 to adjust gesture sensitivity
```

---

## 🐛 Troubleshooting Common Issues

### Camera/Hand Tracking Problems

#### "Camera not working" or "No camera permission"
**Solution**:
1. Refresh the page and click "Allow" when asked for camera permission
2. Check if another application is using the camera
3. Try a different browser
4. Ensure camera is properly connected (for external cameras)

#### "Hand tracking not detecting hands"
**Possible causes and solutions**:
- **Poor lighting**: Move to a well-lit area
- **Hands too close/far**: Stay 2-3 feet from camera
- **Background interference**: Try a plain background behind you
- **Browser compatibility**: Use Chrome for best results

#### "Hand tracking is jittery or inaccurate"
**Solutions**:
- Ensure stable lighting (avoid changing light conditions)
- Keep hands steady and make deliberate movements
- Clear the camera lens
- Adjust the smoothing factor in code:
```javascript
// In game.js, find this line and adjust the values:
steeringAngle = steeringAngle * 0.8 + (steeringAngle * 0.2);
// Increase 0.8 toward 0.9 for more smoothing
```

### Game Performance Issues

#### "Game is running slowly or choppy"
**Solutions**:
- Close other browser tabs and applications
- Try a different browser
- Reduce the game canvas size
- Lower the frame rate:
```javascript
// Change from 60 FPS to 30 FPS
setInterval(gameLoop, 1000/30); // Was 1000/60
```

#### "Browser freezes or crashes"
**Solutions**:
- Clear browser cache and cookies
- Disable browser extensions temporarily
- Update browser to latest version
- Try incognito/private browsing mode

### Display Issues

#### "Game canvas is too small/large"
**Solution**: Modify canvas dimensions in `index.html`:
```html
<canvas id="gameCanvas" width="800" height="600"></canvas>
```

#### "Video feed not showing"
**Solutions**:
- Check camera permissions in browser settings
- Restart browser
- Try different browser
- Check if camera is working in other applications

#### "UI elements overlapping or misaligned"
**Solution**: The CSS is responsive, but you can adjust:
```css
.game-container {
    flex-wrap: wrap;  /* Allows wrapping on small screens */
}
```

---

## 🔄 Making Changes and Testing

### Development Workflow

#### 1. Make a Backup
Before making changes, copy your working files:
```bash
# Create backup folder
mkdir backup
cp index.html backup/
cp game.js backup/
```

#### 2. Make Small Changes
- Change one thing at a time
- Test after each change
- Keep notes of what you modified

#### 3. Test Thoroughly
- Test in different browsers
- Test with different lighting conditions
- Have different people try the hand tracking
- Try different devices if available

#### 4. Document Changes
Keep track of modifications in a simple text file:
```
Changes Made:
- 2025-09-14: Changed car color from green to blue
- 2025-09-14: Increased steering sensitivity from 5 to 7
- 2025-09-15: Added sound effects (engine.mp3, crash.wav)
```

### Safe Experimentation
```javascript
// Use comments to disable code temporarily:
// score += 10;  // Temporarily disabled scoring
console.log("Score:", score);  // Add debug output

// Try variations with easy rollback:
const OLD_SPEED = 2;
const NEW_SPEED = 3;
let gameSpeed = NEW_SPEED;  // Easy to change back to OLD_SPEED
```

---

## 📦 Adding External Resources

### Adding Sound Files
1. **Create sounds folder**: `mkdir sounds`
2. **Add audio files**: Place .mp3, .wav, or .ogg files in sounds/
3. **Update game.js**:
```javascript
// Add at the top of game.js
const sounds = {
    engine: new Audio('sounds/engine.mp3'),
    crash: new Audio('sounds/crash.wav'),
    score: new Audio('sounds/beep.mp3')
};

// Use in game logic
sounds.crash.play();  // When collision occurs
```

### Adding Custom Graphics
1. **Create images folder**: `mkdir images`
2. **Add image files**: PNG, JPG, or SVG files
3. **Load in JavaScript**:
```javascript
const carImage = new Image();
carImage.src = 'images/player-car.png';

// Use in drawing function
ctx.drawImage(carImage, car.x, car.y, car.width, car.height);
```

### Adding External Libraries
```html
<!-- Add before closing </body> tag in index.html -->
<script src="https://cdn.jsdelivr.net/npm/library-name@version/library.js"></script>
```

---

## 🚀 Advanced Development Setup

### Version Control with Git
```bash
# Initialize git repository
git init
git add .
git commit -m "Initial driving game implementation"

# Create development branch
git checkout -b add-sound-effects

# After making changes
git add .
git commit -m "Add sound effects for engine and crash"
git checkout main
git merge add-sound-effects
```

### Local Development Server Options

#### Python (if installed)
```bash
# Python 3
python -m http.server 8000

# Python 2 (older systems)
python -m SimpleHTTPServer 8000
```

#### Node.js (if installed)
```bash
# Install http-server globally
npm install -g http-server

# Run server
http-server -p 8000
```

#### PHP (if installed)
```bash
php -S localhost:8000
```

### Code Organization for Larger Projects
```javascript
// Split game.js into multiple files:
// - handTracking.js: MediaPipe setup and processing
// - gameEngine.js: Core game logic
// - graphics.js: Drawing and visual effects
// - audio.js: Sound management
// - ui.js: Button handling and status updates

// Then import in index.html:
<script src="handTracking.js"></script>
<script src="gameEngine.js"></script>
<script src="graphics.js"></script>
<script src="audio.js"></script>
<script src="ui.js"></script>
```

---

## 📞 Getting Help

### Self-Help Resources
1. **Browser Developer Tools**: Press F12 to see error messages
2. **Console Logging**: Add `console.log()` statements to debug
3. **Online References**:
   - [MDN Web Docs](https://developer.mozilla.org/) - JavaScript reference
   - [MediaPipe Documentation](https://mediapipe.dev/) - Hand tracking details

### Community Support
- **Stack Overflow**: Search for JavaScript game development questions
- **GitHub Issues**: Report bugs or ask questions in project repositories
- **Reddit**: r/gamedev, r/javascript, r/webdev communities

### Error Message Decoder
```
"Cannot read property 'x' of undefined"
→ An object is null/undefined when you try to access its properties

"Failed to execute 'getContext' on 'HTMLCanvasElement'"
→ Canvas element not found or not properly created

"Permission denied" (camera)
→ User needs to allow camera access or browser policy blocks it

"Script error"
→ Usually a CORS issue - use local server instead of file:// protocol
```

Remember: Every programmer encounters errors and problems. The key is to read error messages carefully, search for solutions, and experiment with small changes to understand what works!