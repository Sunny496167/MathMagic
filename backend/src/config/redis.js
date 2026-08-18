const Redis = require('ioredis');
const config = require('./environment');
const logger = require('../utils/logger');

let redisClient = null;
let isRedisConnected = false;

try {
  if (config.redisUrl) {
    redisClient = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 3) {
          return null;
        }
        return Math.min(times * 100, 2000);
      },
      lazyConnect: true,
    });

    redisClient
      .connect()
      .then(() => {
        isRedisConnected = true;
        logger.info('[Redis] Connected successfully');
      })
      .catch((err) => {
        logger.warn(`[Redis] Connection notice (running in fallback mode): ${err.message}`);
        isRedisConnected = false;
      });

    redisClient.on('error', () => {
      isRedisConnected = false;
    });
  }
} catch (error) {
  logger.warn(`[Redis] Initialization skipped: ${error.message}`);
}

module.exports = {
  getRedisClient: () => (isRedisConnected ? redisClient : null),
  isRedisConnected: () => isRedisConnected,
};
