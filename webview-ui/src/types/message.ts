import { IRegisteredProviderConfig } from './provider';

export interface WebviewMessage {
  type: 'settingsUpdate' | 'sendMessage' | 'response' | 'error' | 'attachedFileContent' | 'requestSettings';
  settings?: {
    availableModels: IRegisteredProviderConfig[];
    defaultModelProvider: string;
    openaiModel?: string;
    huggingFaceModel?: string;
    geminiModel?: string;
  };
  text?: string;
  message?: string;
  fileName?: string;
  content?: string;
}
