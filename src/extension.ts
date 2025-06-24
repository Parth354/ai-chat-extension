import * as vscode from 'vscode';
import { WebviewProvider } from './ui/webviewProvider';
import { WorkspaceContext } from './context/workspaceContext';
import { OpenAIService } from './api/openai';

export function activate(context: vscode.ExtensionContext) {
    console.log('✅ [extension] Activated AI Chat Sidebar Extension');

    const workspaceContext = new WorkspaceContext();
    const aiService = new OpenAIService();

    const provider = new WebviewProvider(
        context.extensionUri,
        workspaceContext,
        aiService
    );

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(WebviewProvider.viewType, provider)
    );

    vscode.commands.registerCommand('aiChatSidebar.testConnection', async () => {
        vscode.window.showInformationMessage('✅ [command] Test connection triggered!');
    });
}
