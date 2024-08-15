import React, { useEffect, useMemo, useState } from 'react';
import useStore from '@store/store';
import { shallow } from 'zustand/shallow';

import countTokens from '@utils/messageUtils';
import { modelCost } from '@constants/modelLoader';
import { TotalTokenUsed, isTextContent, isImageContent } from '@type/chat';
import { ModelOptions } from '@utils/modelReader';

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
  const imageCost =
    image && tokenCost.imageTokens
      ? (image.price / image.unit) * (tokenCost.imageTokens ? 1 : 0)
      : 0;

  return completionCost + promptCost + imageCost;
};

const TokenCount = React.memo(() => {
  const [tokenCount, setTokenCount] = useState<number>(0);
  const [imageTokenCount, setImageTokenCount] = useState<number>(0);
  const generating = useStore((state) => state.generating);
  const messages = useStore(
    (state) =>
      state.chats ? state.chats[state.currentChatIndex].messages : [],
    shallow
  );

  const model = useStore((state) =>
    state.chats
      ? state.chats[state.currentChatIndex].config.model
      : 'gpt-3.5-turbo'
  );

  const cost = useMemo(() => {
    const tokenCost: TotalTokenUsed[ModelOptions] = {
      promptTokens: tokenCount,
      completionTokens: 0,
      imageTokens: imageTokenCount,
    };
    const price = tokenCostToCost(tokenCost, model as ModelOptions);
    return price.toPrecision(3);
  }, [model, tokenCount, imageTokenCount]);

  useEffect(() => {
    if (!generating) {
      const textPrompts = messages.filter((e) => e.content.some(isTextContent));
      const imgPrompts = messages.filter((e) => e.content.some(isImageContent));
      const newPromptTokens = countTokens(textPrompts, model);
      const newImageTokens = countTokens(imgPrompts, model);
      setTokenCount(newPromptTokens);
      setImageTokenCount(newImageTokens);
    }
  }, [messages, generating, model]);

  return (
    <div className='absolute top-[-16px] right-0'>
      <div className='text-xs italic text-gray-900 dark:text-gray-300'>
        Tokens: {tokenCount} (${cost})
      </div>
    </div>
  );
});

export default TokenCount;
