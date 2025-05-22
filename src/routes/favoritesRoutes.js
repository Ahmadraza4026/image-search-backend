import express from 'express';
import mongoose from 'mongoose';
import Favorite from '../models/favorite.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

router.get('/', authMiddleware, async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user.id });
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching favorites', error: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const { imageId, media } = req.body;
  if (!imageId || !media || !media.type) {
    return res.status(400).json({ message: 'imageId and media object with type are required' });
  }

  // Validate media.type is 'image' or 'video'
  if (!['image', 'video'].includes(media.type)) {
    return res.status(400).json({ message: "media.type must be either 'image' or 'video'" });
  }

  try {
    const exists = await Favorite.findOne({ userId: req.user.id, imageId });
    if (exists) return res.status(409).json({ message: 'Favorite already exists' });

    const favorite = new Favorite({ userId: req.user.id, imageId, media });
    await favorite.save();

    res.status(201).json(favorite);
  } catch (err) {
    res.status(500).json({ message: 'Error saving favorite', error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid favorite ID' });
  }

  try {
    const deleted = await Favorite.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ message: 'Favorite not found or unauthorized' });

    res.json({ message: 'Favorite removed' });
  } catch (err) {
    res.status(500).json({ message: 'Error removing favorite', error: err.message });
  }
});

export default router;
