import { createApi } from 'unsplash-js';
import 'dotenv/config';

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY,
});

// get a random photo from unsplash
export default async function handler(req, res) {
  try {
    const result = await unsplash.photos.getRandom({
      orientation: 'landscape',
    });
    if (result && result.status === 200) {
      res.status(200).send(result.response);
    } else {
      res.status(result.status).send(result);
    }
  } catch (error) {
    res.status(500).send({ error: error.message || 'internal server error' });
  }
}
