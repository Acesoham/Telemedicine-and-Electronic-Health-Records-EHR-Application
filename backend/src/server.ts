import 'dotenv/config';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import createApp from './app';
import connectDB, { disconnectDB } from './configs/database';
import { config } from './configs/config';
import { logger } from './utils/logger';
import { registerSignalingHandlers } from './sockets/signaling.socket';

const bootstrap = async (): Promise<void> => {
  try {
    // 1. Connect to MongoDB Atlas
    await connectDB();

    // 2. Create Express app
    const app = createApp();
    const server = http.createServer(app);

    // 3. Attach Socket.io for WebRTC signaling
    const io = new SocketServer(server, {
      cors: {
        origin: [config.app.clientUrl, 'http://localhost:5173'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    // Register WebRTC signaling handlers
    registerSignalingHandlers(io);

    // 4. Start HTTP server
    server.listen(config.app.port, () => {
      logger.info(`
╔══════════════════════════════════════════════════╗
║           MediVault API Server Started           ║
╠══════════════════════════════════════════════════╣
║  Environment : ${config.app.nodeEnv.padEnd(32)}║
║  Port        : ${String(config.app.port).padEnd(32)}║
║  API URL     : ${config.app.serverUrl.padEnd(32)}║
║  Client URL  : ${config.app.clientUrl.padEnd(32)}║
╚══════════════════════════════════════════════════╝
      `);
    });

    // 5. Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDB();
        logger.info('Database disconnected. Goodbye! 👋');
        process.exit(0);
      });

      // Force shutdown after 30s
      setTimeout(() => {
        logger.error('Forced shutdown after timeout.');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Unhandled rejection handler
    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('Unhandled Promise Rejection:', { reason });
    });

    process.on('uncaughtException', (err: Error) => {
      logger.error('Uncaught Exception:', { error: err.message, stack: err.stack });
      process.exit(1);
    });
  } catch (error) {
    logger.error('Fatal error during startup:', { error });
    process.exit(1);
  }
};

bootstrap();
