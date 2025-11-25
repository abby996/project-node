const { validationResult } = require('express-validator');

// Check if user is authenticated
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({
    success: false,
    message: 'Authentication required. Please log in.'
  });
};

// Check if user is not authenticated (for routes like login/register)
const requireNoAuth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  return res.status(400).json({
    success: false,
    message: 'You are already logged in.'
  });
};

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  requireAuth,
  requireNoAuth,
  handleValidationErrors
};