import * as bigInt from 'big-integer'
import Account, { AccountJSON, AccountOptions } from './Account'
import { Settings as RpcSettings, Privileges as RpcPrivileges, Request as RpcRequest } from '@logosnetwork/logos-rpc-client/api'
import {
  accountFromHexKey,
  keyFromAccount,
  GENESIS_HASH,
  deserializeControllers,
  deserializeSettings,
  serializeController,
  MAXUINT128
} from './Utils/Utils'
import { 
  Send,
  Issuance,
  IssueAdditional,
  ChangeSetting,
  ImmuteSetting,
  Revoke,
  AdjustUserStatus,
  AdjustFee,
  UpdateIssuerInfo,
  UpdateController,
  Burn,
  Distribute,
  WithdrawFee,
  WithdrawLogos,
  TokenSend,
  TokenRequest,
  Request
} from './Requests'
import { Setting } from './Requests/ChangeSetting'
type feeType = 'flat'|'percentage'
export interface TokenAccountJSON extends AccountJSON {
  tokenID?: string;
  tokenBalance?: string;
  totalSupply?: string;
  tokenFeeBalance?: string;
  symbol?: string;
  name?: string;
  issuerInfo?: string;
  feeRate?: string;
  feeType?: feeType;
  accountStatuses?: AccountStatuses;
  controllers?: Controller[];
  settings?: Settings;
  type?: string;
}

interface AccountStatuses {
  [address: string]: {
    whitelisted: boolean;
    frozen: boolean;
  };
}

interface AccountStatus {
  whitelisted: boolean;
  frozen: boolean;
}

export interface SyncedResponse {
  account?: string;
  synced?: boolean;
  type?: string;
  remove?: boolean;
}

export interface Privileges {
  change_issuance: boolean;
  change_modify_issuance: boolean;
  change_revoke: boolean;
  change_modify_revoke: boolean;
  change_freeze: boolean;
  change_modify_freeze: boolean;
  change_adjust_fee: boolean;
  change_modify_adjust_fee: boolean;
  change_whitelist: boolean;
  change_modify_whitelist: boolean;
  issuance: boolean;
  revoke: boolean;
  freeze: boolean;
  adjust_fee: boolean;
  whitelist: boolean;
  update_issuer_info: boolean;
  update_controller: boolean;
  burn: boolean;
  distribute: boolean;
  withdraw_fee: boolean;
  withdraw_logos: boolean;
}

export interface Controller {
  account?: string;
  privileges?: Privileges;
}

export interface Settings {
  issuance: boolean;
  modify_issuance: boolean;
  revoke: boolean;
  modify_revoke: boolean;
  freeze: boolean;
  modify_freeze: boolean;
  adjust_fee: boolean;
  modify_adjust_fee: boolean;
  whitelist: boolean;
  modify_whitelist: boolean;
}

export interface TokenAccountOptions extends AccountOptions {
  tokenID?: string;
  issuance?: Issuance;
  tokenBalance?: string;
  totalSupply?: string;
  tokenFeeBalance?: string;
  symbol?: string;
  name?: string;
  issuerInfo?: string;
  feeRate?: string;
  feeType?: feeType;
  controllers?: Controller[];
  settings?: Settings;
  accountStatuses?: AccountStatuses;
}

/**
 * TokenAccount contain the keys, chains, and balances.
 */
export default class TokenAccount extends Account {
  private _tokenBalance: string

  private _totalSupply: string

  private _tokenFeeBalance: string

  private _symbol: string

  private _name: string

  private _issuerInfo: string

  private _feeRate: string

  private _feeType: feeType

  private _controllers: Controller[]

  private _settings: Settings

  private _accountStatuses: AccountStatuses

