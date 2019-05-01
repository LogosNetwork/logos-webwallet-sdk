const Utils = require('./Utils')
const bigInt = require('big-integer')
const Send = require('./Requests/Send.js')
const IssueAdditional = require('./Requests/IssueAdditional.js')
const ChangeSetting = require('./Requests/ChangeSetting.js')
const ImmuteSetting = require('./Requests/ImmuteSetting.js')
const Revoke = require('./Requests/Revoke.js')
const AdjustUserStatus = require('./Requests/AdjustUserStatus.js')
const AdjustFee = require('./Requests/AdjustFee.js')
const UpdateIssuerInfo = require('./Requests/UpdateIssuerInfo.js')
const UpdateController = require('./Requests/UpdateController.js')
const Burn = require('./Requests/Burn.js')
const Distribute = require('./Requests/Distribute.js')
const Issuance = require('./Requests/Issuance.js')
const WithdrawFee = require('./Requests/WithdrawFee.js')
const WithdrawLogos = require('./Requests/WithdrawLogos.js')
const Logos = require('@logosnetwork/logos-rpc-client')

/**
 * TokenAccount contain the keys, chains, and balances.
 */
class TokenAccount {
  constructor (options) {
    if (!options) throw new Error('You must pass settings to initalize the token account')
    if (!options.address && !options.tokenID) throw new Error('You must initalize a token account with an address or tokenID')
    if (!options.wallet) throw new Error('You must initalize a token account with a wallet')

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
      this._sequence = 0
      this._previous = null
      this._balance = '0'
      this._chain = []
      this._receiveChain = []
      this._pendingChain = []
    }

    /**
     * Token ID of this token
     *
     * @type {string}
     * @private
     */
    if (options.tokenID !== undefined) {
      this._tokenID = options.tokenID
      this._address = Utils.accountFromHexKey(options.tokenID)
    } else {
      this._tokenID = null
    }

    /**
     * Address of this token account
     *
     * @type {LogosAddress}
     * @private
     */
    if (options.address !== undefined) {
      this._address = options.address
      this._tokenID = Utils.keyFromAccount(options.address)
    } else {
      this._address = null
    }

