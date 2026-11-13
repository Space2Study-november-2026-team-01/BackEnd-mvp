require('~/initialization/envSetup')

const mockVerifyIdToken = jest.fn()

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: mockVerifyIdToken
  }))
}))

const { verifyGoogleToken } = require('~/services/googleAuth')
const { INVALID_GOOGLE_TOKEN } = require('~/consts/errors')

describe('Google Auth service', () => {
  it('Should verify Google token with verified email', async () => {
    const payload = {
      email: 'google@gmail.com',
      email_verified: true
    }

    mockVerifyIdToken.mockResolvedValue({
      getPayload: jest.fn().mockReturnValue(payload)
    })

    const result = await verifyGoogleToken('valid-google-token')

    expect(result).toEqual(payload)
  })

  it('Should throw INVALID_GOOGLE_TOKEN when email is not verified', async () => {
    const payload = {
      email: 'google@gmail.com',
      email_verified: false
    }

    mockVerifyIdToken.mockResolvedValue({
      getPayload: jest.fn().mockReturnValue(payload)
    })

    await expect(verifyGoogleToken('unverified-google-token')).rejects.toMatchObject({
      code: INVALID_GOOGLE_TOKEN.code
    })
  })

  it('Should throw INVALID_GOOGLE_TOKEN when payload is missing', async () => {
    mockVerifyIdToken.mockResolvedValue({
      getPayload: jest.fn().mockReturnValue(null)
    })

    await expect(verifyGoogleToken('invalid-google-token')).rejects.toMatchObject({
      code: INVALID_GOOGLE_TOKEN.code
    })
  })

  it('Should throw INVALID_GOOGLE_TOKEN when token verification fails', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'))

    await expect(verifyGoogleToken('invalid-google-token')).rejects.toMatchObject({
      code: INVALID_GOOGLE_TOKEN.code
    })
  })
})
