export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface VSCodeAPI {
  postMessage(message: any): void;
  setState(state: any): void;
  getState(): any;
}

export interface IModelConfig {
  id: string;
  name: string;
}

export interface IRegisteredProviderConfig {
  providerId: string;
  providerName: string;
  models: IModelConfig[];
  defaultModelId: string;
}

export interface WebviewMessage {
  type:
    | 'settingsUpdate'
    | 'sendMessage'
    | 'response'
    | 'error'
    | 'attachedFileContent'
    | 'requestSettings'
    | 'apiError';
  text?: string;
  message?: string;
  files?: File[];
  fileName?: string;
  content?: string;
  error?: { message?: string };
  settings?: {
    availableModels: IRegisteredProviderConfig[];
    defaultModelProvider: string;
    openaiModel?: string;
    huggingFaceModel?: string;
    geminiModel?: string;
  };
  modelProvider?: string;
  modelName?: string;
}

declare global {
  interface Window {
    acquireVsCodeApi(): VSCodeAPI;
  }
}
