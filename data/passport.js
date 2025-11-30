const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

// LOCAL STRATEGY
passport.use(new LocalStrategy({
  usernameField: 'email'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) return done(null, false, { message: 'Invalid credentials' });
    if (!user.password) return done(null, false, { message: 'Use OAuth login' });

    const match = await user.comparePassword(password);
    if (!match) return done(null, false, { message: 'Invalid credentials' });

    return done(null, user);
  } catch (e) {
    return done(e);
  }
}));

/* --------------------------
    GOOGLE OAUTH
--------------------------- */
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const GoogleStrategy = require('passport-google-oauth20').Strategy;

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'production'
      ? `${process.env.RENDER_EXTERNAL_URL}/auth/google/callback`
      : "http://localhost:3000/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value || null;
      const avatar = profile.photos?.[0]?.value || null;

      let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });

      if (user) {
        if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }
        return done(null, user);
      }

      user = await User.create({
        googleId: profile.id,
        username: email ? email.split('@')[0] : profile.id,
        email,
        profile: {
          firstName: profile.name?.givenName || null,
          lastName: profile.name?.familyName || null,
          avatar
        }
      });

      done(null, user);

    } catch (e) {
      done(e);
    }
  }));

  console.log('Google OAuth loaded');
}

/* --------------------------
    GITHUB OAUTH
--------------------------- */
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  const GitHubStrategy = require('passport-github2').Strategy;

  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'production'
      ? `${process.env.RENDER_EXTERNAL_URL}/auth/github/callback`
      : "http://localhost:3000/auth/github/callback",
    scope: ['user:email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value || `${profile.username}@noemail.local`;
      const avatar = profile.photos?.[0]?.value || null;

      let user = await User.findOne({ $or: [{ githubId: profile.id }, { email }] });

      if (user) {
        if (!user.githubId) {
          user.githubId = profile.id;
          await user.save();
        }
        return done(null, user);
      }

      user = await User.create({
        githubId: profile.id,
        username: profile.username,
        email,
        profile: {
          firstName: profile.displayName || null,
          avatar
        }
      });

      done(null, user);

    } catch (e) {
      done(e);
    }
  }));

  console.log('GitHub OAuth loaded');
}

/* --------------------------
    SESSION HANDLING
--------------------------- */

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (e) {
    done(e);
  }
});

module.exports = passport;
