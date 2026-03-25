# `moodMapping.js`: Mood-to-Genre Scoring Config

**Location:** `backend/config/moodMapping.js`
**Role:** The data layer of the recommendation algorithm. Defines how strongly each TMDB genre matches each mood, and provides the integer-to-name mapping for TMDB genre IDs.

---

## `MOOD_GENRE_SCORES`

The core lookup table. For each mood, maps genre name → relevance score (0.0–1.0).

Genres **not listed** for a mood score **0**, not 0.5. This intentionally penalises mismatched films; a Horror film when the user is happy should rank low, not neutral.

### 😊 Happy
*Goal: maintain or enhance a good mood. Light, joyful, uplifting content.*

| Genre | Score | Rationale |
|-------|:-----:|-----------|
| Comedy | **1.0** | Primary match; laughter reinforces happiness |
| Musical | **0.9** | Celebratory, energetic |
| Romance | **0.9** | Warmth and feel-good emotion |
| Family | **0.9** | Wholesome, safe, positive |
| Animation | **0.8** | Bright, imaginative, rarely dark |
| Adventure | **0.6** | Fun energy |
| Fantasy | **0.6** | Escapism without heaviness |
| Action | **0.5** | Neutral; some fun but can be tense |
| Drama | **0.4** | Often emotionally demanding |
| Thriller | **0.3** | Tension clashes with happiness |
| War | **0.3** | Dark themes |
| Horror | **0.2** | Fear is counter to happiness |

### 😢 Sad
*Goal: comfort, gentle catharsis, emotional validation. Not avoidance.*

| Genre | Score | Rationale |
|-------|:-----:|-----------|
| Drama | **0.9** | Validates the emotion, provides catharsis |
| Romance | **0.8** | Human connection and warmth |
| Family | **0.8** | Comfort and safety |
| Comedy | **0.7** | Light comedy can help lift a sad mood |
| Musical | **0.7** | Emotionally resonant |
| Animation | **0.6** | Gentle, often hopeful |
| Documentary | **0.6** | Can be comforting |
| Fantasy | **0.5** | Escapism |
| Thriller | **0.2** | Too stressful |
| War | **0.2** | Amplifies grief |
| Horror | **0.1** | Fear compounds sadness |

### 😰 Stressed
*Goal: reduce anxiety, help the user unwind. Low-stakes, calming content.*

| Genre | Score | Rationale |
|-------|:-----:|-----------|
| Comedy | **0.9** | Laughter directly reduces stress |
| Family | **0.8** | Wholesome, predictable |
| Animation | **0.8** | Visually simple, low cognitive demand |
| Documentary | **0.7** | Nature/travel docs are calming |
| Musical | **0.6** | Relaxing |
| Romance | **0.6** | Gentle emotional content |
| Fantasy | **0.5** | Escapism |
| Action | **0.3** | Too intense |
| Thriller | **0.1** | Directly increases anxiety |
| Horror | **0.1** | Heightens stress |
| War | **0.1** | Heavy and distressing |

### 😴 Tired
*Goal: easy, familiar, low-engagement content. Nothing requiring concentration.*

| Genre | Score | Rationale |
|-------|:-----:|-----------|
| Comedy | **0.9** | Effortless, laughter without effort |
| Animation | **0.8** | Visually simple |
| Family | **0.8** | Safe and predictable |
| Romance | **0.7** | Low stakes, warm |
| Fantasy | **0.5** | Varies; can be simple or complex |
| Documentary | **0.4** | Sometimes requires focus |
| Drama | **0.3** | Emotionally demanding |
| Action | **0.3** | Too loud and stimulating |
| Mystery | **0.3** | Requires concentration |
| Thriller | **0.2** | Tension keeps you on edge |
| Horror | **0.1** | Worst match; fear and adrenaline |

### 🤩 Excited
*Goal: match and amplify the energy. High-intensity, fast-paced content.*

| Genre | Score | Rationale |
|-------|:-----:|-----------|
| Action | **1.0** | Perfect energy match |
| Adventure | **0.9** | High stakes, forward momentum |
| Thriller | **0.9** | Tension and suspense |
| Science Fiction | **0.8** | Spectacle and big ideas |
| Fantasy | **0.8** | Epic and immersive |
| Mystery | **0.7** | Engaging, mentally stimulating |
| Horror | **0.7** | Adrenaline matches excitement |
| Crime | **0.6** | Clever and tense |
| Drama | **0.5** | Can work if compelling |
| Comedy | **0.4** | Fun but not high-energy |
| Documentary | **0.4** | Usually too slow |
| Romance | **0.3** | Too slow-paced |

### 😐 Bored
*Goal: discover something unexpected. Novelty is the priority.*

All listed genres score **0.7** equally. The discover pool deliberately uses less-common genres (Mystery, Sci-Fi, Crime, Western, History) to push novelty rather than comfort-zone genres.

| Genre | Score |
|-------|:-----:|
| Action, Comedy, Drama, Thriller, Science Fiction, Fantasy, Mystery, Adventure, Crime | **0.7** |
| Romance, Horror, Animation | **0.6** |

---

## `GENRE_IDS`

Maps TMDB integer genre IDs to name strings. Used by `getMovieGenreNames()` to normalise TMDB API responses.

```javascript
{ 28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western' }
```

## `GENRE_NAMES` *(reverse map)*

Maps genre name strings to TMDB integer IDs. Used by `recommendations.js` to convert the user's saved genre name preferences into TMDB genre IDs for the baseline discover pool.

---

## Quick Reference Table

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

`—` = genre not listed for that mood, scores **0**.
