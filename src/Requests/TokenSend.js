const Utils = require('../Utils')
const TokenRequest = require('./TokenRequest')
const blake = require('blakejs')
const bigInt = require('big-integer')

/**
 * The Token Send class
 */
class TokenSend extends TokenRequest {
  constructor (options = {
    transactions: [],
    tokenFee: '0'
  }) {
    super(options)

    /**
     * Transactions
     * @type {Transaction[]}
     * @private
     */
    if (options.transactions !== undefined) {
      this._transactions = options.transactions
    } else {
      this._transactions = []
    }

    /**
     * Fee Rate of the token
     * @type {string}
     * @private
     */
    if (options.tokenFee !== undefined) {
      this._tokenFee = options.tokenFee
    } else if (options.token_fee !== undefined) {
      this._tokenFee = options.token_fee
    } else {
      this._tokenFee = '0'
    }
  }

  set transactions (transactions) {
    this._transactions = transactions
  }

  /**
   * Return the transactions
   * @type {Transaction[]}
   */
  get transactions () {
    return this._transactions
  }

  set tokenFee (val) {
    this._tokenFee = val
  }

  /**
   * Return the string amount of the Token Fee in the base unit of the token
   * @type {string}
   */
  get tokenFee () {
    return this._tokenFee
  }

  /**
   * Returns the total amount contained in this request
   * @type {string}
   * @readonly
   */
  get totalAmount () {
    let totalAmount = bigInt(0)
    for (let transaction of this._transactions) {
      totalAmount = totalAmount.plus(bigInt(transaction.amount))
    }
    return totalAmount.toString()
  }

  /**
   * Returns the type of this request
   * @type {string}
   * @readonly
   */
  get type () {
    return {
      text: 'token_send',
      value: 14
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
    if (this.tokenFee === null) throw new Error('token fee is not set.')
    const context = super.hash()
    for (let transaction of this.transactions) {
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.keyFromAccount(transaction.destination)))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(transaction.amount, 16)))
    }
    blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(this.tokenFee, 16)))
    return Utils.uint8ToHex(blake.blake2bFinal(context))
  }

  /**
   * Adds a tranction to the Token Send
   * @param {Transaction} transaction - transaction you want to add to this token send request
   * @returns {Transaction[]} list of all transactions
   */
  addTransaction (transaction) {
    if (this.transactions.length === 8) throw new Error('Can only fit 8 transactions per token send request!')
    if (!transaction.destination || !transaction.amount) throw new Error('Token send destination and amount')
    this.transactions.push(transaction)
    return this.transactions
  }

  /**
   * Returns the request JSON ready for broadcast to the Logos Network
   * @param {boolean} pretty - if true it will format the JSON (note you can't broadcast pretty json)
   * @returns {RequestJSON} JSON request
   */
  toJSON (pretty = false) {
    const obj = JSON.parse(super.toJSON())
    obj.transactions = this.transactions
    obj.token_fee = this.tokenFee
    if (pretty) return JSON.stringify(obj, null, 2)
    return JSON.stringify(obj)
  }
}

module.exports = TokenSend
