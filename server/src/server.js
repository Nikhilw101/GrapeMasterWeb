import app from './app.js';
import connectDB from './config/db.js';
import { PORT } from './config/env.js';
import logger from './utils/logger.js';

// Async server startup
const startServer = async () => {
  try {
    // Connect to Database
    await connectDB();

    // Start Server after DB connection
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

    // Handle Unhandled Promise Rejections
    process.on('unhandledRejection', (err) => {
      logger.error(`Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });

    // Handle Uncaught Exceptions
    process.on('uncaughtException', (err) => {
      logger.error(`Uncaught Exception: ${err.message}`);
      process.exit(1);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
