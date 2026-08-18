# MathMagic — Mobile App (React Native & Expo) 📱✨

**MathMagic** is an interactive, gamified Grade 1 mathematics learning mobile application built with **React Native**, **Expo SDK**, **Expo Router**, and **NativeWind (Tailwind CSS)**.

---

## 🛠️ Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/) (SDK 52)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation with tab and stack navigators)
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **Data Fetching & State**: [TanStack React Query](https://tanstack.com/query/latest) & React Context
- **Networking**: [Axios](https://axios-http.com/) with automatic Refresh Token rotation interceptor
- **Secure Storage**: [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/) for JWT Access & Refresh tokens
- **Animations & Feedback**: [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/), [expo-haptics](https://docs.expo.dev/versions/latest/sdk/haptics/)
- **Icons & Graphics**: [@expo/vector-icons](https://icons.expo.fyi/), [react-native-svg](https://github.com/software-mansion/react-native-svg), [expo-linear-gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/)
- **OAuth**: Google Sign-In via `@react-native-google-signin/google-signin`

---

## 📁 Scalable Feature-Based Architecture

```text
MathMagic/
├── app/                                 # Expo Router (Clean Route Entrypoints Only)
│   ├── (auth)/
│   │   ├── _layout.tsx                  # Auth stack layout & redirection
│   │   └── index.tsx                    # -> Renders @features/auth
│   ├── (tabs)/
│   │   ├── _layout.tsx                  # Bottom tab navigator with blur effect
│   │   ├── index.tsx                    # -> Renders @features/practice
│   │   ├── game.tsx                     # -> Renders @features/game
│   │   ├── learn.tsx                    # -> Renders @features/learn
│   │   └── profile.tsx                  # -> Renders @features/profile
│   ├── _layout.tsx                      # Root Layout (Fonts, React Query, AuthProvider)
│   └── index.tsx                        # Root splash / redirection gate
│
└── src/
    ├── api/                             # Network & API Client Layer
    │   ├── client.ts                    # Axios instance, Bearer tokens & token rotation
    │   ├── config.ts                    # Dynamic Platform & Environment API URL resolver
    │   ├── endpoints.ts                 # Centralized API endpoint constants
    │   └── index.ts
    │
    ├── components/                      # Shared Reusable UI Components
    │   ├── common/
    │   │   ├── SafeScreen.tsx           # Notch & SafeArea padding wrapper
    │   │   ├── LoadingState.tsx         # Standard loading spinner view
    │   │   ├── ErrorState.tsx           # Standard error with retry view
    │   │   ├── EmptyState.tsx           # Standard empty state illustration
    │   │   └── index.ts
    │   └── index.ts
    │
    ├── constants/                       # Design Tokens, Keys & Config
    │   └── index.ts                     # COLORS, STORAGE_KEYS, THEME
    │
    ├── context/                         # Global Application Contexts
    │   ├── AuthContext.tsx              # User authentication session state
    │   └── index.ts
    │
    ├── features/                        # Sliced Feature Domains
    │   ├── auth/                        # 🔐 Authentication
    │   │   ├── components/              # BackgroundDecorations, WelcomeView, AuthFormView
    │   │   ├── hooks/                   # useAuthScreen (Form state & submit handlers)
    │   │   ├── services/                # authService (Login, Register, Google OAuth)
    │   │   ├── types/                   # auth.types.ts
    │   │   ├── AuthScreen.tsx           # Composed Auth screen
    │   │   └── index.ts
    │   │
    │   ├── practice/                    # 🧮 Practice Sessions
    │   │   ├── components/              # PracticeStatsHeader, TopicSelector, PracticeQuestionView
    │   │   ├── hooks/                   # usePracticeSession (State machine & feedback)
    │   │   ├── services/                # questionGenerator (Dynamic question creator)
    │   │   ├── types/                   # practice.types.ts
    │   │   ├── PracticeScreen.tsx
    │   │   └── index.ts
    │   │
    │   ├── game/                        # ⚡ Speed Math Game
    │   │   ├── components/              # GameIdleView, GamePlayingView, GameOverModal
    │   │   ├── hooks/                   # useMathGame (Timer, scoring, custom keypad)
    │   │   ├── types/                   # game.types.ts
    │   │   ├── GameScreen.tsx
    │   │   └── index.ts
    │   │
    │   ├── learn/                       # 📖 Lessons & Concepts
    │   │   ├── components/              # LessonCard, LessonDetailModal
    │   │   ├── constants/               # lessonsData (Grade 1 math lessons)
    │   │   ├── hooks/                   # useLessonProgress (Mastery & checkpoint quizzes)
    │   │   ├── types/                   # learn.types.ts
    │   │   ├── LearnScreen.tsx
    │   │   └── index.ts
    │   │
    │   └── profile/                     # 👤 Profile & Progress
    │       ├── components/              # ProfileHeaderCard, ProfileStatsRow, ProfileMenuSection
    │       ├── hooks/                   # useProfileData (XP level calculation, stats reset)
    │       ├── types/                   # profile.types.ts
    │       ├── ProfileScreen.tsx
    │       └── index.ts
    │
    ├── hooks/                           # Shared Global Hooks
    │   ├── useHapticFeedback.ts         # Cross-platform haptic feedback
    │   └── index.ts
    │
    ├── services/                        # Storage & Device Services
    │   ├── tokenStorage.ts              # SecureStore Access & Refresh Token storage
    │   ├── statsStorage.ts              # SecureStore stats, streak, & XP storage
    │   └── index.ts
    │
    └── types/                           # Global Shared Type Definitions
        └── index.ts                     # UserProfile, UserStats, Grade1Question, etc.
```

---

## 🔗 Path Aliases

Path aliases configured in `tsconfig.json` allow clean imports:

```ts
import { useAuth } from '@/src/context/AuthContext';
import { apiClient, ENDPOINTS } from '@api/index';
import { SafeScreen } from '@components/common';
import { AuthScreen } from '@features/auth';
import { PracticeScreen } from '@features/practice';
import { useHapticFeedback } from '@hooks/useHapticFeedback';
import { tokenStorage, statsStorage } from '@services/index';
```

---

## 🔐 Authentication & Session Flow

```text
[ React Native Expo ]
       │
       ▼ (1. Login / Register / Google Sign-In)
[ POST /api/v1/auth/login ] ──► [ Express Backend ]
       ▲                              │
       │                              ▼ (2. Return Tokens)
[ Expo SecureStore ] ◄──────── { accessToken, refreshToken, user }
       │
       ▼ (3. All Requests carry Header: Authorization: Bearer <accessToken>)
[ Protected Endpoints ]
       │
       ▼ (4. On Token Expiration: 401 Unauthorized)
[ Axios Interceptor: POST /api/v1/auth/refresh { refreshToken } ]
       │
       ▼ (5. Receive New Tokens -> Update SecureStore -> Retry Request)
[ Successful Request Retried ]
```

---

## 🚀 Getting Started

### 1. Prerequisites

- Node.js (v18+)
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) / Android Emulator (Android Studio) / Expo Go app on physical device

### 2. Configure Backend API URL

Create or update `.env` in `MathMagic/`:

```env
# Point to your local development machine IP (e.g. 192.168.1.XX) or production URL
EXPO_PUBLIC_API_URL=http://192.168.31.201:5000/api/v1
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_web_client_id.apps.googleusercontent.com
```

### 3. Install Dependencies

```bash
cd MathMagic
npm install
```

### 4. Start the Expo Development Server

```bash
npx expo start
```

- Press `a` to run on Android Emulator.
- Press `i` to run on iOS Simulator.
- Press `w` to run on Web.
- Scan the QR code using the **Expo Go** app on your physical device.

---

## 🎮 Main Features

1. **Practice Tab (`/`)**:
   - Categorized practice in Addition, Subtraction, Multiplication, Division, and Fractions.
   - Dynamic 3-level difficulty scaling (Easy, Medium, Hard).
   - Real-time feedback with sound/haptic triggers and XP accumulation.
2. **Speed Game Tab (`/game`)**:
   - 60-second speed math blitz.
   - Custom in-app numeric keypad for fast tapping.
   - High-score leaderboard tracking in SecureStore.
3. **Learn Tab (`/learn`)**:
   - Step-by-step visual lessons with formulas and walkthroughs.
   - Embedded checkpoints that test learner comprehension before awarding mastery badges.
4. **Profile Tab (`/profile`)**:
   - Real-time XP level calculations (`Level = Math.floor(xp / 100) + 1`).
   - Streak tracker and lesson completion stats.
   - Session logout with server-side token revocation.
