import { Server, Socket } from 'socket.io';
import { verifyToken } from './middleware/auth';

interface User {
  _id: string;
  name: string;
  role: 'student' | 'teacher';
}

export const setupSocketHandlers = (io: Server) => {
  // Middleware to authenticate socket connections
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const user = await verifyToken(token);
      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log('🔌 Client connected:', socket.id);

    const user = socket.data.user as User;
    console.log(`User connected: ${user.name}`);

    // Join user's personal room for direct messages
    socket.join(`user-${user._id}`);

    // Handle joining classroom
    socket.on('join-classroom', (classroomId: string) => {
      socket.join(classroomId);
      console.log(`User ${socket.id} joined classroom ${classroomId}`);
    });

    // Handle leaving classroom
    socket.on('leave-classroom', (classroomId: string) => {
      socket.leave(classroomId);
      console.log(`User ${socket.id} left classroom ${classroomId}`);
    });

    // Handle chat messages
    socket.on('send-message', (data: { classroomId: string; message: string }) => {
      io.to(data.classroomId).emit('receive-message', {
        userId: socket.id,
        message: data.message,
        timestamp: new Date()
      });
    });

    // Handle breakout room messages
    socket.on('sendBreakoutMessage', (data: { roomId: string; message: string }) => {
      io.to(`breakout-${data.roomId}`).emit('breakoutMessage', {
        userId: user._id,
        userName: user.name,
        message: data.message,
        timestamp: new Date(),
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
    });
  });
}; 