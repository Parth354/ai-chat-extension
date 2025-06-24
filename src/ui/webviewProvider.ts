import * as vscode from 'vscode';
import * as path from 'path';
import { WorkspaceContext } from '../context/workspaceContext';
import { LLMService } from '../api/llmService';

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export class WebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'aiChatSidebarView';
  private _view?: vscode.WebviewView;
  private _llmService: LLMService;
  private _lastModelProvider: string | undefined;
  private _lastModelName: string | undefined;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _workspaceContext: WorkspaceContext,
    llmService: LLMService
  ) {
    this._llmService = llmService;
  }

  public get view(): vscode.WebviewView | undefined {
    return this._view;
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    console.log('✅ [webview] resolveWebviewView called');
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, 'media')],
    };

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

    this.sendInitialSettings(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (message) => {
      console.log('📩 [webview] Received message from UI:', message);

      switch (message.type) {
        case 'requestSettings':
          this.sendInitialSettings(webviewView.webview);
          break;

        case 'sendMessage': {
          const chatMessageText = typeof message.text === 'string' ? message.text : '';
          const modelProvider = message.modelProvider || this._lastModelProvider;
          const modelName = message.modelName || this._lastModelName;

          if (!modelProvider || !modelName) {
            webviewView.webview.postMessage({
              type: 'error',
              error: { message: 'Model provider or model name was not specified.' },
            });
            return;
          }

          const match = chatMessageText.match(/@(\S+)/);
          if (match) {
            const fileName = match[1];
            webviewView.webview.postMessage({
              type: 'requestFileContent',
              fileName,
              modelProvider,
              modelName,
              originalMessage: chatMessageText,
            });
            return;
          }

          try {
            const context = await this._workspaceContext.getCurrentContext();
            const response = await this._llmService.sendMessage(chatMessageText, context, modelProvider, modelName);
            webviewView.webview.postMessage({ type: 'response', text: response });
          } catch (error: any) {
            console.error('❌ [webview] Error sending message:', error);
            webviewView.webview.postMessage({
              type: 'error',
              error: { message: error?.message || 'An unknown error occurred.' },
            });
          }
          break;
        }

        case 'requestFileContent': {
          if (typeof message.fileName === 'string') {
            const fileData = await this._workspaceContext.resolveAndReadFile(message.fileName);
            if (fileData) {
              webviewView.webview.postMessage({
                type: 'attachedFileContent',
                fileName: fileData.name,
                content: fileData.content,
              });

              if (message.originalMessage && typeof message.originalMessage === 'string') {
                const context = await this._workspaceContext.getCurrentContext();
                context.attachedFiles = [{
                  name: fileData.name,
                  content: fileData.content,
                  fullPath: fileData.fullPath,
                }];

                try {
                  const modelProvider = message.modelProvider || this._lastModelProvider;
                  const modelName = message.modelName || this._lastModelName;

                  if (!modelProvider || !modelName) {
                    throw new Error('Model provider or model name was not specified in file request.');
                  }

                  const expandedMessage = message.originalMessage.replace(
                    new RegExp(`@${fileData.name}\\b`, 'g'),
                    `\n\n--- Begin file: ${fileData.name} ---\n${fileData.content}\n--- End file: ${fileData.name} ---\n\n`
                  );

                  const response = await this._llmService.sendMessage(
                    expandedMessage,
                    context,
                    modelProvider,
                    modelName
                  );

                  webviewView.webview.postMessage({ type: 'response', text: response });
                } catch (error: any) {
                  console.error('❌ [webview] Error sending message with file content:', error);
                  webviewView.webview.postMessage({
                    type: 'error',
                    error: { message: error?.message || 'An unknown error occurred while sending file content.' },
                  });
                }
              }
            } else {
              webviewView.webview.postMessage({
                type: 'error',
                error: { message: `File not found or unreadable: ${message.fileName}` },
              });
            }
          }
          break;
        }

        case 'attachedFileContent': {
          if (typeof message.fileName === 'string' && typeof message.content === 'string') {
            webviewView.webview.postMessage({
              type: 'attachedFileContent',
              fileName: message.fileName,
              content: message.content,
            });
          }
          break;
        }
      }
    });
  }

  private sendInitialSettings(webview: vscode.Webview) {
    const config = vscode.workspace.getConfiguration('aiChat');
    const availableModels = this._llmService.getRegisteredModelConfigs();

    const defaultProvider = config.get('defaultModelProvider', 'openai');
    const openaiModel = config.get('openaiModel', 'gpt-3.5-turbo');
    const huggingFaceModel = config.get('huggingFaceModel', 'mistralai/Mistral-7B-Instruct-v0.2');
    const geminiModel = config.get('geminiModel', 'gemini-pro');

    this._lastModelProvider = defaultProvider;
    this._lastModelName =
      defaultProvider === 'openai' ? openaiModel :
      defaultProvider === 'huggingface' ? huggingFaceModel :
      geminiModel;

    webview.postMessage({
      type: 'settingsUpdate',
      settings: {
        defaultModelProvider: defaultProvider,
        openaiModel,
        huggingFaceModel,
        geminiModel,
        availableModels,
      },
    });

    console.log('📤 [webviewProvider] settingsUpdate message sent');
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'index.js'));
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));
    const nonce = getNonce();

    return /* html */ `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Chat</title>
    <link href="${styleUri}" rel="stylesheet" />
    <meta http-equiv="Content-Security-Policy" content="
      default-src 'none';
      style-src ${webview.cspSource} 'unsafe-inline';
      img-src ${webview.cspSource} https: data:;
      script-src 'nonce-${nonce}';
      font-src ${webview.cspSource};
      connect-src https://api.openai.com https://api-inference.huggingface.co https://generativelanguage.googleapis.com;
    ">
  </head>
  <body>
    <div id="root"></div>
    <script nonce="${nonce}" src="${scriptUri}"></script>
  </body>
</html>`;
  }
}
