const logger = require('./logger')
const droidAccountService = require('../services/droidAccountService')

class EnvBootstrap {
  async initialize() {
    await this.bootstrapDroidAccount()
  }

  async bootstrapDroidAccount() {
    const factoryKey = process.env.FACTORY_API_KEY || process.env.DROID_API_KEY
    if (!factoryKey) {
      logger.info('ℹ️ No FACTORY_API_KEY or DROID_API_KEY found in environment variables. Skipping Droid account bootstrap.')
      return
    }

    const accountName = process.env.DROID_ACCOUNT_NAME || 'Env Factory Account'
    const endpointType = process.env.DROID_ENDPOINT_TYPE || 'anthropic' // 'anthropic' or 'openai'

    try {
      const accounts = await droidAccountService.getAllAccounts()
      const exists = accounts.find(a => a.name === accountName)

      if (exists) {
        logger.info(`ℹ️ Droid account "${accountName}" already exists. Updating keys from ENV...`)
        // Optional: Update the key if it exists, to ensure ENV is source of truth
        await droidAccountService.updateAccount(exists.id, {
          apiKeys: [factoryKey],
          isActive: true,
          endpointType // Update endpoint type if changed in env
        })
        logger.success(`✅ Droid account "${accountName}" updated from ENV.`)
      } else {
        logger.info(`🚀 Creating Droid account "${accountName}" from ENV...`)
        await droidAccountService.createAccount({
          name: accountName,
          apiKeys: [factoryKey],
          authenticationMethod: 'api_key',
          endpointType,
          isActive: true,
          priority: 10, // High priority
          schedulable: true
        })
        logger.success(`✅ Droid account "${accountName}" created successfully.`)
      }
    } catch (error) {
      logger.error('❌ Failed to bootstrap Droid account from ENV:', error)
    }
  }
}

module.exports = new EnvBootstrap()
