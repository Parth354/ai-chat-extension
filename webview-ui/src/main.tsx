import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css'

// --- CRITICAL FIX: Acquire VS Code API ONLY ONCE ---
// This is a global function provided by VS Code for webviews.
// It MUST be called only once in your entire webview's JavaScript bundle.
// Declare the global function for TypeScript to recognize it.
declare global {
  interface Window {
    acquireVsCodeApi: () => {
      postMessage: (message: any) => void;
      getState: () => any;
      setState: (newState: any) => void;
    };
  }
}

// Acquire the VS Code API instance at the top level of your entry file.
// Store it in a constant so it's not re-acquired on re-renders.
const vscode = window.acquireVsCodeApi();

// Render your React application
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Pass the acquired vscode API instance as a prop to your main App component */}
    {/* This allows your App and its children to communicate with the VS Code extension */}
    <App vscode={vscode} />
  </React.StrictMode>,
);
