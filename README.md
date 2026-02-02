# Recalla 🎮

A modern Progressive Web App (PWA) for learning and remembering words through fun interactive games!

## ✨ Features

- **📝 Word Management**: Add your own words and meanings to create a personalized vocabulary
- **🎯 Match Game**: Interactive word-meaning matching game with smooth animations
- **🏆 Gamification**: Earn points, coins, and level up as you learn
- **🔥 Combo System**: Build combos for bonus points when matching correctly
- **📊 Statistics**: Track your progress with detailed statistics
- **🎨 Modern Design**: Clean, minimal interface inspired by world-class apps
- **✨ Smooth Interactions**: Ripple effects, press animations, and haptic-like feedback
- **💾 Local Storage**: All your data is stored locally in your browser
- **📱 PWA Support**: Install as an app on your device and use offline

## 🛠 Tech Stack

- **React 19** - Modern UI library
- **Vite 7** - Lightning-fast build tool
- **Tailwind CSS 3** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing
- **PWA Plugin** - Progressive Web App support

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/officiallygod/Recalla.git
cd Recalla
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 📦 Build for Production

```bash
npm run build
```

This will create an optimized production build in the `dist/` folder.

To preview the production build:
```bash
npm run preview
```

## 🌐 Automatic Deployment

This project includes a GitHub Actions workflow that automatically builds and deploys the app to GitHub Pages when you push to the `main` branch.

**Live Demo:** [https://officiallygod.github.io/Recalla/](https://officiallygod.github.io/Recalla/)

For detailed setup instructions, see [GITHUB_ACTIONS_GUIDE.md](GITHUB_ACTIONS_GUIDE.md)

## 🎮 How to Use

1. **Add Words**: Click "Add Words" and enter words with their meanings
2. **Play Match Game**: Click "Play Match Game" to start matching words with meanings
3. **Track Progress**: View your statistics and see which words need more practice
4. **Level Up**: Earn points and coins to unlock higher levels

## 🎯 Game Mechanics

- Match words with their correct meanings
- Earn 100+ points for each correct match
- Build combos for bonus points (50 points per combo level)
- Wrong matches reset your combo
- Words you get wrong more often appear more frequently in games
- Complete rounds to progress and earn bonuses

## 🎨 Design Principles

This app follows modern design principles inspired by world-class applications:

- **Minimal & Clean**: Focused on content with minimal distractions
- **Glassmorphism**: Frosted glass effects for depth
- **Smooth Interactions**: Micro-animations and haptic-like feedback
- **Gradient Accents**: Modern color palette with indigo gradients
- **Responsive**: Works perfectly on mobile, tablet, and desktop

## 📱 Progressive Web App

Install Recalla as an app on your device:

### Desktop (Chrome/Edge)
1. Click the install icon in the address bar
2. Click "Install"

### Mobile (Android)
1. Open in Chrome
2. Tap menu (⋮) → "Install app"

### iOS
1. Open in Safari
2. Tap Share → "Add to Home Screen"

## 🔮 Future Enhancements

The app architecture is ready for:

- **Authentication**: Firebase, Auth0, or custom backend
- **Database**: MongoDB, PostgreSQL, or Firebase
- **API Integration**: RESTful or GraphQL backends
- **Social Features**: Leaderboards, sharing, multiplayer
- **Advanced Analytics**: Learning curves, retention rates
- **More Games**: Additional game modes and challenges

## 📂 Project Structure

```
Recalla/
├── src/
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React Context for state management
│   ├── screens/         # Page components
│   ├── App.jsx         # Root component
│   └── main.jsx        # Entry point
├── public/             # Static assets
├── dist/               # Production build (generated)
└── vite.config.js      # Vite configuration
```

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

MIT License - Feel free to use and modify!

---

Made with ❤️ for language learners everywhere!

