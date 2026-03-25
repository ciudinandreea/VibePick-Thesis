# `recommender.js`: Recommendation Scoring Engine

**Location:** `backend/services/recommender.js`
**Role:** The core of the algorithm. Given a list of candidate movies and a user, assigns every movie a final score between 0 and 1 and returns them sorted highest-first. Called exclusively by `routes/recommendations.js`.

---

## The Scoring Formula

Every movie receives a **weighted linear combination of four component scores**:

```
finalScore = w_mood × mood + w_pref × pref + w_hist × hist + w_sub × sub
```

### Weights

| Component | Mood-Aware | Baseline | Rationale |
|-----------|:----------:|:--------:|-----------|
| **mood** | 0.25 | 0.00 | Only active in mood-aware mode |
| **pref** | 0.40 | 0.40 | Equal in both modes, taste signal always matters |
| **hist** | 0.20 | 0.35 | Baseline leans harder on history since it has no mood |
| **sub** | 0.15 | 0.25 | Subscription availability, higher in baseline |
| **Total** | **1.00** | **1.00** | |

**Key design decision:** `pref` is identical in both modes so that mood is a genuine additive bonus, not a replacement for taste. The mood weight (0.25) is funded exclusively by reducing `sub`. This means mood-aware scores higher than baseline whenever the movie's mood match exceeds ~60%, which holds for any reasonably matched film.

**Note on novelty:** Watched movies are removed from the candidate pool before scoring, so a novelty score would be 1.0 (constant) for every candidate, as it contributes nothing to ranking. It is not included as a scoring component.

---

## Component Score Functions

### 1. `calculateMoodMatch(movie, mood)` → 0–1

Looks up each of the movie's genres in `MOOD_GENRE_SCORES` (from `config/moodMapping.js`) and averages the scores. Genres **not listed** in the mood map score **0**, not 0.5. This intentionally penalises genuinely mismatched films.

```
Action + Comedy when excited: (1.0 + 0.4) / 2 = 0.70
```

### 2. `calculatePrefMatch(movie, userGenreNames)` → 0–1

Measures overlap between the movie's genres and the user's saved preferences.

Uses a **recall-based denominator**, which divides by the movie's genre count, not `max(movie, user)`:

```
overlap / movieGenreCount
```

A movie with 2 genres where both match the user → `2/2 = 1.0` (100%), regardless of how many genres the user has saved.

`userGenreNames` is an array of **name strings** (e.g. `["Action","Comedy"]`), exactly as stored in `profiles.favourite_genres` by the frontend.

### 3. `calculateHistoryAffinity(movie, watchedGenreWeights)` → 0–1

Measures how well the movie's genres match the user's actual watch history, weighted by frequency.

`watchedGenreWeights` is a `Map<genreName, proportion>` built by `fetchWatchedGenreWeights()`. For example, if the user watched 75 movies and 40 were Comedy, Comedy gets weight `0.53`. Averages the weights across all of the movie's genres.

This prevents the flat-Set bug where a user with many watched movies across many genres would score 100% history affinity for every single candidate.

### 4. `calculateSubscriptionScore(movie, providerSet, providerCache)` → 0 or 1

Returns `1.0` if the movie is on at least one of the user's streaming platforms, `0` otherwise. Uses a **per-request provider cache** (`Map`) to avoid making a separate TMDB provider API call for every candidate movie.

---

## Pre-computation Strategy

All user context is fetched **once per request** before the scoring loop, not once per movie:

| Data | Fetched by | Used by |
|------|-----------|---------|
| `userGenreNames` | Direct DB query | `calculatePrefMatch` |
| `userPlatforms` | Direct DB query | `buildProviderSet` |
| `watchedGenreWeights` | `fetchWatchedGenreWeights()` | `calculateHistoryAffinity` |
| `watchedTmdbIds` | `fetchWatchedTmdbIds()` | Watched-movie exclusion filter |
| `providerCache` | Populated lazily per movie | `calculateSubscriptionScore` |

`watchedGenreWeights` and `watchedTmdbIds` are fetched in parallel with `Promise.all`. Both query `watched_items UNION interactions (action_type='watched')` to catch all write paths.

---

## `fetchWatchedGenreWeights(userId)`: How History Weights Are Built

```
SELECT i.genres FROM items i
WHERE i.id IN (
  SELECT item_id FROM watched_items WHERE user_id = $1
  UNION
  SELECT item_id FROM interactions WHERE user_id = $1 AND action_type = 'watched'
)
```

For each watched movie with genre data:
1. Increments a tally counter for each genre name
2. `total` only counts movies that actually contributed genre data (skips NULL genres)
3. Converts counts to proportions: `weight = count / total`

Result: `{ Comedy: 0.55, Drama: 0.49, Romance: 0.48, Thriller: 0.24, ... }`

---

## Genre Format Notes

TMDB returns genres in two different shapes depending on the endpoint:

| Source | Format | Example |
|--------|--------|---------|
| `/movie/popular`, `/discover/movie` | `genre_ids: [28, 35]` (integers) | TMDB list endpoints |
| `/movie/{id}` | `genres: [{id:28, name:'Action'}]` (objects) | TMDB detail endpoint |
| `profiles.favourite_genres` (DB) | `["Action","Comedy"]` (name strings) | Saved by GenreSetup frontend |
| `items.genres` (DB) | `[{id:28, name:'Action'}]` (objects) | Stored from TMDB detail calls |

`getMovieGenreNames(movie)` normalises both TMDB shapes to plain name strings. All comparisons are name-to-name. Never compare raw integer IDs against name strings.

---

## Files This Module Depends On

| File | What it provides |
|------|-----------------|
| `config/moodMapping.js` | `MOOD_GENRE_SCORES`, `GENRE_IDS` |
| `services/tmdb.js` | `getMovieProviders()` |
| `db/connection.js` | PostgreSQL pool |

## Files That Call This Module

| File | How |
|------|-----|
| `routes/recommendations.js` | Calls `rankMovies()` as the final step |
