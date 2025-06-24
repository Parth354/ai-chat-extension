import React, { useState, useCallback } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  }, [message, disabled, onSendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  }, [handleSubmit]);

  return (
    <form onSubmit={handleSubmit} className="chat-input-form">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask me anything..."
        disabled={disabled}
        rows={2}
        className="message-input"
      />
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className="send-button"
      >
        {disabled ? '...' : 'Send'}
      </button>
    </form>
  );
};

export default ChatInput;
