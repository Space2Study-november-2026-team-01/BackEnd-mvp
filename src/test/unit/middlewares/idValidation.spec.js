const mongoose = require('mongoose')
const idValidation = require('~/middlewares/idValidation')
const { INVALID_ID } = require('~/consts/errors')

describe('ID validation middleware', () => {
  let mockNextFunc

  const mockRequest = {}
  const mockResponse = {}

  beforeEach(() => {
    mockNextFunc = jest.fn()
  })

  it('Should call next when ID is valid', () => {
    const validId = new mongoose.Types.ObjectId().toString()

    idValidation(mockRequest, mockResponse, mockNextFunc, validId)

    expect(mockNextFunc).toHaveBeenCalledTimes(1)
  })

  it('Should throw BAD_REQUEST error when ID is invalid', () => {
    const invalidId = 'invalid-id'

    const middlewareFunc = () => idValidation(mockRequest, mockResponse, mockNextFunc, invalidId)

    expect(middlewareFunc).toThrow(INVALID_ID.message)

    let caughtError

    try {
      middlewareFunc()
    } catch (error) {
      caughtError = error
    }

    expect(caughtError).toBeDefined()
    expect(caughtError.status).toBe(400)
    expect(caughtError.code).toBe(INVALID_ID.code)
    expect(mockNextFunc).not.toHaveBeenCalled()
  })
})
