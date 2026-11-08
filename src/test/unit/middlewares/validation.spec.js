const validationMiddleware = require('~/middlewares/validation')
const {
  BODY_IS_NOT_DEFINED,
  FIELD_IS_NOT_DEFINED,
  FIELD_IS_NOT_OF_PROPER_TYPE,
  FIELD_IS_NOT_OF_PROPER_LENGTH,
  FIELD_IS_NOT_OF_PROPER_FORMAT,
  FIELD_IS_NOT_OF_PROPER_ENUM_VALUE
} = require('~/consts/errors')

describe('Validation middleware', () => {
  let mockNextFunc

  const mockResponse = {}

  beforeEach(() => {
    mockNextFunc = jest.fn()
  })

  it('Should throw error when request body is not defined', () => {
    const middleware = validationMiddleware({})
    const mockRequest = {}

    expect(() => middleware(mockRequest, mockResponse, mockNextFunc)).toThrow(BODY_IS_NOT_DEFINED.message)

    expect(mockNextFunc).not.toHaveBeenCalled()
  })

  it('Should call next when request body is valid', () => {
    const schema = {
      name: { required: true, type: 'string' }
    }
    const middleware = validationMiddleware(schema)
    const mockRequest = { body: { name: 'John' } }

    middleware(mockRequest, mockResponse, mockNextFunc)

    expect(mockNextFunc).toHaveBeenCalledTimes(1)
  })

  it('Should throw error when required field is missing', () => {
    const middleware = validationMiddleware({
      name: { required: true }
    })
    const mockRequest = { body: {} }

    expect(() => middleware(mockRequest, mockResponse, mockNextFunc)).toThrow(FIELD_IS_NOT_DEFINED('name').message)

    expect(mockNextFunc).not.toHaveBeenCalled()
  })

  it('Should throw error when field type is invalid', () => {
    const middleware = validationMiddleware({
      age: { type: 'number' }
    })
    const mockRequest = { body: { age: 'twenty' } }

    expect(() => middleware(mockRequest, mockResponse, mockNextFunc)).toThrow(
      FIELD_IS_NOT_OF_PROPER_TYPE('age', 'number').message
    )

    expect(mockNextFunc).not.toHaveBeenCalled()
  })

  it('Should throw error when field length is invalid', () => {
    const length = { min: 3, max: 10 }
    const middleware = validationMiddleware({
      name: { length }
    })
    const mockRequest = { body: { name: 'Al' } }

    expect(() => middleware(mockRequest, mockResponse, mockNextFunc)).toThrow(
      FIELD_IS_NOT_OF_PROPER_LENGTH('name', length).message
    )

    expect(mockNextFunc).not.toHaveBeenCalled()
  })

  it('Should throw error when field format is invalid', () => {
    const middleware = validationMiddleware({
      email: { regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
    })
    const mockRequest = { body: { email: 'invalid-email' } }

    expect(() => middleware(mockRequest, mockResponse, mockNextFunc)).toThrow(
      FIELD_IS_NOT_OF_PROPER_FORMAT('email').message
    )

    expect(mockNextFunc).not.toHaveBeenCalled()
  })

  it('Should throw error when enum value is invalid', () => {
    const allowedRoles = ['student', 'tutor']
    const middleware = validationMiddleware({
      role: { enum: allowedRoles }
    })
    const mockRequest = { body: { role: 'admin' } }

    expect(() => middleware(mockRequest, mockResponse, mockNextFunc)).toThrow(
      FIELD_IS_NOT_OF_PROPER_ENUM_VALUE('role', allowedRoles).message
    )

    expect(mockNextFunc).not.toHaveBeenCalled()
  })
})