  // private _pendingTokenBalance: string
  // private _pendingTotalSupply: string
  public constructor (options: TokenAccountOptions) {
    if (!options) throw new Error('You must pass settings to initalize the token account')
    if (!options.address && !options.tokenID) throw new Error('You must initalize a token account with an address or tokenID')
    if (!options.wallet) throw new Error('You must initalize a token account with a wallet')
    if (options.tokenID !== undefined) {
      options.publicKey = options.tokenID
      options.address = accountFromHexKey(options.tokenID)
    } else if (options.address !== undefined) {
      options.publicKey = keyFromAccount(options.address)
    }
    super(options)

    if (options.issuance !== undefined && options.issuance !== null) {
      this._tokenBalance = options.issuance.totalSupply
      this._totalSupply = options.issuance.totalSupply
      this._tokenFeeBalance = '0'
      this._symbol = options.issuance.symbol
      this._name = options.issuance.name
      this._issuerInfo = options.issuance.issuerInfo
      this._feeRate = options.issuance.feeRate
      this._feeType = options.issuance.feeType
      this._controllers = options.issuance.controllersAsObject
      this._settings = options.issuance.settingsAsObject
    }

    /**
     * Token Balance of the token account
     *
     * @type {string}
     * @private
     */
    if (options.tokenBalance !== undefined) {
      this._tokenBalance = options.tokenBalance
    } else {
      this._tokenBalance = '0'
    }

    /**
     * Total Supply of tokens
     *
     * @type {string}
     * @private
     */
    if (options.totalSupply !== undefined) {
      this._totalSupply = options.totalSupply
    } else {
      this._totalSupply = null
    }

    /**
     * Token Fee Balance
     *
     * @type {string}
     * @private
     */
    if (options.tokenFeeBalance !== undefined) {
      this._tokenFeeBalance = options.tokenFeeBalance
    } else {
      this._tokenFeeBalance = '0'
    }

    /**
     * Symbol of the token
     *
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
     *
     * @type {string}
     * @private
     */
    if (options.name !== undefined) {
      this._name = options.name
    } else {
      this._name = 'Unknown Token'
    }

    /**
     * Issuer Info of the token
     * @type {string}
     * @private
     */
    if (options.issuerInfo !== undefined) {
      this._issuerInfo = options.issuerInfo
    } else {
      this._issuerInfo = null
    }

    /**
     * Fee Rate of the token
     *
     * @type {string}
     * @private
     */
    if (options.feeRate !== undefined) {
      this._feeRate = options.feeRate
    } else {
      this._feeRate = null
    }

    /**
     * Fee Type of the token
     *
     * @type {string}
     * @private
     */
    if (options.feeType !== undefined) {
      this._feeType = options.feeType
    } else {
      this._feeType = null
    }

    /**
     * Controllers of the token
     *
     * @type {string}
     * @private
     */
    if (options.controllers !== undefined) {
      this._controllers = options.controllers
    } else {
      this._controllers = null
    }

    /**
     * Settings of the token
     * @type {Settings}
     * @private
     */
    if (options.settings !== undefined) {
      this._settings = options.settings
    } else {
      this._settings = {
        issuance: null,
        modify_issuance: null,
        revoke: null,
        modify_revoke: null,
        freeze: null,
        modify_freeze: null,
        adjust_fee: null,
        modify_adjust_fee: null,
        whitelist: null,
        modify_whitelist: null
      }
    }

    /**
     * Account Statuses
     *
     * @type {AccountStatuses}
     */
    if (options.accountStatuses !== undefined) {
      this._accountStatuses = options.accountStatuses
    } else {
      this._accountStatuses = {}
    }
  }

  /**
   * The type of the account (LogosAccount or TokenAccount)
   * @type {string}
   */
  public get type (): 'TokenAccount' { return 'TokenAccount' }

  /**
   * The public key of the token account
   * @type {string}
   * @readonly
   */
  public get tokenID (): string {
    return this.publicKey
  }

  /**
   * The accounts statuses (Frozen / Whitelisted)
   * @type {string}
   * @readonly
   */
  public get accountStatuses (): AccountStatuses {
    return this._accountStatuses
  }

  public set accountStatuses (statuses: AccountStatuses) {
    this._accountStatuses = statuses
  }

  /**
   * The balance of the token in the minor token unit
   * @type {string}
   * @readonly
   */
  public get tokenBalance (): string {
    return this._tokenBalance
  }

  public set tokenBalance (val: string) {
    this._tokenBalance = val
  }

  /**
   * The total supply of the token in minor token
   * @type {string}
   * @readonly
   */
  public get totalSupply (): string {
    return this._totalSupply
  }

  public set totalSupply (val: string) {
    this._totalSupply = val
  }

  /**
   * The total supply of the token in the minor token unit
   * @type {string}
   * @readonly
   */
  public get tokenFeeBalance (): string {
    return this._tokenFeeBalance
  }

  public set tokenFeeBalance (val: string) {
    this._tokenFeeBalance = val
  }

  /**
   * The issuer info of the token
   * @type {string}
   */
  public get issuerInfo (): string {
    return this._issuerInfo
  }

  public set issuerInfo (val: string) {
    this._issuerInfo = val
  }

  /**
   * The symbol of the token
   * @type {string}
   */
  public get symbol (): string {
    return this._symbol
  }

  public set symbol (val: string) {
    this._symbol = val
  }

  /**
   * The name of the token
   * @type {string}
   */
  public get name (): string {
    return this._name
  }

  public set name (val: string) {
    this._name = val
  }

  /**
   * The fee rate of the token
   * @type {string}
   */
  public get feeRate (): string {
    return this._feeRate
  }

  public set feeRate (val: string) {
    this._feeRate = val
  }

  /**
   * The fee type of the token
   * @type {feeType}
   */
  public get feeType (): feeType {
    return this._feeType
  }

