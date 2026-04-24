const mongoose = require('mongoose');

const DB_URI = process.env.MONGODB_URI || process.env.DB;
if (!mongoose.connection.readyState && DB_URI) {
  mongoose.connect(DB_URI).catch(() => {});
}

const reviewSchema = new mongoose.Schema({
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  username: { type: String, required: true },
  review: { type: String, required: true },
  rating: { type: Number, min: 0, max: 5, required: true }
});

// Ensure stale model definitions cannot keep an old collection binding.
if (mongoose.models.Review) {
  mongoose.deleteModel('Review');
}

const Review = mongoose.model('Review', reviewSchema, 'reviews');

module.exports = Review;