import React from 'react';
import { ChatMessage } from '../types';

interface Props {
  message: ChatMessage;
}

export default function AssistantMessageBubble({ message }: Props) {
  const lines = message.content.split('\n');
  const rendered: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  lines.forEach((line, index) => {
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBuffer = [];
      } else {
        inCodeBlock = false;
        rendered.push(<CodeBlock key={`code-${index}`} code={codeBuffer.join('\n')} />);
      }
    } else if (inCodeBlock) {
      codeBuffer.push(line);
    } else if (/^\*\*(.+?)\*\*$/.test(line)) {
      rendered.push(
        <h2
          key={`heading-${index}`}
          className="font-bold mt-4 mb-2"
          style={{ color: 'var(--vscode-textLink-foreground)' }}
        >
          {line.replace(/\*\*/g, '')}
        </h2>
      );
    } else if (line.trim()) {
      rendered.push(
        <p
          key={`text-${index}`}
          className="mb-1"
          style={{ color: 'var(--vscode-editorWidget-foreground)' }}
        >
          {line}
        </p>
      );
    }
  });

  return (
    <div
      className="max-w-[80%] whitespace-pre-wrap rounded-md p-4 text-sm leading-relaxed"
      style={{
        backgroundColor: 'var(--vscode-editorWidget-background)',
        border: '1px solid var(--vscode-editorWidget-border)',
      }}
    >
      {rendered}
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  const handleCopy = () => navigator.clipboard.writeText(code);

  return (
    <div className="relative my-3">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 px-2 py-1 text-xs rounded border
                   border-[var(--vscode-button-border)]
                   bg-[var(--vscode-button-background)]
                   text-[var(--vscode-button-foreground)]
                   hover:bg-[var(--vscode-button-hoverBackground)]"
      >
        Copy
      </button>

      <div
        className="overflow-x-auto text-sm font-mono rounded p-3"
        style={{
          backgroundColor: 'var(--vscode-editor-background)',
          color: 'var(--vscode-editor-foreground)',
        }}
      >
        <pre>{code}</pre>
      </div>
    </div>
  );
}
