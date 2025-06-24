export interface WebviewMessage {
    type: string;
    userMessage?: string;
    filePath?: string;
    attachedFiles?: { path: string; content: string }[];
}
