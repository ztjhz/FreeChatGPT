import React, { useEffect, useRef, useState } from 'react';
import useStore from '@store/store';
import { useTranslation } from 'react-i18next';
import PopupModal from '@components/PopupModal';
import { ConfigInterface } from '@type/chat';
import DownChevronArrow from '@icon/DownChevronArrow';
import { modelOptions, modelMaxToken } from '@constants/modelLoader';
import { ModelOptions } from '@utils/modelReader';
const ConfigMenu = ({
  setIsModalOpen,
  config,
  setConfig,
}: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  config: ConfigInterface;
  setConfig: (config: ConfigInterface) => void;
}) => {
  const [_maxToken, _setMaxToken] = useState<number>(config.max_tokens);
  const [_model, _setModel] = useState<ModelOptions>(config.model);
  const [_temperature, _setTemperature] = useState<number>(config.temperature);
  const [_presencePenalty, _setPresencePenalty] = useState<number>(
    config.presence_penalty
  );
  const [_topP, _setTopP] = useState<number>(config.top_p);
  const [_frequencyPenalty, _setFrequencyPenalty] = useState<number>(
    config.frequency_penalty
  );
  const { t } = useTranslation('model');

  const handleConfirm = () => {
    setConfig({
      max_tokens: _maxToken,
      model: _model,
      temperature: _temperature,
      presence_penalty: _presencePenalty,
      top_p: _topP,
      frequency_penalty: _frequencyPenalty,
    });
    setIsModalOpen(false);
  };

  return (
    <PopupModal
      title={t('configuration') as string}
      setIsModalOpen={setIsModalOpen}
      handleConfirm={handleConfirm}
      handleClickBackdrop={handleConfirm}
    >
      <div className='p-6 border-b border-gray-200 dark:border-gray-600'>
        <ModelSelector
          _model={_model}
          _setModel={_setModel}
          _label={t('Model')}
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
      </div>
    </PopupModal>
  );
};

export const ModelSelector = ({
  _model,
  _setModel,
  _label,
}: {
  _model: ModelOptions;
  _setModel: React.Dispatch<React.SetStateAction<ModelOptions>>;
  _label: string;
}) => {
  const [dropDown, setDropDown] = useState<boolean>(false);

  return (
    <div className='mb-4'>
      <label className='block text-sm font-medium text-gray-900 dark:text-white'>
        {_label}
      </label>
      <button
        className='btn btn-neutral btn-small flex gap-1'
        type='button'
        onClick={() => setDropDown((prev) => !prev)}
        aria-label='model'
      >
        {_model}
        <DownChevronArrow />
      </button>
      <div
        id='dropdown'
        className={`${
          dropDown ? '' : 'hidden'
        } absolute top-100 bottom-100 z-10 bg-white rounded-lg shadow-xl border-b border-black/10 dark:border-gray-900/50 text-gray-800 dark:text-gray-100 group dark:bg-gray-800 opacity-90`}
      >
        <ul
          className='text-sm text-gray-700 dark:text-gray-200 p-0 m-0'
          aria-labelledby='dropdownDefaultButton'
        >
          {modelOptions.map((m) => (
            <li
              className='px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer'
              onClick={() => {
                _setModel(m);
                setDropDown(false);
              }}
              key={m}
            >
              {m}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const MaxTokenSlider = ({
  _maxToken,
  _setMaxToken,
  _model,
}: {
  _maxToken: number;
  _setMaxToken: React.Dispatch<React.SetStateAction<number>>;
  _model: ModelOptions;
}) => {
  const { t } = useTranslation('model');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef &&
      inputRef.current &&
      _setMaxToken(Number(inputRef.current.value));
  }, [_model]);

  return (
    <div>
      <label className='block text-sm font-medium text-gray-900 dark:text-white'>
        {t('token.label')}: {_maxToken}
      </label>
      <input
        type='range'
        ref={inputRef}
        value={_maxToken}
        onChange={(e) => {
          _setMaxToken(Number(e.target.value));
        }}
        min={0}
        max={modelMaxToken[_model]}
        step={1}
        className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
      />
      <div className='min-w-fit text-gray-500 dark:text-gray-300 text-sm mt-2'>
        {t('token.description')}
      </div>
    </div>
  );
};

export const TemperatureSlider = ({
  _temperature,
  _setTemperature,
}: {
  _temperature: number;
  _setTemperature: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const { t } = useTranslation('model');

  return (
    <div className='mt-5 pt-5 border-t border-gray-500'>
      <label className='block text-sm font-medium text-gray-900 dark:text-white'>
        {t('temperature.label')}: {_temperature}
      </label>
      <input
        id='default-range'
        type='range'
        value={_temperature}
        onChange={(e) => {
          _setTemperature(Number(e.target.value));
        }}
        min={0}
        max={2}
        step={0.1}
        className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
      />
      <div className='min-w-fit text-gray-500 dark:text-gray-300 text-sm mt-2'>
        {t('temperature.description')}
      </div>
    </div>
  );
};

export const TopPSlider = ({
  _topP,
  _setTopP,
}: {
  _topP: number;
  _setTopP: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const { t } = useTranslation('model');

  return (
    <div className='mt-5 pt-5 border-t border-gray-500'>
      <label className='block text-sm font-medium text-gray-900 dark:text-white'>
        {t('topP.label')}: {_topP}
      </label>
      <input
        id='default-range'
        type='range'
        value={_topP}
        onChange={(e) => {
          _setTopP(Number(e.target.value));
        }}
        min={0}
        max={1}
        step={0.05}
        className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
      />
      <div className='min-w-fit text-gray-500 dark:text-gray-300 text-sm mt-2'>
        {t('topP.description')}
      </div>
    </div>
  );
};

export const PresencePenaltySlider = ({
  _presencePenalty,
  _setPresencePenalty,
}: {
  _presencePenalty: number;
  _setPresencePenalty: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const { t } = useTranslation('model');

  return (
    <div className='mt-5 pt-5 border-t border-gray-500'>
      <label className='block text-sm font-medium text-gray-900 dark:text-white'>
        {t('presencePenalty.label')}: {_presencePenalty}
      </label>
      <input
        id='default-range'
        type='range'
        value={_presencePenalty}
        onChange={(e) => {
          _setPresencePenalty(Number(e.target.value));
        }}
        min={-2}
        max={2}
        step={0.1}
        className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
      />
      <div className='min-w-fit text-gray-500 dark:text-gray-300 text-sm mt-2'>
        {t('presencePenalty.description')}
      </div>
    </div>
  );
};

export const FrequencyPenaltySlider = ({
  _frequencyPenalty,
  _setFrequencyPenalty,
}: {
  _frequencyPenalty: number;
  _setFrequencyPenalty: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const { t } = useTranslation('model');

  return (
    <div className='mt-5 pt-5 border-t border-gray-500'>
      <label className='block text-sm font-medium text-gray-900 dark:text-white'>
        {t('frequencyPenalty.label')}: {_frequencyPenalty}
      </label>
      <input
        id='default-range'
        type='range'
        value={_frequencyPenalty}
        onChange={(e) => {
          _setFrequencyPenalty(Number(e.target.value));
        }}
        min={-2}
        max={2}
        step={0.1}
        className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
      />
      <div className='min-w-fit text-gray-500 dark:text-gray-300 text-sm mt-2'>
        {t('frequencyPenalty.description')}
      </div>
    </div>
  );
};

export default ConfigMenu;
