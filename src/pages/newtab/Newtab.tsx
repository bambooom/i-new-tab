import { createApi } from 'unsplash-js';
import { useEffect, useState } from 'react';
import logo from '@assets/img/logo.svg';
import '@pages/newtab/Newtab.css';
import '@pages/newtab/Newtab.scss';
import useStorage from '@src/shared/hooks/useStorage';
import exampleThemeStorage from '@src/shared/storages/exampleThemeStorage';
import bgStorage from '@root/src/shared/storages/bg';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';

const Newtab = () => {
  const theme = useStorage(exampleThemeStorage);
  const curBgStorage = useStorage(bgStorage);
  const [bgUrl, setBgUrl] = useState(curBgStorage?.url);
  const bgUpdated = curBgStorage?.updated;
  const browserApi = createApi({
    apiUrl: 'https://unsplash-proxy-bambooom.vercel.app/api',
  });
  useEffect(() => {
    // updated less than 1 hour
    if (bgUpdated && Date.now() - bgUpdated < 60 * 60 * 1000 && bgUrl) {
      return;
    }
    browserApi.photos
      .getRandom({
        orientation: 'landscape',
      })
      .then(result => {
        if (result && result.status === 200 && result.response) {
          console.log(result.response);
          if (!Array.isArray(result.response)) {
            setBgUrl(result.response.urls.regular);
            bgStorage.set({
              id: result.response.id,
              url: result.response.urls.regular,
              updated: Date.now(),
            });
          }
        }
      });
  }, []);

  return (
    <div
      className="App"
      style={{
        backgroundColor: theme === 'light' ? '#ffffff' : '#000000',
        backgroundImage: `url(${bgUrl})`,
      }}>
      <header className="App-header" style={{ color: theme === 'light' ? '#000' : '#fff' }}>
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/pages/newtab/Newtab.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: theme === 'light' && '#0281dc', marginBottom: '10px' }}>
          Learn React!
        </a>
        <h6>The color of this paragraph is defined using SASS.</h6>
        <button
          style={{
            backgroundColor: theme === 'light' ? '#fff' : '#000',
            color: theme === 'light' ? '#000' : '#fff',
          }}
          onClick={exampleThemeStorage.toggle}>
          Toggle theme
        </button>
      </header>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Newtab, <div> Loading ... </div>), <div> Error Occur </div>);
