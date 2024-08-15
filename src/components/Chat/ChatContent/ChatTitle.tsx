import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { shallow } from 'zustand/shallow';
import useStore from '@store/store';
import ConfigMenu from '@components/ConfigMenu';
import { ChatInterface, ConfigInterface, ImageDetail } from '@type/chat';
import { _defaultChatConfig } from '@constants/chat';

const ChatTitle = React.memo(() => {
  const { t } = useTranslation('model');
  const chat = useStore(
    (state) =>
      state.chats &&
      state.chats.length > 0 &&
      state.currentChatIndex >= 0 &&
      state.currentChatIndex < state.chats.length
        ? state.chats[state.currentChatIndex]
        : undefined,
    shallow
  );
  const setChats = useStore((state) => state.setChats);
  const currentChatIndex = useStore((state) => state.currentChatIndex);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const setConfig = (config: ConfigInterface) => {
    const updatedChats: ChatInterface[] = JSON.parse(
      JSON.stringify(useStore.getState().chats)
    );
    updatedChats[currentChatIndex].config = config;
    setChats(updatedChats);
  };

  const setImageDetail = (imageDetail: ImageDetail) => {
    const updatedChats: ChatInterface[] = JSON.parse(
      JSON.stringify(useStore.getState().chats)
    );
    updatedChats[currentChatIndex].imageDetail = imageDetail;
    setChats(updatedChats);
  };

  // for migrating from old ChatInterface to new ChatInterface (with config)
  useEffect(() => {
    const chats = useStore.getState().chats;
    if (chats && chats.length > 0 && currentChatIndex !== -1 && !chat?.config) {
      const updatedChats: ChatInterface[] = JSON.parse(JSON.stringify(chats));
      updatedChats[currentChatIndex].config = { ..._defaultChatConfig };
      setChats(updatedChats);
    }
  }, [currentChatIndex]);

  return chat ? (
    <>
      <div
        className='sticky top-0 z-10 flex gap-x-4 gap-y-1 flex-wrap w-full items-center justify-center border-b border-black/10 bg-gray-50 p-3 dark:border-gray-900/50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-pointer'
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        <div className='text-center p-1 rounded-md bg-gray-300/20 dark:bg-gray-900/10 hover:bg-gray-300/50 dark:hover:bg-gray-900/50'>
          {t('model')}: {chat.config.model}
        </div>
        <div className='text-center p-1 rounded-md bg-gray-300/20 dark:bg-gray-900/10 hover:bg-gray-300/50 dark:hover:bg-gray-900/50'>
          {t('token.label')}: {chat.config.max_tokens}
        </div>
        <div className='text-center p-1 rounded-md bg-gray-300/20 dark:bg-gray-900/10 hover:bg-gray-300/50 dark:hover:bg-gray-900/50'>
          {t('temperature.label')}: {chat.config.temperature}
        </div>
        <div className='text-center p-1 rounded-md bg-gray-300/20 dark:bg-gray-900/10 hover:bg-gray-300/50 dark:hover:bg-gray-900/50'>
          {t('topP.label')}: {chat.config.top_p}
        </div>
        <div className='text-center p-1 rounded-md bg-gray-300/20 dark:bg-gray-900/10 hover:bg-gray-300/50 dark:hover:bg-gray-900/50'>
          {t('presencePenalty.label')}: {chat.config.presence_penalty}
        </div>
        <div className='text-center p-1 rounded-md bg-gray-300/20 dark:bg-gray-900/10 hover:bg-gray-300/50 dark:hover:bg-gray-900/50'>
          {t('frequencyPenalty.label')}: {chat.config.frequency_penalty}
        </div>
        <div className='text-center p-1 rounded-md bg-gray-300/20 dark:bg-gray-900/10 hover:bg-gray-300/50 dark:hover:bg-gray-900/50'>
          {t('imageDetail.label')}: {chat.imageDetail}
        </div>
      </div>
      {isModalOpen && (
        <ConfigMenu
          setIsModalOpen={setIsModalOpen}
          config={chat.config}
          setConfig={setConfig}
          imageDetail={chat.imageDetail}
          setImageDetail={setImageDetail}
        />
      )}
    </>
  ) : (
    <></>
  );
});

export default ChatTitle;