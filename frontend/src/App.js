import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import DiscoveryFeed from './pages/DiscoveryFeed';
import MovieDetail from './pages/MovieDetail';
import { isAuthenticated } from './services/api';

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DiscoveryFeed />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/movie/:id" 
          element={
            <ProtectedRoute>
              <MovieDetail />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
