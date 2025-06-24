import React from 'react';

interface FileAttachmentProps {
  attachedFiles: string[];
  onRemoveFile: (filePath: string) => void;
}

const FileAttachment: React.FC<FileAttachmentProps> = ({ 
  attachedFiles, 
  onRemoveFile 
}) => {
  if (attachedFiles.length === 0) {
    return null;
  }

  return (
    <div className="file-attachments">
      <div className="attachment-header">
        <span>📎 Attached Files:</span>
      </div>
      <div className="attachment-list">
        {attachedFiles.map(file => (
          <div key={file} className="attachment-item">
            <span className="file-name" title={file}>{file}</span>
            <button
              className="remove-button"
              onClick={() => onRemoveFile(file)}
              title="Remove file"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileAttachment;
