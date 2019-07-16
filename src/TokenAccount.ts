import * as bigInt from 'big-integer'
import Account, { AccountJSON } from './Account'
import {
  accountFromHexKey,
  keyFromAccount,
  GENESIS_HASH,
  deserializeControllers,
  deserializeSettings,
  serializeController,
  MAXUINT128
} from './Utils'
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
  TokenSend 
} from './Requests'

export interface TokenAccountJSON extends AccountJSON {
  tokenID?: string
  tokenBalance?: string
  totalSupply?: string
  tokenFeeBalance?: string
  symbol?: string
  name?: string
  issuerInfo?: string
  feeRate?: string
  feeType?: 'flat' | 'percentage'
  accountStatuses?: AccountStatus
  controllers?: Controller
  settings?: Settings
  type?: string
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
  private _feeType: 'flat' | 'percentage'
  private _controllers: Controller
  private _settings: Settings
  private _accountStatuses: AccountStatus
  // private _pendingTokenBalance: string
  // private _pendingTotalSupply: string
  constructor (options) {
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

    if (options.issuance !== undefined) {
      this._tokenBalance = options.issuance.totalSupply
      this._totalSupply = options.issuance.totalSupply
      this._tokenFeeBalance = '0'
      this._symbol = options.issuance.symbol
      this._name = options.issuance.name
      this._issuerInfo = options.issuance.issuerInfo
      this._feeRate = options.issuance.feeRate
      this._feeType = options.issuance.feeType
      this._controllers = options.issuance.controllers
      this._settings = options.issuance.settings
    }

    /**
     * Token Balance of the token account
     *
     * @type {String}
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
     * @type {String}
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
     * @type {String}
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
     * @type {String}
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
     * @type {String}
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
     * @type {Object}
     * @private
     */
    if (options.settings !== undefined) {
      this._settings = options.settings
    } else {
      this._settings = {}
    }

    /**
     * Account Statuses
     *
     * @type {Object}
     */
    if (options.accountStatuses !== undefined) {
      this._accountStatuses = options.accountStatuses
    } else {
      this._accountStatuses = {}
    }
  }

  /**
   * The type of the account (LogosAccount or TokenAccount)
   * @type {String}
   */
  get type () {
    return 'TokenAccount'
  }

  /**
   * The public key of the token account
   * @type {Hexadecimal64Length}
   * @readonly
   */
  get tokenID () {
    return this.publicKey
  }

  /**
   * The accounts statuses (Frozen / Whitelisted)
   * @type {string}
   * @readonly
   */
  get accountStatuses () {
    return this._accountStatuses
  }

  set accountStatuses (statuses) {
    this._accountStatuses = statuses
  }

  /**
   * The balance of the token in the base token unit
   * @type {string}
   * @readonly
   */
  get tokenBalance () {
    return this._tokenBalance
  }

  set tokenBalance (val) {
    this._tokenBalance = val
  }

  /**
   * The total supply of the token in base token
   * @type {string}
   * @readonly
   */
  get totalSupply () {
    return this._totalSupply
  }

  set totalSupply (val) {
    this._totalSupply = val
  }

  /**
   * The total supply of the token in base token
   * @type {string}
   * @readonly
   */
  get tokenFeeBalance () {
    return this._tokenFeeBalance
  }

  set tokenFeeBalance (val) {
    this._tokenFeeBalance = val
  }

  /**
   * The issuer info of the token
   * @type {string}
   */
  get issuerInfo () {
    return this._issuerInfo
  }

  set issuerInfo (val) {
    this._issuerInfo = val
  }

  /**
   * The symbol of the token
   * @type {string}
   */
  get symbol () {
    return this._symbol
  }

  set symbol (val) {
    this._symbol = val
  }

  /**
   * The name of the token
   * @type {string}
   */
  get name () {
    return this._name
  }

  set name (val) {
    this._name = val
  }

  /**
   * The fee rate of the token
   * @type {string}
   */
  get feeRate () {
    return this._feeRate
  }

  set feeRate (val) {
    this._feeRate = val
  }

