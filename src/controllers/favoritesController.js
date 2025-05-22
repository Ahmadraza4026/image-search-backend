import Favorite from '../models/favorite.js';

// Get all favorites for a user
export const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const favorites = await Favorite.find({ userId });
    res.status(200).json(favorites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch favorites' });
  }
};

// Add a new favorite with validation and duplicate check
export const addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: 'imageUrl is required' });
    }

    const exists = await Favorite.findOne({ userId, imageUrl });
    if (exists) {
      return res.status(409).json({ message: 'Favorite already exists' });
    }

    const newFavorite = new Favorite({ userId, imageUrl });
    await newFavorite.save();
    res.status(201).json(newFavorite);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add favorite' });
  }
};

// Remove a favorite by ID
export const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const favorite = await Favorite.findOneAndDelete({ _id: id, userId });
    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }
    res.status(200).json({ message: 'Favorite removed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to remove favorite' });
  }
};
