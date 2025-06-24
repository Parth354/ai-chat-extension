import React from 'react';

interface Props {
  availableProviders: { providerId: string; providerName: string; models: { id: string; name: string }[] }[];
  selectedProviderId: string;
  selectedModelId: string;
  setSelectedProviderId: (id: string) => void;
  setSelectedModelId: (id: string) => void;
  showErrorModal: boolean;
  retryCount: number;
  requestSettings: () => void;
}

const ChatHeader: React.FC<Props> = ({
  availableProviders,
  selectedProviderId,
  selectedModelId,
  setSelectedProviderId,
  setSelectedModelId,
  showErrorModal,
  retryCount,
  requestSettings,
}) => {
  const currentProvider = availableProviders.find(p => p.providerId === selectedProviderId);
  const models = currentProvider?.models || [];

  return (
    <div className="app-header">
      <h2>AI Chat Assistant</h2>
      <div className="model-selection">
        <label htmlFor="provider">Provider:</label>
        <select
          className="model-select"
          id="provider"
          value={selectedProviderId}
          onChange={(e) => setSelectedProviderId(e.target.value)}
        >
          {availableProviders.map(p => (
            <option key={p.providerId} value={p.providerId}>{p.providerName}</option>
          ))}
        </select>

        <label htmlFor="model">Model:</label>
        <select
          className="model-select"
          id="model"
          value={selectedModelId}
          onChange={(e) => setSelectedModelId(e.target.value)}
        >
          {models.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {showErrorModal && (
        <div className="error-modal">
          <div className="error-modal-content">
            <h3>⚠️ Could not load models</h3>
            <p>Attempt {retryCount + 1} / 3</p>
            <div className="error-modal-buttons">
              <button className="error-modal-retry-button" onClick={requestSettings}>Retry</button>
              <button className="error-modal-close-button" onClick={() => window.location.reload()}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;