const pool = require('../db/connection');
const { MOOD_GENRE_SCORES, GENRE_IDS } = require('../config/moodMapping');
const { getMovieProviders } = require('./tmdb');

const PLATFORM_TMDB_NAMES = {
  netflix:     ['Netflix'],
  disneyplus:  ['Disney Plus', 'Disney+'],
  prime:       ['Amazon Prime Video', 'Prime Video'],
  hbomax:      ['Max', 'HBO Max'],
  appletv:     ['Apple TV Plus', 'Apple TV+'],
  hulu:        ['Hulu'],
  paramount:   ['Paramount Plus', 'Paramount+'],
  peacock:     ['Peacock', 'Peacock Premium'],
  skyshowtime: ['SkyShowtime'],
};

const PROVIDER_DISPLAY_NAME = {
  'netflix':             'Netflix',
  'disney plus':         'Disney+',
  'disney+':             'Disney+',
  'amazon prime video':  'Amazon Prime Video',
  'prime video':         'Amazon Prime Video',
  'max':                 'HBO Max',
  'hbo max':             'HBO Max',
  'apple tv plus':       'Apple TV+',
  'apple tv+':           'Apple TV+',
  'hulu':                'Hulu',
  'paramount plus':      'Paramount+',
  'paramount+':          'Paramount+',
  'peacock':             'Peacock',
  'peacock premium':     'Peacock',
  'skyshowtime':         'Sky',
};

function buildProviderSet(userPlatforms) {
  const set = new Set();
  for (const pid of userPlatforms) {
    const names = PLATFORM_TMDB_NAMES[pid] || [];
    names.forEach(n => set.add(n.toLowerCase()));
  }
  return set;
}

function getGenreNames(movie) {
  if (movie.genres && Array.isArray(movie.genres) && movie.genres.length > 0) {
    return movie.genres.map(g => (typeof g === 'object' ? g.name : GENRE_IDS[g])).filter(Boolean);
  }
  if (movie.genre_ids && Array.isArray(movie.genre_ids)) {
    return movie.genre_ids.map(id => GENRE_IDS[id]).filter(Boolean);
  }
  return [];
}

function calculateMoodMatch(movie, mood) {
  const moodScores = MOOD_GENRE_SCORES[mood];
  if (!moodScores) return 0.5;
  const genreNames = getGenreNames(movie);
  if (genreNames.length === 0) return 0.5;
  const scores = genreNames.map(g => moodScores[g] || 0.5);
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

function calculatePrefMatch(movie, userGenres) {
  if (!userGenres || userGenres.length === 0) return 0.5;
  const genreNames = getGenreNames(movie);
  if (genreNames.length === 0) return 0.5;
  const overlap = genreNames.filter(g => userGenres.includes(g)).length;
  return overlap / Math.max(genreNames.length, userGenres.length);
}

async function calculateHistoryAffinity(movie, userId) {
  try {
    const result = await pool.query(`
      SELECT DISTINCT i.genres FROM interactions int
      JOIN items i ON int.item_id = i.id
      WHERE int.user_id = $1
        AND int.action_type IN ('watched', 'clicked')
      LIMIT 30
    `, [userId]);

    if (result.rows.length === 0) return 0.5;

    const watchedGenres = new Set();
    result.rows.forEach(row => {
      if (row.genres) {
        const g = typeof row.genres === 'string' ? JSON.parse(row.genres) : row.genres;
        g.forEach(x => watchedGenres.add(typeof x === 'object' ? x.name : x));
      }
    });

    if (watchedGenres.size === 0) return 0.5;

    const movieGenres = getGenreNames(movie);
    if (movieGenres.length === 0) return 0.5;

    return movieGenres.filter(g => watchedGenres.has(g)).length / Math.max(movieGenres.length, 1);
  } catch { return 0.5; }
}

async function calculateNoveltyScore(movie, userId) {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) as count FROM interactions int
      JOIN items i ON int.item_id = i.id
      WHERE int.user_id = $1
        AND i.tmdb_id = $2
        AND int.action_type = 'watched'
    `, [userId, movie.id]);
    return parseInt(result.rows[0].count) > 0 ? 0 : 1;
  } catch { return 1; }
}

async function calculateSubscriptionScore(movie, providerSet, providerCache) {
  if (providerSet.size === 0) return { score: 0.5, platformName: null };

  try {
    let providers;
    if (providerCache.has(movie.id)) {
      providers = providerCache.get(movie.id);
    } else {
      providers = await getMovieProviders(movie.id);
      providerCache.set(movie.id, providers);
    }

    const available = providers.flatrate || [];
    let matchedName = null;
    for (const p of available) {
      if (providerSet.has(p.provider_name.toLowerCase())) {
        matchedName = PROVIDER_DISPLAY_NAME[p.provider_name.toLowerCase()] || p.provider_name;
        break;
      }
    }
    return { score: matchedName ? 1.0 : 0.0, platformName: matchedName };
  } catch {
    return { score: 0.5, platformName: null };
  }
}

async function rankMovies(movies, userId, mood, mode = 'mood-aware') {
  let userGenres   = [];
  let userPlatforms = [];

  try {
    const prefResult = await pool.query(
      `SELECT favourite_genres FROM profiles WHERE user_id = $1`, [userId]
    );
    if (prefResult.rows[0]?.favourite_genres) {
      userGenres = prefResult.rows[0].favourite_genres;
    }
  } catch (e) { console.error('Error fetching genres:', e.message); }

  try {
    const subResult = await pool.query(
      `SELECT platform_name FROM subscriptions WHERE user_id = $1 AND active = true`,
      [userId]
    );
    userPlatforms = subResult.rows.map(r => r.platform_name);
  } catch (e) { console.error('Error fetching subscriptions:', e.message); }

  const providerSet   = buildProviderSet(userPlatforms);
  const providerCache = new Map(); 
  const weights = mode === 'baseline'
    ? { mood: 0.00, pref: 0.35, hist: 0.30, novelty: 0.20, sub: 0.15 }
    : { mood: 0.30, pref: 0.25, hist: 0.15, novelty: 0.15, sub: 0.15 };

  const scoredMovies = await Promise.all(movies.map(async (movie) => {
    const scores = {
      mood:    mode === 'baseline' ? 0 : calculateMoodMatch(movie, mood),
      pref:    calculatePrefMatch(movie, userGenres),
      hist:    await calculateHistoryAffinity(movie, userId),
      novelty: await calculateNoveltyScore(movie, userId),
      ...await calculateSubscriptionScore(movie, providerSet, providerCache).then(r => ({
        sub: r.score, platformName: r.platformName,
      })),
    };

    const finalScore =
      weights.mood    * scores.mood    +
      weights.pref    * scores.pref    +
      weights.hist    * scores.hist    +
      weights.novelty * scores.novelty +
      weights.sub     * scores.sub;

    return { movie, finalScore, scores, weights };
  }));

  scoredMovies.sort((a, b) => b.finalScore - a.finalScore);
  return scoredMovies;
}

module.exports = {
  calculateMoodMatch,
  calculatePrefMatch,
  calculateHistoryAffinity,
  calculateNoveltyScore,
  calculateSubscriptionScore,
  rankMovies,
};
