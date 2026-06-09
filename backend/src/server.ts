import app from './app';
import { env } from './config/env';
import { connectDB } from './config/database';
import { redis } from './config/redis';
import { logger } from './shared/utils/logger';

async function startServer() {
  try {
    await connectDB();
    logger.info('✅ Database connection established');

    try {
      await redis.ping();
      logger.info('✅ Redis connection established');
    } catch {
      logger.warn('⚠️  Redis not available — continuing without cache');
    }

    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 शहीद राम सिंह विद्यालय ERP Server running on port ${env.PORT}`);
      logger.info(`   Environment: ${env.NODE_ENV}`);
      logger.info(`   Health: http://localhost:${env.PORT}/health`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception', { error: err });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection', { reason });
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

startServer();