    /**
     * Wallet reference
     * @type {Wallet}
     * @private
     */
    if (options.wallet !== undefined) {
      this._wallet = options.wallet
    } else {
      this._wallet = null
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
     * Previous hexadecimal hash of the last confirmed or pending request
     * @type {Hexadecimal64Length}
     * @private
     */
    this._previous = null

    /**
     * Sequence number of the last confirmed or pending request plus one
     * @type {number}
     * @private
     */
    this._sequence = null

    /**
     * Token Account Logos Balance
     *
     * @type {String}
     * @private
     */
    if (options.balance !== undefined) {
      this._balance = options.balance
    } else {
      this._balance = '0'
    }

    /**
     * Chain of the account
     * @type {Request[]}
     * @private
     */
    if (options.chain !== undefined) {
      this._chain = []
      for (let request of options.chain) {
        if (request.type === 'issue_additional') {
          this._chain.push(new IssueAdditional(request))
        } else if (request.type === 'change_setting') {
          this._chain.push(new ChangeSetting(request))
        } else if (request.type === 'immute_setting') {
          this._chain.push(new ImmuteSetting(request))
        } else if (request.type === 'revoke') {
          this._chain.push(new Revoke(request))
        } else if (request.type === 'adjust_user_status') {
          this._chain.push(new AdjustUserStatus(request))
        } else if (request.type === 'adjust_fee') {
          this._chain.push(new AdjustFee(request))
        } else if (request.type === 'update_issuer_info') {
          this._chain.push(new UpdateIssuerInfo(request))
        } else if (request.type === 'update_controller') {
          this._chain.push(new UpdateController(request))
        } else if (request.type === 'burn') {
          this._chain.push(new Burn(request))
        } else if (request.type === 'distribute') {
          this._chain.push(new Distribute(request))
        } else if (request.type === 'withdraw_fee') {
          this._chain.push(new WithdrawFee(request))
        } else if (request.type === 'withdraw_logos') {
          this._chain.push(new WithdrawLogos(request))
        }
      }
    } else {
      this._chain = []
    }

    /**
     * Receive chain of the account
     * @type {Request[]}
     * @private
     */
    if (options.receiveChain !== undefined) {
      this._receiveChain = []
      for (let request of options.receiveChain) {
        if (request.type === 'send') {
          this._receiveChain.push(new Send(request))
        } else if (request.type === 'issuance') {
          this._receiveChain.push(new Issuance(request))
        } else if (request.type === 'withdraw_logos') {
          this._receiveChain.push(new WithdrawLogos(request))
        }
      }
    } else {
      this._receiveChain = []
    }

    /**
     * Pending chain of the account (local unconfirmed sends)
     * @type {Request[]}
     * @private
     */
    if (options.pendingChain !== undefined) {
      this._pendingChain = []
      for (let request of options.pendingChain) {
        if (request.type === 'issue_additional') {
          this._pendingChain.push(new IssueAdditional(request))
        } else if (request.type === 'change_setting') {
          this._pendingChain.push(new ChangeSetting(request))
        } else if (request.type === 'immute_setting') {
          this._pendingChain.push(new ImmuteSetting(request))
        } else if (request.type === 'revoke') {
          this._pendingChain.push(new Revoke(request))
        } else if (request.type === 'adjust_user_status') {
          this._pendingChain.push(new AdjustUserStatus(request))
        } else if (request.type === 'adjust_fee') {
          this._pendingChain.push(new AdjustFee(request))
        } else if (request.type === 'update_issuer_info') {
          this._pendingChain.push(new UpdateIssuerInfo(request))
        } else if (request.type === 'update_controller') {
          this._pendingChain.push(new UpdateController(request))
        } else if (request.type === 'burn') {
          this._pendingChain.push(new Burn(request))
        } else if (request.type === 'distribute') {
          this._pendingChain.push(new Distribute(request))
        } else if (request.type === 'withdraw_fee') {
          this._pendingChain.push(new WithdrawFee(request))
        } else if (request.type === 'withdraw_logos') {
          this._pendingChain.push(new WithdrawLogos(request))
        }
      }
    } else {
      this._pendingChain = []
    }

    /**
     * Account version of webwallet SDK
     * @type {number}
     * @private
     */
    if (options.version !== undefined) {
      this._version = options.version
    } else {
      this._version = 1
    }

    this._synced = false
  }

  /**
   * If the token account has been synced with the RPC or if RPC is disabled this is true
   * @type {boolean}
   */
  get synced () {
    return this._synced
  }

  set synced (val) {
    this._synced = val
  }

  /**
   * The wallet this account belongs to
   * @type {boolean}
   * @readonly
   */
  get wallet () {
    return this._wallet
  }

  /**
   * The address of the account
   * @type {LogosAddress}
   * @readonly
   */
  get address () {
    return this._address
  }

  /**
   * The public key of the token account
   * @type {Hexadecimal64Length}
   * @readonly
   */
  get tokenID () {
    return this._tokenID
  }

  /**
   * The balance of the token account in reason
   * @type {string}
   * @readonly
   */
  get balance () {
    return this._balance
  }

