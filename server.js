const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./data/database'); // 
const passport = require('./data/passport'); // 
const authRoutes = require('./routes/auth'); //
const swaggerSetup = require('./swagger'); //

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();


// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/project-node', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));



// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Swagger documentation
swaggerSetup(app);

// Routes
app.use('/auth', authRoutes);

// Protected route example
app.get('/api/protected-data', requireAuth, (req, res) => {
  res.json({
    success: true,
    message: 'This is protected data',
    user: req.user,
    data: ['secret1', 'secret2', 'secret3']
  });
});



// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(error.errors).map(e => e.message)
    });
  }
  
  if (error.name === 'MongoError' && error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate key error'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});




// Routes
app.use('/api/items', require('./routes/items'));
app.use('/api/users', require('./routes/users'));

// Swagger UI (serves generated swagger_output.json if present)
let swaggerDocument = null;
try {
    // prefer generated file
    // eslint-disable-next-line global-require
    swaggerDocument = require('./swagger_output.json');
} catch (err) {
    // fallback basic doc
    swaggerDocument = {
        openapi: '3.0.0',
        info: { title: 'Project Node API', version: '1.0.0' },
        paths: {}
    };
}
// Log when Swagger UI is accessed, then serve it
app.use('/api-docs', (req, res, next) => {
    console.log(` Swagger UI requested: ${req.method} ${req.originalUrl}`);
    next();
}, swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Serve the raw generated swagger JSON and log access
app.get('/api-docs.json', (req, res) => {
    console.log(` Swagger JSON requested: ${req.method} ${req.originalUrl}`);
    res.json(swaggerDocument);
});

// Basic route
app.get('/', (req, res) => {
    res.json({ 
        success: true,
        message: ' API is working!',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/health',
            items: '/api/items',
            users: '/api/users'
        }
    });
});

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: ' Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Handle undefined routes (404)
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: ` Route not found: ${req.method} ${req.originalUrl}`,
        availableEndpoints: [
            'GET /',
            'GET /health',
            'GET /api/items',
            'POST /api/items',
            'GET /api/items/:id',
            'PUT /api/items/:id',
            'DELETE /api/items/:id',
            'GET /api/users',
            'POST /api/users',
            'GET /api/users/:id',
            'PUT /api/users/:id',
            'DELETE /api/users/:id'
        ]
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error(' Error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'production' ? {} : error.message
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(` Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(` Base URL: http://localhost:${PORT}`);
    console.log(` Health Check: http://localhost:${PORT}/health`);
    console.log(` Items API: http://localhost:${PORT}/api/items`);
    console.log(` Users API: http://localhost:${PORT}/api/users`);
});