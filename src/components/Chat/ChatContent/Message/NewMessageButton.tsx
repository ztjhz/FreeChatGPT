import React from 'react';
import useStore from '@store/store';

import PlusIcon from '@icon/PlusIcon';

import { ChatInterface, TextContentInterface } from '@type/chat';
import { generateDefaultChat } from '@constants/chat';

const NewMessageButton = React.memo(
  ({ messageIndex }: { messageIndex: number }) => {
    const setChats = useStore((state) => state.setChats);
    const currentChatIndex = useStore((state) => state.currentChatIndex);
    const setCurrentChatIndex = useStore((state) => state.setCurrentChatIndex);

    const addChat = () => {
      const chats = useStore.getState().chats;
      if (chats) {
        const updatedChats: ChatInterface[] = JSON.parse(JSON.stringify(chats));
        let titleIndex = 1;
        let title = `New Chat ${titleIndex}`;

        while (chats.some((chat) => chat.title === title)) {
          titleIndex += 1;
          title = `New Chat ${titleIndex}`;
        }

        updatedChats.unshift(generateDefaultChat(title));
        setChats(updatedChats);
        setCurrentChatIndex(0);
      }
    };

    const addMessage = () => {
      if (currentChatIndex === -1) {
        addChat();
      } else {
        const updatedChats: ChatInterface[] = JSON.parse(
          JSON.stringify(useStore.getState().chats)
        );
        updatedChats[currentChatIndex].messages.splice(messageIndex + 1, 0, {
          content: [{ type: 'text', text: '' } as TextContentInterface],
          role: 'user',
        });
        setChats(updatedChats);
      }
    };

    return (
      <div
        className='h-0 w-0 relative'
        key={messageIndex}
        aria-label='insert message'
      >
        <div
          className='absolute top-0 right-0 translate-x-1/2 translate-y-[-50%] text-gray-600 dark:text-white cursor-pointer bg-gray-200 dark:bg-gray-600/80 rounded-full p-1 text-sm hover:bg-gray-300 dark:hover:bg-gray-800/80 transition-bg duration-200'
          onClick={addMessage}
        >
          <PlusIcon />
        </div>
      </div>
    );
  }
);

export default NewMessageButton;
