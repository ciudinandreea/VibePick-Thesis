import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../services/api';
import api from '../services/api';
import MoodSelector from '../components/MoodSelector';

function Recommendations() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [mode, setMode] = useState('mood-aware');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();
  const user = getCurrentUser();

  const fetchRecommendations = async () => {
    if (!selectedMood) {
      setError('Please select a mood first');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await api.get(`/recommendations?mood=${selectedMood}&mode=${mode}`);
      setMovies(response.data.recommendations || []);
      setHasSearched(true);
      
    } catch (err) {
      setError('Failed to get recommendations. Please try again.');
      console.error('Recommendation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    setHasSearched(false);
  };

  const toggleMode = () => {
    const newMode = mode === 'mood-aware' ? 'baseline' : 'mood-aware';
    setMode(newMode);
    setHasSearched(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {}
      <nav className="bg-white shadow-md p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">VibePick</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Welcome, {user?.email}</span>
            <button
              onClick={() => navigate('/browse')}
              className="text-blue-600 hover:text-blue-800"
            >
              Browse Movies
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {}
        <MoodSelector 
          selectedMood={selectedMood}
          onMoodSelect={handleMoodSelect}
        />

        {}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-2">Recommendation Mode</h3>
              <p className="text-sm text-gray-600">
                {mode === 'mood-aware' 
                  ? 'Recommendations based on your mood and preferences'
                  : 'Recommendations based only on your watch history and preferences (no mood)'
                }
              </p>
            </div>
            <button
              onClick={toggleMode}
              className={`
                px-6 py-3 rounded-lg font-semibold transition-all
                ${mode === 'mood-aware'
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }
              `}
            >
              {mode === 'mood-aware' ? '🎭 Mood-Aware' : '📊 History-Only'}
            </button>
          </div>
        </div>

        {}
        {selectedMood && !hasSearched && (
          <div className="text-center mb-8">
            <button
              onClick={fetchRecommendations}
              className="bg-green-500 text-white px-8 py-4 rounded-lg text-xl font-bold hover:bg-green-600 transform hover:scale-105 transition-all shadow-lg"
            >
              🎬 Get Recommendations
            </button>
          </div>
        )}

        {}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Finding perfect movies for you...</p>
          </div>
        )}

        {}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {}
        {hasSearched && !loading && movies.length > 0 && (
          <>
            <h2 className="text-3xl font-bold mb-6">
              {mode === 'mood-aware' 
                ? `Recommended for when you're feeling ${selectedMood} 😊`
                : 'Recommended based on your history'
              }
            </h2>

            {}
            <div className="text-center mt-8">
              <button
                onClick={fetchRecommendations}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
              >
                🔄 Refresh Recommendations
              </button>
            </div>
          </>
        )}

        {}
        {hasSearched && !loading && movies.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-600 text-xl">No recommendations found. Try a different mood!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Recommendations;
