import { hexToUint8, uint8ToHex, decToHex, keyFromAccount } from '../Utils/Utils'
import { blake2bUpdate, blake2bFinal } from 'blakejs'
import Request, { RequestOptions, RequestJSON } from './Request'
import * as bigInt from 'big-integer'
import { Transaction } from '@logosnetwork/logos-rpc-client/dist/api';

interface SendOptions extends RequestOptions {
  transactions?: Array<Transaction>
}
export interface SendJSON extends RequestJSON {
  transactions?: Array<Transaction>
}
export default class Send extends Request {
  private _transactions: Array<Transaction>
  constructor (options:SendOptions = {
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

  set transactions (transactions) {
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
  get hash () {
    if (!this.transactions) throw new Error('Transactions are not set.')
    const context = super.requestHash()
    for (const transaction of this.transactions) {
      blake2bUpdate(context, hexToUint8(keyFromAccount(transaction.destination)))
      blake2bUpdate(context, hexToUint8(decToHex(transaction.amount, 16)))
    }
    return uint8ToHex(blake2bFinal(context))
  }

  /**
   * Adds a tranction to the Send
   * @param {Transaction} transaction - transaction you want to add to this send request
   * @returns {Transaction[]} list of all transactions
   */
  addTransaction (transaction: Transaction) {
    if (this.transactions.length === 8) throw new Error('Can only fit 8 transactions per send request!')
    if (!transaction.destination || !transaction.amount) throw new Error('Send destination and amount')
    this.transactions.push(transaction)
    return this.transactions
  }

  /**
   * Returns the request JSON ready for broadcast to the Logos Network
   * @returns {SendJSON} Send Request JSON
   */
  toJSON () {
    const obj:SendJSON = super.toJSON()
    obj.transactions = this.transactions
    return obj
  }
}
