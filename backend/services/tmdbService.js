const axios = require('axios');

const tmdbClient = axios.create({
  baseURL: 'https://api.tmdb.org/3',
  timeout: 10000, // 10 seconds timeout
  params: {
    api_key: process.env.TMDB_API_KEY,
  },
});

const getTrendingMovies = async (timeWindow = 'day') => {
  const response = await tmdbClient.get(`/trending/movie/${timeWindow}`);
  return response.data;
};

const getMovieDetails = async (movieId) => {
  const response = await tmdbClient.get(`/movie/${movieId}`, {
    params: {
      append_to_response: 'videos,credits,recommendations,similar',
    },
  });
  return response.data;
};

const searchMulti = async (query, page = 1) => {
  const response = await tmdbClient.get('/search/multi', {
    params: {
      query,
      page,
      include_adult: false,
    },
  });
  return response.data;
};

const searchPerson = async (query) => {
  const response = await tmdbClient.get('/search/person', {
    params: {
      query,
      include_adult: false,
    },
  });
  return response.data;
};

const getMoviesByGenre = async (genreId, page = 1) => {
  const response = await tmdbClient.get('/discover/movie', {
    params: {
      with_genres: genreId,
      page,
      sort_by: 'popularity.desc',
    },
  });
  return response.data;
};

const getUpcomingMovies = async () => {
  const response = await tmdbClient.get('/movie/upcoming');
  return response.data;
};

const getTopRatedMovies = async () => {
  const response = await tmdbClient.get('/movie/top_rated');
  return response.data;
};

const getGenres = async () => {
  const response = await tmdbClient.get('/genre/movie/list');
  return response.data;
};

const getLanguages = async () => {
  const response = await tmdbClient.get('/configuration/languages');
  return response.data;
};

const discoverMovies = async (filters = {}) => {
  try {
    const cineversePage = parseInt(filters.page) || 1;
    const tmdbStartPage = (cineversePage - 1) * 6 + 1;
    
    // Fetch 6 pages in parallel to get 120 results (6 * 20 = 120)
    const requests = Array.from({ length: 6 }, (_, i) => {
      const params = {
        sort_by: 'popularity.desc',
        page: tmdbStartPage + i,
      };

      if (filters.genre) params.with_genres = filters.genre;
      if (filters.year) params.primary_release_year = filters.year;
      if (filters.language) params.with_original_language = filters.language;
      if (filters.cast) params.with_cast = filters.cast;
      if (filters.crew) params.with_crew = filters.crew;
      if (filters.people) params.with_people = filters.people;

      return tmdbClient.get('/discover/movie', { params });
    });

    const responses = await Promise.all(requests);
    
    // Aggregate results
    const allResults = responses.flatMap(res => res.data.results);
    const firstResponse = responses[0].data;

    return {
      page: cineversePage,
      results: allResults,
      total_results: firstResponse.total_results,
      total_pages: Math.ceil(firstResponse.total_pages / 6),
    };
  } catch (error) {
    console.error('TMDB Discover Error:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = {
  getTrendingMovies,
  getMovieDetails,
  searchMulti,
  getMoviesByGenre,
  getUpcomingMovies,
  getTopRatedMovies,
  getGenres,
  getLanguages,
  discoverMovies,
  searchPerson,
};
