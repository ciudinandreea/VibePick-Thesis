import api from './api';

const MOVIES_API = '/movies';

export const getPopularMovies = async (page = 1) => {
  const response = await api.get(`${MOVIES_API}/popular?page=${page}`);
  return response.data;
};

export const searchMovies = async (query, page = 1) => {
  const response = await api.get(`${MOVIES_API}/search?q=${query}&page=${page}`);
  return response.data;
};

export const getMovieDetails = async (movieId) => {
  const response = await api.get(`${MOVIES_API}/${movieId}`);
  return response.data;
};

export const getMoviesByGenre = async (genreId, page = 1) => {
  const response = await api.get(`${MOVIES_API}/genre/${genreId}?page=${page}`);
  return response.data;
};

export const cacheMovie = async (movieId) => {
  const response = await api.post(`${MOVIES_API}/${movieId}/cache`);
  return response.data;
};
