import express from 'express';
import axios from 'axios';

const router = express.Router();

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

router.get('/', async (req, res) => {
  const {
    query,
    orientation = '',
    color = '',
    width = '',
    page = 1,
    per_page = 12,
    type = 'images',
  } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const endpoint = type === 'videos' ? '/search/videos' : '/search/photos';

  try {
    const response = await axios.get(`https://api.unsplash.com${endpoint}`, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
      params: {
        query,
        orientation,
        color,
        width,
        page,
        per_page,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching search data from Unsplash:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch data from Unsplash.' });
  }
});

export default router;
