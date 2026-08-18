const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/environment');
const { apiLimiter } = require('./middlewares/rateLimiter.middleware');
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');

// Feature Routers
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/user/user.routes');
const mathRoutes = require('./modules/math/math.routes');

const app = express();

// 1. Security Headers via Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 2. CORS - Dynamic configuration for React Native, Expo development, and Web clients
const corsOptions = {
  origin: (origin, callback) => {
    // Mobile apps (React Native / Expo) often do not send an Origin header or send exp://, file://, localhost
    if (!origin) return callback(null, true);

    if (
      !config.isProduction ||
      config.allowedOrigins.length === 0 ||
      config.allowedOrigins.includes(origin) ||
      origin.startsWith('exp://') ||
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://192.168.') ||
      origin.startsWith('http://10.0.')
    ) {
      return callback(null, true);
    }

    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token', 'x-refresh-token'],
};

app.use(cors(corsOptions));

// 3. Request Logging
if (!config.isProduction) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 4. Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Global Rate Limiter
app.use('/api', apiLimiter);

// 6. Health & Root Checks
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MathLearn API is healthy',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// 7. Mount Versioned API Routes (/api/v1/...)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/math', mathRoutes);

// Backward compatibility alias for /api/auth/... -> /api/v1/auth/...
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/math', mathRoutes);

// 8. 404 & Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
