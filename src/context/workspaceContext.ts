import * as vscode from 'vscode';
import * as path from 'path'; // Needed for path manipulation
import * as fs from 'fs/promises'; // Node.js file system module for reading files

export interface ChatContext {
    fileName?: string;
    language?: string;
    workspaceName?: string;
    selectedText?: string;
    activeFileContent?: string;
    // New: for attached file context from @filename
    attachedFiles?: { name: string; content: string; fullPath: string }[]; 
}

export class WorkspaceContext {
    async getCurrentContext(): Promise<ChatContext> {
        const editor = vscode.window.activeTextEditor;
        let context: ChatContext = {};

        if (editor) {
            const document = editor.document;
            const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);

            context = {
                fileName: document.fileName,
                language: document.languageId,
                workspaceName: workspaceFolder?.name,
                selectedText: document.getText(editor.selection),
                activeFileContent: document.getText()
            };
        }
        return context;
    }

    /**
     * Resolves a filename to a full path within the workspace and reads its content.
     * Searches active workspace folders.
     * @param fileName The name of the file to find (e.g., 'myFile.ts')
     * @returns An object with fileName, content, and fullPath, or null if not found/readable.
     */
    async resolveAndReadFile(fileName: string): Promise<{ name: string; content: string; fullPath: string } | null> {
        if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
            return null; // No workspace open
        }

        for (const folder of vscode.workspace.workspaceFolders) {
            const possibleFilePath = path.join(folder.uri.fsPath, fileName);
            try {
                // Check if the file exists and is readable
                await fs.access(possibleFilePath, fs.constants.R_OK); 
                const content = await fs.readFile(possibleFilePath, { encoding: 'utf8' });
                return { name: fileName, content: content, fullPath: possibleFilePath };
            } catch (e) {
                // File not found in this folder, or not readable. Continue to next folder.
                console.warn(`File '${fileName}' not found or readable at '${possibleFilePath}':`, e instanceof Error ? e.message : e);
            }
        }
        return null; // File not found in any workspace folder
    }
}
