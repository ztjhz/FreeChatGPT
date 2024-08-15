import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PopupModal from '@components/PopupModal';
import { ConfigInterface, ImageDetail } from '@type/chat';
import Select from 'react-select';
import { modelOptions, modelMaxToken } from '@constants/modelLoader';
import { ModelOptions } from '@utils/modelReader';

const ConfigMenu = ({
  setIsModalOpen,
  config,
  setConfig,
  imageDetail,
  setImageDetail,
}: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  config: ConfigInterface;
  setConfig: (config: ConfigInterface) => void;
  imageDetail: ImageDetail;
  setImageDetail: (imageDetail: ImageDetail) => void;
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
  const [_imageDetail, _setImageDetail] = useState<ImageDetail>(imageDetail);
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
    setImageDetail(_imageDetail);
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
        <ImageDetailSelector
          _imageDetail={_imageDetail}
          _setImageDetail={_setImageDetail}
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
  const { t } = useTranslation('model');

  const modelOptionsFormatted = modelOptions.map((model) => ({
    value: model,
    label: model,
  }));
  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: '#2D3748', // Dark background color
      color: '#E2E8F0', // Light text color
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: '#2D3748', // Dark background color
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      'backgroundColor': state.isSelected ? '#4A5568' : '#2D3748', // Darker background for selected option
      'color': '#E2E8F0', // Light text color
      '&:hover': {
        backgroundColor: '#4A5568', // Darker background on hover
      },
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: '#E2E8F0', // Light text color
    }),
    input: (provided: any) => ({
      ...provided,
      color: '#E2E8F0', // Light text color for input
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#A0AEC0', // Light gray color for placeholder
    }),
  };

  return (
    <div className='mb-4'>
      <label className='block text-sm font-medium text-gray-900 dark:text-white'>
        {_label}
      </label>
      <Select
        value={{ value: _model, label: _model }}
        onChange={(selectedOption) =>
          _setModel(selectedOption?.value as ModelOptions)
        }
        options={modelOptionsFormatted}
        className='basic-single'
        classNamePrefix='select'
        styles={customStyles}
      />
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

export const ImageDetailSelector = ({
  _imageDetail,
  _setImageDetail,
}: {
  _imageDetail: ImageDetail;
  _setImageDetail: React.Dispatch<React.SetStateAction<ImageDetail>>;
}) => {
  const { t } = useTranslation('model');

  const imageDetailOptions = [
    { value: 'low', label: t('imageDetail.low') },
    { value: 'high', label: t('imageDetail.high') },
    { value: 'auto', label: t('imageDetail.auto') },
  ];

  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: '#2D3748', // Dark background color
      color: '#E2E8F0', // Light text color
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: '#2D3748', // Dark background color
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      'backgroundColor': state.isSelected ? '#4A5568' : '#2D3748', // Darker background for selected option
      'color': '#E2E8F0', // Light text color
      '&:hover': {
        backgroundColor: '#4A5568', // Darker background on hover
      },
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: '#E2E8F0', // Light text color
    }),
    input: (provided: any) => ({
      ...provided,
      color: '#E2E8F0', // Light text color for input
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#A0AEC0', // Light gray color for placeholder
    }),
  };

  return (
    <div className='mt-5 pt-5 border-t border-gray-500'>
      <label className='block text-sm font-medium text-gray-900 dark:text-white'>
        {t('imageDetail.label')}
      </label>
      <Select
        value={imageDetailOptions.find(
          (option) => option.value === _imageDetail
        )}
        onChange={(selectedOption) =>
          _setImageDetail(selectedOption?.value as ImageDetail)
        }
        options={imageDetailOptions}
        className='basic-single'
        classNamePrefix='select'
        styles={customStyles}
      />
    </div>
  );
};

export default ConfigMenu;
