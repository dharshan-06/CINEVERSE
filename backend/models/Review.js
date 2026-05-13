const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  movieId: {
    type: Number, // TMDB ID
    required: true,
  },
  movieTitle: {
    type: String,
    required: true,
  },
  moviePoster: {
    type: String,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please add a rating between 1 and 5'],
  },
  reviewText: {
    type: String,
    required: [true, 'Please add some text'],
  },
  likes: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  }],
  spoilerTag: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Prevent user from submitting more than one review per movie
reviewSchema.index({ movieId: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
