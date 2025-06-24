import { useState, useEffect, useCallback } from 'react';
import { ChatMessage, VSCodeAPI, WebviewMessage, IRegisteredProviderConfig } from '../types';

export default function useChatController(vscode: VSCodeAPI) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => vscode.getState()?.messages || []);
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [availableProviders, setAvailableProviders] = useState<IRegisteredProviderConfig[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  const requestSettings = useCallback(() => {
    vscode.postMessage({ type: 'requestSettings' });
    setRetryCount(prev => prev + 1);
  }, [vscode]);

  useEffect(() => {
    requestSettings();
    const timeout = setTimeout(requestSettings, 1000);
    return () => clearTimeout(timeout);
  }, [requestSettings]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const msg: WebviewMessage = event.data;

      if (msg.type === 'settingsUpdate' && msg.settings?.availableModels?.length) {
        const settings = msg.settings;
        setAvailableProviders(settings.availableModels);
        const provider = settings.availableModels.find(p => p.providerId === settings.defaultModelProvider) || settings.availableModels[0];
        setSelectedProviderId(provider.providerId);
        const model = settings[`${provider.providerId}Model`] || provider.defaultModelId || provider.models[0]?.id || '';
        setSelectedModelId(model);
        setShowErrorModal(false);
        setErrorMessage('');
      }

      if (msg.type === 'response' && msg.text) {
        const aiMsg: ChatMessage = { id: Date.now().toString(), type: 'assistant', content: msg.text, timestamp: new Date().toISOString() };
        setMessages(m => [...m, aiMsg]);
        setIsLoading(false);
      }

      if (msg.type === 'error' || msg.type === 'apiError') {
        const backendError = typeof msg.message === 'string' ? msg.message : 'An unknown error occurred.';
        setShowErrorModal(true);
        setErrorMessage(backendError);
        setIsLoading(false);
        setRetryCount(prev => prev + 1);
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  useEffect(() => {
    vscode.setState({ messages });
  }, [messages, vscode]);

  const handleSendMessage = useCallback((content: string) => {
    if (!content.trim() || !selectedProviderId || !selectedModelId) return;

    setIsLoading(true);
    const userMsg: ChatMessage = { id: Date.now().toString(), type: 'user', content: content.trim(), timestamp: new Date().toISOString() };
    setMessages(m => [...m, userMsg]);

    vscode.postMessage({
      type: 'sendMessage',
      text: content.trim(),
      context: { attachedFiles },
      modelProvider: selectedProviderId,
      modelName: selectedModelId
    });
  }, [selectedProviderId, selectedModelId, attachedFiles, vscode]);

  const handleClearMessages = () => {
    setMessages([]);
    vscode.setState({ messages: [] });
  };

  return {
    messages,
    isLoading,
    attachedFiles,
    availableProviders,
    selectedProviderId,
    selectedModelId,
    showErrorModal,
    errorMessage,
    retryCount,
    setSelectedProviderId,
    setSelectedModelId,
    setShowErrorModal,
    setAttachedFiles,
    setMessages,
    setIsLoading,
    handleSendMessage,
    handleClearMessages,
    requestSettings,
  };
}
