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
import { isAuthenticated, getCurrentUser } from './services/api';

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function SmartRedirect() {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  const user   = getCurrentUser();
  const uid    = user?.id || user?.userId || '';
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
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />

        {}
        <Route path="/setup/genres"        element={<ProtectedRoute><GenreSetup /></ProtectedRoute>} />
        <Route path="/setup/subscriptions" element={<ProtectedRoute><SubscriptionSetup /></ProtectedRoute>} />

        {}
        <Route path="/mood" element={<ProtectedRoute><MoodPicker/></ProtectedRoute>} />

        {}
        <Route path="/browse"       element={<ProtectedRoute><DiscoveryFeed /></ProtectedRoute>} />
        <Route path="/movie/:id"    element={<ProtectedRoute><MovieDetail /></ProtectedRoute>} />
        <Route path="/wishlist"     element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/subscriptions" element={<ProtectedRoute><SubscriptionManager /></ProtectedRoute>} />
        <Route path="/mood-history" element={<ProtectedRoute><MoodHistoryCalendar /></ProtectedRoute>} />

        {}
        <Route path="/dashboard" element={<SmartRedirect />} />
        <Route path="/"          element={<SmartRedirect />} />
      </Routes>
    </Router>
  );
}
