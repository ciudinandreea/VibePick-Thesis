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

module.exports = router;