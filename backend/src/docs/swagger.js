const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AI Skill Mentor API",
      version: "1.0.0",
      description: "Backend API documentation for AI Skill Mentor system",
    },
    servers: [
      {
        url: "http://localhost:5000/api/v1",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  // 🔴 VERY IMPORTANT: paths to your route files
apis: [
  "./src/controllers/**/*.js",
  "./src/models/**/*.js",
  "./src/docs/endpoints.swagger.js",
  "./src/routes/**/*.js",
],

};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
