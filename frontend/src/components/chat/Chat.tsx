import { useState, useRef, useEffect, ComponentType } from 'react';
import dynamic from 'next/dynamic';
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Avatar,
  useToast,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useDisclosure,
  useColorMode,
  Tooltip,
  SlideFade,
  ScaleFade,
} from '@chakra-ui/react';
import { 
  ChevronDownIcon, 
  SunIcon, 
  MoonIcon,
  DeleteIcon,
  RepeatIcon,
} from '@chakra-ui/icons';
import { generateAIResponse, generateQuiz, gradeAssignment, explainConcept } from '@/services/ai';
import styles from './Chat.module.css';
import type { MessageContentProps } from './MessageContent';

// Dynamically import components that might cause SSR issues
const DynamicMessageContent = dynamic<MessageContentProps>(
  () => import('./MessageContent'),
  { ssr: false, loading: () => <Spinner /> }
);

const DynamicModal = dynamic(() => import('@chakra-ui/react').then(mod => mod.Modal));
const DynamicModalOverlay = dynamic(() => import('@chakra-ui/react').then(mod => mod.ModalOverlay));
const DynamicModalContent = dynamic(() => import('@chakra-ui/react').then(mod => mod.ModalContent));
const DynamicModalHeader = dynamic(() => import('@chakra-ui/react').then(mod => mod.ModalHeader));
const DynamicModalBody = dynamic(() => import('@chakra-ui/react').then(mod => mod.ModalBody));
const DynamicModalCloseButton = dynamic(() => import('@chakra-ui/react').then(mod => mod.ModalCloseButton));

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'chat' | 'quiz' | 'assignment' | 'explanation';
  metadata?: any;
}

interface ChatProps {
  isDemo?: boolean;
  context?: {
    subject?: string;
    topic?: string;
    role?: 'student' | 'teacher';
  };
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: { topic: string; difficulty: string; questionCount: number }) => void;
}

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: { prompt: string; submission: string; rubric?: string }) => void;
}

const QuizModal = ({ isOpen, onClose, onSubmit }: QuizModalProps) => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(5);

  const handleSubmit = () => {
    onSubmit({ topic, difficulty, questionCount });
    onClose();
  };

  return (
    <DynamicModal isOpen={isOpen} onClose={onClose}>
      <DynamicModalOverlay />
      <DynamicModalContent>
        <DynamicModalHeader>Generate Quiz</DynamicModalHeader>
        <DynamicModalCloseButton />
        <DynamicModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Topic</FormLabel>
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Enter quiz topic" />
            </FormControl>
            <FormControl>
              <FormLabel>Difficulty</FormLabel>
              <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Number of Questions</FormLabel>
              <NumberInput min={1} max={10} value={questionCount} onChange={(_, val) => setQuestionCount(val)}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <Button colorScheme="blue" onClick={handleSubmit} width="100%">
              Generate Quiz
            </Button>
          </VStack>
        </DynamicModalBody>
      </DynamicModalContent>
    </DynamicModal>
  );
};

const AssignmentModal = ({ isOpen, onClose, onSubmit }: AssignmentModalProps) => {
  const [prompt, setPrompt] = useState('');
  const [submission, setSubmission] = useState('');
  const [rubric, setRubric] = useState('');

  const handleSubmit = () => {
    onSubmit({ prompt, submission, rubric });
    onClose();
  };

  return (
    <DynamicModal isOpen={isOpen} onClose={onClose} size="xl">
      <DynamicModalOverlay />
      <DynamicModalContent>
        <DynamicModalHeader>Grade Assignment</DynamicModalHeader>
        <DynamicModalCloseButton />
        <DynamicModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Assignment Prompt</FormLabel>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter the assignment prompt..."
                rows={3}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Student Submission</FormLabel>
              <Textarea
                value={submission}
                onChange={(e) => setSubmission(e.target.value)}
                placeholder="Enter the student's submission..."
                rows={6}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Grading Rubric (Optional)</FormLabel>
              <Textarea
                value={rubric}
                onChange={(e) => setRubric(e.target.value)}
                placeholder="Enter grading rubric..."
                rows={3}
              />
            </FormControl>
            <Button colorScheme="blue" onClick={handleSubmit} width="100%">
              Grade Assignment
            </Button>
          </VStack>
        </DynamicModalBody>
      </DynamicModalContent>
    </DynamicModal>
  );
};

