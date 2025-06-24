import React from 'react';
import MessageBubble from './MessageBubble';
import { ChatMessage } from '../types';

interface ChatHistoryProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages, isLoading }) => {
  return (
    <div className="flex-1 overflow-auto p-4 space-y-2">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="max-w-[80%] px-4 py-2 rounded-md text-sm italic text-[var(--vscode-editorHint-foreground)]">
            Assistant is thinking…
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
