import { hexToUint8, decToHex } from '../Utils/Utils'
import TokenRequest, { TokenRequestOptions, TokenRequestJSON } from './TokenRequest'
import bigInt from 'big-integer'
type feeType = 'flat' | 'percentage'
export interface AdjustFeeOptions extends TokenRequestOptions {
  feeType?: feeType;
  feeRate?: string;
  fee_type?: feeType;
  fee_rate?: string;
}
export interface AdjustFeeJSON extends TokenRequestJSON {
  fee_type?: feeType;
  fee_rate?: string;
}
export default class AdjustFee extends TokenRequest {
  private _feeType: feeType

  private _feeRate: string

  public constructor (options: AdjustFeeOptions = {
    feeType: 'flat',
    feeRate: '0'
  }) {
    options.type = {
      text: 'adjust_fee',
      value: 8
    }
    super(options)

    /**
     * Fee type of the Token flat or percentage
     * @type {string}
     * @private
     */
    if (options.feeType !== undefined) {
      this._feeType = options.feeType
    } else if (options.fee_type !== undefined) {
      this._feeType = options.fee_type
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
  }

  /**
   * The Type of fee for this token (flat or percentage)
   * @type {feeType}
   */
  public get feeType (): feeType {
    return this._feeType
  }

  public set feeType (val: feeType) {
    this._feeType = val
  }

  /**
   * The fee rate of the token make sure to take in account the fee type
   * @type {string}
   */
  public get feeRate (): string {
    return this._feeRate
  }

  public set feeRate (val: string) {
    this._feeRate = val
  }

  /**
   * Returns calculated hash or Builds the request and calculates the hash
   *
   * @throws An exception if missing parameters or invalid parameters
   * @type {string}
   * @readonly
   */
  public get hash (): string {
    if (!this.feeType) throw new Error('Fee Type is not set.')
    if (!this.feeRate) throw new Error('Fee Rate is not set.')
    if (this.feeType === 'percentage' && bigInt(this.feeRate).greater(bigInt('100'))) throw new Error('Fee Type is percentage and exceeds the maximum of 100')
    return super.requestHash()
      .update(hexToUint8(decToHex(+(this.feeType === 'flat'), 1)))
      .update(hexToUint8(decToHex(this.feeRate, 16)))
      .digest('hex') as string
  }

  /**
   * Returns the request JSON ready for broadcast to the Logos Network
   * @returns {AdjustFeeJSON} JSON request
   */
  public toJSON (): AdjustFeeJSON {
    const obj: AdjustFeeJSON = super.toJSON()
    obj.fee_type = this.feeType
    obj.fee_rate = this.feeRate
    return obj
  }
}
