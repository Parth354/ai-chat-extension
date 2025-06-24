import * as vscode from 'vscode';
import * as path from 'path';
import { WorkspaceContext } from '../context/workspaceContext';
import { LLMService } from '../api/llmService'; 
import { ChatContext } from '../context/workspaceContext';

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
            localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, 'media')]
        };

        webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

        const config = vscode.workspace.getConfiguration('aiChat');
        const availableModels = this._llmService.getRegisteredModelConfigs();

        console.log('📤 [webviewProvider] Sending settingsUpdate to webview. availableModels:', JSON.stringify(availableModels, null, 2));

        // Add a small delay before sending the initial settingsUpdate message
        // This helps ensure the webview's JavaScript (React App.tsx) is fully loaded
        // and its event listener is active before the message arrives.
        setTimeout(() => {
            webviewView.webview.postMessage({
                type: 'settingsUpdate',
                settings: {
                    defaultModelProvider: config.get('defaultModelProvider', 'openai'),
                    openaiModel: config.get('openaiModel', 'gpt-3.5-turbo'),
                    huggingFaceModel: config.get('huggingFaceModel', 'mistralai/Mistral-7B-Instruct-v0.2'),
                    geminiModel: config.get('geminiModel', 'gemini-pro'),
                    availableModels: availableModels
                }
            });
            console.log('📤 [webviewProvider] Initial settingsUpdate message SENT after delay.');
        }, 500); // 500ms delay


        webviewView.webview.onDidReceiveMessage(async (message) => {
            console.log('📩 [webview] Received message from UI:', message);
            let currentContext: ChatContext = await this._workspaceContext.getCurrentContext();

            switch (message.type) {
                case 'sendMessage':
                    try {
                        const chatMessageText = typeof message.text === 'string' ? message.text : '';
                        const modelProvider = message.modelProvider; 
                        const modelName = message.modelName;

                        if (!modelProvider || !modelName) {
                            throw new Error('Model provider or model name was not specified in the message.');
                        }

                        const response = await this._llmService.sendMessage(
                            chatMessageText,
                            currentContext,
                            modelProvider,
                            modelName
                        );
                        webviewView.webview.postMessage({ type: 'response', text: response });
                    } catch (error: any) {
                        console.error('❌ [webview] Error sending message to AI:', error);
                        webviewView.webview.postMessage({ type: 'error', message: error.message || 'An unknown error occurred.' });
                    }
                    break;
                case 'requestFileContent':
                    if (typeof message.fileName === 'string') {
                        const fileData = await this._workspaceContext.resolveAndReadFile(message.fileName);
                        if (fileData) {
                            webviewView.webview.postMessage({ 
                                type: 'attachedFileContent', 
                                fileName: fileData.name, 
                                content: fileData.content 
                            });
                            if (message.originalMessage && typeof message.originalMessage === 'string') {
                                currentContext.attachedFiles = [{ 
                                    name: fileData.name, 
                                    content: fileData.content, 
                                    fullPath: fileData.fullPath 
                                }];
                                try {
                                    const modelProvider = message.modelProvider; 
                                    const modelName = message.modelName;

                                    if (!modelProvider || !modelName) {
                                        throw new Error('Model provider or model name was not specified in the file content request.');
                                    }

                                    const response = await this._llmService.sendMessage(
                                        message.originalMessage,
                                        currentContext,
                                        modelProvider,
                                        modelName
                                    );
                                    webviewView.webview.postMessage({ type: 'response', text: response });
                                } catch (error: any) {
                                    console.error('❌ [webview] Error sending message with attached file to AI:', error);
                                    webviewView.webview.postMessage({ type: 'error', message: error.message || 'An unknown error occurred with file context.' });
                                }
                            }
                        } else {
                            webviewView.webview.postMessage({ type: 'error', message: `File not found or readable: ${message.fileName}` });
                        }
                    }
                    break;
            }
        });
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'index.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css')); 

        const nonce = getNonce();

        return /* html */ `
        <!DOCTYPE html>
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
