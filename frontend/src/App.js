import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login                from './components/Login';
import Register             from './components/Register';
import GenreSetup           from './pages/GenreSetup';
import SubscriptionSetup    from './pages/SubscriptionSetup';
import MoodPicker           from './pages/MoodPicker';
import DiscoveryFeed        from './pages/DiscoveryFeed';
import Wishlist             from './pages/Wishlist';
import SubscriptionManager  from './pages/SubscriptionManager';
import MoodHistoryCalendar  from './pages/MoodHistoryCalendar';
import WatchedMovies        from './pages/WatchedMovies';
import GenreManager         from './pages/GenreManager';
import About                from './pages/About';
import PrivacyData          from './pages/PrivacyData';
import YourAccount          from './pages/YourAccount';
import { isAuthenticated, getCurrentUser } from './services/api';

function OnboardingRoute({ children }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return children;
}

async function checkSetupDone(uid) {
  if (localStorage.getItem(`setupComplete_${uid}`) === 'true') return true;
  try {
    const { default: api } = await import('./services/api');
    const [genreRes, subRes] = await Promise.all([
      api.get('/profile/genres'),
      api.get('/profile/subscriptions'),
    ]);
    const genres = genreRes.data?.genres || [];
    const subs   = subRes.data?.platforms || [];
    if (genres.length > 0 && subs.length > 0) {
      localStorage.setItem(`setupComplete_${uid}`, 'true');
      return true;
    }
  } catch {  }
  return false;
}

function AppRoute({ children }) {
  const [status, setStatus] = useState('checking');
  const user = getCurrentUser();
  const uid  = user?.id || user?.userId || '';

  useEffect(() => {
    if (!isAuthenticated()) { setStatus('notAuthed'); return; }
    checkSetupDone(uid).then(done => {
      if (!done) { setStatus('needsSetup'); return; }
      const today    = new Date().toISOString().slice(0, 10);
      const moodDate = localStorage.getItem(`moodDate_${uid}`);
      setStatus(moodDate === today ? 'ok' : 'needsMood');
    });
  }, [uid]);

  if (status === 'checking')   return null;
  if (status === 'notAuthed')  return <Navigate to="/login" replace />;
  if (status === 'needsSetup') return <Navigate to="/setup/genres" replace />;
  if (status === 'needsMood')  return <Navigate to="/mood" replace />;
  return children;
}

function SmartRedirect() {
  const [dest, setDest] = useState(null);
  const user = getCurrentUser();
  const uid  = user?.id || user?.userId || '';

  useEffect(() => {
    if (!isAuthenticated()) { setDest('/login'); return; }
    checkSetupDone(uid).then(done => {
      if (!done) { setDest('/setup/genres'); return; }
      const today    = new Date().toISOString().slice(0, 10);
      const moodDate = localStorage.getItem(`moodDate_${uid}`);
      setDest(moodDate === today ? '/browse' : '/mood');
    });
  }, [uid]);

  if (!dest) return null;
  return <Navigate to={dest} replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {}
        <Route path="/about"           element={<About />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />

        {}
        <Route path="/setup/genres"        element={<OnboardingRoute><GenreSetup /></OnboardingRoute>} />
        <Route path="/setup/subscriptions" element={<OnboardingRoute><SubscriptionSetup /></OnboardingRoute>} />

        {}
        <Route path="/mood" element={<OnboardingRoute><MoodPicker/></OnboardingRoute>} />

        {}
        <Route path="/browse"       element={<AppRoute><DiscoveryFeed /></AppRoute>} />
        <Route path="/wishlist"     element={<AppRoute><Wishlist /></AppRoute>} />
        <Route path="/subscriptions" element={<AppRoute><SubscriptionManager /></AppRoute>} />
        <Route path="/mood-history" element={<AppRoute><MoodHistoryCalendar /></AppRoute>} />
        <Route path="/watched"      element={<AppRoute><WatchedMovies /></AppRoute>} />
        <Route path="/genres"       element={<AppRoute><GenreManager /></AppRoute>} />
        <Route path="/privacy"      element={<AppRoute><PrivacyData /></AppRoute>} />
        <Route path="/account"      element={<AppRoute><YourAccount /></AppRoute>} />

        {}
        <Route path="/dashboard" element={<SmartRedirect />} />
        <Route path="/"          element={isAuthenticated() ? <SmartRedirect /> : <About />} />
      </Routes>
    </Router>
  );
}