  /**
   * The fee type of the token
   * @type {string}
   */
  get feeType () {
    return this._feeType
  }

  set feeType (val) {
    if (val !== 'flat' && val !== 'percentage') throw new Error('Invalid Fee Type use "flat" or "percentage"')
    this._feeType = val
  }

  /**
   * The settings of the token
   * @type {Object}
   */
  get settings () {
    return this._settings
  }

  set settings (val) {
    this._settings = val
  }

  /**
   * The controllers of the token
   * @type {Object[]}
   */
  get controllers () {
    return this._controllers
  }

  set controllers (val) {
    this._controllers = val
  }

  /**
   * Checks if the account is synced
   * @returns {Promise<Boolean>}
   */
  isSynced () {
    return new Promise((resolve, reject) => {
      const RPC = this.wallet.rpcClient()
      RPC.accounts.info(this.address).then(async info => {
        let synced = true
        if (info && info.frontier) {
          this.tokenBalance = info.token_balance
          this.totalSupply = info.total_supply
          this.tokenFeeBalance = info.token_fee_balance
          this.symbol = info.symbol
          this.name = info.name
          this.issuerInfo = info.issuer_info
          this.feeRate = info.fee_rate
          this.feeType = info.fee_type.toLowerCase()
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
              console.info(`Finished Syncing: Requests were not validated`)
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
   * @returns {Promise<TokenAccount>}
   */
  sync () {
    return new Promise((resolve, reject) => {
      this.synced = false
      this.chain = []
      this.receiveChain = []
      const RPC = this.wallet.rpcClient()

      RPC.accounts.info(this.address).then(info => {
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
        this.feeType = info.fee_type.toLowerCase()
        this.controllers = deserializeControllers(info.controllers)
        this.settings = deserializeSettings(info.settings)
        this.balance = info.balance
        if (this.wallet.fullSync) {
          RPC.accounts.history(this.address, -1, true).then((history) => {
            if (history) {
              // Add Genesis to latest
              for (const requestInfo of history.reverse()) {
                const request = this.addConfirmedRequest(requestInfo)
                if (request.type === 'adjust_user_status') {
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
                console.info(`Finished Syncing: Requests were not validated`)
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
            RPC.requests.info(info.frontier).then(val => {
              const request = this.addConfirmedRequest(val)
              if (request !== null && !request.verify()) {
                throw new Error(`Invalid Request from RPC sync! \n ${request.toJSON(true)}`)
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
  updateTokenInfoFromRequest (request) {
    if (request.type === 'issue_additional') {
      this.totalSupply = bigInt(this.totalSupply).plus(bigInt(request.amount)).toString()
      this.tokenBalance = bigInt(this.tokenBalance).plus(bigInt(request.amount)).toString()
    } else if (request.type === 'change_setting') {
      this.settings[request.setting] = request.value
    } else if (request.type === 'immute_setting') {
      this.settings[`modify_${request.setting}`] = false
    } else if (request.type === 'revoke') {
      if (request.transaction.destination === this.address) {
        this.tokenBalance = bigInt(this.tokenBalance).plus(bigInt(request.transaction.amount)).toString()
      }
      // Handle if TK account is SRC?
    } else if (request.type === 'adjust_user_status') {
      this.updateAccountStatusFromRequest(request)
    } else if (request.type === 'adjust_fee') {
      this.feeRate = request.feeRate
      this.feeType = request.feeType
    } else if (request.type === 'update_issuer_info') {
      this.issuerInfo = request.issuerInfo
    } else if (request.type === 'update_controller') {
      const updatedPrivs = serializeController(request.controller).privileges
      if (request.action === 'remove' && updatedPrivs.length === 0) {
        this.controllers = this.controllers.filter(controller => controller.account !== request.controller.account)
      } else if (request.action === 'remove' && updatedPrivs.length > 0) {
        for (const controller of this.controllers) {
          if (controller.account === request.controller.account) {
            for (const priv of updatedPrivs) {
              controller.privileges[priv] = false
            }
          }
        }
      } else if (request.action === 'add') {
        if (this.controllers.some(controller => controller.account === request.controller.account)) {
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
    } else if (request.type === 'burn') {
      this.totalSupply = bigInt(this.totalSupply).minus(bigInt(request.amount)).toString()
      this.tokenBalance = bigInt(this.tokenBalance).minus(bigInt(request.amount)).toString()
    } else if (request.type === 'distribute') {
      this.tokenBalance = bigInt(this.tokenBalance).minus(bigInt(request.transaction.amount)).toString()
    } else if (request.type === 'withdraw_fee') {
      this.tokenFeeBalance = bigInt(this.tokenFeeBalance).minus(bigInt(request.transaction.amount)).toString()
    } else if (request.type === 'withdraw_logos') {
      if (request.tokenID === this.tokenID) {
        this.balance = bigInt(this.balance).minus(bigInt(request.transaction.amount)).minus(bigInt(request.fee)).toString()
      }
      if (request.transaction.destination === this.address) {
        this.balance = bigInt(this.balance).plus(bigInt(request.transaction.amount)).toString()
      }
    } else if (request.type === 'send') {
      for (const transaction of request.transactions) {
        if (transaction.destination === this.address) {
          this.balance = bigInt(this.balance).plus(bigInt(transaction.amount)).toString()
        }
      }
    } else if (request.type === 'issuance') {
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
      this.controllers = request.controllers
      this.settings = request.settings
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
   * @param {LogosAddress} address - Address of the logos account you are checking if they are a controller
   * @returns {Boolean}
   */
  isController (address) {
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
   * @returns {Boolean}
   */
  hasSetting (setting) {
    return Boolean(this.settings[setting])
  }

  /**
   * Validates if the token account contains the controller and the controller has the specified privilege
   *
   * @param {LogosAddress} address - Address of the controller you are checking
   * @param {privilege} privilege - Privilege you are checking for
   * @returns {Boolean}
   */
  controllerPrivilege (address, privilege) {
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
   * @param {LogosAddress} address - Address of the controller you are checking
   * @param {string} amount - Amount you are checking for
   * @returns {Promise<Boolean>}
   */
  async accountHasFunds (address, amount) {
    if (!this.wallet.rpc) {
      console.warn('Cannot client-side validate if an account has funds without RPC enabled')
      return true
    } else {
      const RPC = this.wallet.rpcClient()
      const info = await RPC.accounts.info(address)
      return bigInt(info.tokens[this.tokenID].balance).greaterOrEquals(bigInt(amount))
    }
  }

  /**
   * Validates if the account is a valid destination to send token funds to
   *
   * @param {LogosAddress} address - Address of the controller you are checking
   * @returns {Promise<Boolean>}
   */
  async validTokenDestination (address) {
    // TODO 104 - This token account is a valid destiantion
    if (!this.wallet.rpc) {
      console.warn('Cannot client-side validate destination without RPC enabled')
      return true
    } else {
      const RPC = this.wallet.rpcClient()
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
   * @returns {Boolean}
   */
  async validateRequest (request) {
    if (bigInt(this.balance).minus(request.fee).lesser(0)) {
      console.error('Invalid Request: Token Account does not have enough Logos to afford the fee perform token opperation')
      return false
    } else {
      if (request.type === 'issue_additional') {
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
      } else if (request.type === 'change_setting') {
        if (!this.hasSetting(`modify_${request.setting}`)) {
          console.error(`Invalid Change Setting Request: ${this.name} does not allow changing ${request.setting}`)
          return false
        } else if (!this.controllerPrivilege(request.originAccount, `change_${request.setting}`)) {
          console.error(`Invalid Change Setting Request: Controller does not have permission to change ${request.setting}`)
          return false
        } else {
          return true
        }
      } else if (request.type === 'immute_setting') {
        if (!this.hasSetting(`modify_${request.setting}`)) {
          console.error(`Invalid Immute Setting Request: ${request.setting} is already immuatable`)
          return false
        } else if (!this.controllerPrivilege(request.originAccount, `change_modify_${request.setting}`)) {
          console.error(`Invalid Immute Setting Request: Controller does not have permission to immute ${request.setting}`)
          return false
        } else {
          return true
        }
      } else if (request.type === 'revoke') {
        if (!this.hasSetting(`revoke`)) {
          console.error(`Invalid Revoke Request: ${this.name} does not support revoking accounts`)
          return false
        } else if (!this.controllerPrivilege(request.originAccount, `revoke`)) {
          console.error(`Invalid Revoke Request: Controller does not have permission to issue revoke requests`)
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
      } else if (request.type === 'adjust_user_status') {
        if (request.status === 'frozen' || request.status === 'unfrozen') {
          if (!this.hasSetting(`freeze`)) {
            console.error(`Invalid Adjust User Status: ${this.name} does not support freezing accounts`)
            return false
          } else if (!this.controllerPrivilege(request.originAccount, `freeze`)) {
            console.error(`Invalid Adjust User Status Request: Controller does not have permission to freeze accounts`)
            return false
          } else {
            return true
          }
        } else if (request.status === 'whitelisted' || request.status === 'not_whitelisted') {
          if (!this.hasSetting(`whitelist`)) {
            console.error(`Invalid Adjust User Status: ${this.name} does not require whitelisting accounts`)
            return false
          } else if (!this.controllerPrivilege(request.originAccount, `revoke`)) {
            console.error(`Invalid Adjust User Status Request: Controller does not have permission to whitelist accounts`)
            return false
          } else {
            return true
          }
        } else {
          console.error(`Invalid Adjust User Status: ${request.status} is not a valid status`)
          return false
        }
      } else if (request.type === 'adjust_fee') {
        if (!this.hasSetting(`adjust_fee`)) {
          console.error(`Invalid Adjust Fee Request: ${this.name} does not allow changing the fee type or fee rate`)
          return false
        } else if (!this.controllerPrivilege(request.originAccount, `adjust_fee`)) {
          console.error(`Invalid Adjust Fee Request: Controller does not have permission to freeze accounts`)
          return false
        } else {
          return true
        }
      } else if (request.type === 'update_issuer_info') {
        if (!this.controllerPrivilege(request.originAccount, `update_issuer_info`)) {
          console.error(`Invalid Update Issuer Info Request: Controller does not have permission to update the issuer info`)
          return false
        } else {
          return true
        }
      } else if (request.type === 'update_controller') {
        if (!this.controllerPrivilege(request.originAccount, `update_controller`)) {
          console.error(`Invalid Update Controller Request: Controller does not have permission to update controllers`)
          return false
        } else if (this.controllers.length === 10 && request.action === 'add' && !this.isController(request.controller.account)) {
          console.error(`Invalid Update Controller Request: ${this.name} already has 10 controllers you must remove one first`)
          return false
        } else {
          return true
        }
      } else if (request.type === 'burn') {
        if (!this.controllerPrivilege(request.originAccount, `burn`)) {
          console.error(`Invalid Burn Request: Controller does not have permission to burn tokens`)
          return false
        } else if (bigInt(this.tokenBalance).lesser(bigInt(request.amount))) {
          console.error(`Invalid Burn Request: the token balance of the token account is less than the amount of tokens you are trying to burn`)
          return false
        } else {
          return true
        }
      } else if (request.type === 'distribute') {
        if (!this.controllerPrivilege(request.originAccount, `distribute`)) {
          console.error(`Invalid Distribute Request: Controller does not have permission to distribute tokens`)
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
      } else if (request.type === 'withdraw_fee') {
        if (!this.controllerPrivilege(request.originAccount, `withdraw_fee`)) {
          console.error(`Invalid Withdraw Fee Request: Controller does not have permission to withdraw fee`)
          return false
        } else if (bigInt(this.tokenFeeBalance).lesser(bigInt(request.transaction.amount))) {
          console.error(`Invalid Withdraw Fee Request: Token account does not have a sufficient token fee balance to withdraw the specified amount`)
          return false
        } else if (await !this.validTokenDestination(request.transaction.destination)) {
          console.error(`Invalid Withdraw Fee Request: Destination does not have permission to receive ${this.symbol}`)
          return false
        } else {
          return true
        }
      } else if (request.type === 'withdraw_logos') {
        if (!this.controllerPrivilege(request.originAccount, `withdraw_logos`)) {
          console.error(`Invalid Withdraw Logos Request: Controller does not have permission to withdraw logos`)
          return false
        } else if (bigInt(this.balance).lesser(bigInt(request.transaction.amount).plus(bigInt(request.fee)))) {
          console.error(`Invalid Withdraw Logos Request: Token account does not have sufficient balance to withdraw the specified amount + the minimum logos fee`)
          return false
        } else {
          return true
        }
      }
    }
  }

  /**
   * Adds a request to the appropriate chain
   *
   * @param {RequestOptions} requestInfo - Request information from the RPC or MQTT
   * @returns {Request}
   */
  addConfirmedRequest (requestInfo) {
    let request = null
    if (requestInfo.type === 'send') {
      const request = new Send(requestInfo)
      if (requestInfo.transactions && requestInfo.transactions.length > 0) {
        for (const trans of requestInfo.transactions) {
          if (trans.destination === this.address) {
            this._addToReceiveChain(request)
            break
          }
        }
      }
      return request
    } else if (requestInfo.type === 'withdraw_logos') {
      request = new WithdrawLogos(requestInfo)
      if (requestInfo.transaction.destination === this.address) {
        this._addToReceiveChain(request)
      }
      if (requestInfo.token_id === this.tokenID) {
        this._addToSendChain(request)
      }
      return request
    } else if (requestInfo.type === 'issue_additional') {
      request = new IssueAdditional(requestInfo)
      this._addToSendChain(request)
      return request
    } else if (requestInfo.type === 'change_setting') {
      request = new ChangeSetting(requestInfo)
      this._addToSendChain(request)
      return request
    } else if (requestInfo.type === 'immute_setting') {
      request = new ImmuteSetting(requestInfo)
      this._addToSendChain(request)
      return request
    } else if (requestInfo.type === 'revoke') {
      request = new Revoke(requestInfo)
      this._addToSendChain(request)
      return request
    } else if (requestInfo.type === 'adjust_user_status') {
      request = new AdjustUserStatus(requestInfo)
      this._addToSendChain(request)
      return request
    } else if (requestInfo.type === 'adjust_fee') {
      request = new AdjustFee(requestInfo)
      this._addToSendChain(request)
      return request
    } else if (requestInfo.type === 'update_issuer_info') {
      request = new UpdateIssuerInfo(requestInfo)
      this._addToSendChain(request)
      return request
    } else if (requestInfo.type === 'update_controller') {
      request = new UpdateController(requestInfo)
      this._addToSendChain(request)
      return request
    } else if (requestInfo.type === 'burn') {
      request = new Burn(requestInfo)
      this._addToSendChain(request)
      return request
    } else if (requestInfo.type === 'distribute') {
      request = new Distribute(requestInfo)
      this._addToSendChain(request)
      return request
    } else if (requestInfo.type === 'withdraw_fee') {
      request = new WithdrawFee(requestInfo)
      this._addToSendChain(request)
      return request
    } else if (requestInfo.type === 'issuance') {
      request = new Issuance(requestInfo)
      this._addToReceiveChain(request)
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
   * @param {LogosAddress} address - The address of the account
   * @returns {Object} status of the account { whitelisted and frozen }
   */
  getAccountStatus (address) {
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
   * @returns {Object} status of the account { whitelisted and frozen }
   */
  updateAccountStatusFromRequest (request) {
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
  async processRequest (requestInfo) {
    // Confirm the requests / updates balances / broadcasts next block
    const request = this.addConfirmedRequest(requestInfo)
    if (request !== null) {
      if (!request.verify()) throw new Error(`Invalid Request! \n ${request.toJSON(true)}`)
      // Todo 104 - revoke, token_send, distribute, withdraw_Fee, withdraw_logos
      // could be recieved by TokenAccount???
      if (request.tokenID === this.tokenID &&
        request.type !== 'token_send' &&
        request.type !== 'issuance') {
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
  toJSON () {
    const obj:TokenAccountJSON = super.toJSON()
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
