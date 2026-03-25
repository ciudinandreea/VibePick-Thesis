# `mood.js`: Mood & Watch History Routes

**Location:** `backend/routes/mood.js`
**Base path:** `/api/mood`
**Auth:** All routes require JWT

---

## Routes

### `POST /api/mood/log`
Logs the user's **mood-before** at the start of a session.

**Body:** `{ mood: "tired" }`

Inserts a row into `mood_logs` with `mood` and `logged_at = NOW()`. `mood_after` is left NULL and filled later by `/log-after`.

---

### `POST /api/mood/log-after`
Logs the user's **mood-after** at the end of a session and optionally links a film.

**Body:** `{ mood_after: "happy", tmdb_id: 550, title: "Fight Club", poster_path: "/..." }`

Updates the most recent `mood_logs` row for today that has `mood_after = NULL`. If none exists, inserts a new row.

Also records a `'clicked'` interaction for the linked movie. The calendar query prioritises `'clicked'` over `'watched'` when selecting which movie to show for a day.

---

### `GET /api/mood/history?year=2025&month=3`
Returns mood and film data for a calendar month. Used by `MoodHistoryCalendar.jsx`.

Returns entries keyed by date string (`"2025-03-15"`), each with `mood`, `mood_after`, and a movie array. The movie shown per day is selected by priority: `'clicked'` > `'watched'`, most recent first.

---

### `POST /api/mood/watch`
Marks a movie as watched. Called from the Discovery Feed "Mark as Watched" button.

**Body:** `{ tmdb_id: 550, title: "Fight Club", poster_path: "/..." }`

1. Calls `getMovieDetails(tmdb_id)` from TMDB to fetch full genre data
2. Upserts into `items`, creates if new, backfills `genres` if missing
3. Writes to **both** `interactions` (action_type='watched') and `watched_items`

Writing to both tables is necessary because different queries in the codebase check different tables. The recommendation engine, stats endpoints, and history affinity all use `UNION` of both.

---

### `GET /api/mood/watched`
Returns all watched movies for the current user. Used by `WatchedMovies.jsx`.

Response: `{ watched: [{ tmdb_id, title, poster_url, rating, watched_at }] }`

---

### `DELETE /api/mood/watch/:tmdb_id`
Removes a movie from watch history ("Not Watched" button in the film modal).

Deletes from both `watched_items` and `interactions` to ensure full removal from all watch-history checks.

---

### `POST /api/mood/rate`
Logs a helpfulness rating for a recommendation. **Research-critical endpoint.**

**Body:** `{ tmdb_id: 550, title: "Fight Club", rating: 4, mode: "mood-aware", mood: "tired" }`

`mode` and `mood` are essential for thesis analysis — they identify which experimental condition the user is rating. Uses `ADD COLUMN IF NOT EXISTS` to safely add the columns to existing tables.

**Schema created on first call:**
```sql
recommendation_ratings (
  id, user_id, tmdb_id, title,
  rating SMALLINT CHECK (1–5),
  mode VARCHAR(20),    -- 'mood-aware' or 'baseline'
  mood VARCHAR(20),    -- 'happy', 'sad', etc.
  rated_at TIMESTAMP
)
```

**Research queries:**
```sql
-- Average rating by mode (answers RQ1 directly)
SELECT mode, ROUND(AVG(rating), 2) AS avg_rating, COUNT(*) AS n
FROM recommendation_ratings
GROUP BY mode;

-- Per-participant breakdown
SELECT user_id, mode, ROUND(AVG(rating), 2), COUNT(*)
FROM recommendation_ratings
GROUP BY user_id, mode
ORDER BY user_id, mode;
```

---

## Key Tables Written By This File

| Table | Written by | Used by |
|-------|-----------|---------|
| `mood_logs` | `/log`, `/log-after` | Calendar, research analysis |
| `items` | `/watch` | Recommender, stats, history |
| `interactions` | `/watch`, `/log-after` | Recommender, stats |
| `watched_items` | `/watch` | Recommender, stats |
| `recommendation_ratings` | `/rate` | Thesis analysis |
