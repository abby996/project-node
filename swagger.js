const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Determine server URL based on environment
const getServerUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.RENDER_EXTERNAL_URL || 'https://project-node-x55j.onrender.com';
  }
  return `http://localhost:${process.env.PORT || 3000}`;
};

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Project API with Authentication',
      version: '1.0.0',
      description: 'API documentation for the project with OAuth authentication',
    },
    servers: [
      {
        url: getServerUrl(),
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid'
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer'
        }
      }
    }
  },
  apis: ['./routes/*.js', './server.js'],
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    swaggerOptions: {
      persistAuthorization: true,
    }
  }));
};