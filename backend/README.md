# 🚀 MathLearn Backend REST API & Engine

> **Production-grade, modular, mobile-first REST API** built with **Node.js**, **Express.js**, **MongoDB (Mongoose)**, and **Redis**, powering the MathMagic mobile learning application.

---

## 📑 Table of Contents

1. [Architectural Overview](#-architectural-overview)
2. [Tech Stack & Dependencies](#-tech-stack--dependencies)
3. [Directory Layout](#-directory-layout)
4. [Environment Configuration (`.env`)](#-environment-configuration-env)
5. [Database Schema & Model Reference](#-database-schema--model-reference)
6. [Security & Authentication Engine](#-security--authentication-engine)
   - [JWT Token Rotation & Replay Protection](#jwt-token-rotation--replay-protection)
   - [Google OAuth ID Token Verification](#google-oauth-id-token-verification)
   - [Rate Limiting & Threat Mitigation](#rate-limiting--threat-mitigation)
7. [Comprehensive REST API Reference](#-comprehensive-rest-api-reference)
   - [1. Authentication (`/api/v1/auth`)](#1-authentication-apiv1auth)
   - [2. User Profile & Preferences (`/api/v1/users`)](#2-user-profile--preferences-apiv1users)
   - [3. Curriculum & Content Delivery (`/api/v1/curriculum`)](#3-curriculum--content-delivery-apiv1curriculum)
   - [4. Progress & Gamification (`/api/v1/progress`)](#4-progress--gamification-apiv1progress)
   - [5. Game Engine Sessions (`/api/v1/games`)](#5-game-engine-sessions-apiv1games)
   - [6. Admin & Curriculum CMS (`/api/v1/admin`)](#6-admin--curriculum-cms-apiv1admin)
8. [Seeding & Data Generation Scripts](#-seeding--data-generation-scripts)
9. [Error Handling & API Responses](#-error-handling--api-responses)
10. [Local Setup & Development Guide](#-local-setup--development-guide)

---

## 🏛️ Architectural Overview

The backend uses a **Domain-Driven Modular Architecture** where each domain (`auth`, `user`, `curriculum`, `progress`, `game`, `question`, `admin`) encapsulates its own routes, controllers, services, models, and Zod validation schemas.

```
Incoming HTTP Request
        │
        ▼
┌────────────────────────────────────────────────────────┐
│  Global Middlewares: Helmet, Dynamic CORS, Morgan,    │
│  RateLimiter (Auth: 10 req/15m, API: 100 req/15m)     │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│  Auth & RBAC Middlewares (Bearer JWT & Role Check)     │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│  Validation Middleware (Zod Strict Schema Check)       │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│  Feature Controller (Request Handlers)                 │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│  Service Layer (Business Logic & Transactions)         │
└───────────────────┬────────────────┬───────────────────┘
                    │                │
                    ▼                ▼
          ┌─────────────────┐ ┌─────────────┐
          │  Mongoose Models│ │ Redis Cache │
          └─────────────────┘ └─────────────┘
```

---

## 🛠️ Tech Stack & Dependencies

- **Runtime**: Node.js `>= 18.0.0`
- **Framework**: Express.js `4.21.2`
- **Database**: MongoDB via Mongoose ODM `8.13.0`
- **Cache & Memory**: Redis via `ioredis 5.6.1` (with automatic fallback to direct DB if Redis is offline)
- **Token Cryptography**: `jsonwebtoken 9.0.2` & `bcryptjs 3.0.3`
- **OAuth**: `google-auth-library 9.15.1`
- **Data Validation**: `zod 3.24.2`
- **Security**: `helmet 8.1.0`, `express-rate-limit 7.5.0`, custom mobile `cors`
- **Logging**: `winston 3.17.0` & `morgan 1.10.0`
- **Email Delivery**: `nodemailer 6.10.0`

---

## 📁 Directory Layout

```text
backend/
├── server.js                        # HTTP listener & process signal management
├── package.json                     # Scripts & dependencies
├── .env.example                     # Environment template
└── src/
    ├── app.js                       # Express app setup, CORS, Helmet & route mounting
    ├── config/
    │   ├── db.js                    # MongoDB connection with auto-reconnect
    │   ├── environment.js           # Centralized environment validator
    │   └── redis.js                 # Redis client with offline fallback
    ├── constants/
    │   └── roles.js                 # Role enums: student, parent, teacher, admin
    ├── middlewares/
    │   ├── auth.middleware.js       # Bearer JWT decoder & user context injector
    │   ├── error.middleware.js      # Global 404 & production error response handler
    │   ├── rateLimiter.middleware.js# Auth and API rate limiters
    │   ├── role.middleware.js       # Role-Based Access Control (RBAC) guard
    │   └── validate.middleware.js   # Zod request validator
    ├── modules/
    │   ├── admin/                   # Admin dashboard, curriculum builder & audit
    │   ├── auth/                    # Registration, login, Google OAuth, tokens, reset
    │   ├── curriculum/              # Grades, topics, exercises, practice levels & models
    │   ├── game/                    # Speed math generation & game session submissions
    │   ├── math/                    # Legacy/standalone math routes
    │   ├── progress/                # Progress tree, home dashboard, daily missions
    │   ├── question/                # Question bank repository & bulk ingestion
    │   └── user/                    # Profile management, XP/streak, grade selection
    ├── scripts/                     # Seeders & integration test runners
    └── utils/
        ├── apiError.js              # Standardized API error class
        ├── apiResponse.js           # Standardized API success envelope
        ├── jwt.js                   # Token generation & verification helpers
        ├── logger.js                # Winston structured logger
        └── mailer.js                # Nodemailer email sender with mobile deep links
```

---

## ⚙️ Environment Configuration (`.env`)

```env
# Application Runtime
PORT=5000
NODE_ENV=development
APP_NAME=MathLearn

# Database & Cache
MONGO_URI=mongodb://127.0.0.1:27017/mathlearn
REDIS_URL=redis://127.0.0.1:6379

# JWT Secrets & Expiry Windows
JWT_ACCESS_SECRET=your_super_secret_jwt_access_key_min32chars
JWT_REFRESH_SECRET=your_super_secret_jwt_refresh_key_min32chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_RESET_PASSWORD_EXPIRES_IN=1h
JWT_EMAIL_VERIFICATION_EXPIRES_IN=24h

# Google OAuth Client IDs
GOOGLE_CLIENT_ID=your_google_web_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_IOS_CLIENT_ID=your_google_ios_client_id.apps.googleusercontent.com
GOOGLE_ANDROID_CLIENT_ID=your_google_android_client_id.apps.googleusercontent.com

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="MathLearn Team <noreply@mathlearn.com>"

# Client Deep Links & CORS
CLIENT_URL=http://localhost:3000
EXPO_APP_SCHEME=mathmagic://
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081,http://localhost:19006
```

---

## 🗄️ Database Schema & Model Reference

### 1. `User` (`modules/user/user.model.js`)
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `name` | `String` | Required, Trim (2-100 chars) | Full user name |
| `email` | `String` | Required, Unique, Lowercase | User email address |
| `password` | `String` | `select: false` | Bcrypt hashed password |
| `role` | `String` | Enum: `student`, `parent`, `teacher`, `admin` | User authorization role |
| `authProvider` | `String` | Enum: `local`, `google`, `apple` | Account registration provider |
| `googleId` | `String` | Sparse, Index | Google subject identifier |
| `selectedGrade`| `ObjectId` | Ref: `Grade`, Default: `null` | Active grade curriculum for student |
| `xp` | `Number` | Default: `0` | Total accumulated experience points |
| `streak` | `Number` | Default: `0` | Current active consecutive daily streak |
| `isActive` | `Boolean`| Default: `true` | Account status flag |

### 2. `RefreshToken` (`modules/auth/auth.model.js`)
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `tokenHash` | `String` | Required, Index | SHA-256 / hashed token signature |
| `user` | `ObjectId` | Required, Ref: `User`, Index | Account owner |
| `expiresAt` | `Date` | Required, `index: { expires: 0 }` | Auto-purged TTL MongoDB index |
| `revoked` | `Boolean`| Default: `false` | Revocation status flag |
| `replacedByTokenHash` | `String` | Default: `null` | Child token pointer for replay detection |

### 3. `Grade` (`modules/curriculum/models/grade.model.js`)
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `number` | `Number` | Required, Unique | Grade number (1 = Grade 1, etc.) |
| `name` | `String` | Required | Display name (e.g. "Grade 1") |
| `isEnabled` | `Boolean`| Default: `false` | Whether grade is published to students |
| `icon` | `String` | Default: `shapes-outline` | Vector icon identifier |
| `color` | `String` | Default: `#8B5CF6` | Theme hex accent |
| `order` | `Number` | Default: `1` | Display order |

### 4. `Topic` (`modules/curriculum/models/topic.model.js`)
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `grade` | `ObjectId` | Required, Ref: `Grade`, Index | Parent Grade |
| `title` | `String` | Required | Topic title (e.g. "Addition & Subtraction") |
| `introduction`| `Object` | `summary, videoUrl, keyTakeaways[], blocks[]` | Educational overview & visual cards |
| `isPublished`| `Boolean`| Default: `true` | Publication status |

### 5. `Exercise` (`modules/curriculum/models/exercise.model.js`)
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `topic` | `ObjectId` | Required, Ref: `Topic`, Index | Parent Topic |
| `grade` | `ObjectId` | Required, Ref: `Grade`, Index | Parent Grade |
| `subtopicNumber` | `Number` | Default: `1` | Subtopic ordering (Subtopic 1, 2, etc.) |
| `learningContent` | `Object` | `summary, blocks: [{ type, content, order }]` | Step-by-step lesson cards |
| `completionRequirement` | `Object` | `minScore (default: 80), mustAnswerAll` | Passing criteria |

### 6. `PracticeLevel` (`modules/curriculum/models/practiceLevel.model.js`)
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `exercise` | `ObjectId` | Required, Ref: `Exercise`, Index | Associated Subtopic Exercise |
| `number` | `Number` | Required (Level 1, 2, 3...) | Progressive difficulty step |
| `difficulty` | `String` | Enum: `beginner`, `easy`, `medium`, `hard`, `advanced` | Challenge tier |
| `questionCount` | `Number` | Default: `30` | Number of questions per drill |
| `passingScore` | `Number` | Default: `70` | Accuracy % required to unlock next level |

### 7. `Question` (`modules/question/question.model.js`)
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `context` | `String` | Enum: `learn`, `practice` | Context where question is presented |
| `type` | `String` | Enum: `mcq`, `numeric`, `fill_blank`, `true_false`, `matching`, `ordering`, `image_mcq` | Interactive question UI variant |
| `text` | `String` | Required | The problem statement / question prompt |
| `options` | `[String]` | Default: `[]` | Choice array for MCQ / Image MCQ |
| `correctAnswer` | `Mixed` | Required | Expected answer value |
| `acceptableAnswers` | `[String]` | Default: `[]` | Accepted alternate text inputs |
| `matchPairs` | `[{ left, right }]` | Default: `[]` | Left-right pairing data |
| `correctOrder` | `[String]` | Default: `[]` | Sequential ordering items |
| `hint` / `explanation` | `String` | Default: `""` | Pedagogical hints and post-submission answers |
| `xpReward` | `Number` | Default: `5` | XP awarded upon correct response |

### 8. `UserProgress` (`modules/progress/progress.model.js`)
- Compound unique index: `{ user: 1, grade: 1 }`.
- Sub-arrays: `exerciseProgress` (learn mode unlock & score tracking) and `practiceLevelProgress` (attempts, bestScore, mastery %, status: `locked | unlocked | in_progress | completed`).
- Aggregate `stats`: `totalQuestionsAnswered`, `totalCorrectAnswers`, `overallAccuracy`, `exercisesCompleted`, `topicsCompleted`, `practiceLevelsCompleted`, `gamesPlayed`, `totalXp`, `currentStreak`.

### 9. `GameSession` (`modules/game/gameSession.model.js`)
- Stores complete gameplay history: `gameType` (*quick_math, number_match, memory_math, math_catch, mixed_recall*), `score`, `accuracy`, `maxCombo`, `totalTimeMs`, `starsEarned` (0-3), `isHighScore`, and itemized `questionsPlayed`.

---

## 🔒 Security & Authentication Engine

### JWT Token Rotation & Replay Protection
1. **Access Token**: Short-lived (15 minutes), signed with `JWT_ACCESS_SECRET`.
2. **Refresh Token**: Long-lived (7 days), signed with `JWT_REFRESH_SECRET`, hashed and stored in MongoDB with a unique family record.
3. **Rotation Mechanism**: When `/api/v1/auth/refresh` is called, the old refresh token is marked as `revoked: true` and replaced with a newly generated token.
4. **Replay Detection**: If a revoked token is ever presented again, **all refresh tokens for that user are immediately invalidated**, forcing re-authentication.

### Google OAuth ID Token Verification
- Client sends Google ID Token obtained from native `@react-native-google-signin/google-signin`.
- Backend verifies the token signature with Google's public keys via `google-auth-library` (`OAuth2Client.verifyIdToken`).
- Matches user by `googleId` or `email`, automatically creating verified accounts.

### Rate Limiting & Threat Mitigation
- **Auth Limiter**: 10 requests / 15 mins on `/api/v1/auth/login`, `/register`, `/forgot-password`.
- **API Limiter**: 100 requests / 15 mins across all general endpoints.
- **Helmet**: Secures HTTP response headers, preventing clickjacking and MIME sniffing.

---

## 📡 Comprehensive REST API Reference

Standard JSON Response Structure:
```json
// Success Response (HTTP 200/201)
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}

// Error Response (HTTP 4xx/5xx)
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

---

### 1. Authentication (`/api/v1/auth`)

| Method | Endpoint | Auth | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | `{ name, email, password, referralCode? }` | Create new student account |
| `POST` | `/api/v1/auth/login` | Public | `{ email, password }` | Authenticate with credentials |
| `POST` | `/api/v1/auth/google` | Public | `{ idToken }` | Authenticate via Google OAuth |
| `POST` | `/api/v1/auth/refresh` | Public | `{ refreshToken }` | Rotate Access + Refresh Tokens |
| `POST` | `/api/v1/auth/logout` | Public | `{ refreshToken }` | Revoke session & refresh token |
| `GET` | `/api/v1/auth/me` | Bearer | None | Get current authenticated user profile |
| `GET` | `/api/v1/auth/check` | Bearer | None | Session validation alias for mobile |
| `POST` | `/api/v1/auth/forgot-password`| Public | `{ email }` | Send deep-link password reset email |
| `POST` | `/api/v1/auth/reset-password` | Public | `{ token, newPassword }` | Reset password using reset token |
| `POST` | `/api/v1/auth/change-password`| Bearer | `{ currentPassword, newPassword }` | Update password for active session |
| `POST` | `/api/v1/auth/verify-email` | Public | `{ token }` | Confirm email address |
| `POST` | `/api/v1/auth/resend-verification` | Public | `{ email }` | Resend verification link |

---

### 2. User Profile & Preferences (`/api/v1/users`)

| Method | Endpoint | Auth | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/users/profile` | Bearer | None | Fetch full profile, XP, streak, selected grade |
| `PATCH` | `/api/v1/users/profile` | Bearer | `{ name?, phone?, avatar? }` | Update user personal details |
| `POST` | `/api/v1/users/progress` | Bearer | `{ xpToAdd?, streak? }` | Sync gamification counters |
| `PATCH` | `/api/v1/users/select-grade` | Bearer | `{ gradeId }` | Switch active grade curriculum |

---

### 3. Curriculum & Content Delivery (`/api/v1/curriculum`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/curriculum/grades` | Public | List all enabled grades |
| `GET` | `/api/v1/curriculum/grades/:gradeId` | Public | Fetch grade metadata by ID |
| `GET` | `/api/v1/curriculum/grades/:gradeId/topics` | Bearer | List all topics for grade with progress badges |
| `GET` | `/api/v1/curriculum/topics/:topicId/exercises` | Bearer | List subtopics & exercises with locked/unlocked state |
| `GET` | `/api/v1/curriculum/exercises/:exerciseId` | Bearer | Fetch exercise content blocks and learn checkpoint questions |
| `GET` | `/api/v1/curriculum/exercises/:exerciseId/practice-levels` | Bearer | Get practice levels (Level 1-5) and user mastery % |
| `GET` | `/api/v1/curriculum/practice-levels/:levelId/questions` | Bearer | Fetch practice questions for drill session |

---

### 4. Progress & Gamification (`/api/v1/progress`)

| Method | Endpoint | Auth | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/progress` | Bearer | `?gradeId=` (optional) | Fetch complete hierarchical progress tree |
| `GET` | `/api/v1/progress/home-dashboard` | Bearer | None | Fetch daily missions, math fact, weekly activity |
| `POST` | `/api/v1/progress/daily-missions/claim` | Bearer | `{ missionId }` | Claim daily mission reward XP |
| `POST` | `/api/v1/progress/exercises/:id/answer` | Bearer | `{ questionId, userAnswer, isCorrect, timeSpentMs }` | Record learn checkpoint response |
| `POST` | `/api/v1/progress/exercises/:id/complete` | Bearer | `{ answers: [...], score }` | Complete learn exercise, award XP, unlock next |
| `POST` | `/api/v1/progress/practice-levels/:id/submit`| Bearer | `{ answers: [...], score, accuracy, totalTimeMs }` | Submit practice drill, calculate mastery & unlock |

---

### 5. Game Engine Sessions (`/api/v1/games`)

| Method | Endpoint | Auth | Request / Query | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/games/available` | Bearer | None | List available games with personal best scores |
| `POST` | `/api/v1/games/generate` | Bearer | `{ gameType, count?, difficulty? }` | Generate dynamic arithmetic question pool |
| `POST` | `/api/v1/games/session` | Bearer | `{ gameType, score, accuracy, maxCombo, totalTimeMs, questionsPlayed }` | Submit game session, compute stars (1-3) & high score |

---

### 6. Admin & Curriculum CMS (`/api/v1/admin`)

*All Admin routes require `role: 'admin'` in user JWT payload.*

| Method | Endpoint | Request Body | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/dashboard` | None | System metrics: student count, exercises, completion rates |
| `POST` | `/api/v1/admin/grades` | `{ number, name, description?, icon?, color? }` | Create new Grade |
| `GET` | `/api/v1/admin/grades` | None | List all grades (enabled & disabled) |
| `PATCH` | `/api/v1/admin/grades/:id/toggle` | None | Enable / disable grade visibility |
| `POST` | `/api/v1/admin/topics` | `{ grade, title, description?, introduction?, icon?, color?, order? }` | Create topic |
| `POST` | `/api/v1/admin/exercises` | `{ topic, grade, subtopicNumber, title, learningContent?, completionRequirement? }` | Create subtopic exercise |
| `PUT` | `/api/v1/admin/exercises/:id/content`| `{ learningContent: { summary, blocks: [...] } }` | Update exercise lesson content |
| `POST` | `/api/v1/admin/practice-levels` | `{ exercise, topic, grade, number, difficulty, questionCount, passingScore }` | Create practice level |
| `POST` | `/api/v1/admin/questions` | Question schema object (any of the 7 types) | Add single question |
| `POST` | `/api/v1/admin/questions/bulk` | `{ questions: [ QuestionSchema... ] }` | Bulk import questions |
| `GET` | `/api/v1/admin/questions` | `?exercise=&practiceLevel=&grade=&context=&page=&limit=` | Filter question bank |
| `GET` | `/api/v1/admin/students` | `?page=&limit=&search=` | List registered students & XP rank |
| `GET` | `/api/v1/admin/students/:id/progress`| None | Inspect student progress tree & activity |

---

## 🛠️ Seeding & Data Generation Scripts

The repository includes pre-built database seeding scripts located in `src/scripts/`:

```bash
# 1. Seed Core Curriculum (Grades 1-5, Topics, Exercises & Practice Levels)
node src/scripts/seedCurriculum.js

# 2. Seed Rich Question Banks for Grade 1
node src/scripts/seedGrade1Batch1.js
node src/scripts/seedGrade1Batch2.js
node src/scripts/seedGrade1Batch3.js
node src/scripts/seedRichUniqueDrillQuestions.js

# 3. Run Automated Integration Verification Tests
node src/scripts/testCurriculumAndProfile.js
node src/scripts/testGameEngine.js
node src/scripts/testHomeDashboard.js
```

---

## ⚠️ Error Handling & API Responses

All application errors are instances of `ApiError` (`utils/apiError.js`), formatted with clear, actionable messages and mapped to HTTP standards:

| Status Code | Scenario |
| :--- | :--- |
| **`400 Bad Request`** | Zod payload validation failure or invalid ID formatting |
| **`401 Unauthorized`** | Missing, expired, or invalid JWT token |
| **`403 Forbidden`** | Insufficient permissions (non-admin accessing `/admin/*`) |
| **`404 Not Found`** | Requested user, exercise, topic, or question does not exist |
| **`409 Conflict`** | Duplicate email registration or unique index collision |
| **`429 Too Many Requests`** | Rate limit threshold exceeded |
| **`500 Internal Server Error`** | Unhandled server exceptions (logged via Winston) |

---

## 🚀 Local Setup & Development Guide

```bash
# 1. Enter backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create local environment configuration
cp .env.example .env

# 4. Start local development server (with nodemon)
npm run dev

# 5. Run Linter & Formatter
npm run lint:fix
npm run format
```

- Server will start at `http://0.0.0.0:5000`.
- Verify server health at `http://localhost:5000/health`.

---

<div align="center">
  <sub>MathLearn Backend Engine • Crafted for High Performance & Scale</sub>
</div>
