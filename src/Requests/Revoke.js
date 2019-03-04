const Utils = require('../Utils')
const TokenRequest = require('./TokenRequest')
const blake = require('blakejs')

/**
 * The Token Revoke class for Token Revoke Requests.
 */
class Revoke extends TokenRequest {
  constructor (options = {
    source: null,
    transaction: null
  }) {
    super(options)

    /**
     * Transaction to distribute the token
     * @type {string}
     * @private
     */
    if (options.transaction !== undefined) {
      this._transaction = options.transaction
    } else {
      this._transaction = null
    }

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

  set transaction (transaction) {
    if (typeof transaction.destination === 'undefined') throw new Error('destination should be passed in transaction object')
    if (typeof transaction.amount === 'undefined') throw new Error('amount should be passed in transaction object - pass this as the base unit of your token (e.g. satoshi)')
    super.hash = null
    this._transaction = transaction
  }

  /**
   * Return the previous request as hash
   * @type {Transaction}
   */
  get transaction () {
    return this._transaction
  }

  set source (revokee) {
    super.hash = null
    this._source = revokee
  }

  /**
   * Return where the token is being revoked from
   * @type {LogosAddress}
   */
  get source () {
    return this._source
  }

  /**
   * Returns the type of this request
   * @type {string}
   * @readonly
   */
  get type () {
    return 'revoke'
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
      if (this.transaction === null) throw new Error('transaction is not set.')
      if (!this.tokenID) throw new Error('TokenID is not set.')
      if (!this.source) throw new Error('Source account is not set.')
      const context = blake.blake2bInit(32, null)
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(6, 1)))
      blake.blake2bUpdate(context, Utils.hexToUint8(this.previous))
      blake.blake2bUpdate(context, Utils.hexToUint8(this.origin))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(this.fee, 16)))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.changeEndianness(Utils.decToHex(this.sequence, 4))))

      // TokenID
      let tokenID = Utils.hexToUint8(this.tokenID)
      blake.blake2bUpdate(context, tokenID)

      // Token Revoke Properties
      let source = Utils.hexToUint8(Utils.keyFromAccount(this.source))
      blake.blake2bUpdate(context, source)
      let account = Utils.hexToUint8(Utils.keyFromAccount(this.transaction.destination))
      blake.blake2bUpdate(context, account)
      let amount = Utils.hexToUint8(Utils.decToHex(this.transaction.amount, 16))
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
    obj.source = this.source
    obj.transaction = this.transaction
    if (pretty) return JSON.stringify(obj, null, 2)
    return JSON.stringify(obj)
  }
}

module.exports = Revoke