import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { ChatContext } from '../context/workspaceContext';
import { IAIModelService } from './iaimodel';

interface RegisteredModelConfig {
    providerId: string;
    providerName: string;
    models: Array<{ id: string; name: string }>;
    defaultModelId: string;
}

export class LLMService {
    private modelServices: Map<string, IAIModelService> = new Map();
    private registeredModelConfigs: RegisteredModelConfig[] = [];

    constructor() {
        // Initialization is called explicitly in activate.ts
    }

    public async initialize() {
        console.log('🔍 [LLMService] Initializing: Discovering AI model services...');
        const apiDir = path.join(__dirname); 

        try {
            const files = await fs.readdir(apiDir);
            const serviceFiles = files.filter(file => 
                file.endsWith('.js') && 
                file !== 'llmService.js' && 
                file !== 'iaimodel.js' 
            );

            for (const file of serviceFiles) {
                const filePath = path.join(apiDir, file);
                try {
                    const module = require(filePath);
                    console.log(`🔎 [LLMService] Loaded module from ${file}. Module content keys: ${Object.keys(module).join(', ')}`);
                    
                    let ServiceClass: (new () => IAIModelService) | undefined = undefined;

                    if (module.default && typeof module.default === 'function') {
                        if (module.default.prototype && typeof module.default.prototype.sendMessage === 'function') {
                            ServiceClass = module.default;
                        } else {
                            console.warn(`⚠️ [LLMService] Default export in ${file} found, but its prototype does not have a 'sendMessage' function.`);
                        }
                    } else {
                        const classNameFromFile = file.replace('.js', '');
                        const capitalizedClassName = classNameFromFile.charAt(0).toUpperCase() + classNameFromFile.slice(1);
                        if (module[capitalizedClassName] && typeof module[capitalizedClassName] === 'function' && module[capitalizedClassName].prototype && typeof module[capitalizedClassName].prototype.sendMessage === 'function') {
                             ServiceClass = module[capitalizedClassName];
                        } else {
                            console.warn(`⚠️ [LLMService] No default export or matching named export found for IAIModelService in ${file}.`);
                        }
                    }
                    
                    if (ServiceClass) {
                        const serviceInstance = new ServiceClass() as IAIModelService;
                        if (serviceInstance.providerId && typeof serviceInstance.sendMessage === 'function' && typeof serviceInstance.getAvailableModels === 'function') {
                            this.modelServices.set(serviceInstance.providerId, serviceInstance);
                            console.log(`✨ [LLMService] Registered AI service: ${serviceInstance.providerId}`);

                            const config = vscode.workspace.getConfiguration('aiChat');
                            let defaultModelId = '';
                            
                            switch (serviceInstance.providerId) {
                                case 'openai':
                                    defaultModelId = config.get('openaiModel', serviceInstance.getAvailableModels()[0]?.id || '') as string;
                                    break;
                                case 'huggingface':
                                    defaultModelId = config.get('huggingFaceModel', serviceInstance.getAvailableModels()[0]?.id || '') as string;
                                    break;
                                case 'gemini':
                                    defaultModelId = config.get('geminiModel', serviceInstance.getAvailableModels()[0]?.id || '') as string;
                                    break;
                                default:
                                    defaultModelId = serviceInstance.getAvailableModels()[0]?.id || '';
                                    break;
                            }

                            this.registeredModelConfigs.push({
                                providerId: serviceInstance.providerId,
                                providerName: this.getProviderFriendlyName(serviceInstance.providerId),
                                models: serviceInstance.getAvailableModels(),
                                defaultModelId: defaultModelId
                            });
                        } else {
                            console.warn(`⚠️ [LLMService] Skipped module ${file}: Instantiated class does not fully implement IAIModelService (missing providerId, sendMessage, or getAvailableModels method).`);
                        }
                    } else {
                        console.warn(`⚠️ [LLMService] Skipped module ${file}: Could not identify a valid service class to instantiate.`);
                    }
                } catch (loadError: any) {
                    console.error(`❌ [LLMService] Error loading or instantiating service from ${file}: ${loadError.message}`);
                }
            }
            console.log(`✅ [LLMService] Discovered ${this.modelServices.size} AI service providers.`);
        } catch (readDirError: any) {
            console.error(`❌ [LLMService] Error reading API directory: ${readDirError.message}`);
        }
    }

    public getRegisteredModelConfigs(): RegisteredModelConfig[] {
        return this.registeredModelConfigs;
    }

    async sendMessage(
        message: string,
        context: ChatContext,
        modelProvider: string,
        modelName: string
    ): Promise<string> {
        const service = this.modelServices.get(modelProvider);
        if (service) {
            return service.sendMessage(message, context, modelName);
        } else {
            throw new Error(`AI model provider '${modelProvider}' not found or not initialized.`);
        }
    }

    private getProviderFriendlyName(providerId: string): string {
        switch (providerId) {
            case 'openai': return 'OpenAI';
            case 'huggingface': return 'Hugging Face';
            case 'gemini': return 'Google Gemini';
            default: return providerId.charAt(0).toUpperCase() + providerId.slice(1);
        }
    }
}
