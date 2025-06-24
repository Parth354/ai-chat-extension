import * as vscode from 'vscode';
import fetch from 'node-fetch';
import { ChatContext } from '../context/workspaceContext';
import { IAIModelService } from './iaimodel';

export default class GeminiService implements IAIModelService {
    public readonly providerId: string = 'gemini';

    private getApiKey(): string {
        const config = vscode.workspace.getConfiguration('aiChat');
        const apiKey = config.get<string>('geminiApiKey');
        if (!apiKey) {
            throw new Error('Gemini API Key not configured. Please configure it in VS Code Settings (Extension settings for AI Chat).');
        }
        return apiKey;
    }

    public getAvailableModels(): Array<{ id: string; name: string; }> {
        return [
            { id: 'gemini-pro', name: 'Gemini Pro (Free Tier)' }, 
            { id: 'gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro (Latest)' }, 
            { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro' } 
        ];
    }

    async sendMessage(message: string, context?: ChatContext, model?: string): Promise<string> {
        const apiKey = this.getApiKey();
        const modelToUse = model || vscode.workspace.getConfiguration('aiChat').get('geminiModel', 'gemini-pro');
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${apiKey}`;

        let contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

        let userContentParts: Array<{ text: string }> = [{ text: message }];

        if (context?.attachedFiles && context.attachedFiles.length > 0) {
            const attachedFileDetails = context.attachedFiles.map(file =>
                `--- ${file.name} ---\n\`\`\`\n${file.content}\n\`\`\``
            ).join('\n\n');
            userContentParts.unshift({ text: attachedFileDetails + '\n\n' });
        }

        contents.push({
            role: 'user',
            parts: userContentParts
        });

        const payload = {
            contents: contents,
            generationConfig: {
                maxOutputTokens: vscode.workspace.getConfiguration('aiChat').get('maxTokens', 2048),
            }
        };

        console.log('🧠 [gemini] Sending request to Gemini with payload:', JSON.stringify(payload, null, 2));

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ [gemini] Gemini API Error:', errorData);
            throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || JSON.stringify(errorData) || response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ [gemini] Response received:', data);
        return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response from Gemini AI.';
    }
}
