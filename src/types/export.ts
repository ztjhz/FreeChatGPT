import {
  ChatInterface,
  ContentInterface,
  FolderCollection,
  Role,
} from './chat';

export interface ExportBase {
  version: number;
}

export interface ExportV1 extends ExportBase {
  chats?: ChatInterface[];
  folders: FolderCollection;
}
export type OpenAIChat = {
  title: string;
  mapping: {
    [key: string]: {
      id: string;
      message?: {
        author: {
          role: Role;
        };
        content:
          | {
              parts?: string[];
            }
          | ContentInterface;
      } | null;
      parent: string | null;
      children: string[];
    };
  };
  current_node: string;
};

export default ExportV1;
