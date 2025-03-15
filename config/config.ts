import dotenv from 'dotenv';

dotenv.config();

const config = {
    port: process.env.PORT || 3000,
    dbUri: process.env.DB_URI || 'mongodb://localhost:27017/ai-classroom-chat',
    openAiApiKey: process.env.OPENAI_API_KEY || '',
    environment: process.env.NODE_ENV || 'development',
};

export default config;