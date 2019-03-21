const Utils = require('../Utils')
const nacl = require('tweetnacl/nacl')
const Logos = require('@logosnetwork/logos-rpc-client')
const blake = require('blakejs')
/**
 * The base class for all Requests.
 */
class Request {
  constructor (options = {
    origin: null,
    previous: null,
    sequence: null,
    fee: null,
    signature: null,
    work: null
  }) {
    /**
     * Signature of the request
     * @type {Hexadecimal64Length}
     * @private
     */
    if (options.signature !== undefined) {
      this._signature = options.signature
    } else {
      this._signature = null
    }

    /**
     * Work of the request based on previous hash
     * @type {Hexadecimal16Length}
     * @private
     */
    if (options.work !== undefined) {
      this._work = options.work
    } else {
      this._work = null
    }

    /**
     * Previous request hash
     * @type {Hexadecimal64Length}
     * @private
     */
    if (options.previous !== undefined) {
      this._previous = options.previous
    } else {
      this._previous = null
    }

    /**
     * Fee of the request
     * @type {string}
     * @private
     */
    if (options.fee !== undefined) {
      this._fee = options.fee
    } else {
      this._fee = null
    }

    /**
     * Logos account address of the request origin account
     * @type {LogosAddress}
     * @private
     */
    if (options.origin !== undefined) {
      this._origin = options.origin
    } else {
      this._origin = null
    }

    /**
     * Sequence of the request in the chain
     * @type {string}
     * @private
     */
    if (options.sequence !== undefined) {
      this._sequence = options.sequence
    } else {
      this._sequence = null
    }

    /**
     * Request version of webwallet SDK
     * @type {number}
     * @private
     */
    this._version = 1
  }

  set signature (hex) {
    this._signature = hex
  }

  /**
   * Return the signature of the request
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
      throw new Error('Invalid Work for this Request')
    }
  }

  /**
   * Return the work of the request
   * @type {Hexadecimal16Length}
   */
  get work () {
    return this._work
  }

  set previous (hex) {
    if (!/[0-9A-F]{64}/i.test(hex)) throw new Error('Invalid previous request hash.')
    this._previous = hex
  }

  /**
   * Return the previous request as hash
   * @type {Hexadecimal64Length}
   */
  get previous () {
    return this._previous
  }

  set fee (val) {
    this._fee = val
  }

  /**
   * Return the string amount of the fee in reason
   * @type {string}
   */
  get fee () {
    return this._fee
  }

  set sequence (val) {
    this._sequence = val
  }

  /**
   * Return the the sequence of the request in the origin account
   * @type {number}
   */
  get sequence () {
    return this._sequence
  }

  set origin (origin) {
    this._origin = origin
  }

  /**
   * The origin account public key
   * @type {Hexadecimal64Length}
   * @readonly
   */
  get origin () {
    return Utils.keyFromAccount(this._origin)
  }

  /**
   * Creates a work for the request.
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
   * Creates a Blake2b Context for the request
   * @returns {context} - Blake2b Context
   */
  hash () {
    if (!this.previous) throw new Error('Previous is not set.')
    if (this.sequence === null) throw new Error('Sequence is not set.')
    if (this.fee === null) throw new Error('Transaction fee is not set.')
    if (!this.origin) throw new Error('Origin account is not set.')
    if (!this.type) throw new Error('Request type is not defined.')
    const context = blake.blake2bInit(32, null)
    blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(this.typeValue, 1)))
    blake.blake2bUpdate(context, Utils.hexToUint8(this.origin))
    blake.blake2bUpdate(context, Utils.hexToUint8(this.previous))
    blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(this.fee, 16)))
    blake.blake2bUpdate(context, Utils.hexToUint8(Utils.changeEndianness(Utils.decToHex(this.sequence, 4))))
    return context
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
    if (this.previous !== Utils.GENESIS_HASH) {
      delegateId = parseInt(this.previous.slice(-2), 16) % 32
    } else {
      delegateId = parseInt(this.origin.slice(-2), 16) % 32
    }
    const RPC = new Logos({
      url: `http://${options.delegates[delegateId]}:55000`,
      proxyURL: options.proxy
    })
    let hash = await RPC.requests.publish(this.toJSON())
    return hash
  }

  /**
   * Returns the base request JSON
   * @returns {RequestJSON} JSON request
   */
  toJSON () {
    const obj = {}
    obj.previous = this.previous
    obj.sequence = this.sequence.toString()
    obj.origin = this._origin
    obj.fee = this.fee
    obj.next = Utils.GENESIS_HASH
    obj.work = this.work
    obj.hash = this.hash
    obj.type = this.type
    obj.signature = this.signature
    return JSON.stringify(obj)
  }
}

module.exports = Request
