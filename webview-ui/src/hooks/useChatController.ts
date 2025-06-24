import { useEffect, useState } from 'react';
import { ChatMessage, VSCodeAPI, WebviewMessage, IRegisteredProviderConfig } from '../types';
import { v4 as uuidv4 } from 'uuid';

export default function useChatController(vscode: VSCodeAPI) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [availableProviders, setAvailableProviders] = useState<IRegisteredProviderConfig[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [attachedFiles, setAttachedFiles] = useState<Record<string, string>>({});
  const [pendingSend, setPendingSend] = useState<string | null>(null);

  useEffect(() => {
    const listener = (event: MessageEvent<WebviewMessage>) => {
      const message = event.data;

      switch (message.type) {
        case 'settingsUpdate':
          if (message.settings) {
            const { availableModels, defaultModelProvider } = message.settings;
            setAvailableProviders(availableModels);
            setSelectedProviderId(defaultModelProvider);
            const defaultProvider = availableModels.find(p => p.providerId === defaultModelProvider);
            if (defaultProvider) {
              setSelectedModelId(defaultProvider.defaultModelId);
            }
          }
          break;

        case 'attachedFileContent': {
          const { fileName, content } = message;
          if (typeof fileName === 'string' && typeof content === 'string') {
            setAttachedFiles(prev => {
              const updated: Record<string, string> = { ...prev, [fileName]: content };
              if (pendingSend && areAllMentionsAvailable(pendingSend, updated)) {
                sendExpandedMessage(pendingSend, updated);
                setPendingSend(null);
              }
              return updated;
            });
          }
          break;
        }

        case 'response':
          if (message.text) {
            const newMsg: ChatMessage = {
              id: uuidv4(),
              type: 'assistant',
              content: message.text,
              timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, newMsg]);
            setIsLoading(false);
          }
          break;

        case 'error':
          if (message.error?.message) {
            setErrorMessage(message.error.message);
            setShowErrorModal(true);
            setIsLoading(false);
          }
          break;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestSettings();
      }
    };

    window.addEventListener('message', listener);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Delay to prevent race condition
    const timeout = setTimeout(() => {
      requestSettings();
    }, 50);

    return () => {
      window.removeEventListener('message', listener);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(timeout);
    };
  }, [pendingSend]);

  const requestSettings = () => {
    vscode.postMessage({ type: 'requestSettings' });
  };

  const extractMentions = (text: string): string[] => {
    const matches = [...text.matchAll(/@([\w./-]+)/g)];
    return matches.map(m => m[1]);
  };

  const areAllMentionsAvailable = (text: string, fileMap: Record<string, string>) => {
    return extractMentions(text).every(name => fileMap[name]);
  };

  const expandAtMentions = (text: string, fileMap: Record<string, string>): string => {
    return text.replace(/@([\w./-]+)/g, (match, fileName) => {
      const content = fileMap[fileName];
      return content
        ? `\n\n--- Begin file: ${fileName} ---\n${content}\n--- End file: ${fileName} ---\n\n`
        : match;
    });
  };

  const sendExpandedMessage = (rawText: string, fileMap: Record<string, string>) => {
    const expandedText = expandAtMentions(rawText, fileMap);

    const userMessage: ChatMessage = {
      id: uuidv4(),
      type: 'user',
      content: expandedText,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const message: WebviewMessage = {
      type: 'sendMessage',
      text: expandedText,
      modelProvider: selectedProviderId!,
      modelName: selectedModelId!,
    };

    vscode.postMessage(message);
  };

  const handleSendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !selectedProviderId || !selectedModelId) return;

    const mentions = extractMentions(trimmed);
    const missing = mentions.filter(m => !attachedFiles[m]);

    if (missing.length > 0) {
      missing.forEach(name => {
        vscode.postMessage({
          type: 'requestFileContent',
          fileName: name,
          modelProvider: selectedProviderId,
          modelName: selectedModelId,
          originalMessage: trimmed,
        });
      });
      setPendingSend(trimmed);
      return;
    }

    sendExpandedMessage(trimmed, attachedFiles);
  };

  const handleClearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    isLoading,
    handleSendMessage,
    handleClearMessages,
    showErrorModal,
    setShowErrorModal,
    errorMessage,
    retryCount,
    availableProviders,
    selectedProviderId,
    selectedModelId,
    setSelectedProviderId,
    setSelectedModelId,
    requestSettings,
  };
}
