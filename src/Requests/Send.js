const Utils = require('../Utils')
const Request = require('./Request')
const blake = require('blakejs')
const bigInt = require('big-integer')

/**
 * The Send class for Send Requests.
 */
class Send extends Request {
  constructor (options = {
    transactions: []
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
  }

  set transactions (transactions) {
    super.hash = null
    this._transactions = transactions
  }

  /**
   * Return the previous request as hash
   * @type {Transaction[]}
   */
  get transactions () {
    return this._transactions
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
    return 'send'
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
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(0, 1)))
      blake.blake2bUpdate(context, Utils.hexToUint8(this.previous))
      blake.blake2bUpdate(context, Utils.hexToUint8(this.origin))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(this.fee, 16)))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.changeEndianness(Utils.decToHex(this.sequence, 4))))
      for (let transaction of this.transactions) {
        blake.blake2bUpdate(context, Utils.hexToUint8(Utils.keyFromAccount(transaction.destination)))
        blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(transaction.amount, 16)))
      }
      super.hash = Utils.uint8ToHex(blake.blake2bFinal(context))
      return super.hash
    }
  }

  /**
   * Adds a tranction to the Send
   * @param {Transaction} transaction - transaction you want to add to this send request
   * @returns {Transaction[]} list of all transactions
   */
  addTransaction (transaction) {
    if (this.transactions.length === 8) throw new Error('Can only fit 8 transactions per send request!')
    if (!transaction.destination || !transaction.amount) throw new Error('Send destination and amount')
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
    obj.type = 'send'
    obj.origin = this._origin
    obj.fee = this.fee
    obj.transactions = this.transactions
    obj.number_transactions = this.transactions.length
    obj.hash = this.hash
    obj.next = '0000000000000000000000000000000000000000000000000000000000000000'
    obj.work = this.work
    obj.signature = this.signature
    if (pretty) return JSON.stringify(obj, null, 2)
    return JSON.stringify(obj)
  }
}

module.exports = Send
