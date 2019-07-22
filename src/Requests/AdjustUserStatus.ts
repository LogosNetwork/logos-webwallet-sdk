import { hexToUint8, decToHex, keyFromAccount } from '../Utils/Utils'
import TokenRequest, { TokenRequestOptions, TokenRequestJSON } from './TokenRequest'
const Statuses = {
  frozen: 0,
  unfrozen: 1,
  whitelisted: 2,
  not_whitelisted: 3
}
export type Status = 'frozen' | 'unfrozen' | 'whitelisted' | 'not_whitelisted'
export interface AdjustUserStatusOptions extends TokenRequestOptions {
  account?: string
  status?: Status
}
export interface  AdjustUserStatusJSON extends TokenRequestJSON {
  account?: string
  status?: Status
}
export default class AdjustUserStatus extends TokenRequest {
  private _account: string
  private _status: Status
  constructor (options:AdjustUserStatusOptions = {
    account: null,
    status: null
  }) {
    options.type = {
      text: 'adjust_user_status',
      value: 7
    }
    super(options)

    /**
     * Account to change the status of
     * @type {string}
     * @private
     */
    if (options.account !== undefined) {
      this._account = options.account
    } else {
      this._account = null
    }

    /**
     * Status that we are applying to the user
     * @type {Status}
     * @private
     */
    if (options.status !== undefined) {
      this._status = options.status
    } else {
      this._status = null
    }
  }

  set status (val) {
    this._status = val
  }

  /**
   * Returns the string of the status
   * @type {Status}
   */
  get status () {
    return this._status
  }

  set account (account) {
    this._account = account
  }

  /**
   * Return the account which the status is being changed
   * @type {string}
   */
  get account () {
    return this._account
  }

  /**
   * Returns calculated hash or Builds the request and calculates the hash
   *
   * @throws An exception if missing parameters or invalid parameters
   * @type {string}
   * @readonly
   */
  get hash () {
    if (!this.account) throw new Error('Account is not set.')
    if (!this.status) throw new Error('Status is not set.')
    return <string>super.requestHash()
      .update(hexToUint8(keyFromAccount(this.account)))
      .update(hexToUint8(decToHex(Statuses[this.status], 1)))
      .digest('hex')
  }

  /**
   * Returns the request JSON ready for broadcast to the Logos Network
   * @returns {AdjustUserStatusJSON} JSON request
   */
  toJSON () {
    const obj:AdjustUserStatusJSON = super.toJSON()
    obj.account = this.account
    obj.status = this.status
    return obj
  }
}
