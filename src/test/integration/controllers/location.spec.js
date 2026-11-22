jest.mock('~/logger/logger', () => ({
  error: jest.fn()
}))

const express = require('express')
const cookieParser = require('cookie-parser')
const request = require('supertest')
const jwt = require('jsonwebtoken')
const router = require('~/routes')
const errorMiddleware = require('~/middlewares/error')
const {
  config: { JWT_ACCESS_SECRET }
} = require('~/configs/config')

const app = express()
app.use(cookieParser())
app.use('/', router)
app.use(errorMiddleware)

describe('Location routes', () => {
  let fetchSpy

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const getAccessToken = () =>
    jwt.sign({ id: 'student-id', role: 'student' }, JWT_ACCESS_SECRET, {
      expiresIn: '1h'
    })

  it('requires authentication before calling the countries provider', async () => {
    const response = await request(app).get('/locations/countries')

    expect(response.status).toBe(401)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('returns countries from the mocked provider for an authenticated user', async () => {
    const countries = [{ id: 101, name: 'India', iso2: 'IN' }]
    fetchSpy.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(countries)
    })

    const response = await request(app)
      .get('/locations/countries')
      .set('Cookie', [`accessToken=${getAccessToken()}`])

    expect(response.status).toBe(200)
    expect(response.body).toEqual(countries)
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.countrystatecity.in/v1/countries',
      expect.objectContaining({
        headers: { 'X-CSCAPI-KEY': 'test-csc-api-key' },
        signal: expect.any(AbortSignal)
      })
    )
    expect(JSON.stringify(response.body)).not.toContain('test-csc-api-key')
  })
})
