import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user');
    if (user) {
      const { token } = JSON.parse(user);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const movieApi = {
  getTrending: () => api.get('/movies/trending').then(res => res.data),
  getDetails: (id) => api.get(`/movies/${id}`).then(res => res.data),
  search: (query) => api.get(`/movies/search?q=${query}`).then(res => res.data),
  getByGenre: (id) => api.get(`/movies/genre/${id}`).then(res => res.data),
  getGenres: () => api.get('/movies/genres').then(res => res.data),
  getLanguages: () => api.get('/movies/languages').then(res => res.data),
  discover: (params) => {
    // Filter out empty or null parameters
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== '')
    );
    return api.get('/movies/discover', { params: cleanParams }).then(res => res.data);
  },
  searchPerson: (query) => api.get(`/movies/search/person?q=${query}`).then(res => res.data),
};

export const reviewApi = {
  getMovieReviews: (movieId) => api.get(`/reviews/movie/${movieId}`).then(res => res.data),
  getRecent: () => api.get('/reviews/recent').then(res => res.data),
  create: (data) => api.post('/reviews', data).then(res => res.data),
  like: (id) => api.put(`/reviews/${id}/like`).then(res => res.data),
};

export const userApi = {
  addToWatchlist: (movieId) => api.post(`/users/watchlist/${movieId}`).then(res => res.data),
  removeFromWatchlist: (movieId) => api.delete(`/users/watchlist/${movieId}`).then(res => res.data),
  addToFavorites: (movieId) => api.post(`/users/favorites/${movieId}`).then(res => res.data),
  removeFromFavorites: (movieId) => api.delete(`/users/favorites/${movieId}`).then(res => res.data),
  getProfile: (id) => api.get(`/users/${id}`).then(res => res.data),
  updateProfile: (data) => api.put('/users/update', data).then(res => res.data),
};

export default api;
