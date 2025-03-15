import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('8080'),
  PROJECT_ID: z.string(),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  OPENAI_API_KEY: z.string(),
  FIREBASE_PROJECT_ID: z.string(),
  GOOGLE_CLOUD_REGION: z.string().default('us-central1'),
});

const validateEnv = (env: NodeJS.ProcessEnv) => {
  try {
    return envSchema.parse({
      NODE_ENV: env.NODE_ENV,
      PORT: env.PORT,
      PROJECT_ID: env.GOOGLE_CLOUD_PROJECT,
      CORS_ORIGIN: env.CORS_ORIGIN,
      OPENAI_API_KEY: env.OPENAI_API_KEY,
      FIREBASE_PROJECT_ID: env.FIREBASE_PROJECT_ID,
      GOOGLE_CLOUD_REGION: env.GOOGLE_CLOUD_REGION,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map(issue => issue.path.join('.'));
      throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
    }
    throw error;
  }
};

const env = validateEnv(process.env);

export const config = {
  env: env.NODE_ENV,
  port: parseInt(env.PORT, 10),
  projectId: env.PROJECT_ID,
  corsOrigin: env.CORS_ORIGIN,
  openaiApiKey: env.OPENAI_API_KEY,
  firebase: {
    projectId: env.FIREBASE_PROJECT_ID,
  },
  gcp: {
    region: env.GOOGLE_CLOUD_REGION,
    projectId: env.PROJECT_ID,
  },
  isProd: env.NODE_ENV === 'production',
  isDev: env.NODE_ENV === 'development',
} as const; 