const langMiddleware = require('~/middlewares/appLanguage')
const { INVALID_LANGUAGE } = require('~/consts/errors')
const {
  enums: { APP_LANG_ENUM }
} = require('~/consts/validation')

describe('App language middleware', () => {
  let mockRequest
  let mockNextFunc

  beforeEach(() => {
    mockRequest = {
      acceptsLanguages: jest.fn()
    }
    mockNextFunc = jest.fn()
  })

  it('Should set request language and call next when language is valid', () => {
    const validLanguage = APP_LANG_ENUM[0]
    mockRequest.acceptsLanguages.mockReturnValue(validLanguage)

    langMiddleware(mockRequest, {}, mockNextFunc)

    expect(mockRequest.acceptsLanguages).toHaveBeenCalledWith(...APP_LANG_ENUM)
    expect(mockRequest.lang).toBe(validLanguage)
    expect(mockNextFunc).toHaveBeenCalledTimes(1)
  })

  it('Should throw error when language is not supported', () => {
    mockRequest.acceptsLanguages.mockReturnValue(false)

    expect(() => langMiddleware(mockRequest, {}, mockNextFunc)).toThrow(INVALID_LANGUAGE.message)

    expect(mockRequest.lang).toBeUndefined()
    expect(mockNextFunc).not.toHaveBeenCalled()
  })
  it('Should throw error with status 400 when language is invalid', () => {
    mockRequest.acceptsLanguages.mockReturnValue(false)

    let thrownError

    try {
      langMiddleware(mockRequest, {}, mockNextFunc)
    } catch (error) {
      thrownError = error
    }

    expect(thrownError).toBeDefined()
    expect(thrownError.status).toBe(400)
    expect(thrownError.code).toBe(INVALID_LANGUAGE.code)
    expect(mockNextFunc).not.toHaveBeenCalled()
  })
})
