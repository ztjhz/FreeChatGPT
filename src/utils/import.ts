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
  _defaultChatConfig,
  _defaultImageDetail,
} from '@constants/chat';
import { ExportV1, OpenAIChat, OpenAIPlaygroundJSON } from '@type/export';
import { modelOptions } from '@constants/modelLoader';
import i18next from 'i18next';

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
  return (
    isOpenAIChat(content) ||
    isOpenAIPlaygroundJSON(content) ||
    isOpenAIDataExport(content)
  );
};

const isOpenAIChat = (content: any): content is OpenAIChat => {
  return typeof content === 'object' && 'mapping' in content;
};
const isOpenAIDataExport = (content: any): content is OpenAIChat => {
  return (
    Array.isArray(content) && content.length > 0 && isOpenAIChat(content[0])
  );
};
const isOpenAIPlaygroundJSON = (
  content: any
): content is OpenAIPlaygroundJSON => {
  return typeof content === 'object' && 'messages' in content;
};

// Define the custom error class
export class PartialImportError extends Error {
  constructor(message: string, public result: ChatInterface) {
    super(message);
    this.name = 'PartialImportError';
  }
}

export const convertOpenAIToBetterChatGPTFormatPartialOK = (
  openAIChatExport: any
): ChatInterface => {
  return convertOpenAIToBetterChatGPTFormat(openAIChatExport, true);
};

export const convertOpenAIToBetterChatGPTFormatPartialNTY = (
  openAIChatExport: any
): ChatInterface => {
  return convertOpenAIToBetterChatGPTFormat(openAIChatExport, false);
};
// Convert OpenAI chat format to BetterChatGPT format
export const convertOpenAIToBetterChatGPTFormat = (
  openAIChatExport: any,
  shouldAllowPartialImport: boolean
): ChatInterface => {
  const messages: MessageInterface[] = [];
  let maxDepth = -1;
  const deepestPathIds: string[] = []; // To record IDs traveled for the deepest part
  const upwardPathIds: string[] = []; // To record IDs traveled upwards
  const messageIds: string[] = []; // To record IDs that go into messages
  const emptyOrNullMessageIds: string[] = []; // To record IDs with empty or null messages
  let emptyOrNullMessagesCount = 0; // Counter for empty or null messages

  if (isOpenAIChat(openAIChatExport)) {
    let deepestNode: any = null;

    // Traverse the chat tree and find the deepest node
    const traverseTree = (id: string, currentDepth: number) => {
      const node = openAIChatExport.mapping[id];
      console.log(`Traversing node with id ${id} at depth ${currentDepth}`);

      // If the current depth is greater than maxDepth, update deepestNode and maxDepth
      if (currentDepth > maxDepth) {
        deepestNode = node;
        if (!node.parent) {
          console.log('no parent for node with id ' + node.id);
        }
        maxDepth = currentDepth;
      }

      // Traverse all child nodes
      for (const childId of node.children) {
        traverseTree(childId, currentDepth + 1);
      }
    };

    // Start traversing the tree from the root node
    const rootNode =
      openAIChatExport.mapping[Object.keys(openAIChatExport.mapping)[0]];
    traverseTree(rootNode.id, 0);

    // Now backtrack from the deepest node to the root and collect messages
    let currentDepth = 0;
    while (deepestNode) {
      deepestPathIds.push(deepestNode.id); // Record the ID of the deepest part
      console.log(`Backtracking node with id ${deepestNode.id} at depth ${currentDepth}`);

      if (deepestNode.message) {
        const { role } = deepestNode.message.author;
        const content = deepestNode.message.content;

        if (Array.isArray(content.parts)) {
          const textContent = content.parts.join('') || '';
          if (textContent.length > 0) {
            // Insert each message at the beginning of the array to maintain order from root to deepest node
            messages.unshift({
              role,
              content: [{ type: 'text', text: textContent }],
            });
            messageIds.push(deepestNode.id);
            console.log(`Node with id ${deepestNode.id} added to messages.`);
          } else {
            console.log(`Node with id ${deepestNode.id} has empty text content.`);
            emptyOrNullMessagesCount++;
            emptyOrNullMessageIds.push(deepestNode.id);
          }
        } else if (isContentInterface(content)) {
          // Insert each message at the beginning of the array
          messages.unshift({ role, content: [content] });
          messageIds.push(deepestNode.id);
          console.log(`Node with id ${deepestNode.id} added to messages.`);
        } else {
          console.log(`Node with id ${deepestNode.id} has invalid content.`);
          emptyOrNullMessagesCount++;
          emptyOrNullMessageIds.push(deepestNode.id);
        }
      } else {
        console.log(`Node with id ${deepestNode.id} has no message.`);
        emptyOrNullMessagesCount++;
        emptyOrNullMessageIds.push(deepestNode.id);
      }

      // Move up to the parent node
      const parentNodeId = deepestNode.parent ? deepestNode.parent : null;
      console.log(`Moving from node ${deepestNode.id} to parent node ${parentNodeId}`);
      deepestNode = parentNodeId ? openAIChatExport.mapping[parentNodeId] : null;
      currentDepth++;
    }

    // Record the upward path IDs in reverse order to match the order from root to end
    for (let i = deepestPathIds.length - 1; i >= 0; i--) {
      upwardPathIds.push(deepestPathIds[i]);
    }

    console.log('Deepest Path IDs:', deepestPathIds);
    console.log('Upward Path IDs:', upwardPathIds);
    console.log('Message IDs:', messageIds);
    console.log('Empty or Null Message IDs:', emptyOrNullMessageIds);
    console.log('Empty or Null Messages Count:', emptyOrNullMessagesCount);
    console.log('messages.length:', messages.length);

    // Show differences
    const diffDeepestToMessages = deepestPathIds.filter(id => !messageIds.includes(id));
    console.log('Difference between Deepest Path IDs and Message IDs:', diffDeepestToMessages);

    // Check if the difference between diffDeepestToMessages and emptyOrNullMessageIds is empty
    const diffDeepestToMessagesAndEmpty = diffDeepestToMessages.filter(id => !emptyOrNullMessageIds.includes(id));
    console.log('Difference between diffDeepestToMessages and Empty or Null Message IDs:', diffDeepestToMessagesAndEmpty);

    if (!shouldAllowPartialImport) {
      // If the difference between diffDeepestToMessages and emptyOrNullMessageIds is not empty, throw PartialImportError
      if (diffDeepestToMessagesAndEmpty.length > 0) {
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

        const result: ChatInterface = {
          id: uuidv4(),
          title: openAIChatExport.title || 'Untitled Chat',
          messages,
          config,
          titleSet: true,
          imageDetail: _defaultImageDetail,
        };
        throw new PartialImportError(
          i18next.t('partialImportMessages', {
            ns: 'import',
            total: deepestPathIds.length,
            count: messageIds.length,
          }),
          result
        );
      }
    }
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
    imageDetail: _defaultImageDetail,
  };
};

// Import OpenAI chat data and convert it to BetterChatGPT format
export const importOpenAIChatExport = (
  openAIChatExport: any,
  shouldAllowPartialImport: boolean
) => {
  if (Array.isArray(openAIChatExport)) {
    if (shouldAllowPartialImport) {
      return openAIChatExport.map(convertOpenAIToBetterChatGPTFormatPartialOK);
    } else {
      return openAIChatExport.map(convertOpenAIToBetterChatGPTFormatPartialNTY);
    }
  } else if (typeof openAIChatExport === 'object') {
    return [
      convertOpenAIToBetterChatGPTFormat(
        openAIChatExport,
        shouldAllowPartialImport
      ),
    ];
  }
  return [];
};
