import { hexToUint8, uint8ToHex, decToHex } from '../Utils'
import { blake2bUpdate, blake2bFinal } from 'blakejs'
import TokenRequest, { TokenRequestOptions, TokenRequestJSON } from './TokenRequest'

export interface BurnOptions extends TokenRequestOptions {
  amount?: string
}
export interface BurnJSON extends TokenRequestJSON {
  amount?: string
}
export default class Burn extends TokenRequest {
  private _amount: string
  constructor (options:BurnOptions = {
    amount: '0'
  }) {
    options.type = {
      text: 'burn',
      value: 11
    }
    super(options)

    /**
     * Amount to add to the token
     * @type {string}
     * @private
     */
    if (options.amount !== undefined) {
      this._amount = options.amount
    } else {
      this._amount = '0'
    }
  }

  set amount (amount) {
    if (typeof amount === 'undefined') throw new Error('amount should be passed - pass this as the base unit of your token (e.g. satoshi)')
    this._amount = amount
  }

  /**
   * Return the amount you are adding
   * @type {string}
   */
  get amount () {
    return this._amount
  }

  /**
   * Returns calculated hash or Builds the request and calculates the hash
   *
   * @throws An exception if missing parameters or invalid parameters
   * @type {Hexadecimal64Length}
   * @readonly
   */
  get hash () {
    if (this.amount === null) throw new Error('Amount is not set.')
    const context = super.requestHash()
    const amount = hexToUint8(decToHex(this.amount, 16))
    blake2bUpdate(context, amount)
    return uint8ToHex(blake2bFinal(context))
  }

  /**
   * Returns the request JSON ready for broadcast to the Logos Network
   * @returns {BurnJSON} JSON request
   */
  toJSON () {
    const obj:BurnJSON = super.toJSON()
    obj.amount = this.amount
    return obj
  }
}
