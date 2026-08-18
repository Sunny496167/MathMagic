const app = require('./src/app');
const config = require('./src/config/environment');
const connectDB = require('./src/config/db');
const logger = require('./src/utils/logger');

const startServer = async () => {
  await connectDB();

  const server = app.listen(config.port, '0.0.0.0', () => {
    logger.info('=========================================');
    logger.info(`🚀 ${config.appName} API Backend Running`);
    logger.info(`📍 Listening on: http://0.0.0.0:${config.port}`);
    logger.info(`🌍 Environment: ${config.nodeEnv}`);
    logger.info('🛡️  Mobile & Web CORS Enabled');
    logger.info('=========================================');
  });

  const shutdown = () => {
    logger.info('Shutting down server gracefully...');
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer();
