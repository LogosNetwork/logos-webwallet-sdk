import { uint8ToHex, hexToUint8, decToHex, accountFromHexKey } from './Functions'
const Logger = require('./Logger')
const logger = new Logger()
const Account = require('./Account.js')
const nacl = require('tweetnacl/nacl')
const blake = require('blakejs')
const bigInt = require('big-integer')
class Wallet {
  constructor (options = {
    password: null,
    seed: null,
    deterministicKeyIndex: 0,
    currentAccountAddress: null,
    accounts: {},
    walletID: false,
    locked: true,
    version: 1
  }) {
    /**
     * Password used to encrypt and decrypt the wallet data
     * @type {string}
     * @private
     */
    this._password = options.password

    /**
     * Seed used to generate accounts
     * @type {string} The 32 byte seed hex encoded
     * @private
     */
    this._seed = options.seed

    /**
     * Deterministic Key Index is used to generate accounts
     * @type {number}
     * @private
     */
    this._deterministicKeyIndex = options.deterministicKeyIndex

    /**
     * Current Account address is the public key of the current account
     * @type {string}
     * @private
     */
    this._currentAccountAddress = options.currentAccountAddress

    /**
     * Array of accounts in this wallet
     * @type {object<Account>}
     * @private
     */
    this._accounts = options.accounts

    /**
     * Locked this is true if the wallet has not yet been unlocked
     * @type {boolean}
     * @private
     */
    this._locked = options.locked

    /**
     * Wallet version of webwallet SDK
     * @type {number}
     * @private
     */
    this._wallet = options.wallet

    /**
     * Wallet Identifer
     * @type {string}
     * @private
     */
    this._walletID = options.walletID

    /**
     * PBKDF2 Iterations
     * I don't think people need to edit this
     * NIST guidelines recommend 10,000 so lets do that
     * @type {number}
     * @private
     */
    this._iterations = 10000
  }

  /**
   * The id of the wallet
   * @type {string} The hex identifier of the wallet
   * @readonly
   */
  get walletID () {
    return this._walletID
  }

  /**
   * Sets the current account
   *
   * @param {string} address - The address of the account you want to use
   */
  set walletID (id) {
    if (this._walletID === false) {
      if (id) {
        this._walletID = id
      } else {
        this._walletID = uint8ToHex(nacl.randomBytes(32))
      }
    }
  }

  /**
   * List all the accounts in the wallet
   * @type {array<Account>}
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
   */
  get account () {
    return this._accounts[this._currentAccountAddress]
  }

  /**
   * Sets the current account
   *
   * @param {string} address - The address of the account you want to use
   */
  set account (address) {
    if (!this._accounts.hasOwnProperty(address)) throw new Error(`Account ${address} does not exist in this wallet.`)
    this._currentAccountAddress = address
  }

  /**
   * If the wallet is locked
   * @type {boolean}
   * @readonly
   */
  get locked () {
    return this._locked
  }

  /**
   * The current balance of all the wallets in reason
   * @type {bigInt}
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
   * Sets a new password
   *
   * @param {string} password - The password you want to use to encrypt the wallet
   * @throws An exception if the wallet hasn't been unlocked
   */
  set password (newPassword) {
    if (this.locked) throw new Error('Wallet needs to be unlocked first.')
    this._password = newPassword
    logger.log('Password changed')
  }

  /**
   * Sets a seed for the wallet
   *
   * @param {string} hexSeed - The 32 byte seed hex encoded
   * @throws An exception on malformed seed
   */
  set seed (hexSeed) {
    if (!/[0-9A-F]{64}/i.test(hexSeed)) throw new Error('Invalid Hex Seed.')
    this._seed = hexSeed
  }

  /**
   * Return the seed of the wallet
   * @throws An exception if wallet is locked
   * @type {string}
   * @readonly
   */
  get seed () {
    if (this._locked) throw new Error('Wallet needs to be unlocked first.')
    return this._seed
  }