  public set feeType (val: feeType) {
    this._feeType = val
  }

  /**
   * The settings of the token
   * @type {Settings}
   */
  public get settings (): Settings {
    return this._settings
  }

  public set settings (val: Settings) {
    this._settings = val
  }

  /**
   * The controllers of the token
   * @type {Controller[]}
   */
  public get controllers (): Controller[] {
    return this._controllers
  }

  public set controllers (val: Controller[]) {
    this._controllers = val
  }

  /**
   * The decimals of the token
   * @type {number}
   */
  public get decimals (): number {
    try {
      const parsedInfo = JSON.parse(this.issuerInfo)
      if (parsedInfo &&
        typeof parsedInfo.decimals !== 'undefined' &&
        parsedInfo.decimals > 0) {
        return parseInt(parsedInfo.decimals)
      }
      return null
    } catch (e) {
      return null
    }
  }

  public convertToMajor (minorValue: string): string {
    if (this.decimals) return this.wallet.rpcClient.convert.fromTo(minorValue, 0, this.decimals)
    return null
  }

  public convertToMinor (majorValue: string): string {
    if (this.decimals) return this.wallet.rpcClient.convert.fromTo(majorValue, this.decimals, 0)
    return null
  }

  /**
   * Checks if the account is synced
   * @returns {Promise<SyncedResponse>}
   */
  public isSynced (): Promise<SyncedResponse> {
    return new Promise((resolve): void => {
      const RPC = this.wallet.rpcClient
      RPC.accounts.info(this.address).then(async (info): Promise<void> => {
        let synced = true
        if (info && info.frontier) {
          this.tokenBalance = info.token_balance
          this.totalSupply = info.total_supply
          this.tokenFeeBalance = info.token_fee_balance
          this.symbol = info.symbol
          this.name = info.name
          this.issuerInfo = info.issuer_info
          this.feeRate = info.fee_rate
          this.feeType = info.fee_type
          this.controllers = deserializeControllers(info.controllers)
          this.settings = deserializeSettings(info.settings)
          this.balance = info.balance
          if (info.frontier !== GENESIS_HASH) {
            if (this.chain.length === 0 || this.chain[this.chain.length - 1].hash !== info.frontier) {
              synced = false
            }
          }
          if (synced) {
            const receiveBlock = await RPC.requests.info(info.receive_tip)
            if (this.receiveChain.length === 0 || this.receiveChain[this.receiveChain.length - 1].hash !== receiveBlock.send_hash) {
              synced = false
            }
          }
          if (synced) {
            if (this.wallet.validateSync) {
              if (this.verifyChain() && this.verifyReceiveChain()) {
                this.synced = synced
                console.info(`${info.name} has been fully synced and validated`)
                resolve({ account: this.address, synced: this.synced, type: 'TokenAccount' })
              }
            } else {
              console.info('Finished Syncing: Requests were not validated')
              this.synced = synced
              resolve({ account: this.address, synced: this.synced, type: 'TokenAccount' })
            }
          } else {
            this.synced = synced
            resolve({ account: this.address, synced: this.synced, type: 'TokenAccount' })
          }
        } else {
          if (this.receiveChain.length === 0 && this.chain.length === 0) {
            console.info(`${this.address} is empty and therefore valid`)
            this.synced = synced
            resolve({ account: this.address, synced: this.synced, type: 'TokenAccount' })
          } else {
            console.error(`${this.address} is not opened according to the RPC. This is a critical error if in a production enviroment. On testnet this just means the network has been restarted.`)
            this.synced = false
            resolve({ account: this.address, synced: this.synced, type: 'TokenAccount', remove: true })
          }
        }
      })
    })
  }

