const Utils = require('../Utils')
const TokenRequest = require('./TokenRequest')
const blake = require('blakejs')

/**
 * The Token AdjustFee class.
 */
class AdjustFee extends TokenRequest {
  constructor (options = {
    feeType: 'flat',
    feeRate: '0'
  }) {
    super(options)

    /**
     * Fee type of the Token flat or percentage
     * @type {string}
     * @private
     */
    if (options.feeType !== undefined) {
      this._feeType = options.feeType
    } else if (options.fee_type !== undefined) {
      this._feeType = options.fee_type
    } else {
      this._feeType = 'flat'
    }

    /**
     * Fee Rate of the token
     * @type {string}
     * @private
     */
    if (options.feeRate !== undefined) {
      this._feeRate = options.feeRate
    } else if (options.fee_rate !== undefined) {
      this._feeRate = options.fee_rate
    } else {
      this._feeRate = '0'
    }
  }

  /**
   * The Type of fee for this token (flat or percentage)
   * @type {string}
   */
  get feeType () {
    return this._feeType
  }

  set feeType (val) {
    if (val !== 'flat' && val !== 'percentage') throw new Error('Token Fee Type - Invalid Fee Type use "flat" or "percentage"')
    super.hash = null
    this._feeType = val
  }

  /**
   * The fee rate of the token make sure to take in account the fee type
   * @type {string}
   */
  get feeRate () {
    return this._feeRate
  }

  set feeRate (val) {
    super.hash = null
    this._feeRate = val
  }

  /**
   * Returns the type of this request
   * @type {string}
   * @readonly
   */
  get type () {
    return 'adjust_fee'
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
      if (!this.feeType) throw new Error('Fee Type is not set.')
      if (!this.feeRate) throw new Error('Fee Rate is not set.')
      const context = blake.blake2bInit(32, null)
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(8, 1)))
      blake.blake2bUpdate(context, Utils.hexToUint8(this.origin))
      blake.blake2bUpdate(context, Utils.hexToUint8(this.previous))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(this.fee, 16)))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.changeEndianness(Utils.decToHex(this.sequence, 4))))

      // TokenID
      let tokenID = Utils.hexToUint8(this.tokenID)
      blake.blake2bUpdate(context, tokenID)

      // Token Fee Properties
      let feeType = Utils.hexToUint8(Utils.decToHex(+(this.feeType === 'flat'), 1))
      blake.blake2bUpdate(context, feeType)

      let feeRate = Utils.hexToUint8(Utils.decToHex(this.feeRate, 16))
      blake.blake2bUpdate(context, feeRate)

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
    obj.fee_type = this.feeType
    obj.fee_rate = this.feeRate
    if (pretty) return JSON.stringify(obj, null, 2)
    return JSON.stringify(obj)
  }
}

module.exports = AdjustFee
