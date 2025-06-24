import * as vscode from 'vscode';
import fetch from 'node-fetch';
import { ChatContext } from '../context/workspaceContext'; // Import ChatContext

export class OpenAIService {
    private getApiKey(): string {
        const config = vscode.workspace.getConfiguration('aiChat');
        const apiKey = config.get<string>('openaiApiKey');
        if (!apiKey) {
            throw new Error('OpenAI API Key not configured. Please configure it in VS Code Settings (Extension settings for AI Chat).');
        }
        return apiKey;
    }

    async sendMessage(message: string, context?: ChatContext): Promise<string> {
        const apiKey = this.getApiKey();

        // Prepare messages for the AI
        let promptMessages: { role: 'system' | 'user'; content: string }[] = [
            { role: 'system', content: 'You are an AI assistant integrated in VS Code. Provide concise and helpful code-related answers. If code is provided, analyze it.' },
        ];

        // Append context to the user's message or as a separate system message
        let userMessageContent = message;

        if (context) {
            if (context.activeFileContent) {
                userMessageContent = `File: ${context.fileName || 'Active File'}\n\`\`\`${context.language || ''}\n${context.activeFileContent}\n\`\`\`\n\n${userMessageContent}`;
            }
            if (context.selectedText) {
                userMessageContent = `Selected Code:\n\`\`\`${context.language || ''}\n${context.selectedText}\n\`\`\`\n\n${userMessageContent}`;
            }
            if (context.attachedFiles && context.attachedFiles.length > 0) {
                const attachedFileDetails = context.attachedFiles.map(file => 
                    `--- ${file.name} ---\n\`\`\`\n${file.content}\n\`\`\``
                ).join('\n\n');
                userMessageContent = `${attachedFileDetails}\n\n${userMessageContent}`;
            }
        }

        promptMessages.push({ role: 'user', content: userMessageContent });


        const payload = {
            model: vscode.workspace.getConfiguration('aiChat').get('model', 'gpt-4'),
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
