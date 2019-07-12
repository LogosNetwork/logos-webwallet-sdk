import { hexToUint8, uint8ToHex, byteCount, stringToHex } from '../Utils'
import { blake2bUpdate, blake2bFinal } from 'blakejs'
import TokenRequest from './TokenRequest'

/**
 * The Token UpdateIssuerInfo class.
 */
export default class UpdateIssuerInfo extends TokenRequest {
  constructor (options = {
    issuerInfo: ''
  }) {
    super(options)

    /**
     * Issuer Info of the token
     * @type {TokenSettings}
     * @private
     */
    if (options.issuerInfo !== undefined) {
      this._issuerInfo = options.issuerInfo
    } else if (options.new_info) {
      this._issuerInfo = options.new_info
    } else {
      this._issuerInfo = ''
    }

    this._type = {
      text: 'update_issuer_info',
      value: 9
    }
  }

  /**
   * The issuer info of the token
   * @type {string}
   */
  get issuerInfo () {
    return this._issuerInfo
  }

  set issuerInfo (val) {
    if (byteCount(val) > 512) throw new Error('Issuer Info - Invalid Size. Max Size 512 Bytes')
    this._issuerInfo = val
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
    if (this.issuerInfo === null) throw new Error('IssuerInfo is not set.')
    if (byteCount(this.issuerInfo) > 512) throw new Error('Issuer Info - Invalid Size. Max Size 512 Bytes')
    const context = super.hash()
    const issuerInfo = hexToUint8(stringToHex(this.issuerInfo))
    blake2bUpdate(context, issuerInfo)
    return uint8ToHex(blake2bFinal(context))
  }

  /**
   * Returns the request JSON ready for broadcast to the Logos Network
   * @param {boolean} pretty - if true it will format the JSON (note you can't broadcast pretty json)
   * @returns {RequestJSON} JSON request
   */
  toJSON (pretty = false) {
    const obj = JSON.parse(super.toJSON())
    obj.new_info = this.issuerInfo
    if (pretty) return JSON.stringify(obj, null, 2)
    return JSON.stringify(obj)
  }
}
