import { v4 as uuidv4 } from 'uuid';

import {
  ChatInterface,
  ConfigInterface,
  ContentInterface,
  FolderCollection,
  isImageContent,
  isTextContent,
  MessageInterface,
  strToTextContent,
} from '@type/chat';
import { roles } from '@type/chat';
import {
  defaultModel,
  modelOptions,
  _defaultChatConfig,
} from '@constants/chat';
import { ExportV1, OpenAIChat, OpenAIPlaygroundJSON } from '@type/export';

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

const validateMessage = (messages: MessageInterface[]): boolean => {
  if (!Array.isArray(messages)) return false;
  for (const message of messages) {
    if (typeof message.content === 'string') {
      // Convert string content to an array containing that string
      // Ensure the TextContent format
      message.content = [strToTextContent(message.content)];
    } else if (!Array.isArray(message.content)) {
      return false;
    }

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

export const isOpenAIContent = (content: any) => {
  return isOpenAIChat(content) || isOpenAIPlaygroundJSON(content);
};

const isOpenAIChat = (content: any): content is OpenAIChat => {
  return typeof content === 'object' && 'mapping' in content;
};
const isOpenAIPlaygroundJSON = (
  content: any
): content is OpenAIPlaygroundJSON => {
  return typeof content === 'object' && 'messages' in content;
};

// Convert OpenAI chat format to BetterChatGPT format
export const convertOpenAIToBetterChatGPTFormat = (
  openAIChatExport: any
): ChatInterface => {
  const messages: MessageInterface[] = [];

  if (isOpenAIChat(openAIChatExport)) {
    // Traverse the chat tree and collect messages for the mapping structure
    const traverseTree = (id: string) => {
      const node = openAIChatExport.mapping[id];

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
      }

      // Traverse the last child node if any children exist
      if (node.children.length > 0) {
        traverseTree(node.children[node.children.length - 1]);
      }
    };

    // Start traversing the tree from the root node
    const rootNode =
      openAIChatExport.mapping[Object.keys(openAIChatExport.mapping)[0]];
    traverseTree(rootNode.id);
  } else if (isOpenAIPlaygroundJSON(openAIChatExport)) {
    // Handle the playground export format
    openAIChatExport.messages.forEach((message) => {
      const { role, content } = message;
      if (Array.isArray(content)) {
        const contentElements: ContentInterface[] = content
          .map((part) => {
            if (isTextContent(part)) {
              return { type: 'text', text: part.text };
            } else if (isImageContent(part)) {
              return {
                type: 'image_url',
                image_url: {
                  url: part.image_url.url,
                  detail: part.image_url.detail || 'auto',
                },
              };
            }
            return null;
          })
          .filter((part) => part !== null) as ContentInterface[];

        if (contentElements.length > 0) {
          messages.push({
            role,
            content: contentElements,
          });
        }
      }
    });
  }

  // Extend or override _defaultChatConfig with values from openAIChat
  const config: ConfigInterface = {
    ..._defaultChatConfig,
    ...((openAIChatExport as any).temperature !== undefined && {
      temperature: (openAIChatExport as any).temperature,
    }),
    ...((openAIChatExport as any).max_tokens !== undefined && {
      max_tokens: (openAIChatExport as any).max_tokens,
    }),
    ...((openAIChatExport as any).top_p !== undefined && {
      top_p: (openAIChatExport as any).top_p,
    }),
    ...((openAIChatExport as any).frequency_penalty !== undefined && {
      frequency_penalty: (openAIChatExport as any).frequency_penalty,
    }),
    ...((openAIChatExport as any).presence_penalty !== undefined && {
      presence_penalty: (openAIChatExport as any).presence_penalty,
    }),
    ...((openAIChatExport as any).model !== undefined && {
      model: (openAIChatExport as any).model,
    }),
  };

  // Return the chat interface object
  return {
    id: uuidv4(),
    title: openAIChatExport.title || 'Untitled Chat',
    messages,
    config,
    titleSet: true,
  };
};

// Import OpenAI chat data and convert it to BetterChatGPT format
export const importOpenAIChatExport = (openAIChatExport: any) => {
  if (Array.isArray(openAIChatExport)) {
    return openAIChatExport.map(convertOpenAIToBetterChatGPTFormat);
  } else if (typeof openAIChatExport === 'object') {
    return [convertOpenAIToBetterChatGPTFormat(openAIChatExport)];
  }
  return [];
};
