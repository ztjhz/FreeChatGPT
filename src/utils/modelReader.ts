import { ModelCost } from '@type/chat';

interface ModelData {
  id: string;
  name: string;
  description: string;
  pricing: {
    prompt: string;
    completion: string;
    image: string;
    request: string;
  };
  context_length: number;
  architecture: {
    modality: string;
    tokenizer: string;
    instruct_type: string | null;
  };
  top_provider: {
    max_completion_tokens: number;
    is_moderated: boolean;
  };
  per_request_limits: any;
}

interface ModelsJson {
  data: ModelData[];
}

const modelsJsonUrl = '/src/data/models.json';

export const loadModels = async (): Promise<{ modelOptions: string[], modelMaxToken: { [key: string]: number }, modelCost: ModelCost }> => {
  const response = await fetch(modelsJsonUrl);
  const modelsJson: ModelsJson = await response.json();

  const modelOptions: string[] = [];
  const modelMaxToken: { [key: string]: number } = {};
  const modelCost: ModelCost = {};

  modelsJson.data.forEach(model => {
    const modelId = model.id.split('/').pop() as string;
    modelOptions.push(modelId);
    modelMaxToken[modelId] = model.context_length;
    modelCost[modelId] = {
      prompt: { price: parseFloat(model.pricing.prompt), unit: 1 },
      completion: { price: parseFloat(model.pricing.completion), unit: 1 },
    };
  });

  // Sort modelOptions to prioritize gpt-4o models at the top, followed by other OpenAI models
  modelOptions.sort((a, b) => {
    const isGpt4oA = a.startsWith('gpt-4o');
    const isGpt4oB = b.startsWith('gpt-4o');
    const isOpenAIA = a.startsWith('gpt-');
    const isOpenAIB = b.startsWith('gpt-');

    if (isGpt4oA && !isGpt4oB) return -1;
    if (!isGpt4oA && isGpt4oB) return 1;
    if (isOpenAIA && !isOpenAIB) return -1;
    if (!isOpenAIA && isOpenAIB) return 1;
    return 0;
  });

  return { modelOptions, modelMaxToken, modelCost };
};

export type ModelOptions = string;