const locationService = require('~/services/location')

const getCountries = async (_req, res) => {
  const countries = await locationService.getCountries()

  res.status(200).json(countries)
}

module.exports = { getCountries }
