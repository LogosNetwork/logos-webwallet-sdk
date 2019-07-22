import { hexToUint8, decToHex, keyFromAccount } from '../Utils/Utils'
import TokenRequest, { TokenRequestOptions, TokenRequestJSON } from './TokenRequest'
import { Transaction } from '@logosnetwork/logos-rpc-client/dist/api';
export interface RevokeOptions extends TokenRequestOptions {
  source?: string
  transaction?: Transaction
}
export interface RevokeJSON extends TokenRequestJSON {
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
     * @type {string}
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
   * @type {string}
   */
  get source () {
    return this._source
  }

  /**
   * Returns calculated hash or Builds the request and calculates the hash
   *
   * @throws An exception if missing parameters or invalid parameters
   * @type {string}
   * @readonly
   */
  get hash () {
    if (this.transaction === null) throw new Error('transaction is not set.')
    if (!this.transaction.destination) throw new Error('transaction destination is not set.')
    if (!this.transaction.amount) throw new Error('transaction amount is not set.')
    if (!this.source) throw new Error('Source account is not set.')
    return <string>super.requestHash()
      .update(hexToUint8(keyFromAccount(this.source)))
      .update(hexToUint8(keyFromAccount(this.transaction.destination)))
      .update(hexToUint8(decToHex(this.transaction.amount, 16)))
      .digest('hex')
  }

  /**
   * Returns the request JSON ready for broadcast to the Logos Network
   * @returns {RevokeJSON} JSON request
   */
  toJSON () {
    const obj:RevokeJSON = super.toJSON()
    obj.source = this.source
    obj.transaction = this.transaction
    return obj
  }
}
