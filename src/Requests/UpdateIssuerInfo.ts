import { hexToUint8, byteCount, stringToHex } from '../Utils/Utils'
import TokenRequest, { TokenRequestOptions, TokenRequestJSON } from './TokenRequest'

export interface UpdateIssuerInfoOptions extends TokenRequestOptions {
  issuerInfo?: string,
  new_info?: string
}
export interface UpdateIssuerInfoJSON extends TokenRequestJSON {
  new_info?: string
}
export default class UpdateIssuerInfo extends TokenRequest {
  private _issuerInfo: string
  constructor (options:UpdateIssuerInfoOptions = {
    issuerInfo: '',
    new_info: ''
  }) {
    options.type = {
      text: 'update_issuer_info',
      value: 9
    }
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
   * Returns calculated hash or Builds the request and calculates the hash
   *
   * @throws An exception if missing parameters or invalid parameters
   * @type {string}
   * @readonly
   */
  get hash () {
    if (this.issuerInfo === null) throw new Error('IssuerInfo is not set.')
    if (byteCount(this.issuerInfo) > 512) throw new Error('Issuer Info - Invalid Size. Max Size 512 Bytes')
    return <string>super.requestHash()
      .update(hexToUint8(stringToHex(this.issuerInfo)))
      .digest('hex')
  }

  /**
   * Returns the request JSON ready for broadcast to the Logos Network
   * @param {boolean} pretty - if true it will format the JSON (note you can't broadcast pretty json)
   * @returns {UpdateIssuerInfoJSON} JSON request
   */
  toJSON () {
    const obj:UpdateIssuerInfoJSON = super.toJSON()
    obj.new_info = this.issuerInfo
    return obj
  }
}
