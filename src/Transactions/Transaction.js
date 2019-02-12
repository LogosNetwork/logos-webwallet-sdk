const Utils = require('../Utils')

/**
 * The base class for all Transactions.
 */
class Transaction {
  constructor (options = {
    account: null,
    previous: null,
    sequence: null,
    transactionFee: null,
    signature: null,
    work: null
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
     * Sequence of the block in the chain
     * @type {string}
     * @private
     */
    if (options.sequence !== undefined) {
      this._sequence = options.sequence
    } else {
      this._sequence = null
    }

    /**
     * Block version of webwallet SDK
     * @type {number}
     * @private
     */
    this._version = 1
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

  set previous (hex) {
    if (!/[0-9A-F]{64}/i.test(hex)) throw new Error('Invalid previous block hash.')
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
    this._transactionFee = val
  }

  /**
   * Return the string amount of the transaction fee in reason
   * @type {string}
   */
  get transactionFee () {
    return this._transactionFee
  }

  set sequence (val) {
    this._sequence = val
  }

  /**
   * Return the the sequence of the block in the publishers account
   * @type {string}
   */
  get sequence () {
    return this._sequence
  }

  /**
   * Sets the account
   *
   * @param {LogosAddress} account - The Logos account that creates the block
   * @returns {void}
   */
  setAccount (account) {
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
}

module.exports = Transaction