require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/road_safety_db';

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'road-safety-dashboard-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 1000 * 60 * 60 * 8
  }
}));

app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));

const requireAuth = (req, res, next) => {
  if (req.session?.user) return next();
  const isApiRequest = req.baseUrl === '/api' || req.originalUrl.startsWith('/api');
  if (isApiRequest) return res.status(401).json({ error: 'Unauthorized' });
  return res.redirect('/login');
};

app.use('/auth', require('./routes/auth'));

// Routes
app.use('/api', requireAuth, require('./routes/api'));

app.get('/login', (req, res) => {
  if (req.session?.user) return res.redirect('/');
  return res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve frontend
app.get('*', (req, res) => {
  if (req.session?.user) {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  return res.redirect('/login');
});

// MongoDB connection
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected:', MONGODB_URI);
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
