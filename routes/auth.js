const express = require('express');
const passport = require('passport');
const { body } = require('express-validator');
const { requireNoAuth, handleValidationErrors } = require('../middleware/auth');
const User = require('../models/user');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Local authentication (register/login)
 *   - name: OAuth
 *     description: Google & GitHub OAuth
 */

/* ----------------------- REGISTER ----------------------- */
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Registration successful
 *       409:
 *         description: User already exists
 */
router.post(
  '/register',
  requireNoAuth,
  [
    body('username').isLength({ min: 3, max: 30 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { username, email, password } = req.body;

      const exists = await User.findOne({ $or: [{ email }, { username }] });
      if (exists)
        return res.status(409).json({ success: false, message: "User already exists" });

      const user = new User({ username, email, password });
      await user.save();

      req.login(user, (err) => {
        if (err) return next(err);

        res.status(201).json({
          success: true,
          message: "Registration successful",
          user
        });
      });
    } catch (err) {
      next(err);
    }
  }
);

/* ----------------------- LOGIN ----------------------- */
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user (local authentication)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post(
  '/login',
  requireNoAuth,
  passport.authenticate('local'),
  (req, res) => {
    res.json({ success: true, message: 'Login successful', user: req.user });
  }
);

/* ----------------------- LOGOUT ----------------------- */
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout current user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post('/logout', (req, res) => {
  req.logout(() => {
    res.json({ success: true, message: "Logged out" });
  });
});

/* ----------------------- CURRENT USER ----------------------- */
/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Returns user or null
 */
router.get('/me', (req, res) => {
  res.json({ success: true, user: req.user || null });
});

/* ----------------------- GOOGLE OAUTH ----------------------- */
/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Start Google OAuth flow
 *     tags: [OAuth]
 *     responses:
 *       302:
 *         description: Redirect to Google
 */
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [OAuth]
 *     responses:
 *       302:
 *         description: Redirect after Google login
 */
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/oauth-failure' }),
  (req, res) => {
    res.redirect(process.env.NODE_ENV === 'production'
      ? process.env.RENDER_EXTERNAL_URL
      : 'http://localhost:3000'
    );
  }
);

/* ----------------------- GITHUB OAUTH ----------------------- */
/**
 * @swagger
 * /auth/github:
 *   get:
 *     summary: Start GitHub OAuth flow
 *     tags: [OAuth]
 *     responses:
 *       302:
 *         description: Redirect to GitHub
 */
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

/**
 * @swagger
 * /auth/github/callback:
 *   get:
 *     summary: GitHub OAuth callback
 *     tags: [OAuth]
 *     responses:
 *       302:
 *         description: Redirect after GitHub login
 */
router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/auth/oauth-failure' }),
  (req, res) => {
    res.redirect(process.env.NODE_ENV === 'production'
      ? process.env.RENDER_EXTERNAL_URL
      : 'http://localhost:3000'
    );
  }
);

/* ----------------------- OAUTH FAILURE ----------------------- */
router.get('/oauth-failure', (req, res) => {
  res.status(401).json({
    success: false,
    message: 'OAuth authentication failed'
  });
});

/* ----------------------- OAUTH STATUS ----------------------- */
router.get('/oauth-status', (req, res) => {
  res.json({
    success: true,
    google: { enabled: !!process.env.GOOGLE_CLIENT_ID },
    github: { enabled: !!process.env.GITHUB_CLIENT_ID }
  });
});

module.exports = router;
