import * as vscode from 'vscode';
import * as path from 'path';
import { WorkspaceContext } from '../context/workspaceContext';
import { OpenAIService } from '../api/openai';

export class WebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'aiChatSidebarView';
    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _workspaceContext: WorkspaceContext,
        private readonly _aiService: OpenAIService
    ) {}

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

        webviewView.webview.onDidReceiveMessage(async (message) => {
            console.log('📩 [webview] Received message from UI:', message);
            const context = await this._workspaceContext.getCurrentContext();
            const response = await this._aiService.sendMessage(message.text, context);
            webviewView.webview.postMessage({ type: 'response', text: response });
        });
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'index.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));

        return /* html */ `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="${styleUri}" rel="stylesheet" />
            <title>AI Chat</title>
        </head>
        <body>
            <div id="root">🧠 AI Chat Sidebar Loaded</div>
            <script src="${scriptUri}"></script>
        </body>
        </html>`;
    }
}
