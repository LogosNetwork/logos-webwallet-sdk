const Utils = require('./Utils')
const pbkdf2 = require('pbkdf2')
const Account = require('./Account')
const TokenAccount = require('./TokenAccount')
const nacl = require('tweetnacl/nacl')
const blake = require('blakejs')
const bigInt = require('big-integer')
const mqtt = require('mqtt')
const mqttRegex = require('mqtt-regex')
const bunyan = require('bunyan')
/**
 * The main hub for interacting with the Logos Accounts and Requests.
 */
class Wallet {
  constructor (options = {
    password: null,
    seed: null,
    deterministicKeyIndex: 0,
    currentAccountAddress: null,
    accounts: {},
    tokenAccounts: {},
    walletID: false,
    remoteWork: true,
    batchSends: true,
    fullSync: false,
    lazyErrors: false,
    syncTokens: false,
    logging: 'info',
    mqtt: Utils.defaultMQTT,
    rpc: Utils.defaultRPC,
    version: 1
  }) {
    /**
     * Password used to encrypt and decrypt the wallet data
     * @type {string}
     * @private
     */
    if (options.password !== undefined) {
      this._password = options.password
    } else {
      this._password = null
    }

    /**
     * Deterministic Key Index is used to generate accounts
     * @type {number}
     * @private
     */
    if (options.deterministicKeyIndex !== undefined) {
      this._deterministicKeyIndex = options.deterministicKeyIndex
    } else {
      this._deterministicKeyIndex = 0
    }

    /**
     * Current Account address is the public key of the current account
     * @type {LogosAddress}
     * @private
     */
    if (options.currentAccountAddress !== undefined) {
      this._currentAccountAddress = options.currentAccountAddress
    } else {
      this._currentAccountAddress = null
    }

    /**
     * Array of accounts in this wallet
     * @type {Map<LogosAddress, Account>}
     * @private
     */
    if (options.accounts !== undefined) {
      this._accounts = options.accounts
    } else {
      this._accounts = {}
    }

    /**
     * Array of accounts in this wallet
     * @type {Map<LogosAddress, TokenAccount>}
     * @private
     */
    if (options.tokenAccounts !== undefined) {
      this._tokenAccounts = options.tokenAccounts
    } else {
      this._tokenAccounts = {}
    }

    /**
     * Wallet Identifer
     * @type {string}
     * @private
     */
    if (options.walletID !== undefined) {
      this._walletID = options.walletID
    } else {
      this._walletID = Utils.uint8ToHex(nacl.randomBytes(32))
    }

    /**
     * Remote work enabled
     * @type {boolean}
     * @private
     */
    if (options.remoteWork !== undefined) {
      this._remoteWork = options.remoteWork
    } else {
      this._remoteWork = true
    }

    /**
     * Batch Sends - When lots of requests are pending auto batch them togeather for speed
     * @type {boolean}
     * @private
     */
    if (options.batchSends !== undefined) {
      this._batchSends = options.batchSends
    } else {
      this._batchSends = true
    }

    /**
     * Full Sync - Should we fully sync and validate the full request chain or just sync the request
     * @type {boolean}
     * @private
     */
    if (options.fullSync !== undefined) {
      this._fullSync = options.fullSync
    } else {
      this._fullSync = false
    }

    /**
     * Sync Tokens - Syncs all associated token's of the accounts on the account sync instead of on use
     * @type {boolean}
     * @private
     */
    if (options.syncTokens !== undefined) {
      this._syncTokens = options.syncTokens
    } else {
      this._syncTokens = false
    }

    /**
     * Lazy Errors - Do not reject invalid requests when adding to pending chain
     *
     * Lazy errors will not prevent you from creating blocks but only from broadcasting them
     *
     * @type {boolean}
     * @private
     */
    if (options.lazyErrors !== undefined) {
      this._lazyErrors = options.lazyErrors
    } else {
      this._lazyErrors = false
    }

    /**
     * Logging - The Level of logging on the SDK
     * trace / debug / info / warn / error
     *
     * @type {string}
     * @private
     */
    if (options.logging !== undefined) {
      this._logging = options.logging
    } else {
      this._logging = 'info'
    }
    this.log = bunyan.createLogger({ name: 'WebwalletSDK', level: this._logging })

    /**
     * RPC enabled
     * @type {RPCOptions}
     * @private
     */
    if (options.rpc !== undefined) {
      this._rpc = options.rpc
    } else {
      this._rpc = Utils.defaultRPC
    }

    /**
     * PBKDF2 Iterations
     * I don't think people need to edit this
     * NIST guidelines recommend 10,000 so lets do that
     * @type {number}
     * @private
     */
    this._iterations = 10000

    /**
     * MQTT host to listen for data
     * @type {string | boolean} The mqtt websocket address (false if you don't want this)
     * @private
     */
    if (options.mqtt !== undefined) {
      this._mqtt = options.mqtt
    } else {
      this._mqtt = Utils.defaultMQTT
    }
    this._mqttConnected = false
    this._mqttConnect()

    /**
     * Seed used to generate accounts
     * @type {Hexadecimal64Length} The 32 byte seed hex encoded
     * @private
     */
    if (options.seed !== undefined) {
      this._seed = options.seed
    } else {
      this._seed = Utils.uint8ToHex(nacl.randomBytes(32))
    }
  }

