import { hexToUint8, decToHex } from '../Utils/Utils'
import TokenRequest, { TokenRequestOptions, TokenRequestJSON } from './TokenRequest'
export type Setting = 'issuance' | 'revoke' | 'freeze' | 'adjust_fee' | 'whitelist'
export interface ImmuteSettingJSON extends TokenRequestJSON {
  setting?: Setting
}
const Settings = {
  issuance: 0,
  revoke: 2,
  freeze: 4,
  adjust_fee: 6,
  whitelist: 8
}
export interface ImmuteSettingOptions extends TokenRequestOptions {
  setting?: Setting
}
export default class ImmuteSetting extends TokenRequest {
  private _setting: Setting
  constructor (options:ImmuteSettingOptions = {
    setting: null
  }) {
    options.type = {
      text: 'immute_setting',
      value: 5
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
  }

  set setting (val) {
    if (typeof Settings[val.toLowerCase()] !== 'number') throw new Error('Invalid setting option')
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
   * @type {string}
   * @readonly
   */
  get hash () {
    if (!this.setting) throw new Error('setting is not set.')
    if (typeof Settings[this.setting] !== 'number') throw new Error('Invalid setting option')
    return <string>super.requestHash()
      .update(hexToUint8(decToHex(Settings[this.setting], 1)))
      .digest('hex')
  }

  /**
   * Returns the request JSON ready for broadcast to the Logos Network
   * @returns {RequestJSON} JSON request
   */
  toJSON () {
    const obj:ImmuteSettingJSON = super.toJSON()
    obj.setting = this.setting
    return obj
  }
}
