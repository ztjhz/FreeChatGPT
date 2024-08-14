import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useStore from '@store/store';
import Toggle from '@components/Toggle';
import { ModelSelector } from '@components/ConfigMenu/ConfigMenu';
import { ModelOptions } from '@utils/modelReader';

const AutoTitleToggle = () => {
  const { t } = useTranslation(['main', 'model']);

  const setAutoTitle = useStore((state) => state.setAutoTitle);
  const setTitleModel = useStore((state) => state.setTitleModel);
  const [_model, _setModel] = useState<ModelOptions>(useStore.getState().titleModel);

  const [isChecked, setIsChecked] = useState<boolean>(
    useStore.getState().autoTitle
  );

  useEffect(() => {
    setAutoTitle(isChecked);
  }, [isChecked]);

  useEffect(() => {
    setTitleModel(_model);
  }, [_model]);

  return (<>
    <Toggle
      label={t('autoTitle') as string}
      isChecked={isChecked}
      setIsChecked={setIsChecked}
    />
    {isChecked ? <ModelSelector _model={_model} _setModel={_setModel} _label={t('modelTitleGeneration',{ ns:'model'})} />
         : ''}</>
  );
};

export default AutoTitleToggle;
