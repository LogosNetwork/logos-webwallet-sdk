import { hexToUint8, uint8ToHex, decToHex, keyFromAccount } from '../Utils'
import { blake2bUpdate, blake2bFinal } from 'blakejs'
import TokenRequest, { TokenRequestOptions } from './TokenRequest'
interface Transaction {
  destination: string
  amount: string
}
interface RevokeOptions extends TokenRequestOptions {
  source?: string
  transaction?: Transaction
}
export default class Revoke extends TokenRequest {
  private _source: string
  private _transaction: Transaction
  constructor (options:RevokeOptions = {
    source: null,
    transaction: null
  }) {
    options.type = {
      text: 'revoke',
      value: 6
    }
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
   * Returns calculated hash or Builds the request and calculates the hash
   *
   * @throws An exception if missing parameters or invalid parameters
   * @type {Hexadecimal64Length}
   * @readonly
   */
  get hash () {
    if (this.transaction === null) throw new Error('transaction is not set.')
    if (!this.transaction.destination) throw new Error('transaction destination is not set.')
    if (!this.transaction.amount) throw new Error('transaction amount is not set.')
    if (!this.source) throw new Error('Source account is not set.')
    const context = super.requestHash()
    const source = hexToUint8(keyFromAccount(this.source))
    blake2bUpdate(context, source)
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
    obj.source = this.source
    obj.transaction = this.transaction
    if (pretty) return JSON.stringify(obj, null, 2)
    return JSON.stringify(obj)
  }
}