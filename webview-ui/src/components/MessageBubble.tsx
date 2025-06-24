import React from 'react';
import ReactMarkdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ChatMessage } from '../types';

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isDark = document.body.dataset.vscodeThemeKind === 'vscode-dark';

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
            code(props) {
              const { inline, className, children, ...rest } = props as {
                inline?: boolean;
                className?: string;
                children: React.ReactNode;
              };

              const match = /language-(\w+)/.exec(className || '');
              const language = match?.[1];

              if (!inline && language) {
                return (
                  <SyntaxHighlighter
                    style={isDark ? vscDarkPlus : vs}
                    language={language}
                    PreTag="div"
                    {...rest}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                );
              }

              return (
                <code className={className} {...rest}>
                  {children}
                </code>
              );
            }
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default MessageBubble;