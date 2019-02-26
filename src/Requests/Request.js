const Utils = require('../Utils')

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
     * Hash of the request in the chain
     * @type {Hexadecimal64Length}
     * @private
     */
    if (options.hash !== undefined) {
      this._hash = options.hash
    } else {
      this._hash = null
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
    this._hash = null
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
    this._hash = null
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
    this._hash = null
    this._sequence = val
  }

  /**
   * Return the the sequence of the request in the origin account
   * @type {number}
   */
  get sequence () {
    return this._sequence
  }

  set hash (val) {
    this._hash = val
  }

  /**
   * Return the hash of the request
   * @type {Hexadecimal64Length}
   */
  get hash () {
    return this._hash
  }

  /**
   * Sets the origin account
   *
   * @param {LogosAddress} origin - The Logos account that created the request
   * @returns {void}
   */
  setOrigin (origin) {
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
}

module.exports = Request