  /**
   * Return all the blocks that are pending in every account associated to this wallet
   * @type {string}
   * @readonly
   */
  get pendingBlocks () {
    let pendingBlocks = []
    Object.keys(this._accounts).forEach(account => {
      pendingBlocks.concat(account.pendingChain)
    })
    return pendingBlocks
  }

  /**
   * Sets a random seed for the wallet
   *
   * @param {boolean} overwrite - Set to true to overwrite an existing seed
   * @throws An exception on existing seed
   * @returns {Seed<hex>}
   */
  createSeed (overwrite = false) {
    if (this._seed && !overwrite) throw new Error('Seed already exists. To overwrite set the seed or set overwrite to true')
    this._seed = uint8ToHex(nacl.randomBytes(32))
  }

  /**
   * Sets a random seed for the wallet
   *
   * @param {Account} account - the account you wish to add
   * @returns {Account}
   */
  addAccount (account) {
    this._accounts[account.address] = account
    return this._accounts[account.address]
  }

  /**
   * Create an account
   *
   * You are allowed to create an account using your seed, precalculated account options, or a privateKey
   *
   * @param {Object} options - the options to populate the account
   * @param {string} privateKey - you can also create an account using an existing private key
   * @returns {Account}
   */
  createAccount (options = null, privateKey = null) {
    if (options === null) {
      if (privateKey === null) {
        if (!this.seed) throw new Error('Cannot generate an account without a seed! Make sure to first set your seed or pass a private key or explicitly pass the options for the account.')
        options = this._generateAccountOptionsFromSeed(this._deterministicKeyIndex)
        this._deterministicKeyIndex++
      } else {
        if (privateKey.length !== 64) throw new Error('Invalid Private Key length. Should be 32 bytes.')
        if (!/[0-9A-F]{64}/i.test(privateKey)) throw new Error('Invalid Hex Private Key.')
        const publicKey = nacl.sign.keyPair.fromSecretKey(hexToUint8(privateKey)).publicKey
        const address = accountFromHexKey(publicKey)
        options = {
          privateKey: privateKey,
          publicKey: publicKey,
          address: address
        }
      }
    }
    const account = new Account(options)
    this._accounts[account.address] = account
    logger.log('New account added to wallet.')
    return this._accounts[account.address]
  }

  /**
   * Updates the balance of all the accounts
   */
  recalculateWalletBalancesFromChain () {
    Object.keys(this._accounts).forEach(account => {
      account.updateBalancesFromChain()
    })
  }

  /**
   * Finds the block object of the specified hash of one of our accounts
   *
   * @param {string} hash - The hash of the block we are looking for the object of
   * @returns {string} false if no block object of the specified hash was found
   */
  getBlock (hash) {
    Object.keys(this._accounts).forEach(account => {
      let block = account.getBlock(hash)
      if (block !== false) {
        return block
      }
    })
    return false
  }

  /**
   * Adds block to account chain
   *
   * @param {string} - blockHash The block hash
   * @param {string} - hash The block hash
   * @throws An exception if the block is not found in the ready blocks array
   * @throws An exception if the previous block does not match the last chain block
   * @throws An exception if the block amount is greater than your balance minus the transaction fee
   */
  confirmBlock (account, hash) {
    this.setAccount = account
    return account.confirmBlock(hash)
  }

  _generateAccountOptionsFromSeed (index) {
    if (this.seed.length !== 32) throw new Error('Invalid Seed.')
    const indexBytes = hexToUint8(decToHex(index, 4))

    const context = blake.blake2bInit(32)
    blake.blake2bUpdate(context, this.seed)
    blake.blake2bUpdate(context, indexBytes)

    const privateKey = blake.blake2bFinal(context)
    const publicKey = nacl.sign.keyPair.fromSecretKey(privateKey).publicKey
    const address = accountFromHexKey(publicKey)

    return {
      privateKey: privateKey,
      publicKey: publicKey,
      address: address
    }
  }
}

module.export = Wallet
