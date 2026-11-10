const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const testUserAuthentication = require('~/utils/testUserAuth')
const TokenService = require('~/services/token')
const Question = require('~/models/question')
const {
  roles: { TUTOR }
} = require('~/consts/auth')

const endpointUrl = '/questions/'

describe('Question controller', () => {
  let app, server, accessToken, currentUser

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    accessToken = await testUserAuthentication(app, { role: TUTOR })
    currentUser = TokenService.validateAccessToken(accessToken)

    const questions = await Question.create([
      {
        title: 'Older question',
        text: 'Question text',
        answers: [{ text: 'Answer', isCorrect: true }],
        type: 'multipleChoice',
        author: currentUser.id
      },
      {
        title: 'Newer question',
        text: 'Question text',
        answers: [{ text: 'Answer', isCorrect: true }],
        type: 'multipleChoice',
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

    expect(ascendingResponse.body.items.map(({ title }) => title)).toEqual(['Older question', 'Newer question'])
    expect(descendingResponse.body.items.map(({ title }) => title)).toEqual(['Newer question', 'Older question'])
  })
})
