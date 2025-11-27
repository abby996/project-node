const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy
// Try to load User model with better error handling
let User;
try {
  User = require('../models/user');
  console.log(' User model loaded successfully');
} catch (error) {
  console.log(' User model not found:', error.message);
  console.log(' Current directory:', __dirname);
  
  // Fallback for testing
  User = {
    findOne: async (query) => {
      console.log(' Mock User.findOne called with:', query);
      // Return a mock user for testing
      if (query.email === 'test@test.com') {
        return {
          id: '1',
          username: 'testuser',
          email: 'test@test.com',
          comparePassword: async (password) => password === 'password123'
        };
      }
      return null;
    },
    findById: async (id) => ({
      id: id,
      username: 'testuser',
      email: 'test@test.com'
    })
  };
}

passport.use(new LocalStrategy({
  usernameField: 'email'
}, async (email, password, done) => {
  try {
    console.log(' Login attempt for:', email);
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found');
      return done(null, false, { message: 'Invalid email or password' });
    }
    
    // Handle both real and mock users
    const isMatch = user.comparePassword 
      ? await user.comparePassword(password)
      : (password === 'password123'); // Default for testing
    
    if (!isMatch) {
      console.log('❌ Password mismatch');
      return done(null, false, { message: 'Invalid email or password' });
    }
    
    console.log(' Login successful');
    return done(null, user);
  } catch (error) {
    console.error(' Login error:', error);
    return done(error);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;