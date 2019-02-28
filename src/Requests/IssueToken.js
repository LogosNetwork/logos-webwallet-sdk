const Utils = require('../Utils')
const Request = require('./Request')
const blake = require('blakejs')
const nacl = require('tweetnacl/nacl')
const Logos = require('@logosnetwork/logos-rpc-client')
const bigInt = require('big-integer')

/**
 * The Token Issuance class for Token Issuance Requests.
 */
class IssueToken extends Request {
  constructor (options = {
    tokenID: null,
    symbol: null,
    name: null,
    totalSupply: '340282366920938463463374607431768210000',
    feeType: 'flat',
    feeRate: '0',
    settings: {
      add: false,
      modify_add: false,
      revoke: false,
      modify_revoke: false,
      freeze: false,
      modify_freeze: false,
      adjust_fee: false,
      modify_adjust_fee: false,
      whitelist: false,
      modify_whitelist: false
    },
    controllers: [{
      account: null,
      change_add: false,
      change_modify_add: false,
      change_revoke: false,
      change_modify_revoke: false,
      change_freeze: false,
      change_modify_freeze: false,
      change_adjust_fee: false,
      change_modify_adjust_fee: false,
      change_whitelist: false,
      change_modify_whitelisting: false,
      promote_controller: false,
      update_issuer_info: false
    }],
    issuerInfo: ''
  }) {
    super(options)

    /**
     * TokenID of the token
     * @type {Hexadecimal64Length}
     * @private
     */
    if (options.tokenID !== undefined) {
      this._tokenID = options.tokenID
    } else {
      this._tokenID = null
    }

    /**
     * Symbol of the token
     * @type {string}
     * @private
     */
    if (options.symbol !== undefined) {
      this._symbol = options.symbol
    } else {
      this._symbol = null
    }

    /**
     * Name of the token
     * @type {string}
     * @private
     */
    if (options.name !== undefined) {
      this._name = options.name
    } else {
      this._name = null
    }

    /**
     * Total Supply of the token
     * @type {string}
     * @private
     */
    if (options.totalSupply !== undefined) {
      this._totalSupply = options.totalSupply
    } else {
      this._totalSupply = '340282366920938463463374607431768210000'
    }

    /**
     * Fee type of the Token flat or percentage
     * @type {string}
     * @private
     */
    if (options.feeType !== undefined) {
      this._feeType = options.feeType
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
    } else {
      this._feeRate = '10000000000000000000000'
    }

    /**
     * Settings of the token
     * @type {TokenSettings}
     * @private
     */
    if (options.settings !== undefined) {
      this._settings = options.settings
    } else {
      this._settings = {
        add: false,
        modify_add: false,
        revoke: false,
        modify_revoke: false,
        freeze: false,
        modify_freeze: false,
        adjust_fee: false,
        modify_adjust_fee: false,
        whitelist: false,
        modify_whitelist: false
      }
    }

    /**
     * Controllers of the token
     * @type {Controller[]}
     * @private
     */
    if (options.controllers !== undefined) {
      this._controllers = options.controllers
    } else {
      this._controllers = [{
        account: Utils.accountFromHexKey(this.origin),
        change_add: true,
        change_modify_add: true,
        change_revoke: true,
        change_modify_revoke: true,
        change_freeze: true,
        change_modify_freeze: true,
        change_adjust_fee: true,
        change_modify_adjust_fee: true,
        change_whitelist: true,
        change_modify_whitelisting: true,
        promote_controller: true,
        update_issuer_info: true
      }]
    }

    /**
     * Issuer Info of the token
     * @type {TokenSettings}
     * @private
     */
    if (options.issuerInfo !== undefined) {
      this._issuerInfo = options.issuerInfo
    } else {
      this._issuerInfo = ''
    }

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
      if (!this.symbol) throw new Error('Symbol is not set.')
      if (!this.name) throw new Error('Name is not set.')
      const context = blake.blake2bInit(32, null)
      blake.blake2bUpdate(context, Utils.hexToUint8(this.previous))
      blake.blake2bUpdate(context, Utils.hexToUint8(this.origin))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.stringToHex(this.symbol + this.name)))
      let tokenID = Utils.uint8ToHex(blake.blake2bFinal(context))
      this.tokenID = tokenID
      return this.tokenID
    }
  }

  set symbol (val) {
    if (Utils.byteCount(val) > 8) throw new Error('Token Symbol - Invalid Size. Max Size 8 Bytes')
    if (!Utils.isAlphanumeric(val)) throw new Error('Token Symbol - Non-alphanumeric characters')
    super.hash = null
    this._tokenID = null
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
    super.hash = null
    this._tokenID = null
    this._name = val
  }

  /**
   * The name of the token (32 Bytes Max)
   * @type {string}
   */
  get name () {
    return this._name
  }

  /**
   * The total supply of the token (340282366920938463463374607431768210000 is Max)
   * @type {string}
   */
  get totalSupply () {
    return this._totalSupply
  }

  set totalSupply (val) {
    if (bigInt(val).gt(bigInt('340282366920938463463374607431768210000'))) throw new Error('Invalid Total Supply - Maximum supply is 340282366920938463463374607431768210000')
    super.hash = null
    this._totalSupply = val
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
   * The settings for the token
   * @type {string}
   */
  get settings () {
    return this._settings
  }

  set settings (val) {
    if (typeof val.add === 'undefined') throw new Error('add should be passed in token settings')
    if (typeof val.modify_add === 'undefined') throw new Error('modify_add should be passed in token settings')
    if (typeof val.revoke === 'undefined') throw new Error('revoke should be passed in token settings')
    if (typeof val.modify_revoke === 'undefined') throw new Error('modify_revoke should be passed in token settings')
    if (typeof val.freeze === 'undefined') throw new Error('freeze should be passed in token settings')
    if (typeof val.modify_freeze === 'undefined') throw new Error('modify_freeze should be passed in token settings')
    if (typeof val.adjust_fee === 'undefined') throw new Error('adjust_fee should be passed in token settings')
    if (typeof val.modify_adjust_fee === 'undefined') throw new Error('modify_adjust_fee should be passed in token settings')
    if (typeof val.whitelist === 'undefined') throw new Error('whitelist should be passed in token settings')
    if (typeof val.modify_whitelist === 'undefined') throw new Error('modify_whitelist should be passed in token settings')
    super.hash = null
    this._settings = val
  }

  /**
   * The contollers of the token
   * @type {Controller[]}
   */
  get controllers () {
    return this._controllers
  }

  set controllers (val) {
    super.hash = null
    this._controllers = val
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
    return 'issue'
  }

  /**
   * Adds a controller to the Token Issuance
   * @param {Controller} controller - controller you want to add to this request
   * @returns {Controller[]} list of all controllers
   */
  addController (controller) {
    if (this.controllers.length === 10) throw new Error('Can only fit 10 controllers per token issuance request!')
    if (!controller.account) throw new Error('Controller must have account')
    if (typeof controller.change_add === 'undefined') throw new Error('change_add should be passed: Change add allows the controller account to add additional tokens')
    if (typeof controller.change_modify_add === 'undefined') throw new Error('change_modify_add should be passed: Change modify add allows the controller account to modify if the token is allowed to have additional tokens added')
    if (typeof controller.change_revoke === 'undefined') throw new Error('change_revoke should be passed: Change revoke allows the controller account to revoke tokens')
    if (typeof controller.change_modify_revoke === 'undefined') throw new Error('change_modify_revoke should be passed: Change modify revoke allows the controller account to modify if tokens can be revoked')
    if (typeof controller.change_freeze === 'undefined') throw new Error('change_freeze should be passed: Change Freeze allows the controller account to add or delete accounts from the freeze list')
    if (typeof controller.change_modify_freeze === 'undefined') throw new Error('change_modify_freeze should be passed: Change modify freeze allows the controller account to modify if accounts can be frozen')
    if (typeof controller.change_adjust_fee === 'undefined') throw new Error('change_adjust_fee should be passed: Change adjust fee allows the controller account to modify the fee of the token')
    if (typeof controller.change_modify_adjust_fee === 'undefined') throw new Error('change_modify_adjust_fee should be passed: Change modify fee allows the controller account to modify if the token fees can be adjusted')
    if (typeof controller.change_whitelist === 'undefined') throw new Error('change_whitelist should be passed: Change whitelist allows the controller account to add additional tokens')
    if (typeof controller.change_modify_whitelisting === 'undefined') throw new Error('change_modify_whitelisting should be passed: Change modify whitelist allows the controller account to modify if this token has whitelisting')
    if (typeof controller.promote_controller === 'undefined') throw new Error('promote_controller should be passed: Promote controller allows the controller account to add additional controller accounts')
    if (typeof controller.update_issuer_info === 'undefined') throw new Error('update_issuer_info should be passed: Update issuer info allows the controller account to change the token information')
    super.hash = null
    this._controllers.push(controller)
    return this._controllers
  }

  getObjectBits (obj) {
    let bits = ''
    for (let val of Object.values(obj)) {
      if (typeof val === 'boolean') bits = bits + (+val)
    }
    return bits
  }

  getControllerJSON () {
    let controllers = []
    for (let controller of this.controllers) {
      let newController = {}
      newController.account = controller.account
      newController.privileges = []
      for (let key in controller) {
        if (controller.hasOwnProperty(key) && controller[key] === true) {
          newController.privileges.push(key)
        }
      }
      controllers.push(newController)
    }
    return controllers
  }

  getSettingsJSON () {
    let settings = []
    for (let key in this._settings) {
      if (this._settings.hasOwnProperty(key) && this._settings[key] === true) {
        settings.push(key)
      }
    }
    return settings
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
      if (!this.symbol) throw new Error('Symbol is not set.')
      if (!this.name) throw new Error('Name is not set.')
      if (!this.totalSupply) throw new Error('Total Supply is not set.')
      if (!this.feeType) throw new Error('Fee Type is not set.')
      if (!this.feeRate) throw new Error('Fee Rate is not set.')
      if (!this.settings) throw new Error('Settings is not set.')
      if (!this.controllers) throw new Error('Controllers is not set.')
      if (this.issuerInfo === null) throw new Error('IssuerInfo is not set.')
      const context = blake.blake2bInit(32, null)
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(2, 1)))
      blake.blake2bUpdate(context, Utils.hexToUint8(this.previous))
      blake.blake2bUpdate(context, Utils.hexToUint8(this.origin))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(this.fee, 16)))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.changeEndianness(Utils.decToHex(this.sequence, 4))))

      // TokenID
      blake.blake2bUpdate(context, Utils.hexToUint8(this.tokenID))

      // Token Issuance Properties
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(Utils.hexToDec(Utils.stringToHex(this.symbol)), 8)))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(Utils.hexToDec(Utils.stringToHex(this.name)), 32)))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(this.totalSupply, 16)))
      if (this.feeType === 'percentage') {
        blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(0, 1)))
      } else {
        blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(1, 1)))
      }
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(this.feeRate, 16)))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(parseInt(this.getObjectBits(this.settings), 2), 2)))
      for (let controller of this.controllers) {
        blake.blake2bUpdate(context, Utils.hexToUint8(Utils.keyFromAccount(controller.account)))
        blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(parseInt(this.getObjectBits(controller), 2), 3)))
      }
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(Utils.hexToDec(Utils.stringToHex(this.issuerInfo)), 512)))
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
    obj.type = 'issue'
    obj.previous = this.previous
    obj.origin = this._origin
    obj.fee = this.fee
    obj.sequence = this.sequence.toString()
    obj.hash = this.hash
    obj.next = '0000000000000000000000000000000000000000000000000000000000000000'
    obj.work = this.work
    obj.signature = this.signature
    obj.token_id = this.tokenID
    obj.symbol = this.symbol
    obj.name = this.name
    obj.total_supply = this.totalSupply
    obj.fee_type = this.feeType
    obj.fee_rate = this.feeRate
    obj.settings = this.getSettingsJSON()
    obj.controllers = this.getControllerJSON()
    obj.issuer_info = this.issuerInfo
    if (pretty) return JSON.stringify(obj, null, 2)
    return JSON.stringify(obj)
  }
}

module.exports = IssueToken
