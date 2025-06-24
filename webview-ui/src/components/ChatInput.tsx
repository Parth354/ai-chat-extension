import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSend: (text: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const trimmed = text.trim();
      if (trimmed) {
        try {
          onSend(trimmed);
          setText('');
        } catch (err) {
          console.error('Error sending message:', err);
        }
      }
    }
  };

  return (
    <div className="p-2">
      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        className="w-full resize-none rounded-md bg-[var(--vscode-input-background)] p-2 text-sm text-[var(--vscode-input-foreground)] shadow-sm border border-[var(--vscode-input-border)] focus:outline-none focus:ring"
        rows={2}
      />
    </div>
  );
};

export default ChatInput;
