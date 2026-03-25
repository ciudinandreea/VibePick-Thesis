# `App.js`: Routing & Authentication Guards

**Location:** `frontend/src/App.js`
**Role:** Defines all client-side routes and the three guard components that protect them.

---

## Route Map

| Path | Component | Guard | Notes |
|------|-----------|-------|-------|
| `/` | `About` or redirect | None | Unauthenticated → About; authenticated → SmartRedirect |
| `/about` | `About` | None | Public landing page |
| `/login` | `Login` | None | |
| `/register` | `Register` | None | |
| `/setup/genres` | `GenreSetup` | `OnboardingRoute` | Onboarding step 1 |
| `/setup/subscriptions` | `SubscriptionSetup` | `OnboardingRoute` | Onboarding step 2 |
| `/mood` | `MoodPicker` | `OnboardingRoute` | Daily mood log |
| `/browse` | `DiscoveryFeed` | `AppRoute` | Main app |
| `/movie/:id` | `MovieDetail` | `AppRoute` | |
| `/wishlist` | `Wishlist` | `AppRoute` | |
| `/subscriptions` | `SubscriptionManager` | `AppRoute` | |
| `/mood-history` | `MoodHistoryCalendar` | `AppRoute` | |
| `/watched` | `WatchedMovies` | `AppRoute` | |
| `/genres` | `GenreManager` | `AppRoute` | |
| `/privacy` | `PrivacyData` | `AppRoute` | |
| `/account` | `YourAccount` | `AppRoute` | |

---

## Guard Components

### `OnboardingRoute`
Checks authentication only. Used for setup pages and the mood picker to avoid redirect loops.

### `AppRoute`
Full guard for all main app routes. Checks in order:
1. Authenticated? → if not, `/login`
2. Setup complete? → if not, `/setup/genres`
3. Mood logged today? → if not, `/mood`

**Cross-browser setup detection:** `setupComplete_{uid}` is in `localStorage`. On a new browser where it's absent, the guard calls `GET /profile/genres` and `GET /profile/subscriptions` — if both return data, writes the flag and lets the user through. Prevents users from being sent through onboarding when they open the app in a different browser.

### `SmartRedirect`
Used at `/` and `/dashboard`. Runs the same logic as `AppRoute` but navigates to the correct destination rather than rendering children.

---

## Rules of Hooks Compliance

Both `AppRoute` and `SmartRedirect` declare all `useState` and `useEffect` calls **unconditionally at the top** of the component before any conditional returns. Auth checks happen inside `useEffect` (setting state), with redirects at the bottom based on that state.

---

## `checkSetupDone(uid)` Helper

```javascript
async function checkSetupDone(uid) {
  if (localStorage.getItem(`setupComplete_${uid}`) === 'true') return true;
  try {
    const [genreRes, subRes] = await Promise.all([
      api.get('/profile/genres'),
      api.get('/profile/subscriptions'),
    ]);
    if (genreRes.data?.genres?.length > 0 && subRes.data?.platforms?.length > 0) {
      localStorage.setItem(`setupComplete_${uid}`, 'true');
      return true;
    }
  } catch {}
  return false;
}
```
