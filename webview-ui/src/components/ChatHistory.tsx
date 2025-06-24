import React from 'react';
import { ChatMessage } from '../types';
import MessageBubble from './MessageBubble';

interface ChatHistoryProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onClearChat: () => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages, isLoading, onClearChat }) => {
  return (
    <div className="chat-history-container">
      <div className="clear-chat-container">
        <button className="clear-chat-button" onClick={onClearChat}>
          🗑️ Clear Chat
        </button>
      </div>

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
    </div>
  );
};

export default ChatHistory;
