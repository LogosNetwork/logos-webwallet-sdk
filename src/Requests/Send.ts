import { hexToUint8, uint8ToHex, decToHex, keyFromAccount } from '../Utils'
import { blake2bUpdate, blake2bFinal } from 'blakejs'
import Request, { RequestOptions } from './Request'
import * as bigInt from 'big-integer'
interface Transaction {
  destination: string
  amount: string
}
interface SendOptions extends RequestOptions {
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
   * @type {Hexadecimal64Length}
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
  addTransaction (transaction) {
    if (this.transactions.length === 8) throw new Error('Can only fit 8 transactions per send request!')
    if (!transaction.destination || !transaction.amount) throw new Error('Send destination and amount')
    this.transactions.push(transaction)
    return this.transactions
  }

  /**
   * Returns the request JSON ready for broadcast to the Logos Network
   * @param {boolean} pretty - if true it will format the JSON (note you can't broadcast pretty json)
   * @returns {string} Send Request JSON stringified
   */
  toJSON (pretty:boolean = false) {
    const obj = JSON.parse(super.toJSON())
    obj.transactions = this.transactions
    if (pretty) return JSON.stringify(obj, null, 2)
    return JSON.stringify(obj)
  }
}
