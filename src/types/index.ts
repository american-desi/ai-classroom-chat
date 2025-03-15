export interface ChatMessage {
    id: string;
    userId: string;
    content: string;
    timestamp: Date;
}

export interface ChatRequest {
    userId: string;
    message: string;
}

export interface ChatResponse {
    messageId: string;
    response: string;
    timestamp: Date;
}