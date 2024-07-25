import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import useStore from '@store/store';

import Toggle from '@components/Toggle/Toggle';

export const DisplayChatSizeToggle = () => {
  const { t } = useTranslation('main');

  const setDisplayChatSize = useStore((state) => state.setDisplayChatSize);

  const [isChecked, setIsChecked] = useState<boolean>(
    useStore.getState().displayChatSize
  );

  useEffect(() => {
    setDisplayChatSize(isChecked);
  }, [isChecked]);

  return (
    <Toggle
      label={t('displayChatSize') as string}
      isChecked={isChecked}
      setIsChecked={setIsChecked}
    />
  );
};
export default DisplayChatSizeToggle;
