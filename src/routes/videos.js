// routes/videos.js
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const unsplashApi = axios.create({
  baseURL: 'https://api.unsplash.com',
  headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
});

const router = express.Router();

router.get('/search', async (req, res) => {
  const { query, page = 1, per_page = 10 } = req.query;

  if (!query) return res.status(400).json({ message: 'Query parameter is required' });
  if (isNaN(page) || isNaN(per_page)) return res.status(400).json({ message: 'Page and per_page must be numbers' });

  try {
    const response = await unsplashApi.get('/search/videos', {
      params: { query, page, per_page },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Videos search error:', error.message);
    res.status(500).json({ message: 'Error fetching videos from Unsplash', error: error.message });
  }
});

export default router;
