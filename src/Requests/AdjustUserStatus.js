import { hexToUint8, uint8ToHex, decToHex, keyFromAccount } from '../Utils'
import { blake2bUpdate, blake2bFinal } from 'blakejs'
import TokenRequest from './TokenRequest'
const Statuses = {
  frozen: 0,
  unfrozen: 1,
  whitelisted: 2,
  not_whitelisted: 3
}
/**
 * The Token AdjustUserStatus class
 */
export default class AdjustUserStatus extends TokenRequest {
  constructor (options = {
    account: null,
    status: null
  }) {
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
     * @type {string}
     * @private
     */
    if (options.status !== undefined) {
      this._status = options.status.toLowerCase()
    } else {
      this._status = null
    }

    this._type = {
      text: 'adjust_user_status',
      value: 7
    }
  }

  set status (val) {
    if (typeof Statuses[val.toLowerCase()] !== 'number') throw new Error('Invalid status option valid options are frozen, unfrozen, whitelisted, not_whitelisted')
    this._status = val.toLowerCase()
  }

  /**
   * Returns the string of the status
   * @type {string}
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
    if (!this.account) throw new Error('Account is not set.')
    if (!this.status) throw new Error('Status is not set.')
    const context = super.hash()
    const account = hexToUint8(keyFromAccount(this.account))
    blake2bUpdate(context, account)
    const status = hexToUint8(decToHex(Statuses[this.status], 1))
    blake2bUpdate(context, status)
    return uint8ToHex(blake2bFinal(context))
  }

  /**
   * Returns the request JSON ready for broadcast to the Logos Network
   * @param {boolean} pretty - if true it will format the JSON (note you can't broadcast pretty json)
   * @returns {RequestJSON} JSON request
   */
  toJSON (pretty = false) {
    const obj = JSON.parse(super.toJSON())
    obj.account = this.account
    obj.status = this.status
    if (pretty) return JSON.stringify(obj, null, 2)
    return JSON.stringify(obj)
  }
}
