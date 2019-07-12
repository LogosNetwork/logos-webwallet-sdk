import { hexToUint8, uint8ToHex, decToHex } from '../Utils'
import { blake2bUpdate, blake2bFinal } from 'blakejs'
import TokenRequest from './TokenRequest'
import bigInt from 'big-integer'

/**
 * The Token AdjustFee class.
 */
export default class AdjustFee extends TokenRequest {
  constructor (options = {
    feeType: 'flat',
    feeRate: '0'
  }) {
    super(options)

    /**
     * Fee type of the Token flat or percentage
     * @type {string}
     * @private
     */
    if (options.feeType !== undefined) {
      this._feeType = options.feeType.toLowerCase()
    } else if (options.fee_type !== undefined) {
      this._feeType = options.fee_type.toLowerCase()
    } else {
      this._feeType = 'flat'
    }

    /**
     * Fee Rate of the token
     * @type {string}
     * @private
     */
    if (options.feeRate !== undefined) {
      this._feeRate = options.feeRate
    } else if (options.fee_rate !== undefined) {
      this._feeRate = options.fee_rate
    } else {
      this._feeRate = '0'
    }

    this._type = {
      text: 'adjust_fee',
      value: 8
    }
  }

  /**
   * The Type of fee for this token (flat or percentage)
   * @type {string}
   */
  get feeType () {
    return this._feeType
  }

  set feeType (val) {
    if (val.toLowerCase() !== 'flat' && val.toLowerCase() !== 'percentage') throw new Error('Token Fee Type - Invalid Fee Type use "flat" or "percentage"')
    this._feeType = val.toLowerCase()
  }

  /**
   * The fee rate of the token make sure to take in account the fee type
   * @type {string}
   */
  get feeRate () {
    return this._feeRate
  }

  set feeRate (val) {
    this._feeRate = val
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
    if (!this.feeType) throw new Error('Fee Type is not set.')
    if (!this.feeRate) throw new Error('Fee Rate is not set.')
    if (this.feeType === 'percentage' && bigInt(this.feeRate).greater(bigInt('100'))) throw new Error('Fee Type is percentage and exceeds the maximum of 100')
    const context = super.hash()
    const feeType = hexToUint8(decToHex(+(this.feeType === 'flat'), 1))
    blake2bUpdate(context, feeType)
    const feeRate = hexToUint8(decToHex(this.feeRate, 16))
    blake2bUpdate(context, feeRate)
    return uint8ToHex(blake2bFinal(context))
  }

  /**
   * Returns the request JSON ready for broadcast to the Logos Network
   * @param {boolean} pretty - if true it will format the JSON (note you can't broadcast pretty json)
   * @returns {RequestJSON} JSON request
   */
  toJSON (pretty = false) {
    const obj = JSON.parse(super.toJSON())
    obj.fee_type = this.feeType
    obj.fee_rate = this.feeRate
    if (pretty) return JSON.stringify(obj, null, 2)
    return JSON.stringify(obj)
  }
}
