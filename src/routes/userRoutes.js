import express from 'express';
import bcrypt from 'bcryptjs';
import authMiddleware from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

// ✅ Get full account info (for account page)
router.get('/account', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshToken -resetToken -resetTokenExpiration');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (err) {
    console.error('Account fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch account info' });
  }
});

// Optional: Get minimal user info
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('username email');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (err) {
    console.error('User fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch user info' });
  }
});

// Update password (authenticated)
router.put('/update-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Update password error:', err);
    res.status(500).json({ message: 'Error updating password' });
  }
});

export default router;
