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
    super.hash = null
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
    super.hash = null
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
    return 'token_send'
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
      if (this.transaction === null) throw new Error('transaction is not set.')
      if (this.tokenFee === null) throw new Error('token fee is not set.')
      const context = blake.blake2bInit(32, null)
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(14, 1)))
      blake.blake2bUpdate(context, Utils.hexToUint8(this.origin))
      blake.blake2bUpdate(context, Utils.hexToUint8(this.previous))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(this.fee, 16)))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.changeEndianness(Utils.decToHex(this.sequence, 4))))

      // TokenID
      let tokenID = Utils.hexToUint8(this.tokenID)
      blake.blake2bUpdate(context, tokenID)

      for (let transaction of this.transactions) {
        blake.blake2bUpdate(context, Utils.hexToUint8(Utils.keyFromAccount(transaction.destination)))
        blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(transaction.amount, 16)))
      }
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(this.tokenFee, 16)))
      super.hash = Utils.uint8ToHex(blake.blake2bFinal(context))
      return super.hash
    }
  }

  /**
   * Adds a tranction to the Token Send
   * @param {Transaction} transaction - transaction you want to add to this token send request
   * @returns {Transaction[]} list of all transactions
   */
  addTransaction (transaction) {
    if (this.transactions.length === 8) throw new Error('Can only fit 8 transactions per token send request!')
    if (!transaction.destination || !transaction.amount) throw new Error('Token send destination and amount')
    super.hash = null
    this.transactions.push(transaction)
    return this.transactions
  }

  /**
   * Returns the request JSON ready for broadcast to the Logos Network
   * @param {boolean} pretty - if true it will format the JSON (note you can't broadcast pretty json)
   * @returns {RequestJSON} JSON request
   */
  toJSON (pretty = false) {
    const obj = {}
    obj.previous = this.previous
    obj.sequence = this.sequence.toString()
    obj.type = this.type
    obj.origin = this._origin
    obj.fee = this.fee
    obj.token_id = this.tokenID
    obj.transactions = this.transactions
    obj.token_fee = this.tokenFee
    obj.hash = this.hash
    obj.next = '0000000000000000000000000000000000000000000000000000000000000000'
    obj.work = this.work
    obj.signature = this.signature
    obj.token_account = Utils.accountFromHexKey(this.tokenID)
    if (pretty) return JSON.stringify(obj, null, 2)
    return JSON.stringify(obj)
  }
}

module.exports = TokenSend
