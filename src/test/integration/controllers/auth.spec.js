jest.mock('~/services/googleAuth', () => ({
  verifyGoogleToken: jest.fn()
}))
const User = require('~/models/user')
const { verifyGoogleToken } = require('~/services/googleAuth')
const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const {
  lengths: { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH },
  enums: { ROLE_ENUM }
} = require('~/consts/validation')
const errors = require('~/consts/errors')
const tokenService = require('~/services/token')
const Token = require('~/models/token')
const User = require('~/models/user')
const { expectError } = require('~/test/helpers')

describe('Auth controller', () => {
  let app, server, signupResponse

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    verifyGoogleToken.mockReset()
    signupResponse = await app.post('/auth/signup').send(user)
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  const user = {
    role: 'student',
    firstName: 'test',
    lastName: 'test',
    email: 'test@gmail.com',
    password: 'testpass_135'
  }

  describe('Signup endpoint', () => {
    it('should throw validation errors for the firstName field', async () => {
      const responseForFormat = await app.post('/auth/signup').send({ ...user, firstName: '12345' })
      const responseForNull = await app.post('/auth/signup').send({ ...user, firstName: null })

      const formatError = errors.NAME_FIELD_IS_NOT_OF_PROPER_FORMAT('firstName')
      const nullError = errors.FIELD_IS_NOT_DEFINED('firstName')
      expectError(422, formatError, responseForFormat)
      expectError(422, nullError, responseForNull)
    })

    it('should throw validation errors for the email format', async () => {
      const responseForFormat = await app.post('/auth/signup').send({ ...user, email: 'test' })
      const responseForType = await app.post('/auth/signup').send({ ...user, email: 312938 })

      const formatError = errors.FIELD_IS_NOT_OF_PROPER_FORMAT('email')
      const typeError = errors.FIELD_IS_NOT_OF_PROPER_TYPE('email', 'string')
      expectError(422, formatError, responseForFormat)
      expectError(422, typeError, responseForType)
    })

    it('should throw validation error for the role value', async () => {
      const signupResponse = await app.post('/auth/signup').send({ ...user, role: 'test' })

      const error = errors.FIELD_IS_NOT_OF_PROPER_ENUM_VALUE('role', ROLE_ENUM)
      expectError(422, error, signupResponse)
    })

    it('should throw validation errors for the password`s length', async () => {
      const responseForMax = await app
        .post('/auth/signup')
        .send({ ...user, password: '1'.repeat(MAX_PASSWORD_LENGTH + 1) })

      const responseForMin = await app
        .post('/auth/signup')
        .send({ ...user, password: '1'.repeat(MIN_PASSWORD_LENGTH - 1) })

      const error = errors.FIELD_IS_NOT_OF_PROPER_LENGTH('password', {
        min: MIN_PASSWORD_LENGTH,
        max: MAX_PASSWORD_LENGTH
      })
      expectError(422, error, responseForMax)
      expectError(422, error, responseForMin)
    })

    it('should throw ALREADY_REGISTERED error', async () => {
      await app.post('/auth/signup').send(user)

      const response = await app.post('/auth/signup').send(user)

      expectError(409, errors.ALREADY_REGISTERED, response)
    })
  })
  describe('Google Login endpoint', () => {
    it('should register and login a new user with Google', async () => {
      verifyGoogleToken.mockResolvedValue({
        email: 'google@gmail.com',
        given_name: 'Google',
        family_name: 'User',
        email_verified: true
      })

      const response = await app.post('/auth/google-auth').send({
        token: 'valid-google-token',
        role: 'student'
      })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('accessToken')
      expect(response.body).not.toHaveProperty('refreshToken')
      expect(response.headers['set-cookie']).toBeDefined()
    })

    it('should login an existing user with Google without creating a duplicate', async () => {
      verifyGoogleToken.mockResolvedValue({
        email: user.email.toUpperCase(),
        given_name: user.firstName,
        family_name: user.lastName,
        email_verified: true
      })
      const existingUser = await User.findOne({ email: user.email }).select('+password +isEmailConfirmed')
      const oldPassword = existingUser.password

      const response = await app.post('/auth/google-auth').send({
        token: 'valid-google-token'
      })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('accessToken')
      expect(response.body).not.toHaveProperty('refreshToken')

      const users = await User.find({ email: user.email })

      expect(users).toHaveLength(1)
      const updatedUser = await User.findOne({ email: user.email }).select('+password +isEmailConfirmed')

      expect(updatedUser.isEmailConfirmed).toBe(true)
      expect(updatedUser.password).not.toBe(oldPassword)
    })

    it('should return an error for an invalid Google token', async () => {
      verifyGoogleToken.mockRejectedValue(
        Object.assign(new Error(errors.INVALID_GOOGLE_TOKEN.message), {
          status: 401,
          code: errors.INVALID_GOOGLE_TOKEN.code
        })
      )

      const response = await app.post('/auth/google-auth').send({
        token: 'invalid-google-token',
        role: 'student'
      })

      expectError(401, errors.INVALID_GOOGLE_TOKEN, response)
    })

    it('should return an error when a new Google user has no role', async () => {
      verifyGoogleToken.mockResolvedValue({
        email: 'google-no-role@gmail.com',
        given_name: 'Google',
        family_name: 'User',
        email_verified: true
      })

      const response = await app.post('/auth/google-auth').send({
        token: 'valid-google-token'
      })

      expectError(400, errors.BAD_REQUEST, response)

      const createdUser = await User.findOne({
        email: 'google-no-role@gmail.com'
      })

      expect(createdUser).toBeNull()
    })

    it('should register a new Google user using full name when family_name is missing', async () => {
      verifyGoogleToken.mockResolvedValue({
        email: 'google-fullname@gmail.com',
        name: 'John Michael Smith',
        given_name: 'John',
        email_verified: true
      })

      const response = await app.post('/auth/google-auth').send({
        token: 'valid-google-token',
        role: 'student'
      })

      expect(response.status).toBe(200)

      const createdUser = await User.findOne({
        email: 'google-fullname@gmail.com'
      })

      expect(createdUser).toMatchObject({
        firstName: 'John',
        lastName: 'Michael Smith'
      })
    })

    it('should return an error when Google does not provide a last name', async () => {
      verifyGoogleToken.mockResolvedValue({
        email: 'google-no-lastname@gmail.com',
        name: 'John',
        given_name: 'John',
        email_verified: true
      })

      const response = await app.post('/auth/google-auth').send({
        token: 'valid-google-token',
        role: 'student'
      })

      expectError(400, errors.BAD_REQUEST, response)

      const createdUser = await User.findOne({
        email: 'google-no-lastname@gmail.com'
      })

      expect(createdUser).toBeNull()
    })
  })

  describe('SendResetPasswordEmail endpoint', () => {
    it('should throw USER_NOT_FOUND error', async () => {
      const response = await app.post('/auth/forgot-password').send({ email: 'invalid@gmail.com' })

      expectError(404, errors.USER_NOT_FOUND, response)
    })
  })

  describe('UpdatePassword endpoint', () => {
    let resetToken
    const originalFindOne = Token.findOne

    beforeEach(() => {
      const { firstName, email, role } = user

      resetToken = tokenService.generateResetToken({ id: signupResponse.body.userId, firstName, email, role })

      Token.findOne = jest.fn().mockResolvedValue({ save: jest.fn().mockResolvedValue(resetToken) })
    })

    afterEach(() => {
      Token.findOne = originalFindOne
    })

    it('should throw BAD_RESET_TOKEN error', async () => {
      const response = await app.patch('/auth/reset-password/invalid-token').send({ password: 'valid_pass1' })

      expectError(400, errors.BAD_RESET_TOKEN, response)
    })
  })

  describe('POST /auth/confirm-email', () => {
    it('should confirm user email with a valid token', async () => {
      const tokenData = await Token.findOne({
        user: signupResponse.body.userId,
        confirmToken: { $exists: true, $ne: null }
      })

      const { confirmToken, user: userId } = tokenData

      const response = await app.post('/auth/confirm-email').send({
        confirmToken
      })

      expect(response.status).toBe(204)

      const updatedUser = await User.findById(userId).select('+isEmailConfirmed')

      expect(updatedUser.isEmailConfirmed).toBe(true)

      const tokenAfterConfirmation = await Token.findOne({ confirmToken })

      expect(tokenAfterConfirmation).toBeNull()
    })

    it('should return 400 for an invalid confirmation token', async () => {
      const response = await app.post('/auth/confirm-email').send({
        confirmToken: 'invalid-token'
      })

      expectError(400, errors.BAD_CONFIRM_TOKEN, response)
    })

    it('should return 422 when confirmation token is missing', async () => {
      const response = await app.post('/auth/confirm-email').send({})

      expectError(422, errors.FIELD_IS_NOT_DEFINED('confirmToken'), response)
    })

    it('should reject a confirmation token used twice', async () => {
      const tokenData = await Token.findOne({
        user: signupResponse.body.userId,
        confirmToken: { $exists: true, $ne: null }
      })

      const { confirmToken } = tokenData

      const firstResponse = await app.post('/auth/confirm-email').send({
        confirmToken
      })

      expect(firstResponse.status).toBe(204)

      const secondResponse = await app.post('/auth/confirm-email').send({
        confirmToken
      })

      expectError(400, errors.BAD_CONFIRM_TOKEN, secondResponse)
    })
  })
})
