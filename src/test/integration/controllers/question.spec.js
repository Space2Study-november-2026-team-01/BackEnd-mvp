const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const mongoose = require('mongoose')
const testUserAuthentication = require('~/utils/testUserAuth')
const TokenService = require('~/services/token')
const Question = require('~/models/question')
const ResourcesCategory = require('~/models/resourcesCategory')
const {
  roles: { TUTOR }
} = require('~/consts/auth')

const endpointUrl = '/questions/'

describe('Question controller', () => {
  let app, server, accessToken, currentUser, categories

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    accessToken = await testUserAuthentication(app, { role: TUTOR })
    currentUser = TokenService.validateAccessToken(accessToken)

    categories = await ResourcesCategory.create([
      { name: 'Category one', author: currentUser.id },
      { name: 'Category two', author: currentUser.id }
    ])

    const questions = await Question.create([
      {
        title: 'Older question',
        text: 'Question text',
        answers: [{ text: 'Answer', isCorrect: true }],
        type: 'multipleChoice',
        category: categories[0]._id,
        author: currentUser.id
      },
      {
        title: 'Newer question',
        text: 'Question text',
        answers: [{ text: 'Answer', isCorrect: true }],
        type: 'multipleChoice',
        category: categories[1]._id,
        author: currentUser.id
      },
      {
        title: 'Uncategorized question',
        text: 'Question text',
        answers: [{ text: 'Answer', isCorrect: true }],
        type: 'multipleChoice',
        category: null,
        author: currentUser.id
      }
    ])

    await Question.collection.updateOne(
      { _id: questions[0]._id },
      { $set: { updatedAt: new Date('2024-01-01T00:00:00.000Z') } }
    )
    await Question.collection.updateOne(
      { _id: questions[1]._id },
      { $set: { updatedAt: new Date('2024-02-01T00:00:00.000Z') } }
    )
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  it('should retrieve a question with the data required by the edit form', async () => {
    const question = await Question.findOne({ title: 'Older question' }).lean()
    const response = await app.get(`${endpointUrl}${question._id}`).set('Cookie', [`accessToken=${accessToken}`])

    expect(response.statusCode).toBe(200)
    expect(response.body).toMatchObject({
      _id: question._id.toString(),
      title: question.title,
      text: question.text,
      answers: question.answers,
      type: question.type,
      category: question.category.toString()
    })
  })

  it('should return a 404 for a valid but nonexistent question ID', async () => {
    const missingQuestionId = new mongoose.Types.ObjectId().toString()
    const response = await app.get(`${endpointUrl}${missingQuestionId}`).set('Cookie', [`accessToken=${accessToken}`])

    expect(response.statusCode).toBe(404)
    expect(response.body.code).toBe('DOCUMENT_NOT_FOUND')
  })

  it('should reject an invalid question ID', async () => {
    const response = await app.get(`${endpointUrl}invalid-id`).set('Cookie', [`accessToken=${accessToken}`])

    expect(response.statusCode).toBe(400)
    expect(response.body.code).toBe('INVALID_ID')
  })

  it('should return saved answers for an open-answer question', async () => {
    const [question] = await Question.create([
      {
        title: 'Open-answer question',
        text: 'Question text',
        answers: [{ text: 'Saved response', isCorrect: false }],
        type: 'openAnswer',
        author: currentUser.id
      }
    ])
    const response = await app.get(`${endpointUrl}${question._id}`).set('Cookie', [`accessToken=${accessToken}`])

    expect(response.statusCode).toBe(200)
    expect(response.body).toMatchObject({
      type: 'openAnswer',
      answers: [{ text: 'Saved response', isCorrect: false }]
    })
  })

  it('should sort questions by updatedAt in both directions', async () => {
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

    expect(ascendingResponse.body.items.map(({ title }) => title)).toEqual([
      'Older question',
      'Newer question',
      'Uncategorized question'
    ])
    expect(descendingResponse.body.items.map(({ title }) => title)).toEqual([
      'Uncategorized question',
      'Newer question',
      'Older question'
    ])
  })

  it('should find questions by partial title and exclude unrelated questions', async () => {
    const response = await app
      .get(endpointUrl)
      .query({ title: 'Older' })
      .set('Cookie', [`accessToken=${accessToken}`])

    expect(response.statusCode).toBe(200)
    expect(response.body.items.map(({ title }) => title)).toEqual(['Older question'])
  })

  it('should search question titles without case sensitivity', async () => {
    const response = await app
      .get(endpointUrl)
      .query({ title: 'OLDER' })
      .set('Cookie', [`accessToken=${accessToken}`])

    expect(response.statusCode).toBe(200)
    expect(response.body.items.map(({ title }) => title)).toEqual(['Older question'])
  })

  it('should search question titles together with category filtering', async () => {
    const response = await app
      .get(endpointUrl)
      .query({
        title: 'question',
        categories: categories[0]._id.toString()
      })
      .set('Cookie', [`accessToken=${accessToken}`])

    expect(response.statusCode).toBe(200)
    expect(response.body.items.map(({ title }) => title)).toEqual(['Older question'])
  })

  it('should treat regex special characters in title search literally', async () => {
    await Question.create([
      {
        title: 'C++ basics',
        text: 'Question text',
        answers: [{ text: 'Answer', isCorrect: true }],
        type: 'multipleChoice',
        author: currentUser.id
      },
      {
        title: 'CC basics',
        text: 'Question text',
        answers: [{ text: 'Answer', isCorrect: true }],
        type: 'multipleChoice',
        author: currentUser.id
      }
    ])

    const response = await app
      .get(endpointUrl)
      .query({ title: 'C++' })
      .set('Cookie', [`accessToken=${accessToken}`])

    expect(response.statusCode).toBe(200)
    expect(response.body.items.map(({ title }) => title)).toEqual(['C++ basics'])
  })

  it('should filter by a single category ID', async () => {
    const response = await app
      .get(endpointUrl)
      .query({ categories: categories[0]._id.toString() })
      .set('Cookie', [`accessToken=${accessToken}`])

    expect(response.statusCode).toBe(200)
    expect(response.body.items.map(({ title }) => title)).toEqual(['Older question'])
  })

  it('should filter by multiple category IDs', async () => {
    const response = await app
      .get(endpointUrl)
      .query({
        categories: categories.map(({ _id }) => _id.toString())
      })
      .set('Cookie', [`accessToken=${accessToken}`])

    expect(response.statusCode).toBe(200)
    expect(response.body.items.map(({ title }) => title)).toEqual(['Older question', 'Newer question'])
  })

  it('should filter by uncategorized questions with a single null value', async () => {
    const response = await app
      .get(endpointUrl)
      .query({ categories: 'null' })
      .set('Cookie', [`accessToken=${accessToken}`])

    expect(response.statusCode).toBe(200)
    expect(response.body.items.map(({ title }) => title)).toEqual(['Uncategorized question'])
  })

  it('should filter by a category ID and uncategorized questions', async () => {
    const response = await app
      .get(endpointUrl)
      .query({
        categories: [categories[0]._id.toString(), 'null']
      })
      .set('Cookie', [`accessToken=${accessToken}`])

    expect(response.statusCode).toBe(200)
    expect(response.body.items.map(({ title }) => title)).toEqual(['Older question', 'Uncategorized question'])
  })
})
