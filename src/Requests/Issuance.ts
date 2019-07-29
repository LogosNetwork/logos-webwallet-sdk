import { hexToUint8, decToHex, keyFromAccount, MAXUINT128, deserializeSettings, deserializeController, deserializeControllers, accountFromHexKey, byteCount, stringToHex, isAlphanumeric, isAlphanumericExtended, changeEndianness, serializeControllers, convertObjectToArray } from '../Utils/Utils'
import Request, { RequestOptions, RequestJSON } from './Request'
import * as bigInt from 'big-integer'
import { Settings, Controller, Privileges } from '../TokenAccount'
import { Settings as RpcSettings, Controller as RpcController } from '@logosnetwork/logos-rpc-client/dist/api'
import Blake2b from '../Utils/blake2b'
type feeType = 'flat' | 'percentage'
export interface IssuanceOptions extends RequestOptions {
  tokenID?: string;
  token_id?: string;
  symbol?: string;
  name?: string;
  totalSupply?: string;
  total_supply?: string;
  feeType?: feeType;
  fee_type?: feeType;
  feeRate?: string;
  fee_rate?: string;
  settings?: Settings | RpcSettings[];
  controllers?: Controller[] | RpcController[];
  issuerInfo?: string;
  issuer_info?: string;
}
export interface IssuanceJSON extends RequestJSON {
  token_id?: string;
  token_account?: string;
  symbol?: string;
  name?: string;
  total_supply?: string;
  fee_type?: feeType;
  fee_rate?: string;
  settings?: RpcSettings[];
  controllers?: RpcController[];
  issuer_info?: string;
}
export default class Issuance extends Request {
  private _tokenID: string

  private _symbol: string

  private _name: string

  private _totalSupply: string

  private _feeType: feeType

  private _feeRate: string

  private _settings: Settings

  private _controllers: Controller[]

  private _issuerInfo: string

