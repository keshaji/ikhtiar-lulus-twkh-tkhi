const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ikhtiar-tkhi')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/materi', require('./routes/materi'));
app.use('/api/soal', require('./routes/soal'));
app.use('/api/latihan', require('./routes/latihan'));
app.use('/api/info', require('./routes/info'));
app.use('/api/guest', require('./routes/guest'));
app.use('/api/admin', require('./routes/admin'));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
