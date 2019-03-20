const Utils = require('../Utils')
const TokenRequest = require('./TokenRequest')
const blake = require('blakejs')

/**
 * The Token Withdraw Fee class for Token Withdraw Fee Request.
 */
class WithdrawFee extends TokenRequest {
  constructor (options = {
    transaction: null
  }) {
    super(options)

    /**
     * Transaction to withdraw the token fees
     * @type {string}
     * @private
     */
    if (options.transaction !== undefined) {
      this._transaction = options.transaction
    } else {
      this._transaction = null
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

  /**
   * Returns the type of this request
   * @type {string}
   * @readonly
   */
  get type () {
    return {
      text: 'withdraw_fee',
      value: 13
    }
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
    const context = super.hash()
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
    obj.transaction = this.transaction
    if (pretty) return JSON.stringify(obj, null, 2)
    return JSON.stringify(obj)
  }
}

module.exports = WithdrawFee
