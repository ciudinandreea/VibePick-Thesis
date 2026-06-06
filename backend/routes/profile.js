const express = require('express');
const router  = express.Router();
const pool    = require('../db/connection');
const auth    = require('../middleware/auth');
const { getMovieDetails, getMovieProviders } = require('../services/tmdb');

router.put('/genres', auth, async (req, res) => {
  try {
    const { genres } = req.body;
    await pool.query(`
      INSERT INTO profiles (user_id, favourite_genres)
      VALUES ($1, $2::jsonb)
      ON CONFLICT (user_id)
      DO UPDATE SET favourite_genres = $2::jsonb
    `, [req.user.userId, JSON.stringify(genres)]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving genres:', err.message);
    res.status(500).json({ error: 'Failed to save genres' });
  }
});

router.get('/genres', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT favourite_genres FROM profiles WHERE user_id = $1`,
      [req.user.userId]
    );
    const genres = result.rows[0]?.favourite_genres || [];
    res.json({ genres });
  } catch (err) {
    console.error('Error fetching genres:', err.message);
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
});

router.get('/subscriptions', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT platform_name FROM subscriptions WHERE user_id=$1 AND active=true`,
      [req.user.userId]
    );
    res.json({ platforms: result.rows.map(r => r.platform_name) });
  } catch (err) {
    console.error('Error fetching subscriptions:', err.message);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

router.post('/subscriptions', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    const { platforms } = req.body;

    await client.query('BEGIN');

    await client.query(
      `DELETE FROM subscriptions WHERE user_id=$1`,
      [req.user.userId]
    );

    for (const p of platforms) {
      await client.query(
        `INSERT INTO subscriptions (user_id, platform_name, active) VALUES ($1,$2,true)`,
        [req.user.userId, p]
      );
    }

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error saving subscriptions:', err.message);
    console.error('Full error:', err);
    res.status(500).json({ error: 'Failed to save subscriptions', detail: err.message });
  } finally {
    client.release();
  }
});

router.delete('/subscriptions/:platformId', auth, async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM subscriptions WHERE user_id=$1 AND platform_name=$2`,
      [req.user.userId, req.params.platformId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error removing subscription:', err.message);
    res.status(500).json({ error: 'Failed to remove subscription' });
  }
});

router.get('/stats/genres', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT i.id, i.genres
      FROM items i
      WHERE i.id IN (
        SELECT item_id FROM watched_items WHERE user_id = $1
        UNION
        SELECT item_id FROM interactions  WHERE user_id = $1 AND action_type = 'watched'
      )
    `, [req.user.userId]);

    const GENRE_IDS = {
      28:'Action',12:'Adventure',16:'Animation',35:'Comedy',80:'Crime',
      99:'Documentary',18:'Drama',10751:'Family',14:'Fantasy',36:'History',
      27:'Horror',10402:'Music',9648:'Mystery',10749:'Romance',878:'Science Fiction',
      10770:'TV Movie',53:'Thriller',10752:'War',37:'Western'
    };

    const tally = {};
    let movieCount = 0;

    for (const row of result.rows) {
      if (!row.genres) continue;
      let genres = typeof row.genres === 'string' ? JSON.parse(row.genres) : row.genres;
      if (!Array.isArray(genres) || genres.length === 0) continue;
      movieCount++;
      for (const g of genres) {
        let name;
        if (typeof g === 'object' && g !== null) {
          name = g.name || GENRE_IDS[g.id];
        } else if (typeof g === 'string') {
          name = g;
        } else {
          name = GENRE_IDS[g];
        }
        if (!name) continue;
        tally[name] = (tally[name] || 0) + 1;
      }
    }

    const totalGenreHits = Object.values(tally).reduce((s, v) => s + v, 0);
    const breakdown = Object.entries(tally)
      .sort((a, b) => b[1] - a[1])
      .map(([genre, count]) => ({
        genre,
        count,
        pct: totalGenreHits > 0 ? Math.round((count / totalGenreHits) * 100) : 0,
      }));

    res.json({ breakdown, total: movieCount, period: 'All time' });
  } catch (err) {
    console.error('Error fetching genre stats:', err.message);
    res.status(500).json({ error: 'Failed to fetch genre stats' });
  }
});

