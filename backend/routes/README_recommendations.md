# `recommendations.js`: Recommendation Route

**Location:** `backend/routes/recommendations.js`
**Route:** `GET /api/recommendations`
**Auth:** Required (JWT)

---

## What This File Does

Entry point for the Discovery Feed. Handles everything upstream of scoring:

1. Validates mood and mode parameters
2. Builds a **mode-specific candidate pool** from TMDB
3. Filters out already-watched movies
4. Passes filtered candidates to `rankMovies()` in `recommender.js`
5. Returns top N results with scores and explanation
6. Logs the run to `recommendation_runs` for research analysis

---

## Request Parameters

| Parameter | Default | Values |
|-----------|---------|--------|
| `mood` | `"bored"` | `happy`, `sad`, `stressed`, `tired`, `excited`, `bored` |
| `mode` | `"mood-aware"` | `mood-aware`, `baseline` |
| `limit` | `20` | Any positive integer |

**Example:** `GET /api/recommendations?mood=tired&mode=mood-aware&limit=20`

---

## Candidate Pool Strategy

Both modes score the same way but draw from **different pools**. This is what makes the modes show genuinely different films rather than just reordering the same list.

### Mood-Aware Pool

```
getPopularMovies(pages 1–3)              ~60 mainstream films
+ discoverMoviesByGenre(moodGenre1, p1)  ~20 mood-relevant films
+ discoverMoviesByGenreAndProviders(moodGenre1, userProviderIds, p1+p2)  ~40 mood and subscription films
+ discoverMoviesByGenre(moodGenre2, p1)  ~20 mood-relevant films
+ discoverMoviesByGenreAndProviders(moodGenre2, userProviderIds, p1+p2)  ~40 mood and subscription films
─────────────────────────────────────────────────────────────────────────
~100–180 candidates (only 20 shown), skewed toward current mood's genres and user's platforms
```

The `discoverMoviesByGenreAndProviders` calls use TMDB's `with_watch_providers` parameter to filter results to films available on the user's subscriptions in Romania (`watch_region=RO`). This guarantees subscription-available mood-relevant films appear in the pool.

### Baseline Pool

```
getPopularMovies(pages 1–3)              ~60 mainstream films
+ discoverMoviesByGenre(prefGenre1–4, p1+p2)   ~160 preference-genre films
─────────────────────────────────────────────────────────────────────────
~135–200 candidates (only 20 shown), skewed toward the user's saved genre preferences
```

Baseline discovers from the user's **own saved genre preferences**, not mood genres. This means a user who likes Comedy and Drama will see Drama-Romance films in baseline, while mood-aware (when excited) will show Action-Thriller films.

---

## Mood → Discover Genre IDs (`MOOD_DISCOVER_GENRES`)

Only the first **2** entries are used per request (`maxGenres=2`). Ordered by mood score descending.

| Mood | Genre IDs used | Genre names | Top scores |
|------|---------------|-------------|-----------|
| `happy` | 35, 10749 | Comedy, Romance | 1.0, 0.9 |
| `sad` | 18, 10749 | Drama, Romance | 0.9, 0.8 |
| `stressed` | 35, 10751 | Comedy, Family | 0.9, 0.8 |
| `tired` | 35, 10751 | Comedy, Family | 0.9, 0.8 |
| `excited` | 28, 53 | Action, Thriller | 1.0, 0.9 |
| `bored` | 9648, 878 | Mystery, Sci-Fi | intentional novelty, not top scorers |

**Note on `bored`:** All genres score 0.7 equally for bored, so the pool deliberately uses less-common genres (Mystery, Sci-Fi, Crime, Western, History) to push novelty rather than the user's usual genres.

---

## Platform ID → TMDB Provider ID Map (`TMDB_PROVIDER_IDS`)

Used to build the `with_watch_providers` parameter for provider-filtered discover calls.

| Internal ID | TMDB Provider ID | Display name |
|-------------|:---------------:|-------------|
| `netflix` | 8 | Netflix |
| `disneyplus` | 337 | Disney+ |
| `prime` | 9 | Amazon Prime Video |
| `hbomax` | 384 | HBO Max |
| `appletv` | 350 | Apple TV+ |
| `hulu` | 15 | Hulu |
| `paramount` | 531 | Paramount+ |
| `peacock` | 386 | Peacock |
| `skyshowtime` | 1773 | SkyShowtime |

---

## Watched Movie Exclusion

Already-watched movies are removed **before** scoring. Queries both tables via `UNION`:

```sql
SELECT DISTINCT i.tmdb_id FROM items i
WHERE i.id IN (
  SELECT item_id FROM watched_items WHERE user_id = $1
  UNION
  SELECT item_id FROM interactions WHERE user_id = $1 AND action_type = 'watched'
)
```

Wrapped in try/catch. If this query fails, scoring proceeds rather than crashing the request.

---

## Response Shape

```json
{
  "recommendations": [
    {
      "id": 550,
      "title": "Fight Club",
      "poster_url": "https://image.tmdb.org/t/p/w500/...",
      "genre_ids": [18, 53],
      "vote_average": 8.4,
      "finalScore": 0.81,
      "explanation": {
        "mood": 0.63,
        "preferences": 1.0,
        "history": 0.51,
        "subscription": 1.0,
        "platformName": "Netflix"
      },
      "weights": { "mood": 0.25, "pref": 0.40, "hist": 0.20, "sub": 0.15 }
    }
  ],
  "mood": "tired",
  "mode": "mood-aware",
  "totalCandidates": 123,
  "returned": 20
}
```

`explanation.mood` is `null` in baseline mode. `platformName` is `null` if the movie is not on any of the user's subscriptions. The `explanation` object powers the score breakdown tooltip in the Discovery Feed.

---

## Research Logging

Every successful request inserts one row into `recommendation_runs`:

```sql
INSERT INTO recommendation_runs (user_id, mode, items_shown, timestamp)
VALUES ($1, $2, $3, NOW())
```

`items_shown` is a JSON array of TMDB IDs in ranked order. Used for post-study analysis of what was shown to each user in each mode.
