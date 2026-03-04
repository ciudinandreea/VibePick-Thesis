const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const authMiddleware = require('../middleware/auth');

router.post('/log', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { mood } = req.body;

    const validMoods = ['happy', 'sad', 'stressed', 'tired', 'excited', 'bored'];
    if (!validMoods.includes(mood)) {
      return res.status(400).json({ error: 'Invalid mood' });
    }

    await pool.query(`
      INSERT INTO mood_logs (user_id, mood, logged_at)
      VALUES ($1, $2, NOW())
    `, [userId, mood]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error logging mood:', error);
    res.status(500).json({ error: 'Failed to log mood' });
  }
});

module.exports = router;