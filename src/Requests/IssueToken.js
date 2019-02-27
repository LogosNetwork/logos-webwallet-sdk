const Utils = require('../Utils')
const Request = require('./Request')
const blake = require('blakejs')
const nacl = require('tweetnacl/nacl')
const Logos = require('@logosnetwork/logos-rpc-client')

/**
 * The Token Issuance class for Token Issuance Requests.
 */
class IssueToken extends Request {
  constructor (options = {
    tokenID: null,
    symbol: null,
    name: null,
    totalSupply: null,
    feeType: null,
    feeRate: null,
    settings: {
      add: false,
      modifyAdd: false,
      revoke: false,
      modifyRevoke: false,
      freeze: false,
      modifyFreeze: false,
      adjustFee: false,
      modifyAdjustFee: false,
      whitelist: false,
      modifyWhitelist: false
    },
    controllers: [{
      address: null,
      changeAdd: false,
      changeModifyAdd: false,
      changeRevoke: false,
      changeModifyRevoke: false,
      changeFreeze: false,
      changeModifyFreeze: false,
      changeAdjustFee: false,
      changeModifyAdjustFee: false,
      changeWhitelist: false,
      changeModifyWhitelisting: false,
      promoteController: false,
      updateIssuerInfo: false
    }],
    issuerInfo: null
  }) {
    super(options)

    /**
     * Request version of webwallet SDK
     * @type {number}
     * @private
     */
    this._version = 1
  }

  set tokenID (val) {
    super.hash = null
    this._tokenID = val
  }

  /**
   * Return the token id
   * @type {string}
   */
  get tokenID () {
    if (this._tokenID) {
      return this._tokenID
    } else {
      if (!this.origin) throw new Error('Origin account is not set.')
      if (!this.previous) throw new Error('Previous is not set.')
      const context = blake.blake2bInit(32, null)
      blake.blake2bUpdate(context, Utils.hexToUint8(this.previous))
      blake.blake2bUpdate(context, Utils.hexToUint8(this.symbol + this.name))
      blake.blake2bUpdate(context, Utils.hexToUint8(this.origin))
      let tokenID = Utils.uint8ToHex(blake.blake2bFinal(context))
      this.tokenID = tokenID
      return this.tokenID
    }
  }

  set symbol (val) {
    if (Utils.byteCount(val) > 8) throw new Error('Token Symbol - Invalid Size. Max Size 8 Bytes')
    if (!Utils.isAlphanumeric(val)) throw new Error('Token Symbol - Non-alphanumeric characters')
    this._symbol = val
  }

  /**
   * The symbol of the token (8 Bytes Max)
   * @type {string}
   */
  get symbol () {
    return this._symbol
  }

  set name (val) {
    if (Utils.byteCount(val) > 32) throw new Error('Token Name - Invalid Size. Max Size 32 Bytes')
    if (!Utils.isAlphanumeric(val)) throw new Error('Token Name - Non-alphanumeric characters')
    this._name = val
  }

  /**
   * The name of the token (32 Bytes Max)
   * @type {string}
   */
  get name () {
    return this._name
  }

  get totalSupply () {
    return this._totalSupply
  }

  set totalSupply (val) {
    this._totalSupply = val
  }

  get feeType () {
    return this._feeType
  }

  set feeType (val) {
    this._feeType = val
  }

  get feeRate () {
    return this._feeRate
  }

  set feeRate (val) {
    this._feeRate = val
  }

  get settings () {
    return this._settings
  }

  set settings (val) {
    this._settings = val
  }

  get controllers () {
    return this._controllers
  }

  set controllers (val) {
    this._controllers = val
  }

  get issuerInfo () {
    return this._issuerInfo
  }

  set issuerInfo (val) {
    if (Utils.byteCount(val) > 512) throw new Error('Issuer Info - Invalid Size. Max Size 512 Bytes')
    this._issuerInfo = val
  }

  /**
   * Returns the type of this request
   * @type {string}
   * @readonly
   */
  get type () {
    return 'issue'
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
      if (!this.transactions) throw new Error('Transactions are not set.')
      if (this.sequence === null) throw new Error('Sequence is not set.')
      if (this.fee === null) throw new Error('Transaction fee is not set.')
      if (!this.origin) throw new Error('Origin account is not set.')
      const context = blake.blake2bInit(32, null)
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(2, 1)))
      blake.blake2bUpdate(context, Utils.hexToUint8(this.previous))
      blake.blake2bUpdate(context, Utils.hexToUint8(this.origin))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(this.fee, 16)))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.changeEndianness(Utils.decToHex(this.sequence, 4))))

      // Change Properties
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.keyFromAccount(this.client)))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.keyFromAccount(this.representative)))
      super.hash = Utils.uint8ToHex(blake.blake2bFinal(context))
      return super.hash
    }
  }

  /**
   * Creates a signature for the request
   * @param {Hexadecimal64Length} privateKey - private key in hex
   * @returns {boolean} if the signature is valid
   */
  sign (privateKey) {
    privateKey = Utils.hexToUint8(privateKey)
    if (privateKey.length !== 32) throw new Error('Invalid Private Key length. Should be 32 bytes.')
    let hash = Utils.hexToUint8(this.hash)
    this.signature = Utils.uint8ToHex(nacl.sign.detached(hash, privateKey))
    return this.verify()
  }

  /**
   * Verifies the request's integrity
   * @returns {boolean}
   */
  verify () {
    if (!this.hash) throw new Error('Hash is not set.')
    if (!this.signature) throw new Error('Signature is not set.')
    if (!this.origin) throw new Error('Origin account is not set.')
    return nacl.sign.detached.verify(Utils.hexToUint8(this.hash), Utils.hexToUint8(this.signature), Utils.hexToUint8(this.origin))
  }

  /**
   * Publishes the request
   * @param {RPCOptions} options - rpc options
   * @returns {Promise<Hexadecimal64Length>} hash of transcation
   */
  async publish (options) {
    let delegateId = null
    if (this.previous !== '0000000000000000000000000000000000000000000000000000000000000000') {
      delegateId = parseInt(this.previous.slice(-2), 16) % 32
    } else {
      delegateId = parseInt(this.origin.slice(-2), 16) % 32
    }
    const RPC = new Logos({ url: `http://${options.delegates[delegateId]}:55000`, proxyURL: options.proxy })
    let hash = await RPC.transactions.publish(this.toJSON())
    return hash
  }

  /**
   * Returns the request JSON ready for broadcast to the Logos Network
   * @param {boolean} pretty - if true it will format the JSON (note you can't broadcast pretty json)
   * @returns {RequestJSON} JSON request
   */
  toJSON (pretty = false) {
    const obj = {}
    obj.type = 'send'
    obj.previous = this.previous
    obj.origin = this._origin
    obj.fee = this.fee
    obj.sequence = this.sequence.toString()
    obj.hash = this.hash
    obj.next = '0000000000000000000000000000000000000000000000000000000000000000'
    obj.work = this.work
    obj.signature = this.signature
    obj.client = this.client
    obj.representative = this.representative
    if (pretty) return JSON.stringify(obj, null, 2)
    return JSON.stringify(obj)
  }
}

module.exports = IssueToken
