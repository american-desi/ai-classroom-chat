import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import admin from 'firebase-admin';
import { PubSub } from '@google-cloud/pubsub';
import { Firestore } from '@google-cloud/firestore';
import { errorHandler } from './middleware/errorHandler';
import { setupSocketHandlers } from './services/chat/socket';
import { setupAIServices } from './services/ai';
import { classroomRoutes } from './routes/classroom';
import { chatRoutes } from './routes/chat';
import { analyticsRoutes } from './routes/analytics';
import { config } from './config';
import { logger } from './utils/logger';

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: config.projectId
});

// Initialize Firestore
const firestore = new Firestore({
  projectId: config.projectId,
});

// Initialize Pub/Sub
const pubsub = new PubSub({
  projectId: config.projectId,
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Routes
app.use('/api/classroom', classroomRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);

// Socket.IO setup
setupSocketHandlers(io, firestore, pubsub);

// Initialize AI services
setupAIServices();

// Error handling
app.use(errorHandler);

// Start server
const PORT = config.port;
httpServer.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📱 Socket.IO server initialized`);
}); 