import { hexToUint8, uint8ToHex, decToHex, keyFromAccount, MAXUINT128, deserializeSettings, deserializeController, deserializeControllers, accountFromHexKey, byteCount, stringToHex, isAlphanumeric, isAlphanumericExtended, changeEndianness, serializeControllers, convertObjectToArray } from '../Utils'
import { blake2bUpdate, blake2bFinal, blake2bInit } from 'blakejs'
import Request, { RequestOptions, RequestJSON } from './Request'
import * as bigInt from 'big-integer'
import { Settings, Controller } from '../TokenAccount'
import { Settings as RpcSettings, Controller as RpcController } from '@logosnetwork/logos-rpc-client/dist/api'

export interface IssuanceOptions extends RequestOptions {
  tokenID?: string
  token_id?: string
  symbol?: string
  name?: string
  totalSupply?: string
  total_supply?: string
  feeType?: 'flat' | 'percentage'
  fee_type?: 'flat' | 'percentage'
  feeRate?: string
  fee_rate?: string
  settings?: Settings | RpcSettings[]
  controllers?: Controller[] | RpcController[]
  issuerInfo?: string
  issuer_info?: string
}
export interface IssuanceJSON extends RequestJSON {
  token_id?: string
  token_account?: string
  symbol?: string
  name?: string
  total_supply?: string
  fee_type?: 'flat' | 'percentage'
  fee_rate?: string
  settings?: RpcSettings[]
  controllers?: RpcController[]
  issuer_info?: string
}
export default class Issuance extends Request {
  private _tokenID: string
  private _symbol: string
  private _name: string
  private _totalSupply: string
  private _feeType: 'flat' | 'percentage'
  private _feeRate: string
  private _settings: Settings
  private _controllers: Controller[]
  private _issuerInfo: string
  constructor (options:IssuanceOptions = {
    tokenID: null,
    symbol: null,
    name: null,
    totalSupply: MAXUINT128,
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
    controllers: [],
    issuerInfo: ''
  }) {
    options.type = {
      text: 'issuance',
      value: 2
    }
    super(options)

    /**
     * TokenID of the token
     * @type {Hexadecimal64Length}
     * @private
     */
    if (options.tokenID !== undefined) {
      this._tokenID = options.tokenID
    } else if (options.token_id !== undefined) {
      this._tokenID = options.token_id
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
    } else if (options.total_supply !== undefined) {
      this._totalSupply = options.total_supply
    } else {
      this._totalSupply = MAXUINT128
    }

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

    /**
     * Settings of the token
     * @type {TokenSettings}
     * @private
     */
    if (options.settings !== undefined) {
      this._settings = deserializeSettings(options.settings)
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
      this._controllers = deserializeControllers(options.controllers)
    } else {
      this._controllers = [{
        account: accountFromHexKey(this.origin),
        privileges: {
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
          distribute: true,
          withdraw_fee: false,
          withdraw_logos: false
        }
      }]
    }

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

  set tokenID (val) {
    this._tokenID = val
  }

  /**
   * Return the token id
   * @type {string}
   */
  get tokenID (): string {
    if (this._tokenID) {
      return this._tokenID
    } else {
      if (!this.origin) throw new Error('Origin account is not set.')
      if (!this.previous) throw new Error('Previous is not set.')
      if (!this.symbol) throw new Error('Symbol is not set.')
      if (!this.name) throw new Error('Name is not set.')
      const context = blake2bInit(32, null)
      blake2bUpdate(context, hexToUint8(this.origin))
      blake2bUpdate(context, hexToUint8(this.previous))
      blake2bUpdate(context, hexToUint8(stringToHex(this.symbol + this.name)))
      const tokenID = uint8ToHex(blake2bFinal(context))
      this.tokenID = tokenID
      return this.tokenID
    }
  }

  set symbol (val) {
    if (byteCount(val) > 8) throw new Error('Token Symbol - Invalid Size. Max Size 8 Bytes')
    if (!isAlphanumeric(val)) throw new Error('Token Symbol - Non-alphanumeric characters')
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
    if (byteCount(val) > 32) throw new Error('Token Name - Invalid Size. Max Size 32 Bytes')
    if (!isAlphanumericExtended(val)) throw new Error('Token Name - Invalid Characters (alphanumeric, space, hypen, and underscore are allowed)')
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
   * The total supply of the token (340282366920938463463374607431768211455 is Max)
   * @type {string}
   */
  get totalSupply () {
    return this._totalSupply
  }

  set totalSupply (val) {
    if (bigInt(val).gt(bigInt(MAXUINT128))) throw new Error(`Invalid Total Supply - Maximum supply is ${MAXUINT128}`)
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
    this._feeRate = val
  }

  /**
   * The settings for the token
   * @type {Settings}
   */
  get settingsAsObject () {
    return this._settings
  }

  /**
   * The settings for the token
   * @type {Settings}
   */
  get settings () {
    return this._settings
  }

  set settings (val: Settings | RpcSettings[]) {
    val = deserializeSettings(val)
    this.validateSettings(val)
    this._settings = val
  }


  /**
   * The contollers of the token
   * @type {Controller[]}
   */
  get controllersAsObject () {
    return this._controllers
  }

  /**
   * The contollers of the token
   * Typescript is really dumb and won't let us use different types for getter setters
   * @type {Controller[]}
   */
  get controllers () {
    return this._controllers
  }

  set controllers (val: Controller[] | RpcController[]) {
    val = deserializeControllers(val)
    for (const controller of val) {
      this.validateController(controller)
    }
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
    if (byteCount(val) > 512) throw new Error('Issuer Info - Invalid Size. Max Size 512 Bytes')
    this._issuerInfo = val
  }

  /**
   * Validates the settings
   * @throws a shit load of errors if it is wrong
   * @returns {Boolean}
   */
  validateSettings (settings = this.settings) {
    if (typeof settings.issuance === 'undefined') throw new Error('issuance should be passed in token settings')
    if (typeof settings.modify_issuance === 'undefined') throw new Error('modify_issuance should be passed in token settings')
    if (typeof settings.revoke === 'undefined') throw new Error('revoke should be passed in token settings')
    if (typeof settings.modify_revoke === 'undefined') throw new Error('modify_revoke should be passed in token settings')
    if (typeof settings.freeze === 'undefined') throw new Error('freeze should be passed in token settings')
    if (typeof settings.modify_freeze === 'undefined') throw new Error('modify_freeze should be passed in token settings')
    if (typeof settings.adjust_fee === 'undefined') throw new Error('adjust_fee should be passed in token settings')
    if (typeof settings.modify_adjust_fee === 'undefined') throw new Error('modify_adjust_fee should be passed in token settings')
    if (typeof settings.whitelist === 'undefined') throw new Error('whitelist should be passed in token settings')
    if (typeof settings.modify_whitelist === 'undefined') throw new Error('modify_whitelist should be passed in token settings')
    return true
  }

  /**
   * Validates the controller
   * @param {Controller} controller - controller you want to validate
   * @throws a shit load of errors if it is wrong
   * @returns {Boolean}
   */
  validateController (controller) {
    if (!controller) throw new Error('Controller is null')
    if (!controller.account) throw new Error('Controller must have account')
    if (!controller.privileges) throw new Error('Controller must have privileges')
    if (typeof controller.privileges.change_issuance === 'undefined') throw new Error('change_issuance should be passed: Change issuance allows the controller account to add additional tokens')
    if (typeof controller.privileges.change_modify_issuance === 'undefined') throw new Error('change_modify_issuance should be passed: Change modify issuance allows the controller account to modify if the token is allowed to have additional tokens added')
    if (typeof controller.privileges.change_revoke === 'undefined') throw new Error('change_revoke should be passed: Change revoke allows the controller account to revoke tokens')
    if (typeof controller.privileges.change_modify_revoke === 'undefined') throw new Error('change_modify_revoke should be passed: Change modify revoke allows the controller account to modify if tokens can be revoked')
    if (typeof controller.privileges.change_freeze === 'undefined') throw new Error('change_freeze should be passed: Change Freeze allows the controller account to add or delete accounts from the freeze list')
    if (typeof controller.privileges.change_modify_freeze === 'undefined') throw new Error('change_modify_freeze should be passed: Change modify freeze allows the controller account to modify if accounts can be frozen')
    if (typeof controller.privileges.change_adjust_fee === 'undefined') throw new Error('change_adjust_fee should be passed: Change adjust fee allows the controller account to modify the fee of the token')
    if (typeof controller.privileges.change_modify_adjust_fee === 'undefined') throw new Error('change_modify_adjust_fee should be passed: Change modify fee allows the controller account to modify if the token fees can be adjusted')
    if (typeof controller.privileges.change_whitelist === 'undefined') throw new Error('change_whitelist should be passed: Change whitelist allows the controller account to add additional tokens')
    if (typeof controller.privileges.change_modify_whitelist === 'undefined') throw new Error('change_modify_whitelist should be passed: Change modify whitelist allows the controller account to modify if this token has whitelisting')
    if (typeof controller.privileges.issuance === 'undefined') throw new Error('issuance should be passed')
    if (typeof controller.privileges.revoke === 'undefined') throw new Error('revoke should be passed')
    if (typeof controller.privileges.freeze === 'undefined') throw new Error('freeze should be passed')
    if (typeof controller.privileges.adjust_fee === 'undefined') throw new Error('adjust_fee should be passed')
    if (typeof controller.privileges.whitelist === 'undefined') throw new Error('whitelist should be passed')
    if (typeof controller.privileges.update_issuer_info === 'undefined') throw new Error('update_issuer_info should be passed: Update issuer info allows the controller account to change the token information')
    if (typeof controller.privileges.update_controller === 'undefined') throw new Error('update_controller should be passed ')
    if (typeof controller.privileges.burn === 'undefined') throw new Error('burn should be passed')
    if (typeof controller.privileges.distribute === 'undefined') throw new Error('distribute should be passed')
    if (typeof controller.privileges.withdraw_fee === 'undefined') throw new Error('withdraw_fee should be passed')
    if (typeof controller.privileges.withdraw_logos === 'undefined') throw new Error('withdraw_logos should be passed')
    return true
  }

  /**
   * Adds a controller to the Token Issuance
   * @param {Controller} controller - controller you want to add to this request
   * @returns {Controller[]} list of all controllers
   */
  addController (controller) {
    if (this.controllers.length === 10) throw new Error('Can only fit 10 controllers per token issuance request!')
    controller = deserializeController(controller)
    if (this.validateController(controller)) {
      this._controllers.push(controller)
    }
    return this._controllers
  }

  getObjectBits (obj) {
    let bits = ''
    for (const val in obj) {
      if (typeof obj[val] === 'boolean') bits = (+obj[val]) + bits
    }
    return bits
  }

  /**
   * Returns calculated hash or Builds the request and calculates the hash
   *
   * @throws An exception if missing parameters or invalid parameters
   * @type {Hexadecimal64Length}
   * @readonly
   */
  get hash () {
    // Validate Symbol
    if (!this.symbol) throw new Error('Symbol is not set.')
    if (byteCount(this.symbol) > 8) throw new Error('Token Symbol - Invalid Size. Max Size 8 Bytes')
    if (!isAlphanumeric(this.symbol)) throw new Error('Token Symbol - Non-alphanumeric characters')

    // Validate Name
    if (!this.name) throw new Error('Name is not set.')
    if (byteCount(this.name) > 32) throw new Error('Token Name - Invalid Size. Max Size 32 Bytes')
    if (!isAlphanumericExtended(this.name)) throw new Error('Token Name - Non-alphanumeric characters')

    // Validate Total Supply
    if (!this.totalSupply) throw new Error('Total Supply is not set.')
    if (bigInt(this.totalSupply).gt(bigInt(MAXUINT128))) throw new Error(`Invalid Total Supply - Maximum supply is ${MAXUINT128}`)

    // Validate Fee Type
    if (!this.feeType) throw new Error('Fee Type is not set.')
    if (this.feeType !== 'flat' && this.feeType !== 'percentage') throw new Error('Token Fee Type - Invalid Fee Type use "flat" or "percentage"')

    // Validate Fee Rate
    if (!this.feeRate) throw new Error('Fee Rate is not set.')
    if (this.feeType === 'percentage' && bigInt(this.feeRate).greater(bigInt('100'))) throw new Error('Fee Type is percentage and exceeds the maximum of 100')

    // Validate Settings
    if (!this.settings) throw new Error('Settings is not set.')
    this.validateSettings()

    // Controllers are validated in the controller hash loop saves some time....
    if (!this.controllers) throw new Error('Controllers is not set.')

    // Validate Issuer Info
    if (this.issuerInfo === null) throw new Error('IssuerInfo is not set.')
    if (byteCount(this.issuerInfo) > 512) throw new Error('Issuer Info - Invalid Size. Max Size 512 Bytes')

    const context = super.requestHash()

    const tokenID = hexToUint8(this.tokenID)
    blake2bUpdate(context, tokenID)

    const symbol = hexToUint8(stringToHex(this.symbol))
    blake2bUpdate(context, symbol)

    const name = hexToUint8(stringToHex(this.name))
    blake2bUpdate(context, name)

    const totalSupply = hexToUint8(decToHex(this.totalSupply, 16))
    blake2bUpdate(context, totalSupply)

    const feeType = hexToUint8(decToHex(+(this.feeType === 'flat'), 1))
    blake2bUpdate(context, feeType)

    const feeRate = hexToUint8(decToHex(this.feeRate, 16))
    blake2bUpdate(context, feeRate)

    const settings = hexToUint8(changeEndianness(decToHex(parseInt(this.getObjectBits(this.settings), 2), 8)))
    blake2bUpdate(context, settings)

    const accounts = []
    for (const controller of this.controllers) {
      this.validateController(controller)
      const account = hexToUint8(keyFromAccount(controller.account))
      if (accounts.includes(account)) throw new Error('Duplicate Controllers are not allowed')
      accounts.push(account)
      blake2bUpdate(context, account)

      const privileges = hexToUint8(changeEndianness(decToHex(parseInt(this.getObjectBits(controller.privileges), 2), 8)))
      blake2bUpdate(context, privileges)
    }

    const issuerInfo = hexToUint8(stringToHex(this.issuerInfo))
    blake2bUpdate(context, issuerInfo)

    return uint8ToHex(blake2bFinal(context))
  }

  /**
   * Returns the request JSON ready for broadcast to the Logos Network
   * @returns {IssuanceJSON} JSON request
   */
  toJSON () {
    const obj:IssuanceJSON = super.toJSON()
    obj.token_id = this.tokenID
    obj.token_account = accountFromHexKey(this.tokenID)
    obj.symbol = this.symbol
    obj.name = this.name
    obj.total_supply = this.totalSupply
    obj.fee_type = this.feeType
    obj.fee_rate = this.feeRate
    obj.settings = convertObjectToArray(this.settings)
    obj.controllers = serializeControllers(this.controllers)
    obj.issuer_info = this.issuerInfo
    return obj
  }
}
