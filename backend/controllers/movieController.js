const tmdbService = require('../services/tmdbService');

// @desc    Get trending movies
// @route   GET /api/movies/trending
// @access  Public
exports.getTrending = async (req, res) => {
  try {
    const data = await tmdbService.getTrendingMovies();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get movie details
// @route   GET /api/movies/:id
// @access  Public
exports.getDetails = async (req, res) => {
  try {
    const data = await tmdbService.getMovieDetails(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search movies, actors, etc.
// @route   GET /api/movies/search
// @access  Public
exports.search = async (req, res) => {
  try {
    const { q, page } = req.query;
    const data = await tmdbService.searchMulti(q, page);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get movies by genre
// @route   GET /api/movies/genre/:id
// @access  Public
exports.getByGenre = async (req, res) => {
  try {
    const data = await tmdbService.getMoviesByGenre(req.params.id, req.query.page);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get all genres
// @route   GET /api/movies/genres
exports.getGenres = async (req, res) => {
  try {
    const data = await tmdbService.getGenres();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all languages
// @route   GET /api/movies/languages
exports.getLanguages = async (req, res) => {
  try {
    const data = await tmdbService.getLanguages();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Discover movies with filters
// @route   GET /api/movies/discover
exports.discover = async (req, res) => {
  try {
    const data = await tmdbService.discoverMovies(req.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search for people (actors, directors)
// @route   GET /api/movies/search/person
exports.searchPerson = async (req, res) => {
  try {
    const data = await tmdbService.searchPerson(req.query.q);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
