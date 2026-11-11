const swaggerJsdoc = require('swagger-jsdoc')
const path = require('path')

const {
  config: { SERVER_URL, SERVER_PORT }
} = require('~/configs/config')

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Space2Study API',
      version: '1.0.0',
      description: 'API documentation for Space2Study backend'
    },
    servers: [
      {
        url: SERVER_URL || `http://localhost:${SERVER_PORT}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        accessToken: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
          description: 'JWT access token stored in an HTTP-only cookie'
        },
        refreshToken: {
          type: 'apiKey',
          in: 'cookie',
          name: 'refreshToken',
          description: 'JWT refresh token stored in an HTTP-only cookie'
        }
      }
    }
  },

  apis: [path.join(__dirname, '*.js'), path.join(__dirname, '../src/routes/*.js')]
}

const swaggerSpec = swaggerJsdoc(options)

module.exports = swaggerSpec
