import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';

export interface FileContext {
    name: string;
    content: string;
    fullPath: string;
}

export interface ChatContext {
    attachedFiles?: FileContext[];
}

export class WorkspaceContext {
    constructor() {}

    public async getCurrentContext(): Promise<ChatContext> {
        // Implement logic to get context, e.g., selected files, active editor content
        // For now, let's keep it minimal or extend as needed.
        return {
            attachedFiles: [] // Default to no attached files
        };
    }

    public async resolveAndReadFile(fileName: string): Promise<FileContext | null> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showWarningMessage('No workspace folder open. Cannot resolve file path.');
            return null;
        }

        const workspaceRoot = workspaceFolders[0].uri.fsPath;
        const filePath = path.join(workspaceRoot, fileName);

        try {
            const fileContent = await fs.readFile(filePath, { encoding: 'utf8' });
            return {
                name: fileName,
                content: fileContent,
                fullPath: filePath
            };
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to read file ${fileName}: ${error.message}`);
            return null;
        }
    }
}
