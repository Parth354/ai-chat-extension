// src/components/ChatMain.tsx
import React from 'react';
import { ChatMessage, VSCodeAPI } from '../types';
import ChatHistory from './ChatHistory';

interface Props {
  vscode: VSCodeAPI;
  messages: ChatMessage[];
  isLoading: boolean;
}

export default function ChatMain({ vscode, messages, isLoading }: Props) {
  return (
    <div className="flex flex-col space-y-2">
      <ChatHistory messages={messages} isLoading={isLoading} />
    </div>
  );
}
