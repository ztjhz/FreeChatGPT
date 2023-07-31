import { useAuth0 } from '@auth0/auth0-react';
import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import ChatPage from './pages/chat';
import SearchPage from './pages/search';
import SearchResultPage from './pages/search/result';
import { CallbackPage } from './pages/callback';
import { CreditPage } from './pages/credit';
import { TransparentHeader } from '@components/Header/transparent';
import { initUser } from '@utils/api';

export const App = () => {
  const { isLoading, getAccessTokenSilently, getIdTokenClaims } = useAuth0();
  const [loadingUser, setLoadingUser] = React.useState(true);
  useEffect(() => {
    (async () => {
      try {
        const access_token = await getAccessTokenSilently();
        const id_token = (await getIdTokenClaims())?.__raw;
        await initUser(access_token, id_token as string);
      } catch (e) {
        console.log(e);
        await initUser();
      }
      setLoadingUser(false);
    })();
  }, [1]);

  if (isLoading || loadingUser) {
    return (
      <div className='flex min-h-full w-full flex-col bg-gray-1000'>
        <div>
          <TransparentHeader />
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path='/' element={<SearchPage />} />
      <Route path='/search/:question' element={<SearchResultPage />} />
      <Route path='/user/credit' element={<CreditPage />} />
      <Route path='/chat' element={<SearchResultPage />} />
      <Route path='/callback' element={<CallbackPage />} />
    </Routes>
  );
};
