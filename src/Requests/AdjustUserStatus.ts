import { hexToUint8, uint8ToHex, decToHex, keyFromAccount } from '../Utils'
import { blake2bUpdate, blake2bFinal } from 'blakejs'
import TokenRequest, { TokenRequestOptions, TokenRequestJSON } from './TokenRequest'
const Statuses = {
  frozen: 0,
  unfrozen: 1,
  whitelisted: 2,
  not_whitelisted: 3
}
interface AdjustUserStatusOptions extends TokenRequestOptions {
  account?: string
  status?: 'frozen' | 'unfrozen' | 'whitelist' | 'not_whitelisted'
}
export interface  AdjustUserStatusJSON extends TokenRequestJSON {
  account?: string
  status?: 'frozen' | 'unfrozen' | 'whitelist' | 'not_whitelisted'
}
export default class AdjustUserStatus extends TokenRequest {
  private _account: string
  private _status: 'frozen' | 'unfrozen' | 'whitelist' | 'not_whitelisted'
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
     * @type {LogosAddress}
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
   * @type {LogosAddress}
   */
  get account () {
    return this._account
  }

  /**
   * Returns calculated hash or Builds the request and calculates the hash
   *
   * @throws An exception if missing parameters or invalid parameters
   * @type {Hexadecimal64Length}
   * @readonly
   */
  get hash () {
    if (!this.account) throw new Error('Account is not set.')
    if (!this.status) throw new Error('Status is not set.')
    const context = super.requestHash()
    const account = hexToUint8(keyFromAccount(this.account))
    blake2bUpdate(context, account)
    const status = hexToUint8(decToHex(Statuses[this.status], 1))
    blake2bUpdate(context, status)
    return uint8ToHex(blake2bFinal(context))
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
