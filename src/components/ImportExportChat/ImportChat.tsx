import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import useStore from '@store/store';

import {
  importOpenAIChatExport,
  isLegacyImport,
  isOpenAIContent,
  validateAndFixChats,
  validateExportV1,
} from '@utils/import';

import { ChatInterface, Folder, FolderCollection } from '@type/chat';
import { ExportBase } from '@type/export';
import { toast } from 'react-toastify';

type ImportResult = {
  success: boolean;
  message: string;
};

const ImportChat = () => {
  const { t } = useTranslation(['main', 'import']);
  const setChats = useStore.getState().setChats;
  const setFolders = useStore.getState().setFolders;
  const inputRef = useRef<HTMLInputElement>(null);
  const [alert, setAlert] = useState<{
    message: string;
    success: boolean;
  } | null>(null);

  const handleFileUpload = () => {
    if (!inputRef || !inputRef.current) return;
    const file = inputRef.current.files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = async (event) => {
        const data = event.target?.result as string;
        const originalChats = JSON.parse(
          JSON.stringify(useStore.getState().chats)
        );
        const originalFolders = JSON.parse(
          JSON.stringify(useStore.getState().folders)
        );
        var originalParsedData: any;
        const importData = async (
          parsedData: any,
          shouldReduce = false,
          type: string = ''
        ): Promise<ImportResult> => {
          let chatsToImport = parsedData;
          let removedChatsCount = 0;
          while (true) {
            try {
              if (type === 'OpenAIContent' || isOpenAIContent(chatsToImport)) {
                const chats = importOpenAIChatExport(chatsToImport);
                const prevChats: ChatInterface[] = JSON.parse(
                  JSON.stringify(useStore.getState().chats)
                );
                setChats(chats.concat(prevChats));
                if (removedChatsCount > 0) {
                  toast.info(
                    `${t('reduceMessagesSuccess', {
                      count: removedChatsCount,
                    })}. ${t('notifications.chatsImported', {
                      ns: 'import',
                      imported: chats.length,
                      total: originalParsedData.length,
                    })}`,
                    { autoClose: 15000 }
                  );
                }
                if (chats.length > 0) {
                  return {
                    success: true,
                    message: t('notifications.successfulImport', {
                      ns: 'import',
                    }),
                  };
                } else {
                  return {
                    success: false,
                    message: t('notifications.quotaExceeded', {
                      ns: 'import',
                    }),
                  };
                }
              } else if (
                type === 'LegacyImport' ||
                isLegacyImport(chatsToImport)
              ) {
                if (validateAndFixChats(chatsToImport)) {
                  // import new folders
                  const folderNameToIdMap: Record<string, string> = {};
                  const parsedFolders: string[] = [];

                  chatsToImport.forEach((data) => {
                    const folder = data.folder;
                    if (folder) {
                      if (!parsedFolders.includes(folder)) {
                        parsedFolders.push(folder);
                        folderNameToIdMap[folder] = uuidv4();
                      }
                      data.folder = folderNameToIdMap[folder];
                    }
                  });

                  const newFolders: FolderCollection = parsedFolders.reduce(
                    (acc, curr, index) => {
                      const id = folderNameToIdMap[curr];
                      const _newFolder: Folder = {
                        id,
                        name: curr,
                        expanded: false,
                        order: index,
                      };
                      return { [id]: _newFolder, ...acc };
                    },
                    {}
                  );

                  // increment the order of existing folders
                  const offset = parsedFolders.length;

                  const updatedFolders = useStore.getState().folders;
                  Object.values(updatedFolders).forEach(
                    (f) => (f.order += offset)
                  );

                  setFolders({ ...newFolders, ...updatedFolders });

                  // import chats
                  const prevChats = useStore.getState().chats;
                  if (prevChats) {
                    const updatedChats: ChatInterface[] = JSON.parse(
                      JSON.stringify(prevChats)
                    );
                    setChats(chatsToImport.concat(updatedChats));
                  } else {
                    setChats(chatsToImport);
                  }
                  if (removedChatsCount > 0) {
                    toast.info(
                      `${t('reduceMessagesSuccess', {
                        count: removedChatsCount,
                      })}. ${t('notifications.chatsImported', {
                        ns: 'import',
                        imported: chatsToImport.length,
                        total: originalParsedData.length,
                      })}`,
                      { autoClose: 15000 }
                    );
                  }
                  if (chatsToImport.length > 0) {
                    return {
                      success: true,
                      message: t('notifications.successfulImport', {
                        ns: 'import',
                      }),
                    };
                  } else {
                    return {
                      success: false,
                      message: t('notifications.nothingImported', {
                        ns: 'import',
                      }),
                    };
                  }
                } else {
                  return {
                    success: false,
                    message: t('notifications.invalidChatsDataFormat', {
                      ns: 'import',
                    }),
                  };
                }
              } else {
                switch ((parsedData as ExportBase).version) {
                  case 1:
                    if (validateExportV1(parsedData)) {
                      // increment the order of existing folders
                      const offset = Object.keys(parsedData.folders).length;

                      const updatedFolders = useStore.getState().folders;
                      Object.values(updatedFolders).forEach(
                        (f) => (f.order += offset)
                      );

                      setFolders({ ...parsedData.folders, ...updatedFolders });

                      // import chats
                      const prevChats = useStore.getState().chats;
                      if (parsedData.chats) {
                        if (prevChats) {
                          const updatedChats: ChatInterface[] = JSON.parse(
                            JSON.stringify(prevChats)
                          );
                          setChats(parsedData.chats.concat(updatedChats));
                        } else {
                          setChats(parsedData.chats);
                        }
                      }
                      if (
                        removedChatsCount > 0 &&
                        parsedData.chats &&
                        parsedData.chats.length > 0
                      ) {
                        toast.info(
                          `${t('reduceMessagesSuccess', {
                            count: removedChatsCount,
                          })}. ${t('notifications.chatsImported', {
                            ns: 'import',
                            imported:
                              originalParsedData.chats.length -
                              removedChatsCount,
                            total: originalParsedData.chats.length,
                          })}`,
                          { autoClose: 15000 }
                        );
                      }

                      if (parsedData.chats && parsedData.chats.length > 0) {
                        return {
                          success: true,
                          message: t('notifications.successfulImport', {
                            ns: 'import',
                          }),
                        };
                      } else {
                        return {
                          success: false,
                          message: t('notifications.quotaExceeded', {
                            ns: 'import',
                          }),
                        };
                      }
                    } else {
                      return {
                        success: false,
                        message: t('notifications.invalidFormatForVersion', {
                          ns: 'import',
                        }),
                      };
                    }
                  default:
                    return {
                      success: false,
                      message: t('notifications.unrecognisedDataFormat', {
                        ns: 'import',
                      }),
                    };
                }
              }
            } catch (error: unknown) {
              if ((error as DOMException).name === 'QuotaExceededError') {
                setChats(originalChats);
                setFolders(originalFolders);
                if (type === 'ExportV1') {
                  if (chatsToImport.chats.length > 0) {
                    if (shouldReduce) {
                      chatsToImport.chats.pop();
                      removedChatsCount++;
                    } else {
                      const confirmMessage = t(
                        'reduceMessagesFailedImportWarning'
                      );
                      if (window.confirm(confirmMessage)) {
                        return await importData(parsedData, true, type);
                      } else {
                        return {
                          success: false,
                          message: t('notifications.quotaExceeded', {
                            ns: 'import',
                          }),
                        };
                      }
                    }
                  } else {
                    return {
                      success: false,
                      message: t('notifications.quotaExceeded', {
                        ns: 'import',
                      }),
                    };
                  }
                } else {
                  if (chatsToImport.length > 0) {
                    if (shouldReduce) {
                      chatsToImport.pop();
                      removedChatsCount++;
                    } else {
                      const confirmMessage = t(
                        'reduceMessagesFailedImportWarning'
                      );
                      if (window.confirm(confirmMessage)) {
                        return await importData(parsedData, true, type);
                      } else {
                        return {
                          success: false,
                          message: t('notifications.quotaExceeded', {
                            ns: 'import',
                          }),
                        };
                      }
                    }
                  } else {
                    return {
                      success: false,
                      message: t('notifications.quotaExceeded', {
                        ns: 'import',
                      }),
                    };
                  }
                }
              } else {
                return { success: false, message: (error as Error).message };
              }
            }
          }
        };

        try {
          const parsedData = JSON.parse(data);
          originalParsedData = JSON.parse(data);
          let type = '';
          if (isOpenAIContent(parsedData)) {
            type = 'OpenAIContent';
          } else if (isLegacyImport(parsedData)) {
            type = 'LegacyImport';
          } else if ((parsedData as ExportBase).version === 1) {
            type = 'ExportV1';
          }
          const result = await importData(parsedData, false, type);
          if (result.success) {
            toast.success(result.message);
            setAlert({ message: result.message, success: true });
          } else {
            setChats(originalChats);
            setFolders(originalFolders);
            toast.error(result.message, { autoClose: 15000 });
            setAlert({ message: result.message, success: false });
          }
        } catch (error: unknown) {
          setChats(originalChats);
          setFolders(originalFolders);
          toast.error((error as Error).message, { autoClose: 15000 });
          setAlert({ message: (error as Error).message, success: false });
        }
      };

      reader.readAsText(file);
    }
  };

  return (
    <>
      <label className='block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300'>
        {t('import')} (JSON)
      </label>
      <input
        className='w-full text-sm file:p-2 text-gray-800 file:text-gray-700 dark:text-gray-300 dark:file:text-gray-200 rounded-md cursor-pointer focus:outline-none bg-gray-50 file:bg-gray-100 dark:bg-gray-800 dark:file:bg-gray-700 file:border-0 border border-gray-300 dark:border-gray-600 placeholder-gray-900 dark:placeholder-gray-300 file:cursor-pointer'
        type='file'
        ref={inputRef}
      />
      <button
        className='btn btn-small btn-primary mt-3'
        onClick={handleFileUpload}
        aria-label={t('import') as string}
      >
        {t('import')}
      </button>
      {alert && (
        <div
          className={`relative py-2 px-3 w-full mt-3 border rounded-md text-gray-600 dark:text-gray-100 text-sm whitespace-pre-wrap ${
            alert.success
              ? 'border-green-500 bg-green-500/10'
              : 'border-red-500 bg-red-500/10'
          }`}
        >
          {alert.message}
        </div>
      )}
    </>
  );
};

export default ImportChat;
