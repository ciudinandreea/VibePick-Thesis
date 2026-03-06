const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const authMiddleware = require('../middleware/auth');
const { getPopularMovies } = require('../services/tmdb');
const { rankMovies } = require('../services/recommender');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const mood = req.query.mood || 'bored';
    const mode = req.query.mode || 'mood-aware'; 
    const limit = parseInt(req.query.limit) || 20;

    const validMoods = ['happy', 'sad', 'stressed', 'tired', 'excited', 'bored'];
    if (!validMoods.includes(mood)) {
      return res.status(400).json({ error: 'Invalid mood' });
    }

    if (!['baseline', 'mood-aware'].includes(mode)) {
      return res.status(400).json({ error: 'Invalid mode' });
    }

    const tmdbData = await getPopularMovies(1);
    let candidateMovies = tmdbData.results || [];

    const tmdbData2 = await getPopularMovies(2);
    candidateMovies = candidateMovies.concat(tmdbData2.results || []);

    if (candidateMovies.length === 0) {
      return res.json({ recommendations: [], mood, mode });
    }

    try {
      const watchedRes = await pool.query(`
        SELECT i.tmdb_id FROM interactions int
        JOIN items i ON int.item_id = i.id
        WHERE int.user_id = $1 AND int.action_type = 'watched'
      `, [userId]);
      const watchedIds = new Set(watchedRes.rows.map(r => r.tmdb_id));
      if (watchedIds.size > 0) {
        candidateMovies = candidateMovies.filter(m => !watchedIds.has(m.id));
      }
    } catch { }

    const rankedMovies = await rankMovies(candidateMovies, userId, mood, mode);

    const topRecommendations = rankedMovies.slice(0, limit);

    await pool.query(`
      INSERT INTO recommendation_runs (user_id, mode, items_shown, timestamp)
      VALUES ($1, $2, $3, NOW())
    `, [
      userId, 
      mode, 
      JSON.stringify(topRecommendations.map(r => r.movie.id))
    ]);

    const response = {
      recommendations: topRecommendations.map(r => ({
        ...r.movie,
        finalScore: r.finalScore,
        explanation: {
          mood:         mode === 'mood-aware' ? r.scores.mood : null,
          preferences:  r.scores.pref,
          history:      r.scores.hist,
          subscription: r.scores.sub,
          novelty:      r.scores.novelty,
          platformName: r.scores.platformName || null,
        },
        weights: r.weights
      })),
      mood,
      mode,
      totalCandidates: candidateMovies.length,
      returned: topRecommendations.length
    };

    res.json(response);

  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

module.exports = router;
