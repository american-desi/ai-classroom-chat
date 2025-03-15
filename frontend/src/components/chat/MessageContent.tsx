import React from 'react';
import { ErrorBoundary } from '../ErrorBoundary';
import { useMonitoring } from '../../utils/monitoring';
import dynamic from 'next/dynamic';
import styles from './MessageContent.module.css';

// Import types for the CodeBlock component
interface CodeBlockProps {
  language: string;
  code: string;
}

// Dynamic import with proper types
const DynamicCodeBlock = dynamic<CodeBlockProps>(
  () => import('./CodeBlock'),
  {
    ssr: false,
    loading: () => (
      <div className={styles.codeBlock}>
        <div className={styles.codeHeader}>
          <span className={styles.languageBadge}>Loading...</span>
        </div>
        <pre className={styles.pre}>Loading code preview...</pre>
      </div>
    ),
  }
);

interface Question {
  type: 'multiple_choice' | 'open_ended';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

interface Quiz {
  questions: Question[];
}

interface ConceptExplanation {
  explanation: string;
  examples: string[];
  practiceProblems: string[];
}

interface AssignmentGrade {
  grade: number;
  feedback: string;
  suggestions: string[];
}

interface MessageContentProps {
  content: string;
  type: 'chat' | 'quiz' | 'assignment' | 'explanation';
  metadata?: any;
}

interface CodeBlock {
  language: string;
  code: string;
}

const extractCodeBlocks = (text: string): { text: string; codeBlocks: CodeBlock[] } => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const codeBlocks: CodeBlock[] = [];
  const cleanText = text.replace(codeBlockRegex, (_, lang, code) => {
    codeBlocks.push({
      language: lang || 'text',
      code: code.trim()
    });
    return '[CODE_BLOCK]';
  });

  return { text: cleanText, codeBlocks };
};

const safeStringify = (content: any): string => {
  if (typeof content === 'string') return content;
  if (content === null || content === undefined) return '';
  if (typeof content === 'object') {
    try {
      return JSON.stringify(content);
    } catch {
      return String(content);
    }
  }
  return String(content);
};

const MessageContent = ({ content, type, metadata }: MessageContentProps) => {
  const { logError } = useMonitoring('MessageContent');

  const renderChatContent = (text: string) => {
    try {
      const { text: cleanText, codeBlocks } = extractCodeBlocks(text);
      const textParts = cleanText.split('[CODE_BLOCK]');

      return (
        <div className={styles.chatContent}>
          {textParts.map((part, index) => (
            <React.Fragment key={`part-${index}`}>
              {part && <p className={styles.textContent}>{part}</p>}
              {codeBlocks[index] && (
                <DynamicCodeBlock
                  key={`code-${index}`}
                  language={codeBlocks[index].language}
                  code={codeBlocks[index].code}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      );
    } catch (e) {
      logError(e as Error);
      return <div className={styles.error}>Failed to render content</div>;
    }
  };

  const renderExplanation = (explanationData: ConceptExplanation) => {
    return (
      <div className={styles.explanation}>
        <div className={styles.header}>
          <div className={styles.badges}>
            <span className={styles.badgePurple}>{metadata?.level || 'Concept'}</span>
            <span className={styles.badgeBlue}>{metadata?.concept || 'Explanation'}</span>
          </div>
        </div>
        
        <div className={styles.content}>
          <div className={styles.section}>
            <h3>Explanation:</h3>
            <p>{explanationData.explanation}</p>
          </div>

          <div className={styles.section}>
            <h3>Examples:</h3>
            <ul>
              {explanationData.examples.map((example, idx) => (
                <li key={idx}>
                  <span className={styles.bullet}>•</span>
                  {example}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.section}>
            <h3>Practice Problems:</h3>
            <ul>
              {explanationData.practiceProblems.map((problem, idx) => (
                <li key={idx}>
                  <span className={styles.bullet}>•</span>
                  {problem}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    try {
      if (type === 'chat') {
        return renderChatContent(content);
      }

      if (type === 'explanation') {
        const explanationData = JSON.parse(content) as ConceptExplanation;
        if (!explanationData?.explanation) return <p>Error parsing explanation data</p>;
        return renderExplanation(explanationData);
      }

      return <p className={styles.textContent}>{content}</p>;
    } catch (e) {
      logError(e as Error);
      return <div className={styles.error}>Failed to render content</div>;
    }
  };

  return (
    <ErrorBoundary>
      <div className={styles.messageContent}>
        {renderContent()}
      </div>
    </ErrorBoundary>
  );
};

export default MessageContent;