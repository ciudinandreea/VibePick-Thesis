const express = require('express');
const router  = express.Router();
const pool    = require('../db/connection');
const auth    = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT w.id,
             i.tmdb_id,
             i.title,
             i.poster_path  AS poster_url,
             i.rating       AS vote_average,
             i.genres,
             i.description
      FROM wishlist w
      JOIN items i ON w.item_id = i.id
      WHERE w.user_id = $1
      ORDER BY w.added_at DESC
    `, [req.user.userId]);

    res.json({ items: result.rows });
  } catch (err) {
    console.error('Wishlist GET error:', err.message);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { tmdb_id, title, poster_path, poster_url, rating, vote_average, genres, description } = req.body;

    const posterValue   = poster_path || poster_url || null;
    const ratingValue   = rating || vote_average || null;

    const itemRes = await pool.query(`
      INSERT INTO items (tmdb_id, title, poster_path, rating, genres, description)
      VALUES ($1, $2, $3, $4, $5::jsonb, $6)
      ON CONFLICT (tmdb_id) DO UPDATE
        SET title       = EXCLUDED.title,
            poster_path = EXCLUDED.poster_path,
            rating      = EXCLUDED.rating,
            genres      = EXCLUDED.genres
      RETURNING id
    `, [
      tmdb_id,
      title,
      posterValue,
      ratingValue,
      JSON.stringify(genres || []),
      description || null,
    ]);

    const itemId = itemRes.rows[0].id;

    await pool.query(`
      INSERT INTO wishlist (user_id, item_id, added_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (user_id, item_id) DO NOTHING
    `, [userId, itemId]);

    res.json({ success: true });
  } catch (err) {
    console.error('Wishlist POST error:', err.message);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM wishlist WHERE id=$1 AND user_id=$2`,
      [req.params.id, req.user.userId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove' });
  }
});

module.exports = router;
