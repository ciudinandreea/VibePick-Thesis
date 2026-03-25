[README_MASTER.md](https://github.com/user-attachments/files/26253458/README_MASTER.md)
# VibePick: Developer Documentation

**Project:** An Emotion-Based Entertainment Recommendation Application
**Context:** Bachelor's thesis project: comparing mood-aware vs. baseline recommendation algorithms
**Stack:** React (frontend) · Node.js / Express (backend) · PostgreSQL · TMDB API

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [How the Recommendation System Works](#2-how-the-recommendation-system-works)
3. [Mood-to-Genre Scoring](#3-mood-to-genre-scoring)
4. [Database Tables](#4-database-tables)
5. [API Route Reference](#5-api-route-reference)
6. [Frontend Pages](#6-frontend-pages)
7. [Research Data](#7-research-data)

---

## 1. Project Structure

```
VibePick-Thesis/
│
├── backend/
│   ├── config/
│   │   └── moodMapping.js          ← Genre scores per mood and TMDB genre IDs  [README_moodMapping.md]
│   ├── db/
│   │   └── connection.js           ← PostgreSQL connection pool
│   ├── middleware/
│   │   └── auth.js                 ← JWT verification middleware
│   ├── routes/
│   │   ├── auth.js                 ← /register, /login
│   │   ├── mood.js                 ← Mood logging, watch history, helpfulness ratings  [README_mood.md]
│   │   ├── profile.js              ← Genres, subscriptions, stats, account  [README_profile.md]
│   │   ├── recommendations.js      ← GET /api/recommendations: candidate pool  [README_recommendations.md]
│   │   └── wishlist.js             ← Wishlist CRUD
│   ├── services/
│   │   ├── recommender.js          ← Core scoring engine  [README_recommender.md]
│   │   └── tmdb.js                 ← All TMDB API communication  [README_tmdb.md]
│   ├── .env                        ← TMDB_API_KEY, DATABASE_URL, JWT_SECRET 
│   ├── package.json
│   └── server.js                   ← Express entry point, route registration, CORS
│
└── frontend/
    ├── public/
    │   ├── docs/                   ← Legal PDFs (privacy-policy, terms, gdpr-notice)
    │   ├── logos/                  ← App logo assets
    │   ├── pages-bg.jpg            ← Background image used across all pages
    │   ├── logo.png
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Login.jsx
    │   │   └── Register.jsx
    │   ├── pages/
    │   │   ├── About.jsx           ← Public landing page (unauthenticated)
    │   │   ├── DiscoveryFeed.jsx   ← Main feed: ranked recommendations, both modes
    │   │   ├── GenreManager.jsx    ← Favourite genres and clickable genre breakdown chart
    │   │   ├── GenreSetup.jsx      ← Onboarding step 1
    │   │   ├── MoodHistoryCalendar.jsx ← Monthly mood and film calendar
    │   │   ├── MoodPicker.jsx      ← Daily mood selection
    │   │   ├── MovieDetail.jsx     ← Full film detail modal
    │   │   ├── PrivacyData.jsx     ← GDPR data export and legal docs
    │   │   ├── SubscriptionManager.jsx ← Streaming platforms and platform chart
    │   │   ├── SubscriptionSetup.jsx   ← Onboarding step 2
    │   │   ├── WatchedMovies.jsx   ← Watch history with sort and unwatch
    │   │   ├── Wishlist.jsx        ← Saved movies
    │   │   └── YourAccount.jsx     ← Profile editing and account deletion
    │   ├── services/
    │   │   └── api.js              ← Axios instance and auth helpers  [README_api_frontend.md]
    │   ├── App.js                  ← Routes and auth guards  [README_App.md]
    │   ├── index.css               ← Base styles 
    │   └── index.js                ← React entry point
    └── package.json
```

---

## 2. How the Recommendation System Works

### Phase 1: Build a Mode-Specific Candidate Pool (`recommendations.js`)

Both modes draw from **different pools** so they show genuinely different films.

**Mood-Aware pool**:
- `discoverMoviesByGenre` for top 2 mood genres (unfiltered, broad)
- `discoverMoviesByGenreAndProviders` for top 2 mood genres (filtered to user's streaming platforms in Romania)

The provider-filtered calls use TMDB's `with_watch_providers` parameter to guarantee subscription-available mood-relevant films appear in the pool.

**Baseline pool**:
- `discoverMoviesByGenre` for up to 4 of the user's saved preference genres

### Phase 2: Score and Rank (`recommender.js`)

```
finalScore = w_mood × mood + w_pref × pref + w_hist × hist + w_sub × sub
```

| Component | Mood-Aware | Baseline |
|-----------|:----------:|:--------:|
| **mood** | 0.25 | 0.00 |
| **pref** | 0.40 | 0.40 |
| **hist** | 0.20 | 0.35 |
| **sub** | 0.15 | 0.25 |

**Key design decisions:**
- `pref` is identical in both modes, as mood is additive, not a replacement
- Mood weight funded by reducing `sub` only (not pref/hist)
- Mood-aware outscores baseline whenever the movie's mood score exceeds ~60%
- `pref` uses recall denominator (overlap / movieGenreCount); a perfect match always reaches 1.0
- `hist` uses frequency weights, as genres watched often score higher than genres rarely watched
- Already-watched movies are excluded from the candidate pool before any scoring

---

## 3. Mood-to-Genre Scoring

See `README_moodMapping.md` for full rationale. Genres not listed score **0**.

| Genre | 😊 Happy | 😢 Sad | 😰 Stressed | 😴 Tired | 🤩 Excited | 😐 Bored |
|-------|:-------:|:-----:|:-----------:|:--------:|:----------:|:-------:|
| Action | 0.5 | — | 0.3 | 0.3 | **1.0** | 0.7 |
| Adventure | 0.6 | — | — | — | **0.9** | 0.7 |
| Animation | 0.8 | 0.6 | 0.8 | **0.8** | — | 0.6 |
| Comedy | **1.0** | 0.7 | **0.9** | **0.9** | 0.4 | 0.7 |
| Crime | — | — | — | — | 0.6 | 0.7 |
| Documentary | — | 0.6 | 0.7 | 0.4 | 0.4 | — |
| Drama | 0.4 | **0.9** | — | 0.3 | 0.5 | 0.7 |
| Family | **0.9** | **0.8** | **0.8** | **0.8** | — | — |
| Fantasy | 0.6 | 0.5 | 0.5 | 0.5 | **0.8** | 0.7 |
| Horror | 0.2 | 0.1 | 0.1 | 0.1 | 0.7 | 0.6 |
| Musical | **0.9** | 0.7 | 0.6 | — | — | — |
| Mystery | — | — | — | 0.3 | 0.7 | 0.7 |
| Romance | **0.9** | **0.8** | 0.6 | 0.7 | 0.3 | 0.6 |
| Science Fiction | — | — | — | — | **0.8** | 0.7 |
| Thriller | 0.3 | 0.2 | 0.1 | 0.2 | **0.9** | 0.7 |
| War | 0.3 | 0.2 | 0.1 | — | — | — |

---

## 4. Database Tables

| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `users` | `email`, `password_hash`, `full_name`, `created_at` | Account credentials |
| `profiles` | `user_id`, `favourite_genres` jsonb | Genre preferences — stored as name strings e.g. `["Comedy","Action"]` |
| `subscriptions` | `user_id`, `platform_name`, `active` | Streaming platforms — short IDs: `netflix`, `disneyplus`, etc. |
| `items` | `tmdb_id`, `title`, `genres` jsonb, `poster_path` | Cached TMDB metadata. `genres` stores `[{id,name}]` objects |
| `mood_logs` | `user_id`, `mood`, `mood_after`, `logged_at` | One row per session. Mood-before and mood-after |
| `interactions` | `user_id`, `item_id`, `action_type`, `timestamp` | `action_type`: `'watched'` or `'clicked'` (linked to mood_after) |
| `watched_items` | `user_id`, `item_id`, `watched_at` | Explicit watch history |
| `wishlist` | `user_id`, `item_id`, `added_at` | Saved movies |
| `recommendation_runs` | `user_id`, `mode`, `mood_category`, `items_shown` jsonb, `timestamp` | Research log |
| `recommendation_ratings` | `user_id`, `tmdb_id`, `rating`, `mode`, `mood`, `rated_at` | Helpfulness ratings 1–5 with experimental condition |

**Dual write tables:** Both `interactions` and `watched_items` store watch events for historical reasons. All queries use `UNION` of both. 

---

## 5. API Route Reference

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, receive JWT |

### Recommendations
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/recommendations?mood=&mode=&limit=` | Get ranked recommendations |

### Mood & Watch History
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/mood/log` | Log mood-before |
| POST | `/api/mood/log-after` | Log mood-after and link film |
| GET | `/api/mood/history?year=&month=` | Calendar data |
| POST | `/api/mood/watch` | Mark film as watched |
| GET | `/api/mood/watched` | Get all watched films |
| DELETE | `/api/mood/watch/:tmdb_id` | Remove from watch history |
| POST | `/api/mood/rate` | Submit helpfulness rating (1–5) with mode and mood |

### Profile & Stats
| Method | Path | Description |
|--------|------|-------------|
| PUT/GET | `/api/profile/genres` | Save / fetch genre preferences |
| GET/POST/DELETE | `/api/profile/subscriptions` | Manage streaming platforms |
| GET | `/api/profile/stats/genres` | Genre breakdown chart |
| GET | `/api/profile/stats/platforms` | Platform breakdown chart |
| GET | `/api/profile/watched-by-genre/:genre` | Films watched in a genre |
| GET | `/api/profile/watched-by-platform/:platform` | Films watched on a platform |
| POST | `/api/profile/movies/platform-labels` | Batch platform badges |
| GET | `/api/profile/me` | Current user info |
| PUT | `/api/profile/account` | Update name/email/password |
| GET | `/api/profile/export` | Download all data as JSON |
| DELETE | `/api/profile/account` | Delete account permanently |
| POST | `/api/profile/backfill-genres` | Populate missing genres from TMDB |

### Wishlist
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/wishlist` | Get wishlist |
| POST | `/api/wishlist` | Add to wishlist |
| DELETE | `/api/wishlist/:id` | Remove from wishlist |

---

## 6. Frontend Pages

| Page | Route | Key Features |
|------|-------|-------------|
| `DiscoveryFeed` | `/browse` | Mood-aware and baseline tabs, match % tooltip with component breakdown, mark watched, wishlist, search, star rating popup |
| `MoodPicker` | `/mood` | Daily mood selection |
| `MoodHistoryCalendar` | `/mood-history` | Calendar with `😊 \| 😢` per day, linked films |
| `WatchedMovies` | `/watched` | Sort by date/alpha, "Not Watched" unwatch button in modal |
| `Wishlist` | `/wishlist` | Saved films with platform badges |
| `GenreManager` | `/genres` | Manage genres + clickable genre breakdown chart with film drill-down |
| `SubscriptionManager` | `/subscriptions` | Manage platforms + clickable platform chart with film drill-down |
| `PrivacyData` | `/privacy` | GDPR export and legal document links |
| `YourAccount` | `/account` | Edit profile, delete account |

**Search bar** is available in the navbar of every page, therefore submitting navigates to `/browse?q=term` and DiscoveryFeed reads the `q` URL parameter on mount.

---

## 7. Research Data 

### `recommendation_ratings`: Primary research table

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | INTEGER | The participant |
| `tmdb_id` | INTEGER | The film that was recommended |
| `rating` | SMALLINT 1–5 | Helpfulness rating |
| `mode` | VARCHAR | `'mood-aware'` or `'baseline'`, which is the experimental condition |
| `mood` | VARCHAR | The active mood when the recommendation was generated |
| `rated_at` | TIMESTAMP | When the rating was submitted |

