const MOOD_GENRE_SCORES = {
  happy: {
    'Comedy': 1.0,
    'Musical': 0.9,
    'Romance': 0.9,
    'Family': 0.9,
    'Animation': 0.8,
    'Adventure': 0.6,
    'Fantasy': 0.6,
    'Action': 0.5,
    'Drama': 0.4,
    'Thriller': 0.3,
    'War': 0.3,
    'Horror': 0.2
  },
  sad: {
    'Drama': 0.9,
    'Romance': 0.8,
    'Family': 0.8,
    'Comedy': 0.7, 
    'Musical': 0.7,
    'Animation': 0.6,
    'Documentary': 0.6,
    'Fantasy': 0.5,
    'Thriller': 0.2,
    'War': 0.2,
    'Horror': 0.1
  },
  stressed: {
    'Comedy': 0.9,
    'Family': 0.8,
    'Animation': 0.8,
    'Documentary': 0.7, 
    'Musical': 0.6,
    'Romance': 0.6,
    'Fantasy': 0.5,
    'Action': 0.3, 
    'Thriller': 0.1,
    'Horror': 0.1,
    'War': 0.1
  },
  tired: {
    'Comedy': 0.9,
    'Animation': 0.8,
    'Family': 0.8,
    'Romance': 0.7,
    'Fantasy': 0.5,
    'Documentary': 0.4,
    'Drama': 0.3, 
    'Action': 0.3,
    'Mystery': 0.3, 
    'Thriller': 0.2,
    'Horror': 0.1
  },
  excited: {
    'Action': 1.0,
    'Adventure': 0.9,
    'Thriller': 0.9,
    'Science Fiction': 0.8,
    'Fantasy': 0.8,
    'Mystery': 0.7,
    'Horror': 0.7,
    'Crime': 0.6,
    'Drama': 0.5,
    'Comedy': 0.4,
    'Documentary': 0.4,
    'Romance': 0.3
  },
  bored: {
    'Action': 0.7,
    'Comedy': 0.7,
    'Drama': 0.7,
    'Thriller': 0.7,
    'Science Fiction': 0.7,
    'Fantasy': 0.7,
    'Mystery': 0.7,
    'Adventure': 0.7,
    'Crime': 0.7,
    'Romance': 0.6,
    'Horror': 0.6,
    'Animation': 0.6
  }
};

const GENRE_IDS = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  27: 'Horror',
  10402: 'Musical',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  53: 'Thriller',
  10752: 'War',
};

const GENRE_NAMES = Object.fromEntries(
  Object.entries(GENRE_IDS).map(([id, name]) => [name, parseInt(id)])
);

module.exports = {
  MOOD_GENRE_SCORES,
  GENRE_IDS,
  GENRE_NAMES
};
