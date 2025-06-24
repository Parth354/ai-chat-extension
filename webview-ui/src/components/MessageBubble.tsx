import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types';

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  return (
    <div className={`message-bubble ${message.type}`}>
      <div className="message-header">
        <span className="message-author">
          {message.type === 'user' ? 'You' : 'AI Assistant'}
        </span>
        <span className="message-time">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>

      <div className="message-content">
        <ReactMarkdown
          components={{
            code({ inline, className, children, ...props }: any) {
              if (inline) {
                return <code className={className}>{children}</code>;
              }
              return (
                <pre className={className}>
                  <code>{children}</code>
                </pre>
              );
            },
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default MessageBubble;
