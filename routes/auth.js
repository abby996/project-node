const express = require('express');
const passport = require('passport');
const { body } = require('express-validator');
const { requireNoAuth, handleValidationErrors } = require('../middleware/auth');
const User = require('../models/user'); 

const router = express.Router();

// Validation rules
const registerValidation = [
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
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Register route
router.post('/register', 
  requireNoAuth,
  registerValidation,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { username, email, password } = req.body;

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

      // Log in user automatically after registration
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.status(201).json({
          success: true,
          message: 'Registration successful',
          user: user
        });
      });
    } catch (error) {
      next(error);
    }
  }
);

// Login route
router.post('/login',
  requireNoAuth,
  loginValidation,
  handleValidationErrors,
  (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({
          success: false,
          message: info.message || 'Authentication failed'
        });
      }
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({
          success: true,
          message: 'Login successful',
          user: user
        });
      });
    })(req, res, next);
  }
);

// Logout route
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
    res.json({
      success: true,
      message: 'Logout successful'
    });
  });
});

// Get current user
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      success: true,
      user: req.user
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }
});

module.exports = router;