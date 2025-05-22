import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import zxcvbn from 'zxcvbn';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { sendResetPasswordEmail } from '../utils/sendResetPasswordEmail.js';

import User from '../models/User.js';
import { sendVerificationEmail } from '../utils/sendVerificationEmail.js';

const router = express.Router();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Rate limiter for sensitive endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many attempts, try again later'
});

// Register
router.post(
  '/register',
  authLimiter,
  [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('username').notEmpty().withMessage('Username is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { email, password, username } = req.body;

      if (!emailRegex.test(email)) return res.status(400).json({ errors: [{ msg: 'Invalid email format' }] });

      const passwordCheck = zxcvbn(password);
      if (passwordCheck.score < 3) return res.status(400).json({ errors: [{ msg: 'Password too weak' }] });

      const existingEmail = await User.findOne({ email });
      if (existingEmail) return res.status(400).json({ errors: [{ msg: 'Email already in use' }] });

      const existingUsername = await User.findOne({ username });
      if (existingUsername) return res.status(400).json({ errors: [{ msg: 'Username already taken' }] });

      const newUser = new User({ username, email, password });
      await newUser.save();

      const verificationToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
      await sendVerificationEmail(email, verificationToken);

      res.status(201).json({ message: 'Registration successful. Check your email to verify.' });
    } catch (err) {
  console.error('❌ Registration error:', err); // Add this to log full error details
  res.status(500).json({ errors: [{ msg: 'Registration failed. Try again later.' }] });
}
  }
);

// Email Verification
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ errors: [{ msg: 'Missing token' }] });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ errors: [{ msg: 'User not found' }] });

    if (user.isVerified) return res.status(200).json({ message: 'Email already verified.' });

    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully.' });
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(400).json({ errors: [{ msg: 'Token expired' }] });
    if (err.name === 'JsonWebTokenError') return res.status(400).json({ errors: [{ msg: 'Invalid token' }] });
    res.status(500).json({ errors: [{ msg: 'Server error' }] });
  }
});

// Login
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });

      if (!user.isVerified) return res.status(400).json({ errors: [{ msg: 'Verify your email before logging in.' }] });

      const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
      const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });

      user.refreshToken = refreshToken;
      await user.save();

      res.status(200).json({
        accessToken,
        refreshToken,
        user: { username: user.username, email: user.email },
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ errors: [{ msg: 'Login failed. Try again.' }] });
    }
  }
);

// Refresh Token
router.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ errors: [{ msg: 'Refresh token required' }] });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken)
      return res.status(403).json({ errors: [{ msg: 'Invalid refresh token' }] });

    const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
    res.json({ accessToken: newAccessToken });
  } catch {
    res.status(403).json({ errors: [{ msg: 'Invalid refresh token' }] });
  }
});

// Forgot Password
router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ errors: [{ msg: 'Email is required' }] });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ errors: [{ msg: 'User not found' }] });

    const resetToken = crypto.randomBytes(20).toString('hex');
    const expiration = Date.now() + 3600000;

    user.resetToken = resetToken;
    user.resetTokenExpiration = expiration;
    await user.save();

    await sendResetPasswordEmail(email, resetToken);
    res.status(200).json({ message: 'Password reset email sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ errors: [{ msg: 'Could not send reset email.' }] });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ errors: [{ msg: 'Token and password required' }] });

    const passwordCheck = zxcvbn(password);
    if (passwordCheck.score < 3) return res.status(400).json({ errors: [{ msg: 'Password too weak' }] });

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ errors: [{ msg: 'Invalid or expired token' }] });

    user.password = password; // Plain password assigned, pre-save hook will hash it
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    user.refreshToken = undefined; // Invalidate sessions
    await user.save();

    res.status(200).json({ message: 'Password reset successful.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ errors: [{ msg: 'Password reset failed.' }] });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    user.refreshToken = null;
    await user.save();
  }
  res.status(200).json({ message: 'Logged out successfully' });
});

export default router;
