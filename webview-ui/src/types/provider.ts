export interface IModelConfig {
  id: string;
  name: string;
}

export interface IRegisteredProviderConfig {
  providerId: string;
  providerName: string;
  models: IModelConfig[];
  defaultModelId: string;
}
