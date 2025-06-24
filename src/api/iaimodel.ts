import { ChatContext } from '../context/workspaceContext';

/**
 * Defines the interface for any AI model service.
 * New AI service files added to the 'src/api/' folder should implement this.
 */
export interface IAIModelService {
    /**
     * A unique identifier for this AI provider (e.g., 'openai', 'huggingface', 'custom-llama').
     * This ID will be used to select which service to call.
     */
    providerId: string;

    /**
     * Sends a message to the AI model and receives a response.
     * @param message The user's message.
     * @param context The chat context (e.g., attached files).
     * @param model The specific model name/ID to use within this provider (e.g., 'gpt-3.5-turbo', 'gemma-7b-it').
     * @returns A promise that resolves to the AI's response text.
     */
    sendMessage(message: string, context: ChatContext, model: string): Promise<string>;

    /**
     * Returns a list of available model configurations for this provider.
     * @returns An array of objects, each describing a model.
     */
    getAvailableModels(): Array<{ id: string; name: string; }>;
}
