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

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log('Swagger docs generated to', outputFile);
});
