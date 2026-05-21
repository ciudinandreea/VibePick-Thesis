const express  = require('express');
const router   = express.Router();
const pool     = require('../db/connection');
const auth     = require('../middleware/auth');
const { getPopularMovies, discoverMoviesByGenre, discoverMoviesByGenreAndProviders } = require('../services/tmdb');

const TMDB_PROVIDER_IDS = {
  netflix:     8,
  disneyplus:  337,
  prime:       9,
  hbomax:      384,
  appletv:     350,
  hulu:        15,
  paramount:   531,
  peacock:     386,
  skyshowtime: 1773,
};
const { rankMovies } = require('../services/recommender');
const { GENRE_IDS } = require('../config/moodMapping');

const GENRE_NAME_TO_ID = {};
for (const [id, name] of Object.entries(GENRE_IDS)) {
  GENRE_NAME_TO_ID[name] = parseInt(id);
}

const MOOD_DISCOVER_GENRES = {
  happy:    [35, 10749, 10751, 16, 10402],   // Comedy, Romance, Family, Animation, Music
  sad:      [18, 10749, 10751, 35, 99],       // Drama, Romance, Family, Comedy, Documentary
  stressed: [35, 10751, 99, 16, 10749],       // Comedy, Family, Documentary, Animation, Romance
  tired:    [35, 10751, 10749, 14, 16],       // Comedy, Family, Romance, Fantasy, Animation
  excited:  [28, 53, 12, 878, 14],            // Action, Thriller, Adventure, SciFi, Fantasy
  bored:    [9648, 878, 80, 37, 36],          // Mystery, SciFi, Crime, Western, History
};

const ADULT_KEYWORDS = [
  'sex', 'xxx', 'porn', 'erotic', 'nymphomaniac', 'nude', 'nudity',
  'lust', 'caution', 'hot girls wanted', 'secretary', 'straight a',
  'realm of the senses', 'last tango', 'irreversible', '9 songs',
  'damage', 'from straight', 'graphic desires'
];

function isAdultContent(movie) {
  const title = (movie.title || movie.original_title || '').toLowerCase();
  return ADULT_KEYWORDS.some(kw => title.includes(kw));
}

async function buildPool(pages, genreIds, maxGenres = 2, providerIds = []) {
  const tasks = pages.map(p => getPopularMovies(p));

  for (const gid of genreIds.slice(0, maxGenres)) {
    tasks.push(discoverMoviesByGenre(gid, 1));
    if (providerIds.length > 0 && typeof discoverMoviesByGenreAndProviders === 'function') {
      tasks.push(discoverMoviesByGenreAndProviders(gid, providerIds, 1));
      tasks.push(discoverMoviesByGenreAndProviders(gid, providerIds, 2));
    } else {
      tasks.push(discoverMoviesByGenre(gid, 2));
    }
  }

  const results = await Promise.allSettled(tasks);
  let movies = [];
  for (const r of results) {
    if (r.status === 'fulfilled') movies = movies.concat(r.value.results || []);
  }
  const seen = new Set();
  return movies.filter(m => {
    if (!m?.id || seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
}

router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const mood   = req.query.mood || 'bored';
    const mode   = req.query.mode || 'mood-aware';
    const limit  = parseInt(req.query.limit) || 20;

    const validMoods = ['happy','sad','stressed','tired','excited','bored'];
    if (!validMoods.includes(mood))                 return res.status(400).json({ error: 'Invalid mood' });
    if (!['baseline','mood-aware'].includes(mode))  return res.status(400).json({ error: 'Invalid mode' });

    let candidateMovies;

    if (mode === 'mood-aware') {
      const moodGenreIds = MOOD_DISCOVER_GENRES[mood] || [];
      let moodProviderIds = [];
      try {
        const subRes = await pool.query(
          `SELECT platform_name FROM subscriptions WHERE user_id = $1 AND active = true`,
          [userId]
        );
        moodProviderIds = subRes.rows
          .map(r => TMDB_PROVIDER_IDS[r.platform_name])
          .filter(Boolean);
      } catch (e) { console.error('Platform fetch error:', e.message); }
      candidateMovies = await buildPool([1, 2, 3], moodGenreIds, 2, moodProviderIds);
    } else {
      let userGenreNames = [];
      try {
        const r = await pool.query(
          `SELECT favourite_genres FROM profiles WHERE user_id = $1`, [userId]
        );
        const raw = r.rows[0]?.favourite_genres;
        if (raw) {
          const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
          userGenreNames = arr.map(g => typeof g === 'string' ? g : GENRE_IDS[g]).filter(Boolean);
        }
      } catch (e) { console.error('Genre fetch error:', e.message); }

      const prefGenreIds = userGenreNames
        .map(n => GENRE_NAME_TO_ID[n])
        .filter(Boolean);

      candidateMovies = await buildPool([1, 2, 3], prefGenreIds, 4);
    }

    if (candidateMovies.length === 0) return res.json({ recommendations: [], mood, mode });

    try {
      const watchedRes = await pool.query(`
        SELECT DISTINCT i.tmdb_id FROM items i
        WHERE i.id IN (
          SELECT item_id FROM watched_items WHERE user_id = $1
          UNION
          SELECT item_id FROM interactions  WHERE user_id = $1 AND action_type = 'watched'
        )
      `, [userId]);
      const watchedIds = new Set(watchedRes.rows.map(r => r.tmdb_id));
      if (watchedIds.size > 0) {
        candidateMovies = candidateMovies.filter(m => !watchedIds.has(m.id));
      }
    } catch (e) { console.error('Watched filter error:', e.message); }

    candidateMovies = candidateMovies.filter(movie => !isAdultContent(movie));

    const ranked = await rankMovies(candidateMovies, userId, mood, mode);
    const top    = ranked.slice(0, limit);
    try {
      await pool.query(
        `INSERT INTO recommendation_runs (user_id, mode, items_shown, timestamp) VALUES ($1,$2,$3,NOW())`,
        [userId, mode, JSON.stringify(top.map(r => r.movie.id))]
      );
    } catch (e) { console.error('Run log error:', e.message); }

    res.json({
      recommendations: top.map(r => ({
        ...r.movie,
        finalScore: r.finalScore,
        explanation: {
          mood:         mode === 'mood-aware' ? r.scores.mood : null,
          preferences:  r.scores.pref,
          history:      r.scores.hist,
          subscription: r.scores.sub,
          platformName: r.scores.platformName || null,
        },
        weights: r.weights,
      })),
      mood, mode,
      totalCandidates: candidateMovies.length,
      returned: top.length,
    });

  } catch (err) {
    console.error('Recommendation error:', err);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

module.exports = router;