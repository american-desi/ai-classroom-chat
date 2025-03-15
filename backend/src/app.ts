import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { setupSocketHandlers } from './socket';
import authRoutes from './routes/auth';
import classroomRoutes from './routes/classroom';
import chatRoutes from './routes/chat';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/classroom', classroomRoutes);
app.use('/api/chat', chatRoutes);

// Socket.IO setup
setupSocketHandlers(io);

// Error handling
app.use(errorHandler);

const port = process.env.PORT || 5001;

httpServer.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📱 Socket.IO server initialized`);
}); 