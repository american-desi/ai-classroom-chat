import { VertexAI } from '@google-cloud/aiplatform';
import { OpenAI } from 'openai';
import { config } from '../../config';
import { logger } from '../../utils/logger';

// Initialize Vertex AI
const vertexAI = new VertexAI({
  projectId: config.projectId,
  location: config.gcp.region,
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

export interface AIAnalysisResult {
  sentiment: number;
  toxicity: number;
  topics: string[];
  summary?: string;
  suggestedResponses?: string[];
}

export const setupAIServices = () => {
  logger.info('Initializing AI services...');
  return {
    vertexAI,
    openai,
  };
};

export const analyzeMessage = async (message: string): Promise<AIAnalysisResult> => {
  try {
    // Use Vertex AI for content analysis
    const [result] = await vertexAI.predict({
      endpoint: 'text-analysis',
      instances: [{ content: message }],
    });

    // Use OpenAI for generating responses and summaries
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an AI teaching assistant. Analyze the following message and provide helpful suggestions.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.7,
    });

    return {
      sentiment: result.predictions[0].sentiment,
      toxicity: result.predictions[0].toxicity,
      topics: result.predictions[0].topics,
      summary: completion.choices[0].message.content,
      suggestedResponses: generateSuggestedResponses(completion.choices[0].message.content),
    };
  } catch (error) {
    logger.error('Error analyzing message:', error);
    throw new Error('Failed to analyze message');
  }
};

export const generateSuggestedResponses = (context: string): string[] => {
  // Implement response generation logic
  return [];
};

export const translateMessage = async (
  text: string,
  targetLanguage: string
): Promise<string> => {
  try {
    const [result] = await vertexAI.predict({
      endpoint: 'translation',
      instances: [{ content: text, targetLanguage }],
    });
    return result.predictions[0].translatedText;
  } catch (error) {
    logger.error('Error translating message:', error);
    throw new Error('Failed to translate message');
  }
};

export const moderateContent = async (content: string): Promise<boolean> => {
  try {
    const [result] = await vertexAI.predict({
      endpoint: 'content-moderation',
      instances: [{ content }],
    });
    return result.predictions[0].isSafe;
  } catch (error) {
    logger.error('Error moderating content:', error);
    throw new Error('Failed to moderate content');
  }
}; 