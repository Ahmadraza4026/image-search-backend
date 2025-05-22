import express from 'express';
import axios from 'axios';

const router = express.Router();

const PEXELS_API_KEY = process.env.PEXELS_API_KEY; // set this in your .env file

// Proxy route to fetch videos from Pexels API
router.get('/videos/search', async (req, res) => {
  try {
    const { query, page = 1, per_page = 12 } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Missing query parameter' });
    }

    const response = await axios.get('https://api.pexels.com/videos/search', {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
      params: {
        query,
        page,
        per_page,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Pexels API error:', error.message);
    res.status(500).json({ message: 'Failed to fetch videos from Pexels' });
  }
});

export default router;
