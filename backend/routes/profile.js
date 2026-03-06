const express = require('express');
const router  = express.Router();
const pool    = require('../db/connection');
const auth    = require('../middleware/auth');

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
    console.log(`Subscriptions for user ${req.user.userId}:`, result.rows);
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
    console.log('Saving subscriptions for user', req.user.userId, ':', platforms);

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
    console.log('Subscriptions saved successfully');
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
      SELECT i.genres
      FROM interactions int
      JOIN items i ON int.item_id = i.id
      WHERE int.user_id = $1
        AND int.action_type = 'watched'
    `, [req.user.userId]);

    const tally = {};
    let total = 0;

    for (const row of result.rows) {
      let genres = row.genres;
      if (!genres) continue;
      if (typeof genres === 'string') genres = JSON.parse(genres);
      if (!Array.isArray(genres)) continue;
      for (const g of genres) {
        const name = typeof g === 'object' ? g.name : g;
        if (!name) continue;
        tally[name] = (tally[name] || 0) + 1;
        total++;
      }
    }

    const breakdown = Object.entries(tally)
      .sort((a, b) => b[1] - a[1])
      .map(([genre, count]) => ({
        genre,
        count,
        pct: total > 0 ? Math.round((count / total) * 100) : 0,
      }));

    res.json({ breakdown, total: result.rows.length, period: 'All time' });
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

    const { getMovieProviders } = require('../services/tmdb');
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

    const { getMovieProviders } = require('../services/tmdb');

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
    const { firstName, lastName, email, password } = req.body;

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

    if (password) {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash(password, 10);
      await pool.query(
        `UPDATE users SET password_hash=$1 WHERE id=$2`,
        [hash, req.user.userId]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error updating account:', err.message);
    res.status(500).json({ error: 'Failed to update account' });
  }
});

router.get('/export', auth, async (req, res) => {
  try {
    const uid = req.user.userId;

    const [userRes, genresRes, subsRes, watchedRes, wishlistRes, moodsRes] = await Promise.all([
      pool.query(`SELECT id, email, full_name, created_at FROM users WHERE id=$1`, [uid]),
      pool.query(`SELECT favourite_genres FROM profiles WHERE user_id=$1`, [uid]),
      pool.query(`SELECT platform_name FROM subscriptions WHERE user_id=$1 AND active=true`, [uid]),
      pool.query(
        `SELECT i.tmdb_id, i.title, i.poster_path, wi.watched_at
         FROM watched_items wi
         JOIN items i ON wi.item_id = i.id
         WHERE wi.user_id=$1
         ORDER BY wi.watched_at DESC`, [uid]
      ),
      pool.query(
        `SELECT i.tmdb_id, i.title, i.poster_path, w.added_at
         FROM wishlist w
         JOIN items i ON w.item_id = i.id
         WHERE w.user_id=$1
         ORDER BY w.added_at DESC`, [uid]
      ),
      pool.query(
        `SELECT mood_category, mood_text, timestamp
         FROM mood_snapshots
         WHERE user_id=$1
         ORDER BY timestamp DESC`, [uid]
      ),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        id:          userRes.rows[0]?.id,
        email:       userRes.rows[0]?.email,
        fullName:    userRes.rows[0]?.full_name || null,
        memberSince: userRes.rows[0]?.created_at || null,
      },
      genrePreferences: genresRes.rows[0]?.favourite_genres || [],
      subscriptions:    subsRes.rows.map(r => r.platform_name),
      watchHistory:     watchedRes.rows,
      wishlist:         wishlistRes.rows,
      moodHistory:      moodsRes.rows,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="vibepick-data.json"');
    res.json(exportData);
  } catch (err) {
    console.error('Error exporting data:', err.message);
    res.status(500).json({ error: 'Failed to export data', detail: err.message });
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

module.exports = router;