router.get('/stats/platforms', auth, async (req, res) => {
  try {
    const subResult = await pool.query(
      `SELECT platform_name FROM subscriptions WHERE user_id=$1 AND active=true`,
      [req.user.userId]
    );
    const userSubs = new Set(subResult.rows.map(r => r.platform_name));

    const watchedResult = await pool.query(`
      SELECT DISTINCT i.tmdb_id, i.title
      FROM interactions int
      JOIN items i ON int.item_id = i.id
      WHERE int.user_id = $1
        AND int.action_type = 'watched'
        AND i.tmdb_id IS NOT NULL
    `, [req.user.userId]);

    if (watchedResult.rows.length === 0) {
      return res.json({ breakdown: [], total: 0, period: 'All time' });
    }

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
    const providerToPlatform = {};
    for (const [pid, names] of Object.entries(PLATFORM_TMDB_NAMES)) {
      for (const n of names) providerToPlatform[n] = pid;
    }

    const PLATFORM_LABELS = {
      netflix: 'Netflix', disneyplus: 'Disney+', prime: 'Prime Video',
      hbomax: 'HBO Max', appletv: 'Apple TV+', hulu: 'Hulu',
      paramount: 'Paramount+', peacock: 'Peacock', skyshowtime: 'SkyShowtime',
    };

    const tally = {};
    let matched = 0;

    await Promise.all(watchedResult.rows.map(async (row) => {
      try {
        let providers = await getMovieProviders(row.tmdb_id, 'US');
        let flatrate = providers.flatrate || [];
        if (flatrate.length === 0) {
          providers = await getMovieProviders(row.tmdb_id, 'RO');
          flatrate = providers.flatrate || [];
        }
        for (const p of flatrate) {
          const pid = providerToPlatform[p.provider_name];
          if (pid && userSubs.has(pid)) {
            tally[pid] = (tally[pid] || 0) + 1;
            matched++;
            break; 
          }
        }
      } catch {}
    }));

    const breakdown = Object.entries(tally)
      .sort((a, b) => b[1] - a[1])
      .map(([pid, count]) => ({
        platform: PLATFORM_LABELS[pid] || pid,
        platformId: pid,
        count,
        pct: matched > 0 ? Math.round((count / matched) * 100) : 0,
      }));

    res.json({
      breakdown,
      total: watchedResult.rows.length,
      matched,
      period: 'All time',
    });
  } catch (err) {
    console.error('Error fetching platform stats:', err.message);
    res.status(500).json({ error: 'Failed to fetch platform stats' });
  }
});

router.post('/movies/platform-labels', auth, async (req, res) => {
  try {
    const { tmdbIds } = req.body; 
    if (!Array.isArray(tmdbIds) || tmdbIds.length === 0) {
      return res.json({ labels: {} });
    }

    const subResult = await pool.query(
      `SELECT platform_name FROM subscriptions WHERE user_id=$1 AND active=true`,
      [req.user.userId]
    );
    const userSubs = new Set(subResult.rows.map(r => r.platform_name));
    if (userSubs.size === 0) return res.json({ labels: {} });


    const PROVIDER_DISPLAY_NAME = {
      'netflix':             'Netflix',
      'disney plus':         'Disney+',
      'disney+':             'Disney+',
      'amazon prime video':  'Prime',
      'prime video':         'Prime',
      'max':                 'Max',
      'hbo max':             'Max',
      'apple tv plus':       'Apple TV+',
      'apple tv+':           'Apple TV+',
      'hulu':                'Hulu',
      'paramount plus':      'Paramount+',
      'paramount+':          'Paramount+',
      'peacock':             'Peacock',
      'peacock premium':     'Peacock',
      'skyshowtime':         'Sky',
    };

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

    const providerSet = new Set();
    for (const pid of userSubs) {
      const names = PLATFORM_TMDB_NAMES[pid] || [];
      names.forEach(n => providerSet.add(n.toLowerCase()));
    }

    const ids = tmdbIds.slice(0, 40);
    const labels = {};

    await Promise.all(ids.map(async (tmdbId) => {
      try {
        let providers = await getMovieProviders(tmdbId, 'US');
        let flatrate = providers.flatrate || [];
        if (flatrate.length === 0) {
          providers = await getMovieProviders(tmdbId, 'RO');
          flatrate = providers.flatrate || [];
        }
        for (const p of flatrate) {
          if (providerSet.has(p.provider_name.toLowerCase())) {
            labels[tmdbId] = PROVIDER_DISPLAY_NAME[p.provider_name.toLowerCase()] || p.provider_name;
            break;
          }
        }
      } catch {}
    }));

    res.json({ labels });
  } catch (err) {
    console.error('Error fetching platform labels:', err.message);
    res.status(500).json({ error: 'Failed to fetch platform labels' });
  }
});


