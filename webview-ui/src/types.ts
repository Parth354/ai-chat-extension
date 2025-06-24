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

export interface WebviewMessage {
  type: 'sendMessage' | 'aiResponse' | 'error' | 'contextUpdate' | 'stateUpdate';
  message?: string;
  timestamp?: string;
  context?: any;
  state?: any;
}

declare global {
  interface Window {
    acquireVsCodeApi(): VSCodeAPI;
  }
}