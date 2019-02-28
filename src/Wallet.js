const Utils = require('./Utils')
const pbkdf2 = require('pbkdf2')
const Account = require('./Account')
const nacl = require('tweetnacl/nacl')
const blake = require('blakejs')
const bigInt = require('big-integer')
const mqtt = require('mqtt')
const mqttRegex = require('mqtt-regex')

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
    walletID: false,
    remoteWork: true,
    batchSends: true,
    fullSync: true,
    mqtt: 'wss:pla.bs:8443',
    rpc: {
      proxy: 'https://pla.bs',
      delegates: ['18.207.173.104', '18.212.168.244', '184.72.193.105', '3.82.139.139', '3.82.174.74', '3.83.133.56', '3.83.177.235', '3.83.48.201', '3.84.252.232', '3.85.107.246', '3.85.107.66', '3.86.206.176', '3.86.216.114', '3.86.252.2', '3.86.92.241', '3.90.67.103', '3.91.182.200', '3.94.109.110', '34.238.44.217', '35.173.193.62', '35.174.105.169', '35.174.115.82', '52.207.236.143', '52.90.107.227', '54.145.135.97', '54.147.125.226', '54.152.196.134', '54.165.245.15', '54.173.200.41', '54.210.248.115', '54.84.163.144', '54.89.253.51']
    },
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
      this._fullSync = true
    }

    /**
     * RPC enabled
     * @type {RPCOptions}
     * @private
     */
    if (options.rpc !== undefined) {
      this._rpc = options.rpc
    } else {
      this._rpc = {
        proxy: 'https://pla.bs',
        delegates: ['18.207.173.104', '18.212.168.244', '184.72.193.105', '3.82.139.139', '3.82.174.74', '3.83.133.56', '3.83.177.235', '3.83.48.201', '3.84.252.232', '3.85.107.246', '3.85.107.66', '3.86.206.176', '3.86.216.114', '3.86.252.2', '3.86.92.241', '3.90.67.103', '3.91.182.200', '3.94.109.110', '34.238.44.217', '35.173.193.62', '35.174.105.169', '35.174.115.82', '52.207.236.143', '52.90.107.227', '54.145.135.97', '54.147.125.226', '54.152.196.134', '54.165.245.15', '54.173.200.41', '54.210.248.115', '54.84.163.144', '54.89.253.51']
      }
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
      this._mqtt = 'wss:pla.bs:8443'
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
   * List all the accounts in the wallet
   * @type {Account[]}
   * @readonly
   */
  get accounts () {
    let accounts = []
    Object.keys(this._accounts).forEach(account => {
      accounts.push(this._accounts[account])
    })
    return accounts
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
   * Sets a random seed for the wallet
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
   * Create an account
   *
   * You are allowed to create an account using your seed, precalculated account options, or a privateKey
   *
   * @param {AccountOptions} options - the options to populate the account. If you send just private key it will generate the account from that privateKey. If you just send index it will genereate the account from that determinstic seed index.
   * @returns {Promise<Account>}
   */
  async createAccount (options = null) {
    let accountOptions = null
    if (options === null) { // No options generate from seed
      if (!this._seed) throw new Error('Cannot generate an account without a seed! Make sure to first set your seed or pass a private key or explicitly pass the options for the account.')
      accountOptions = this._generateAccountOptionsFromSeed(this._deterministicKeyIndex)
      this._deterministicKeyIndex++
    } else if (options.address === undefined) {
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
    accountOptions.fullSync = this._fullSync
    accountOptions.rpc = this._rpc
    accountOptions.batchSends = this._batchSends
    accountOptions.remoteWork = this._remoteWork
    const account = new Account(accountOptions)
    if (this._mqtt && this._mqttConnected) this._subscribe(`account/${account.address}`)
    this._accounts[account.address] = account
    if (this._rpc) {
      await this._accounts[account.address].sync(this._rpc)
    } else {
      this._accounts[account.address].synced = true
    }
    this._currentAccountAddress = account.address
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

    const options = { mode: Utils.AES.CBC, padding: Utils.Iso10126 }
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

  _subscribe (topic) {
    if (this._mqttConnected && this._mqttClient) {
      this._mqttClient.subscribe(topic, (err) => {
        if (!err) {
          console.log(`subscribed to ${topic}`)
        } else {
          console.log(err)
        }
      })
    }
  }

  _unsubscribe (topic) {
    if (this._mqttConnected && this._mqttClient) {
      this._mqttClient.unsubscribe(topic, (err) => {
        if (!err) {
          console.log(`unsubscribed from ${topic}`)
        } else {
          console.log(err)
        }
      })
    }
  }

  _mqttDisconnect () {
    this._mqttClient.end()
  }

  _mqttConnect () {
    if (this._mqtt) {
      this._mqttClient = mqtt.connect(this._mqtt)
      this._mqttClient.on('connect', () => {
        console.log('Webwallet SDK Connected to MQTT')
        this._mqttConnected = true
        Object.keys(this._accounts).forEach(account => {
          this._subscribe(`account/${account}`)
        })
      })
      this._mqttClient.on('close', () => {
        this._mqttConnected = false
        console.log('Webwallet SDK disconnected from MQTT')
      })
      this._mqttClient.on('message', (topic, message) => {
        const accountMqttRegex = mqttRegex('account/+account').exec
        message = JSON.parse(message.toString())
        let params = accountMqttRegex(topic)
        if (params) {
          let account = this._accounts[params.account]
          try {
            account.processRequest(message, this._batchSends, this._rpc)
          } catch (err) {
            if (this._rpc) {
              this._accounts[account.address].sync(this._rpc, this._fullSync)
            } else {
              this._accounts[account.address].synced = false
            }
          }
        }
      })
    }
  }
}

module.exports = Wallet
