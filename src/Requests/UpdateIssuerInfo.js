const Utils = require('../Utils')
const TokenRequest = require('./TokenRequest')
const blake = require('blakejs')

/**
 * The Token UpdateIssuerInfo class.
 */
class UpdateIssuerInfo extends TokenRequest {
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
    } else if (options.issuer_info) {
      this._issuerInfo = options.issuer_info
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
    if (Utils.byteCount(val) > 512) throw new Error('Issuer Info - Invalid Size. Max Size 512 Bytes')
    super.hash = null
    this._issuerInfo = val
  }

  /**
   * Returns the type of this request
   * @type {string}
   * @readonly
   */
  get type () {
    return 'update_issuer_info'
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
      if (this.issuerInfo === null) throw new Error('IssuerInfo is not set.')
      const context = blake.blake2bInit(32, null)
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(9, 1)))
      blake.blake2bUpdate(context, Utils.hexToUint8(this.origin))
      blake.blake2bUpdate(context, Utils.hexToUint8(this.previous))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(this.fee, 16)))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.changeEndianness(Utils.decToHex(this.sequence, 4))))

      // TokenID
      let tokenID = Utils.hexToUint8(this.tokenID)
      blake.blake2bUpdate(context, tokenID)

      // Issuer Info Properties
      let issuerInfo = Utils.hexToUint8(Utils.stringToHex(this.issuerInfo))
      blake.blake2bUpdate(context, issuerInfo)

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
    obj.new_info = this.issuerInfo
    if (pretty) return JSON.stringify(obj, null, 2)
    return JSON.stringify(obj)
  }
}

module.exports = UpdateIssuerInfo
