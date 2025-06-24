import React from 'react';
import ChatHeader from './components/ChatHeader';
import ChatMain from './components/ChatMain';
import ChatInput from './components/ChatInput';
import ErrorModal from './components/ErrorModal';
import useChatController from './hooks/useChatController';
import { VSCodeAPI } from './types';

interface AppProps {
  vscode: VSCodeAPI;
}

const App: React.FC<AppProps> = ({ vscode }) => {
  const controller = useChatController(vscode);

  const handleSend = (text: string) => {
    controller.handleSendMessage(text);
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[var(--vscode-editor-background)] text-[var(--vscode-editor-foreground)] font-sans">
      <ChatHeader
        availableProviders={controller.availableProviders}
        selectedProviderId={controller.selectedProviderId ?? ''}
        selectedModelId={controller.selectedModelId ?? ''}
        setSelectedProviderId={controller.setSelectedProviderId}
        setSelectedModelId={controller.setSelectedModelId}
        showErrorModal={controller.showErrorModal}
        retryCount={controller.retryCount}
        requestSettings={controller.requestSettings}
      />

      <div className="flex-1 overflow-y-auto px-4 py-2">
        <ChatMain
          vscode={vscode}
          messages={controller.messages}
          isLoading={controller.isLoading}
        />
      </div>

      <div className="sticky bottom-0 z-10 bg-[var(--vscode-sideBar-background)] border-t border-[var(--vscode-editorWidget-border)] px-4 py-3">
        <ChatInput onSend={handleSend} />
        <button
          onClick={controller.handleClearMessages}
          className="w-full text-xs text-[var(--vscode-editorWarning-foreground)] underline pt-2"
        >
          Clear Chat
        </button>
      </div>

      {controller.showErrorModal && (
        <ErrorModal
          errorMessage={controller.errorMessage}
          onClose={() => controller.setShowErrorModal(false)}
          onRetry={controller.requestSettings}
        />
      )}
    </div>
  );
};

export default App;