  /**
   * Scans the account history using RPC and updates the local chains
   * @returns {Promise<Account>}
   */
  public sync (): Promise<Account> {
    return new Promise((resolve): void => {
      this.synced = false
      this.chain = []
      this.receiveChain = []
      const RPC = this.wallet.rpcClient

      RPC.accounts.info(this.address).then((info): void => {
        if (!info || !info.type || info.type !== 'TokenAccount') {
          throw new Error('Invalid Address - This is not a valid token account')
        }
        this.tokenBalance = info.token_balance
        this.totalSupply = info.total_supply
        this.tokenFeeBalance = info.token_fee_balance
        this.symbol = info.symbol
        this.name = info.name
        this.issuerInfo = info.issuer_info
        this.feeRate = info.fee_rate
        this.feeType = info.fee_type
        this.controllers = deserializeControllers(info.controllers)
        this.settings = deserializeSettings(info.settings)
        this.balance = info.balance
        if (this.wallet.fullSync) {
          RPC.accounts.history(this.address, -1, true).then((history): void => {
            if (history) {
              // Add Genesis to latest
              for (const requestInfo of history.reverse()) {
                const request = this.addConfirmedRequest(requestInfo)
                if (request instanceof AdjustUserStatus) {
                  this.updateAccountStatusFromRequest(request)
                }
              }
              if (this.wallet.validateSync) {
                if (this.verifyChain() && this.verifyReceiveChain()) {
                  this.synced = true
                  console.info(`${info.name} has been fully synced and validated`)
                  resolve(this)
                }
              } else {
                console.info('Finished Syncing: Requests were not validated')
                this.synced = true
                resolve(this)
              }
            } else {
              this.synced = true
              console.info(`${this.address} is empty and therefore valid`)
              resolve(this)
            }
          })
        } else {
          if (info && info.frontier && info.frontier !== GENESIS_HASH) {
            RPC.requests.info(info.frontier).then((val): void => {
              const request = this.addConfirmedRequest(val)
              if (request !== null && !request.verify()) {
                throw new Error(`Invalid Request from RPC sync! \n ${JSON.stringify(request.toJSON(), null, 2)}`)
              }
              this.synced = true
              console.info(`${info.name} has been lazy synced`)
              resolve(this)
            })
          } else {
            this.synced = true
            console.info(`${this.address} is empty and therefore valid`)
            resolve(this)
          }
        }
      })
    })
  }

  /**
   * Updates the token account by comparing the RPC token account info with the changes in a new request
   * Also updates the pending balance based on the new balance and the pending chain
   * @param {Request} request - request that is being calculated on
   * @returns {void}
   */
  public updateTokenInfoFromRequest (request: Request): void {
    if (request instanceof IssueAdditional) {
      this.totalSupply = bigInt(this.totalSupply).plus(bigInt(request.amount)).toString()
      this.tokenBalance = bigInt(this.tokenBalance).plus(bigInt(request.amount)).toString()
    } else if (request instanceof ChangeSetting) {
      this.settings[request.setting] = request.value
    } else if (request instanceof ImmuteSetting) {
      this.settings[`modify_${request.setting}`] = false
    } else if (request instanceof Revoke) {
      if (request.transaction.destination === this.address) {
        this.tokenBalance = bigInt(this.tokenBalance).plus(bigInt(request.transaction.amount)).toString()
      }
      // Handle if TK account is SRC?
    } else if (request instanceof AdjustUserStatus) {
      this.updateAccountStatusFromRequest(request)
    } else if (request instanceof AdjustFee) {
      this.feeRate = request.feeRate
      this.feeType = request.feeType
    } else if (request instanceof UpdateIssuerInfo) {
      this.issuerInfo = request.issuerInfo
    } else if (request instanceof UpdateController) {
      const updatedPrivs = serializeController(request.controller).privileges
      if (request.action === 'remove' && updatedPrivs.length === 0) {
        this.controllers = this.controllers.filter((controller): boolean => controller.account !== request.controller.account)
      } else if (request.action === 'remove' && updatedPrivs.length > 0) {
        for (const controller of this.controllers) {
          if (controller.account === request.controller.account) {
            for (const priv of updatedPrivs) {
              controller.privileges[priv] = false
            }
          }
        }
      } else if (request.action === 'add') {
        if (this.controllers.some((controller): boolean => controller.account === request.controller.account)) {
          for (const controller of this.controllers) {
            if (controller.account === request.controller.account) {
              for (const priv of updatedPrivs) {
                controller.privileges[priv] = true
              }
            }
          }
        } else {
          this.controllers.push(request.controller)
        }
      }
    } else if (request instanceof Burn) {
      this.totalSupply = bigInt(this.totalSupply).minus(bigInt(request.amount)).toString()
      this.tokenBalance = bigInt(this.tokenBalance).minus(bigInt(request.amount)).toString()
    } else if (request instanceof Distribute) {
      this.tokenBalance = bigInt(this.tokenBalance).minus(bigInt(request.transaction.amount)).toString()
    } else if (request instanceof WithdrawFee) {
      this.tokenFeeBalance = bigInt(this.tokenFeeBalance).minus(bigInt(request.transaction.amount)).toString()
    } else if (request instanceof WithdrawLogos) {
      if (request.tokenID === this.tokenID) {
        this.balance = bigInt(this.balance).minus(bigInt(request.transaction.amount)).minus(bigInt(request.fee)).toString()
      }
      if (request.transaction.destination === this.address) {
        this.balance = bigInt(this.balance).plus(bigInt(request.transaction.amount)).toString()
      }
    } else if (request instanceof Send) {
      for (const transaction of request.transactions) {
        if (transaction.destination === this.address) {
          this.balance = bigInt(this.balance).plus(bigInt(transaction.amount)).toString()
        }
      }
    } else if (request instanceof Issuance) {
      this.tokenBalance = request.totalSupply
      // this._pendingTokenBalance = request.totalSupply
      this.totalSupply = request.totalSupply
      // this._pendingTotalSupply = request.totalSupply
      this.tokenFeeBalance = '0'
      this.symbol = request.symbol
      this.name = request.name
      this.issuerInfo = request.issuerInfo
      this.feeRate = request.feeRate
      this.feeType = request.feeType
      this.controllers = request.controllersAsObject
      this.settings = request.settingsAsObject
      this.balance = '0'
      this.pendingBalance = '0'
    } else if (request.type === 'token_send') {
      if (request.tokenFee) {
        this.tokenFeeBalance = bigInt(this.tokenFeeBalance).plus(request.tokenFee).toString()
      }
    }
    if (request.type !== 'send' && request.type !== 'issuance' &&
      request.type !== 'token_send' && request.type !== 'withdraw_logos') {
      this.balance = bigInt(this.balance).minus(bigInt(request.fee)).toString()
    }
  }

