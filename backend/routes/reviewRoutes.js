const express = require('express');
const router = express.Router();
const { createReview, getMovieReviews, getRecentReviews, likeReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/recent', getRecentReviews);
router.get('/movie/:movieId', getMovieReviews);
router.post('/', protect, createReview);
router.put('/:id/like', protect, likeReview);

module.exports = router;
