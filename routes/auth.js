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
    body('username')
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters'),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { username, email, password } = req.body;

      console.log(' Registration attempt:', { username, email });

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email or username already exists'
        });
      }

      // Create new user
      const user = new User({
        username,
        email,
        password
      });

      await user.save();
      console.log(' User saved to database:', user.email);

      // Log in user automatically after registration
      req.login(user, (err) => {
        if (err) {
          console.error(' Login after registration failed:', err);
          return next(err);
        }
        
        console.log(' Registration and login successful for:', user.email);
        return res.status(201).json({
          success: true,
          message: 'Registration successful',
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt
          }
        });
      });
    } catch (error) {
      console.error(' Registration error:', error);
      next(error);
    }
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