const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const { expectError } = require('~/test/helpers')
const { UNAUTHORIZED, FORBIDDEN } = require('~/consts/errors')
const testUserAuthentication = require('~/utils/testUserAuth')
const TokenService = require('~/services/token')
const ResourcesCategory = require('~/models/resourcesCategory')
const { Types } = require('mongoose')
const {
  roles: { TUTOR }
} = require('~/consts/auth')

const endpointUrl = '/resources-categories/'

const testResourceCategoryData = {
  name: 'Chemical Category'
}

const studentUserData = {
  role: 'student',
  firstName: 'Yamada',
  lastName: 'Kizen',
  email: 'yamakai@gmail.com',
  password: 'ninpopass',
  appLanguage: 'en',
  isEmailConfirmed: true,
  lastLogin: new Date().toJSON(),
  lastLoginAs: 'student'
}

const updateResourceCategoryData = {
  name: 'Computer Science'
}

describe('ResourceCategory controller', () => {
  let app, server, accessToken, currentUser, studentAccessToken, testResourceCategory

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    accessToken = await testUserAuthentication(app, { role: TUTOR })
    studentAccessToken = await testUserAuthentication(app, studentUserData)

    currentUser = TokenService.validateAccessToken(accessToken)

    testResourceCategory = await app
      .post(endpointUrl)
      .send(testResourceCategoryData)
      .set('Cookie', [`accessToken=${accessToken}`])
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  describe(`POST ${endpointUrl}`, () => {
    it('should create a new reesource category', async () => {
      expect(testResourceCategory.statusCode).toBe(201)
      expect(testResourceCategory._body).toMatchObject({
        _id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        author: currentUser.id,
        ...testResourceCategoryData
      })
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.post(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw FORBIDDEN', async () => {
      const response = await app
        .post(endpointUrl)
        .send(testResourceCategoryData)
        .set('Cookie', [`accessToken=${studentAccessToken}`])

      expectError(403, FORBIDDEN, response)
    })
  })

  describe(`GET ${endpointUrl}`, () => {
    it('should sort categories by updatedAt in both directions', async () => {
      const secondCategory = await app
        .post(endpointUrl)
        .send({ name: 'Biology Category' })
        .set('Cookie', [`accessToken=${accessToken}`])
      const olderDate = new Date('2024-01-01T00:00:00.000Z')
      const newerDate = new Date('2024-02-01T00:00:00.000Z')

      await ResourcesCategory.collection.updateOne(
        { _id: new Types.ObjectId(testResourceCategory.body._id) },
        { $set: { updatedAt: newerDate } }
      )
      await ResourcesCategory.collection.updateOne(
        { _id: new Types.ObjectId(secondCategory.body._id) },
        { $set: { updatedAt: olderDate } }
      )

      const ascendingResponse = await app
        .get(endpointUrl)
        .query({
          sort: { order: 'asc', orderBy: 'updatedAt' },
          skip: 0,
          limit: 10
        })
        .set('Cookie', [`accessToken=${accessToken}`])
      const descendingResponse = await app
        .get(endpointUrl)
        .query({
          sort: { order: 'desc', orderBy: 'updatedAt' },
          skip: 0,
          limit: 10
        })
        .set('Cookie', [`accessToken=${accessToken}`])

      expect(ascendingResponse.body.items.map(({ _id }) => _id)).toEqual([
        secondCategory.body._id,
        testResourceCategory.body._id
      ])
      expect(descendingResponse.body.items.map(({ _id }) => _id)).toEqual([
        testResourceCategory.body._id,
        secondCategory.body._id
      ])
    })
  })

  describe(`PATCH ${endpointUrl}:id`, () => {
    it('should update resource category', async () => {
      const response = await app
        .patch(endpointUrl + testResourceCategory.body._id)
        .send(updateResourceCategoryData)
        .set('Cookie', [`accessToken=${accessToken}`])

      expect(response.statusCode).toBe(204)
    })

    it('should throw UNAUTHORIZED', async () => {
      const response = await app.patch(endpointUrl)

      expectError(401, UNAUTHORIZED, response)
    })

    it('should throw FORBIDDEN', async () => {
      const response = await app
        .patch(endpointUrl)
        .send(updateResourceCategoryData)
        .set('Cookie', [`accessToken=${studentAccessToken}`])

      expectError(403, FORBIDDEN, response)
    })
  })
})
