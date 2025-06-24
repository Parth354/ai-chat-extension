import React from 'react';

interface ErrorModalProps {
  errorMessage: string;
  onClose: () => void;
  onRetry: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ errorMessage, onClose, onRetry }) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="error-modal-title"
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
    >
      <div className="bg-[var(--vscode-editor-background)] border border-[var(--vscode-editorWidget-border)] rounded-lg shadow-xl p-6 max-w-md w-full text-[var(--vscode-editor-foreground)]">
        <h2 id="error-modal-title" className="text-lg font-semibold mb-4 text-red-400">Error</h2>
        <p className="text-sm mb-6">
          {errorMessage || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onRetry}
            className="bg-[var(--vscode-button-background)] hover:bg-[var(--vscode-button-hoverBackground)] text-[var(--vscode-button-foreground)] px-4 py-2 rounded text-sm"
          >
            Retry
          </button>
          <button
            onClick={onClose}
            className="text-[var(--vscode-editorHint-foreground)] hover:underline text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
