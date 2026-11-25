const {
  config: { CSC_API_KEY }
} = require('~/configs/config')
const { createError } = require('~/utils/errorsHelper')
const {
  CSC_API_KEY_NOT_CONFIGURED,
  LOCATION_PROVIDER_UNAVAILABLE,
  LOCATION_PROVIDER_TIMEOUT
} = require('~/consts/errors')

const COUNTRIES_API_URL = 'https://api.countrystatecity.in/v1/countries'
const REQUEST_TIMEOUT_MS = 5000

const getRequestError = (error) => {
  if (error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
    return createError(504, LOCATION_PROVIDER_TIMEOUT)
  }

  return createError(502, LOCATION_PROVIDER_UNAVAILABLE)
}

const getCountries = async () => {
  if (!CSC_API_KEY) {
    throw createError(500, CSC_API_KEY_NOT_CONFIGURED)
  }

  let response
  try {
    response = await fetch(COUNTRIES_API_URL, {
      headers: {
        'X-CSCAPI-KEY': CSC_API_KEY
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    })
  } catch (error) {
    throw getRequestError(error)
  }

  if (!response.ok) {
    throw createError(502, LOCATION_PROVIDER_UNAVAILABLE)
  }

  let countries
  try {
    countries = await response.json()
  } catch (error) {
    throw getRequestError(error)
  }

  if (!Array.isArray(countries)) {
    throw createError(502, LOCATION_PROVIDER_UNAVAILABLE)
  }

  return countries
}

module.exports = { getCountries }
