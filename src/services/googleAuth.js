const { OAuth2Client } = require('google-auth-library')
const {
  config: { GOOGLE_CLIENT_ID }
} = require('~/configs/config')

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID)
const { createError } = require('~/utils/errorsHelper')
const { INVALID_GOOGLE_TOKEN } = require('~/consts/errors')

const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()

    if (!payload || !payload.email_verified) {
      throw createError(401, INVALID_GOOGLE_TOKEN)
    }

    return payload
  } catch (error) {
    if (error.code === 'INVALID_GOOGLE_TOKEN') {
      throw error
    }

    throw createError(401, INVALID_GOOGLE_TOKEN)
  }
}
module.exports = { verifyGoogleToken }
