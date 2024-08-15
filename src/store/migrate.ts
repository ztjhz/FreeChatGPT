import { v4 as uuidv4 } from 'uuid';

import {
  Folder,
  FolderCollection,
  LocalStorageInterfaceV0ToV1,
  LocalStorageInterfaceV1ToV2,
  LocalStorageInterfaceV2ToV3,
  LocalStorageInterfaceV3ToV4,
  LocalStorageInterfaceV4ToV5,
  LocalStorageInterfaceV5ToV6,
  LocalStorageInterfaceV6ToV7,
  LocalStorageInterfaceV7oV8,
  LocalStorageInterfaceV8_1ToV8_2,
  LocalStorageInterfaceV8oV8_1,
  TextContentInterface,
  LocalStorageInterfaceV8_2ToV9,
} from '@type/chat';
import {
  _defaultChatConfig,
  _defaultMenuWidth,
  _defaultDisplayChatSize,
  defaultApiVersion,
  defaultModel,
  defaultUserMaxToken,
  _defaultImageDetail,
} from '@constants/chat';
import { officialAPIEndpoint } from '@constants/auth';
import defaultPrompts from '@constants/prompt';

export const migrateV0 = (persistedState: LocalStorageInterfaceV0ToV1) => {
  persistedState.chats.forEach((chat) => {
    chat.titleSet = false;
    if (!chat.config) chat.config = { ..._defaultChatConfig };
  });
};

export const migrateV1 = (persistedState: LocalStorageInterfaceV1ToV2) => {
  if (persistedState.apiFree) {
    persistedState.apiEndpoint = persistedState.apiFreeEndpoint;
  } else {
    persistedState.apiEndpoint = officialAPIEndpoint;
  }
};

export const migrateV2 = (persistedState: LocalStorageInterfaceV2ToV3) => {
  persistedState.chats.forEach((chat) => {
    chat.config = {
      ...chat.config,
      top_p: _defaultChatConfig.top_p,
      frequency_penalty: _defaultChatConfig.frequency_penalty,
    };
  });
  persistedState.autoTitle = false;
};

export const migrateV3 = (persistedState: LocalStorageInterfaceV3ToV4) => {
  persistedState.prompts = defaultPrompts;
};

export const migrateV4 = (persistedState: LocalStorageInterfaceV4ToV5) => {
  persistedState.chats.forEach((chat) => {
    chat.config = {
      ...chat.config,
      model: defaultModel,
    };
  });
};

export const migrateV5 = (persistedState: LocalStorageInterfaceV5ToV6) => {
  persistedState.chats.forEach((chat) => {
    chat.config = {
      ...chat.config,
      max_tokens: defaultUserMaxToken,
    };
  });
};

export const migrateV6 = (persistedState: LocalStorageInterfaceV6ToV7) => {
  if (
    persistedState.apiEndpoint ===
    'https://sharegpt.churchless.tech/share/v1/chat'
  ) {
    persistedState.apiEndpoint = 'https://chatgpt-api.shn.hk/v1/';
  }
  if (!persistedState.apiKey || persistedState.apiKey.length === 0)
    persistedState.apiKey = '';
};

export const migrateV7 = (persistedState: LocalStorageInterfaceV7oV8) => {
  let folders: FolderCollection = {};
  const folderNameToIdMap: Record<string, string> = {};

  // convert foldersExpanded and foldersName to folders
  persistedState.foldersName.forEach((name, index) => {
    const id = uuidv4();
    const folder: Folder = {
      id,
      name,
      expanded: persistedState.foldersExpanded[index],
      order: index,
    };

    folders = { [id]: folder, ...folders };
    folderNameToIdMap[name] = id;
  });
  persistedState.folders = folders;

  // change the chat.folder from name to id
  persistedState.chats.forEach((chat) => {
    if (chat.folder) chat.folder = folderNameToIdMap[chat.folder];
    chat.id = uuidv4();
  });
};

export const migrateV8_1 = (persistedState: LocalStorageInterfaceV8oV8_1) => {
  persistedState.chats.forEach((chat) => {
    persistedState.apiVersion = defaultApiVersion;
    chat.messages.forEach((msg) => {
      if (typeof msg.content === 'string') {
        const content: TextContentInterface[] = [
          { type: 'text', text: msg.content },
        ];
        msg.content = content;
      }
    });
  });
};

export const migrateV8_1_fix = (persistedState: LocalStorageInterfaceV8_1ToV8_2) => {
  persistedState.menuWidth = _defaultMenuWidth;
  persistedState.displayChatSize = _defaultDisplayChatSize;
};

export const migrateV8_2 = (persistedState: LocalStorageInterfaceV8_2ToV9) => {
  persistedState.chats.forEach((chat) => {
    if (chat.imageDetail == undefined) chat.imageDetail = _defaultImageDetail
  });
};