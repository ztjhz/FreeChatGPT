import { v4 as uuidv4 } from 'uuid';

import {
  ChatInterface,
  ConfigInterface,
  ContentInterface,
  FolderCollection,
  MessageInterface,
} from '@type/chat';
import { roles } from '@type/chat';
import {
  defaultModel,
  modelOptions,
  _defaultChatConfig,
} from '@constants/chat';
import { ExportV1, OpenAIChat } from '@type/export';

export const validateAndFixChats = (chats: any): chats is ChatInterface[] => {
  if (!Array.isArray(chats)) return false;

  for (const chat of chats) {
    if (!(typeof chat.id === 'string')) chat.id = uuidv4();
    if (!(typeof chat.title === 'string') || chat.title === '') return false;

    if (chat.titleSet === undefined) chat.titleSet = false;
    if (!(typeof chat.titleSet === 'boolean')) return false;

    if (!validateMessage(chat.messages)) return false;
    if (!validateAndFixChatConfig(chat.config)) return false;
  }

  return true;
};

const validateMessage = (messages: MessageInterface[]) => {
  if (!Array.isArray(messages)) return false;
  for (const message of messages) {
    if (!(typeof message.content === 'string')) return false;
    if (!(typeof message.role === 'string')) return false;
    if (!roles.includes(message.role)) return false;
  }
  return true;
};

const validateAndFixChatConfig = (config: ConfigInterface) => {
  if (config === undefined) config = _defaultChatConfig;
  if (!(typeof config === 'object')) return false;

  if (!config.temperature) config.temperature = _defaultChatConfig.temperature;
  if (!(typeof config.temperature === 'number')) return false;

  if (!config.presence_penalty)
    config.presence_penalty = _defaultChatConfig.presence_penalty;
  if (!(typeof config.presence_penalty === 'number')) return false;

  if (!config.top_p) config.top_p = _defaultChatConfig.top_p;
  if (!(typeof config.top_p === 'number')) return false;

  if (!config.frequency_penalty)
    config.frequency_penalty = _defaultChatConfig.frequency_penalty;
  if (!(typeof config.frequency_penalty === 'number')) return false;

  if (!config.model) config.model = defaultModel;
  if (!modelOptions.includes(config.model)) return false;

  return true;
};

export const isLegacyImport = (importedData: any) => {
  if (Array.isArray(importedData)) return true;
  return false;
};

export const validateFolders = (
  folders: FolderCollection
): folders is FolderCollection => {
  if (typeof folders !== 'object') return false;

  for (const folderId in folders) {
    if (typeof folders[folderId].id !== 'string') return false;
    if (typeof folders[folderId].name !== 'string') return false;
    if (typeof folders[folderId].order !== 'number') return false;
    if (typeof folders[folderId].expanded !== 'boolean') return false;
  }

  return true;
};

export const validateExportV1 = (data: ExportV1): data is ExportV1 => {
  return validateAndFixChats(data.chats) && validateFolders(data.folders);
};
// Type guard to check if content is ContentInterface
const isContentInterface = (content: any): content is ContentInterface => {
  return typeof content === 'object' && 'type' in content;
};

// Convert OpenAI chat format to BetterChatGPT format
export const convertOpenAIToBetterChatGPTFormat = (
  openAIChat: OpenAIChat
): ChatInterface => {
  const messages: MessageInterface[] = [];

  // Traverse the chat tree and collect messages
  const traverseTree = (id: string) => {
    const node = openAIChat.mapping[id];

    // Extract message if it exists
    if (node.message) {
      const { role } = node.message.author;
      const content = node.message.content;
      if (Array.isArray(content.parts)) {
        const textContent = content.parts.join('') || '';
        if (textContent.length > 0) {
          messages.push({
            role,
            content: [{ type: 'text', text: textContent }],
          });
        }
      } else if (isContentInterface(content)) {
        messages.push({ role, content: [content] });
      }
      // TODO: Remove this after stable build
      // const content = node.message.content.parts?.join('') || '';
      // if (content.length > 0) messages.push({ role, content });
    }

    // Traverse the last child node if any children exist
    if (node.children.length > 0) {
      traverseTree(node.children[node.children.length - 1]);
    }
  };

  // Start traversing the tree from the root node
  const rootNode = openAIChat.mapping[Object.keys(openAIChat.mapping)[0]].id;
  traverseTree(rootNode);

  // Return the chat interface object
  return {
    id: uuidv4(),
    title: openAIChat.title,
    messages,
    config: _defaultChatConfig,
    titleSet: true,
  };
};

// Import OpenAI chat data and convert it to BetterChatGPT format
export const importOpenAIChatExport = (openAIChatExport: OpenAIChat[]) => {
  return openAIChatExport.map(convertOpenAIToBetterChatGPTFormat);
};
