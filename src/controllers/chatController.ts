import { Request, Response } from 'express';
import { ChatService } from '../services/chatService';

class ChatController {
    constructor(private chatService: ChatService) {}

    async sendMessage(req: Request, res: Response): Promise<void> {
        try {
            const { userId, message } = req.body;
            const response = await this.chatService.sendMessage(userId, message);
            res.status(200).json({ response });
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while processing the message.' });
        }
    }

    async getChatHistory(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.query;
            const history = await this.chatService.getChatHistory(userId as string);
            res.status(200).json(history);
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while retrieving chat history.' });
        }
    }
}

export default ChatController;