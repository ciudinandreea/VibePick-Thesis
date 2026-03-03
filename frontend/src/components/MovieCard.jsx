import React from 'react';
import { useNavigate } from 'react-router-dom';

function MovieCard({ movie }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/movie/${movie.id}`);
  };

  const rating = movie.vote_average?.toFixed(1) || 'N/A';

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition hover:scale-105 hover:shadow-xl"
    >
      {}
      {movie.poster_url ? (
        <img 
          src={movie.poster_url} 
          alt={movie.title}
          className="w-full h-80 object-cover"
        />
      ) : (
        <div className="w-full h-80 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400">No Image</span>
        </div>
      )}
      
      {}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 truncate" title={movie.title}>
          {movie.title}
        </h3>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>⭐ {rating}</span>
          {movie.release_date && (
            <span>{new Date(movie.release_date).getFullYear()}</span>
          )}
        </div>

        {}
        {movie.genres && movie.genres.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {movie.genres.slice(0, 2).map(genre => (
              <span 
                key={genre.id}
                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
              >
                {genre.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieCard;
