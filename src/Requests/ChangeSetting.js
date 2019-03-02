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
    if (typeof val !== 'boolean') throw new Error('value must be a boolean')
    super.hash = null
    this._value = val
  }

  /**
   * Return the previous request as hash
   * @type {boolean}
   */
  get value () {
    return this._value
  }

  set setting (val) {
    if (typeof Settings[val] !== 'number') throw new Error('Invalid setting option')
    super.hash = null
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
   * Returns the type of this request
   * @type {string}
   * @readonly
   */
  get type () {
    return 'change_setting'
  }

  /**
   * Returns calculated hash or Builds the request and calculates the hash
   *
   * @throws An exception if missing parameters or invalid parameters
   * @type {Hexadecimal64Length}
   * @readonly
   */
  get hash () {
    if (super.hash) {
      return super.hash
    } else {
      if (!this.previous) throw new Error('Previous is not set.')
      if (!this.origin) throw new Error('Origin account is not set.')
      if (this.fee === null) throw new Error('fee is not set.')
      if (this.sequence === null) throw new Error('Sequence is not set.')
      if (!this.tokenID) throw new Error('TokenID is not set.')
      if (!this.setting) throw new Error('Settings is not set.')
      if (this.value === null) throw new Error('Value is not set.')
      const context = blake.blake2bInit(32, null)
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(4, 1)))
      blake.blake2bUpdate(context, Utils.hexToUint8(this.previous))
      blake.blake2bUpdate(context, Utils.hexToUint8(this.origin))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(this.fee, 16)))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.changeEndianness(Utils.decToHex(this.sequence, 4))))

      // TokenID
      let tokenID = Utils.hexToUint8(this.tokenID)
      blake.blake2bUpdate(context, tokenID)

      // Token Change Settings Properties
      let setting = Utils.hexToUint8(Utils.decToHex(Settings[this.setting], 1))
      blake.blake2bUpdate(context, setting)
      let value = Utils.hexToUint8(Utils.decToHex((+this.value), 1))
      blake.blake2bUpdate(context, value)

      super.hash = Utils.uint8ToHex(blake.blake2bFinal(context))
      return super.hash
    }
  }

  /**
   * Returns the request JSON ready for broadcast to the Logos Network
   * @param {boolean} pretty - if true it will format the JSON (note you can't broadcast pretty json)
   * @returns {RequestJSON} JSON request
   */
  toJSON (pretty = false) {
    const obj = {}
    obj.type = this.type
    obj.origin = this._origin
    obj.signature = this.signature
    obj.previous = this.previous
    obj.fee = this.fee
    obj.hash = this.hash
    obj.sequence = this.sequence.toString()
    obj.next = '0000000000000000000000000000000000000000000000000000000000000000'
    obj.token_id = this.tokenID
    obj.token_account = Utils.accountFromHexKey(this.tokenID)
    obj.setting = this.setting
    obj.value = this.value
    if (pretty) return JSON.stringify(obj, null, 2)
    return JSON.stringify(obj)
  }
}

module.exports = ChangeSetting