  /**
   * The id of the wallet
   * @type {string} The hex identifier of the wallet
   */
  get walletID () {
    return this._walletID
  }

  set walletID (id) {
    this._walletID = id
  }

  /**
   * Should the webwallet SDK batch requests
   * @type {boolean}
   */
  get batchSends () {
    return this._batchSends
  }

  set batchSends (val) {
    this._batchSends = val
  }

  /**
   * Should the webwallet SDK get work from remote server
   * True - Remote Work Server
   * False - Locally create it (Need to have WASM)
   * @type {boolean}
   */
  get remoteWork () {
    return this._remoteWork
  }

  set remoteWork (val) {
    this._remoteWork = val
  }

  /**
   * Full Sync the entire requestchain or prune version only
   * @type {boolean}
   */
  get fullSync () {
    return this._fullSync
  }

  set fullSync (val) {
    this._fullSync = val
  }

  /**
   * Sync Tokens - Syncs all associated token's of the accounts on the account sync instead of on use
   * @type {boolean}
   */
  get syncTokens () {
    return this._syncTokens
  }

  set syncTokens (val) {
    this._syncTokens = val
  }

  /**
   * Lazy Errors allows you to add request that are not valid for the current pending balances to the pending chain
   * @type {boolean}
   */
  get lazyErrors () {
    return this._lazyErrors
  }

  set lazyErrors (val) {
    this._lazyErrors = val
  }

  /**
   * Logging Level
   * trace / debug / info / warn / error
   * @type {string}
   */
  get loggingLevel () {
    return this._logging
  }

  set loggingLevel (val) {
    this._logging = val
  }

  /**
   * Array of all the accounts in the wallet
   * @type {Account[]}
   * @readonly
   */
  get accounts () {
    return Array.from(Object.values(this._accounts))
  }

  /**
   * Object of all the accounts in the wallet
   * @type {Map<LogosAddress, Account>}
   * @readonly
   */
  get accountsObject () {
    return this._accounts
  }

  /**
   * Map of all the TokenAccounts in the wallet
   * @type {Map<LogosAddress, TokenAccount>}
   * @readonly
   */
  get tokenAccounts () {
    return this._tokenAccounts
  }

  /**
   * The current account
   * @type {Account}
   * @readonly
   */
  get account () {
    return this._accounts[this._currentAccountAddress]
  }

  /**
   * The current account address
   * @type {LogosAddress}
   */
  get currentAccountAddress () {
    return this._currentAccountAddress
  }

