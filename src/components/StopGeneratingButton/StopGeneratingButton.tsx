import React, { useEffect } from 'react';
import useStore from '@store/store';
import { useTranslation } from 'react-i18next';
import { modelStreamSupport } from '@constants/modelLoader';

const StopGeneratingButton = () => {
  const { t } = useTranslation();
  const setGenerating = useStore((state) => state.setGenerating);
  const generating = useStore((state) => state.generating);

  const currentModel = useStore((state) =>
    state.chats ? state.chats[state.currentChatIndex].config.model : ''
  );
  const handleGeneratingStop = () => {
    if (modelStreamSupport[currentModel]) {
      setGenerating(false);
    } else {
      const confirmMessage = t('stopNonStreamGenerationWarning');
      if (window.confirm(confirmMessage)) {
        setGenerating(false);
      }
    }
  };

  return generating ? (
    <div
      className='absolute bottom-6 left-0 right-0 m-auto flex md:w-full md:m-auto gap-0 md:gap-2 justify-center'
      onClick={() => handleGeneratingStop()}
    >
      <button
        className='btn relative btn-neutral border-0 md:border'
        aria-label='stop generating'
      >
        <div className='flex w-full items-center justify-center gap-2'>
          <svg
            stroke='currentColor'
            fill='none'
            strokeWidth='1.5'
            viewBox='0 0 24 24'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='h-3 w-3'
            height='1em'
            width='1em'
            xmlns='http://www.w3.org/2000/svg'
          >
            <rect x='3' y='3' width='18' height='18' rx='2' ry='2'></rect>
          </svg>
          Stop generating
        </div>
      </button>
    </div>
  ) : (
    <></>
  );
};

export default StopGeneratingButton;
