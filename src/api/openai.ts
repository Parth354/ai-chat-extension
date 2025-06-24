import * as vscode from 'vscode';
import fetch from 'node-fetch';
import { ChatContext } from '../context/workspaceContext';
import { IAIModelService } from './iaimodel';

export default class OpenAIService implements IAIModelService {
    public readonly providerId: string = 'openai';

    private getApiKey(): string {
        const config = vscode.workspace.getConfiguration('aiChat');
        const apiKey = config.get<string>('openaiApiKey');
        if (!apiKey) {
            throw new Error('OpenAI API Key not configured. Please configure it in VS Code Settings (Extension settings for AI Chat).');
        }
        return apiKey;
    }

    public getAvailableModels(): Array<{ id: string; name: string; }> {
        return [
            { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
            { id: 'gpt-4o', name: 'GPT-4o' },
            { id: 'gpt-4o-mini', name: 'GPT-4o Mini' }
        ];
    }

    async sendMessage(message: string, context?: ChatContext, model?: string): Promise<string> {
        const apiKey = this.getApiKey();
        
        const modelToUse = model || vscode.workspace.getConfiguration('aiChat').get('openaiModel', 'gpt-3.5-turbo');

        let promptMessages: { role: 'system' | 'user'; content: string }[] = [
            { role: 'system', content: 'You are an AI assistant integrated in VS Code. Provide concise and helpful code-related answers. If code is provided, analyze it.' },
        ];

        let userMessageContent = message;

        if (context?.attachedFiles && context.attachedFiles.length > 0) {
            const attachedFileDetails = context.attachedFiles.map(file =>
                `--- ${file.name} ---\n\`\`\`\n${file.content}\n\`\`\``
            ).join('\n\n');
            userMessageContent = `${attachedFileDetails}\n\n${userMessageContent}`;
        }

        promptMessages.push({ role: 'user', content: userMessageContent });

        const payload = {
            model: modelToUse,
            messages: promptMessages,
            max_tokens: vscode.workspace.getConfiguration('aiChat').get('maxTokens', 2048)
        };

        console.log('🧠 [openai] Sending request to OpenAI with payload:', JSON.stringify(payload, null, 2));
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ [openai] OpenAI API Error:', errorData);
            throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ [openai] Response received:', data);
        return data?.choices?.[0]?.message?.content ?? 'No response from AI.';
    }
}
