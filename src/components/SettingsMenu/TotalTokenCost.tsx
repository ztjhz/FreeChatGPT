import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import useStore from '@store/store';

import Toggle from '@components/Toggle/Toggle';

import CalculatorIcon from '@icon/CalculatorIcon';
import { modelCost } from '@constants/modelLoader';
import { TotalTokenUsed } from '@type/chat';
import { ModelOptions } from '@utils/modelReader';

type CostMapping = { model: string; cost: number }[];

const tokenCostToCost = (
  tokenCost: TotalTokenUsed[ModelOptions],
  model: ModelOptions
) => {
  if (!tokenCost) return 0;

  const modelCostEntry = modelCost[model as keyof typeof modelCost];

  if (!modelCostEntry) {
    return -1; // Return -1 if the model does not exist in modelCost
  }

  const { prompt, completion, image } = modelCostEntry;
  const completionCost =
    (completion.price / completion.unit) * tokenCost.completionTokens;
    const promptCost = (prompt.price / prompt.unit) * tokenCost.promptTokens;
    const imageCost = (image.price / image.unit) * tokenCost.imageTokens;
  return completionCost + promptCost + imageCost;
};

const TotalTokenCost = () => {
  const { t } = useTranslation(['main', 'model']);

  const totalTokenUsed = useStore((state) => state.totalTokenUsed);
  const setTotalTokenUsed = useStore((state) => state.setTotalTokenUsed);
  const countTotalTokens = useStore((state) => state.countTotalTokens);

  const [costMapping, setCostMapping] = useState<CostMapping>([]);

  const resetCost = () => {
    setTotalTokenUsed({});
  };

  useEffect(() => {
    const updatedCostMapping: CostMapping = [];
    Object.entries(totalTokenUsed).forEach(([model, tokenCost]) => {
      const cost = tokenCostToCost(tokenCost, model as ModelOptions);
      updatedCostMapping.push({ model, cost });
    });

    setCostMapping(updatedCostMapping);
  }, [totalTokenUsed]);

  return countTotalTokens ? (
    <div className='flex flex-col items-center gap-2'>
      <div className='relative overflow-x-auto shadow-md sm:rounded-lg'>
        <table className='w-full text-sm text-left text-gray-500 dark:text-gray-400'>
          <thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
            <tr>
              <th className='px-4 py-2'>{t('model', { ns: 'model' })}</th>
              <th className='px-4 py-2'>USD</th>
            </tr>
          </thead>
          <tbody>
            {costMapping.map(({ model, cost }) => (
              <tr
                key={model}
                className='bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              >
                <td className='px-4 py-2'>{model}</td>
                <td className='px-4 py-2'>{cost.toPrecision(3)}</td>
              </tr>
            ))}
            <tr className='bg-white border-b dark:bg-gray-800 dark:border-gray-700 font-bold'>
              <td className='px-4 py-2'>{t('total', { ns: 'main' })}</td>
              <td className='px-4 py-2'>
                {costMapping
                  .reduce((prev, curr) => prev + curr.cost, 0)
                  .toPrecision(3)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className='btn btn-neutral cursor-pointer' onClick={resetCost}>
        {t('resetCost', { ns: 'main' })}
      </div>
    </div>
  ) : (
    <></>
  );
};

export const TotalTokenCostToggle = () => {
  const { t } = useTranslation('main');

  const setCountTotalTokens = useStore((state) => state.setCountTotalTokens);

  const [isChecked, setIsChecked] = useState<boolean>(
    useStore.getState().countTotalTokens
  );

  useEffect(() => {
    setCountTotalTokens(isChecked);
  }, [isChecked]);

  return (
    <Toggle
      label={t('countTotalTokens') as string}
      isChecked={isChecked}
      setIsChecked={setIsChecked}
    />
  );
};

export const TotalTokenCostDisplay = () => {
  const { t } = useTranslation();
  const totalTokenUsed = useStore((state) => state.totalTokenUsed);

  const [totalCost, setTotalCost] = useState<number>(0);

  useEffect(() => {
    let updatedTotalCost = 0;
    Object.entries(totalTokenUsed).forEach(([model, tokenCost]) => {
      updatedTotalCost += tokenCostToCost(tokenCost, model as ModelOptions);
    });

    setTotalCost(updatedTotalCost);
  }, [totalTokenUsed]);

  return (
    <a className='flex py-2 px-2 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white text-sm'>
      <CalculatorIcon />
      {`USD ${totalCost.toPrecision(3)}`}
    </a>
  );
};

export default TotalTokenCost;
