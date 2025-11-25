const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger_output.json';
const endpointsFiles = ['./server.js', './routes/items.js', './routes/users.js'];

const doc = {
  info: {
    title: 'Project Node API',
    description: 'Auto-generated swagger documentation'
  },
  host: process.env.SWAGGER_HOST || `localhost:3000`,
  schemes: ['http']
};



const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Project API with Authentication',
      version: '1.0.0',
      description: 'API documentation for the project with OAuth authentication',
    },
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
            profile: {
              type: 'object',
              properties: {
                firstName: {
                  type: 'string'
                },
                lastName: {
                  type: 'string'
                },
                avatar: {
                  type: 'string'
                }
              }
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
  apis: ['./routes/*.js'], // Path to the API routes
};


const specs = swaggerJsdoc(options);



swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log('Swagger docs generated to', outputFile);
});

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};