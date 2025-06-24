import React from 'react';
import { ChatMessage } from '../types';
import ChatHistory from './ChatHistory';
import FileAttachment from './FileAttachment';
import ChatInput from './ChatInput';

interface Props {
  messages: ChatMessage[];
  isLoading: boolean;
  handleSendMessage: (msg: string) => void;
  handleClearMessages: () => void;
  attachedFiles?: string[];
  onRemoveFile?: (filePath: string) => void;
}

const ChatMain: React.FC<Props> = ({
  messages,
  isLoading,
  handleSendMessage,
  handleClearMessages,
  attachedFiles = [],
  onRemoveFile = () => {}
}) => {
  return (
    <div className="chat-main">
      <ChatHistory messages={messages} isLoading={isLoading} onClearChat={handleClearMessages} />
      <FileAttachment attachedFiles={attachedFiles} onRemoveFile={onRemoveFile} />
      <div className="chat-input">
        <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
};

export default ChatMain;
