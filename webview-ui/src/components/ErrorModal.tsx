import React from 'react';

interface ErrorModalProps {
  errorMessage: string;
  onClose: () => void;
  onRetry: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ errorMessage, onClose, onRetry }) => {
  return (
    <div className="error-modal">
      <div className="error-modal-content">
        <h3>API Error</h3>
        <p>{errorMessage}</p>
        <div className="error-modal-buttons">
          <button className="error-modal-retry-button" onClick={onRetry}>Retry</button>
          <button className="error-modal-close-button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
