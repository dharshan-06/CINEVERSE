const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/update
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      user.avatar = req.body.avatar || user.avatar;
      user.bio = req.body.bio || user.bio;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add movie to watchlist
// @route   POST /api/users/watchlist/:movieId
// @access  Private
exports.addToWatchlist = async (req, res) => {
  try {
    console.log(`Adding to watchlist: ${req.params.movieId} for user: ${req.user.id}`);
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const movieId = parseInt(req.params.movieId);

    if (user.watchlist.includes(movieId)) {
      return res.status(400).json({ message: 'Movie already in watchlist' });
    }

    user.watchlist.push(movieId);
    await user.save();
    console.log('Watchlist updated successfully');
    res.json(user.watchlist);
  } catch (error) {
    console.error('Watchlist Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove movie from watchlist
// @route   DELETE /api/users/watchlist/:movieId
// @access  Private
exports.removeFromWatchlist = async (req, res) => {
  try {
    console.log(`Removing from watchlist: ${req.params.movieId} for user: ${req.user.id}`);
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const movieId = parseInt(req.params.movieId);

    user.watchlist = user.watchlist.filter(id => id !== movieId);
    await user.save();
    res.json(user.watchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add movie to favorites
// @route   POST /api/users/favorites/:movieId
// @access  Private
exports.addToFavorites = async (req, res) => {
  try {
    console.log(`Adding to favorites: ${req.params.movieId} for user: ${req.user.id}`);
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const movieId = parseInt(req.params.movieId);

    if (user.favoriteMovies.includes(movieId)) {
      user.favoriteMovies = user.favoriteMovies.filter(id => id !== movieId);
    } else if (user.favoriteMovies.length >= 4) {
      user.favoriteMovies.shift();
    }

    user.favoriteMovies.push(movieId);
    await user.save();
    console.log('Favorites updated successfully');
    res.json(user.favoriteMovies);
  } catch (error) {
    console.error('Favorites Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove movie from favorites
// @route   DELETE /api/users/favorites/:movieId
// @access  Private
exports.removeFromFavorites = async (req, res) => {
  try {
    console.log(`Removing from favorites: ${req.params.movieId} for user: ${req.user.id}`);
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const movieId = parseInt(req.params.movieId);

    user.favoriteMovies = user.favoriteMovies.filter(id => id !== movieId);
    await user.save();
    res.json(user.favoriteMovies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
