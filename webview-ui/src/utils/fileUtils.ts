import * as vscode from 'vscode';
import * as path from 'path';

export class FileUtils {
    static async isTextFile(filePath: string): Promise<boolean> {
        const textExtensions = [
            '.txt', '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c',
            '.cs', '.php', '.rb', '.go', '.rs', '.html', '.css', '.scss', '.less',
            '.json', '.xml', '.yaml', '.yml', '.md', '.sql', '.sh', '.bat',
            '.ps1', '.vue', '.svelte', '.dart', '.kt', '.swift', '.r', '.scala'
        ];
        
        const ext = path.extname(filePath).toLowerCase();
        return textExtensions.includes(ext);
    }

    static async isImageFile(filePath: string): Promise<boolean> {
        const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg', '.webp'];
        const ext = path.extname(filePath).toLowerCase();
        return imageExtensions.includes(ext);
    }

    static getFileSize(content: string): number {
        return Buffer.byteLength(content, 'utf8');
    }

    static truncateContent(content: string, maxSize: number = 10000): string {
        if (content.length <= maxSize) {
            return content;
        }
        
        return content.substring(0, maxSize) + '\n... (truncated)';
    }

    static async validateFile(filePath: string): Promise<{ valid: boolean; reason?: string }> {
        try {
            const stat = await vscode.workspace.fs.stat(vscode.Uri.file(filePath));
            
            // Check if it's a file (not directory)
            if (stat.type !== vscode.FileType.File) {
                return { valid: false, reason: 'Not a file' };
            }
            
            // Check file size (limit to 1MB)
            if (stat.size > 1024 * 1024) {
                return { valid: false, reason: 'File too large (>1MB)' };
            }
            
            return { valid: true };
        } catch (error) {
            return { valid: false, reason: 'File not accessible' };
        }
    }

    static extractCodeFromSelection(
        document: vscode.TextDocument,
        selection: vscode.Selection
    ): { code: string; language: string; lineNumbers: string } {
        const code = document.getText(selection);
        const language = document.languageId;
        const startLine = selection.start.line + 1;
        const endLine = selection.end.line + 1;
        const lineNumbers = startLine === endLine 
            ? `Line ${startLine}` 
            : `Lines ${startLine}-${endLine}`;
        
        return { code, language, lineNumbers };
    }
}