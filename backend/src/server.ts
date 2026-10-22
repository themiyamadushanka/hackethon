import { createApp } from './app';
import { ENV } from './common/config/env';

const app = createApp();

const server = app.listen(ENV.PORT, () => {
  console.log(`🚀 [Backend] Express server listening on http://localhost:${ENV.PORT}`);
  console.log(`📡 [Backend] Environment: ${ENV.NODE_ENV}`);
});

// Graceful shutdown handling
const handleShutdown = (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('🔒 Closed out remaining connections.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
