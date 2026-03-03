const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const authMiddleware = require('../middleware/auth');
const {
  getPopularMovies,
  getMovieDetails,
  searchMovies,
  getMoviesByGenre
} = require('../services/tmdb');

router.get('/popular', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const movies = await getPopularMovies(page);
    res.json(movies);
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: 'Search query required' });
    }
    
    const page = req.query.page || 1;
    const results = await searchMovies(query, page);
    res.json(results);
  } catch (error) {
    console.error('Error searching movies:', error);
    res.status(500).json({ error: 'Failed to search movies' });
  }
});

router.get('/genre/:genreId', async (req, res) => {
  try {
    const { genreId } = req.params;
    const page = req.query.page || 1;
    const movies = await getMoviesByGenre(genreId, page);
    res.json(movies);
  } catch (error) {
    console.error('Error fetching movies by genre:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await getMovieDetails(id);
    res.json(movie);
  } catch (error) {
    console.error('Error fetching movie details:', error);
    res.status(500).json({ error: 'Failed to fetch movie details' });
  }
});

router.post('/:id/cache', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await getMovieDetails(id);
    
    const query = `
      INSERT INTO items (tmdb_id, title, description, genres, rating, poster_path, cached_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (tmdb_id) 
      DO UPDATE SET 
        title = $2,
        description = $3,
        genres = $4,
        rating = $5,
        poster_path = $6,
        cached_at = NOW()
      RETURNING *
    `;
    
    const values = [
      movie.id,
      movie.title,
      movie.overview,
      JSON.stringify(movie.genres),
      movie.vote_average,
      movie.poster_path
    ];
    
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
    
  } catch (error) {
    console.error('Error caching movie:', error);
    res.status(500).json({ error: 'Failed to cache movie' });
  }
});

module.exports = router;
