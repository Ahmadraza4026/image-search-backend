import './config/env.js';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import authMiddleware from './middleware/authMiddleware.js';
import favoritesRoutes from './routes/favoritesRoutes.js';
import unsplashRoutes from './routes/unsplash.js';
import searchRoutes from './routes/search.js';
import trendingRoutes from './routes/trendingRoutes.js';
import pexelsRoutes from './routes/pexelsRoutes.js';

const app = express();

// Allow both localhost and deployed frontend origin
const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);
app.use('/api', unsplashRoutes);
app.use('/api', trendingRoutes);
app.use('/api/pexels', pexelsRoutes);

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ msg: 'Welcome to the protected route', user: req.user });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
