import { hexToUint8, decToHex, keyFromAccount } from '../Utils/Utils'
import TokenRequest, { TokenRequestOptions, TokenRequestJSON } from './TokenRequest'
import { Transaction } from '@logosnetwork/logos-rpc-client/dist/api'
export interface WithdrawFeeOptions extends TokenRequestOptions {
  transaction?: Transaction;
}
export interface WithdrawFeeJSON extends TokenRequestJSON {
  transaction?: Transaction;
}
export default class WithdrawFee extends TokenRequest {
  private _transaction: Transaction

  public constructor (options: WithdrawFeeOptions = {
    transaction: null
  }) {
    options.type = {
      text: 'withdraw_fee',
      value: 13
    }
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

  public set transaction (transaction: Transaction) {
    if (typeof transaction.destination === 'undefined') throw new Error('destination should be passed in transaction object')
    if (typeof transaction.amount === 'undefined') throw new Error('amount should be passed in transaction object - pass this as the base unit of your token (e.g. satoshi)')
    this._transaction = transaction
  }

  /**
   * Return the previous request as hash
   * @type {Transaction}
   */
  public get transaction (): Transaction {
    return this._transaction
  }

  /**
   * Returns calculated hash or Builds the request and calculates the hash
   *
   * @throws An exception if missing parameters or invalid parameters
   * @type {string}
   * @readonly
   */
  public get hash (): string {
    if (this.transaction === null) throw new Error('transaction is not set.')
    return super.requestHash()
      .update(hexToUint8(keyFromAccount(this.transaction.destination)))
      .update(hexToUint8(decToHex(this.transaction.amount, 16)))
      .digest('hex') as string
  }

  /**
   * Returns the request JSON ready for broadcast to the Logos Network
   * @returns {WithdrawFeeJSON} JSON request
   */
  public toJSON (): WithdrawFeeJSON {
    const obj: WithdrawFeeJSON = super.toJSON()
    obj.transaction = this.transaction
    return obj
  }
}
