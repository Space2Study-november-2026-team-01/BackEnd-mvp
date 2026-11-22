const router = require('express').Router()

const asyncWrapper = require('~/middlewares/asyncWrapper')
const { authMiddleware } = require('~/middlewares/auth')
const locationController = require('~/controllers/location')

router.use(authMiddleware)
router.get('/countries', asyncWrapper(locationController.getCountries))

module.exports = router
