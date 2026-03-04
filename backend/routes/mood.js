const express = require('express');
const router  = express.Router();
const pool    = require('../db/connection');
const auth    = require('../middleware/auth');

const VALID = ['happy','sad','stressed','tired','excited','bored'];

router.post('/log', auth, async (req, res) => {
  try {
    const { mood } = req.body;
    if (!VALID.includes(mood)) return res.status(400).json({ error: 'Invalid mood' });
    await pool.query(
      `INSERT INTO mood_logs (user_id, mood, logged_at) VALUES ($1,$2,NOW())`,
      [req.user.userId, mood]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Mood log error:', err.message);
    res.status(500).json({ error: 'Failed to log mood' });
  }
});

router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const year   = parseInt(req.query.year)  || new Date().getFullYear();
    const month  = parseInt(req.query.month) || new Date().getMonth() + 1;
    const yearMonth = `${year}-${String(month).padStart(2,'0')}`;

    const moodRes = await pool.query(`
      SELECT mood,
             TO_CHAR(logged_at, 'YYYY-MM-DD') as date
      FROM mood_logs
      WHERE user_id = $1
        AND TO_CHAR(logged_at, 'YYYY-MM') = $2
      ORDER BY logged_at DESC
    `, [userId, yearMonth]);

    const dateMap = {};
    moodRes.rows.forEach(row => {
      if (!dateMap[row.date]) {
        dateMap[row.date] = { date: row.date, mood: row.mood, movies: [] };
      }
    });

    try {
      const movieRes = await pool.query(`
        SELECT i.title,
               COALESCE(i.poster_path, i.poster_url) as poster_url,
               TO_CHAR(int.created_at, 'YYYY-MM-DD') as date
        FROM interactions int
        JOIN items i ON int.item_id = i.id
        WHERE int.user_id = $1
          AND int.action_type = 'view'
          AND TO_CHAR(int.created_at, 'YYYY-MM') = $2
      `, [userId, yearMonth]);

      movieRes.rows.forEach(row => {
        if (!dateMap[row.date]) dateMap[row.date] = { date: row.date, movies: [] };
        dateMap[row.date].movies.push({ title: row.title, poster_url: row.poster_url });
      });
    } catch {  }

    res.json({ entries: Object.values(dateMap) });
  } catch (err) {
    console.error('Mood history error:', err.message);
    res.status(500).json({ error: 'Failed to fetch mood history' });
  }
});

module.exports = router;
