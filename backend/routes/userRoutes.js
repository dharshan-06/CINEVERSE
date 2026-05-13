const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  addToWatchlist,
  removeFromWatchlist,
  addToFavorites,
  removeFromFavorites,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:id', getUserProfile);
router.put('/update', protect, updateUserProfile);
router.post('/watchlist/:movieId', protect, addToWatchlist);
router.delete('/watchlist/:movieId', protect, removeFromWatchlist);
router.post('/favorites/:movieId', protect, addToFavorites);
router.delete('/favorites/:movieId', protect, removeFromFavorites);

module.exports = router;
