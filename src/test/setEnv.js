const dotenv = require('dotenv')

dotenv.config({ path: '.env.test.local' })
dotenv.config()

const defaults = {
  MONGODB_URL: 'mongodb://127.0.0.1:27017/sp_project_test',
  SERVER_PORT: '3000',
  SERVER_URL: 'http://127.0.0.1:3000',
  CLIENT_URL: 'http://127.0.0.1:3001',
  COOKIE_DOMAIN: 'localhost',
  JWT_ACCESS_SECRET: 'test-access-secret',
  JWT_ACCESS_EXPIRES_IN: '15m',
  JWT_REFRESH_SECRET: 'test-refresh-secret',
  JWT_REFRESH_EXPIRES_IN: '7d',
  JWT_RESET_SECRET: 'test-reset-secret',
  JWT_RESET_EXPIRES_IN: '1h',
  JWT_CONFIRM_SECRET: 'test-confirm-secret',
  JWT_CONFIRM_EXPIRES_IN: '1d',
  MAIL_USER: 'admin@example.com',
  MAIL_PASS: 'test-admin-pass',
  MAIL_FIRSTNAME: 'Test',
  MAIL_LASTNAME: 'Admin',
  GMAIL_CLIENT_ID: 'test-client-id',
  GMAIL_CLIENT_SECRET: 'test-client-secret',
  GMAIL_REFRESH_TOKEN: 'test-refresh-token',
  GMAIL_REDIRECT_URI: 'http://127.0.0.1:3000/oauth2callback'
}

for (const [key, value] of Object.entries(defaults)) {
  if (!process.env[key]) {
    process.env[key] = value
  }
}
