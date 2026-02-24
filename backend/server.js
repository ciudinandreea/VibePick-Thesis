const express = require('express');
const cors = require('cors');
const authMiddleware = require('./middleware/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({
    message: 'You accessed a protected route!',
    user: req.user
  });
});

app.use(cors()); 
app.use(express.json()); 

const authRoutes = require('./routes/auth');

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('VibePick API is running!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

