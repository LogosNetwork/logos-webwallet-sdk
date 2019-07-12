import { hexToUint8, uint8ToHex, decToHex } from '../Utils'
import { blake2bUpdate, blake2bFinal } from 'blakejs'
import TokenRequest from './TokenRequest'

/**
 * The Token IssueAdditional class for Token IssueAdditional Requests.
 */
export default class IssueAdditional extends TokenRequest {
  constructor (options = {
    amount: '0'
  }) {
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

    this._type = {
      text: 'issue_additional',
      value: 3
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
    if (this.amount === null) throw new Error('Amount is not set.')
    const context = super.hash()
    const amount = hexToUint8(decToHex(this.amount, 16))
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
    obj.amount = this.amount
    if (pretty) return JSON.stringify(obj, null, 2)
    return JSON.stringify(obj)
  }
}