  set currentAccountAddress (address) {
    if (!this._accounts.hasOwnProperty(address)) throw new Error(`Account ${address} does not exist in this wallet.`)
    this._currentAccountAddress = address
  }

  /**
   * The current balance of all the wallets in reason
   * @type {string}
   * @readonly
   */
  get balance () {
    let totalBalance = bigInt(0)
    Object.keys(this._accounts).forEach(account => {
      totalBalance.add(bigInt(this._accounts[account].balance))
    })
    return totalBalance.toString()
  }

  /**
   * The mqtt host for listening to confirmations from Logos consensus
   * @type {string}
   */
  get mqtt () {
    return this._mqtt
  }

  set mqtt (val) {
    this._mqttDisconnect()
    this._mqtt = val
    this._mqttConnect()
  }

  /**
   * The rpc options for connecting to the RPC
   * @type {RPCOptions | boolean}
   */
  get rpc () {
    return this._rpc
  }

  set rpc (val) {
    this._rpc = val
  }

  /**
   * Sets a new password
   *
   * @param {string} password - The password you want to use to encrypt the wallet
   * @returns {void}
   */
  setPassword (password) {
    this._password = password
  }

  set seed (hexSeed) {
    if (!/[0-9A-F]{64}/i.test(hexSeed)) throw new Error('Invalid Hex Seed.')
    this._seed = hexSeed
  }

  /**
   * Return the seed of the wallet
   * @type {Hexadecimal64Length}
   */
  get seed () {
    return this._seed
  }

  /**
   * Return all the requests that are pending in every account associated to this wallet
   * @type {Request[]}
   * @readonly
   */
  get pendingRequests () {
    let pendingRequests = []
    Object.keys(this._accounts).forEach(account => {
      pendingRequests.concat(account.pendingChain)
    })
    return pendingRequests
  }

  /**
   * Sets a random seed for the wallet
   *
   * @param {boolean} overwrite - Set to true to overwrite an existing seed
   * @throws An exception on existing seed
   * @returns {Hexadecimal64Length}
   */
  createSeed (overwrite = false) {
    if (this._seed && !overwrite) throw new Error('Seed already exists. To overwrite set the seed or set overwrite to true')
    this._seed = Utils.uint8ToHex(nacl.randomBytes(32))
    return this._seed
  }

  /**
   * Adds a account to the wallet
   *
   * @param {Account} account - the account you wish to add
   * @returns {Account}
   */
  addAccount (account) {
    this._accounts[account.address] = account
    if (this._mqtt && this._mqttConnected) this._subscribe(`account/${account.address}`)
    return this._accounts[account.address]
  }

  /**
   * Removes an account to the wallet
   *
   * @param {LogosAddress} address - the account you wish to remove
   * @returns {Boolean}
   */
  removeAccount (address) {
    if (this._accounts[address]) {
      delete this._accounts[address]
      if (this._mqtt && this._mqttConnected) this._unsubscribe(`account/${address}`)
      if (address === this.currentAccountAddress) {
        this.currentAccountAddress = Object.keys(this._accounts)[0]
      }
      return true
    }
    return false
  }

  /**
   * Adds a tokenAccount to the wallet
   *
   * @param {TokenAccount} tokenAccount - the tokenAccount you wish to add
   * @returns {TokenAccount}
   */
  addTokenAccount (tokenAccount) {
    this._tokenAccounts[tokenAccount.address] = tokenAccount
    if (this._mqtt && this._mqttConnected) this._subscribe(`account/${tokenAccount.address}`)
    return this._tokenAccounts[tokenAccount.address]
  }

