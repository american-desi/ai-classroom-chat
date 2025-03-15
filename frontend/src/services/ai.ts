import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, we should proxy through our backend
});

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GenerateQuizParams {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
}

interface GradeAssignmentParams {
  prompt: string;
  submission: string;
  rubric?: string;
}

const DEFAULT_SYSTEM_MESSAGE = `You are a helpful AI teaching assistant. You help students understand complex topics 
and answer their questions clearly and concisely. You can explain concepts at different levels of complexity and 
provide relevant examples.`;

export const generateAIResponse = async (
  message: string,
  conversationHistory: Message[] = [],
  context?: { subject?: string; topic?: string; role?: 'student' | 'teacher' }
): Promise<string> => {
  try {
    const systemMessage = context ? 
      `${DEFAULT_SYSTEM_MESSAGE} Current subject: ${context.subject || 'General'}. 
       Current topic: ${context.topic || 'Not specified'}. 
       User role: ${context.role || 'student'}.` : 
      DEFAULT_SYSTEM_MESSAGE;

    const messages: Message[] = [
      { role: 'system', content: systemMessage },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      messages,
      model: "gpt-3.5-turbo",
      temperature: 0.7,
    });

    return completion.choices[0].message.content || "I apologize, but I couldn't generate a response.";
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Failed to generate AI response');
  }
};

export const generateQuiz = async ({ topic, difficulty, questionCount }: GenerateQuizParams): Promise<string> => {
  try {
    const prompt = `Generate a ${difficulty} difficulty quiz about ${topic} with ${questionCount} questions. 
    Include a mix of multiple choice and open-ended questions. Format the output as a JSON string with the following structure:
    {
      "questions": [
        {
          "type": "multiple_choice" | "open_ended",
          "question": "question text",
          "options": ["A", "B", "C", "D"] (for multiple choice only),
          "correctAnswer": "correct answer",
          "explanation": "explanation of the answer"
        }
      ]
    }`;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a quiz generation assistant.' },
        { role: 'user', content: prompt }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
    });

    return completion.choices[0].message.content || "Failed to generate quiz";
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw new Error('Failed to generate quiz');
  }
};

export const gradeAssignment = async ({ prompt, submission, rubric }: GradeAssignmentParams): Promise<string> => {
  try {
    const gradePrompt = `
    Assignment Prompt: ${prompt}
    ${rubric ? `Grading Rubric: ${rubric}` : ''}
    Student Submission: ${submission}

    Please provide:
    1. A numerical grade (0-100)
    2. Detailed feedback
    3. Suggestions for improvement
    Format the response as JSON:
    {
      "grade": number,
      "feedback": "detailed feedback",
      "suggestions": ["suggestion1", "suggestion2", ...]
    }`;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an assignment grading assistant.' },
        { role: 'user', content: gradePrompt }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.3,
    });

    return completion.choices[0].message.content || "Failed to grade assignment";
  } catch (error) {
    console.error('Error grading assignment:', error);
    throw new Error('Failed to grade assignment');
  }
};

export const explainConcept = async (
  concept: string,
  level: 'beginner' | 'intermediate' | 'advanced',
  context?: { subject?: string; prerequisites?: string[] }
): Promise<string> => {
  try {
    const prompt = `
    Explain the concept: ${concept}
    Explanation level: ${level}
    ${context?.subject ? `Subject area: ${context.subject}` : ''}
    ${context?.prerequisites ? `Related concepts to reference: ${context.prerequisites.join(', ')}` : ''}
    
    Please provide:
    1. A clear explanation
    2. Real-world examples
    3. Practice problems or exercises
    Format as JSON:
    {
      "explanation": "main explanation",
      "examples": ["example1", "example2"],
      "practiceProblems": ["problem1", "problem2"]
    }`;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a concept explanation assistant.' },
        { role: 'user', content: prompt }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.5,
    });

    return completion.choices[0].message.content || "Failed to explain concept";
  } catch (error) {
    console.error('Error explaining concept:', error);
    throw new Error('Failed to explain concept');
  }
}; 