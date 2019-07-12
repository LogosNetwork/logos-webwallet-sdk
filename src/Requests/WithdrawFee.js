import { hexToUint8, uint8ToHex, decToHex, keyFromAccount } from '../Utils'
import { blake2bUpdate, blake2bFinal } from 'blakejs'
import TokenRequest from './TokenRequest'

/**
 * The Token Withdraw Fee class for Token Withdraw Fee Request.
 */
export default class WithdrawFee extends TokenRequest {
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

    this._type = {
      text: 'withdraw_fee',
      value: 13
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
    const context = super.hash()
    const account = hexToUint8(keyFromAccount(this.transaction.destination))
    blake2bUpdate(context, account)
    const amount = hexToUint8(decToHex(this.transaction.amount, 16))
    blake2bUpdate(context, amount)
    return uint8ToHex(blake2bFinal(context))
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
