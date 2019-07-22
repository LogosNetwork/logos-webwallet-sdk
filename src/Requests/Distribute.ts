import { hexToUint8, uint8ToHex, decToHex, keyFromAccount } from '../Utils/Utils'
import { blake2bUpdate, blake2bFinal } from 'blakejs'
import TokenRequest, { TokenRequestOptions, TokenRequestJSON } from './TokenRequest'
import { Transaction } from '@logosnetwork/logos-rpc-client/dist/api';
export interface DistributeOptions extends TokenRequestOptions {
  transaction?: Transaction
}
export interface DistributeJSON extends TokenRequestJSON {
  transaction?: Transaction
}
export default class Distribute extends TokenRequest {
  private _transaction: Transaction
  constructor (options:DistributeOptions = {
    transaction: null
  }) {
    options.type = {
      text: 'distribute',
      value: 12
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
    const context = super.requestHash()
    const account = hexToUint8(keyFromAccount(this.transaction.destination))
    blake2bUpdate(context, account)
    const amount = hexToUint8(decToHex(this.transaction.amount, 16))
    blake2bUpdate(context, amount)
    return uint8ToHex(blake2bFinal(context))
  }

  /**
   * Returns the request JSON ready for broadcast to the Logos Network
   * @returns {DistributeJSON} JSON request
   */
  toJSON () {
    const obj:DistributeJSON = super.toJSON()
    obj.transaction = this.transaction
    return obj
  }
}
