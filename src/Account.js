const Utils = require('./Utils')
const bigInt = require('big-integer')
const Send = require('./Requests/Send.js')
const Issuance = require('./Requests/Issuance.js')
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
const WithdrawFee = require('./Requests/WithdrawFee.js')
const TokenSend = require('./Requests/TokenSend.js')
const Logos = require('@logosnetwork/logos-rpc-client')

/**
 * The Accounts contain the keys, chains, and balances.
 */
class Account {
  constructor (options = {
    label: null,
    address: null,
    publicKey: null,
    privateKey: null,
    balance: '0',
    pendingBalance: '0',
    tokenBalances: {},
    pendingTokenBalances: {},
    representative: null,
    chain: [],
    receiveChain: [],
    pendingChain: [],
    wallet: null,
    version: 1,
    index: null
  }) {
    /**
     * Label of this account
     *
     * This allows you to set a readable string for each account.
     *
     * @type {string}
     * @private
     */
    if (options.label !== undefined) {
      this._label = options.label
    } else {
      this._label = null
    }

    /**
     * Deterministic Key Index used to generate this account - null means generated explicitly
     *
     * @type {number}
     * @private
     */
    if (options.index !== undefined) {
      this._index = options.index
    } else {
      this._index = null
    }

    /**
     * Address of this account
     * @type {LogosAddress}
     * @private
     */
    if (options.address !== undefined) {
      this._address = options.address
    } else {
      this._address = null
    }

    /**
     * Public Key of this account
     * @type {Hexadecimal64Length}
     * @private
     */
    if (options.publicKey !== undefined) {
      this._publicKey = options.publicKey
    } else {
      this._publicKey = null
    }

    /**
     * Private Key of this account
     * @type {Hexadecimal64Length}
     * @private
     */
    if (options.privateKey !== undefined) {
      this._privateKey = options.privateKey
    } else {
      this._privateKey = null
    }
    /**
     * Balance of this account in reason
     * @type {string}
     * @private
     */
    if (options.balance !== undefined) {
      this._balance = options.balance
    } else {
      this._balance = '0'
    }

    /**
     * Pending Balance of the account in reason
     *
     * pending balance is balance minus the sends that are pending
     * @type {string}
     * @private
     */
    if (options.pendingBalance !== undefined) {
      this._pendingBalance = options.pendingBalance
    } else {
      this._pendingBalance = '0'
    }

    /**
     * Token Balance of the token account in base unit of tokens
     * @type {TokenBalances}
     * @private
     */
    if (options.tokenBalances !== undefined) {
      this._tokenBalances = options.tokenBalances
    } else {
      this._tokenBalances = {}
    }

    /**
     * Pending Token Balance of the token account in base unit of tokens
     *
     * pending token balance is the token balance minus the token sends that are pending
     * @type {TokenBalances}
     * @private
     */
    if (options.pendingTokenBalances !== undefined) {
      this._pendingTokenBalances = options.pendingTokenBalances
    } else {
      this._pendingTokenBalances = {}
    }

    /**
     * Representative of the account
     * @type {LogosAddress}
     * @private
     */
    if (options.representative !== undefined) {
      this._representative = options.representative
    } else {
      this._representative = null
    }

    /**
     * Chain of the account
     * @type {Request[]}
     * @private
     */
    if (options.chain !== undefined) {
      this._chain = options.chain
    } else {
      this._chain = []
    }

    /**
     * Receive chain of the account
     * @type {Request[]}
     * @private
     */
    if (options.receiveChain !== undefined) {
      this._receiveChain = options.receiveChain
    } else {
      this._receiveChain = []
    }

    /**
     * Pending chain of the account (local unconfirmed sends)
     * @type {Request[]}
     * @private
     */
    if (options.pendingChain !== undefined) {
      this._pendingChain = options.pendingChain
    } else {
      this._pendingChain = []
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
     * Account version of webwallet SDK
     * @type {number}
     * @private
     */
    if (options.version !== undefined) {
      this._version = options.version
    } else {
      this._version = 1
    }

    /**
     * The Wallet this account belongs to
     * @type {Wallet}
     * @private
     */
    if (options.wallet !== undefined) {
      this._wallet = options.wallet
    } else {
      this._wallet = null
    }

    this._synced = false
  }

  /**
   * If the account has been synced with the RPC or if RPC is disabled this is true
   * @type {boolean}
   */
  get synced () {
    return this._synced
  }

  /**
   * The wallet this account belongs to
   * @type {boolean}
   */
  get wallet () {
    return this._wallet
  }

  /**
   * The index of the account
   * @type {number}
   * @readonly
   */
  get index () {
    return this._index
  }

  /**
   * The label of the account
   * @type {string}
   */
  get label () {
    return this._label
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
   * The public key of the account
   * @type {Hexadecimal64Length}
   * @readonly
   */
  get publicKey () {
    return this._publicKey
  }

  /**
   * The private key of the account
   * @type {Hexadecimal64Length}
   * @readonly
   */
  get privateKey () {
    return this._privateKey
  }

  /**
   * The balance of the account in reason
   * @type {string}
   * @readonly
   */
  get balance () {
    return this._balance
  }

  /**
   * The pending balance of the account in reason
   *
   * pending balance is balance minus the sends that are pending
   *
   * @type {string}
   * @readonly
   */
  get pendingBalance () {
    return this._pendingBalance
  }

  /**
   * The balance of the tokens in base token unit
   * @type {TokenBalances}
   * @readonly
   */
  get tokenBalances () {
    return this._tokenBalances
  }

  /**
   * The pending token balance of the account in base token
   *
   * pending token balance is balance minus the token sends that are pending
   *
   * @type {TokenBalances}
   * @readonly
   */
  get pendingTokenBalances () {
    return this._pendingTokenBalances
  }

  /**
   * The representative of the account
   * @type {LogosAddress}
   * @readonly
   */
  get representative () {
    let rep = Utils.officialRepresentative
    if (this._representative) {
      rep = this._representative
    } else {
      // look for a state, change or open request on the chain
      this._pendingChain.forEach(request => {
        if (request.representative) {
          rep = Utils.accountFromHexKey(request.representative)
          this._representative = rep
        }
      })
      // No pending change requests. Scanning previous sends to find rep
      if (!rep) {
        this._chain.forEach(request => {
          if (request.representative) {
            rep = Utils.accountFromHexKey(request.representative)
            this._representative = rep
          }
        })
      }
    }
    return rep
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

  set label (label) {
    this._label = label
  }

  set synced (val) {
    this._synced = val
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
   * @returns {number} sequence of for the next transaction
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
   * Scans the account history using RPC and updates the local chain
   * @returns {Promise<Account>}
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
      if (this.wallet.fullSync) {
        RPC.accounts.history(this.address, -1, true).then((history) => {
          if (history) {
            for (const requestInfo of history) {
              this.addRequest(requestInfo)
            }
            this.updateBalancesFromChain()
            if (this.verifyChain() && this.verifyReceiveChain()) {
              this._synced = true
              resolve(this)
            }
          } else {
            this._synced = true
            console.log(`${this.address} is empty and therefore valid`)
            resolve(this)
          }
        })
      } else {
        RPC.accounts.info(this.address).then(info => {
          if (info && info.frontier && info.frontier !== Utils.GENESIS_HASH) {
            RPC.requests.info(info.frontier).then(val => {
              this.addRequest(val)
              if (info.balance) {
                this._balance = info.balance
                this._pendingBalance = info.balance
              }
              if (info.tokens) {
                for (let pairs of Object.entries(info.tokens)) {
                  info.tokens[pairs[0]] = pairs[1].balance
                }
                this._tokenBalances = info.tokens
                this._pendingTokenBalances = info.tokens
              }
              this._synced = true
              resolve(this)
            })
          } else {
            if (info) {
              if (info.balance) {
                this._balance = info.balance
                this._pendingBalance = info.balance
              }
              if (info.tokens) {
                for (let pairs of Object.entries(info.tokens)) {
                  info.tokens[pairs[0]] = pairs[1].balance
                }
                this._tokenBalances = info.tokens
                this._pendingTokenBalances = info.tokens
              }
            }
            this._synced = true
            console.log(`${this.address} is empty and therefore valid`)
            resolve(this)
          }
        })
      }
    })
  }

  /**
   * Updates the balances of the account by traversing the chain
   * @returns {void}
   */
  updateBalancesFromChain () {
    if (this._chain.length + this._pendingChain.length + this._receiveChain.length === 0) return bigInt(0)
    let sum = bigInt(0)
    let tokenSums = {}
    this._receiveChain.forEach(request => {
      if (request.type === 'send') {
        for (let transaction of request.transactions) {
          if (transaction.destination === this.address) {
            sum = sum.plus(bigInt(transaction.amount))
          }
        }
      } else if (request.type === 'token_send') {
        for (let transaction of request.transactions) {
          if (transaction.destination === this.address) {
            tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).plus(bigInt(transaction.amount)).toString()
          }
        }
      } else if (request.type === 'distribute' || request.type === 'withdraw_fee' || request.type === 'revoke') {
        if (request.transaction.destination === this.address) {
          tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).plus(bigInt(request.transaction.amount)).toString()
        }
        if (request.type === 'revoke' && request.source === this.address) {
          tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).minus(bigInt(request.transaction.amount)).toString()
        }
      }
    })
    this._chain.forEach(request => {
      if (request.type === 'send') {
        sum = sum.minus(bigInt(request.totalAmount)).minus(bigInt(request.fee))
      } else if (request.type === 'token_send') {
        tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).minus(bigInt(request.totalAmount)).minus(bigInt(request.tokenFee)).toString()
        sum = sum.minus(bigInt(request.fee))
      } else if (request.type === 'issuance') {
        sum = sum.minus(bigInt(request.fee))
      }
    })
    this._balance = sum.toString()
    this._tokenBalances = tokenSums
    this._pendingChain.forEach(pendingRequest => {
      if (pendingRequest.type === 'send') {
        sum = sum.minus(bigInt(pendingRequest.totalAmount)).minus(bigInt(pendingRequest.fee))
        for (let transaction of pendingRequest.transactions) {
          if (transaction.destination === this.address) {
            sum = sum.plus(bigInt(transaction.amount))
          }
        }
      } else if (pendingRequest.type === 'token_send') {
        sum = sum.minus(bigInt(pendingRequest.fee))
        tokenSums[pendingRequest.tokenID] = bigInt(tokenSums[pendingRequest.tokenID]).minus(bigInt(pendingRequest.totalAmount)).minus(bigInt(pendingRequest.tokenFee)).toString()
        for (let transaction of pendingRequest.transactions) {
          if (transaction.destination === this.address) {
            tokenSums[pendingRequest.tokenID] = bigInt(tokenSums[pendingRequest.tokenID]).plus(bigInt(transaction.amount)).toString()
          }
        }
      } else if (pendingRequest.type === 'issuance') {
        sum = sum.minus(bigInt(pendingRequest.fee))
      }
    })
    this._pendingBalance = sum.toString()
    this._pendingTokenBalances = tokenSums
  }

  /**
   * Updates the balances of the account by doing math on the previous balance when given a new request
   * Also updates the pending balance based on the new balance and the pending chain
   * @param {Request} request - request that is being calculated on
   * @returns {void}
   */
  updateBalancesFromRequest (request) {
    let sum = bigInt(this._balance)
    let tokenSums = this.tokenBalances
    if (request.type === 'send') {
      if (request.origin === this.address) {
        sum = sum.minus(bigInt(request.totalAmount)).minus(bigInt(request.fee))
      }
      for (let transaction of request.transactions) {
        if (transaction.destination === this.address) {
          sum = sum.plus(bigInt(transaction.amount))
        }
      }
    } else if (request.type === 'token_send') {
      sum = sum.minus(bigInt(request.fee))
      if (request.origin === this.address) {
        tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).minus(bigInt(request.totalAmount)).minus(bigInt(request.tokenFee)).toString()
      }
      for (let transaction of request.transactions) {
        if (transaction.destination === this.address) {
          tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).plus(bigInt(transaction.amount)).toString()
        }
      }
    } else if (request.type === 'issuance') {
      sum = sum.minus(bigInt(request.fee))
    } else if (request.type === 'distribute' || request.type === 'withdraw_fee' || request.type === 'revoke') {
      if (request.transaction.destination === this.address) {
        tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).plus(bigInt(request.transaction.amount)).toString()
      }
      if (request.type === 'revoke' && request.source === this.address) {
        tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).minus(bigInt(request.transaction.amount)).toString()
      }
    }
    this._balance = sum.toString()
    this._tokenBalances = tokenSums
    this._pendingChain.forEach(pendingRequest => {
      if (pendingRequest.type === 'send') {
        sum = sum.minus(bigInt(pendingRequest.totalAmount)).minus(bigInt(pendingRequest.fee))
        for (let transaction of pendingRequest.transactions) {
          if (transaction.destination === this.address) {
            sum = sum.plus(bigInt(transaction.amount))
          }
        }
      } else if (pendingRequest.type === 'token_send') {
        sum = sum.minus(bigInt(pendingRequest.fee))
        tokenSums[pendingRequest.tokenID] = bigInt(tokenSums[pendingRequest.tokenID]).minus(bigInt(pendingRequest.totalAmount)).minus(bigInt(pendingRequest.tokenFee)).toString()
        for (let transaction of pendingRequest.transactions) {
          if (transaction.destination === this.address) {
            tokenSums[pendingRequest.tokenID] = bigInt(tokenSums[pendingRequest.tokenID]).plus(bigInt(transaction.amount)).toString()
          }
        }
      } else if (pendingRequest.type === 'issuance') {
        sum = sum.minus(bigInt(pendingRequest.fee))
      }
    })
    this._pendingBalance = sum.toString()
    this._pendingTokenBalances = tokenSums
  }

  /**
   * Adds a request to the appropriate chain
   *
   * @param {RequestOptions} requestInfo - Request information from the RPC or MQTT
   * @returns {Request}
   */
  addRequest (requestInfo) {
    if (requestInfo.type === 'send' || requestInfo.type === 'token_send') {
      let request = null
      if (requestInfo.type === 'send') {
        request = new Send(requestInfo)
      } else {
        request = new TokenSend(requestInfo)
      }
      // If this request was created by us AND
      // we do not currently have that request THEN
      // add the request to confirmed chain
      if (requestInfo.origin === this.address &&
        !this.getChainRequest(requestInfo.hash)) {
        this._chain.push(request)
      }
      // If the request is a send AND
      // has transactions pointed to us AND
      // we do not currently have that request THEN
      // add the request to the receive chain
      if (requestInfo.transactions && requestInfo.transactions.length > 0) {
        for (let trans of requestInfo.transactions) {
          if (trans.destination === this.address &&
            !this.getRecieveRequest(requestInfo.hash)) {
            this._receiveChain.push(request)
          }
        }
      }
      return request
    } else if (requestInfo.type === 'issuance') {
      let request = new Issuance(requestInfo)
      this._chain.push(request)
      return request
    } else if (requestInfo.type === 'distribute') {
      let request = new Distribute(requestInfo)
      this._receiveChain.push(request)
      return request
    } else if (requestInfo.type === 'withdraw_fee') {
      let request = new WithdrawFee(requestInfo)
      this._receiveChain.push(request)
      return request
    } else if (requestInfo.type === 'revoke') {
      let request = new Revoke(requestInfo)
      this._receiveChain.push(request)
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
    this._pendingTokenBalances = this._tokenBalances
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
   * Creates a request from the specified information
   *
   * @param {Transaction[]} transactions - The account destinations and amounts you wish to send them
   * @throws An exception if the account has not been synced
   * @throws An exception if the pending balance is less than the required amount to do a send
   * @throws An exception if the request is rejected by the RPC
   * @returns {Promise<Request>} the request object
   */
  async createSendRequest (transactions) {
    if (this._synced === false) throw new Error('This account has not been synced or is being synced with the RPC network')
    let request = new Send({
      signature: null,
      work: null,
      previous: this.previous,
      fee: Utils.minimumFee,
      transactions: transactions,
      sequence: this.sequence,
      origin: this.address
    })
    if (bigInt(this._pendingBalance).minus(bigInt(request.totalAmount)).minus(request.fee).lesser(0)) {
      throw new Error('Invalid Request: Not Enough Funds including fee to send that amount')
    }
    request.sign(this._privateKey)
    this._pendingBalance = bigInt(this._pendingBalance).minus(bigInt(request.totalAmount)).minus(request.fee).toString()
    if (request.work === null) {
      if (this.wallet.remoteWork) {
        request.work = Utils.EMPTY_WORK
      } else {
        request.work = await request.createWork(true)
      }
    }
    this._pendingChain.push(request)
    if (this.wallet.rpc) {
      if (this._pendingChain.length === 1) {
        try {
          request.publish(this.wallet.rpc)
          return request
        } catch (error) {
          console.log(error)
        }
      } else {
        return request
      }
    } else {
      return request
    }
  }

  /**
   * Creates a request from the specified information
   *
   * @param {TokenIssuanceOptions} options - The options for the token creation
   * @throws An exception if the account has not been synced
   * @throws An exception if the pending balance is less than the required amount to do a token issuance
   * @throws An exception if the request is rejected by the RPC
   * @returns {Promise<Request>} the request object
   */
  async createTokenIssuanceRequest (options) {
    if (!options.name) throw new Error('You must pass name as a part of the TokenOptions')
    if (!options.symbol) throw new Error('You must pass symbol as a part of the TokenOptions')
    if (this._synced === false) throw new Error('This account has not been synced or is being synced with the RPC network')
    let request = new Issuance({
      signature: null,
      work: null,
      previous: this.previous,
      fee: Utils.minimumFee,
      sequence: this.sequence,
      origin: this.address,
      name: options.name,
      symbol: options.symbol
    })
    if (options.feeType) {
      request.feeType = options.feeType
    }
    if (options.feeRate) {
      request.feeRate = options.feeRate
    }
    if (options.totalSupply) {
      request.totalSupply = options.totalSupply
    }
    if (options.settings) {
      request.settings = options.settings
    }
    if (options.controllers) {
      request.controllers = options.controllers
    }
    if (options.issuerInfo) {
      request.issuerInfo = options.issuerInfo
    }
    if (bigInt(this._pendingBalance).minus(request.fee).lesser(0)) {
      throw new Error('Invalid Request: Not Enough Logos to afford the fee to issue a token')
    }
    request.sign(this._privateKey)
    this._pendingBalance = bigInt(this._pendingBalance).minus(request.fee).toString()
    if (request.work === null) {
      if (this.wallet.remoteWork) {
        request.work = Utils.EMPTY_WORK
      } else {
        request.work = await request.createWork(true)
      }
    }
    this._pendingChain.push(request)
    if (this.wallet.rpc) {
      if (this._pendingChain.length === 1) {
        try {
          await this.wallet.createTokenAccount(Utils.parseAccount(request.tokenID), request)
          await request.publish(this.wallet.rpc)
          return request
        } catch (error) {
          console.log(error)
        }
      } else {
        return request
      }
    } else {
      return request
    }
  }

  /**
   * Gets tokenAccount
   *
   * @param {TokenRequest} options - Object contained the tokenID or tokenAccount
   * @throws An exception if no tokenID or tokenAccount
   * @returns {Promise<TokenAccount>} the token account info object
   */
  async getTokenAccount (token) {
    if (typeof token === 'object') {
      if (token.token_id) token = token.token_id
      if (token.tokenID) token = token.tokenID
      if (token.tokenAccount) token = token.tokenAccount
      if (token.token_account) token = token.token_account
    }
    if (!token || typeof token === 'object') throw new Error('You must pass a token id or token account address for token actions')
    let tokenAccount = await this.wallet.createTokenAccount(Utils.parseAccount(token))
    return tokenAccount
  }

  /**
   * Creates a request from the specified information
   *
   * @param {string} token - The token address or token id
   * @param {Transaction} transactions - The account destinations and amounts you wish to send them
   * @throws An exception if the account has not been synced
   * @throws An exception if the pending balance is less than the required amount to do a send
   * @throws An exception if the request is rejected by the RPC
   * @returns {Promise<Request>} the request object
   */
  async createTokenSendRequest (token, transactions) {
    if (this._synced === false) throw new Error('This account has not been synced or is being synced with the RPC network')
    if (!transactions) throw new Error('You must pass transaction in the token send options')
    if (!token) throw new Error('You must pass token which is either tokenID or tokenAddress')
    let tokenAccount = await this.getTokenAccount(token)
    let request = new TokenSend({
      signature: null,
      work: null,
      previous: this.previous,
      fee: Utils.minimumFee,
      sequence: this.sequence,
      origin: this.address,
      tokenID: tokenAccount.tokenID,
      transactions: transactions
    })
    if (tokenAccount.feeType === 'Flat') {
      request.tokenFee = tokenAccount.feeRate
    } else {
      request.tokenFee = bigInt(request.totalAmount).multiply(bigInt(tokenAccount.feeRate)).divide(100)
    }
    if (bigInt(this._pendingBalance).minus(request.fee).lesser(0)) {
      throw new Error('Invalid Request: Not Enough Logos to pay the logos fee for token sends')
    }
    if (bigInt(this._pendingTokenBalances[tokenAccount.tokenID]).minus(request.totalAmount).minus(request.tokenFee).lesser(0)) {
      throw new Error('Invalid Request: Not Enough Token to pay the Logos fee for token sends')
    }
    request.sign(this._privateKey)
    this._pendingBalance = bigInt(this._pendingBalance).minus(request.fee).toString()
    this._pendingTokenBalances[tokenAccount.tokenID] = bigInt(this._pendingTokenBalances[tokenAccount.tokenID]).minus(bigInt(request.totalAmount)).minus(request.tokenFee).toString()
    if (request.work === null) {
      if (this.wallet.remoteWork) {
        request.work = Utils.EMPTY_WORK
      } else {
        request.work = await request.createWork(true)
      }
    }
    this._pendingChain.push(request)
    if (this.wallet.rpc) {
      if (this._pendingChain.length === 1) {
        try {
          request.publish(this.wallet.rpc)
          return request
        } catch (error) {
          console.log(error)
        }
      } else {
        return request
      }
    } else {
      return request
    }
  }

  /**
   * Creates a IssueAdditional Token Request from the specified information
   *
   * @param {IssueAdditionalOptions} options - The Token ID & amount
   * @throws An exception if the token account balance is less than the required amount to do a issue additional token request
   * @returns {Promise<Request>} the request object
   */
  async createIssueAdditionalRequest (options) {
    let tokenAccount = await this.getTokenAccount(options)
    if (options.amount === undefined) throw new Error('You must pass amount in options')
    let request = new IssueAdditional({
      signature: null,
      work: null,
      previous: tokenAccount.previous,
      fee: Utils.minimumFee,
      sequence: tokenAccount.sequence,
      origin: this.address,
      tokenID: tokenAccount.tokenID,
      amount: options.amount
    })
    request.sign(this._privateKey)
    let result = await tokenAccount.publishRequest(request)
    return result
  }

  /**
   * Creates a ChangeSetting Token Request from the specified information
   *
   * @param {ChangeSettingOptions} options - Token ID, setting, value
   * @throws An exception if the token account balance is less than the required amount to do a change setting token request
   * @returns {Promise<Request>} the request object
   */
  async createChangeSettingRequest (options) {
    let tokenAccount = await this.getTokenAccount(options)
    let request = new ChangeSetting({
      signature: null,
      work: null,
      previous: tokenAccount.previous,
      fee: Utils.minimumFee,
      sequence: tokenAccount.sequence,
      origin: this.address,
      tokenID: tokenAccount.tokenID
    })
    request.setting = options.setting
    request.value = options.value
    request.sign(this._privateKey)
    let result = await tokenAccount.publishRequest(request)
    return result
  }

  /**
   * Creates a ImmuteSetting Token Request from the specified information
   *
   * @param {ImmuteSettingOptions} options - Token ID, setting
   * @throws An exception if the token account balance is less than the required amount to do a immute setting token request
   * @returns {Promise<Request>} the request object
   */
  async createImmuteSettingRequest (options) {
    let tokenAccount = await this.getTokenAccount(options)
    let request = new ImmuteSetting({
      signature: null,
      work: null,
      previous: tokenAccount.previous,
      fee: Utils.minimumFee,
      sequence: tokenAccount.sequence,
      origin: this.address,
      tokenID: tokenAccount.tokenID
    })
    request.setting = options.setting
    request.sign(this._privateKey)
    let result = await tokenAccount.publishRequest(request)
    return result
  }

  /**
   * Creates a Revoke Token Request from the specified information
   *
   * @param {RevokeOptions} options - Token ID, transaction, source
   * @throws An exception if the token account balance is less than the required amount to do a Revoke token request
   * @returns {Promise<Request>} the request object
   */
  async createRevokeRequest (options) {
    let tokenAccount = await this.getTokenAccount(options)
    if (!options.transaction) throw new Error('You must pass transaction in the options')
    if (!options.source) throw new Error('You must source in the options')
    let request = new Revoke({
      signature: null,
      work: null,
      previous: tokenAccount.previous,
      fee: Utils.minimumFee,
      sequence: tokenAccount.sequence,
      origin: this.address,
      tokenID: tokenAccount.tokenID,
      source: options.source,
      transaction: options.transaction
    })
    request.sign(this._privateKey)
    let result = await tokenAccount.publishRequest(request)
    return result
  }

  /**
   * Creates a request from the specified information
   *
   * @param {AdjustUserStatusOptions} options - The Token ID, account, and status
   * @throws An exception if the pending balance is less than the required amount to adjust a users status
   * @returns {Promise<Request>} the request object
   */
  async createAdjustUserStatusRequest (options) {
    let tokenAccount = await this.getTokenAccount(options)
    if (!options.account) throw new Error('You must pass account in options')
    let request = new AdjustUserStatus({
      signature: null,
      work: null,
      previous: tokenAccount.previous,
      fee: Utils.minimumFee,
      sequence: tokenAccount.sequence,
      origin: this.address,
      tokenID: tokenAccount.tokenID,
      account: options.account
    })
    request.status = options.status
    request.sign(this._privateKey)
    let result = await tokenAccount.publishRequest(request)
    return result
  }

  /**
   * Creates a request from the specified information
   *
   * @param {AdjustFeeOptions} options - The Token ID, feeRate, and feeType
   * @throws An exception if the pending balance is less than the required amount to do a token distibution
   * @returns {Promise<Request>} the request object
   */
  async createAdjustFeeRequest (options) {
    let tokenAccount = await this.getTokenAccount(options)
    if (!options.feeRate) throw new Error('You must pass feeRate in options')
    if (!options.feeType) throw new Error('You must pass feeType in options')
    let request = new AdjustFee({
      signature: null,
      work: null,
      previous: tokenAccount.previous,
      fee: Utils.minimumFee,
      sequence: tokenAccount.sequence,
      origin: this.address,
      tokenID: tokenAccount.tokenID,
      feeRate: options.feeRate,
      feeType: options.feeType
    })
    request.sign(this._privateKey)
    let result = await tokenAccount.publishRequest(request)
    return result
  }

  /**
   * Creates a request from the specified information
   *
   * @param {UpdateIssuerInfoOptions} options - The Token ID and issuerInfo
   * @throws An exception if the pending balance is less than the required amount to Update Issuer Info
   * @returns {Promise<Request>} the request object
   */
  async createUpdateIssuerInfoRequest (options) {
    let tokenAccount = await this.getTokenAccount(options)
    if (!options.issuerInfo) throw new Error('You must pass issuerInfo in the options')
    let request = new UpdateIssuerInfo({
      signature: null,
      work: null,
      previous: tokenAccount.previous,
      fee: Utils.minimumFee,
      sequence: tokenAccount.sequence,
      origin: this.address,
      tokenID: tokenAccount.tokenID
    })
    request.issuerInfo = options.issuerInfo
    request.sign(this._privateKey)
    let result = await tokenAccount.publishRequest(request)
    return result
  }

  /**
   * Creates a request from the specified information
   *
   * @param {UpdateControllerOptions} options - The Token ID, action ('add' or 'remove'), and controller
   * @throws An exception if the pending balance is less than the required amount to Update Controller
   * @returns {Promise<Request>} the request object
   */
  async createUpdateControllerRequest (options) {
    let tokenAccount = await this.getTokenAccount(options)
    if (!options.controller) throw new Error('You must pass controller in the options')
    if (!options.action) throw new Error('You must pass action in the options')
    let request = new UpdateController({
      signature: null,
      work: null,
      previous: tokenAccount.previous,
      fee: Utils.minimumFee,
      sequence: tokenAccount.sequence,
      origin: this.address,
      tokenID: tokenAccount.tokenID,
      controller: options.controller
    })
    request.action = options.action
    request.sign(this._privateKey)
    let result = await tokenAccount.publishRequest(request)
    return result
  }

  /**
   * Creates a Burn Token Request from the specified information
   *
   * @param {BurnOptions} options - The Token ID & amount
   * @throws An exception if the token account balance is less than the required amount to do a burn token request
   * @returns {Promise<Request>} the request object
   */
  async createBurnRequest (options) {
    let tokenAccount = await this.getTokenAccount(options)
    if (options.amount === undefined) throw new Error('You must pass amount in options')
    let request = new Burn({
      signature: null,
      work: null,
      previous: tokenAccount.previous,
      fee: Utils.minimumFee,
      sequence: tokenAccount.sequence,
      origin: this.address,
      tokenID: tokenAccount.tokenID,
      amount: options.amount
    })
    request.sign(this._privateKey)
    let result = await tokenAccount.publishRequest(request)
    return result
  }

  /**
   * Creates a request from the specified information
   *
   * @param {TokenDistributeOptions} options - The Token ID & transaction
   * @throws An exception if the pending balance is less than the required amount to do a token distibution
   * @returns {Promise<Request>} the request object
   */
  async createDistributeRequest (options) {
    let tokenAccount = await this.getTokenAccount(options)
    if (!options.transaction) throw new Error('You must pass transaction in options')
    let request = new Distribute({
      signature: null,
      work: null,
      previous: tokenAccount.previous,
      fee: Utils.minimumFee,
      sequence: tokenAccount.sequence,
      origin: this.address,
      tokenID: tokenAccount.tokenID,
      transaction: options.transaction
    })
    request.sign(this._privateKey)
    let result = await tokenAccount.publishRequest(request)
    return result
  }

  /**
   * Creates a request from the specified information
   *
   * @param {WithdrawFeeOptions} options - The Token ID & transaction
   * @throws An exception if the pending balance is less than the required amount to do a withdraw fee request
   * @returns {Promise<Request>} the request object
   */
  async createWithdrawFeeRequest (options) {
    let tokenAccount = await this.getTokenAccount(options)
    if (!options.transaction) throw new Error('You must pass transaction in options')
    let request = new WithdrawFee({
      signature: null,
      work: null,
      previous: tokenAccount.previous,
      fee: Utils.minimumFee,
      sequence: tokenAccount.sequence,
      origin: this.address,
      tokenID: tokenAccount.tokenID,
      transaction: options.transaction
    })
    request.sign(this._privateKey)
    let result = await tokenAccount.publishRequest(request)
    return result
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
    // Confirm the requests we authored and add move the request to the confirmed chain
    if (requestInfo.origin === this.address &&
      (requestInfo.type === 'send' ||
      requestInfo.type === 'token_send' ||
      requestInfo.type === 'issuance')) {
      let request = this.getPendingRequest(requestInfo.hash)
      if (request) {
        this._chain.push(request)
        this.removePendingRequest(requestInfo.hash)
        if (this.wallet.fullSync) {
          this.updateBalancesFromChain()
        } else {
          this.updateBalancesFromRequest(request)
        }
        // Publish the next request in the pending as the previous request has been confirmed
        if (this.wallet.rpc && this._pendingChain.length > 0) {
          if (this._pendingChain.length > 1 &&
            (this._pendingChain[0].type === 'send' || this._pendingChain[0].type === 'token_send') &&
            this._pendingChain[0].transactions.length < 8) {
            // Combine if there are two of more pending transactions and the
            // Next transaction is a send with less than 8 transactions
            if (this.wallet.batchSends) {
              this.combineRequests(this.wallet.rpc)
            } else {
              this._pendingChain[0].publish(this.wallet.rpc)
            }
          } else {
            this._pendingChain[0].publish(this.wallet.rpc)
          }
        }
      } else {
        console.log('Someone is sending blocks from this account that is not us!!!')
        // Add new request to chain
        let request = this.addRequest(requestInfo)

        // Remove all pendings as they are now invalidated
        this.removePendingRequests()

        // Update balance for new block
        if (this.wallet.fullSync) {
          this.updateBalancesFromChain()
        } else {
          this.updateBalancesFromRequest(request)
        }
      }
    }

    // Handle Receives
    let request = this.addRequest(requestInfo)
    if (request) {
      if (!request.verify()) throw new Error('Invalid Logos Request!')
      if (this.wallet.fullSync) {
        this.updateBalancesFromChain()
      } else if (requestInfo.origin !== this.address || requestInfo.tokenID) {
        this.updateBalancesFromRequest(request)
      }
    }
  }

  /**
   * Batchs send requests
   *
   * @returns {Promise<void>}
   */
  async combineRequests () {
    let sendCounter = 0
    let tokenCounter = 0
    let logosTransactionsToCombine = [
      []
    ]
    let issuances = []
    let tokenTransactionsToCombine = new Map()
    for (let request of this._pendingChain) {
      if (request.type === 'send') {
        for (let transaction of request.transactions) {
          if (logosTransactionsToCombine[sendCounter].length < 8) {
            logosTransactionsToCombine[sendCounter].push(transaction)
          } else {
            sendCounter++
            logosTransactionsToCombine[sendCounter] = [transaction]
          }
        }
      } else if (request.type === 'token_send') {
        let tokenAggregates = [[]]
        if (tokenTransactionsToCombine.has(request.tokenID)) {
          tokenAggregates = tokenTransactionsToCombine.get(request.tokenID)
        }
        for (let transaction of request.transactions) {
          if (tokenAggregates[tokenCounter].length < 8) {
            tokenAggregates[tokenCounter].push(transaction)
          } else {
            tokenCounter++
            tokenAggregates[tokenCounter] = [transaction]
          }
        }
        tokenTransactionsToCombine.set(request.tokenID, tokenAggregates)
      } else if (request.type === 'issuance') {
        issuances.push(request)
      }
    }

    // Clear Receive Chain
    this.removePendingRequests()

    // Add Token Sends
    for (let [tokenID, tokenTransactions] of tokenTransactionsToCombine) {
      const tokenPromises = tokenTransactions.map(transactions => this.createTokenSendRequest(tokenID, transactions))
      await Promise.all(tokenPromises)
    }

    // Normal Sends
    const sendPromises = logosTransactionsToCombine.map(transactions => {
      if (transactions.length > 0) this.createSendRequest(transactions)
    })
    await Promise.all(sendPromises)

    // Add Issuances
    if (issuances.length > 0) {
      for (let issuance of issuances) {
        issuance.previous = this.previous
        issuance.sequence = this.sequence
        issuance.sign(this._privateKey)
        this._pendingChain.push(issuance)
      }
      if (this.wallet.rpc && this._pendingChain.length === 1) {
        this._pendingChain[0].publish(this.wallet.rpc)
      }
    }
  }

  /**
   * Adds a receive request to the local chain
   *
   * @param {MQTTRequestOptions} request The mqtt request options
   * @returns {Request | boolean} request if it is valid
   */
  addReceiveRequest (request) {
    let receive = new Send({
      signature: request.signature,
      work: request.work,
      transactions: request.transactions,
      sequence: request.sequence,
      previous: request.previous,
      fee: request.fee,
      origin: request.origin
    })
    if (receive.verify()) {
      this._receiveChain.push(receive)
      if (this.wallet.fullSync) {
        this.updateBalancesFromChain()
      } else {
        this.updateBalancesFromRequest(receive)
      }
      return receive
    } else {
      return false
    }
  }
}

module.exports = Account
