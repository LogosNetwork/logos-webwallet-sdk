const Utils = require('../Utils')
const TokenRequest = require('./TokenRequest')
const blake = require('blakejs')
const Statuses = {
  'frozen': 0,
  'unfrozen': 1,
  'whitelisted': 2,
  'not_whitelisted': 3
}
/**
 * The Token AdjustUserStatus class
 */
class AdjustUserStatus extends TokenRequest {
  constructor (options = {
    account: null,
    status: null
  }) {
    super(options)

    /**
     * Account to change the status of
     * @type {LogosAddress}
     * @private
     */
    if (options.account !== undefined) {
      this._account = options.account
    } else {
      this._account = null
    }

    /**
     * Status that we are applying to the user
     * @type {string}
     * @private
     */
    if (options.status !== undefined) {
      this._status = options.status
    } else {
      this._status = null
    }
  }

  set status (val) {
    if (typeof Statuses[val] !== 'number') throw new Error('Invalid status option valid options are frozen, unfrozen, whitelisted, not_whitelisted')
    super.hash = null
    this._status = val
  }

  /**
   * Returns the string of the status
   * @type {string}
   */
  get status () {
    return this._status
  }

  set account (account) {
    super.hash = null
    this._account = account
  }

  /**
   * Return the account which the status is being changed
   * @type {LogosAddress}
   */
  get account () {
    return this._account
  }

  /**
   * Returns the type of this request
   * @type {string}
   * @readonly
   */
  get type () {
    return 'adjust_user_status'
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
      if (!this.account) throw new Error('Account is not set.')
      if (!this.status) throw new Error('Status is not set.')
      const context = blake.blake2bInit(32, null)
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(7, 1)))
      blake.blake2bUpdate(context, Utils.hexToUint8(this.origin))
      blake.blake2bUpdate(context, Utils.hexToUint8(this.previous))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(this.fee, 16)))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.changeEndianness(Utils.decToHex(this.sequence, 4))))

      // TokenID
      let tokenID = Utils.hexToUint8(this.tokenID)
      blake.blake2bUpdate(context, tokenID)

      // Token AdjustUserStatus Properties
      let account = Utils.hexToUint8(Utils.keyFromAccount(this.account))
      blake.blake2bUpdate(context, account)
      let status = Utils.hexToUint8(Utils.decToHex(Statuses[this.status], 1))
      blake.blake2bUpdate(context, status)

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
    obj.account = this.account
    obj.status = this.status
    if (pretty) return JSON.stringify(obj, null, 2)
    return JSON.stringify(obj)
  }
}

module.exports = AdjustUserStatus
