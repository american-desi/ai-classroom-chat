import { Router } from 'express';
import ChatController from '../controllers/chatController';
import { ChatService } from '../services/chatService';

const router = Router();
const chatService = new ChatService();
const chatController = new ChatController(chatService);

export function setChatRoutes(app: Router) {
    app.post('/api/chat/send', chatController.sendMessage.bind(chatController));
    app.get('/api/chat/history', chatController.getChatHistory.bind(chatController));
}