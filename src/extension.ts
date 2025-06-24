import * as vscode from 'vscode';
import { WebviewProvider } from './ui/webviewProvider';
import { WorkspaceContext } from './context/workspaceContext';
import { LLMService } from './api/llmService';

export async function activate(context: vscode.ExtensionContext) { // Made activate async
    console.log('✅ [extension] Activating AI Chat Sidebar Extension...');

    try {
        const workspaceContext = new WorkspaceContext();
        const llmService = new LLMService();
        await llmService.initialize(); // Call the async initialize method

        const provider = new WebviewProvider(
            context.extensionUri,
            workspaceContext,
            llmService
        );

        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(WebviewProvider.viewType, provider)
        );

        context.subscriptions.push(
            vscode.commands.registerCommand('aiChatSidebar.openView', () => {
                if (provider && provider.view) {
                    provider.view.show(true);
                } else {
                    vscode.commands.executeCommand('workbench.view.extension.ai-chat-view'); 
                }
            })
        );

        console.log('✅ [extension] AI Chat Sidebar Extension Activated successfully.');

    } catch (error: any) {
        console.error('❌ [extension] Error during extension activation:', error);
        vscode.window.showErrorMessage(`Failed to activate AI Chat Sidebar Extension: ${error.message || 'Unknown error'}. Check Extension Host logs for details.`);
    }
}

// deactivate is optional
// export function deactivate() {}
