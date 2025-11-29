const express = require('express');
const passport = require('passport');
const { body } = require('express-validator');
const { requireNoAuth, handleValidationErrors } = require('../middleware/auth');
const User = require('../models/user');

const router = express.Router();

// Local authentication routes (your existing code)
router.post('/register', 
  requireNoAuth,
  [
    body('email').isEmail(),
    body('password').isLength({ min: 6 })
  ],
  handleValidationErrors,
  async (req, res, next) => {
    // Your existing registration logic
  }
);

router.post('/login',
  requireNoAuth,
  passport.authenticate('local'),
  (req, res) => {
    res.json({
      success: true,
      message: 'Login successful',
      user: req.user
    });
  }
);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: process.env.NODE_ENV === 'production' 
      ? `${process.env.RENDER_EXTERNAL_URL}/login?error=auth_failed`
      : '/login?error=auth_failed' 
  }),
  (req, res) => {
    res.redirect(process.env.NODE_ENV === 'production'
      ? process.env.RENDER_EXTERNAL_URL
      : 'http://localhost:3000'
    );
  }
);

// GitHub OAuth routes
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
  passport.authenticate('github', { 
    failureRedirect: process.env.NODE_ENV === 'production'
      ? `${process.env.RENDER_EXTERNAL_URL}/login?error=auth_failed`
      : '/login?error=auth_failed'
  }),
  (req, res) => {
    res.redirect(process.env.NODE_ENV === 'production'
      ? process.env.RENDER_EXTERNAL_URL
      : 'http://localhost:3000'
    );
  }
);

// Logout route
router.post('/logout', (req, res) => {
  req.logout(() => {
    res.json({ success: true, message: 'Logout successful' });
  });
});

// Get current user
router.get('/me', (req, res) => {
  res.json({
    success: true,
    user: req.user || null
  });
});

module.exports = router;