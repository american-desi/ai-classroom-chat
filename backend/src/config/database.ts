import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-classroom';
    await mongoose.connect(mongoURI);
    console.log('📦 MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Exit process with failure
    process.exit(1);
  }
}; 