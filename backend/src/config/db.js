const mongoose = require('mongoose');
const config = require('./environment');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    logger.info(`[MongoDB] Connected to database: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    logger.error(`[MongoDB] Connection error: ${error.message}`);
    if (config.isProduction) {
      process.exit(1);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('[MongoDB] Database connection lost');
});

mongoose.connection.on('reconnected', () => {
  logger.info('[MongoDB] Database reconnected');
});

module.exports = connectDB;