  /**
   * Create a TokenAccount
   *
   * You are allowed to add a tokenAccount using the address
   *
   * @param {LogosAddress} address - address of the token account.
   * @returns {Promise<Account>}
   */
  async createTokenAccount (address, issuance) {
    if (this._tokenAccounts[address]) {
      return this._tokenAccounts[address]
    } else {
      const tokenAccount = new TokenAccount(address, this, issuance)
      if (this._mqtt && this._mqttConnected) this._subscribe(`account/${tokenAccount.address}`)
      this._tokenAccounts[tokenAccount.address] = tokenAccount
      if (this._rpc && !issuance) {
        await this._tokenAccounts[tokenAccount.address].sync()
      } else {
        if (!this._rpc) this.log.warn('RPC not ENABLED TOKEN ACTIONS - TokenAccount cannot sync')
        this._tokenAccounts[tokenAccount.address].synced = true
      }
      return this._tokenAccounts[tokenAccount.address]
    }
  }

  /**
   * Create an account
   *
   * You are allowed to create an account using your seed, precalculated account options, or a privateKey
   *
   * @param {AccountOptions} options - the options to populate the account. If you send just private key it will generate the account from that privateKey. If you just send index it will genereate the account from that determinstic seed index.
   * @param {Boolean} setCurrent - sets the current account to newly created accounts this is default true
   * @returns {Promise<Account>}
   */
  async createAccount (options = null, setCurrent = true) {
    let accountOptions = null
    if (options === null) { // No options generate from seed
      if (!this._seed) throw new Error('Cannot generate an account without a seed! Make sure to first set your seed or pass a private key or explicitly pass the options for the account.')
      accountOptions = this._generateAccountOptionsFromSeed(this._deterministicKeyIndex)
      this._deterministicKeyIndex++
    } else {
      if (options.privateKey !== undefined) {
        accountOptions = this._generateAccountOptionsFromPrivateKey(options.privateKey)
      } else if (options.index !== undefined) {
        if (!this._seed) throw new Error('Cannot generate an account without a seed! Make sure to first set your seed or pass a private key or explicitly pass the options for the account.')
        accountOptions = this._generateAccountOptionsFromSeed(options.index)
      } else {
        if (!this._seed) throw new Error('Cannot generate an account without a seed! Make sure to first set your seed or pass a private key or explicitly pass the options for the account.')
        accountOptions = this._generateAccountOptionsFromSeed(this._deterministicKeyIndex)
        this._deterministicKeyIndex++
      }
    }
    accountOptions.wallet = this
    accountOptions.label = `Account ${this.accounts.length}`
    const account = new Account(accountOptions)
    this.addAccount(account)
    if (this._rpc) {
      await this._accounts[account.address].sync()
    } else {
      this._accounts[account.address].synced = true
    }
    if (setCurrent || this._currentAccountAddress === null) this._currentAccountAddress = account.address
    return this._accounts[account.address]
  }

  /**
   * Updates the balance of all the accounts
   * @returns {void}
   */
  recalculateWalletBalancesFromChain () {
    Object.keys(this._accounts).forEach(account => {
      account.updateBalancesFromChain()
    })
  }

  /**
   * Finds the request object of the specified hash of one of our accounts
   *
   * @param {Hexadecimal64Length} hash - The hash of the request we are looking for the object of
   * @returns {Request | boolean} false if no request object of the specified hash was found
   */
  getRequest (hash) {
    Object.keys(this._accounts).forEach(account => {
      let request = account.getRequest(hash)
      if (request !== false) {
        return request
      }
    })
    return false
  }

  /**
   * Adds request to account chain
   *
   * @param {LogosAddress} address logos address
   * @param {Hexadecimal64Length} hash The request hash
   * @throws An exception if the request is not found in the ready requests array
   * @throws An exception if the previous request does not match the last chain request
   * @throws An exception if the request amount is greater than your balance minus the fee
   * @returns {void}
   */
  confirmRequest (address, hash) {
    this.currentAccountAddress(address)
    this.account.confirmRequest(hash)
  }