  /**
   * Validates if the token account contains the controller
   *
   * @param {string} address - Address of the logos account you are checking if they are a controller
   * @returns {boolean}
   */
  public isController (address: string): boolean {
    for (const controller of this.controllers) {
      if (controller.account === address) {
        return true
      }
    }
    return false
  }

  /**
   * Validates if the token has the setting
   *
   * @param {Setting} setting - Token setting you are checking
   * @returns {boolean}
   */
  public hasSetting (setting: RpcSettings): boolean {
    return Boolean(this.settings[setting])
  }

  /**
   * Validates if the token account contains the controller and the controller has the specified privilege
   *
   * @param {string} address - Address of the controller you are checking
   * @param {privilege} privilege - Privilege you are checking for
   * @returns {boolean}
   */
  public controllerPrivilege (address: string, privilege: RpcPrivileges): boolean {
    for (const controller of this.controllers) {
      if (controller.account === address) {
        return controller.privileges[privilege]
      }
    }
    return false
  }

  /**
   * Validates if the account has enough token funds to complete the transaction
   *
   * @param {string} address - Address of the controller you are checking
   * @param {string} amount - Amount you are checking for
   * @returns {Promise<boolean>}
   */
  public async accountHasFunds (address: string, amount: string): Promise<boolean> {
    if (!this.wallet.rpc) {
      console.warn('Cannot client-side validate if an account has funds without RPC enabled')
      return true
    } else {
      const RPC = this.wallet.rpcClient
      const info = await RPC.accounts.info(address)
      return bigInt(info.tokens[this.tokenID].balance).greaterOrEquals(bigInt(amount))
    }
  }

  /**
   * Validates if the account is a valid destination to send token funds to
   *
   * @param {string} address - Address of the controller you are checking
   * @returns {Promise<boolean>}
   */
  public async validTokenDestination (address: string): Promise<boolean> {
    // TODO 104 - This token account is a valid destiantion
    if (!this.wallet.rpc) {
      console.warn('Cannot client-side validate destination without RPC enabled')
      return true
    } else {
      const RPC = this.wallet.rpcClient
      const info = await RPC.accounts.info(address)
      if (info.type !== 'LogosAccount') return false
      let tokenInfo = null
      if (info && info.tokens && info.tokens[this.tokenID]) {
        tokenInfo = info.tokens[this.tokenID]
      }
      if (!tokenInfo && this.hasSetting('whitelist')) {
        return false
      } else if (!tokenInfo && !this.hasSetting('whitelist')) {
        return true
      } else if (this.hasSetting('whitelist') && tokenInfo.whitelisted === 'false') {
        return false
      } else if (tokenInfo.frozen === 'true') {
        return false
      } else {
        return true
      }
    }
  }

