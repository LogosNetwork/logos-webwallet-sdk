const Utils = require('../Utils')
const Request = require('./Request')
const blake = require('blakejs')
const nacl = require('tweetnacl/nacl')
const Logos = require('@logosnetwork/logos-rpc-client')

/**
 * The Change class for Change Requests.
 */
class Change extends Request {
  constructor (options = {
    client: null,
    representative: null
  }) {
    super(options)

    /**
     * Client - who the fuck knows
     * @type {string}
     * @private
     */
    if (options.client !== undefined) {
      this._client = options.client
    } else {
      this._client = null
    }

    /**
     * Representative
     * @type {string}
     * @private
     */
    if (options.representative !== undefined) {
      this._representative = options.representative
    } else {
      this._representative = null
    }

    /**
     * Request version of webwallet SDK
     * @type {number}
     * @private
     */
    this._version = 1
  }

  set client (val) {
    super.hash = null
    this._client = val
  }

  /**
   * Return the client - I have no idea what this does
   * @type {string}
   */
  get client () {
    return this._client
  }

  set representative (val) {
    super.hash = null
    this._representative = val
  }

  /**
   * Returns the representative
   * @type {string}
   */
  get representative () {
    return this._representative
  }

  /**
   * Returns the type of this request
   * @type {string}
   * @readonly
   */
  get type () {
    return 'change'
  }

  set hash (hash) {
    super.hash = hash
  }

  /**
   * Returns calculated hash or Builds the request and calculates the hash
   *
   * @throws An exception if missing parameters or invalid parameters
   * @type {Hexadecimal64Length}
   * @readonly
   */
  get hash () {
    if (super.hash) {
      return super.hash
    } else {
      if (!this.previous) throw new Error('Previous is not set.')
      if (!this.transactions) throw new Error('Transactions are not set.')
      if (this.sequence === null) throw new Error('Sequence is not set.')
      if (this.fee === null) throw new Error('Transaction fee is not set.')
      if (!this.origin) throw new Error('Origin account is not set.')
      const context = blake.blake2bInit(32, null)
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(1, 1)))
      blake.blake2bUpdate(context, Utils.hexToUint8(this.previous))
      blake.blake2bUpdate(context, Utils.hexToUint8(this.origin))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(this.fee, 16)))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.changeEndianness(Utils.decToHex(this.sequence, 4))))

      // Change Properties
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.keyFromAccount(this.client)))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.keyFromAccount(this.representative)))
      super.hash = Utils.uint8ToHex(blake.blake2bFinal(context))
      return super.hash
    }
  }

  /**
   * Creates a signature for the request
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
   * Verifies the request's integrity
   * @returns {boolean}
   */
  verify () {
    if (!this.hash) throw new Error('Hash is not set.')
    if (!this.signature) throw new Error('Signature is not set.')
    if (!this.origin) throw new Error('Origin account is not set.')
    return nacl.sign.detached.verify(Utils.hexToUint8(this.hash), Utils.hexToUint8(this.signature), Utils.hexToUint8(this.origin))
  }

  /**
   * Publishes the request
   * @param {RPCOptions} options - rpc options
   * @returns {Promise<Hexadecimal64Length>} hash of transcation
   */
  async publish (options) {
    let delegateId = null
    if (this.previous !== '0000000000000000000000000000000000000000000000000000000000000000') {
      delegateId = parseInt(this.previous.slice(-2), 16) % 32
    } else {
      delegateId = parseInt(this.origin.slice(-2), 16) % 32
    }
    const RPC = new Logos({ url: `http://${options.delegates[delegateId]}:55000`, proxyURL: options.proxy })
    let hash = await RPC.transactions.publish(this.toJSON())
    return hash
  }

  /**
   * Returns the request JSON ready for broadcast to the Logos Network
   * @param {boolean} pretty - if true it will format the JSON (note you can't broadcast pretty json)
   * @returns {RequestJSON} JSON request
   */
  toJSON (pretty = false) {
    const obj = {}
    obj.type = 'send'
    obj.previous = this.previous
    obj.origin = this._origin
    obj.fee = this.fee
    obj.sequence = this.sequence.toString()
    obj.hash = this.hash
    obj.next = '0000000000000000000000000000000000000000000000000000000000000000'
    obj.work = this.work
    obj.signature = this.signature
    obj.client = this.client
    obj.representative = this.representative
    if (pretty) return JSON.stringify(obj, null, 2)
    return JSON.stringify(obj)
  }
}

module.exports = Change
