# `api.js`: Frontend API Service

**Location:** `frontend/src/services/api.js`
**Role:** Single point of communication between the React frontend and the Express backend. Every API call in the app goes through this file.

---

## Setup

Uses `axios` with base URL `http://localhost:5000/api`. All requests automatically attach the JWT token from `sessionStorage` via an interceptor.

---

## Storage

| Item | Storage | Reason |
|------|---------|--------|
| JWT token | `sessionStorage` | Cleared on tab close; forces re-login for security |
| User object | `localStorage` | Persists so the navbar shows the user's name without an API call |
| `setupComplete_{uid}` | `localStorage` | Cross-browser onboarding check; set after server confirms genres+subscriptions |
| `moodDate_{uid}` | `localStorage` | Tracks whether today's mood has been logged |
| `currentMood` | `localStorage` | Stores the active mood so the Discovery Feed can read it across rerenders |

---

## Exported Functions

### Auth
- `register(fullName, email, password)` — Creates account
- `login(email, password)` — Stores JWT in `sessionStorage`, user object in `localStorage`
- `logout()` — Clears session token and user. Does **not** clear `setupComplete_{uid}`. This is intentional, so returning users don't repeat onboarding
- `getCurrentUser()` — Returns parsed user object from `localStorage`
- `isAuthenticated()` — Returns `true` if JWT exists in `sessionStorage`

### Default Export
`api` — the configured Axios instance, used directly by all pages:
```javascript
await api.get('/recommendations?mood=tired&mode=mood-aware');
await api.post('/mood/watch', { tmdb_id: 550, title: 'Fight Club' });
await api.delete('/mood/watch/550');
```
