import { hexToUint8, decToHex } from '../Utils/Utils'
import TokenRequest, { TokenRequestOptions, TokenRequestJSON } from './TokenRequest'

export interface IssueAdditionalOptions extends TokenRequestOptions {
  amount?: string
}
export interface IssueAdditionalJSON extends TokenRequestJSON {
  amount?: string
}
export default class IssueAdditional extends TokenRequest {
  private _amount: string
  constructor (options:IssueAdditionalOptions = {
    amount: '0'
  }) {
    options.type = {
      text: 'issue_additional',
      value: 3
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
   * @type {string}
   * @readonly
   */
  get hash () {
    if (this.amount === null) throw new Error('Amount is not set.')
    return <string>super.requestHash()
      .update(hexToUint8(decToHex(this.amount, 16)))
      .digest('hex')
  }

  /**
   * Returns the request JSON ready for broadcast to the Logos Network
   * @returns {IssueAdditionalJSON} JSON request
   */
  toJSON () {
    const obj:IssueAdditionalJSON = super.toJSON()
    obj.amount = this.amount
    return obj
  }
}
