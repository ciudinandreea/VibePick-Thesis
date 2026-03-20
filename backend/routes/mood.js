const express = require('express');
const router  = express.Router();
const pool    = require('../db/connection');
const auth    = require('../middleware/auth');
const { getMovieDetails } = require('../services/tmdb');

const VALID = ['happy','sad','stressed','tired','excited','bored'];

router.post('/log', auth, async (req, res) => {
  try {
    const { mood } = req.body;
    if (!VALID.includes(mood)) return res.status(400).json({ error: 'Invalid mood' });
    const result = await pool.query(
      `INSERT INTO mood_logs (user_id, mood, logged_at) VALUES ($1,$2,NOW()) RETURNING id`,
      [req.user.userId, mood]
    );
    res.json({ success: true, logId: result.rows[0].id });
  } catch (err) {
    console.error('Mood log error:', err.message);
    res.status(500).json({ error: 'Failed to log mood' });
  }
});

router.post('/log-after', auth, async (req, res) => {
  try {
    const { mood_after, tmdb_id } = req.body;
    if (!VALID.includes(mood_after)) return res.status(400).json({ error: 'Invalid mood' });
    const userId = req.user.userId;
    const today  = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

    const upd = await pool.query(`
      UPDATE mood_logs SET mood_after = $1
      WHERE id = (
        SELECT id FROM mood_logs
        WHERE user_id = $2
          AND TO_CHAR(logged_at, 'YYYY-MM-DD') = $3
          AND (mood_after IS NULL OR mood_after = '')
        ORDER BY logged_at DESC LIMIT 1
      )
      RETURNING id
    `, [mood_after, userId, todayStr]);

    if (upd.rowCount === 0) {
      await pool.query(
        `INSERT INTO mood_logs (user_id, mood, mood_after, logged_at) VALUES ($1, NULL, $2, NOW())`,
        [userId, mood_after]
      );
    }

    if (tmdb_id) {
      try {
        let itemId;
        const existing = await pool.query(`SELECT id FROM items WHERE tmdb_id=$1`, [tmdb_id]);
        if (existing.rows.length > 0) {
          itemId = existing.rows[0].id;
        } else if (req.body.title) {
          const newItem = await pool.query(
            `INSERT INTO items (tmdb_id, title, poster_path) VALUES ($1,$2,$3) RETURNING id`,
            [tmdb_id, req.body.title, req.body.poster_path || null]
          );
          itemId = newItem.rows[0].id;
        }

        if (itemId) {
          await pool.query(`
            DELETE FROM interactions
            WHERE user_id=$1 AND action_type='clicked'
              AND TO_CHAR(timestamp, 'YYYY-MM-DD') = $2
          `, [userId, todayStr]);

          await pool.query(`
            INSERT INTO interactions (user_id, item_id, action_type, timestamp)
            VALUES ($1,$2,'clicked',NOW())
          `, [userId, itemId]);
        }
      } catch (e) { console.error('mood_after link error:', e.message); }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Mood after error:', err.message);
    res.status(500).json({ error: 'Failed to log mood after' });
  }
});

router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const year   = parseInt(req.query.year)  || new Date().getFullYear();
    const month  = parseInt(req.query.month) || new Date().getMonth() + 1;
    const yearMonth = `${year}-${String(month).padStart(2,'0')}`;

    const moodRes = await pool.query(`
      SELECT mood, mood_after,
             TO_CHAR(logged_at, 'YYYY-MM-DD') as date
      FROM mood_logs
      WHERE user_id = $1
        AND TO_CHAR(logged_at, 'YYYY-MM') = $2
      ORDER BY logged_at DESC
    `, [userId, yearMonth]);

    const dateMap = {};
    moodRes.rows.forEach(row => {
      if (!dateMap[row.date]) {
        dateMap[row.date] = { date: row.date, mood: null, mood_after: null, movies: [] };
      }
      if (!dateMap[row.date].mood      && row.mood)       dateMap[row.date].mood       = row.mood;
      if (!dateMap[row.date].mood_after && row.mood_after) dateMap[row.date].mood_after = row.mood_after;
    });

    try {
      const movieRes = await pool.query(`
        WITH all_movies AS (
          SELECT
            i.title,
            i.poster_path as poster_url,
            TO_CHAR(int.timestamp, 'YYYY-MM-DD') as date,
            -- 'clicked' = explicitly linked to mood_after (highest priority)
            -- 'watched' = just marked watched (fallback)
            CASE WHEN int.action_type = 'clicked' THEN 0 ELSE 1 END as priority,
            int.timestamp
          FROM interactions int
          JOIN items i ON int.item_id = i.id
          WHERE int.user_id = $1
            AND int.action_type IN ('clicked', 'watched')
            AND TO_CHAR(int.timestamp, 'YYYY-MM') = $2
        ),
        ranked AS (
          SELECT title, poster_url, date,
            ROW_NUMBER() OVER (
              PARTITION BY date
              ORDER BY priority ASC, timestamp DESC
            ) as rn
          FROM all_movies
        )
        SELECT title, poster_url, date FROM ranked WHERE rn = 1
      `, [userId, yearMonth]);

      movieRes.rows.forEach(row => {
        if (!dateMap[row.date]) dateMap[row.date] = { date: row.date, movies: [] };
        dateMap[row.date].movies.push({ title: row.title, poster_url: row.poster_url });
      });
    } catch (e) { console.error('Movie history error:', e.message); }

    res.json({ entries: Object.values(dateMap) });
  } catch (err) {
    console.error('Mood history error:', err.message);
    res.status(500).json({ error: 'Failed to fetch mood history' });
  }
});