export default function Chat({ isDemo = false, context }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const { 
    isOpen: isQuizModalOpen, 
    onOpen: onQuizModalOpen, 
    onClose: onQuizModalClose 
  } = useDisclosure();
  const { 
    isOpen: isAssignmentModalOpen, 
    onOpen: onAssignmentModalOpen, 
    onClose: onAssignmentModalClose 
  } = useDisclosure();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const clearChat = () => {
    setMessages([]);
    toast({
      title: 'Chat cleared',
      status: 'info',
      duration: 2000,
    });
  };

  const regenerateLastResponse = async () => {
    if (messages.length === 0) return;

    const lastUserMessage = [...messages].reverse().find(m => m.sender === 'user');
    if (!lastUserMessage) return;

    // Remove the last AI message
    setMessages(prev => prev.slice(0, -1));
    setIsLoading(true);

    try {
      const conversationHistory = messages
        .slice(0, -1) // Exclude the last AI message
        .map(msg => ({
          role: msg.sender === 'user' ? ('user' as const) : ('assistant' as const),
          content: msg.content
        }));

      const aiResponse = await generateAIResponse(lastUserMessage.content, conversationHistory, context);
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        type: 'chat',
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to regenerate response. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
      type: 'chat',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: msg.content
      }));

      const aiResponse = await generateAIResponse(input, conversationHistory, context);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        type: 'chat',
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get AI response. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuiz = async (params: { topic: string; difficulty: string; questionCount: number }) => {
    setIsLoading(true);
    try {
      const quiz = await generateQuiz({
        topic: params.topic,
        difficulty: params.difficulty as 'easy' | 'medium' | 'hard',
        questionCount: params.questionCount
      });

      const aiMessage: Message = {
        id: Date.now().toString(),
        content: quiz,
        sender: 'ai',
        timestamp: new Date(),
        type: 'quiz',
        metadata: { topic: params.topic, difficulty: params.difficulty }
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate quiz. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainConcept = async (concept: string, level: 'beginner' | 'intermediate' | 'advanced') => {
    setIsLoading(true);
    try {
      const explanation = await explainConcept(concept, level, {
        subject: context?.subject,
        prerequisites: []
      });

      const aiMessage: Message = {
        id: Date.now().toString(),
        content: explanation,
        sender: 'ai',
        timestamp: new Date(),
        type: 'explanation',
        metadata: { concept, level }
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to explain concept. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGradeAssignment = async (params: { prompt: string; submission: string; rubric?: string }) => {
    setIsLoading(true);
    try {
      const grade = await gradeAssignment(params);

      const aiMessage: Message = {
        id: Date.now().toString(),
        content: grade,
        sender: 'ai',
        timestamp: new Date(),
        type: 'assignment',
        metadata: { prompt: params.prompt }
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to grade assignment. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) {
    return (
      <Box className={styles.chatContainer}>
        <VStack spacing={4} align="center" justify="center" height="100%">
          <Spinner size="xl" />
          <Text>Loading chat...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box className={styles.chatContainer}>
      <VStack spacing={4} align="stretch" className={styles.messageList}>
        {messages.map((message) => (
          <Box
            key={message.id}
            className={`${styles.message} ${message.sender === 'user' ? styles.userMessage : styles.aiMessage}`}
          >
            <HStack spacing={3} align="start">
              <Avatar 
                size="sm"
                name={message.sender === 'user' ? 'User' : 'AI'}
                src={message.sender === 'user' ? '/user-avatar.png' : '/ai-avatar.png'}
              />
              <Box flex={1}>
                {isClient && (
                  <DynamicMessageContent 
                    content={message.content}
                    type={message.type || 'chat'}
                    metadata={message.metadata}
                  />
                )}
              </Box>
            </HStack>
          </Box>
        ))}
        {isLoading && (
          <Box className={styles.loadingMessage}>
            <Spinner size="sm" />
            <Text ml={2}>AI is thinking...</Text>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </VStack>

      <Box className={styles.inputContainer}>
        <HStack spacing={2}>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <Button
            colorScheme="blue"
            onClick={handleSend}
            isLoading={isLoading}
            loadingText="Sending..."
          >
            Send
          </Button>
          <IconButton
            aria-label="Clear chat"
            icon={<DeleteIcon />}
            onClick={clearChat}
            variant="ghost"
          />
          <IconButton
            aria-label="Regenerate response"
            icon={<RepeatIcon />}
            onClick={regenerateLastResponse}
            variant="ghost"
            isDisabled={messages.length === 0 || isLoading}
          />
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
          />
        </HStack>
      </Box>

      {isClient && (
        <>
          <QuizModal
            isOpen={isQuizModalOpen}
            onClose={onQuizModalClose}
            onSubmit={handleGenerateQuiz}
          />
          <AssignmentModal
            isOpen={isAssignmentModalOpen}
            onClose={onAssignmentModalClose}
            onSubmit={handleGradeAssignment}
          />
        </>
      )}
    </Box>
  );
} 