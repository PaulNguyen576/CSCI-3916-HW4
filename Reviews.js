var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const DB_URI = process.env.MONGODB_URI || process.env.DB;
if (!mongoose.connection.readyState) {
    mongoose.connect(DB_URI).catch(() => {});
}

// Movie schema
var ReviewSchema = new Schema({
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    username: { type: String, required: true },
    review: { type: String, required: true },
    rating: { type: Number, min: 0, max: 5, required: true }
}, { collection: 'Reviews' });

// return the model
module.exports = mongoose.model('Review', ReviewSchema);