import React from 'react';
import { IRegisteredProviderConfig } from '../types';

interface Props {
  availableProviders: IRegisteredProviderConfig[];
  selectedProviderId: string;
  selectedModelId: string;
  setSelectedProviderId: (id: string) => void;
  setSelectedModelId: (id: string) => void;
  showErrorModal: boolean;
  retryCount: number;
  requestSettings: () => void;
}

export default function ChatHeader({
  availableProviders,
  selectedProviderId,
  selectedModelId,
  setSelectedProviderId,
  setSelectedModelId,
  showErrorModal,
  retryCount,
  requestSettings
}: Props) {
  const current = availableProviders.find((p) => p.providerId === selectedProviderId);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProviderId = e.target.value;
    setSelectedProviderId(newProviderId);

    const newProvider = availableProviders.find((p) => p.providerId === newProviderId);
    if (newProvider && newProvider.models.length > 0) {
      setSelectedModelId(newProvider.models[0].id);
    } else {
      setSelectedModelId('');
    }
  };

  return (
    <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between px-4 py-2 bg-[var(--vscode-sideBar-background)] border-b border-[var(--vscode-editorWidget-border)]">
      <div className="flex flex-col md:flex-row md:items-center md:space-x-2 gap-1 md:gap-0">
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
          <label className="text-sm md:mb-0">Provider:</label>
          <select
            value={selectedProviderId}
            onChange={handleProviderChange}
            className="bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] border border-[var(--vscode-input-border)] rounded px-2 py-1 text-sm"
          >
            {availableProviders.map((p) => (
              <option key={p.providerId} value={p.providerId}>
                {p.providerName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 mt-2 md:mt-0">
          <label className="text-sm md:mb-0">Model:</label>
          <select
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
            className="bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] border border-[var(--vscode-input-border)] rounded px-2 py-1 text-sm"
          >
            {current?.models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="text-xs text-right mt-2 md:mt-0">
        {showErrorModal && <span className="text-red-500 mr-2">Error fetching settings.</span>}
        {retryCount > 0 && <span className="text-yellow-400 mr-2">Retry: {retryCount}</span>}
        <button onClick={requestSettings} className="underline text-sm hover:opacity-80">
          Retry
        </button>
      </div>
    </header>
  );
}
