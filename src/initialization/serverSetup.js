const databaseInitialization = require('~/initialization/database')
const checkUserExistence = require('~/seed/checkUserExistence')
const initialization = require('~/initialization/initialization')
const logger = require('~/logger/logger')
const {
  config: { SERVER_PORT }
} = require('~/configs/config')
const scheduledCronJobs = require('~/cron-jobs/scheduledCronJobs')

const serverSetup = async (app) => {
  await databaseInitialization()
  await checkUserExistence()
  initialization(app)

  const port = process.env.NODE_ENV === 'test' ? 0 : SERVER_PORT
  const server = app.listen(port, () => {
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
