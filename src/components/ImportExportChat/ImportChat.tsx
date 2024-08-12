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

      reader.onload = (event) => {
        const data = event.target?.result as string;

        try {
          const parsedData = JSON.parse(data);
          if (isOpenAIContent(parsedData)) {
            try {
              const chats = importOpenAIChatExport(parsedData);
              const prevChats: ChatInterface[] = JSON.parse(
                JSON.stringify(useStore.getState().chats)
              );
              setChats(chats.concat(prevChats));
              toast.success(
                t('notifications.successfulImport', { ns: 'import' })
              );
            } catch (error: unknown) {
              toast.error(
                `${t('notifications.invalidOpenAIDataFormat', {
                  ns: 'import',
                })}: ${(error as Error).message}`
              );
            }
          } else if (isLegacyImport(parsedData)) {
            if (validateAndFixChats(parsedData)) {
              // import new folders
              const folderNameToIdMap: Record<string, string> = {};
              const parsedFolders: string[] = [];

              parsedData.forEach((data) => {
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
              Object.values(updatedFolders).forEach((f) => (f.order += offset));

              setFolders({ ...newFolders, ...updatedFolders });

              // import chats
              const prevChats = useStore.getState().chats;
              if (prevChats) {
                const updatedChats: ChatInterface[] = JSON.parse(
                  JSON.stringify(prevChats)
                );
                setChats(parsedData.concat(updatedChats));
              } else {
                setChats(parsedData);
              }
              toast.success(
                t('notifications.successfulImport', { ns: 'import' })
              );
              setAlert({ message: 'Succesfully imported!', success: true });
            } else {
              toast.error(
                t('notifications.invalidChatsDataFormat', { ns: 'import' })
              );
              setAlert({
                message: t('notifications.invalidChatsDataFormat', {
                  ns: 'import',
                }),
                success: false,
              });
            }
          } else {
            switch ((parsedData as ExportBase).version) {
              case 1:
                if (validateExportV1(parsedData)) {
                  // import folders
                  parsedData.folders;
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

                  toast.success(
                    t('notifications.successfulImport', { ns: 'import' })
                  );
                  setAlert({
                    message: t('notifications.successfulImport', {
                      ns: 'import',
                    }),
                    success: true,
                  });
                } else {
                  toast.error(
                    t('notifications.invalidFormatForVersion', { ns: 'import' })
                  );
                  setAlert({
                    message: t('notifications.invalidFormatForVersion', {
                      ns: 'import',
                    }),
                    success: false,
                  });
                }
                break;
              default:
                toast.error(
                  t('notifications.unrecognisedDataFormat', { ns: 'import' })
                );
                setAlert({
                  message: t('notifications.unrecognisedDataFormat', {
                    ns: 'import',
                  }),
                  success: false,
                });
                break;
            }
          }
        } catch (error: unknown) {
          toast.error((error as Error).message);
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
