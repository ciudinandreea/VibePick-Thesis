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
  'netflix': 'Netflix', 'disney plus': 'Disney+', 'disney+': 'Disney+',
  'amazon prime video': 'Amazon Prime Video', 'prime video': 'Amazon Prime Video',
  'max': 'HBO Max', 'hbo max': 'HBO Max',
  'apple tv plus': 'Apple TV+', 'apple tv+': 'Apple TV+',
  'hulu': 'Hulu', 'paramount plus': 'Paramount+', 'paramount+': 'Paramount+',
  'peacock': 'Peacock', 'peacock premium': 'Peacock', 'skyshowtime': 'Sky',
};

function buildProviderSet(userPlatforms) {
  const set = new Set();
  for (const pid of userPlatforms) {
    (PLATFORM_TMDB_NAMES[pid] || []).forEach(n => set.add(n.toLowerCase()));
  }
  return set;
}


function getMovieGenreNames(movie) {
  if (Array.isArray(movie.genres) && movie.genres.length > 0) {
    return movie.genres
      .map(g => (typeof g === 'object' ? g.name : GENRE_IDS[g]))
      .filter(Boolean);
  }
  if (Array.isArray(movie.genre_ids) && movie.genre_ids.length > 0) {
    return movie.genre_ids.map(id => GENRE_IDS[id]).filter(Boolean);
  }
  return [];
}


function calculateMoodMatch(movie, mood) {
  const moodMap = MOOD_GENRE_SCORES[mood];
  if (!moodMap) return 0.5;
  const names = getMovieGenreNames(movie);
  if (names.length === 0) return 0.5;
  const scores = names.map(n => moodMap[n] !== undefined ? moodMap[n] : 0);
  return scores.reduce((s, v) => s + v, 0) / scores.length;
}

function calculatePrefMatch(movie, userGenreNames) {
  if (!userGenreNames || userGenreNames.length === 0) return 0;
  const movieNames = getMovieGenreNames(movie);
  if (movieNames.length === 0) return 0;
  const overlap = movieNames.filter(n => userGenreNames.includes(n)).length;
  return overlap / movieNames.length;
}

function calculateHistoryAffinity(movie, watchedGenreWeights) {
  if (!watchedGenreWeights || watchedGenreWeights.size === 0) return 0;
  const movieNames = getMovieGenreNames(movie);
  if (movieNames.length === 0) return 0;
  const scores = movieNames.map(n => watchedGenreWeights.get(n) || 0);
  return scores.reduce((s, v) => s + v, 0) / scores.length;
}

async function fetchWatchedGenreWeights(userId) {
  try {
    const result = await pool.query(`
      SELECT i.genres
      FROM items i
      WHERE i.id IN (
        SELECT item_id FROM watched_items WHERE user_id = $1
        UNION
        SELECT item_id FROM interactions  WHERE user_id = $1 AND action_type = 'watched'
      )
    `, [userId]);

    if (result.rows.length === 0) return new Map();

    const tally = new Map();   
    let total = 0;             

    for (const row of result.rows) {
      if (!row.genres) continue;  
      const arr = typeof row.genres === 'string' ? JSON.parse(row.genres) : row.genres;
      if (!arr || arr.length === 0) continue;
      total++;  
      for (const g of arr) {
        const name = (typeof g === 'object' && g.name) ? g.name : GENRE_IDS[g];
        if (!name) continue;
        tally.set(name, (tally.get(name) || 0) + 1);
      }
    }

    if (total === 0) return new Map();

    const weights = new Map();
    for (const [name, count] of tally) {
      weights.set(name, count / total);
    }
    return weights;
  } catch (e) {
    console.error('fetchWatchedGenreWeights error:', e.message);
    return new Map();
  }
}

async function calculateSubscriptionScore(movie, providerSet, providerCache) {
  if (providerSet.size === 0) return { score: 0, platformName: null };
  try {
    let providers;
    if (providerCache.has(movie.id)) {
      providers = providerCache.get(movie.id);
    } else {
      providers = await getMovieProviders(movie.id);
      providerCache.set(movie.id, providers);
    }
    const available = providers.flatrate || [];
    for (const p of available) {
      const key = p.provider_name.toLowerCase();
      if (providerSet.has(key)) {
        return {
          score: 1.0,
          platformName: PROVIDER_DISPLAY_NAME[key] || p.provider_name,
        };
      }
    }
    return { score: 0, platformName: null };
  } catch {
    return { score: 0, platformName: null };
  }
}

async function rankMovies(movies, userId, mood, mode = 'mood-aware') {

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

  let userPlatforms = [];
  try {
    const r = await pool.query(
      `SELECT platform_name FROM subscriptions WHERE user_id = $1 AND active = true`, [userId]
    );
    userPlatforms = r.rows.map(r => r.platform_name);
  } catch (e) { console.error('Subscription fetch error:', e.message); }

  const watchedGenreWeights = await fetchWatchedGenreWeights(userId);


  const providerSet   = buildProviderSet(userPlatforms);
  const providerCache = new Map();

  const weights = mode === 'baseline'
    ? { mood: 0.00, pref: 0.40, hist: 0.35, sub: 0.25 }
    : { mood: 0.25, pref: 0.40, hist: 0.20, sub: 0.15 };

  const scored = await Promise.all(movies.map(async (movie) => {
    const subResult = await calculateSubscriptionScore(movie, providerSet, providerCache);

    const scores = {
      mood:        mode === 'baseline' ? 0 : calculateMoodMatch(movie, mood),
      pref:        calculatePrefMatch(movie, userGenreNames),
      hist:        calculateHistoryAffinity(movie, watchedGenreWeights),
      sub:         subResult.score,
      platformName: subResult.platformName,
    };

    const finalScore =
      weights.mood * scores.mood +
      weights.pref * scores.pref +
      weights.hist * scores.hist +
      weights.sub  * scores.sub;

    return { movie, finalScore, scores, weights };
  }));

  scored.sort((a, b) => b.finalScore - a.finalScore);
  return scored;
}

module.exports = {
  calculateMoodMatch,
  calculatePrefMatch,
  calculateHistoryAffinity,
  calculateSubscriptionScore,
  rankMovies,
};