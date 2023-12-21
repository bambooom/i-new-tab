import { colord } from 'colord';
import { createApi } from 'unsplash-js';
import { fetchWeatherApi } from 'openmeteo';
import { useEffect, useState } from 'react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import '@pages/newtab/Newtab.scss';
import logo from '@assets/img/logo.png';
import useStorage from '@src/shared/hooks/useStorage';
import themeStorage from '@root/src/shared/storages/theme';
import bgStorage from '@root/src/shared/storages/bg';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';

const WeatherUrl = 'https://api.open-meteo.com/v1/forecast';
// Helper function to form time ranges
const range = (start: number, stop: number, step: number) =>
  Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

const timeFormatter = (date: number) => {
  const t = new Date(date);
  return `${t.getMonth() + 1}-${t.getDate()} ${t.getHours()}:00`;
};

const tooltipFormatter = (value: number, name: string) => {
  return [value + '°C', name.charAt(0).toUpperCase() + name.slice(1)];
};
const Newtab = () => {
  const [lat, setLat] = useState<number>();
  const [long, setLong] = useState<number>();
  const [chartData, setChartData] = useState<{ time: number; temperature: number }[]>([]);
  // const theme = useStorage(themeStorage);
  const curBgStorage = useStorage(bgStorage);
  const [bgUrl, setBgUrl] = useState(curBgStorage?.url);
  const [bgDescription, setBgDescription] = useState(curBgStorage?.description);
  const [author, setAuthor] = useState(curBgStorage?.author);
  const bgUpdated = curBgStorage?.updated;
  const browserApi = createApi({
    apiUrl: 'https://unsplash-proxy-bambooom.vercel.app/api',
  });

  useEffect(() => {
    // get current location's latitude and longitude
    // it will ask for permission first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        setLat(position.coords.latitude);
        setLong(position.coords.longitude);
      });
    } else {
      console.log('Geolocation is not supported by this browser.');
    }
    // updated less than 10 minutes
    if (bgUpdated && Date.now() - bgUpdated < 60 * 10 * 1000 && bgUrl) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!lat || !long) return;
    const params = {
      latitude: lat,
      longitude: long,
      hourly: 'temperature_2m',
      timezone: 'auto',
    };

    fetchWeatherApi(WeatherUrl, params).then(res => {
      const response = res[0];
      const utcOffsetSeconds = response.utcOffsetSeconds();

      const hourly = response.hourly()!;
      const labels = range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval());
      const values = Array.from(hourly.variables(0)!.valuesArray()!);
      setChartData(
        labels.map((t, i) => ({ time: (t + utcOffsetSeconds) * 1000, temperature: Number(values[i].toFixed(1)) })),
      );
    });
  }, [lat, long]);

  return (
    <div className="int-container">
      <div className="int-bg">{bgUrl && <img src={bgUrl} alt={bgDescription} />}</div>
      <header className="int-header">
        {/* <p style={{ color: theme === 'light' && '#0281dc', marginBottom: '10px' }}> Header </p> */}
        <img src={logo} className="int-logo" alt="logo" />
      </header>
      <div className="int-body">
        <div className="int-weather-container">
          <div className="weather-chart">
            <h3 className="weather-chart-title">Weather Forecast</h3>
            <AreaChart width={730} height={320} data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTemperature" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                angle={-20}
                scale="time"
                type="number"
                domain={['dataMin - 1000000', 'dataMax + 1000000']}
                tickFormatter={timeFormatter}
              />
              <YAxis unit="°C" label={{ value: 'Temperature', angle: -90, position: 'insideLeft' }} />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip formatter={tooltipFormatter} labelFormatter={timeFormatter} />
              <Area
                type="monotone"
                dataKey="temperature"
                stroke="#8884d8"
                fillOpacity={1}
                fill="url(#colorTemperature)"
              />
            </AreaChart>
          </div>
        </div>
      </div>
      <footer className="int-footer">
        <div>
          {' '}
          by
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