  /**
   * Validates that the account has enough funds at the current time to publish the request
   *
   * @param {Request} request - Request information from the RPC or MQTT
   * @returns {Promise<boolean>}
   */
  public async validateRequest (request: Request): Promise<boolean> {
    if (bigInt(this.balance).minus(request.fee).lesser(0)) {
      console.error('Invalid Request: Token Account does not have enough Logos to afford the fee perform token opperation')
      return false
    } else {
      if (request instanceof IssueAdditional) {
        if (bigInt(this.totalSupply).plus(bigInt(request.amount)).greater(bigInt(MAXUINT128))) {
          console.error('Invalid Issue Additional Request: Total Supply would exceed MAXUINT128')
          return false
        } else if (!this.hasSetting('issuance')) {
          console.error('Invalid Issue Additional Request: Token does not allow issuance')
          return false
        } else if (!this.controllerPrivilege(request.originAccount, 'issuance')) {
          console.error('Invalid Issue Additional Request: Controller does not have permission to issue additional tokens')
          return false
        } else {
          return true
        }
      } else if (request instanceof ChangeSetting) {
        if (!this.hasSetting(this.settingToModify(request.setting))) {
          console.error(`Invalid Change Setting Request: ${this.name} does not allow changing ${request.setting}`)
          return false
        } else if (!this.controllerPrivilege(request.originAccount, this.settingToChange(request.setting))) {
          console.error(`Invalid Change Setting Request: Controller does not have permission to change ${request.setting}`)
          return false
        } else {
          return true
        }
      } else if (request instanceof ImmuteSetting) {
        if (!this.hasSetting(this.settingToModify(request.setting))) {
          console.error(`Invalid Immute Setting Request: ${request.setting} is already immuatable`)
          return false
        } else if (!this.controllerPrivilege(request.originAccount, this.settingToChangeModify(request.setting))) {
          console.error(`Invalid Immute Setting Request: Controller does not have permission to immute ${request.setting}`)
          return false
        } else {
          return true
        }
      } else if (request instanceof Revoke) {
        if (!this.hasSetting('revoke')) {
          console.error(`Invalid Revoke Request: ${this.name} does not support revoking accounts`)
          return false
        } else if (!this.controllerPrivilege(request.originAccount, 'revoke')) {
          console.error('Invalid Revoke Request: Controller does not have permission to issue revoke requests')
          return false
        } else if (await !this.accountHasFunds(request.source, request.transaction.amount)) {
          console.error(`Invalid Revoke Request: Source account does not have sufficient ${this.symbol} to complete this request`)
          return false
        } else if (await !this.validTokenDestination(request.transaction.destination)) {
          console.error(`Invalid Revoke Request: Destination does not have permission to receive ${this.symbol}`)
          return false
        } else {
          return true
        }
      } else if (request instanceof AdjustUserStatus) {
        if (request.status === 'frozen' || request.status === 'unfrozen') {
          if (!this.hasSetting('freeze')) {
            console.error(`Invalid Adjust User Status: ${this.name} does not support freezing accounts`)
            return false
          } else if (!this.controllerPrivilege(request.originAccount, 'freeze')) {
            console.error('Invalid Adjust User Status Request: Controller does not have permission to freeze accounts')
            return false
          } else {
            return true
          }
        } else if (request.status === 'whitelisted' || request.status === 'not_whitelisted') {
          if (!this.hasSetting('whitelist')) {
            console.error(`Invalid Adjust User Status: ${this.name} does not require whitelisting accounts`)
            return false
          } else if (!this.controllerPrivilege(request.originAccount, 'revoke')) {
            console.error('Invalid Adjust User Status Request: Controller does not have permission to whitelist accounts')
            return false
          } else {
            return true
          }
        } else {
          console.error(`Invalid Adjust User Status: ${request.status} is not a valid status`)
          return false
        }
      } else if (request instanceof AdjustFee) {
        if (!this.hasSetting('adjust_fee')) {
          console.error(`Invalid Adjust Fee Request: ${this.name} does not allow changing the fee type or fee rate`)
          return false
        } else if (!this.controllerPrivilege(request.originAccount, 'adjust_fee')) {
          console.error('Invalid Adjust Fee Request: Controller does not have permission to freeze accounts')
          return false
        } else {
          return true
        }
      } else if (request instanceof UpdateIssuerInfo) {
        if (!this.controllerPrivilege(request.originAccount, 'update_issuer_info')) {
          console.error('Invalid Update Issuer Info Request: Controller does not have permission to update the issuer info')
          return false
        } else {
          return true
        }
      } else if (request instanceof UpdateController) {
        if (!this.controllerPrivilege(request.originAccount, 'update_controller')) {
          console.error('Invalid Update Controller Request: Controller does not have permission to update controllers')
          return false
        } else if (this.controllers.length === 10 && request.action === 'add' && !this.isController(request.controller.account)) {
          console.error(`Invalid Update Controller Request: ${this.name} already has 10 controllers you must remove one first`)
          return false
        } else {
          return true
        }
      } else if (request instanceof Burn) {
        if (!this.controllerPrivilege(request.originAccount, 'burn')) {
          console.error('Invalid Burn Request: Controller does not have permission to burn tokens')
          return false
        } else if (bigInt(this.tokenBalance).lesser(bigInt(request.amount))) {
          console.error('Invalid Burn Request: the token balance of the token account is less than the amount of tokens you are trying to burn')
          return false
        } else {
          return true
        }
      } else if (request instanceof Distribute) {
        if (!this.controllerPrivilege(request.originAccount, 'distribute')) {
          console.error('Invalid Distribute Request: Controller does not have permission to distribute tokens')
          return false
        } else if (bigInt(this.tokenBalance).lesser(bigInt(request.transaction.amount))) {
          console.error(`Invalid Distribute Request: Token account does not have sufficient ${this.symbol} to distribute`)
          return false
        } else if (await !this.validTokenDestination(request.transaction.destination)) {
          console.error(`Invalid Distribute Request: Destination does not have permission to receive ${this.symbol}`)
          return false
        } else {
          return true
        }
      } else if (request instanceof WithdrawFee) {
        if (!this.controllerPrivilege(request.originAccount, 'withdraw_fee')) {
          console.error('Invalid Withdraw Fee Request: Controller does not have permission to withdraw fee')
          return false
        } else if (bigInt(this.tokenFeeBalance).lesser(bigInt(request.transaction.amount))) {
          console.error('Invalid Withdraw Fee Request: Token account does not have a sufficient token fee balance to withdraw the specified amount')
          return false
        } else if (await !this.validTokenDestination(request.transaction.destination)) {
          console.error(`Invalid Withdraw Fee Request: Destination does not have permission to receive ${this.symbol}`)
          return false
        } else {
          return true
        }
      } else if (request instanceof WithdrawLogos) {
        if (!this.controllerPrivilege(request.originAccount, 'withdraw_logos')) {
          console.error('Invalid Withdraw Logos Request: Controller does not have permission to withdraw logos')
          return false
        } else if (bigInt(this.balance).lesser(bigInt(request.transaction.amount).plus(bigInt(request.fee)))) {
          console.error('Invalid Withdraw Logos Request: Token account does not have sufficient balance to withdraw the specified amount + the minimum logos fee')
          return false
        } else {
          return true
        }
      } else {
        return false
      }
    }
  }

