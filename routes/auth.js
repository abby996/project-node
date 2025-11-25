const express = require('express');
const passport = require('passport');
const { body } = require('express-validator');
const { requireNoAuth, handleValidationErrors } = require('./middleware/auth');
const User = require('./models/User');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
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

// Register
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

// Login
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

// Google OAuth routes
router.get('/google',
  requireNoAuth,
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  requireNoAuth,
  passport.authenticate('google', { 
    failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed` 
  }),
  (req, res) => {
    // Successful authentication
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }
);

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Session destruction failed'
        });
      }
      res.clearCookie('connect.sid');
      res.json({
        success: true,
        message: 'Logout successful'
      });
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