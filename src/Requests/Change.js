const Utils = require('../Utils')
const Request = require('./Request')
const blake = require('blakejs')

/**
 * The Change class for Change Requests.
 */
class Change extends Request {
  constructor (options = {
    client: null,
    representative: null
  }) {
    super(options)

    /**
     * Client - who the fuck knows
     * @type {string}
     * @private
     */
    if (options.client !== undefined) {
      this._client = options.client
    } else {
      this._client = null
    }

    /**
     * Representative
     * @type {string}
     * @private
     */
    if (options.representative !== undefined) {
      this._representative = options.representative
    } else {
      this._representative = null
    }

    this._type = {
      text: 'change',
      value: 1
    }
  }

  set client (val) {
    this._client = val
  }

  /**
   * Return the client - I have no idea what this does
   * @type {string}
   */
  get client () {
    return this._client
  }

  set representative (val) {
    this._representative = val
  }

  /**
   * Returns the representative
   * @type {string}
   */
  get representative () {
    return this._representative
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
    const context = super.hash()
    blake.blake2bUpdate(context, Utils.hexToUint8(Utils.keyFromAccount(this.client)))
    blake.blake2bUpdate(context, Utils.hexToUint8(Utils.keyFromAccount(this.representative)))
    return Utils.uint8ToHex(blake.blake2bFinal(context))
  }

  /**
   * Returns the request JSON ready for broadcast to the Logos Network
   * @param {boolean} pretty - if true it will format the JSON (note you can't broadcast pretty json)
   * @returns {RequestJSON} JSON request
   */
  toJSON (pretty = false) {
    const obj = JSON.parse(super.toJSON())
    obj.representative = this.representative
    if (pretty) return JSON.stringify(obj, null, 2)
    return JSON.stringify(obj)
  }
}

module.exports = Change
