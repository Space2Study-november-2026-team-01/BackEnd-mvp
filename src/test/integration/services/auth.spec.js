require('~/initialization/envSetup')

const mongoose = require('mongoose')
const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const authService = require('~/services/auth')
const User = require('~/models/user')
const Token = require('~/models/token')
const emailService = require('~/services/email')
const tokenService = require('~/services/token')

jest.mock('~/services/email', () => ({
  sendEmail: jest.fn()
}))

describe('Auth service', () => {
  let server

  beforeAll(async () => {
    ;({ server } = await serverInit())
  })

  beforeEach(async () => {
    emailService.sendEmail.mockClear()
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe('signup', () => {
    const userData = {
      role: 'student',
      firstName: 'Test',
      lastName: 'User',
      email: 'test.signup@gmail.com',
      password: 'testpass_135',
      language: 'en'
    }

    it('should create a user, save confirmation token and send email', async () => {
      const result = await authService.signup(
        userData.role,
        userData.firstName,
        userData.lastName,
        userData.email,
        userData.password,
        userData.language
      )

      const user = await User.findOne({ email: userData.email }).select('+isEmailConfirmed').lean()
      const token = await Token.findOne({ user: user._id })

      expect(result).toEqual({
        userId: user._id,
        userEmail: userData.email
      })

      expect(user).toMatchObject({
        role: [userData.role],
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        isEmailConfirmed: false
      })

      expect(token.confirmToken).toBeTruthy()

      expect(emailService.sendEmail).toHaveBeenCalledWith(
        userData.email,
        expect.any(String),
        userData.language,
        expect.objectContaining({
          confirmToken: token.confirmToken,
          email: userData.email,
          firstName: userData.firstName
        })
      )
    })

    it('should throw ALREADY_REGISTERED if user already exists', async () => {
      await authService.signup(
        userData.role,
        userData.firstName,
        userData.lastName,
        userData.email,
        userData.password,
        userData.language
      )

      await expect(
        authService.signup(
          userData.role,
          userData.firstName,
          userData.lastName,
          userData.email,
          userData.password,
          userData.language
        )
      ).rejects.toThrow()

      const users = await User.find({ email: userData.email })
      const tokens = await Token.find({ user: users[0]._id })

      expect(users).toHaveLength(1)
      expect(tokens).toHaveLength(1)
      expect(emailService.sendEmail).toHaveBeenCalledTimes(1)
    })
  })

  describe('login', () => {
    const loginUser = {
      role: ['student'],
      firstName: 'Login',
      lastName: 'Test',
      email: 'test.login@gmail.com',
      password: 'testpass_135',
      lastLoginAs: 'student',
      isFirstLogin: true,
      isEmailConfirmed: true
    }

    it('should login user and save refresh token', async () => {
      const user = await User.create(loginUser)
      const tokens = await authService.login(loginUser.email, loginUser.password)
      const savedUser = await User.findById(user._id).select('+isFirstLogin +lastLogin')
      const savedToken = await Token.findOne({ user: user._id })

      expect(tokens).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String)
      })

      expect(savedToken.refreshToken).toBe(tokens.refreshToken)
      expect(savedUser.isFirstLogin).toBe(false)
      expect(savedUser.lastLogin).toBeInstanceOf(Date)
    })

    it('should throw INCORRECT_CREDENTIALS for invalid password', async () => {
      await User.create(loginUser)

      await expect(authService.login(loginUser.email, 'wrong_password')).rejects.toThrow()

      const savedUser = await User.findOne({ email: loginUser.email }).select('+isFirstLogin +lastLogin')
      const savedToken = await Token.findOne({ user: savedUser._id })

      expect(savedUser.isFirstLogin).toBe(true)
      expect(savedUser.lastLogin).toBeNull()
      expect(savedToken).toBeNull()
    })

    it('should throw EMAIL_NOT_CONFIRMED if user email is not confirmed', async () => {
      await User.create({
        ...loginUser,
        email: 'unconfirmed@gmail.com',
        isEmailConfirmed: false
      })

      await expect(authService.login('unconfirmed@gmail.com', loginUser.password)).rejects.toThrow()

      const savedUser = await User.findOne({ email: 'unconfirmed@gmail.com' }).select('+isFirstLogin +lastLogin')
      const savedToken = await Token.findOne({ user: savedUser._id })

      expect(savedUser.isFirstLogin).toBe(true)
      expect(savedUser.lastLogin).toBeNull()
      expect(savedToken).toBeNull()
    })

    it('should throw USER_NOT_FOUND if user does not exist', async () => {
      await expect(authService.login('nonexistent@gmail.com', 'testpass_135')).rejects.toThrow()

      const users = await User.find({ email: 'nonexistent@gmail.com' })
      const tokens = await Token.find()

      expect(users).toHaveLength(0)
      expect(tokens).toHaveLength(0)
    })
  })

  describe('logout', () => {
    it('should remove refresh token', async () => {
      const user = await User.create({
        role: ['student'],
        firstName: 'Logout',
        lastName: 'Test',
        email: 'test.logout@gmail.com',
        password: 'testpass_135',
        lastLoginAs: 'student',
        isFirstLogin: false,
        isEmailConfirmed: true
      })

      const refreshToken = 'test-refresh-token'

      await Token.create({
        user: user._id,
        refreshToken
      })

      await authService.logout(refreshToken)

      const savedToken = await Token.findOne({ user: user._id })

      expect(savedToken).toBeNull()
    })
  })

  describe('refreshAccessToken', () => {
    it('should generate and save new tokens', async () => {
      const user = await User.create({
        role: ['student'],
        firstName: 'Refresh',
        lastName: 'Test',
        email: 'test.refresh@gmail.com',
        password: 'testpass_135',
        lastLoginAs: 'student',
        isFirstLogin: false,
        isEmailConfirmed: true
      })

      const initialTokens = tokenService.generateTokens({
        id: user._id,
        role: 'student',
        isFirstLogin: false
      })

      await Token.create({
        user: user._id,
        refreshToken: initialTokens.refreshToken
      })

      const newTokens = await authService.refreshAccessToken(initialTokens.refreshToken)
      const savedToken = await Token.findOne({ user: user._id })

      expect(newTokens).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String)
      })

      expect(newTokens.refreshToken).not.toBe(initialTokens.refreshToken)
      expect(savedToken.refreshToken).toBe(newTokens.refreshToken)

      const tokenData = tokenService.validateRefreshToken(newTokens.refreshToken)

      expect(tokenData.id).toBe(user._id.toString())
      expect(tokenData.role).toBe('student')
      expect(tokenData.isFirstLogin).toBe(false)
    })

    it('should throw BAD_REFRESH_TOKEN for invalid refresh token', async () => {
      await expect(authService.refreshAccessToken('invalid-refresh-token')).rejects.toThrow()
    })

    it('should throw BAD_REFRESH_TOKEN if refresh token is not saved in database', async () => {
      const tokens = tokenService.generateTokens({
        id: new mongoose.Types.ObjectId(),
        role: 'student',
        isFirstLogin: false
      })

      await expect(authService.refreshAccessToken(tokens.refreshToken)).rejects.toThrow()
    })

    it('should throw if user does not exist', async () => {
      const userId = new mongoose.Types.ObjectId()

      const tokens = tokenService.generateTokens({
        id: userId,
        role: 'student',
        isFirstLogin: false
      })

      await Token.create({
        user: userId,
        refreshToken: tokens.refreshToken
      })

      await expect(authService.refreshAccessToken(tokens.refreshToken)).rejects.toThrow()
    })
  })
})
