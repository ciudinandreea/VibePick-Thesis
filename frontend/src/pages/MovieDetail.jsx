import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieDetails } from '../services/movies';

function MovieDetail() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      const data = await getMovieDetails(id);
      setMovie(data);
      setError('');
    } catch (err) {
      setError('Failed to load movie details');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Back to Movies
          </button>
        </div>
      </div>
    );
  }

  const rating = movie.vote_average?.toFixed(1);
  const runtime = movie.runtime ? `${movie.runtime} min` : 'N/A';

  return (
    <div className="min-h-screen bg-gray-100">
      {}
      <div className="bg-white shadow-md p-4">
        <div className="container mx-auto">
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Movies
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {}
          {movie.backdrop_url && (
            <div className="w-full h-96 bg-gray-200">
              <img 
                src={movie.backdrop_url} 
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {}
              {movie.poster_url && (
                <div className="flex-shrink-0">
                  <img 
                    src={movie.poster_url} 
                    alt={movie.title}
                    className="w-64 rounded-lg shadow-lg"
                  />
                </div>
              )}

              {}
              <div className="flex-grow">
                <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
                
                {movie.tagline && (
                  <p className="text-xl text-gray-600 italic mb-4">
                    "{movie.tagline}"
                  </p>
                )}

                <div className="flex items-center gap-6 mb-6 text-gray-700">
                  <span className="flex items-center gap-1">
                    ⭐ <strong>{rating}</strong> / 10
                  </span>
                  <span>{new Date(movie.release_date).getFullYear()}</span>
                  <span>{runtime}</span>
                </div>

                {}
                {movie.genres && movie.genres.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Genres:</h3>
                    <div className="flex flex-wrap gap-2">
                      {movie.genres.map(genre => (
                        <span 
                          key={genre.id}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {}
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-2">Overview:</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {movie.overview || 'No overview available.'}
                  </p>
                </div>

                {}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {movie.budget > 0 && (
                    <div>
                      <span className="font-semibold">Budget:</span>
                      <span className="ml-2">${movie.budget.toLocaleString()}</span>
                    </div>
                  )}
                  {movie.revenue > 0 && (
                    <div>
                      <span className="font-semibold">Revenue:</span>
                      <span className="ml-2">${movie.revenue.toLocaleString()}</span>
                    </div>
                  )}
                  {movie.status && (
                    <div>
                      <span className="font-semibold">Status:</span>
                      <span className="ml-2">{movie.status}</span>
                    </div>
                  )}
                </div>

                {}
                <div className="mt-8">
                  <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition">
                    Save to Wishlist
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;
