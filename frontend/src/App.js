import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login                from './components/Login';
import Register             from './components/Register';
import GenreSetup           from './pages/GenreSetup';
import SubscriptionSetup    from './pages/SubscriptionSetup';
import MoodPicker           from './pages/MoodPicker';
import DiscoveryFeed        from './pages/DiscoveryFeed';
import MovieDetail          from './pages/MovieDetail';
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

function AppRoute({ children }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  const user = getCurrentUser();
  const uid  = user?.id || user?.userId || '';
  const setupDone = localStorage.getItem(`setupComplete_${uid}`) === 'true';
  if (!setupDone) return <Navigate to="/setup/genres" replace />;
  const today    = new Date().toISOString().slice(0, 10);
  const moodDate = localStorage.getItem(`moodDate_${uid}`);
  if (moodDate !== today) return <Navigate to="/mood" replace />;
  return children;
}

function SmartRedirect() {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  const user = getCurrentUser();
  const uid  = user?.id || user?.userId || '';
  const setupDone = localStorage.getItem(`setupComplete_${uid}`) === 'true';
  if (!setupDone) return <Navigate to="/setup/genres" replace />;
  const today    = new Date().toISOString().slice(0, 10);
  const moodDate = localStorage.getItem(`moodDate_${uid}`);
  if (moodDate !== today) return <Navigate to="/mood" replace />;
  return <Navigate to="/browse" replace />;
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
        <Route path="/movie/:id"    element={<AppRoute><MovieDetail /></AppRoute>} />
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