import axios from 'axios';
import { ChatModel } from '../models/chatModel';

export class ChatService {
    private chatModel: ChatModel;

    constructor() {
        this.chatModel = new ChatModel('', '', '', new Date());
    }

    public async sendMessage(userId: string, message: string): Promise<string> {
        const chatMessage = new ChatModel('', userId, message, new Date());
        await chatMessage.save();
        const aiResponse = await this.generateAIResponse(message);
        const aiMessage = new ChatModel('', 'AI', aiResponse, new Date());
        await aiMessage.save();
        return aiResponse;
    }

    private async generateAIResponse(message: string): Promise<string> {
        const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
            prompt: message,
            max_tokens: 150,
            n: 1,
            stop: null,
            temperature: 0.7,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        return response.data.choices[0].text.trim();
    }

    public async getChatHistory(userId: string): Promise<ChatModel[]> {
        return ChatModel.findByUserId(userId);
    }
}