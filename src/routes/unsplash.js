// src/routes/unsplashRoutes.js
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const unsplashApi = axios.create({
  baseURL: 'https://api.unsplash.com',
  headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
});

// GET /api/search?query=...&orientation=...&color=...&page=...&per_page=...
router.get('/search', async (req, res) => {
  const { query, orientation, color, page = 1, per_page = 10 } = req.query;

  if (!query) return res.status(400).json({ message: 'Query parameter is required' });

  try {
    const response = await unsplashApi.get('/search/photos', {
      params: { query, orientation, color, page, per_page },
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching Unsplash data', error: err.message });
  }
});

// GET /api/trending - returns random photos as "trending"
router.get('/trending', async (req, res) => {
  try {
    const response = await unsplashApi.get('/photos/random', {
      params: { count: 20 },
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch trending images', error: err.message });
  }
});

export default router;
