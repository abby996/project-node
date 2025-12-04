const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');



// Determine the correct server URL based on environment
const getServerUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.RENDER_EXTERNAL_URL || 'https://project-node-x55j.onrender.com';
  }
  return `http://localhost:${process.env.PORT || 3000}`;
};

// Determine the correct scheme (http vs https)
const getScheme = () => {
  return process.env.NODE_ENV === 'production' ? ['https'] : ['http'];
};






const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Project API with Authentication',
      version: '1.0.0',
      description: 'API documentation with OAuth authentication - Deployed on Render',
    },
    servers: [
      {
        url: getServerUrl(),
        description: process.env.NODE_ENV === 'production' ? 'Production Server (Render)' : 'Development Server'
      }
    ],
    
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            username: {
              type: 'string',
              description: 'Username'
            },
            email: {
              type: 'string',
              description: 'Email address'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object'
              }
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js'], // Path to your route files
};

const specs = swaggerJsdoc(options);

// Log Swagger configuration for debugging
console.log('📚 Swagger Configuration:');
console.log('   Environment:', process.env.NODE_ENV);
console.log('   Server URL:', getServerUrl());
console.log('   Schemes:', getScheme());

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Project API Documentation"
  }));
};