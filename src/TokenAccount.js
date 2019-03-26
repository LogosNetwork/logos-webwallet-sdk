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
const Logos = require('@logosnetwork/logos-rpc-client')

/**
 * TokenAccount contain the keys, chains, and balances.
 */
class TokenAccount {
  constructor (address, wallet, issuance) {
    if (!address) throw new Error('You must initalize a token account with a address')
    if (!wallet) throw new Error('You must initalize a token account with a wallet')
    this._tokenID = Utils.keyFromAccount(address)
    this._address = address
    this._wallet = wallet
    this._tokenBalance = null
    this._pendingTokenBalance = null
    this._totalSupply = null
    this._pendingTotalSupply = null
    this._tokenFeeBalance = null
    this._pendingTokenFeeBalance = null
    this._symbol = null
    this._name = null
    this._issuerInfo = null
    this._feeRate = null
    this._feeType = null
    this._controllers = []
    this._settings = {}
    this._sequence = null
    this._previous = null
    this._balance = '0'
    this._pendingBalance = '0'
    this._chain = []
    this._receiveChain = []
    this._pendingChain = []
    this._synced = false

    if (issuance) {
      this._tokenBalance = issuance.totalSupply
      this._pendingTokenBalance = issuance.totalSupply
      this._totalSupply = issuance.totalSupply
      this._pendingTotalSupply = issuance.totalSupply
      this._tokenFeeBalance = '0'
      this._pendingTokenFeeBalance = '0'
      this._symbol = issuance.symbol
      this._name = issuance.name
      this._issuerInfo = issuance.issuerInfo
      this._feeRate = issuance.feeRate
      this._feeType = issuance.feeType
      this._controllers = issuance.controllers
      this._settings = issuance.settings
      this._sequence = 0
      this._previous = null
      this._balance = '0'
      this._pendingBalance = '0'
      this._chain = []
      this._receiveChain = []
      this._pendingChain = []
      this._synced = true
    }
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
   * The pending balance of the token account in reason
   *
   * pending balance is balance we are expecting to see after blocks are confirmed
   *
   * @type {string}
   * @readonly
   */
  get pendingBalance () {
    return this._pendingBalance
  }

  set pendingBalance (val) {
    this._pendingBalance = val
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
   * The pending token balance of the account in base token
   *
   * pending token balance is balance we are expecting to see after blocks are confirmed
   *
   * @type {string}
   * @readonly
   */
  get pendingTokenBalance () {
    return this._pendingTokenBalance
  }

  set pendingTokenBalance (val) {
    this._pendingTokenBalance = val
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
   * The pending total supply of the token in base token
   *
   * pending total supply is the total supply we are expecting after the pending blocks are confirmed
   *
   * @type {string}
   * @readonly
   */
  get pendingTotalSupply () {
    return this._pendingTotalSupply
  }

  set pendingTotalSupply (val) {
    this._pendingTotalSupply = val
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
   * @readonly
   */
  get chain () {
    return this._chain
  }

  /**
   * array of confirmed receive requests on the account
   * @type {Request[]}
   * @readonly
   */
  get receiveChain () {
    return this._receiveChain
  }

  /**
   * array of pending requests on the account
   *
   * These requests have been sent for consensus but we haven't heard back on if they are confirmed yet.
   *
   * @type {Request[]}
   * @readonly
   */
  get pendingChain () {
    return this._pendingChain
  }

  /**
   * Gets the total number of requests on the send chain
   *
   * @type {number} count of all the requests
   * @readonly
   */
  get requestCount () {
    return this._chain.length
  }

  /**
   * Gets the total number of requests on the pending chain
   *
   * @type {number} count of all the requests
   * @readonly
   */
  get pendingRequestCount () {
    return this._pendingChain.length
  }

  /**
   * Gets the total number of requests on the receive chain
   *
   * @type {number} count of all the requests
   * @readonly
   */
  get receiveCount () {
    return this._receiveChain.length
  }

  /**
   * Return the previous request as hash
   * @type {Hexadecimal64Length}
   * @returns {Hexadecimal64Length} hash of the previous transaction
   * @readonly
   */
  get previous () {
    if (this._pendingChain.length > 0) {
      this._previous = this._pendingChain[this.pendingChain.length - 1].hash
    } else if (this._chain.length > 0) {
      this._previous = this._chain[this._chain.length - 1].hash
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
    if (this._pendingChain.length > 0) {
      this._sequence = this._pendingChain[this.pendingChain.length - 1].sequence
    } else if (this._chain.length > 0) {
      this._sequence = this._chain[this._chain.length - 1].sequence
    } else {
      this._sequence = -1
    }
    return parseInt(this._sequence) + 1
  }

  /**
   * Scans the account history using RPC and updates the local chains
   * @returns {Promise<TokenAccount>}
   */
  sync () {
    return new Promise((resolve, reject) => {
      this._synced = false
      this._chain = []
      this._receiveChain = []
      const RPC = new Logos({
        url: `http://${this.wallet.rpc.delegates[0]}:55000`,
        proxyURL: this.wallet.rpc.proxy
      })

      RPC.accounts.info(this._address).then(info => {
        if (!info || !info.type || info.type !== 'TokenAccount') {
          throw new Error('Invalid Address - This is not a valid token account')
        }
        this._tokenBalance = info.token_balance
        this._pendingTokenBalance = info.token_balance
        this._totalSupply = info.total_supply
        this._pendingTotalSupply = info.total_supply
        this._tokenFeeBalance = info.token_fee_balance
        this._symbol = info.symbol
        this._name = info._name
        this._issuerInfo = info.issuer_info
        this._feeRate = info.fee_rate
        this._feeType = info.fee_type
        this._controllers = this._getControllerFromJSON(info.controllers)
        this._settings = this._getSettingsFromJSON(info.settings)
        this._balance = info.balance
        this._pendingBalance = info.balance
        if (this.wallet.fullSync) {
          RPC.accounts.history(this._address, -1, true).then((history) => {
            if (history) {
              for (const requestInfo of history) {
                this.addConfirmedRequest(requestInfo)
              }
              if (this.verifyChain() && this.verifyReceiveChain()) {
                this._synced = true
                resolve(this)
              }
            } else {
              this._synced = true
              console.log(`${this._address} is empty and therefore valid`)
              resolve(this)
            }
          })
        } else {
          if (info && info.frontier && info.frontier !== Utils.GENESIS_HASH) {
            RPC.requests.info(info.frontier).then(val => {
              this.addConfirmedRequest(val)
              this._synced = true
              resolve(this)
            })
          } else {
            this._synced = true
            console.log(`${this._address} is empty and therefore valid`)
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
    } else if (request.type === 'change_setting') {
      this.settings[request.setting] = request.value
    } else if (request.type === 'immute_setting') {
      this.settings[`modify_${request.setting}`] = false
    } else if (request.type === 'revoke') {
      if (request.transaction.destination === this.address) {
        this.tokenBalance = bigInt(this.tokenBalance).plus(bigInt(request.transaction.amount)).toString()
      }
    } else if (request.type === 'adjust_user_status') {
      // Nothing to update here :)
    } else if (request.type === 'adjust_fee') {
      this.feeRate = request.feeRate
      this.feeType = request.feeType
    } else if (request.type === 'update_issuer_info') {
      this.issuerInfo = request.issuerInfo
    } else if (request.type === 'update_controller') {
      this.controllers = this.controllers.filter(controller => controller.account !== request.controller.account)
      if (request.action === 'add') this.controllers.push(request.controller)
    } else if (request.type === 'burn') {
      this.totalSupply = bigInt(this.totalSupply).minus(bigInt(request.amount)).toString()
    } else if (request.type === 'distribute') {
      this.tokenBalance = bigInt(this.tokenBalance).minus(bigInt(request.transaction.amount)).toString()
    } else if (request.type === 'withdraw_fee') {
      this.tokenFeeBalance = bigInt(this.tokenFeeBalance).minus(bigInt(request.transaction.amount)).toString()
    } else if (request.type === 'withdraw_logos') {
      this.balance = bigInt(this.balance).minus(bigInt(request.transaction.amount)).toString()
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
    if (request.type !== 'send' && request.type !== 'issuance') {
      this.balance = bigInt(this.balance).minus(bigInt(request.fee)).toString()
    }
  }

  /**
   * Validates that the account has enough funds at the current time to publish the request
   *
   * @param {Request} request - Request information from the RPC or MQTT
   * @returns {Boolean}
   */
  validateRequest (request) {
    // TODO Better validation then just fee!
    if (bigInt(this.balance).minus(request.fee).lesser(0)) {
      console.log('Invalid Request: Token Account does not have enough Logos to afford the fee to issue additional tokens')
      return false
    } else {
      return true
    }
  }

  /**
   * Broadcasts the first pending request
   *
   * @returns {Request}
   */
  async broadcastRequest () {
    if (this.wallet.rpc && this._pendingChain.length > 0) {
      let request = this._pendingChain[0]
      if (!request.published && this.validateRequest(request)) {
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
    this._pendingChain.push(request)
    if (this._pendingChain.length === 1) {
      this.broadcastRequest()
    }
    return request
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
          if (trans.destination === this._address &&
            !this.getRecieveRequest(requestInfo.hash)) {
            this._receiveChain.push(request)
          }
        }
      }
      return request
    } else if (requestInfo.type === 'issue_additional') {
      request = new IssueAdditional(requestInfo)
      this._chain.push(request)
      return request
    } else if (requestInfo.type === 'change_setting') {
      request = new ChangeSetting(requestInfo)
      this._chain.push(request)
      return request
    } else if (requestInfo.type === 'immute_setting') {
      request = new ImmuteSetting(requestInfo)
      this._chain.push(request)
      return request
    } else if (requestInfo.type === 'revoke') {
      request = new Revoke(requestInfo)
      this._chain.push(request)
      return request
    } else if (requestInfo.type === 'adjust_user_status') {
      request = new AdjustUserStatus(requestInfo)
      this._chain.push(request)
      return request
    } else if (requestInfo.type === 'adjust_fee') {
      request = new AdjustFee(requestInfo)
      this._chain.push(request)
      return request
    } else if (requestInfo.type === 'update_issuer_info') {
      request = new UpdateIssuerInfo(requestInfo)
      this._chain.push(request)
      return request
    } else if (requestInfo.type === 'update_controller') {
      request = new UpdateController(requestInfo)
      this._chain.push(request)
      return request
    } else if (requestInfo.type === 'burn') {
      request = new Burn(requestInfo)
      this._chain.push(request)
      return request
    } else if (requestInfo.type === 'distribute') {
      request = new Distribute(requestInfo)
      this._chain.push(request)
      return request
    } else if (requestInfo.type === 'withdraw_fee') {
      request = new WithdrawFee(requestInfo)
      this._chain.push(request)
      return request
    } else if (requestInfo.type === 'issuance') {
      request = new Issuance(requestInfo)
      this._receiveChain.push(request)
      return request
    } else {
      return null
    }
  }

  /**
   * Verify the integrity of the send & pending chains
   *
   * @returns {boolean}
   */
  verifyChain () {
    let last = Utils.GENESIS_HASH
    this._chain.reverse().forEach(request => {
      if (request) {
        if (request.previous !== last) throw new Error('Invalid Chain (prev != current hash)')
        if (!request.verify()) throw new Error('Invalid request in this chain')
        last = request.hash
      }
    })
    this._pendingChain.reverse().forEach(request => {
      if (request) {
        if (request.previous !== last) throw new Error('Invalid Pending Chain (prev != current hash)')
        if (!request.verify()) throw new Error('Invalid request in the pending chain')
        last = request.hash
      }
    })
    return true
  }

  /**
   * Verify the integrity of the receive chain
   *
   * @throws An exception if there is an invalid request in the receive requestchain
   * @returns {boolean}
   */
  verifyReceiveChain () {
    this._receiveChain.forEach(request => {
      if (!request.verify()) throw new Error('Invalid request in this chain')
    })
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
    if (count > this._chain.length) count = this._chain.length
    for (let i = this._chain.length - 1 - offset; i > this._chain.length - 1 - count - offset; i--) {
      requests.push(this._chain)
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
    if (count > this._pendingChain.length) count = this._pendingChain.length
    for (let i = this._pendingChain.length - 1 - offset; i > this._pendingChain.length - 1 - count - offset; i--) {
      requests.push(this._pendingChain)
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
    if (count > this._receiveChain.length) count = this._receiveChain.length
    for (let i = this._receiveChain.length - 1 - offset; i > this._receiveChain.length - 1 - count - offset; i--) {
      requests.push(this._receiveChain)
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
    for (let i = this._chain.length - 1; i > 0; i--) {
      requests.push(this._chain[i])
      if (this._chain[i].hash === hash) break
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
    for (let i = this._pendingChain.length - 1; i > 0; i--) {
      requests.push(this._pendingChain[i])
      if (this._pendingChain[i].hash === hash) break
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
    for (let i = this._receiveChain.length - 1; i > 0; i--) {
      requests.push(this._receiveChain[i])
      if (this._receiveChain[i].hash === hash) break
    }
    return requests
  }

  /**
   * Removes all pending requests from the pending chain
   * @returns {void}
   */
  removePendingRequests () {
    this._pendingChain = []
    this._pendingBalance = this._balance
    this._pendingTokenBalance = this._tokenBalance
  }

  /**
   * Called when a request is confirmed to remove it from the pending request pool
   *
   * @param {Hexadecimal64Length} hash - The hash of the request we are confirming
   * @returns {boolean}
   */
  removePendingRequest (hash) {
    let found = false
    for (let i in this._pendingChain) {
      const request = this._pendingChain[i]
      if (request.hash === hash) {
        this._pendingChain.splice(i, 1)
        return true
      }
    }
    if (!found) {
      console.log('Not found')
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
    for (let j = this._chain.length - 1; j >= 0; j--) {
      const blk = this._chain[j]
      if (blk.hash === hash) return blk
    }
    for (let n = this._receiveChain.length - 1; n >= 0; n--) {
      const blk = this._receiveChain[n]
      if (blk.hash === hash) return blk
    }
    for (let n = this._pendingChain.length - 1; n >= 0; n--) {
      const blk = this._receiveChain[n]
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
    for (let j = this._chain.length - 1; j >= 0; j--) {
      const blk = this._chain[j]
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
    for (let n = this._pendingChain.length - 1; n >= 0; n--) {
      const request = this._pendingChain[n]
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
    for (let n = this._receiveChain.length - 1; n >= 0; n--) {
      const blk = this._receiveChain[n]
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
    // Confirm the request add it to the confirmed chain and remove from pending.
    if (requestInfo.type === 'send' || requestInfo.type === 'issuance') {
      // Handle Recieves (TODO make sure withdraw_logos isnt sendable to a token account)
      let request = this.addConfirmedRequest(requestInfo)
      if (!request.verify()) throw new Error(`Invalid Logos Request! \n ${request.toJSON(true)}`)
      this.updateTokenInfoFromRequest(request)
      this.broadcastRequest()
    } else if (requestInfo.token_id === this._tokenID && requestInfo.type !== 'token_send') {
      // Handle Sends
      let request = this.getPendingRequest(requestInfo.hash)
      if (request) {
        this._chain.push(request)
        this.removePendingRequest(requestInfo.hash)
        this.updateTokenInfoFromRequest(request)
        this.broadcastRequest()
      } else {
        console.log('Someone is performing token account that is not us!!!')
        // Add new request to chain
        let request = this.addConfirmedRequest(requestInfo)

        // Remove all pendings as they are now invalidated
        this.removePendingRequests()

        // Update Token Account for new block
        this.updateTokenInfoFromRequest(request)
      }
    }
  }

  /**
   * Adds a receive request to the local chain
   *
   * @param {MQTTRequestOptions} request The mqtt request options
   * @returns {Request} request if it is valid
   */
  addReceiveRequest (requestInfo) {
    let request = new Send({
      origin: requestInfo.origin,
      signature: requestInfo.signature,
      work: requestInfo.work,
      sequence: requestInfo.sequence,
      transactions: requestInfo.transactions,
      previous: requestInfo.previous,
      fee: requestInfo.fee
    })
    if (!request.verify()) throw new Error('Invalid Recieve Request!')
    this._receiveChain.push(request)
    this.updateTokenInfoFromRequest(request)
    return request
  }

  _getControllerFromJSON (controllers) {
    let newControllers = []
    for (let controller of controllers) {
      let newController = {}
      newController.account = controller.account
      newController.privileges = {}
      if (controller.privileges instanceof Array) {
        newController.privileges.change_issuance = controller.privileges.indexOf('change_issuance') > -1
        newController.privileges.change_modify_issuance = controller.privileges.indexOf('change_modify_issuance') > -1
        newController.privileges.change_revoke = controller.privileges.indexOf('change_revoke') > -1
        newController.privileges.change_modify_revoke = controller.privileges.indexOf('change_modify_revoke') > -1
        newController.privileges.change_freeze = controller.privileges.indexOf('change_freeze') > -1
        newController.privileges.change_modify_freeze = controller.privileges.indexOf('change_modify_freeze') > -1
        newController.privileges.change_adjust_fee = controller.privileges.indexOf('change_adjust_fee') > -1
        newController.privileges.change_modify_adjust_fee = controller.privileges.indexOf('change_modify_adjust_fee') > -1
        newController.privileges.change_whitelist = controller.privileges.indexOf('change_whitelist') > -1
        newController.privileges.change_modify_whitelist = controller.privileges.indexOf('change_modify_whitelist') > -1
        newController.privileges.issuance = controller.privileges.indexOf('issuance') > -1
        newController.privileges.revoke = controller.privileges.indexOf('revoke') > -1
        newController.privileges.freeze = controller.privileges.indexOf('freeze') > -1
        newController.privileges.adjust_fee = controller.privileges.indexOf('adjust_fee') > -1
        newController.privileges.whitelist = controller.privileges.indexOf('whitelist') > -1
        newController.privileges.update_issuer_info = controller.privileges.indexOf('update_issuer_info') > -1
        newController.privileges.update_controller = controller.privileges.indexOf('update_controller') > -1
        newController.privileges.burn = controller.privileges.indexOf('burn') > -1
        newController.privileges.distribute = controller.privileges.indexOf('distribute') > -1
        newController.privileges.withdraw_fee = controller.privileges.indexOf('withdraw_fee') > -1
      } else {
        newController.privileges = controller.privileges
      }
      newControllers.push(newController)
    }
    return newControllers
  }
  _getSettingsFromJSON (settings) {
    if (settings instanceof Array) {
      return {
        issuance: settings.indexOf('issuance') > -1,
        modify_issuance: settings.indexOf('modify_issuance') > -1,
        revoke: settings.indexOf('revoke') > -1,
        modify_revoke: settings.indexOf('modify_revoke') > -1,
        freeze: settings.indexOf('freeze') > -1,
        modify_freeze: settings.indexOf('modify_freeze') > -1,
        adjust_fee: settings.indexOf('adjust_fee') > -1,
        modify_adjust_fee: settings.indexOf('modify_adjust_fee') > -1,
        whitelist: settings.indexOf('whitelist') > -1,
        modify_whitelist: settings.indexOf('modify_whitelist') > -1
      }
    } else {
      return settings
    }
  }
}

module.exports = TokenAccount