  private settingToModify (setting: Setting): RpcSettings {
    if (setting === 'issuance') {
      return 'modify_issuance'
    } else if (setting === 'revoke') {
      return 'modify_revoke'
    } else if (setting === 'adjust_fee') {
      return 'modify_adjust_fee'
    } else if (setting === 'freeze') {
      return 'modify_freeze'
    } else if (setting === 'whitelist') {
      return 'modify_whitelist'
    }
    return null
  }

  private settingToChange (setting: Setting): RpcPrivileges {
    if (setting === 'issuance') {
      return 'change_issuance'
    } else if (setting === 'revoke') {
      return 'change_revoke'
    } else if (setting === 'adjust_fee') {
      return 'change_adjust_fee'
    } else if (setting === 'freeze') {
      return 'change_freeze'
    } else if (setting === 'whitelist') {
      return 'change_whitelist'
    }
    return null
  }

  private settingToChangeModify (setting: Setting): RpcPrivileges {
    if (setting === 'issuance') {
      return 'change_modify_issuance'
    } else if (setting === 'revoke') {
      return 'change_modify_revoke'
    } else if (setting === 'adjust_fee') {
      return 'change_modify_adjust_fee'
    } else if (setting === 'freeze') {
      return 'change_modify_freeze'
    } else if (setting === 'whitelist') {
      return 'change_modify_whitelist'
    }
    return null
  }

  /**
   * Adds a request to the appropriate chain
   *
   * @param {RequestOptions} requestInfo - Request information from the RPC or MQTT
   * @returns {Request}
   */
  public addConfirmedRequest (requestInfo: RpcRequest): Request {
    let request = null
    if (requestInfo.type === 'send') {
      const request = new Send(requestInfo)
      if (requestInfo.transactions && requestInfo.transactions.length > 0) {
        for (const trans of requestInfo.transactions) {
          if (trans.destination === this.address) {
            this.addToReceiveChain(request)
            break
          }
        }
      }
      return request
    } else if (requestInfo.type === 'withdraw_logos') {
      request = new WithdrawLogos(requestInfo)
      if (requestInfo.transaction.destination === this.address) {
        this.addToReceiveChain(request)
      }
      if (requestInfo.token_id === this.tokenID) {
        this.addToSendChain(request)
      }
      return request
    } else if (requestInfo.type === 'issue_additional') {
      request = new IssueAdditional(requestInfo)
      this.addToSendChain(request)
      return request
    } else if (requestInfo.type === 'change_setting') {
      request = new ChangeSetting(requestInfo)
      this.addToSendChain(request)
      return request
    } else if (requestInfo.type === 'immute_setting') {
      request = new ImmuteSetting(requestInfo)
      this.addToSendChain(request)
      return request
    } else if (requestInfo.type === 'revoke') {
      request = new Revoke(requestInfo)
      this.addToSendChain(request)
      return request
    } else if (requestInfo.type === 'adjust_user_status') {
      request = new AdjustUserStatus(requestInfo)
      this.addToSendChain(request)
      return request
    } else if (requestInfo.type === 'adjust_fee') {
      request = new AdjustFee(requestInfo)
      this.addToSendChain(request)
      return request
    } else if (requestInfo.type === 'update_issuer_info') {
      request = new UpdateIssuerInfo(requestInfo)
      this.addToSendChain(request)
      return request
    } else if (requestInfo.type === 'update_controller') {
      request = new UpdateController(requestInfo)
      this.addToSendChain(request)
      return request
    } else if (requestInfo.type === 'burn') {
      request = new Burn(requestInfo)
      this.addToSendChain(request)
      return request
    } else if (requestInfo.type === 'distribute') {
      request = new Distribute(requestInfo)
      this.addToSendChain(request)
      return request
    } else if (requestInfo.type === 'withdraw_fee') {
      request = new WithdrawFee(requestInfo)
      this.addToSendChain(request)
      return request
    } else if (requestInfo.type === 'issuance') {
      request = new Issuance(requestInfo)
      this.addToReceiveChain(request)
      return request
    } else if (requestInfo.type === 'token_send') {
      request = new TokenSend(requestInfo)
      return request
    } else {
      console.error(`MQTT sent ${this.name} an unknown block type: ${requestInfo.type} hash: ${requestInfo.hash}`)
      return null
    }
  }