  /**
   * Encrypts and packs the wallet data in a hex string
   *
   * @returns {string}
   */
  encrypt () {
    let encryptedWallet = {}

    encryptedWallet.seed = this._seed
    encryptedWallet.deterministicKeyIndex = this._deterministicKeyIndex
    encryptedWallet.version = this._version
    encryptedWallet.walletID = this._walletID
    encryptedWallet.remoteWork = this._remoteWork

    encryptedWallet.accounts = []
    Object.keys(this._accounts).forEach(account => {
      account = this._accounts[account]
      if (account.index !== null) {
        encryptedWallet.accounts.push({
          label: account.label,
          index: account.index
        })
      } else {
        encryptedWallet.accounts.push({
          label: account.label,
          privateKey: account.privateKey
        })
      }
    })
    encryptedWallet = JSON.stringify(encryptedWallet)
    encryptedWallet = Utils.stringToHex(encryptedWallet)
    encryptedWallet = Buffer.from(encryptedWallet, 'hex')

    const context = blake.blake2bInit(32)
    blake.blake2bUpdate(context, encryptedWallet)
    const checksum = blake.blake2bFinal(context)

    const salt = Buffer.from(nacl.randomBytes(16))
    const key = pbkdf2.pbkdf2Sync(this._password, salt, this._iterations, 32, 'sha512')

    const options = {
      mode: Utils.AES.CBC,
      padding: Utils.Iso10126
    }
    const encryptedBytes = Utils.AES.encrypt(encryptedWallet, key, salt, options)

    const payload = Buffer.concat([Buffer.from(checksum), salt, encryptedBytes])

    // decrypt to check if wallet was corrupted during ecryption somehow
    if (this._decrypt(payload).toString('hex') === false) {
      return this.encrypt() // try again, shouldnt happen often
    }
    return payload.toString('hex')
  }

  /**
   * Constructs the wallet from an encrypted base64 encoded wallet
   *
   * @param {string} - encrypted wallet
   * @returns {Promise<WalletData>} wallet data
   */
  async load (encryptedWallet) {
    this._accounts = {}
    const decryptedBytes = this._decrypt(encryptedWallet)
    if (decryptedBytes === false) throw new Error('Wallet is corrupted or has been tampered.')

    const walletData = JSON.parse(decryptedBytes.toString('utf8'))
    this.seed = walletData.seed
    this.walletID = walletData.walletID !== undefined ? walletData.walletID : false
    for (let i in (walletData.accounts || [])) {
      const accountOptions = walletData.accounts[i]
      // Technically you don't need an if here but it helps with readability
      if (accountOptions.index !== null) {
        await this.createAccount({
          index: accountOptions.index,
          label: accountOptions.label
        })
      } else if (accountOptions.privateKey) {
        await this.createAccount({
          label: accountOptions.label,
          privateKey: accountOptions.privateKey
        })
      }
    }
    this._remoteWork = walletData.remoteWork
    this._deterministicKeyIndex = walletData.deterministicKeyIndex
    this._currentAccountAddress = Object.keys(this._accounts)[0]

    return walletData
  }

  /**
   * Decrypts the wallet data
   *
   * @param {string} - encrypted wallet
   * @returns {WalletData | boolean} The request data or returns false if it is unable to decrypt the data
   * @private
   */
  _decrypt (encryptedWallet) {
    const bytes = Buffer.from(encryptedWallet, 'hex')
    const checksum = bytes.slice(0, 32)
    const salt = bytes.slice(32, 48)
    const payload = bytes.slice(48)
    const key = pbkdf2.pbkdf2Sync(this._password, salt, this._iterations, 32, 'sha512')

    const options = {}
    options.padding = options.padding || Utils.Iso10126
    const decryptedBytes = Utils.AES.decrypt(payload, key, salt, options)

    const context = blake.blake2bInit(32)
    blake.blake2bUpdate(context, decryptedBytes)
    const hash = Utils.uint8ToHex(blake.blake2bFinal(context))

    if (hash !== checksum.toString('hex').toUpperCase()) return false
    return decryptedBytes
  }