router.post('/watch', auth, async (req, res) => {
  try {
    const { tmdb_id, title, poster_path } = req.body;
    if (!tmdb_id) return res.status(400).json({ error: 'tmdb_id required' });
    const userId = req.user.userId;

    let genres = null;
    let resolvedTitle    = title;
    let resolvedPoster   = poster_path || null;
    try {
      const details = await getMovieDetails(tmdb_id);
      genres          = details.genres ? JSON.stringify(details.genres) : null;
      resolvedTitle   = details.title  || title;
      resolvedPoster  = details.poster_url || poster_path || null;
    } catch (e) {
      console.error('TMDB detail fetch failed for watch log:', e.message);
    }

    let itemId;
    const existing = await pool.query(`SELECT id, genres FROM items WHERE tmdb_id = $1`, [tmdb_id]);
    if (existing.rows.length > 0) {
      itemId = existing.rows[0].id;
      if (!existing.rows[0].genres && genres) {
        await pool.query(
          `UPDATE items SET genres = $1::jsonb WHERE id = $2`,
          [genres, itemId]
        );
      }
    } else {
      if (!resolvedTitle) return res.status(404).json({ error: 'Movie not in DB and no title provided' });
      const newItem = await pool.query(
        `INSERT INTO items (tmdb_id, title, poster_path, genres) VALUES ($1,$2,$3,$4::jsonb) RETURNING id`,
        [tmdb_id, resolvedTitle, resolvedPoster, genres]
      );
      itemId = newItem.rows[0].id;
    }

    await pool.query(
      `INSERT INTO interactions (user_id, item_id, action_type, timestamp) VALUES ($1,$2,'watched',NOW()) ON CONFLICT DO NOTHING`,
      [userId, itemId]
    );
    await pool.query(
      `INSERT INTO watched_items (user_id, item_id, watched_at) VALUES ($1,$2,NOW()) ON CONFLICT (user_id, item_id) DO NOTHING`,
      [userId, itemId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Watch log error:', err.message);
    res.status(500).json({ error: 'Failed to log watched movie' });
  }
});

router.get('/watched', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query(`
      SELECT DISTINCT ON (i.tmdb_id)
        i.tmdb_id,
        i.title,
        i.poster_path as poster_url,
        i.rating,
        int.timestamp as watched_at
      FROM interactions int
      JOIN items i ON int.item_id = i.id
      WHERE int.user_id = $1 AND int.action_type = 'watched'
      ORDER BY i.tmdb_id, int.timestamp DESC
    `, [userId]);
    res.json({ watched: result.rows });
  } catch (err) {
    console.error('Watched fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch watched movies' });
  }
});

router.post('/rate', auth, async (req, res) => {
  const userId = req.user.userId;
  const { tmdb_id, title, rating, mode, mood } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  const validModes = ['mood-aware', 'baseline'];
  const validMoods = ['happy', 'sad', 'stressed', 'tired', 'excited', 'bored'];
  const safeMode   = validModes.includes(mode) ? mode : null;
  const safeMood   = validMoods.includes(mood) ? mood : null;

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recommendation_ratings (
        id          SERIAL PRIMARY KEY,
        user_id     INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        tmdb_id     INTEGER,
        title       VARCHAR(255),
        rating      SMALLINT     NOT NULL CHECK (rating >= 1 AND rating <= 5),
        mode        VARCHAR(20),
        mood        VARCHAR(20),
        rated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(`ALTER TABLE recommendation_ratings ADD COLUMN IF NOT EXISTS mode VARCHAR(20)`);
    await pool.query(`ALTER TABLE recommendation_ratings ADD COLUMN IF NOT EXISTS mood VARCHAR(20)`);

    await pool.query(
      `INSERT INTO recommendation_ratings (user_id, tmdb_id, title, rating, mode, mood)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, tmdb_id || null, title || null, rating, safeMode, safeMood]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Rating log error:', err.message);
    res.status(500).json({ error: 'Failed to save rating' });
  }
});

router.delete('/watch/:tmdb_id', auth, async (req, res) => {
  try {
    const userId  = req.user.userId;
    const tmdb_id = parseInt(req.params.tmdb_id);
    if (!tmdb_id) return res.status(400).json({ error: 'tmdb_id required' });

    const item = await pool.query(`SELECT id FROM items WHERE tmdb_id = $1`, [tmdb_id]);
    if (item.rows.length === 0) return res.json({ success: true }); 

    const itemId = item.rows[0].id;
    await pool.query(
      `DELETE FROM watched_items WHERE user_id = $1 AND item_id = $2`,
      [userId, itemId]
    );
    await pool.query(
      `DELETE FROM interactions WHERE user_id = $1 AND item_id = $2 AND action_type = 'watched'`,
      [userId, itemId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Unwatch error:', err.message);
    res.status(500).json({ error: 'Failed to remove watched movie' });
  }
});

module.exports = router;