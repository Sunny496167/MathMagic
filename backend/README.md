# MathLearn Backend API 🚀

A production-ready, mobile-first REST API built with **Node.js**, **Express.js**, **MongoDB (Mongoose)**, and **JWT** (Access + Refresh Token Rotation), designed specifically for the **React Native Expo** mobile application and future web clients.

---

## 🛠️ Tech Stack

- **Runtime & Framework**: Node.js & Express.js
- **Database**: MongoDB with Mongoose ODM
- **Caching & Sessions**: Redis (via `ioredis`) with graceful fallback
- **Authentication**: JWT (Access Token + Refresh Token Rotation with replay attack protection) & `bcryptjs`
- **OAuth**: Google OAuth ID Token verification via `google-auth-library`
- **Validation**: `zod` schema validation
- **Security**: `helmet`, `express-rate-limit`, dynamic mobile-friendly `cors`
- **Logging**: Structured `winston` logger (colorized dev console / JSON in production)
- **Mailing**: `nodemailer` with deep-linking support for mobile app password resets

---

## 📁 Project Structure

```text
backend/
├── .env.example              # Environment variables template
├── .env                      # Local environment configuration
├── .gitignore                # Git ignore rules
├── .prettierrc               # Prettier code formatting rules
├── .prettierignore           # Prettier ignore list
├── eslint.config.js          # ESLint 9 flat configuration
├── package.json              # Dependencies and scripts
├── server.js                 # HTTP listener & database connection
└── src/
    ├── app.js                # Express app setup, CORS, Helmet, rate-limiters & routes
    ├── config/
    │   ├── db.js             # Mongoose connection with reconnection handlers
    │   ├── environment.js    # Centralized environment loader
    │   └── redis.js          # Redis client with offline fallback
    ├── constants/
    │   └── roles.js          # Role definitions (student, parent, teacher, admin)
    ├── middlewares/
    │   ├── auth.middleware.js        # Bearer token verification & user injection
    │   ├── error.middleware.js       # Centralized 404 & production error handlers
    │   ├── rateLimiter.middleware.js # Express rate limiters for auth & API
    │   ├── role.middleware.js        # Role-based access control
    │   └── validate.middleware.js    # Zod schema validation middleware
    ├── modules/
    │   ├── auth/                     # Authentication domain feature
    │   │   ├── auth.controller.js    # HTTP request handlers
    │   │   ├── auth.model.js         # RefreshToken model with TTL index
    │   │   ├── auth.routes.js        # Express auth endpoints
    │   │   ├── auth.service.js       # Core auth logic, tokens & OAuth
    │   │   └── auth.validation.js    # Zod payload validation schemas
    │   ├── math/                     # Math & Curriculum domain feature
    │   │   └── math.routes.js        # Curriculum endpoints
    │   └── user/                     # User & Profile domain feature
    │       ├── user.controller.js    # Profile & progress handlers
    │       ├── user.model.js         # User model with bcrypt password hashing
    │       └── user.routes.js        # User endpoints
    └── utils/
        ├── apiError.js               # Standardized error response class
        ├── apiResponse.js            # Standardized success response helper
        ├── jwt.js                    # JWT signing & verification utilities
        ├── logger.js                 # Winston logger
        └── mailer.js                 # Nodemailer email sender
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in your settings:

```env
# Application
PORT=5000
NODE_ENV=development
APP_NAME=MathLearn

# Database
MONGO_URI=mongodb://127.0.0.1:27017/mathlearn

# Redis (Optional)
REDIS_URL=redis://127.0.0.1:6379

# JWT Secrets & Expiry
JWT_ACCESS_SECRET=your_super_secret_jwt_access_key_min32chars
JWT_REFRESH_SECRET=your_super_secret_jwt_refresh_key_min32chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_RESET_PASSWORD_EXPIRES_IN=1h
JWT_EMAIL_VERIFICATION_EXPIRES_IN=24h

# Google OAuth
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

# Client / App URLs & CORS
CLIENT_URL=http://localhost:3000
EXPO_APP_SCHEME=mathmagic://
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081,http://localhost:19006
```

---

## 🔐 Authentication Architecture

The backend implements a **Bearer Token & Token Rotation** flow tailored for mobile clients:

1. **Client Registration / Login**:
   - `POST /api/v1/auth/login` (or `/register` / `/google`)
   - Returns `{ accessToken, refreshToken, user }`.
   - The mobile application stores both tokens in **Expo SecureStore**.
2. **Authenticated Requests**:
   - Client sends header: `Authorization: Bearer <accessToken>`.
3. **Token Rotation on Expiry**:
   - When the `accessToken` expires (15 min), the client's axios interceptor automatically calls `POST /api/v1/auth/refresh` sending `{ refreshToken }`.
   - The backend validates the token, revokes the old refresh token, registers a new refresh token family member, and returns a new `accessToken` and `refreshToken`.
   - **Replay Protection**: If a revoked refresh token is ever presented again, all active sessions for that user are immediately invalidated.

---

## 📡 API Endpoints

All responses adhere to a consistent JSON envelope:

```json
// Success
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}

// Error
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

### Authentication (`/api/v1/auth`)

| Method | Endpoint                           | Description                        | Auth   |
| ------ | ---------------------------------- | ---------------------------------- | ------ |
| `POST` | `/api/v1/auth/register`            | Register new user                  | Public |
| `POST` | `/api/v1/auth/login`               | Login with email & password        | Public |
| `POST` | `/api/v1/auth/google`              | Google Sign-In with ID token       | Public |
| `POST` | `/api/v1/auth/refresh`             | Rotate access & refresh token      | Public |
| `POST` | `/api/v1/auth/logout`              | Revoke refresh token & session     | Public |
| `GET`  | `/api/v1/auth/me`                  | Fetch authenticated user profile   | Bearer |
| `POST` | `/api/v1/auth/forgot-password`     | Request password reset email       | Public |
| `POST` | `/api/v1/auth/reset-password`      | Reset password using reset token   | Public |
| `POST` | `/api/v1/auth/change-password`     | Change password for logged-in user | Bearer |
| `POST` | `/api/v1/auth/verify-email`        | Verify email address               | Public |
| `POST` | `/api/v1/auth/resend-verification` | Resend verification email          | Public |

### User Profile (`/api/v1/users`)

| Method  | Endpoint                 | Description                          | Auth   |
| ------- | ------------------------ | ------------------------------------ | ------ |
| `GET`   | `/api/v1/users/profile`  | Get user profile details             | Bearer |
| `PATCH` | `/api/v1/users/profile`  | Update profile (name, phone, avatar) | Bearer |
| `POST`  | `/api/v1/users/progress` | Sync XP and streak progress          | Bearer |

### Math Curriculum (`/api/v1/math`)

| Method | Endpoint                          | Description                   | Auth   |
| ------ | --------------------------------- | ----------------------------- | ------ |
| `GET`  | `/api/v1/math/curriculum/grade-1` | Get Grade 1 curriculum topics | Public |

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Run the Development Server

```bash
npm run dev
```

The server starts at `http://0.0.0.0:5000`.

### 3. Code Quality & Formatting

```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting
npm run format:check
```

---

## 🔒 Security Best Practices

- Passwords are never stored in plain text (`bcryptjs` with 10 salt rounds).
- Password hashes and reset tokens are excluded from API responses by default (`select: false`).
- Mobile CORS is dynamically configured to allow development local IP ranges (`192.168.x.x`, `10.0.x.x`), `exp://` deep-links, and authorized web origins.
- Rate limiting prevents brute-force attacks on `/api/v1/auth/*`.
