import React from 'react';
import ChatHeader from './components/ChatHeader';
import ChatMain from './components/ChatMain';
import ErrorModal from './components/ErrorModal';
import useChatController from './hooks/useChatController';
import { VSCodeAPI } from './types';
import './main.css';

interface AppProps {
  vscode: VSCodeAPI;
}

const App: React.FC<AppProps> = ({ vscode }) => {
  const controller = useChatController(vscode);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white font-sans">
      <ChatHeader
        availableProviders={controller.availableProviders}
        selectedProviderId={controller.selectedProviderId}
        selectedModelId={controller.selectedModelId}
        setSelectedProviderId={controller.setSelectedProviderId}
        setSelectedModelId={controller.setSelectedModelId}
        showErrorModal={controller.showErrorModal}
        retryCount={controller.retryCount}
        requestSettings={controller.requestSettings}
      />
      <ChatMain
        messages={controller.messages}
        isLoading={controller.isLoading}
        handleSendMessage={controller.handleSendMessage}
        handleClearMessages={controller.handleClearMessages}
      />
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
