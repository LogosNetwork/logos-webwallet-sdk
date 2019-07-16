import { hexToUint8, uint8ToHex, decToHex } from '../Utils'
import { blake2bUpdate, blake2bFinal } from 'blakejs'
import TokenRequest, { TokenRequestOptions } from './TokenRequest'
const Settings = {
  issuance: 0,
  revoke: 2,
  freeze: 4,
  adjust_fee: 6,
  whitelist: 8
}
interface ChangeSettingOptions extends TokenRequestOptions {
  setting?: 'issuance' | 'revoke' | 'freeze' | 'adjust_fee' | 'whitelist'
  value?: boolean
}
export default class ChangeSetting extends TokenRequest {
  private _setting: 'issuance' | 'revoke' | 'freeze' | 'adjust_fee' | 'whitelist'
  private _value: boolean
  constructor (options:ChangeSettingOptions = {
    setting: null,
    value: null
  }) {
    options.type = {
      text: 'change_setting',
      value: 4
    }
    super(options)

    /**
     * Setting you wish to change about the token
     * @type {string}
     * @private
     */
    if (options.setting !== undefined) {
      this._setting = options.setting
    } else {
      this._setting = null
    }

    /**
     * Value you wish to set the setting to
     * @type {boolean}
     * @private
     */
    if (options.value !== undefined) {
      this._value = options.value
    } else {
      this._value = null
    }
  }

  set value (val) {
    this._value = val
  }

  /**
   * Return the value of the changed setting
   * @type {boolean}
   */
  get value () {
    return this._value
  }

  set setting (val) {
    this._setting = val
  }

  /**
   * Returns the string of the setting
   * @type {string}
   */
  get setting () {
    return this._setting
  }

  /**
   * Returns calculated hash or Builds the request and calculates the hash
   *
   * @throws An exception if missing parameters or invalid parameters
   * @type {Hexadecimal64Length}
   * @readonly
   */
  get hash () {
    if (!this.setting) throw new Error('Settings is not set.')
    if (this.value === null) throw new Error('Value is not set.')
    const context = super.requestHash()
    const setting = hexToUint8(decToHex(Settings[this.setting], 1))
    blake2bUpdate(context, setting)
    const value = hexToUint8(decToHex((+this.value), 1))
    blake2bUpdate(context, value)

    return uint8ToHex(blake2bFinal(context))
  }

  /**
   * Returns the request JSON ready for broadcast to the Logos Network
   * @param {boolean} pretty - if true it will format the JSON (note you can't broadcast pretty json)
   * @returns {RequestJSON} JSON request
   */
  toJSON (pretty = false) {
    const obj = JSON.parse(super.toJSON())
    obj.setting = this.setting
    obj.value = this.value
    if (pretty) return JSON.stringify(obj, null, 2)
    return JSON.stringify(obj)
  }
}
