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

if (mongoose.models.Review && mongoose.models.Review.collection && mongoose.models.Review.collection.name !== 'reviews') {
  mongoose.deleteModel('Review');
}

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema, 'reviews');

module.exports = Review;