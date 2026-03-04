const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const authMiddleware = require('../middleware/auth');

router.put('/genres', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { genres } = req.body;

    await pool.query(`
      INSERT INTO profiles (user_id, favourite_genres)
      VALUES ($1, $2::jsonb)
      ON CONFLICT (user_id)
      DO UPDATE SET favourite_genres = $2::jsonb
    `, [userId, JSON.stringify(genres)]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving genres:', error);
    res.status(500).json({ error: 'Failed to save genres' });
  }
});

router.post('/subscriptions', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { platforms } = req.body;

    await pool.query(`DELETE FROM subscriptions WHERE user_id = $1`, [userId]);

    for (const platform of platforms) {
      await pool.query(`
        INSERT INTO subscriptions (user_id, platform_name, active)
        VALUES ($1, $2, true)
      `, [userId, platform]);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving subscriptions:', error);
    res.status(500).json({ error: 'Failed to save subscriptions' });
  }
});

module.exports = router;