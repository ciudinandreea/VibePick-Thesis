const express = require('express');
const router  = express.Router();
const pool    = require('../db/connection');
const auth    = require('../middleware/auth');

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
        const item = await pool.query(`SELECT id FROM items WHERE tmdb_id=$1`, [tmdb_id]);
        if (item.rows.length > 0) {
          await pool.query(`
            INSERT INTO interactions (user_id, item_id, action_type, timestamp)
            VALUES ($1,$2,'watch',NOW())
          `, [userId, item.rows[0].id]);
        }
      } catch { }
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
        WITH mood_after_times AS (
          SELECT TO_CHAR(logged_at, 'YYYY-MM-DD') as date,
                 logged_at as mood_after_time
          FROM mood_logs
          WHERE user_id = $1
            AND TO_CHAR(logged_at, 'YYYY-MM') = $2
            AND mood_after IS NOT NULL
        ),
        ranked_movies AS (
          SELECT
            i.title,
            i.poster_path as poster_url,
            TO_CHAR(int.timestamp, 'YYYY-MM-DD') as date,
            int.timestamp,
            -- Priority 1: movie watched closest before mood_after log that day
            -- Priority 2: most recently watched movie that day
            ROW_NUMBER() OVER (
              PARTITION BY TO_CHAR(int.timestamp, 'YYYY-MM-DD')
              ORDER BY
                CASE WHEN mat.mood_after_time IS NOT NULL
                  AND int.timestamp <= mat.mood_after_time
                  THEN 0 ELSE 1 END ASC,
                int.timestamp DESC
            ) as rn
          FROM interactions int
          JOIN items i ON int.item_id = i.id
          LEFT JOIN mood_after_times mat
            ON TO_CHAR(int.timestamp, 'YYYY-MM-DD') = mat.date
          WHERE int.user_id = $1
            AND int.action_type = 'watched'
            AND TO_CHAR(int.timestamp, 'YYYY-MM') = $2
        )
        SELECT title, poster_url, date FROM ranked_movies WHERE rn = 1
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

    let itemId;
    const existing = await pool.query(`SELECT id FROM items WHERE tmdb_id = $1`, [tmdb_id]);
    if (existing.rows.length > 0) {
      itemId = existing.rows[0].id;
    } else {
      if (!title) return res.status(404).json({ error: 'Movie not in DB and no title provided' });
      const newItem = await pool.query(
        `INSERT INTO items (tmdb_id, title, poster_path) VALUES ($1,$2,$3) RETURNING id`,
        [tmdb_id, title, poster_path || null]
      );
      itemId = newItem.rows[0].id;
    }

    await pool.query(
      `INSERT INTO interactions (user_id, item_id, action_type, timestamp) VALUES ($1,$2,'watched',NOW())`,
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

module.exports = router;