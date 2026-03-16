const express = require('express');

const router = express.Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  req.session.user = { username: ADMIN_USERNAME };
  return res.json({ ok: true, username: ADMIN_USERNAME });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

router.get('/me', (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ authenticated: false });
  }

  return res.json({ authenticated: true, user: req.session.user });
});

module.exports = router;
