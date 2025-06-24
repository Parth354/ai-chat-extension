import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './main.css';

const vscode = window.acquireVsCodeApi();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App vscode={vscode} />
  </React.StrictMode>
);
