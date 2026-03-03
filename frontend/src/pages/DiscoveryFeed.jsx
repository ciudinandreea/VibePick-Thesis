import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPopularMovies, searchMovies } from '../services/movies';
import { logout, getCurrentUser } from '../services/api';
import MovieCard from '../components/MovieCard';

function DiscoveryFeed() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const data = await getPopularMovies();
      setMovies(data.results);
      setError('');
      setIsSearching(false);
    } catch (err) {
      setError('Failed to load movies. Please try again.');
      console.error('Error fetching movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      fetchMovies(); 
      return;
    }

    try {
      setLoading(true);
      const data = await searchMovies(searchQuery);
      setMovies(data.results);
      setError('');
      setIsSearching(true);
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    fetchMovies();
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
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {}
      <div className="container mx-auto px-4 py-8">
        {}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for movies..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              Search
            </button>
            {isSearching && (
              <button
                type="button"
                onClick={clearSearch}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        <h2 className="text-3xl font-bold mb-6">
          {isSearching ? `Search Results for "${searchQuery}"` : 'Popular Movies'}
        </h2>

        {}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading movies...</p>
          </div>
        )}

        {}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
            <button 
              onClick={fetchMovies}
              className="ml-4 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {movies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}

        {}
        {!loading && !error && movies.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-600 text-xl mb-4">
              No movies found{isSearching && ` for "${searchQuery}"`}
            </p>
            {isSearching && (
              <button 
                onClick={clearSearch}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
              >
                Show Popular Movies
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DiscoveryFeed;