  /**
   * Generates an account based on the determinstic index of the key
   *
   * @param {number} - The determinstic seed index
   * @returns {MinimialAccount} The account options
   * @private
   */
  _generateAccountOptionsFromSeed (index) {
    if (this._seed.length !== 64) throw new Error('Invalid Seed.')
    const indexBytes = Utils.hexToUint8(Utils.decToHex(index, 4))

    const context = blake.blake2bInit(32)
    blake.blake2bUpdate(context, Utils.hexToUint8(this._seed))
    blake.blake2bUpdate(context, indexBytes)

    const privateKey = blake.blake2bFinal(context)
    const publicKey = nacl.sign.keyPair.fromSecretKey(privateKey).publicKey
    const address = Utils.accountFromHexKey(Utils.uint8ToHex(publicKey))

    return {
      privateKey: Utils.uint8ToHex(privateKey),
      publicKey: Utils.uint8ToHex(publicKey),
      address: address,
      index: index
    }
  }

  /**
   * Generates an account based on the given private key
   *
   * @param {Hexadecimal64Length} - The determinstic seed index
   * @returns {MinimialAccount} The account options
   * @private
   */
  _generateAccountOptionsFromPrivateKey (privateKey) {
    if (privateKey.length !== 64) throw new Error('Invalid Private Key length. Should be 32 bytes.')
    if (!/[0-9A-F]{64}/i.test(privateKey)) throw new Error('Invalid Hex Private Key.')
    const publicKey = nacl.sign.keyPair.fromSecretKey(Utils.hexToUint8(privateKey)).publicKey
    const address = Utils.accountFromHexKey(Utils.uint8ToHex(publicKey))
    return {
      privateKey: privateKey,
      publicKey: Utils.uint8ToHex(publicKey),
      address: address
    }
  }

  /**
   * Subscribe to the mqtt topic
   *
   * @param {string} topic - topic to subscribe to
   * @returns {void}
   * @private
   */
  _subscribe (topic) {
    if (this._mqttConnected && this._mqttClient) {
      this._mqttClient.subscribe(topic, (err) => {
        if (!err) {
          this.log.info(`subscribed to ${topic}`)
        } else {
          this.log.error(err)
        }
      })
    }
  }

  /**
   * Unsubscribe to the mqtt topic
   *
   * @param {string} topic - topic to unsubscribe to
   * @returns {void}
   * @private
   */
  _unsubscribe (topic) {
    if (this._mqttConnected && this._mqttClient) {
      this._mqttClient.unsubscribe(topic, (err) => {
        if (!err) {
          this.log.info(`unsubscribed from ${topic}`)
        } else {
          this.log.error(err)
        }
      })
    }
  }

  /**
   * Disconnect from the mqtt
   *
   * @returns {void}
   * @private
   */
  _mqttDisconnect () {
    this._mqttClient.end()
  }

  /**
   * Connect to the mqtt
   *
   * @returns {void}
   * @private
   */
  _mqttConnect () {
    if (this._mqtt) {
      this._mqttClient = mqtt.connect(this._mqtt)
      this._mqttClient.on('connect', () => {
        this.log.info('Webwallet SDK Connected to MQTT')
        this._mqttConnected = true
        Object.keys(this._accounts).forEach(account => {
          this._subscribe(`account/${account}`)
        })
      })
      this._mqttClient.on('close', () => {
        this._mqttConnected = false
        this.log.info('Webwallet SDK disconnected from MQTT')
      })
      this._mqttClient.on('message', (topic, request) => {
        const accountMqttRegex = mqttRegex('account/+address').exec
        request = JSON.parse(request.toString())
        let params = accountMqttRegex(topic)
        if (params) {
          if (this._accounts[params.address]) {
            this.log.info(`MQTT Confirmation - Account - ${request.type} - ${request.sequence}`)
            this._accounts[params.address].processRequest(request)
          } else if (this._tokenAccounts[params.address]) {
            this.log.info(`MQTT Confirmation - TK Account - ${request.type} - ${request.sequence}`)
            this._tokenAccounts[params.address].processRequest(request)
          }
        }
      })
    }
  }
}

module.exports = Wallet
