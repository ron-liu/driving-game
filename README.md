# 🚗 Archie's Hand-Controlled Driving Game

**A gesture-controlled driving game built with MediaPipe and JavaScript**

## 🎯 Project Overview

A web-based driving game where players use hand gestures to steer their car and avoid oncoming traffic. Perfect for kids and families to play together while learning programming concepts.

### 🎮 Current Features (v1.0 - COMPLETED ✅)

- **Real-time hand tracking** using MediaPipe
- **Gesture-based steering** - hold hands like a steering wheel
- **Obstacle avoidance gameplay** - dodge red cars coming from top
- **Dynamic scoring system** - points for avoiding obstacles
- **Progressive difficulty** - speed increases with score
- **Collision detection** - game over on crash
- **Responsive UI** - beautiful gradient design with game status
- **Pause/Resume functionality** - game control buttons

### 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Hand Tracking**: Google MediaPipe Hands
- **Graphics**: HTML5 Canvas API
- **Camera**: WebRTC getUserMedia API

## 📁 Project Structure

```
driving-game/
├── index.html          # Main game page with UI
├── game.js            # Game logic and hand tracking
├── README.md          # This documentation
├── PROGRESS.md        # Development progress tracking
└── docs/              # Additional documentation
    ├── ROADMAP.md     # Feature enhancement plans
    ├── LEARNING.md    # Educational goals for Archie
    └── SETUP.md       # Installation and setup guide
```

## 🚀 Quick Start

1. **Clone or download** this project
2. **Open `index.html`** in any modern web browser
3. **Allow camera access** when prompted
4. **Hold hands up** like steering wheel
5. **Click "Start Game"** and begin playing!

### Browser Requirements
- Chrome, Firefox, Safari, or Edge (latest versions)
- Camera permission required
- Internet connection for MediaPipe libraries

## 🎯 How to Play

1. **Position yourself** about 2-3 feet from the camera
2. **Hold hands up** like you're gripping a steering wheel
3. **Turn hands left/right** to steer the green car
4. **Avoid red cars** coming toward you
5. **Score points** for each obstacle avoided
6. **Watch speed increase** as you get better!

## 📊 Game Mechanics

### Steering System
- **Hand Detection**: Uses MediaPipe to track hand landmarks
- **Steering Calculation**: Compares wrist to middle finger position
- **Smoothing**: Applied to prevent jittery movements
- **Range**: -1 (full left) to +1 (full right)

### Scoring & Difficulty
- **+10 points** per obstacle avoided
- **Speed increases** by 0.001 per point scored
- **Obstacle spawn rate**: 2% chance per frame
- **Progressive challenge**: More obstacles + faster speed

### Collision Detection
- Simple rectangle-based collision system
- Game over on any collision with red obstacle cars
- Visual feedback with crash message and final score

## 🎨 Customization Options

### Easy Modifications (No Programming Experience)

**Change Car Colors** (in `game.js`):
```javascript
// Player car (line ~45)
color: '#00ff00'  // Green (change to '#0000ff' for blue)

// Obstacle cars (line ~200)
color: '#ff0000'  // Red (change to '#ff8800' for orange)
```

**Adjust Difficulty**:
```javascript
// Make obstacles appear less frequently (line ~120)
if (Math.random() < 0.02) {  // Change to 0.01 for easier

// Slower speed increase (line ~135)
gameSpeed = 2 + score * 0.001;  // Change to 0.0005 for slower
```

### Visual Customizations
- Background colors in CSS (index.html lines 15-30)
- Button styles and hover effects
- Game canvas size (currently 400x600)
- Font sizes and text colors

## 🔧 Development Environment

### Local Development
```bash
# No build process required - just open in browser
open index.html

# For development with live reload (optional)
python -m http.server 8000
# Then visit http://localhost:8000
```

### File Overview

**`index.html`** (120 lines)
- Complete HTML structure with embedded CSS
- MediaPipe and p5.js library imports
- Responsive layout with game canvas and video feed
- Button controls and status displays

**`game.js`** (300+ lines)
- Game initialization and setup
- MediaPipe hand tracking configuration
- Game loop with update/draw cycles
- Collision detection and scoring
- UI event handling

## 🎓 Learning Opportunities

Perfect for teaching:
- **Computer Vision**: Hand tracking and gesture recognition
- **Game Development**: Game loops, collision detection, scoring
- **Web Technologies**: HTML5 Canvas, JavaScript events
- **Mathematics**: Coordinate systems, angles, collision math
- **Problem Solving**: Debugging, feature enhancement

## 📈 Next Steps

See `docs/ROADMAP.md` for detailed enhancement plans and `PROGRESS.md` for current development status.

## 🤝 Contributing

This is a family project, but we welcome:
- Bug reports and suggestions
- Kid-friendly feature ideas
- Educational enhancement concepts
- Code improvements and optimizations

## 📝 License

This project is created for educational and family fun purposes. Feel free to use and modify for personal projects!