const {
  CSC_API_KEY_NOT_CONFIGURED,
  LOCATION_PROVIDER_UNAVAILABLE,
  LOCATION_PROVIDER_TIMEOUT
} = require('~/consts/errors')

describe('Location service', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([])
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  afterAll(() => {
    global.fetch = originalFetch
  })

  const loadLocationService = () => {
    jest.resetModules()
    return require('~/services/location')
  }

  it('fetches and returns countries using the configured API key and a timeout signal', async () => {
    const countries = [{ id: 101, name: 'India', iso2: 'IN' }]
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(countries)
    })

    const result = await loadLocationService().getCountries()

    expect(result).toEqual(countries)
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.countrystatecity.in/v1/countries',
      expect.objectContaining({
        headers: { 'X-CSCAPI-KEY': 'test-csc-api-key' },
        signal: expect.any(AbortSignal)
      })
    )
  })

  it('fails explicitly without making a request when the API key is missing', async () => {
    let locationService
    jest.isolateModules(() => {
      jest.doMock('~/configs/config', () => ({ config: { CSC_API_KEY: '' } }))
      locationService = require('~/services/location')
      jest.dontMock('~/configs/config')
    })

    await expect(locationService.getCountries()).rejects.toMatchObject({
      status: 500,
      code: CSC_API_KEY_NOT_CONFIGURED.code
    })
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('maps upstream non-success responses to a sanitized provider error', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 401 })

    await expect(loadLocationService().getCountries()).rejects.toMatchObject({
      status: 502,
      code: LOCATION_PROVIDER_UNAVAILABLE.code,
      message: LOCATION_PROVIDER_UNAVAILABLE.message
    })
  })

  it('maps network failures without exposing the API key', async () => {
    global.fetch.mockRejectedValue(new Error('Request failed for test-csc-api-key'))

    await expect(loadLocationService().getCountries()).rejects.toMatchObject({
      status: 502,
      code: LOCATION_PROVIDER_UNAVAILABLE.code,
      message: LOCATION_PROVIDER_UNAVAILABLE.message
    })
  })

  it('maps request timeouts to a gateway timeout', async () => {
    global.fetch.mockRejectedValue(Object.assign(new Error('Timed out'), { name: 'TimeoutError' }))

    await expect(loadLocationService().getCountries()).rejects.toMatchObject({
      status: 504,
      code: LOCATION_PROVIDER_TIMEOUT.code
    })
  })

  it('rejects invalid provider response bodies', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ countries: [] })
    })

    await expect(loadLocationService().getCountries()).rejects.toMatchObject({
      status: 502,
      code: LOCATION_PROVIDER_UNAVAILABLE.code
    })
  })
})
