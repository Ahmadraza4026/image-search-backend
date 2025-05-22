import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

router.get('/trending-keywords', async (req, res) => {
  try {
    const response = await axios.get('https://api.unsplash.com/topics', {
      params: { per_page: 10 },
      headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` }
    });

    // Map topic titles to keywords array
    const keywords = response.data.map(topic => topic.title);

    res.json({ keywords });
  } catch (error) {
    console.error('Error fetching trending keywords:', error.message);
    res.status(500).json({ message: 'Failed to fetch trending keywords' });
  }
});

export default router;
