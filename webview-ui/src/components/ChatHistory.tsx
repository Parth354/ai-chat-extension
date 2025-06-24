import React from 'react';
import MessageBubble from './MessageBubble';
import { ChatMessage } from '../types';

interface ChatHistoryProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages, isLoading }) => {
  return (
    <div className="chat-history">
      {messages.map(message => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {isLoading && (
        <div className="loading-indicator">
          <div className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span>AI is thinking...</span>
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
