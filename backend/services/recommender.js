const pool = require('../db/connection');
const { MOOD_GENRE_SCORES, GENRE_IDS } = require('../config/moodMapping');
const { getPopularMovies, getMoviesByGenre } = require('./tmdb');

function calculateMoodMatch(movie, mood) {
  if (!movie.genres || movie.genres.length === 0) {
    return 0.5; 
  }

  const moodScores = MOOD_GENRE_SCORES[mood];
  if (!moodScores) {
    return 0.5; 
  }

  let genreNames;
  if (Array.isArray(movie.genres)) {
    genreNames = movie.genres.map(g => {
      if (typeof g === 'object' && g.name) {
        return g.name;
      } else if (typeof g === 'number') {
        return GENRE_IDS[g] || null;
      }
      return g;
    }).filter(Boolean);
  } else if (typeof movie.genres === 'string') {
    genreNames = JSON.parse(movie.genres).map(g => g.name || g);
  }

  const scores = genreNames.map(genre => moodScores[genre] || 0.5);
  const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

  return avgScore;
}

function calculatePrefMatch(movie, userGenres) {
  if (!movie.genres || movie.genres.length === 0) {
    return 0.5;
  }

  if (!userGenres || userGenres.length === 0) {
    return 0.5; 
  }

  let movieGenres;
  if (Array.isArray(movie.genres)) {
    movieGenres = movie.genres.map(g => {
      if (typeof g === 'object' && g.name) return g.name;
      if (typeof g === 'number') return GENRE_IDS[g];
      return g;
    }).filter(Boolean);
  } else {
    movieGenres = JSON.parse(movie.genres).map(g => g.name || g);
  }

  const overlap = movieGenres.filter(g => userGenres.includes(g)).length;
  const maxPossible = Math.max(movieGenres.length, userGenres.length);

  return overlap / maxPossible;
}


async function calculateHistoryAffinity(movie, userId) {
  try {
    const historyResult = await pool.query(`
      SELECT DISTINCT i.genres
      FROM interactions int
      JOIN items i ON int.item_id = i.id
      WHERE int.user_id = $1
        AND int.action_type = 'view'
      LIMIT 20
    `, [userId]);

    if (historyResult.rows.length === 0) {
      return 0.5; 
    }

    const watchedGenres = new Set();
    historyResult.rows.forEach(row => {
      if (row.genres) {
        const genres = JSON.parse(row.genres);
        genres.forEach(g => watchedGenres.add(g.name || g));
      }
    });

    let movieGenres;
    if (Array.isArray(movie.genres)) {
      movieGenres = movie.genres.map(g => g.name || g);
    } else {
      movieGenres = JSON.parse(movie.genres).map(g => g.name || g);
    }

    const overlap = movieGenres.filter(g => watchedGenres.has(g)).length;
    return overlap / Math.max(movieGenres.length, 1);

  } catch (error) {
    console.error('Error calculating history affinity:', error);
    return 0.5;
  }
}

async function calculateSubscriptionScore(movie, userId) {
  try {
    const subsResult = await pool.query(`
      SELECT platform_name
      FROM subscriptions
      WHERE user_id = $1 AND active = true
    `, [userId]);

    if (subsResult.rows.length === 0) {
      return 0.5; 
    }

    const userPlatforms = subsResult.rows.map(row => 
      row.platform_name.toLowerCase()
    );
    return 0.5;

  } catch (error) {
    console.error('Error calculating subscription score:', error);
    return 0.5;
  }
}

async function calculateNoveltyScore(movie, userId) {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) as count
      FROM interactions int
      JOIN items i ON int.item_id = i.id
      WHERE int.user_id = $1
        AND i.tmdb_id = $2
        AND int.action_type = 'view'
    `, [userId, movie.id]);

    return result.rows[0].count > 0 ? 0 : 1;

  } catch (error) {
    console.error('Error calculating novelty:', error);
    return 1;
  }
}

async function rankMovies(movies, userId, mood, mode = 'mood-aware') {
  let userGenres = [];
  try {
    const prefResult = await pool.query(`
      SELECT favorite_genres
      FROM profiles
      WHERE user_id = $1
    `, [userId]);

    if (prefResult.rows.length > 0 && prefResult.rows[0].favorite_genres) {
      userGenres = prefResult.rows[0].favorite_genres;
    }
  } catch (error) {
    console.error('Error fetching user preferences:', error);
  }

  const weights = mode === 'baseline' 
    ? {
        mood: 0.0,      
        pref: 0.40,
        hist: 0.35,
        sub: 0.20,
        novelty: 0.05
      }
    : {
        mood: 0.35,     
        pref: 0.25,
        hist: 0.20,
        sub: 0.15,
        novelty: 0.05
      };

  const scoredMovies = await Promise.all(
    movies.map(async (movie) => {
      const scores = {
        mood: mode === 'baseline' ? 0 : calculateMoodMatch(movie, mood),
        pref: calculatePrefMatch(movie, userGenres),
        hist: await calculateHistoryAffinity(movie, userId),
        sub: await calculateSubscriptionScore(movie, userId),
        novelty: await calculateNoveltyScore(movie, userId)
      };

      const finalScore = 
        weights.mood * scores.mood +
        weights.pref * scores.pref +
        weights.hist * scores.hist +
        weights.sub * scores.sub +
        weights.novelty * scores.novelty;

      return {
        movie,
        finalScore,
        scores, 
        weights
      };
    })
  );

  scoredMovies.sort((a, b) => b.finalScore - a.finalScore);

  return scoredMovies;
}

module.exports = {
  calculateMoodMatch,
  calculatePrefMatch,
  calculateHistoryAffinity,
  calculateSubscriptionScore,
  calculateNoveltyScore,
  rankMovies
};
