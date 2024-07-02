import React, { useEffect, useRef, useState } from 'react';

import useInitialiseNewChat from '@hooks/useInitialiseNewChat';

import ChatIcon from '@icon/ChatIcon';
import CrossIcon from '@icon/CrossIcon';
import DeleteIcon from '@icon/DeleteIcon';
import EditIcon from '@icon/EditIcon';
import TickIcon from '@icon/TickIcon';
import useStore from '@store/store';
import { formatNumber } from '@utils/chat';

const ChatHistoryClass = {
  normal:
    'flex py-2 px-2 items-center gap-3 relative rounded-md bg-gray-900 hover:bg-gray-850 break-all hover:pr-4 group transition-opacity',
  active:
    'flex py-2 px-2 items-center gap-3 relative rounded-md break-all pr-14 bg-gray-800 hover:bg-gray-800 group transition-opacity',
  normalGradient:
    'absolute inset-y-0 right-0 w-8 z-10 bg-gradient-to-l from-gray-900 group-hover:from-gray-850',
  activeGradient:
    'absolute inset-y-0 right-0 w-8 z-10 bg-gradient-to-l from-gray-800',
};

const ChatHistory = React.memo(
  ({
    title,
    chatIndex,
    chatSize,
    selectedChats,
    setSelectedChats,
    lastSelectedIndex,
    setLastSelectedIndex,
  }: {
    title: string;
    chatIndex: number;
    chatSize?: number;
    selectedChats: number[];
    setSelectedChats: (indices: number[]) => void;
    lastSelectedIndex: number | null;
    setLastSelectedIndex: (index: number) => void;
  }) => {
    const initialiseNewChat = useInitialiseNewChat();
    const setCurrentChatIndex = useStore((state) => state.setCurrentChatIndex);
    const setChats = useStore((state) => state.setChats);
    const active = useStore((state) => state.currentChatIndex === chatIndex);
    const generating = useStore((state) => state.generating);

    const [isDelete, setIsDelete] = useState<boolean>(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [_title, _setTitle] = useState<string>(title);
    const inputRef = useRef<HTMLInputElement>(null);

    const editTitle = () => {
      const updatedChats = JSON.parse(
        JSON.stringify(useStore.getState().chats)
      );
      updatedChats[chatIndex].title = _title;
      setChats(updatedChats);
      setIsEdit(false);
    };

    const deleteChat = () => {
      const updatedChats = JSON.parse(
        JSON.stringify(useStore.getState().chats)
      );
      const indicesToDelete =
        selectedChats.length > 0 ? selectedChats : [chatIndex];
      indicesToDelete
        .sort((a, b) => b - a)
        .forEach((index) => {
          updatedChats.splice(index, 1);
        });
      if (updatedChats.length > 0) {
        setCurrentChatIndex(0);
        setChats(updatedChats);
      } else {
        initialiseNewChat();
      }
      setIsDelete(false);
      setSelectedChats([]);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        editTitle();
      }
    };

    const handleTick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      if (isEdit) editTitle();
      else if (isDelete) deleteChat();
    };

    const handleCross = () => {
      setIsDelete(false);
      setIsEdit(false);
    };

    const handleDragStart = (e: React.DragEvent<HTMLAnchorElement>) => {
      if (e.dataTransfer) {
        const chatIndices =
          selectedChats.length > 0 ? selectedChats : [chatIndex];
        e.dataTransfer.setData('chatIndices', JSON.stringify(chatIndices));
      }
    };

    const handleCheckboxClick = (e: React.MouseEvent<HTMLInputElement>) => {
      if (e.shiftKey && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, chatIndex);
        const end = Math.max(lastSelectedIndex, chatIndex);
        const newSelectedChats = [...selectedChats];
        for (let i = start; i <= end; i++) {
          if (!newSelectedChats.includes(i)) {
            newSelectedChats.push(i);
          }
        }
        setSelectedChats(newSelectedChats);
      } else {
        if (selectedChats.includes(chatIndex)) {
          setSelectedChats(
            selectedChats.filter((index) => index !== chatIndex)
          );
        } else {
          setSelectedChats([...selectedChats, chatIndex]);
        }
        setLastSelectedIndex(chatIndex);
      }
    };

    useEffect(() => {
      if (inputRef && inputRef.current) inputRef.current.focus();
    }, [isEdit]);

    return (
      <a
        className={`${
          active ? ChatHistoryClass.active : ChatHistoryClass.normal
        } ${
          generating
            ? 'cursor-not-allowed opacity-40'
            : 'cursor-pointer opacity-100'
        } ${selectedChats.includes(chatIndex) ? 'bg-blue-500' : ''}`}
        onClick={() => {
          if (!generating) setCurrentChatIndex(chatIndex);
        }}
        draggable
        onDragStart={handleDragStart}
      >
        <input
          type='checkbox'
          checked={selectedChats.includes(chatIndex)}
          onClick={handleCheckboxClick}
          onChange={() => {}}
        />
        <ChatIcon />
        <div
          className='flex-1 text-ellipsis max-h-5 overflow-hidden break-all relative'
          title={`${title}${chatSize ? ` (${formatNumber(chatSize)})` : ''}`}
        >
          {isEdit ? (
            <input
              type='text'
              className='focus:outline-blue-600 text-sm border-none bg-transparent p-0 m-0 w-full'
              value={_title}
              onChange={(e) => {
                _setTitle(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              ref={inputRef}
            />
          ) : (
            `${title}${chatSize ? ` (${formatNumber(chatSize)})` : ''}`
          )}

          {isEdit || (
            <div
              className={
                active
                  ? ChatHistoryClass.activeGradient
                  : ChatHistoryClass.normalGradient
              }
            />
          )}
        </div>
        {active && (
          <div className='absolute flex right-1 z-10 text-gray-300 visible'>
            {isDelete || isEdit ? (
              <>
                <button
                  className='p-1 hover:text-white'
                  onClick={handleTick}
                  aria-label='confirm'
                >
                  <TickIcon />
                </button>
                <button
                  className='p-1 hover:text-white'
                  onClick={handleCross}
                  aria-label='cancel'
                >
                  <CrossIcon />
                </button>
              </>
            ) : (
              <>
                <button
                  className='p-1 hover:text-white'
                  onClick={() => setIsEdit(true)}
                  aria-label='edit chat title'
                >
                  <EditIcon />
                </button>
                <button
                  className='p-1 hover:text-white'
                  onClick={() => setIsDelete(true)}
                  aria-label='delete chat'
                >
                  <DeleteIcon />
                </button>
              </>
            )}
          </div>
        )}
      </a>
    );
  }
);

export default ChatHistory;