  /**
   * Returns the status of the given address for this token
   *
   * @param {string} address - The address of the account
   * @returns {AccountStatus} status of the account { whitelisted and frozen }
   */
  public getAccountStatus (address: string): AccountStatus {
    if (Object.prototype.hasOwnProperty.call(this.accountStatuses, address)) {
      return this.accountStatuses[address]
    } else {
      return {
        whitelisted: false,
        frozen: false
      }
    }
  }

  /**
   * Returns the status of the given address for this token
   *
   * @param {AdjustUserStatus} request - The adjust_user_status request
   * @returns {AccountStatus} status of the account { whitelisted and frozen }
   */
  public updateAccountStatusFromRequest (request: AdjustUserStatus): AccountStatus {
    if (!this.accountStatuses[request.account]) {
      this.accountStatuses[request.account] = {
        frozen: false,
        whitelisted: false
      }
    }
    if (request.status === 'frozen') {
      this.accountStatuses[request.account].frozen = true
    } else if (request.status === 'unfrozen') {
      this.accountStatuses[request.account].frozen = false
    } else if (request.status === 'whitelisted') {
      this.accountStatuses[request.account].whitelisted = true
    } else if (request.status === 'not_whitelisted') {
      this.accountStatuses[request.account].whitelisted = false
    }
    return this.accountStatuses[request.account]
  }

  /**
   * Confirms the request in the local chain
   *
   * @param {MQTTRequestOptions} requestInfo The request from MQTT
   * @throws An exception if the request is not found in the pending requests array
   * @throws An exception if the previous request does not match the last chain request
   * @throws An exception if the request amount is greater than your balance minus the transaction fee
   * @returns {Promise<void>}
   */
  public async processRequest (requestInfo: RpcRequest): Promise<void> {
    // Confirm the requests / updates balances / broadcasts next block
    const request = this.addConfirmedRequest(requestInfo)
    if (request !== null) {
      if (!request.verify()) throw new Error(`Invalid Request! \n ${JSON.stringify(request.toJSON(), null, 2)}`)
      // Todo 104 - revoke, token_send, distribute, withdraw_Fee, withdraw_logos
      // could be recieved by TokenAccount???
      if (request instanceof TokenRequest &&
        request.tokenID === this.tokenID &&
        request instanceof TokenSend === false) {
        if (this.getPendingRequest(requestInfo.hash)) {
          this.removePendingRequest(requestInfo.hash)
        } else {
          console.error('Someone is performing token account requests that is not us!!!')
          // Remove all pendings as they are now invalidated
          // It is possible to update the pending blocks but this could
          // lead to unintended consequences so its best to just reset IMO
          this.removePendingRequests()
        }
      }
      this.updateTokenInfoFromRequest(request)
      this.broadcastRequest()
    }
  }

  /**
   * Returns the token account JSON
   * @returns {TokenAccountJSON} JSON request
   */
  public toJSON (): TokenAccountJSON {
    const obj: TokenAccountJSON = super.toJSON()
    obj.tokenID = this.tokenID
    obj.tokenBalance = this.tokenBalance
    obj.totalSupply = this.totalSupply
    obj.tokenFeeBalance = this.tokenFeeBalance
    obj.symbol = this.symbol
    obj.name = this.name
    obj.issuerInfo = this.issuerInfo
    obj.feeRate = this.feeRate
    obj.feeType = this.feeType
    obj.accountStatuses = this.accountStatuses
    obj.controllers = this.controllers
    obj.settings = this.settings
    obj.type = this.type
    return obj
  }
}
