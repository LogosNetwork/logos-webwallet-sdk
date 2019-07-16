import { hexToUint8, uint8ToHex, decToHex } from '../Utils'
import { blake2bUpdate, blake2bFinal } from 'blakejs'
import TokenRequest, { TokenRequestOptions, TokenRequestJSON } from './TokenRequest'
export interface ImmuteSettingJSON extends TokenRequestJSON {
  setting?: 'issuance' | 'revoke' | 'freeze' | 'adjust_fee' | 'whitelist'
}
const Settings = {
  issuance: 0,
  revoke: 2,
  freeze: 4,
  adjust_fee: 6,
  whitelist: 8
}
interface ImmuteSettingOptions extends TokenRequestOptions {
  setting?: 'issuance' | 'revoke' | 'freeze' | 'adjust_fee' | 'whitelist'
}
export default class ImmuteSetting extends TokenRequest {
  private _setting: 'issuance' | 'revoke' | 'freeze' | 'adjust_fee' | 'whitelist'
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
   * @type {Hexadecimal64Length}
   * @readonly
   */
  get hash () {
    if (!this.setting) throw new Error('setting is not set.')
    if (typeof Settings[this.setting] !== 'number') throw new Error('Invalid setting option')
    const context = super.requestHash()
    const setting = hexToUint8(decToHex(Settings[this.setting], 1))
    blake2bUpdate(context, setting)
    return uint8ToHex(blake2bFinal(context))
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
