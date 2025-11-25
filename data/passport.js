const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');

// Local Strategy
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    });
    
    if (!user) {
      return done(null, false, { message: 'Invalid email or password' });
    }
    
    if (!user.password) {
      return done(null, false, { message: 'Please use OAuth login' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return done(null, false, { message: 'Invalid email or password' });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = await User.findOne({
      $or: [
        { oauthId: profile.id },
        { email: profile.emails[0].value }
      ]
    });
    
    if (user) {
      // Update OAuth info if logging in with Google for the first time
      if (!user.oauthProvider) {
        user.oauthProvider = 'google';
        user.oauthId = profile.id;
        await user.save();
      }
      return done(null, user);
    }
    
    // Create new user
    user = new User({
      username: profile.emails[0].value.split('@')[0],
      email: profile.emails[0].value,
      oauthProvider: 'google',
      oauthId: profile.id,
      profile: {
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        avatar: profile.photos[0].value
      }
    });
    
    await user.save();
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;