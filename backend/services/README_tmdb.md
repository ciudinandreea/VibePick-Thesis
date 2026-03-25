# `tmdb.js`: TMDB API Service

**Location:** `backend/services/tmdb.js`
**Role:** All communication with The Movie Database API passes through this file. No other file calls the TMDB API directly.

---

## Configuration

Requires `TMDB_API_KEY` in `backend/.env`. All requests use base URL `https://api.tmdb.org/3`. Images use `https://image.tmdb.org/t/p/w500`.

All public functions add `poster_url` and `backdrop_url` fields by prepending the image base URL to TMDB's raw `poster_path`. **This is the only place poster URLs are constructed.** The raw `poster_path` (e.g. `/abc123.jpg`) is stored in `items.poster_path`; full URLs are built at response time only.

---

## Functions

### `getPopularMovies(page = 1)`
Fetches TMDB's global popularity chart (`/movie/popular`). Used by `recommendations.js` as the base of both candidate pools.

Returns TMDB's response with `poster_url` and `backdrop_url` added per movie. Movies from this endpoint carry `genre_ids` (integer array).

---

### `discoverMoviesByGenre(genreId, page = 1)`
Fetches movies from `/discover/movie` filtered to a single genre ID, sorted by popularity.

**Filters applied:**
- `vote_count.gte: 50`: excludes obscure films
- `include_adult: false`
- `region: RO`: Romanian context
- `language: en-US`

Used by both mood-aware and baseline pools for genre-specific candidates.

---

### `discoverMoviesByGenreAndProviders(genreId, providerIds, page = 1)`
The key function added to fix subscription-availability in mood-aware recommendations.

Same as `discoverMoviesByGenre` but adds:
- `with_watch_providers: "337|8|15|..."`: pipe-separated TMDB provider IDs
- `watch_region: RO`: filters to films available on those platforms in Romania
- `vote_count.gte: 30` (slightly lower threshold to get more results)

This guarantees the mood-aware pool contains films that are both mood-relevant **and** available on the user's subscriptions. Called only from `recommendations.js` when building the mood-aware pool.

---

### `getMovieDetails(movieId)`
Fetches full details for a single movie from `/movie/{id}`. Returns `genres` as `[{id, name}]` objects (unlike list endpoints which return integer `genre_ids`).

Used when:
- A user marks a movie as watched (to store genre data in `items.genres`)
- The genre backfill runs (`POST /profile/backfill-genres`)
- The WatchedMovies modal shows film detail

---

### `searchMovies(query, page = 1)`
Full-text movie search via `/search/movie`. Used by the search bar in all pages. From other pages it navigates to `/browse?q=...` and DiscoveryFeed reads the `q` URL parameter on mount.

---

### `getMovieProviders(movieId, region = 'US')`
Fetches streaming availability from `/movie/{id}/watch/providers`. Returns `{ flatrate, rent, buy }` arrays for the specified region.

Called by the subscription scoring system in `recommender.js` (with a per-request cache) and by the platform stats endpoint in `profile.js`. Tries US region first, falls back to RO for better coverage.

---

## Internal Helper: `tmdbRequest(endpoint, params)`

All public functions use this private helper, which handles the base URL, API key injection, and error throwing. If any TMDB call fails, it throws with `"Failed to fetch from TMDB"`.
