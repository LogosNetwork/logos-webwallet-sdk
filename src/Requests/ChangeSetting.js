const Utils = require('../Utils')
const TokenRequest = require('./TokenRequest')
const blake = require('blakejs')
const Settings = {
  'issuance': 0,
  'revoke': 2,
  'freeze': 4,
  'adjust_fee': 6,
  'whitelist': 8
}
/**
 * The Token Change Setting class for Change Setting Requests.
 */
class ChangeSetting extends TokenRequest {
  constructor (options = {
    setting: null,
    value: null
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

    /**
     * Value you wish to set the setting to
     * @type {boolean}
     * @private
     */
    if (options.value !== undefined) {
      if (options.value === false || options.value === 'false' || options.value === 0) {
        this._value = false
      } else if (options.value === true || options.value === 'true' || options.value === 1) {
        this._value = true
      }
    } else {
      this._value = null
    }

    this._type = {
      text: 'change_setting',
      value: 4
    }
  }

  set value (val) {
    if (typeof val !== 'boolean') throw new Error('value must be a boolean')
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
    if (!this.setting) throw new Error('Settings is not set.')
    if (this.value === null) throw new Error('Value is not set.')
    const context = super.hash()
    let setting = Utils.hexToUint8(Utils.decToHex(Settings[this.setting], 1))
    blake.blake2bUpdate(context, setting)
    let value = Utils.hexToUint8(Utils.decToHex((+this.value), 1))
    blake.blake2bUpdate(context, value)

    return Utils.uint8ToHex(blake.blake2bFinal(context))
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

module.exports = ChangeSetting
