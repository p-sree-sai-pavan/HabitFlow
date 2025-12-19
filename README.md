<p align="center">
  <img src="public/logo.png" alt="HabitFlow Logo" width="120" height="120">
</p>

<h1 align="center">HabitFlow</h1>

<p align="center">
  <strong>Build Better Habits, Flow Into Success</strong>
</p>

<p align="center">
  A gamified habit tracking platform for building consistent routines and personal growth.
</p>

<p align="center">
  <a href="https://habitflow-6da66.web.app">Live Demo</a> •
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#deployment">Deployment</a>
</p>

---

## 🎯 Overview

HabitFlow is a modern, feature-rich habit tracking application that combines the power of gamification with intuitive design. Track your daily habits, log study sessions, earn XP, level up, and unlock badges as you build consistency.

---

## ✨ Features

### 🏠 Dashboard
- **Activity Heatmap**: GitHub-style contribution heatmap visualizing your daily activity
- **Gamification Stats**: Track XP, level progression, current streak, and badges
- **Quick Overview**: See your progress at a glance

### ✅ Habit Tracking
- **Custom Habits**: Create habits with custom names, categories, colors, and icons
- **Flexible Scheduling**: Daily, weekdays, weekends, or custom day selection
- **Goal Setting**: Set monthly goals for each habit
- **Notes**: Add notes to individual habit completions
- **Archive & Restore**: Archive completed habits and restore them anytime

### 📚 Study Logging
- **Time Tracking**: Log study sessions with hours and topics
- **Category-based**: Organize study logs by category
- **Custom Dates**: Log sessions for past dates
- **XP Rewards**: Earn XP for every hour of study

### 📊 Analytics
- **Daily Activity Trends**: Visualize completion rates over time
- **Focus Distribution**: Pie chart showing time spent per category
- **Weekly Stats**: Track week-over-week progress
- **Habit Performance**: Detailed stats for each habit
- **Shareable Progress**: Generate and share progress cards

### 🎮 Gamification
- **Experience Points (XP)**: Earn XP for completing habits and logging study time
- **Leveling System**: Progress through levels as you accumulate XP
- **Streak Tracking**: Build consecutive day streaks with smart rest-day handling
- **Badges**: Unlock badges at milestones (Starter, Committed, Grinder, Legend)
- **Confetti Celebrations**: Celebrations for 100% daily completion

### ⚙️ Settings
- **Profile Management**: Update your display name
- **Appearance**: Toggle between dark and light themes
- **Habit Management**: Edit, archive, delete, or mark habits as complete
- **Data Management**: Export data as JSON, import from backup
- **Category Migration**: Update categories across historical data
- **Notifications**: Configure reminders (PWA support)

### 🔐 Authentication
- **Email/Password**: Register and sign in with email
- **Google Sign-In**: One-click authentication with Google
- **Secure Data**: User data stored securely in Firebase Firestore

### 📱 Progressive Web App (PWA)
- **Installable**: Add to home screen on mobile devices
- **Offline Support**: Offline indicator and data recovery
- **Responsive Design**: Works seamlessly on desktop and mobile

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 19, React Router 7 |
| **Build Tool** | Vite 7 |
| **Styling** | CSS Modules, CSS Variables |
| **Animations** | Framer Motion |
| **Charts** | Chart.js, react-chartjs-2 |
| **Icons** | Lucide React |
| **Backend** | Firebase (Firestore, Authentication) |
| **Hosting** | Firebase Hosting |
| **Date Utils** | date-fns |
| **Extras** | canvas-confetti (celebrations) |

---

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A [Firebase](https://firebase.google.com/) project (for authentication and database)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/p-sree-sai-pavan/HabitFlow.git
cd HabitFlow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase

Create a Firebase project at [Firebase Console](https://console.firebase.google.com/) and enable:
- **Authentication** (Email/Password and Google sign-in)
- **Firestore Database**

Then, update `src/firebase.js` with your Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run server` | Run the Express server (serves the `dist` folder) |
| `npm run deploy` | Deploy to Firebase Hosting |
| `npm run deploy:full` | Build and deploy in one command |

---

## 📁 Project Structure

```
HabitFlow/
├── public/                 # Static assets (logo, manifest.json)
├── src/
│   ├── assets/            # Images and media
│   ├── components/
│   │   ├── analytics/     # Analytics charts and shareable progress
│   │   ├── common/        # Shared components (Navbar, Login, Modals)
│   │   ├── dashboard/     # Dashboard, Heatmap, Gamification
│   │   ├── habits/        # HabitTracker, Goals, AddHabitModal
│   │   ├── settings/      # Settings panels (Appearance, Data, Profile)
│   │   └── study/         # Study log components
│   ├── context/
│   │   ├── AuthContext.jsx      # Firebase authentication state
│   │   ├── HabitFlowContext.jsx # Global app state (habits, XP, etc.)
│   │   └── ToastContext.jsx     # Toast notifications
│   ├── pages/             # Route pages (Home, Dashboard, Analytics, etc.)
│   ├── styles/            # Global CSS variables
│   ├── utils/             # Helpers (constants, analytics, sounds)
│   ├── App.jsx            # Main app component with routing
│   └── main.jsx           # React entry point
├── firebase.json          # Firebase Hosting configuration
├── firestore.rules        # Firestore security rules
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
└── README.md              # This file
```

---

## 🌐 Deployment

HabitFlow is configured for Firebase Hosting.

### Deploy to Firebase

1. **Login to Firebase CLI**:
   ```bash
   npx firebase login
   ```

2. **Build and Deploy**:
   ```bash
   npm run deploy:full
   ```

3. **Access your app** at `https://YOUR_PROJECT.web.app`

---

## 🔒 Firestore Security Rules

The app uses the following Firestore rules to secure user data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/p-sree-sai-pavan">Pavan</a>
</p>
