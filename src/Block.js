const Utils = require('./Utils')
const blake = require('blakejs')
const nacl = require('tweetnacl/nacl')
const Logos = require('@logosnetwork/logos-rpc-client')
const STATE_BLOCK_PREAMBLE = '0000000000000000000000000000000000000000000000000000000000000006'

/**
 * The base class for all blocks.
 */
class Block {
  constructor (options = {
    hash: null,
    signature: null,
    work: null,
    amount: null,
    previous: null,
    transactionFee: null,
    representative: null,
    destination: null,
    account: null
  }) {
    /**
     * Signature of the block
     * @type {Hexadecimal64Length}
     * @private
     */
    if (options.signature !== undefined) {
      this._signature = options.signature
    } else {
      this._signature = null
    }

    /**
     * Work of the block based on previous hash
     * @type {Hexadecimal16Length}
     * @private
     */
    if (options.work !== undefined) {
      this._work = options.work
    } else {
      this._work = null
    }

    /**
     * Amount transfered in this block
     * @type {string}
     */
    if (options.amount !== undefined) {
      this._amount = options.amount
    } else {
      this._amount = null
    }

    /**
     * Previous block hash
     * @type {Hexadecimal64Length}
     * @private
     */
    if (options.previous !== undefined) {
      this._previous = options.previous
    } else {
      this._previous = null
    }

    /**
     * Transcation Fee of the block
     * @type {string}
     * @private
     */
    if (options.transactionFee !== undefined) {
      this._transactionFee = options.transactionFee
    } else {
      this._transactionFee = null
    }

    /**
     * Representative's address of the account
     * @type {LogosAddress}
     * @private
     */
    if (options.representative !== undefined) {
      this._representative = options.representative
    } else {
      this._representative = null
    }

    /**
     * Destination address of where you are sending the block to
     * @type {LogosAddress}
     * @private
     */
    if (options.destination !== undefined) {
      this._destination = options.destination
    } else {
      this._destination = null
    }

    /**
     * Account logos address of the block author
     * @type {LogosAddress}
     * @private
     */
    if (options.account !== undefined) {
      this._account = options.account
    } else {
      this._account = null
    }

    /**
     * Hash of the block
     * @type {LogosAddress}
     * @private
     */
    if (options.hash !== undefined) {
      this._hash = options.hash
    } else {
      this._hash = null
    }

    /**
     * Block version of webwallet SDK
     * @type {number}
     * @private
     */
    this._version = 1
  }

