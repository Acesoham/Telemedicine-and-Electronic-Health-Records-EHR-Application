import mongoose from 'mongoose';
import { config } from './config';
import { logger } from '../utils/logger';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

let retryCount = 0;

const connectDB = async (): Promise<void> => {
  try {
    mongoose.set('strictQuery', true);

    await mongoose.connect(config.db.uri, config.db.options);

    logger.info('✅ MongoDB Atlas connected successfully');
    retryCount = 0;

    // Connection event listeners
    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
      scheduleReconnect();
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`❌ MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('✅ MongoDB reconnected successfully');
    });
  } catch (error) {
    const err = error as Error;
    logger.error(`❌ MongoDB connection failed: ${err.message}`);

    if (retryCount < MAX_RETRIES) {
      retryCount++;
      logger.info(`🔄 Retrying connection (${retryCount}/${MAX_RETRIES}) in ${RETRY_DELAY_MS / 1000}s...`);
      setTimeout(connectDB, RETRY_DELAY_MS);
    } else {
      logger.error('❌ Max MongoDB connection retries reached. Exiting.');
      process.exit(1);
    }
  }
};

const scheduleReconnect = (): void => {
  if (retryCount < MAX_RETRIES) {
    retryCount++;
    setTimeout(async () => {
      try {
        await mongoose.connect(config.db.uri, config.db.options);
        retryCount = 0;
      } catch (_err) {
        scheduleReconnect();
      }
    }, RETRY_DELAY_MS);
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed gracefully');
};

export default connectDB;
