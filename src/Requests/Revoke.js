const Utils = require('../Utils')
const TokenRequest = require('./TokenRequest')
const blake = require('blakejs')

/**
 * The Token Revoke class for Token Revoke Requests.
 */
class Revoke extends TokenRequest {
  constructor (options = {
    source: null,
    transaction: null
  }) {
    super(options)

    /**
     * Transaction to distribute the token
     * @type {string}
     * @private
     */
    if (options.transaction !== undefined) {
      this._transaction = options.transaction
    } else {
      this._transaction = null
    }

    /**
     * Source to send to revoke the tokens from
     * @type {LogosAddress}
     * @private
     */
    if (options.source !== undefined) {
      this._source = options.source
    } else {
      this._source = null
    }

    this._type = {
      text: 'revoke',
      value: 6
    }
  }

  set transaction (transaction) {
    if (typeof transaction.destination === 'undefined') throw new Error('destination should be passed in transaction object')
    if (typeof transaction.amount === 'undefined') throw new Error('amount should be passed in transaction object - pass this as the base unit of your token (e.g. satoshi)')
    this._transaction = transaction
  }

  /**
   * Return the previous request as hash
   * @type {Transaction}
   */
  get transaction () {
    return this._transaction
  }

  set source (revokee) {
    this._source = revokee
  }

  /**
   * Return where the token is being revoked from
   * @type {LogosAddress}
   */
  get source () {
    return this._source
  }

  /**
   * Returns the type of this request
   * @type {string}
   * @readonly
   */
  get type () {
    return this._type.text
  }

  /**
   * Returns the type value of this request
   * @type {number}
   * @readonly
   */
  get typeValue () {
    return this._type.value
  }

  /**
   * Returns calculated hash or Builds the request and calculates the hash
   *
   * @throws An exception if missing parameters or invalid parameters
   * @type {Hexadecimal64Length}
   * @readonly
   */
  get hash () {
    if (this.transaction === null) throw new Error('transaction is not set.')
    if (!this.source) throw new Error('Source account is not set.')
    const context = super.hash()
    let source = Utils.hexToUint8(Utils.keyFromAccount(this.source))
    blake.blake2bUpdate(context, source)
    let account = Utils.hexToUint8(Utils.keyFromAccount(this.transaction.destination))
    blake.blake2bUpdate(context, account)
    let amount = Utils.hexToUint8(Utils.decToHex(this.transaction.amount, 16))
    blake.blake2bUpdate(context, amount)
    return Utils.uint8ToHex(blake.blake2bFinal(context))
  }

  /**
   * Returns the request JSON ready for broadcast to the Logos Network
   * @param {boolean} pretty - if true it will format the JSON (note you can't broadcast pretty json)
   * @returns {RequestJSON} JSON request
   */
  toJSON (pretty = false) {
    const obj = JSON.parse(super.toJSON())
    obj.source = this.source
    obj.transaction = this.transaction
    if (pretty) return JSON.stringify(obj, null, 2)
    return JSON.stringify(obj)
  }
}

module.exports = Revoke