  /**
   * Returns calculated hash or Builds the block and calculates the hash
   *
   * @throws An exception if missing parameters or invalid parameters
   * @type {Hexadecimal64Length}
   * @readonly
   */
  get hash () {
    if (this._hash !== null) {
      return this._hash
    } else {
      if (!this._previous) throw new Error('Previous is not set.')
      if (!this._amount) throw new Error('Amount is not set.')
      if (!this._destination) throw new Error('Destination is not set.')
      if (!this._transactionFee) throw new Error('Transaction fee is not set.')
      if (!this._account) throw new Error('Account is not set.')
      if (!this._representative) throw new Error('Representative is not set.')
      const context = blake.blake2bInit(32, null)
      blake.blake2bUpdate(context, Utils.hexToUint8(STATE_BLOCK_PREAMBLE))
      try {
        blake.blake2bUpdate(context, Utils.hexToUint8(this.account))
      } catch (err) {
        throw new Error(`Invalid account ${this._account}`)
      }
      blake.blake2bUpdate(context, Utils.hexToUint8(this._previous))
      blake.blake2bUpdate(context, Utils.hexToUint8(this.representative))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(this._amount, 16)))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(this._transactionFee, 16)))
      try {
        blake.blake2bUpdate(context, Utils.hexToUint8(this.destination))
      } catch (err) {
        throw new Error(`Invalid desintation ${this._destination}`)
      }
      let hash = Utils.uint8ToHex(blake.blake2bFinal(context))
      this._hash = hash
      return hash
    }
  }

  set signature (hex) {
    this._signature = hex
  }

  /**
   * Return the signature of the block
   * @type {Hexadecimal64Length}
   * @readonly
   */
  get signature () {
    return this._signature
  }

  set work (hex) {
    if (!this._previous) throw new Error('Previous is not set.')
    // TODO remove the empty work for main net
    if (Utils.checkWork(hex, this._previous, true) || hex === '0000000000000000') {
      this._work = hex
    } else {
      throw new Error('Invalid Work for this Block')
    }
  }

  /**
   * Return the work of the block
   * @type {Hexadecimal16Length}
   */
  get work () {
    return this._work
  }

  set amount (amount) {
    this._hash = null
    this._amount = amount
  }

  /**
   * Return the amount of the block as string
   * @type {string}
   */
  get amount () {
    return this._amount
  }

  set previous (hex) {
    if (!/[0-9A-F]{64}/i.test(hex)) throw new Error('Invalid previous block hash.')
    this._hash = null
    this._previous = hex
  }

  /**
   * Return the previous block as hash
   * @type {Hexadecimal64Length}
   */
  get previous () {
    return this._previous
  }

  set transactionFee (val) {
    this._hash = null
    this._transactionFee = val
  }

  /**
   * Return the string amount of the transaction fee in reason
   * @type {string}
   */
  get transactionFee () {
    return this._transactionFee
  }

  /**
   * Sets the representative
   *
   * @param {LogosAddress} account - The Logos account that is your representative
   * @returns {void}
   */
  setRepresentative (account) {
    this._hash = null
    this._representative = account
  }

  /**
   * Return the public key of the representative account
   * @type {Hexadecimal64Length}
   * @readonly
   */
  get representative () {
    return Utils.keyFromAccount(this._representative)
  }

  /**
   * Sets the destination
   *
   * @param {LogosAddress} account - The Logos account that receives the block in hex
   * @returns {void}
   */
  setDestination (account) {
    this._hash = null
    this._destination = account
  }
  /**
   * The destination public key of the block
   * @type {Hexadecimal64Length}
   * @readonly
   */
  get destination () {
    return Utils.keyFromAccount(this._destination)
  }

  /**
   * Sets the account
   *
   * @param {LogosAddress} account - The Logos account that creates the block
   * @returns {void}
   */
  setAccount (account) {
    this._hash = null
    this._account = account
  }

  /**
   * The account public key
   * @type {Hexadecimal64Length}
   * @readonly
   */
  get account () {
    return Utils.keyFromAccount(this._account)
  }

  /**
   * Creates a work for the block.
   * @param {boolean} [testNet] generate PoW for test net instead of real network
   * @returns {Hexadecimal16Length}
   */
  async createWork (testNet = false) {
    if (!this._previous) throw new Error('Previous is not set.')
    let work = await Utils.generateWork(this._previous, testNet)
    this._work = work
    return work
  }

  /**
   * Creates a signature for the block.
   * @param {Hexadecimal64Length} privateKey - private key in hex
   * @returns {boolean} if the signature is valid
   */
  sign (privateKey) {
    privateKey = Utils.hexToUint8(privateKey)
    if (privateKey.length !== 32) throw new Error('Invalid Private Key length. Should be 32 bytes.')
    let hash = Utils.hexToUint8(this.hash)
    this.signature = Utils.uint8ToHex(nacl.sign.detached(hash, privateKey))
    return this.verify()
  }

  /**
   * Verifies the blocks integrity
   * @returns {boolean}
   */
  verify () {
    if (!this.hash) throw new Error('Hash is not set.')
    if (!this.signature) throw new Error('Signature is not set.')
    if (!this._account) throw new Error('Account is not set.')
    return nacl.sign.detached.verify(Utils.hexToUint8(this.hash), Utils.hexToUint8(this.signature), Utils.hexToUint8(this.account))
  }

  /**
   * Publishes the block
   * @param {RPCOptions} options - rpc options
   * @returns {Promise<Hexadecimal64Length>} hash of transcation
   */
  async publish (options) {
    let delegateId = null
    if (this._previous !== '0000000000000000000000000000000000000000000000000000000000000000') {
      delegateId = parseInt(this._previous.slice(-2), 16) % 32
    } else {
      delegateId = parseInt(this.account.slice(-2), 16) % 32
    }
    const RPC = new Logos({ url: options.delegates[delegateId], proxyURL: options.proxy })
    let hash = await RPC.transactions.publish(this.toJSON())
    return hash
  }

  /**
   * Returns the block JSON ready for broadcast to the Logos Network
   * @param {boolean} pretty - if true it will format the JSON (note you can't broadcast pretty json)
   * @returns {BlockJSON} JSON block
   */
  toJSON (pretty = false) {
    const obj = {}
    obj.type = 'state'
    obj.previous = this._previous
    obj.link = this.destination
    obj.representative = this._representative
    obj.transaction_fee = this._transactionFee
    obj.account = this._account
    obj.amount = this.amount
    obj.work = this._work
    obj.signature = this._signature
    if (pretty) return JSON.stringify(obj, null, 2)
    return JSON.stringify(obj)
  }
}

module.exports = Block
