import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Tienda",
      version: "1.0.0",
    },
  },
  apis: ["./routes/*.js"], // archivos con anotaciones Swagger
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
