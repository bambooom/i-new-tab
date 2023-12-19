import { colord } from 'colord';
import { createApi } from 'unsplash-js';
import { useEffect, useState } from 'react';
// import '@pages/newtab/Newtab.css';
import '@pages/newtab/Newtab.scss';
import useStorage from '@src/shared/hooks/useStorage';
import themeStorage from '@root/src/shared/storages/theme';
import bgStorage from '@root/src/shared/storages/bg';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';

const Newtab = () => {
  const theme = useStorage(themeStorage);
  const curBgStorage = useStorage(bgStorage);
  const [bgUrl, setBgUrl] = useState(curBgStorage?.url);
  const [bgDescription, setBgDescription] = useState(curBgStorage?.description);
  const [author, setAuthor] = useState(curBgStorage?.author);
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
          if (!Array.isArray(result.response)) {
            if (colord(result.response.color).isLight()) {
              themeStorage.set('light');
            } else {
              themeStorage.set('dark');
            }
            setBgUrl(result.response.urls.regular);
            setBgDescription(result.response.description);
            setAuthor({
              name: result.response.user.name,
              id: result.response.user.username,
            });
            bgStorage.set({
              id: result.response.id,
              url: result.response.urls.regular,
              description: result.response.description,
              author: {
                name: result.response.user.name,
                id: result.response.user.username, // https://unsplash.com/@{username}
              },
              updated: Date.now(),
            });
          }
        }
      });
  }, []);

  return (
    <div className="int-container">
      <div className="int-bg">{bgUrl && <img src={bgUrl} alt={bgDescription} />}</div>
      <header className="int-header">
        <p style={{ color: theme === 'light' && '#0281dc', marginBottom: '10px' }}> Header </p>
      </header>
      <footer className="int-footer">
        <div>
          {' '}
          photo by
          {author && (
            <a className="int-author" href={`https://unsplash.com/@${author?.id}`} target="_blank" rel="noreferrer">
              {author?.name}
            </a>
          )}
        </div>
        <div className="int-download-link">
          <a href={bgUrl} title="Download Photo" download>
            Download
          </a>
        </div>
      </footer>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Newtab, <div> Loading ... </div>), <div> Error Occur </div>);
