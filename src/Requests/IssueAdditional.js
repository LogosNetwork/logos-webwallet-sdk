const Utils = require('../Utils')
const TokenRequest = require('./TokenRequest')
const blake = require('blakejs')

/**
 * The Token IssueAdditional class for Token IssueAdditional Requests.
 */
class IssueAdditional extends TokenRequest {
  constructor (options = {
    amount: '0'
  }) {
    super(options)

    /**
     * Amount to add to the token
     * @type {string}
     * @private
     */
    if (options.amount !== undefined) {
      this._amount = options.amount
    } else {
      this._amount = '0'
    }
  }

  set amount (amount) {
    if (typeof amount === 'undefined') throw new Error('amount should be passed - pass this as the base unit of your token (e.g. satoshi)')
    super.hash = null
    this._amount = amount
  }

  /**
   * Return the amount you are adding
   * @type {Transaction}
   */
  get amount () {
    return this._transaction
  }

  /**
   * Returns the type of this request
   * @type {string}
   * @readonly
   */
  get type () {
    return 'issue_additional'
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
      if (this.amount === null) throw new Error('Amount is not set.')
      if (!this.tokenID) throw new Error('TokenID is not set.')
      const context = blake.blake2bInit(32, null)
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(3, 1)))
      blake.blake2bUpdate(context, Utils.hexToUint8(this.previous))
      blake.blake2bUpdate(context, Utils.hexToUint8(this.origin))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(this.fee, 16)))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.changeEndianness(Utils.decToHex(this.sequence, 4))))

      // TokenID
      let tokenID = Utils.hexToUint8(this.tokenID)
      blake.blake2bUpdate(context, tokenID)

      // Token Issue Additional Properties
      let amount = Utils.hexToUint8(Utils.decToHex(this.amount, 16))
      blake.blake2bUpdate(context, amount)

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
    obj.amount = this.amount
    obj.work = this.work
    if (pretty) return JSON.stringify(obj, null, 2)
    return JSON.stringify(obj)
  }
}

module.exports = IssueAdditional
