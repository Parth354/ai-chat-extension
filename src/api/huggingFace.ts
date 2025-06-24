import * as vscode from 'vscode';
import fetch from 'node-fetch';
import { ChatContext } from '../context/workspaceContext';
import { IAIModelService } from './iaimodel';

export default class HuggingFaceService implements IAIModelService {
    public readonly providerId: string = 'huggingface';

    private getApiKey(): string {
        const config = vscode.workspace.getConfiguration('aiChat');
        const apiKey = config.get<string>('huggingFaceApiKey');
        if (!apiKey) {
            throw new Error('Hugging Face API Token not configured. Please configure it in VS Code Settings (Extension settings for AI Chat).');
        }
        return apiKey;
    }

    public getAvailableModels(): Array<{ id: string; name: string; }> {
        return [
            { id: 'mistralai/Mistral-7B-Instruct-v0.2', name: 'Mistral 7B Instruct v0.2' },
            { id: 'google/gemma-7b-it', name: 'Gemma 7B Instruct' },
            { id: 'google/gemma-2b-it', name: 'Gemma 2B Instruct' },
            { id: 'HuggingFaceH4/zephyr-7b-beta', name: 'Zephyr 7B Beta' }
        ];
    }

    async sendMessage(message: string, context: ChatContext, model: string): Promise<string> {
        const apiKey = this.getApiKey();
        const apiUrl = `https://api-inference.huggingface.co/models/${model}`;

        let fullPrompt = message;

        if (context.attachedFiles && context.attachedFiles.length > 0) {
            const attachedFileDetails = context.attachedFiles.map(file =>
                `--- ${file.name} ---\n\`\`\`\n${file.content}\n\`\`\``
            ).join('\n\n');
            fullPrompt = `${attachedFileDetails}\n\n${fullPrompt}`;
        }

        const payload = {
            inputs: fullPrompt,
            parameters: {
                max_new_tokens: vscode.workspace.getConfiguration('aiChat').get('maxTokens', 2048),
                return_full_text: false
            },
            options: {
                use_cache: true,
                wait_for_model: true
            }
        };

        console.log('🧠 [huggingface] Sending request to Hugging Face with payload:', JSON.stringify(payload, null, 2));

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ [huggingface] Hugging Face API Error:', errorData);
            throw new Error(`Hugging Face API error: ${response.status} - ${errorData?.error || response.statusText}`);
        }

        const data: any[] = await response.json();
        console.log('✅ [huggingface] Response received:', data);

        return data?.[0]?.generated_text ?? 'No response from Hugging Face AI.';
    }
}
