import { hexToUint8, decToHex, keyFromAccount } from '../Utils/Utils'
import TokenRequest, { TokenRequestOptions, TokenRequestJSON } from './TokenRequest'
import * as bigInt from 'big-integer'
import { Transaction } from '@logosnetwork/logos-rpc-client/dist/api'
interface TokenSendOptions extends TokenRequestOptions {
  transactions?: Transaction[];
  tokenFee?: string;
  token_fee?: string;
}
export interface TokenSendJSON extends TokenRequestJSON {
  transactions?: Transaction[];
  token_fee?: string;
}
export default class TokenSend extends TokenRequest {
  private _transactions: Transaction[]

  private _tokenFee: string

  public constructor (options: TokenSendOptions = {
    transactions: [],
    tokenFee: '0'
  }) {
    options.type = {
      text: 'token_send',
      value: 15
    }
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

  public set transactions (transactions: Transaction[]) {
    this._transactions = transactions
  }

  /**
   * Return the transactions
   * @type {Transaction[]}
   */
  public get transactions (): Transaction[] {
    return this._transactions
  }

  public set tokenFee (val: string) {
    this._tokenFee = val
  }

  /**
   * Return the string amount of the Token Fee in the minor unit of the token
   * @type {string}
   */
  public get tokenFee (): string {
    return this._tokenFee
  }

  /**
   * Returns the total amount contained in this request
   * @type {string}
   * @readonly
   */
  public get totalAmount (): string {
    let totalAmount = bigInt(0)
    for (const transaction of this._transactions) {
      totalAmount = totalAmount.plus(bigInt(transaction.amount))
    }
    return totalAmount.toString()
  }

  /**
   * Returns calculated hash or Builds the request and calculates the hash
   *
   * @throws An exception if missing parameters or invalid parameters
   * @type {string}
   * @readonly
   */
  public get hash (): string {
    if (this.transactions === null) throw new Error('transaction is not set.')
    if (this.tokenFee === null) throw new Error('token fee is not set.')
    const context = super.requestHash()
    for (const transaction of this.transactions) {
      context.update(hexToUint8(keyFromAccount(transaction.destination)))
      context.update(hexToUint8(decToHex(transaction.amount, 16)))
    }
    context.update(hexToUint8(decToHex(this.tokenFee, 16)))
    return context.digest('hex') as string
  }

  /**
   * Adds a tranction to the Token Send
   * @param {Transaction} transaction - transaction you want to add to this token send request
   * @returns {Transaction[]} list of all transactions
   */
  public addTransaction (transaction: Transaction): Transaction[] {
    if (this.transactions.length === 8) throw new Error('Can only fit 8 transactions per token send request!')
    if (!transaction.destination || !transaction.amount) throw new Error('Token send destination and amount')
    this.transactions.push(transaction)
    return this.transactions
  }

  /**
   * Returns the request JSON ready for broadcast to the Logos Network
   * @returns {TokenSendJSON} JSON request
   */
  public toJSON (): TokenSendJSON {
    const obj: TokenSendJSON = super.toJSON()
    obj.transactions = this.transactions
    obj.token_fee = this.tokenFee
    return obj
  }
}
