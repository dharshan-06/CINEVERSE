const express = require('express');
const router = express.Router();
const { getTrending, getDetails, search, getByGenre, getGenres, getLanguages, discover, searchPerson } = require('../controllers/movieController');

router.get('/trending', getTrending);
router.get('/search/person', searchPerson);
router.get('/search', search);
router.get('/genres', getGenres);
router.get('/languages', getLanguages);
router.get('/discover', discover);
router.get('/genre/:id', getByGenre);
router.get('/:id', getDetails);

module.exports = router;
