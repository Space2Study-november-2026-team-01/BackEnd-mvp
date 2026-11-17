const mongoose = require('mongoose')
const databaseInitialization = require('~/initialization/database')
const { serverCleanup } = require('~/test/setup')
const User = require('~/models/user')
const userService = require('~/services/user')

const createUserData = (overrides = {}) => ({
  role: ['student'],
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'testpass1',
  appLanguage: 'en',
  lastLoginAs: 'student',
  ...overrides
})

describe('User service', () => {
  beforeAll(async () => {
    await databaseInitialization()
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  describe('getUsers', () => {
    it('should filter, sort and paginate users while returning the total count', async () => {
      await User.create([
        createUserData({ firstName: 'apple', email: 'apple@example.com' }),
        createUserData({ firstName: 'Banana', email: 'banana@example.com' }),
        createUserData({ firstName: 'cherry', email: 'cherry@example.com' }),
        createUserData({ role: ['tutor'], email: 'tutor@example.com' })
      ])

      const result = await userService.getUsers({
        match: { role: 'student' },
        sort: { firstName: 1 },
        skip: 1,
        limit: 1
      })

      expect(result.count).toBe(3)
      expect(result.items).toHaveLength(1)
      expect(result.items[0].firstName).toBe('Banana')
    })
  })

  describe('getUserById', () => {
    it('should return the matching user with selected private fields as a lean document', async () => {
      const user = await User.create(
        createUserData({
          isEmailConfirmed: true,
          isFirstLogin: false
        })
      )

      const result = await userService.getUserById(user._id, 'student')

      expect(result).toMatchObject({
        _id: user._id,
        email: user.email,
        lastLoginAs: 'student',
        isEmailConfirmed: true,
        isFirstLogin: false
      })
      expect(result.save).toBeUndefined()
      expect(result.password).toBeUndefined()
      expect(result.appLanguage).toBeUndefined()
    })

    it('should return null when the user does not exist or the role does not match', async () => {
      const user = await User.create(createUserData())

      await expect(userService.getUserById(new mongoose.Types.ObjectId())).resolves.toBeNull()
      await expect(userService.getUserById(user._id, 'tutor')).resolves.toBeNull()
    })
  })

  describe('getUserByEmail', () => {
    it('should return the matching user with the fields selected by the service', async () => {
      const user = await User.create(createUserData())

      const result = await userService.getUserByEmail(user.email)

      expect(result).toMatchObject({
        _id: user._id,
        email: user.email,
        password: user.password,
        lastLoginAs: 'student',
        isEmailConfirmed: false,
        isFirstLogin: true,
        appLanguage: 'en'
      })
      expect(result.save).toBeUndefined()
    })

    it('should return null when the email does not exist', async () => {
      await expect(userService.getUserByEmail('missing@example.com')).resolves.toBeNull()
    })
  })

  describe('createUser', () => {
    it('should persist the user with the role and default confirmation state', async () => {
      const result = await userService.createUser('student', 'Test', 'User', 'created@example.com', 'testpass1', 'en')
      const savedUser = await User.findById(result._id)
        .select('+appLanguage +lastLoginAs +isEmailConfirmed')
        .lean()
        .exec()

      expect(savedUser).toMatchObject({
        role: ['student'],
        firstName: 'Test',
        lastName: 'User',
        email: 'created@example.com',
        lastLoginAs: 'student',
        appLanguage: 'en',
        isEmailConfirmed: false
      })
    })

    it('should persist an explicitly confirmed email', async () => {
      const result = await userService.createUser(
        'student',
        'Confirmed',
        'User',
        'confirmed@example.com',
        'testpass1',
        'en',
        true
      )
      const savedUser = await User.findById(result._id).select('+isEmailConfirmed').lean().exec()

      expect(savedUser.isEmailConfirmed).toBe(true)
    })

    it('should reject a duplicate email with ALREADY_REGISTERED', async () => {
      await User.create(createUserData())

      await expect(
        userService.createUser('student', 'Another', 'User', 'test@example.com', 'testpass1', 'en')
      ).rejects.toMatchObject({
        status: 409,
        code: 'ALREADY_REGISTERED'
      })
    })

    it('should reject data that violates the user schema', async () => {
      await expect(
        userService.createUser('student', 'Test', 'User', 'invalid-password@example.com', 'short', 'en')
      ).rejects.toMatchObject({ name: 'ValidationError' })
    })
  })

  describe('privateUpdateUser', () => {
    it('should persist updates to the user', async () => {
      const user = await User.create(createUserData())

      await userService.privateUpdateUser(user._id, { isEmailConfirmed: true })

      const savedUser = await User.findById(user._id).select('+isEmailConfirmed').lean().exec()
      expect(savedUser.isEmailConfirmed).toBe(true)
    })

    it('should reject an update when the user does not exist', async () => {
      await expect(
        userService.privateUpdateUser(new mongoose.Types.ObjectId(), { isEmailConfirmed: true })
      ).rejects.toMatchObject({
        status: 404,
        code: 'DOCUMENT_NOT_FOUND'
      })
    })
  })

  describe('updateUser', () => {
    it('should persist allowed fields, ignore disallowed fields and preserve the other role subjects', async () => {
      const studentSubject = new mongoose.Types.ObjectId()
      const tutorSubject = new mongoose.Types.ObjectId()
      const updatedStudentSubject = new mongoose.Types.ObjectId()
      const user = await User.create(
        createUserData({
          role: ['student', 'tutor'],
          mainSubjects: {
            student: [studentSubject],
            tutor: [tutorSubject]
          }
        })
      )

      await userService.updateUser(user._id, 'student', {
        firstName: 'Updated',
        mainSubjects: [updatedStudentSubject],
        email: 'changed@example.com',
        role: ['admin']
      })

      const savedUser = await User.findById(user._id).lean().exec()
      expect(savedUser.firstName).toBe('Updated')
      expect(savedUser.email).toBe(user.email)
      expect(savedUser.role).toEqual(['student', 'tutor'])
      expect(savedUser.mainSubjects.student).toEqual([updatedStudentSubject])
      expect(savedUser.mainSubjects.tutor).toEqual([tutorSubject])
    })

    it('should reject an update when the user does not exist', async () => {
      await expect(
        userService.updateUser(new mongoose.Types.ObjectId(), 'student', { firstName: 'Updated' })
      ).rejects.toMatchObject({
        status: 404,
        code: 'DOCUMENT_NOT_FOUND'
      })
    })
  })

  describe('updateStatus', () => {
    it('should persist status changes for the specified roles', async () => {
      const user = await User.create(createUserData({ role: ['student', 'tutor'] }))

      await userService.updateStatus(user._id, {
        student: 'blocked',
        tutor: 'active'
      })

      const savedUser = await User.findById(user._id).lean().exec()
      expect(savedUser.status).toMatchObject({
        student: 'blocked',
        tutor: 'active',
        admin: 'active'
      })
    })

    it('should reject a status update when the user does not exist', async () => {
      await expect(
        userService.updateStatus(new mongoose.Types.ObjectId(), { student: 'blocked' })
      ).rejects.toMatchObject({
        status: 404,
        code: 'DOCUMENT_NOT_FOUND'
      })
    })
  })

  describe('deleteUser', () => {
    it('should delete the user from the database', async () => {
      const user = await User.create(createUserData())

      await userService.deleteUser(user._id)

      await expect(User.findById(user._id).exec()).resolves.toBeNull()
    })

    it('should resolve when the user does not exist', async () => {
      await expect(userService.deleteUser(new mongoose.Types.ObjectId())).resolves.toBeUndefined()
    })
  })
})
