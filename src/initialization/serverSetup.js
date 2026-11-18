const databaseInitialization = require('~/initialization/database')
const checkUserExistence = require('~/seed/checkUserExistence')
const initialization = require('~/initialization/initialization')
const logger = require('~/logger/logger')
const scheduledCronJobs = require('~/cron-jobs/scheduledCronJobs')

const LISTEN_HOST = '0.0.0.0'

const resolveListenPort = () => {
  if (process.env.NODE_ENV === 'test') {
    return 0
  }

  const configured = process.env.PORT || process.env.SERVER_PORT || '3000'
  const port = Number(configured)

  return Number.isInteger(port) && port > 0 ? port : 3000
}

const serverSetup = async (app) => {
  await databaseInitialization()
  await checkUserExistence()
  initialization(app)

  const port = resolveListenPort()
  const server = app.listen(port, LISTEN_HOST, () => {
    const address = server.address()
    const boundPort = address && typeof address === 'object' ? address.port : port
    logger.info(`Server is running on port ${boundPort}`)
    if (process.env.NODE_ENV !== 'test') {
      scheduledCronJobs()
    }
  })

  return server
}

module.exports = serverSetup
