const axios = require('axios');
require('dotenv').config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.tmdb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

async function tmdbRequest(endpoint, params = {}) {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {
      params: {
        api_key: TMDB_API_KEY,
        ...params
      }
    });
    return response.data;
  } catch (error) {
    console.error('TMDB API Error:', error.message);
    throw new Error('Failed to fetch from TMDB');
  }
}

async function getPopularMovies(page = 1) {
  const data = await tmdbRequest('/movie/popular', { page });
  
  return {
    ...data,
    results: data.results.map(movie => ({
      ...movie,
      poster_url: movie.poster_path 
        ? `${IMAGE_BASE_URL}${movie.poster_path}` 
        : null,
      backdrop_url: movie.backdrop_path 
        ? `${IMAGE_BASE_URL}${movie.backdrop_path}` 
        : null
    }))
  };
}

async function getMovieDetails(movieId) {
  const movie = await tmdbRequest(`/movie/${movieId}`);
  
  return {
    ...movie,
    poster_url: movie.poster_path 
      ? `${IMAGE_BASE_URL}${movie.poster_path}` 
      : null,
    backdrop_url: movie.backdrop_path 
      ? `${IMAGE_BASE_URL}${movie.backdrop_path}` 
      : null
  };
}

async function searchMovies(query, page = 1) {
  const data = await tmdbRequest('/search/movie', { query, page });
  
  return {
    ...data,
    results: data.results.map(movie => ({
      ...movie,
      poster_url: movie.poster_path 
        ? `${IMAGE_BASE_URL}${movie.poster_path}` 
        : null
    }))
  };
}

async function getMoviesByGenre(genreId, page = 1) {
  const data = await tmdbRequest('/discover/movie', { 
    with_genres: genreId,
    page 
  });
  
  return {
    ...data,
    results: data.results.map(movie => ({
      ...movie,
      poster_url: movie.poster_path 
        ? `${IMAGE_BASE_URL}${movie.poster_path}` 
        : null
    }))
  };
}

module.exports = {
  getPopularMovies,
  getMovieDetails,
  searchMovies,
  getMoviesByGenre
};
