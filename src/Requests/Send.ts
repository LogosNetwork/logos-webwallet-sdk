import { hexToUint8, decToHex, keyFromAccount } from '../Utils/Utils'
import Request, { RequestOptions, RequestJSON } from './Request'
import bigInt from 'big-integer'
import { Transaction } from '@logosnetwork/logos-rpc-client/api'

interface SendOptions extends RequestOptions {
  transactions?: Transaction[];
}
export interface SendJSON extends RequestJSON {
  transactions?: Transaction[];
}
export default class Send extends Request {
  private _transactions: Transaction[]

  public constructor (options: SendOptions = {
    transactions: []
  }) {
    options.type = {
      text: 'send',
      value: 0
    }
    super(options)

    if (options.transactions !== undefined) {
      this._transactions = options.transactions
    } else {
      this._transactions = []
    }
  }

  public set transactions (transactions: Transaction[]) {
    this._transactions = transactions
  }

  /**
   * Return the previous request as hash
   * @type {Transaction[]}
   */
  public get transactions (): Transaction[] {
    return this._transactions
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
    if (!this.transactions) throw new Error('Transactions are not set.')
    const context = super.requestHash()
    for (const transaction of this.transactions) {
      context.update(hexToUint8(keyFromAccount(transaction.destination)))
      context.update(hexToUint8(decToHex(transaction.amount, 16)))
    }
    return context.digest('hex') as string
  }

  /**
   * Adds a tranction to the Send
   * @param {Transaction} transaction - transaction you want to add to this send request
   * @returns {Transaction[]} list of all transactions
   */
  public addTransaction (transaction: Transaction): Transaction[] {
    if (this.transactions.length === 8) throw new Error('Can only fit 8 transactions per send request!')
    if (!transaction.destination || !transaction.amount) throw new Error('Send destination and amount')
    this.transactions.push(transaction)
    return this.transactions
  }

  /**
   * Returns the request JSON ready for broadcast to the Logos Network
   * @returns {SendJSON} Send Request JSON
   */
  public toJSON (): SendJSON {
    const obj: SendJSON = super.toJSON()
    obj.transactions = this.transactions
    return obj
  }
}
