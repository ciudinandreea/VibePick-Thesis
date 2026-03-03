import React from 'react';

const MOODS = [
  { id: 'happy', emoji: '😊', label: 'Happy', color: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-400' },
  { id: 'sad', emoji: '😢', label: 'Sad', color: 'bg-blue-100 hover:bg-blue-200 border-blue-400' },
  { id: 'stressed', emoji: '😰', label: 'Stressed', color: 'bg-red-100 hover:bg-red-200 border-red-400' },
  { id: 'tired', emoji: '😴', label: 'Tired', color: 'bg-purple-100 hover:bg-purple-200 border-purple-400' },
  { id: 'excited', emoji: '🤩', label: 'Excited', color: 'bg-orange-100 hover:bg-orange-200 border-orange-400' },
  { id: 'bored', emoji: '😐', label: 'Bored', color: 'bg-gray-100 hover:bg-gray-200 border-gray-400' }
];

function MoodSelector({ selectedMood, onMoodSelect }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-center">
        How are you feeling?
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {MOODS.map(mood => (
          <button
            key={mood.id}
            onClick={() => onMoodSelect(mood.id)}
            className={`
              p-4 rounded-lg border-2 transition-all
              ${mood.color}
              ${selectedMood === mood.id 
                ? 'ring-4 ring-blue-500 scale-105' 
                : 'hover:scale-105'
              }
            `}
          >
            <div className="text-5xl mb-2">{mood.emoji}</div>
            <div className="font-semibold text-sm">{mood.label}</div>
          </button>
        ))}
      </div>

      {selectedMood && (
        <div className="mt-4 text-center text-gray-600">
          Selected: {MOODS.find(m => m.id === selectedMood)?.emoji} {' '}
          <span className="font-semibold capitalize">{selectedMood}</span>
        </div>
      )}
    </div>
  );
}

export default MoodSelector;
