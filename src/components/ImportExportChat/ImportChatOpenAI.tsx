// TODO: NOT USED, TO BE REMOVED R: KISS, DRY
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import useStore from '@store/store';

import { importOpenAIChatExport } from '@utils/import';

import { ChatInterface } from '@type/chat';

const ImportChatOpenAI = ({
  setIsModalOpen,
}: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { t } = useTranslation();

  const inputRef = useRef<HTMLInputElement>(null);

  const setToastStatus = useStore((state) => state.setToastStatus);
  const setToastMessage = useStore((state) => state.setToastMessage);
  const setToastShow = useStore((state) => state.setToastShow);
  const setChats = useStore.getState().setChats;

  const handleFileUpload = () => {
    if (!inputRef || !inputRef.current) return;
    const file = inputRef.current.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const data = event.target?.result as string;

      try {
        const parsedData = JSON.parse(data);
        const chats = importOpenAIChatExport(parsedData);
        const prevChats: ChatInterface[] = JSON.parse(
          JSON.stringify(useStore.getState().chats)
        );
        setChats(chats.concat(prevChats));

        setToastStatus('success');
        setToastMessage('Imported successfully!');
        setIsModalOpen(false);
      } catch (error: unknown) {
        setToastStatus('error');
        setToastMessage(`Invalid format! ${(error as Error).message}`);
      }
      setToastShow(true);
    };

    reader.readAsText(file);
  };

  return (
    <>
      <div className='text-lg font-bold text-gray-900 dark:text-gray-300 text-center mb-3'>
        {t('import')} OpenAI ChatGPT {t('export')}
      </div>
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
    </>
  );
};

export default ImportChatOpenAI;
