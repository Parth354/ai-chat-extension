// src/components/MessageBubble.tsx
import React from 'react';
import { ChatMessage } from '../types';
import AssistantMessageBubble from './AssistantMessageBubble';

interface Props {
  message: ChatMessage;
}

const MessageBubble = ({ message }: Props) => {
  const isUser = message.type === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] px-4 py-2 rounded-md text-sm whitespace-pre-wrap ${
          isUser
            ? 'bg-[var(--vscode-editor-background)] text-[var(--vscode-editor-foreground)]'
            : ''
        }`}
      >
        {isUser ? (
          <span>{message.content}</span>
        ) : (
          <AssistantMessageBubble message={message} />
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
