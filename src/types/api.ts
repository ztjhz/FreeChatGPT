import { MessageInterface } from './chat';

export interface EventSourceDataInterface {
  choices: EventSourceDataChoices[];
  created: number;
  created_at?: string;
  id: string;
  model: string;
  object: string;
  message?: MessageInterface;
  done?: boolean;
}

export type EventSourceData = EventSourceDataInterface | '[DONE]';

export interface EventSourceDataChoices {
  delta: {
    content?: string;
    role?: string;
  };
  finish_reason?: string;
  index: number;
}

export interface ShareGPTSubmitBodyInterface {
  avatarUrl: string;
  items: {
    from: 'gpt' | 'human';
    value: string;
  }[];
}
