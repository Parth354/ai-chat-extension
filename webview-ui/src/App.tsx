// webview-ui/src/App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import ChatHistory from './components/ChatHistory';
import ChatInput from './components/ChatInput';
import FileAttachment from './components/FileAttachment'; // Import the FileAttachment component
import { ChatMessage, VSCodeAPI } from './types';
import './App.css'; // Assuming your CSS is now correctly named/linked to main.css

interface AppProps {
  vscode: VSCodeAPI; // Expect the VSCode API instance as a prop
}

const App: React.FC<AppProps> = ({ vscode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Acquire state from VS Code persistence only once during initialization
    const state = vscode.getState();
    return state?.messages || [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]); // State for attached files

  // Effect to save state to VS Code persistence whenever messages change
  useEffect(() => {
    vscode.setState({ messages });
  }, [messages, vscode]);

  // Effect to listen for messages coming from the VS Code extension
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data; // The JSON data sent from the extension

      // --- CRITICAL DEBUGGING LOG: This line will show the full JSON content ---
      console.log('💡 Webview received message from extension (FULL JSON):', JSON.stringify(message, null, 2));
      // --- END CRITICAL DEBUGGING LOG ---

      switch (message.type) {
        case 'response': // This type comes from WebviewProvider.ts postMessage({ type: 'response', text: response })
          setIsLoading(false);
          setMessages(prev => [...prev, {
            id: Date.now().toString(), // Generate a simple unique ID
            type: 'assistant',
            content: message.text, // Assuming the AI response content is in 'text' as per WebviewProvider
            timestamp: new Date().toISOString()
          }]);
          break;

        case 'error': // This type comes from WebviewProvider.ts postMessage({ type: 'error', message: error.message })
          setIsLoading(false);
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'system',
            content: `Error: ${message.message}`, // Assuming the error message content is in 'message'
            timestamp: new Date().toISOString()
          }]);
          break;
        default:
          console.warn('Webview received unknown message type, or message structure is unexpected:', message.type, message);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleSendMessage = useCallback((content: string) => {
    if (!content.trim()) return;

    setIsLoading(true);
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString()
    }]);

    vscode.postMessage({
      type: 'sendMessage',
      text: content.trim(),
      context: { /* Add any current context data here, e.g., attachedFiles, active editor info */ },
    });
  }, [vscode]);

  const handleRemoveFile = useCallback((filePath: string) => {
    setAttachedFiles(prev => prev.filter(file => file !== filePath));
  }, []);

  return (
    <div className="app">
      <div className="app-header">
        <h2>AI Chat Assistant</h2>
      </div>

      <div className="app-content">
        <ChatHistory messages={messages} isLoading={isLoading} />
        
        {attachedFiles.length > 0 && (
          <FileAttachment
            attachedFiles={attachedFiles}
            onRemoveFile={handleRemoveFile}
          />
        )}

        <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
};

export default App;