  set balance (val) {
    this._balance = val
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
   * array of confirmed requests on the account
   * @type {Request[]}
   */
  get chain () {
    return this._chain
  }

  set chain (val) {
    this._chain = val
  }

  /**
   * array of confirmed receive requests on the account
   * @type {Request[]}
   */
  get receiveChain () {
    return this._receiveChain
  }

  set receiveChain (val) {
    this._receiveChain = val
  }

  /**
   * array of pending requests on the account
   *
   * These requests have been sent for consensus but we haven't heard back on if they are confirmed yet.
   *
   * @type {Request[]}
   */
  get pendingChain () {
    return this._pendingChain
  }

  set pendingChain (val) {
    this._pendingChain = val
  }

  /**
   * Gets the total number of requests on the send chain
   *
   * @type {number} count of all the requests
   * @readonly
   */
  get requestCount () {
    return this.chain.length
  }

  /**
   * Gets the total number of requests on the pending chain
   *
   * @type {number} count of all the requests
   * @readonly
   */
  get pendingRequestCount () {
    return this.pendingChain.length
  }

  /**
   * Gets the total number of requests on the receive chain
   *
   * @type {number} count of all the requests
   * @readonly
   */
  get receiveCount () {
    return this.receiveChain.length
  }

  /**
   * Return the previous request as hash
   * @type {Hexadecimal64Length}
   * @returns {Hexadecimal64Length} hash of the previous transaction
   * @readonly
   */
  get previous () {
    if (this.pendingChain.length > 0) {
      this._previous = this.pendingChain[this.pendingChain.length - 1].hash
    } else if (this.chain.length > 0) {
      this._previous = this.chain[this.chain.length - 1].hash
    } else {
      this._previous = Utils.GENESIS_HASH
    }
    return this._previous
  }

  /**
   * Return the sequence value
   * @type {number}
   * @returns {number} sequence for the next transactions
   * @readonly
   */
  get sequence () {
    if (this.pendingChain.length > 0) {
      this._sequence = this.pendingChain[this.pendingChain.length - 1].sequence
    } else if (this.chain.length > 0) {
      this._sequence = this.chain[this.chain.length - 1].sequence
    } else {
      this._sequence = -1
    }
    return parseInt(this._sequence) + 1
  }

  /**
   * Checks if the account is synced
   * @returns {Promise<Boolean>}
   */
  isSynced () {
    return new Promise((resolve, reject) => {
      const RPC = new Logos({
        url: `http://${this.wallet.rpc.delegates[0]}:55000`,
        proxyURL: this.wallet.rpc.proxy
      })
      RPC.accounts.info(this.address).then(async info => {
        let synced = true
        if (info && info.frontier) {
          if (info.frontier !== Utils.GENESIS_HASH) {
            if (this.chain.length === 0 || this.chain[this.chain.length - 1].hash !== info.frontier) {
              synced = false
            }
          }
          let receiveBlock = await RPC.requests.info(info.receive_tip)
          if (this.receiveChain.length === 0 || this.receiveChain[this.receiveChain.length - 1].hash !== receiveBlock.send_hash) {
            synced = false
          }
          this._synced = synced
          if (synced) {
            if (this.verifyChain() && this.verifyReceiveChain()) {
              this.synced = true
              console.info(`${info.name} has been fully synced`)
              resolve(this)
            }
          } else {
            resolve(synced)
          }
        } else {
          console.info(`${this.address} is empty and therefore valid`)
          this._synced = synced
          resolve(synced)
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
      const RPC = new Logos({
        url: `http://${this.wallet.rpc.delegates[0]}:55000`,
        proxyURL: this.wallet.rpc.proxy
      })

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
        this.controllers = Utils.deserializeControllers(info.controllers)
        this.settings = Utils.deserializeSettings(info.settings)
        this.balance = info.balance
        if (this.wallet.fullSync) {
          RPC.accounts.history(this.address, -1, true).then((history) => {
            if (history) {
              // Add Genesis to latest
              for (const requestInfo of history.reverse()) {
                this.addConfirmedRequest(requestInfo)
              }
              if (this.verifyChain() && this.verifyReceiveChain()) {
                this.synced = true
                console.info(`${info.name} has been fully synced`)
                resolve(this)
              }
            } else {
              this.synced = true
              console.info(`${this.address} is empty and therefore valid`)
              resolve(this)
            }
          })
        } else {
          if (info && info.frontier && info.frontier !== Utils.GENESIS_HASH) {
            RPC.requests.info(info.frontier).then(val => {
              let request = this.addConfirmedRequest(val)
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
      // Nothing to update here :)
    } else if (request.type === 'adjust_fee') {
      this.feeRate = request.feeRate
      this.feeType = request.feeType
    } else if (request.type === 'update_issuer_info') {
      this.issuerInfo = request.issuerInfo
    } else if (request.type === 'update_controller') {
      let updatedPrivs = Utils.serializeController(request.controller).privileges
      if (request.action === 'remove' && updatedPrivs.length === 0) {
        this.controllers = this.controllers.filter(controller => controller.account !== request.controller.account)
      } else if (request.action === 'remove' && updatedPrivs.length > 0) {
        for (let controller of this.controllers) {
          if (controller.account === request.controller.account) {
            for (let priv of updatedPrivs) {
              controller.privileges[priv] = false
            }
          }
        }
      } else if (request.action === 'add') {
        if (this.controllers.some(controller => controller.account === request.controller.account)) {
          for (let controller of this.controllers) {
            if (controller.account === request.controller.account) {
              for (let priv of updatedPrivs) {
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
      for (let transaction of request.transactions) {
        if (transaction.destination === this.address) {
          this.balance = bigInt(this.balance).plus(bigInt(transaction.amount)).toString()
        }
      }
    } else if (request.type === 'issuance') {
      this.tokenBalance = request.totalSupply
      this.pendingTokenBalance = request.totalSupply
      this.totalSupply = request.totalSupply
      this.pendingTotalSupply = request.totalSupply
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
    }
    if (request.type !== 'send' && request.type !== 'issuance' && request.type !== 'withdraw_logos') {
      this.balance = bigInt(this.balance).minus(bigInt(request.fee)).toString()
    }
  }

  /**
   * Validates if the token account contains the controller
   *
   * @param {LogosAddress} address - Address of the controller you are checking
   * @returns {Boolean}
   */
  isController (address) {
    for (let controller of this.controllers) {
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
    for (let controller of this.controllers) {
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
      const RPC = new Logos({
        url: `http://${this.wallet.rpc.delegates[0]}:55000`,
        proxyURL: this.wallet.rpc.proxy
      })
      let info = await RPC.accounts.info(address)
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
      const RPC = new Logos({
        url: `http://${this.wallet.rpc.delegates[0]}:55000`,
        proxyURL: this.wallet.rpc.proxy
      })
      let info = await RPC.accounts.info(address)
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
        if (bigInt(this.totalSupply).plus(bigInt(request.amount)).greater(bigInt(Utils.MAXUINT128))) {
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
   * Broadcasts the first pending request
   *
   * @returns {Promise<Request>}
   */
  async broadcastRequest () {
    if (this.wallet.rpc && this.pendingChain.length > 0) {
      let request = this.pendingChain[0]
      if (!request.published && await this.validateRequest(request)) {
        request.published = true
        try {
          await request.publish(this.wallet.rpc)
        } catch (err) {
          request.published = false
          // Wallet setting to reject the request and clear the invalid request?
        }
        return request
      } else {
        // Wallet setting to reject the request and clear the invalid request?
      }
    } else {
      return null
    }
  }

  /**
   * Adds the request to the pending chain and publishes it
   *
   * @param {Request} request - Request information from the RPC or MQTT
   * @throws An exception if the pending balance is less than the required amount to adjust a users status
   * @returns {Request}
   */
  async addRequest (request) {
    if (request.work === null) {
      if (this.wallet.remoteWork) {
        request.work = Utils.EMPTY_WORK
      } else {
        request.work = await request.createWork(true)
      }
    }
    this.pendingChain.push(request)
    if (this.pendingChain.length === 1) {
      this.broadcastRequest()
    }
    return request
  }

  /**
   * Adds the request to the Receive chain if it doesn't already exist
   *
   * @param {Request} request - Request Object
   * @returns {void}
   */
  _addToReceiveChain (request) {
    let addBlock = true
    for (let j = this._receiveChain.length - 1; j >= 0; j--) {
      const blk = this._receiveChain[j]
      if (blk.hash === request.hash) {
        addBlock = false
        break
      }
    }
    if (addBlock) this._receiveChain.push(request)
  }

  /**
   * Adds the request to the Send chain if it doesn't already exist
   *
   * @param {Request} request - Request Object
   * @returns {void}
   */
  _addToSendChain (request) {
    let addBlock = true
    for (let j = this._chain.length - 1; j >= 0; j--) {
      const blk = this._chain[j]
      if (blk.hash === request.hash) {
        addBlock = false
        break
      }
    }
    if (addBlock) this._chain.push(request)
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
      let request = new Send(requestInfo)
      if (requestInfo.transactions && requestInfo.transactions.length > 0) {
        for (let trans of requestInfo.transactions) {
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
    } else {
      console.error(`Error unknown block type: ${requestInfo.type} ${requestInfo.hash}`)
      return request
    }
  }

  /**
   * Verify the integrity of the send & pending chains
   *
   * @returns {boolean}
   */
  verifyChain () {
    let last = Utils.GENESIS_HASH
    for (let i = this.chain.length - 1; i >= 0; i--) {
      if (this.chain[i]) {
        if (this.chain[i].previous !== last) throw new Error('Invalid Chain (prev != current hash)')
        if (!this.chain[i].verify()) throw new Error('Invalid request in this chain')
        last = this.chain[i].hash
      }
    }
    for (let i = this.pendingChain.length - 1; i >= 0; i--) {
      if (this.pendingChain[i]) {
        if (this.pendingChain[i].previous !== last) throw new Error('Invalid Pending Chain (prev != current hash)')
        if (!this.pendingChain[i].verify()) throw new Error('Invalid request in the pending chain')
        last = this.pendingChain[i].hash
      }
    }
    return true
  }

  /**
   * Verify the integrity of the receive chain
   *
   * @throws An exception if there is an invalid request in the receive requestchain
   * @returns {boolean}
   */
  verifyReceiveChain () {
    for (let i = this.receiveChain.length - 1; i >= 0; i--) {
      if (!this.receiveChain[i].verify()) throw new Error('Invalid request in the receive chain')
    }
    return true
  }

  /**
   * Retreives requests from the send chain
   *
   * @param {number} count - Number of requests you wish to retrieve
   * @param {number} offset - Number of requests back from the frontier tip you wish to start at
   * @returns {Request[]} all the requests
   */
  recentRequests (count = 5, offset = 0) {
    const requests = []
    if (count > this.chain.length) count = this.chain.length
    for (let i = this.chain.length - 1 - offset; i > this.chain.length - 1 - count - offset; i--) {
      requests.push(this.chain)
    }
    return requests
  }

  /**
   * Retreives pending requests from the send chain
   *
   * @param {number} count - Number of requests you wish to retrieve
   * @param {number} offset - Number of requests back from the frontier tip you wish to start at
   * @returns {Request[]} all the requests
   */
  recentPendingRequests (count = 5, offset = 0) {
    const requests = []
    if (count > this.pendingChain.length) count = this.pendingChain.length
    for (let i = this.pendingChain.length - 1 - offset; i > this.pendingChain.length - 1 - count - offset; i--) {
      requests.push(this.pendingChain)
    }
    return requests
  }

  /**
   * Retreives requests from the receive chain
   *
   * @param {number} count - Number of requests you wish to retrieve
   * @param {number} offset - Number of requests back from the frontier tip you wish to start at
   * @returns {Request[]} all the requests
   */
  recentReceiveRequests (count = 5, offset = 0) {
    const requests = []
    if (count > this.receiveChain.length) count = this.receiveChain.length
    for (let i = this.receiveChain.length - 1 - offset; i > this.receiveChain.length - 1 - count - offset; i--) {
      requests.push(this.receiveChain)
    }
    return requests
  }

  /**
   * Gets the requests up to a certain hash from the send chain
   *
   * @param {Hexadecimal64Length} hash - Hash of the request you wish to stop retrieving requests at
   * @returns {Request[]} all the requests up to and including the specified request
   */
  getRequestsUpTo (hash) {
    const requests = []
    for (let i = this.chain.length - 1; i > 0; i--) {
      requests.push(this.chain[i])
      if (this.chain[i].hash === hash) break
    }
    return requests
  }

  /**
   * Gets the requests up to a certain hash from the pending chain
   *
   * @param {Hexadecimal64Length} hash - Hash of the request you wish to stop retrieving requests at
   * @returns {Request[]} all the requests up to and including the specified request
   */
  getPendingRequestsUpTo (hash) {
    const requests = []
    for (let i = this.pendingChain.length - 1; i > 0; i--) {
      requests.push(this.pendingChain[i])
      if (this.pendingChain[i].hash === hash) break
    }
    return requests
  }

  /**
   * Gets the requests up to a certain hash from the receive chain
   *
   * @param {Hexadecimal64Length} hash - Hash of the request you wish to stop retrieving requests at
   * @returns {Request[]} all the requests up to and including the specified request
   */
  getReceiveRequestsUpTo (hash) {
    const requests = []
    for (let i = this.receiveChain.length - 1; i > 0; i--) {
      requests.push(this.receiveChain[i])
      if (this.receiveChain[i].hash === hash) break
    }
    return requests
  }

  /**
   * Removes all pending requests from the pending chain
   * @returns {void}
   */
  removePendingRequests () {
    this.pendingChain = []
  }

  /**
   * Called when a request is confirmed to remove it from the pending request pool
   *
   * @param {Hexadecimal64Length} hash - The hash of the request we are confirming
   * @returns {boolean}
   */
  removePendingRequest (hash) {
    let found = false
    for (let i in this.pendingChain) {
      const request = this.pendingChain[i]
      if (request.hash === hash) {
        this.pendingChain.splice(i, 1)
        return true
      }
    }
    if (!found) {
      console.warn('Not found')
      return false
    }
  }

  /**
   * Finds the request object of the specified request hash
   *
   * @param {Hexadecimal64Length} hash - The hash of the request we are looking for
   * @returns {Request} false if no request object of the specified hash was found
   */
  getRequest (hash) {
    for (let j = this.chain.length - 1; j >= 0; j--) {
      const blk = this.chain[j]
      if (blk.hash === hash) return blk
    }
    for (let n = this.receiveChain.length - 1; n >= 0; n--) {
      const blk = this.receiveChain[n]
      if (blk.hash === hash) return blk
    }
    for (let n = this.pendingChain.length - 1; n >= 0; n--) {
      const blk = this.receiveChain[n]
      if (blk.hash === hash) return blk
    }
    return false
  }

  /**
   * Finds the request object of the specified request hash in the confirmed chain
   *
   * @param {Hexadecimal64Length} hash - The hash of the request we are looking for
   * @returns {Request} false if no request object of the specified hash was found
   */
  getChainRequest (hash) {
    for (let j = this.chain.length - 1; j >= 0; j--) {
      const blk = this.chain[j]
      if (blk.hash === hash) return blk
    }
    return false
  }

  /**
   * Finds the request object of the specified request hash in the pending chain
   *
   * @param {Hexadecimal64Length} hash - The hash of the request we are looking for
   * @returns {Request} false if no request object of the specified hash was found
   */
  getPendingRequest (hash) {
    for (let n = this.pendingChain.length - 1; n >= 0; n--) {
      const request = this.pendingChain[n]
      if (request.hash === hash) return request
    }
    return false
  }

  /**
   * Finds the request object of the specified request hash in the recieve chain
   *
   * @param {Hexadecimal64Length} hash - The hash of the request we are looking for
   * @returns {Request} false if no request object of the specified hash was found
   */
  getRecieveRequest (hash) {
    for (let n = this.receiveChain.length - 1; n >= 0; n--) {
      const blk = this.receiveChain[n]
      if (blk.hash === hash) return blk
    }
    return false
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
    let request = this.addConfirmedRequest(requestInfo)
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
    const obj = {}
    obj.tokenID = this.tokenID
    obj.address = this.address
    obj.tokenBalance = this.tokenBalance
    obj.totalSupply = this.totalSupply
    obj.tokenFeeBalance = this.tokenFeeBalance
    obj.symbol = this.symbol
    obj.name = this.name
    obj.issuerInfo = this.issuerInfo
    obj.feeRate = this.feeRate
    obj.feeType = this.feeType
    obj.controllers = this.controllers
    obj.settings = this.settings
    obj.balance = this.balance
    obj.chain = []
    for (let request of this.chain) {
      obj.chain.push(JSON.parse(request.toJSON()))
    }
    obj.receiveChain = []
    for (let request of this.receiveChain) {
      obj.receiveChain.push(JSON.parse(request.toJSON()))
    }
    obj.version = this._version
    obj.index = this.index
    return JSON.stringify(obj)
  }
}

module.exports = TokenAccount
