import React, { useState } from 'react';
import useStore from '@store/store';
import { useTranslation } from 'react-i18next';

import Select from 'react-select';
import PopupModal from '@components/PopupModal';
import {
  FrequencyPenaltySlider,
  ImageDetailSelector,
  MaxTokenSlider,
  ModelSelector,
  PresencePenaltySlider,
  TemperatureSlider,
  TopPSlider,
} from '@components/ConfigMenu/ConfigMenu';

import {
  _defaultChatConfig,
  _defaultImageDetail,
  _defaultSystemMessage,
} from '@constants/chat';
import { ModelOptions } from '@utils/modelReader';
import { ImageDetail } from '@type/chat';

const ChatConfigMenu = () => {
  const { t } = useTranslation('model');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  return (
    <div>
      <button
        className='btn btn-neutral'
        onClick={() => setIsModalOpen(true)}
        aria-label={t('defaultChatConfig') as string}
      >
        {t('defaultChatConfig')}
      </button>
      {isModalOpen && <ChatConfigPopup setIsModalOpen={setIsModalOpen} />}
    </div>
  );
};

const ChatConfigPopup = ({
  setIsModalOpen,
}: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const config = useStore.getState().defaultChatConfig;
  const setDefaultChatConfig = useStore((state) => state.setDefaultChatConfig);
  const setDefaultSystemMessage = useStore(
    (state) => state.setDefaultSystemMessage
  );
  const setDefaultImageDetail = useStore(
    (state) => state.setDefaultImageDetail
  );

  const [_systemMessage, _setSystemMessage] = useState<string>(
    useStore.getState().defaultSystemMessage
  );
  const [_model, _setModel] = useState<ModelOptions>(config.model);
  const [_maxToken, _setMaxToken] = useState<number>(config.max_tokens);
  const [_temperature, _setTemperature] = useState<number>(config.temperature);
  const [_topP, _setTopP] = useState<number>(config.top_p);
  const [_presencePenalty, _setPresencePenalty] = useState<number>(
    config.presence_penalty
  );
  const [_frequencyPenalty, _setFrequencyPenalty] = useState<number>(
    config.frequency_penalty
  );
  const [_imageDetail, _setImageDetail] = useState<ImageDetail>(
    useStore.getState().defaultImageDetail
  );

  const { t } = useTranslation('model');

  const handleSave = () => {
    setDefaultChatConfig({
      model: _model,
      max_tokens: _maxToken,
      temperature: _temperature,
      top_p: _topP,
      presence_penalty: _presencePenalty,
      frequency_penalty: _frequencyPenalty,
    });
    setDefaultSystemMessage(_systemMessage);
    setDefaultImageDetail(_imageDetail);
    setIsModalOpen(false);
  };

  const handleReset = () => {
    _setModel(_defaultChatConfig.model);
    _setMaxToken(_defaultChatConfig.max_tokens);
    _setTemperature(_defaultChatConfig.temperature);
    _setTopP(_defaultChatConfig.top_p);
    _setPresencePenalty(_defaultChatConfig.presence_penalty);
    _setFrequencyPenalty(_defaultChatConfig.frequency_penalty);
    _setImageDetail(_defaultImageDetail);
    _setSystemMessage(_defaultSystemMessage);
    _setImageDetail(_defaultImageDetail);
  };

  return (
    <PopupModal
      title={t('defaultChatConfig') as string}
      setIsModalOpen={setIsModalOpen}
      handleConfirm={handleSave}
    >
      <div className='p-6 border-b border-gray-200 dark:border-gray-600 w-[90vw] max-w-full text-sm text-gray-900 dark:text-gray-300'>
        <DefaultSystemChat
          _systemMessage={_systemMessage}
          _setSystemMessage={_setSystemMessage}
        />
        <ModelSelector
          _model={_model}
          _setModel={_setModel}
          _label={t('model')}
        />
        <MaxTokenSlider
          _maxToken={_maxToken}
          _setMaxToken={_setMaxToken}
          _model={_model}
        />
        <TemperatureSlider
          _temperature={_temperature}
          _setTemperature={_setTemperature}
        />
        <TopPSlider _topP={_topP} _setTopP={_setTopP} />
        <PresencePenaltySlider
          _presencePenalty={_presencePenalty}
          _setPresencePenalty={_setPresencePenalty}
        />
        <FrequencyPenaltySlider
          _frequencyPenalty={_frequencyPenalty}
          _setFrequencyPenalty={_setFrequencyPenalty}
        />
        <ImageDetailSelector
          _imageDetail={_imageDetail}
          _setImageDetail={_setImageDetail}
        />
        
        <div
          className='btn btn-neutral cursor-pointer mt-5'
          onClick={handleReset}
        >
          {t('resetToDefault')}
        </div>
      </div>
    </PopupModal>
  );
};

const DefaultSystemChat = ({
  _systemMessage,
  _setSystemMessage,
}: {
  _systemMessage: string;
  _setSystemMessage: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const { t } = useTranslation('model');

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
    e.target.style.maxHeight = `${e.target.scrollHeight}px`;
  };

  const handleOnFocus = (e: React.FocusEvent<HTMLTextAreaElement, Element>) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
    e.target.style.maxHeight = `${e.target.scrollHeight}px`;
  };

  const handleOnBlur = (e: React.FocusEvent<HTMLTextAreaElement, Element>) => {
    e.target.style.height = 'auto';
    e.target.style.maxHeight = '2.5rem';
  };

  return (
    <div>
      <div className='block text-sm font-medium text-gray-900 dark:text-white'>
        {t('defaultSystemMessage')}
      </div>
      <textarea
        className='my-2 mx-0 px-2 resize-none rounded-lg bg-transparent overflow-y-hidden leading-7 p-1 border border-gray-400/50 focus:ring-1 focus:ring-blue w-full max-h-10 transition-all'
        onFocus={handleOnFocus}
        onBlur={handleOnBlur}
        onChange={(e) => {
          _setSystemMessage(e.target.value);
        }}
        onInput={handleInput}
        value={_systemMessage}
        rows={1}
      ></textarea>
    </div>
  );
};

export default ChatConfigMenu;
