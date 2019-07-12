import { hexToUint8, uint8ToHex, decToHex } from '../Utils'
import { blake2bUpdate, blake2bFinal } from 'blakejs'
import TokenRequest from './TokenRequest'

const Settings = {
  issuance: 0,
  revoke: 2,
  freeze: 4,
  adjust_fee: 6,
  whitelist: 8
}
/**
 * The Token ImmuteSetting class for Token ImmuteSetting Requests.
 */
export default class ImmuteSetting extends TokenRequest {
  constructor (options = {
    setting: null
  }) {
    super(options)

    /**
     * Setting you wish to change about the token
     * @type {string}
     * @private
     */
    if (options.setting !== undefined) {
      this._setting = options.setting.toLowerCase()
    } else {
      this._setting = null
    }

    this._type = {
      text: 'immute_setting',
      value: 5
    }
  }

  set setting (val) {
    if (typeof Settings[val.toLowerCase()] !== 'number') throw new Error('Invalid setting option')
    this._setting = val.toLowerCase()
  }

  /**
   * Returns the string of the setting
   * @type {string}
   */
  get setting () {
    return this._setting
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
    if (!this.setting) throw new Error('setting is not set.')
    if (typeof Settings[this.setting] !== 'number') throw new Error('Invalid setting option')
    const context = super.hash()
    const setting = hexToUint8(decToHex(Settings[this.setting], 1))
    blake2bUpdate(context, setting)
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
    if (pretty) return JSON.stringify(obj, null, 2)
    return JSON.stringify(obj)
  }
}
