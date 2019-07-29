import { hexToUint8, decToHex } from '../Utils/Utils'
import TokenRequest, { TokenRequestOptions, TokenRequestJSON } from './TokenRequest'
const Settings = {
  issuance: 0,
  revoke: 2,
  freeze: 4,
  adjust_fee: 6,
  whitelist: 8
}
export type Setting = 'issuance' | 'revoke' | 'freeze' | 'adjust_fee' | 'whitelist'
export interface ChangeSettingOptions extends TokenRequestOptions {
  setting?: Setting;
  value?: boolean | string;
}
export interface ChangeSettingJSON extends TokenRequestJSON {
  setting?: Setting;
  value?: boolean;
}
export default class ChangeSetting extends TokenRequest {
  private _setting: Setting

  private _value: boolean

  public constructor (options: ChangeSettingOptions = {
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
      this._value = options.value.toString() === 'true'
    } else {
      this._value = null
    }
  }

  public set value (val: boolean) {
    this._value = val
  }

  /**
   * Return the value of the changed setting
   * @type {boolean}
   */
  public get value (): boolean {
    return this._value
  }

  public set setting (val: Setting) {
    this._setting = val
  }

  /**
   * Returns the string of the setting
   * @type {Setting}
   */
  public get setting (): Setting {
    return this._setting
  }

  /**
   * Returns calculated hash or Builds the request and calculates the hash
   *
   * @throws An exception if missing parameters or invalid parameters
   * @type {string}
   * @readonly
   */
  public get hash (): string {
    if (!this.setting) throw new Error('Settings is not set.')
    if (this.value === null) throw new Error('Value is not set.')
    return super.requestHash()
      .update(hexToUint8(decToHex(Settings[this.setting], 1)))
      .update(hexToUint8(decToHex((+this.value), 1)))
      .digest('hex') as string
  }

  /**
   * Returns the request JSON ready for broadcast to the Logos Network
   * @returns {ChangeSettingJSON} JSON request
   */
  public toJSON (): ChangeSettingJSON {
    const obj: ChangeSettingJSON = super.toJSON()
    obj.setting = this.setting
    obj.value = this.value
    return obj
  }
}