  public constructor (options: IssuanceOptions = {
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
     * @type {string}
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

  public set tokenID (val: string) {
    this._tokenID = val
  }

  /**
   * Return the token id
   * @type {string}
   */
  public get tokenID (): string {
    if (this._tokenID) {
      return this._tokenID
    } else {
      if (!this.origin) throw new Error('Origin account is not set.')
      if (!this.previous) throw new Error('Previous is not set.')
      if (!this.symbol) throw new Error('Symbol is not set.')
      if (!this.name) throw new Error('Name is not set.')
      const tokenID = new Blake2b()
        .update(hexToUint8(this.origin))
        .update(hexToUint8(this.previous))
        .update(hexToUint8(stringToHex(this.symbol + this.name)))
        .digest('hex') as string
      this.tokenID = tokenID
      return this.tokenID
    }
  }

  public set symbol (val: string) {
    if (byteCount(val) > 8) throw new Error('Token Symbol - Invalid Size. Max Size 8 Bytes')
    if (!isAlphanumeric(val)) throw new Error('Token Symbol - Non-alphanumeric characters')
    this._tokenID = null
    this._symbol = val
  }

  /**
   * The symbol of the token (8 Bytes Max)
   * @type {string}
   */
  public get symbol (): string {
    return this._symbol
  }

  public set name (val: string) {
    if (byteCount(val) > 32) throw new Error('Token Name - Invalid Size. Max Size 32 Bytes')
    if (!isAlphanumericExtended(val)) throw new Error('Token Name - Invalid Characters (alphanumeric, space, hypen, and underscore are allowed)')
    this._tokenID = null
    this._name = val
  }

  /**
   * The name of the token (32 Bytes Max)
   * @type {string}
   */
  public get name (): string {
    return this._name
  }

  /**
   * The total supply of the token (340282366920938463463374607431768211455 is Max)
   * @type {string}
   */
  public get totalSupply (): string {
    return this._totalSupply
  }

  public set totalSupply (val: string) {
    if (bigInt(val).gt(bigInt(MAXUINT128))) throw new Error(`Invalid Total Supply - Maximum supply is ${MAXUINT128}`)
    this._totalSupply = val
  }

  /**
   * The Type of fee for this token (flat or percentage)
   * @type {string}
   */
  public get feeType (): feeType {
    return this._feeType
  }

  public set feeType (val: feeType) {
    this._feeType = val
  }

  /**
   * The fee rate of the token make sure to take in account the fee type
   * @type {string}
   */
  public get feeRate (): string {
    return this._feeRate
  }

  public set feeRate (val: string) {
    this._feeRate = val
  }

  /**
   * The settings for the token
   * Same as get settings but typescript
   * doesn't allow different types for getter setter
   * @type {Settings}
   */
  public get settingsAsObject (): Settings {
    return this._settings
  }

  /**
   * The settings for the token
   * @type {Settings}
   */
  public get settings (): Settings | RpcSettings[] {
    return this._settings
  }

  public set settings (val: Settings | RpcSettings[]) {
    val = deserializeSettings(val)
    this.validateSettings(val)
    this._settings = val
  }

  /**
   * The contollers of the token
   * Same as get controllers but typescript
   * doesn't allow different types for getter setter
   * @type {Controller[]}
   */
  public get controllersAsObject (): Controller[] {
    return this._controllers
  }

  /**
   * The contollers of the token
   * Typescript is really dumb and won't let us use different types for getter setters
   * @type {Controller[]}
   */
  public get controllers (): Controller[] | RpcController[] {
    return this._controllers
  }

  public set controllers (val: Controller[] | RpcController[]) {
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
  public get issuerInfo (): string {
    return this._issuerInfo
  }

  public set issuerInfo (val: string) {
    if (byteCount(val) > 512) throw new Error('Issuer Info - Invalid Size. Max Size 512 Bytes')
    this._issuerInfo = val
  }

  /**
   * Validates the settings
   * @throws a shit load of errors if it is wrong
   * @returns {boolean}
   */
  public validateSettings (settings = this.settingsAsObject): boolean {
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
   * @returns {boolean}
   */
  public validateController (controller: Controller): boolean {
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
  public addController (controller: Controller | RpcController): Controller[] {
    if (this.controllers.length === 10) throw new Error('Can only fit 10 controllers per token issuance request!')
    const newCtrl = deserializeController(controller)
    if (this.validateController(newCtrl)) {
      this._controllers.push(newCtrl)
    }
    return this._controllers
  }

  private getObjectBits (obj: Privileges | Settings): string {
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
   * @type {string}
   * @readonly
   */
  public get hash (): string {
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
    context.update(tokenID)

    const symbol = hexToUint8(stringToHex(this.symbol))
    context.update(symbol)

    const name = hexToUint8(stringToHex(this.name))
    context.update(name)

    const totalSupply = hexToUint8(decToHex(this.totalSupply, 16))
    context.update(totalSupply)

    const feeType = hexToUint8(decToHex(+(this.feeType === 'flat'), 1))
    context.update(feeType)

    const feeRate = hexToUint8(decToHex(this.feeRate, 16))
    context.update(feeRate)

    const settings = hexToUint8(changeEndianness(decToHex(parseInt(this.getObjectBits(this.settingsAsObject), 2), 8)))
    context.update(settings)

    const accounts: Uint8Array[] = []
    for (const controller of this.controllersAsObject) {
      this.validateController(controller)
      const account = hexToUint8(keyFromAccount(controller.account))
      if (accounts.includes(account)) throw new Error('Duplicate Controllers are not allowed')
      accounts.push(account)
      context.update(account)

      const privileges = hexToUint8(changeEndianness(decToHex(parseInt(this.getObjectBits(controller.privileges), 2), 8)))
      context.update(privileges)
    }

    const issuerInfo = hexToUint8(stringToHex(this.issuerInfo))
    context.update(issuerInfo)

    return context.digest('hex') as string
  }

  /**
   * Returns the request JSON ready for broadcast to the Logos Network
   * @returns {IssuanceJSON} JSON request
   */
  public toJSON (): IssuanceJSON {
    const obj: IssuanceJSON = super.toJSON()
    obj.token_id = this.tokenID
    obj.token_account = accountFromHexKey(this.tokenID)
    obj.symbol = this.symbol
    obj.name = this.name
    obj.total_supply = this.totalSupply
    obj.fee_type = this.feeType
    obj.fee_rate = this.feeRate
    obj.settings = convertObjectToArray(this.settingsAsObject) as RpcSettings[]
    obj.controllers = serializeControllers(this.controllersAsObject)
    obj.issuer_info = this.issuerInfo
    return obj
  }
}
