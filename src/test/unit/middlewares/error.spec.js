jest.mock('~/logger/logger', () => ({
  error: jest.fn()
}))

jest.mock('~/utils/getUniqueFields', () => jest.fn())

const errorMiddleware = require('~/middlewares/error')
const logger = require('~/logger/logger')
const getUniqueFields = require('~/utils/getUniqueFields')

const {
  INTERNAL_SERVER_ERROR,
  DOCUMENT_ALREADY_EXISTS,
  MONGO_SERVER_ERROR,
  VALIDATION_ERROR
} = require('~/consts/errors')

describe('Error middleware', () => {
  let mockResponse

  beforeEach(() => {
    jest.clearAllMocks()

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
  })

  it('Should handle an error with a defined status', () => {
    const error = {
      status: 400,
      code: 'BAD_REQUEST',
      message: 'Bad request'
    }

    errorMiddleware(error, {}, mockResponse, jest.fn())

    expect(mockResponse.status).toHaveBeenCalledWith(400)
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 400,
      code: 'BAD_REQUEST',
      message: 'Bad request'
    })
    expect(logger.error).toHaveBeenCalledWith(error)
  })

  it('Should return 500 for an unexpected error', () => {
    const error = new Error('Unexpected error')

    errorMiddleware(error, {}, mockResponse, jest.fn())

    expect(mockResponse.status).toHaveBeenCalledWith(500)
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 500,
      code: INTERNAL_SERVER_ERROR.code,
      message: 'Unexpected error'
    })
  })

  it('Should return 409 for a duplicate MongoDB document', () => {
    const error = {
      name: 'MongoServerError',
      code: 11000,
      message: 'Duplicate key error'
    }

    getUniqueFields.mockReturnValue(['email'])

    errorMiddleware(error, {}, mockResponse, jest.fn())

    expect(getUniqueFields).toHaveBeenCalledWith(error.message)
    expect(mockResponse.status).toHaveBeenCalledWith(409)
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 409,
      ...DOCUMENT_ALREADY_EXISTS(['email'])
    })
  })

  it('Should return 500 for another MongoDB error', () => {
    const error = {
      name: 'MongoServerError',
      code: 123,
      message: 'Database error'
    }

    errorMiddleware(error, {}, mockResponse, jest.fn())

    expect(mockResponse.status).toHaveBeenCalledWith(500)
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 500,
      ...MONGO_SERVER_ERROR(error.message)
    })
  })

  it('Should return 409 for a validation error', () => {
    const error = {
      name: 'ValidationError',
      message: 'Invalid data'
    }

    errorMiddleware(error, {}, mockResponse, jest.fn())

    expect(mockResponse.status).toHaveBeenCalledWith(409)
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 409,
      ...VALIDATION_ERROR(error.message)
    })
  })
})
