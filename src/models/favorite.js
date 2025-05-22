import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    imageId: { type: String, required: true }, // use this as the unique favorite key (image or video ID)

    // Store either image or video info inside "media" object
    media: {
      type: {
        type: String, // 'image' or 'video'
        required: true,
        enum: ['image', 'video'],
      },
      alt_description: String, // alt or description
      urls: {
        small: String,
        regular: String,
        // For videos, you may add more urls if needed
        // e.g. "thumbnail": String, "video_url": String
        thumbnail: String, // for video thumbnail preview
        video_url: String, // direct video URL
      },
      user: {
        name: String,
      },
    },
  },
  { timestamps: true }
);

// Unique compound index: user + imageId (same as before)
favoriteSchema.index({ userId: 1, imageId: 1 }, { unique: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);

export default Favorite;
