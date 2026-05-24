import cors from 'cors';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { connectDb } from './config/db';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { apiRouter } from './routes';
import { setupSocket } from './socket/socket';

async function bootstrap() {
  await connectDb();

  const app = express();
  const server = http.createServer(app);

  app.use(
    cors({
      origin: env.clientOrigin === '*' ? true : env.clientOrigin,
      credentials: true
    })
  );
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.status(200).json({ success: true, message: 'OK' });
  });

  app.use('/', apiRouter);
  app.use(errorHandler);

  const io = new Server(server, {
    cors: {
      origin: env.clientOrigin === '*' ? true : env.clientOrigin,
      credentials: true
    }
  });

  setupSocket(io);

  server.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
