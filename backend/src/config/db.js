const mongoose = require('mongoose');
const config = require('./environment');
const logger = require('../utils/logger');

let isConnecting = false;

const connectDB = async (retries = 5, delay = 3000) => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  if (isConnecting) return;
  isConnecting = true;

  for (let i = 0; i < retries; i++) {
    try {
      const conn = await mongoose.connect(config.mongoUri, {
        serverSelectionTimeoutMS: 8000,
      });
      logger.info(`[MongoDB] Connected to database: ${conn.connection.host}/${conn.connection.name}`);
      isConnecting = false;
      return;
    } catch (error) {
      logger.error(`[MongoDB] Connection attempt ${i + 1}/${retries} failed: ${error.message}`);
      if (i < retries - 1) {
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }

  isConnecting = false;
  logger.error('[MongoDB] All connection attempts failed.');
  if (config.isProduction) {
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('[MongoDB] Database connection lost. Attempting reconnect...');
  connectDB(3, 2000).catch(() => {});
});

mongoose.connection.on('reconnected', () => {
  logger.info('[MongoDB] Database reconnected');
});

module.exports = connectDB;

