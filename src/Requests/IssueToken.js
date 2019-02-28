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
      issuance: false,
      modify_issuance: false,
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
      change_issuance: false,
      change_modify_issuance: false,
      change_revoke: false,
      change_modify_revoke: false,
      change_freeze: false,
      change_modify_freeze: false,
      change_adjust_fee: false,
      change_modify_adjust_fee: false,
      change_whitelist: false,
      change_modify_whitelisting: false,
      issuance: false,
      revoke: false,
      freeze: false,
      adjust_fee: false,
      whitelist: false,
      update_issuer_info: false,
      update_controller: false,
      burn: false,
      distribute: false,
      withdraw_fee: false
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
        issuance: false,
        modify_issuance: false,
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
        change_issuance: false,
        change_modify_issuance: false,
        change_revoke: false,
        change_modify_revoke: false,
        change_freeze: false,
        change_modify_freeze: false,
        change_adjust_fee: false,
        change_modify_adjust_fee: false,
        change_whitelist: false,
        change_modify_whitelist: false,
        issuance: false,
        revoke: false,
        freeze: false,
        adjust_fee: false,
        whitelist: false,
        update_issuer_info: false,
        update_controller: false,
        burn: false,
        distribute: false,
        withdraw_fee: false
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
    if (typeof val.issuance === 'undefined') throw new Error('issuance should be passed in token settings')
    if (typeof val.modify_issuance === 'undefined') throw new Error('modify_issuance should be passed in token settings')
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
    return 'issuance'
  }

  /**
   * Adds a controller to the Token Issuance
   * @param {Controller} controller - controller you want to add to this request
   * @returns {Controller[]} list of all controllers
   */
  addController (controller) {
    if (this.controllers.length === 10) throw new Error('Can only fit 10 controllers per token issuance request!')
    if (!controller.account) throw new Error('Controller must have account')
    if (typeof controller.change_issuance === 'undefined') throw new Error('change_issuance should be passed: Change issuance allows the controller account to add additional tokens')
    if (typeof controller.change_modify_issuance === 'undefined') throw new Error('change_modify_issuance should be passed: Change modify issuance allows the controller account to modify if the token is allowed to have additional tokens added')
    if (typeof controller.change_revoke === 'undefined') throw new Error('change_revoke should be passed: Change revoke allows the controller account to revoke tokens')
    if (typeof controller.change_modify_revoke === 'undefined') throw new Error('change_modify_revoke should be passed: Change modify revoke allows the controller account to modify if tokens can be revoked')
    if (typeof controller.change_freeze === 'undefined') throw new Error('change_freeze should be passed: Change Freeze allows the controller account to add or delete accounts from the freeze list')
    if (typeof controller.change_modify_freeze === 'undefined') throw new Error('change_modify_freeze should be passed: Change modify freeze allows the controller account to modify if accounts can be frozen')
    if (typeof controller.change_adjust_fee === 'undefined') throw new Error('change_adjust_fee should be passed: Change adjust fee allows the controller account to modify the fee of the token')
    if (typeof controller.change_modify_adjust_fee === 'undefined') throw new Error('change_modify_adjust_fee should be passed: Change modify fee allows the controller account to modify if the token fees can be adjusted')
    if (typeof controller.change_whitelist === 'undefined') throw new Error('change_whitelist should be passed: Change whitelist allows the controller account to add additional tokens')
    if (typeof controller.change_modify_whitelisting === 'undefined') throw new Error('change_modify_whitelisting should be passed: Change modify whitelist allows the controller account to modify if this token has whitelisting')
    if (typeof controller.issuance === 'undefined') throw new Error('issuance should be passed')
    if (typeof controller.revoke === 'undefined') throw new Error('revoke should be passed')
    if (typeof controller.freeze === 'undefined') throw new Error('freeze should be passed')
    if (typeof controller.adjust_fee === 'undefined') throw new Error('adjust_fee should be passed')
    if (typeof controller.whitelist === 'undefined') throw new Error('whitelist should be passed')
    if (typeof controller.update_issuer_info === 'undefined') throw new Error('update_issuer_info should be passed: Update issuer info allows the controller account to change the token information')
    if (typeof controller.update_controller === 'undefined') throw new Error('update_controller should be passed ')
    if (typeof controller.burn === 'undefined') throw new Error('burn should be passed')
    if (typeof controller.distribute === 'undefined') throw new Error('distribute should be passed')
    if (typeof controller.withdraw_fee === 'undefined') throw new Error('withdraw_fee should be passed')
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
      let tokenID = Utils.hexToUint8(this.tokenID)
      blake.blake2bUpdate(context, tokenID)

      // Token Issuance Properties
      let symbol = Utils.hexToUint8(Utils.stringToHex(this.symbol))
      blake.blake2bUpdate(context, symbol)

      let name = Utils.hexToUint8(Utils.stringToHex(this.name))
      blake.blake2bUpdate(context, name)

      let totalSupply = Utils.hexToUint8(Utils.decToHex(this.totalSupply, 16))
      blake.blake2bUpdate(context, totalSupply)

      let feeType = Utils.hexToUint8(Utils.decToHex(+(this.feeType === 'flat'), 1))
      blake.blake2bUpdate(context, feeType)

      let feeRate = Utils.hexToUint8(Utils.decToHex(this.feeRate, 16))
      blake.blake2bUpdate(context, feeRate)

      let settings = Utils.hexToUint8(Utils.changeEndianness(Utils.decToHex(parseInt(this.getObjectBits(this.settings), 2), 8)))
      blake.blake2bUpdate(context, settings)

      for (let controller of this.controllers) {
        let account = Utils.hexToUint8(Utils.keyFromAccount(controller.account))
        blake.blake2bUpdate(context, account)

        let privileges = Utils.hexToUint8(Utils.changeEndianness(Utils.decToHex(parseInt(this.getObjectBits(controller), 2), 8)))
        blake.blake2bUpdate(context, privileges)
      }

      let issuerInfo = Utils.hexToUint8(Utils.stringToHex(this.issuerInfo))
      blake.blake2bUpdate(context, issuerInfo)

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
    obj.type = this.type
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
