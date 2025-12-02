export enum AppTab {
  PROMPTS = 'PROMPTS',
  IMAGES = 'IMAGES',
  METADATA = 'METADATA'
}

export interface GeneratedPrompt {
  id: string;
  text: string;
  selected: boolean;
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  base64Data: string;
  timestamp: number;
}

export interface StockMetadata {
  title: string;
  keywords: string[];
  category: string;
}

export interface PromptGenConfig {
  topic: string;
  count: number;
  mood: string;
  includeTechnical: boolean;
}

export enum ProcessStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