router.put('/account', auth, async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;

    if (email) {
      await pool.query(
        `UPDATE users SET email=$1 WHERE id=$2`,
        [email, req.user.userId]
      );
    }

    if (firstName !== undefined || lastName !== undefined) {
      const fullName = `${firstName || ''} ${lastName || ''}`.trim();
      await pool.query(
        `UPDATE users SET full_name=$1 WHERE id=$2`,
        [fullName, req.user.userId]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error updating account:', err.message);
    res.status(500).json({ error: 'Failed to update account' });
  }
});

router.delete('/account', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    const uid = req.user.userId;
    await client.query('BEGIN');

    await client.query(`DELETE FROM mood_logs WHERE user_id=$1`, [uid]);
    await client.query(`DELETE FROM interactions WHERE user_id=$1`, [uid]);
    await client.query(`DELETE FROM subscriptions WHERE user_id=$1`, [uid]);
    await client.query(`DELETE FROM profiles WHERE user_id=$1`, [uid]);
    await client.query(`DELETE FROM recommendation_runs WHERE user_id=$1`, [uid]);
    await client.query(`DELETE FROM users WHERE id=$1`, [uid]);
    await client.query(`DELETE FROM watched_items WHERE user_id=$1`, [uid]);
    await client.query(`DELETE FROM wishlist WHERE user_id=$1`, [uid]);
    await client.query(`DELETE FROM recommendation_ratings WHERE user_id=$1`, [uid]);

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting account:', err.message);
    res.status(500).json({ error: 'Failed to delete account' });
  } finally {
    client.release();
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, full_name, created_at FROM users WHERE id=$1`,
      [req.user.userId]
    );
    const u = result.rows[0];
    if (!u) return res.status(404).json({ error: 'User not found' });
    res.json({
      id:          u.id,
      email:       u.email,
      fullName:    u.full_name || '',
      createdAt:   u.created_at,
    });
  } catch (err) {
    console.error('Error fetching user:', err.message);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.post('/backfill-genres', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const force = req.query.force === 'true';

    const missing = await pool.query(`
      SELECT DISTINCT i.id, i.tmdb_id, i.title
      FROM items i
      WHERE (i.genres IS NULL OR $2)
        AND i.id IN (
          SELECT item_id FROM watched_items WHERE user_id = $1
          UNION
          SELECT item_id FROM interactions  WHERE user_id = $1 AND action_type = 'watched'
        )
    `, [userId, force]);

    if (missing.rows.length === 0) {
      return res.json({ updated: 0, message: 'All watched items already have genres.' });
    }

    let updated = 0;
    let failed  = 0;

    for (const item of missing.rows) {
      try {
        const details = await getMovieDetails(item.tmdb_id);
        if (details.genres && details.genres.length > 0) {
          await pool.query(
            `UPDATE items SET genres = $1::jsonb WHERE id = $2`,
            [JSON.stringify(details.genres), item.id]
          );
          updated++;
        }
        await new Promise(r => setTimeout(r, 260));
      } catch (e) {
        console.error(`Backfill failed for tmdb_id ${item.tmdb_id}:`, e.message);
        failed++;
      }
    }

    res.json({
      updated,
      failed,
      total: missing.rows.length,
      message: `Backfilled genres for ${updated} of ${missing.rows.length} movies.`,
    });
  } catch (err) {
    console.error('Backfill error:', err.message);
    res.status(500).json({ error: 'Backfill failed' });
  }
});

router.get('/watched-by-genre/:genre', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const genre  = req.params.genre;

    const result = await pool.query(`
      SELECT DISTINCT i.tmdb_id, i.title, i.poster_path, i.genres, i.rating
      FROM items i
      WHERE i.id IN (
        SELECT item_id FROM watched_items WHERE user_id = $1
        UNION
        SELECT item_id FROM interactions  WHERE user_id = $1 AND action_type = 'watched'
      )
      AND i.genres IS NOT NULL
    `, [userId]);

    const GENRE_IDS = {
      28:'Action',12:'Adventure',16:'Animation',35:'Comedy',80:'Crime',
      99:'Documentary',18:'Drama',10751:'Family',14:'Fantasy',36:'History',
      27:'Horror',10402:'Music',9648:'Mystery',10749:'Romance',878:'Science Fiction',
      10770:'TV Movie',53:'Thriller',10752:'War',37:'Western'
    };

    const IMAGE_BASE = 'https://image.tmdb.org/t/p/w300';

    const movies = result.rows.filter(row => {
      const arr = typeof row.genres === 'string' ? JSON.parse(row.genres) : (row.genres || []);
      return arr.some(g => {
        if (typeof g === 'object' && g !== null) return (g.name || GENRE_IDS[g.id]) === genre;
        if (typeof g === 'string') return g === genre;
        return GENRE_IDS[g] === genre;
      });
    }).map(row => ({
      tmdb_id:    row.tmdb_id,
      title:      row.title,
      poster_url: row.poster_path ? `${IMAGE_BASE}${row.poster_path}` : null,
      rating:     row.rating,
    }));

    res.json({ movies, genre, total: movies.length });
  } catch (err) {
    console.error('watched-by-genre error:', err.message);
    res.status(500).json({ error: 'Failed to fetch movies for genre' });
  }
});

router.get('/watched-by-platform/:platform', auth, async (req, res) => {
  try {
    const userId   = req.user.userId;
    const platform = req.params.platform; 

    const result = await pool.query(`
      SELECT DISTINCT i.tmdb_id, i.title, i.poster_path, i.rating
      FROM items i
      WHERE i.id IN (
        SELECT item_id FROM watched_items WHERE user_id = $1
        UNION
        SELECT item_id FROM interactions  WHERE user_id = $1 AND action_type = 'watched'
      )
      AND i.tmdb_id IS NOT NULL
    `, [userId]);

    const IMAGE_BASE = 'https://image.tmdb.org/t/p/w300';

    const PLATFORM_TMDB_NAMES = {
      'Netflix': ['Netflix'],
      'Disney+': ['Disney Plus', 'Disney+'],
      'Prime Video': ['Amazon Prime Video', 'Prime Video'],
      'HBO Max': ['Max', 'HBO Max'], 'Max': ['Max', 'HBO Max'],
      'Apple TV+': ['Apple TV Plus', 'Apple TV+'],
      'Hulu': ['Hulu'],
      'Paramount+': ['Paramount Plus', 'Paramount+'],
      'Peacock': ['Peacock', 'Peacock Premium'],
      'SkyShowtime': ['SkyShowtime'], 'Sky': ['SkyShowtime'],
    };
    const targetNames = new Set(
      (PLATFORM_TMDB_NAMES[platform] || [platform]).map(n => n.toLowerCase())
    );

    const movies = [];
    await Promise.all(result.rows.map(async row => {
      try {
        let providers = await getMovieProviders(row.tmdb_id, 'US');
        let flatrate  = providers.flatrate || [];
        if (flatrate.length === 0) {
          providers = await getMovieProviders(row.tmdb_id, 'RO');
          flatrate  = providers.flatrate || [];
        }
        const match = flatrate.some(p => targetNames.has(p.provider_name.toLowerCase()));
        if (match) movies.push({
          tmdb_id:    row.tmdb_id,
          title:      row.title,
          poster_url: row.poster_path ? `${IMAGE_BASE}${row.poster_path}` : null,
          rating:     row.rating,
        });
      } catch {}
    }));

    movies.sort((a, b) => a.title.localeCompare(b.title));
    res.json({ movies, platform, total: movies.length });
  } catch (err) {
    console.error('watched-by-platform error:', err.message);
    res.status(500).json({ error: 'Failed to fetch movies for platform' });
  }
});

module.exports = router;