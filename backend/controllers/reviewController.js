const Review = require('../models/Review');

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { movieId, movieTitle, moviePoster, rating, reviewText, spoilerTag } = req.body;

    const review = await Review.create({
      user: req.user.id,
      movieId,
      movieTitle,
      moviePoster,
      rating,
      reviewText,
      spoilerTag,
    });

    res.status(201).json(review);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this movie' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reviews for a movie
// @route   GET /api/reviews/movie/:movieId
// @access  Public
exports.getMovieReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ movieId: req.params.movieId })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recent reviews (social feed)
// @route   GET /api/reviews/recent
// @access  Public
exports.getRecentReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like/Unlike a review
// @route   PUT /api/reviews/:id/like
// @access  Private
exports.likeReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.likes.includes(req.user.id)) {
      review.likes = review.likes.filter(id => id.toString() !== req.user.id);
    } else {
      review.likes.push(req.user.id);
    }

    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
