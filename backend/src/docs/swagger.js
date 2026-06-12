const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Skill Mentor API',
      version: '1.0.0',
      description: 'Backend API for AI Skill Mentor platform'
    },
    servers: [{ url: 'http://localhost:5000/api' }]
  },
  apis: ['./src/routes/*.js']
};

module.exports = swaggerJsdoc(options);
