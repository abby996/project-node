const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');   // ✅ FIXED
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./data/database');
const passport = require('./data/passport');
const authRoutes = require('./routes/auth');
const swaggerSetup = require('./swagger');
const { requireAuth } = require('./middleware/auth');

dotenv.config();

// Connect DB
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// =============================
// ✅ SESSION FIXED
// =============================
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Trust proxy for Render
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Passport
app.use(passport.initialize());
app.use(passport.session());

// =============================
// 🚀 SWAGGER
// =============================
swaggerSetup(app);

// =============================
// 🚀 ROUTES
// =============================
app.use('/auth', authRoutes);
app.use('/api/items', require('./routes/items'));
app.use('/api/users', require('./routes/users'));

app.get('/api/protected-data', requireAuth, (req, res) => {
  res.json({
    success: true,
    message: 'This is protected data',
    user: req.user,
    data: ['secret1', 'secret2', 'secret3']
  });
});

// =============================
// 🚀 SWAGGER UI
// =============================
let swaggerDocument;
try {
  swaggerDocument = require('./swagger_output.json');
} catch (err) {
  swaggerDocument = {
    openapi: '3.0.0',
    info: { title: 'Project Node API', version: '1.0.0' },
    paths: {}
  };
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/api-docs.json', (req, res) => {
  res.json(swaggerDocument);
});

// ROOT ROUTE
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      items: '/api/items',
      users: '/api/users',
      auth: '/auth',
      protected: '/api/protected-data',
      docs: '/api-docs'
    }
  });
});

// HEALTH
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server running',
    environment: process.env.NODE_ENV,
    user: req.user ? 'Authenticated' : 'Not authenticated'
  });
});

// 404 HANDLER
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// ERROR HANDLER
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger: http://localhost:${PORT}/api-docs`);
});
