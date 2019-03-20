const Utils = require('./Utils')
const bigInt = require('big-integer')
const Logos = require('@logosnetwork/logos-rpc-client')

/**
 * TokenAccount contain the keys, chains, and balances.
 */
class TokenAccount {
  constructor (options = {
    token_id: null,
    token_address: null,
    token_balance: null,
    total_supply: null,
    token_fee_balance: null,
    symbol: null,
    name: null,
    issuer_info: null,
    fee_rate: null,
    fee_type: null,
    controllers: [],
    settings: {},
    sequence: null,
    frontier: null,
    balance: null
  }) {
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
    if (this._previous !== null) {
      return this._previous
    } else {
      if (this._pendingChain.length > 0) {
        this._previous = this._pendingChain[this.pendingChain.length - 1].hash
      } else if (this._chain.length > 0) {
        this._previous = this._chain[this._chain.length - 1].hash
      } else {
        this._previous = Utils.GENESIS_HASH
      }
      return this._previous
    }
  }

  /**
   * Return the sequence value
   * @type {number}
   * @returns {number} sequence of the previous transaction
   * @readonly
   */
  get sequence () {
    if (this._sequence !== null) {
      return this._sequence
    } else {
      if (this._pendingChain.length > 0) {
        this._sequence = this._pendingChain[this.pendingChain.length - 1].sequence
      } else if (this._chain.length > 0) {
        this._sequence = this._chain[this._chain.length - 1].sequence
      } else {
        this._sequence = -1
      }
      return parseInt(this._sequence)
    }
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
        RPC.accounts.history(this._address, -1, true).then((history) => {
          if (history) {
            for (const requestInfo of history) {
              this.addRequest(requestInfo)
            }
            this.updateBalancesFromChain()
            this._sequence = null
            this._previous = null
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
        RPC.accounts.info(this._address).then(info => {
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
              this._sequence = null
              this._previous = null
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
            this._sequence = null
            this._previous = null
            this._synced = true
            console.log(`${this._address} is empty and therefore valid`)
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
          if (transaction.destination === this._address) {
            sum = sum.plus(bigInt(transaction.amount))
          }
        }
      } else if (request.type === 'token_send') {
        for (let transaction of request.transactions) {
          if (transaction.destination === this._address) {
            tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).plus(bigInt(transaction.amount))
          }
        }
      } else if (request.type === 'distribute' || request.type === 'withdraw_fee' || request.type === 'revoke') {
        if (request.transaction.destination === this._address) {
          tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).plus(bigInt(request.transaction.amount))
        }
      }
    })
    this._chain.forEach(request => {
      if (request.type === 'send') {
        sum = sum.minus(bigInt(request.totalAmount)).minus(bigInt(request.fee))
      } else if (request.type === 'token_send') {
        tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).minus(bigInt(request.totalAmount)).minus(bigInt(request.tokenFee))
        sum = sum.minus(bigInt(request.fee))
      } else if (request.type === 'issuance') {
        sum = sum.minus(bigInt(request.fee))
      } else if (request.type === 'revoke') {
        tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).minus(bigInt(request.transaction.amount))
      }
    })
    this._balance = sum.toString()
    this._tokenBalances = tokenSums
    this._pendingChain.forEach(pendingRequest => {
      if (pendingRequest.type === 'send') {
        sum = sum.minus(bigInt(pendingRequest.totalAmount)).minus(bigInt(pendingRequest.fee))
        for (let transaction of pendingRequest.transactions) {
          if (transaction.destination === this._address) {
            sum = sum.plus(bigInt(transaction.amount))
          }
        }
      } else if (pendingRequest.type === 'token_send') {
        sum = sum.minus(bigInt(pendingRequest.fee))
        tokenSums[pendingRequest.tokenID] = tokenSums[pendingRequest.tokenID].minus(bigInt(pendingRequest.totalAmount)).minus(bigInt(pendingRequest.tokenFee))
        for (let transaction of pendingRequest.transactions) {
          if (transaction.destination === this._address) {
            tokenSums[pendingRequest.tokenID] = tokenSums[pendingRequest.tokenID].plus(bigInt(transaction.amount))
          }
        }
      } else {
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
    let tokenSums = {}
    if (request.type === 'send') {
      if (request.origin === this._address) {
        sum = sum.minus(bigInt(request.totalAmount)).minus(bigInt(request.fee))
      }
      for (let transaction of request.transactions) {
        if (transaction.destination === this._address) {
          sum = sum.plus(bigInt(transaction.amount))
        }
      }
    } else if (request.type === 'token_send') {
      sum = sum.minus(bigInt(request.fee))
      if (request.origin === this._address) {
        tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).minus(bigInt(request.totalAmount)).minus(bigInt(request.tokenFee))
      }
      for (let transaction of request.transactions) {
        if (transaction.destination === this._address) {
          tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).plus(bigInt(transaction.amount))
        }
      }
    } else {
      sum = sum.minus(bigInt(request.fee))
    }
    this._balance = sum.toString()
    this._tokenBalances = tokenSums
    this._pendingChain.forEach(pendingRequest => {
      if (pendingRequest.type === 'send') {
        sum = sum.minus(bigInt(pendingRequest.totalAmount)).minus(bigInt(pendingRequest.fee))
        for (let transaction of pendingRequest.transactions) {
          if (transaction.destination === this._address) {
            sum = sum.plus(bigInt(transaction.amount))
          }
        }
      } else if (pendingRequest.type === 'token_send') {
        sum = sum.minus(bigInt(pendingRequest.fee))
        if (request.origin === this._address) {
          tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).minus(bigInt(request.totalAmount)).minus(bigInt(request.tokenFee))
        }
        for (let transaction of request.transactions) {
          if (transaction.destination === this._address) {
            tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).plus(bigInt(transaction.amount))
          }
        }
      } else {
        sum = sum.minus(bigInt(pendingRequest.fee))
      }
    })
    this._pendingTokenBalances = tokenSums
    this._pendingBalance = sum.toString()
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
      if (requestInfo.origin === this._address &&
        !this.getChainRequest(requestInfo.hash)) {
        this._chain.push(request)
      }
      // If the request is a send AND
      // has transactions pointed to us AND
      // we do not currently have that request THEN
      // add the request to the receive chain
      if (requestInfo.transactions && requestInfo.transactions.length > 0) {
        for (let trans of requestInfo.transactions) {
          if (trans.destination === this._address &&
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
      if (request.source === this._address) {
        this._chain.push(request)
      }
      if (request.transaction.destination === this._address) {
        this._receiveChain.push(request)
      }
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
      sequence: this.sequence + 1,
      origin: this._address
    })
    if (bigInt(this._pendingBalance).minus(bigInt(request.totalAmount)).minus(request.fee).lesser(0)) {
      throw new Error('Invalid Request: Not Enough Funds including fee to send that amount')
    }
    request.sign(this._privateKey)
    this._previous = request.hash
    this._sequence = request.sequence
    this._pendingBalance = bigInt(this._pendingBalance).minus(bigInt(request.totalAmount)).minus(request.fee).toString()
    if (request.work === null) {
      if (this.wallet.remoteWork) {
        request.work = Utils.EMPTY_WORK
      } else {
        request.work = await request.createWork(true)
      }
    }
    this._pendingChain.push(request)
    console.log(request.toJSON(true))
    if (this.wallet.rpc) {
      if (this._pendingChain.length === 1) {
        let response = await request.publish(this.wallet.rpc)
        console.log(response)
        if (response.hash) {
          return request
        } else {
          throw new Error(`Invalid Request: Rejected by Logos Node \n ${JSON.stringify(response)}`)
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
      sequence: this.sequence + 1,
      origin: this._address,
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
    this._previous = request.hash
    this._sequence = request.sequence
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
          console.log(request.toJSON(true))
          let response = await request.publish(this.wallet.rpc)
          console.log(response)
          if (response.hash) {
            return request
          } else {
            throw new Error(`Invalid Request: Rejected by Logos Node \n ${JSON.stringify(response)}`)
          }
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
   * Gets tokenAccount info from the rpc
   *
   * @param {TokenRequest} options - Object contained the tokenID or tokenAccount
   * @throws An exception if no RPC
   * @throws An exception if no tokenID or tokenAccount
   * @returns {Promise<TokenAccountInfo>} the token account info object
   */
  async tokenAccountInfo (options) {
    if (!this.wallet.rpc) throw new Error('You must have RPC enabled to perform token account requests')
    if (!options.tokenID && !options.token_id && !options.token_account && !options.tokenAccount) throw new Error('You must pass tokenID, token_id, token_account, or tokenAccount in options')
    let tokenAccount = null
    if (options.token_account) tokenAccount = options.token_account
    if (options.tokenAccount) tokenAccount = options.tokenAccount
    if (options.token_id) tokenAccount = Utils.accountFromHexKey(options.token_id)
    if (options.tokenID) tokenAccount = Utils.accountFromHexKey(options.tokenID)
    if (this._tokens && this._tokens[tokenAccount]) {
      return {
        info: this._tokens[tokenAccount],
        publicKey: Utils.keyFromAccount(tokenAccount)
      }
    } else {
      const RPC = new Logos({
        url: `http://${this.wallet.rpc.delegates[0]}:55000`,
        proxyURL: this.wallet.rpc.proxy
      })
      let tokenAccountInfo = await RPC.accounts.info(tokenAccount)
      tokenAccountInfo.address = tokenAccount
      this._tokens[tokenAccount] = tokenAccountInfo
      return {
        info: tokenAccountInfo,
        publicKey: Utils.keyFromAccount(tokenAccount)
      }
    }
  }

  /**
   * Creates a request from the specified information
   *
   * @param {TokenSendOptions} options - The account destinations and amounts you wish to send them
   * @throws An exception if the account has not been synced
   * @throws An exception if the pending balance is less than the required amount to do a send
   * @throws An exception if the request is rejected by the RPC
   * @returns {Promise<Request>} the request object
   */
  async createTokenSendRequest (options) {
    if (this._synced === false) throw new Error('This account has not been synced or is being synced with the RPC network')
    if (!options.transactions) throw new Error('You must pass transaction in the token send options')
    let tokenAccount = await this.tokenAccountInfo(options)
    let request = new TokenSend({
      signature: null,
      work: null,
      previous: this.previous,
      fee: Utils.minimumFee,
      sequence: this.sequence + 1,
      origin: this._address,
      tokenID: tokenAccount.publicKey,
      transactions: options.transactions
    })
    if (options.tokenFee) {
      request.tokenFee = options.tokenFee
    } else {
      if (tokenAccount.info.fee_type === 'Flat') {
        request.tokenFee = tokenAccount.info.fee_rate
      } else {
        request.tokenFee = bigInt(request.totalAmount).multiply(bigInt(tokenAccount.info.fee_rate).divide(100))
      }
    }
    if (bigInt(this._pendingBalance).minus(request.fee).lesser(0)) {
      throw new Error('Invalid Request: Not Enough Logos to pay the logos fee for token sends')
    }
    if (bigInt(this._pendingTokenBalances[tokenAccount.publicKey]).minus(request.totalAmount).minus(request.tokenFee).lesser(0)) {
      throw new Error('Invalid Request: Not Enough Token to pay the Logos fee for token sends')
    }
    request.sign(this._privateKey)
    this._previous = request.hash
    this._sequence = request.sequence
    this._pendingBalance = bigInt(this._pendingBalance).minus(request.fee).toString()
    this._pendingTokenBalances[tokenAccount.publicKey] = bigInt(this._pendingTokenBalances[tokenAccount.publicKey]).minus(bigInt(request.totalAmount)).minus(request.tokenFee).toString()
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
        console.log(request.toJSON(true))
        let response = await request.publish(this.wallet.rpc)
        console.log(response)
        if (response.hash) {
          return request
        } else {
          throw new Error(`Invalid Request: Rejected by Logos Node \n ${JSON.stringify(response)}`)
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
    let tokenAccount = await this.tokenAccountInfo(options)
    if (options.amount === undefined) throw new Error('You must pass amount in options')
    let request = new IssueAdditional({
      signature: null,
      work: null,
      previous: tokenAccount.info.frontier,
      fee: Utils.minimumFee,
      sequence: tokenAccount.info.sequence,
      origin: this._address,
      tokenID: tokenAccount.publicKey,
      amount: options.amount
    })
    if (bigInt(tokenAccount.info.balance).minus(request.fee).lesser(0)) {
      throw new Error('Invalid Request: Token Account does not have enough Logos to afford the fee to issue additional tokens')
    }
    request.sign(this._privateKey)
    if (request.work === null) {
      if (this.wallet.remoteWork) {
        request.work = Utils.EMPTY_WORK
      } else {
        request.work = await request.createWork(true)
      }
    }
    console.log(request.toJSON(true))
    let response = await request.publish(this.wallet.rpc)
    console.log(response)
    if (response.hash) {
      return request
    } else {
      throw new Error(`Invalid Request: Rejected by Logos Node \n ${JSON.stringify(response)}`)
    }
  }

  /**
   * Creates a ChangeSetting Token Request from the specified information
   *
   * @param {ChangeSettingOptions} options - Token ID, setting, value
   * @throws An exception if the token account balance is less than the required amount to do a change setting token request
   * @returns {Promise<Request>} the request object
   */
  async createChangeSettingRequest (options) {
    let tokenAccount = await this.tokenAccountInfo(options)
    let request = new ChangeSetting({
      signature: null,
      work: null,
      previous: tokenAccount.info.frontier,
      fee: Utils.minimumFee,
      sequence: tokenAccount.info.sequence,
      origin: this._address,
      tokenID: tokenAccount.publicKey
    })
    request.setting = options.setting
    request.value = options.value
    if (bigInt(tokenAccount.info.balance).minus(request.fee).lesser(0)) {
      throw new Error('Invalid Request: Token Account does not have enough Logos to afford the fee to change the token settings')
    }
    request.sign(this._privateKey)
    if (request.work === null) {
      if (this.wallet.remoteWork) {
        request.work = Utils.EMPTY_WORK
      } else {
        request.work = await request.createWork(true)
      }
    }
    console.log(request.toJSON(true))
    let response = await request.publish(this.wallet.rpc)
    console.log(response)
    if (response.hash) {
      return request
    } else {
      throw new Error(`Invalid Request: Rejected by Logos Node \n ${JSON.stringify(response)}`)
    }
  }

  /**
   * Creates a ImmuteSetting Token Request from the specified information
   *
   * @param {ImmuteSettingOptions} options - Token ID, setting
   * @throws An exception if the token account balance is less than the required amount to do a immute setting token request
   * @returns {Promise<Request>} the request object
   */
  async createImmuteSettingRequest (options) {
    let tokenAccount = await this.tokenAccountInfo(options)
    let request = new ImmuteSetting({
      signature: null,
      work: null,
      previous: tokenAccount.info.frontier,
      fee: Utils.minimumFee,
      sequence: tokenAccount.info.sequence,
      origin: this._address,
      tokenID: tokenAccount.publicKey
    })
    request.setting = options.setting
    if (bigInt(tokenAccount.info.balance).minus(request.fee).lesser(0)) {
      throw new Error('Invalid Request: Token Account does not have enough Logos to afford the fee to immute setting')
    }
    request.sign(this._privateKey)
    if (request.work === null) {
      if (this.wallet.remoteWork) {
        request.work = Utils.EMPTY_WORK
      } else {
        request.work = await request.createWork(true)
      }
    }
    console.log(request.toJSON(true))
    let response = await request.publish(this.wallet.rpc)
    console.log(response)
    if (response.hash) {
      return request
    } else {
      throw new Error(`Invalid Request: Rejected by Logos Node \n ${JSON.stringify(response)}`)
    }
  }

  /**
   * Creates a Revoke Token Request from the specified information
   *
   * @param {RevokeOptions} options - Token ID, transaction, source
   * @throws An exception if the token account balance is less than the required amount to do a Revoke token request
   * @returns {Promise<Request>} the request object
   */
  async createRevokeRequest (options) {
    let tokenAccount = await this.tokenAccountInfo(options)
    if (!options.transaction) throw new Error('You must pass transaction in the options')
    if (!options.source) throw new Error('You must source in the options')
    let request = new Revoke({
      signature: null,
      work: null,
      previous: tokenAccount.info.frontier,
      fee: Utils.minimumFee,
      sequence: tokenAccount.info.sequence,
      origin: this._address,
      tokenID: tokenAccount.publicKey,
      source: options.source,
      transaction: options.transaction
    })
    if (bigInt(tokenAccount.info.balance).minus(request.fee).lesser(0)) {
      throw new Error('Invalid Request: Token Account does not have enough Logos to afford the fee to revoke tokens')
    }
    request.sign(this._privateKey)
    if (request.work === null) {
      if (this.wallet.remoteWork) {
        request.work = Utils.EMPTY_WORK
      } else {
        request.work = await request.createWork(true)
      }
    }
    console.log(request.toJSON(true))
    let response = await request.publish(this.wallet.rpc)
    console.log(response)
    if (response.hash) {
      return request
    } else {
      throw new Error(`Invalid Request: Rejected by Logos Node \n ${JSON.stringify(response)}`)
    }
  }

  /**
   * Creates a request from the specified information
   *
   * @param {AdjustUserStatusOptions} options - The Token ID, account, and status
   * @throws An exception if the pending balance is less than the required amount to adjust a users status
   * @returns {Promise<Request>} the request object
   */
  async createAdjustUserStatusRequest (options) {
    let tokenAccount = await this.tokenAccountInfo(options)
    if (!options.account) throw new Error('You must pass account in options')
    let request = new AdjustUserStatus({
      signature: null,
      work: null,
      previous: tokenAccount.info.frontier,
      fee: Utils.minimumFee,
      sequence: tokenAccount.info.sequence,
      origin: this._address,
      tokenID: tokenAccount.publicKey,
      account: options.account
    })
    request.status = options.status
    if (bigInt(tokenAccount.info.balance).minus(request.fee).lesser(0)) {
      throw new Error('Invalid Request: Token Account does not have enough Logos to afford the fee to adjust that users status')
    }
    request.sign(this._privateKey)
    if (request.work === null) {
      if (this.wallet.remoteWork) {
        request.work = Utils.EMPTY_WORK
      } else {
        request.work = await request.createWork(true)
      }
    }
    console.log(request.toJSON(true))
    let response = await request.publish(this.wallet.rpc)
    console.log(response)
    if (response.hash) {
      return request
    } else {
      throw new Error(`Invalid Request: Rejected by Logos Node \n ${JSON.stringify(response)}`)
    }
  }

  /**
   * Creates a request from the specified information
   *
   * @param {AdjustFeeOptions} options - The Token ID, feeRate, and feeType
   * @throws An exception if the pending balance is less than the required amount to do a token distibution
   * @returns {Promise<Request>} the request object
   */
  async createAdjustFeeRequest (options) {
    let tokenAccount = await this.tokenAccountInfo(options)
    if (!options.feeRate) throw new Error('You must pass feeRate in options')
    if (!options.feeType) throw new Error('You must pass feeType in options')
    let request = new AdjustFee({
      signature: null,
      work: null,
      previous: tokenAccount.info.frontier,
      fee: Utils.minimumFee,
      sequence: tokenAccount.info.sequence,
      origin: this._address,
      tokenID: tokenAccount.publicKey,
      feeRate: options.feeRate,
      feeType: options.feeType
    })
    if (bigInt(tokenAccount.info.balance).minus(request.fee).lesser(0)) {
      throw new Error('Invalid Request: Token Account does not have enough Logos to afford the fee to distribute tokens')
    }
    request.sign(this._privateKey)
    if (request.work === null) {
      if (this.wallet.remoteWork) {
        request.work = Utils.EMPTY_WORK
      } else {
        request.work = await request.createWork(true)
      }
    }
    console.log(request.toJSON(true))
    let response = await request.publish(this.wallet.rpc)
    console.log(response)
    if (response.hash) {
      return request
    } else {
      throw new Error(`Invalid Request: Rejected by Logos Node \n ${JSON.stringify(response)}`)
    }
  }

  /**
   * Creates a request from the specified information
   *
   * @param {UpdateIssuerInfoOptions} options - The Token ID and issuerInfo
   * @throws An exception if the pending balance is less than the required amount to Update Issuer Info
   * @returns {Promise<Request>} the request object
   */
  async createUpdateIssuerInfoRequest (options) {
    let tokenAccount = await this.tokenAccountInfo(options)
    if (!options.issuerInfo) throw new Error('You must pass issuerInfo in the options')
    let request = new UpdateIssuerInfo({
      signature: null,
      work: null,
      previous: tokenAccount.info.frontier,
      fee: Utils.minimumFee,
      sequence: tokenAccount.info.sequence,
      origin: this._address,
      tokenID: tokenAccount.publicKey
    })
    request.issuerInfo = options.issuerInfo
    if (bigInt(tokenAccount.info.balance).minus(request.fee).lesser(0)) {
      throw new Error('Invalid Request: Token Account does not have enough Logos to afford the fee to update issuer info')
    }
    request.sign(this._privateKey)
    if (request.work === null) {
      if (this.wallet.remoteWork) {
        request.work = Utils.EMPTY_WORK
      } else {
        request.work = await request.createWork(true)
      }
    }
    console.log(request.toJSON(true))
    let response = await request.publish(this.wallet.rpc)
    console.log(response)
    if (response.hash) {
      return request
    } else {
      throw new Error(`Invalid Request: Rejected by Logos Node \n ${JSON.stringify(response)}`)
    }
  }

  /**
   * Creates a request from the specified information
   *
   * @param {UpdateControllerOptions} options - The Token ID, action ('add' or 'remove'), and controller
   * @throws An exception if the pending balance is less than the required amount to Update Controller
   * @returns {Promise<Request>} the request object
   */
  async createUpdateControllerRequest (options) {
    let tokenAccount = await this.tokenAccountInfo(options)
    if (!options.controller) throw new Error('You must pass controller in the options')
    if (!options.action) throw new Error('You must pass action in the options')
    let request = new UpdateController({
      signature: null,
      work: null,
      previous: tokenAccount.info.frontier,
      fee: Utils.minimumFee,
      sequence: tokenAccount.info.sequence,
      origin: this._address,
      tokenID: tokenAccount.publicKey,
      controller: options.controller
    })
    request.action = options.action
    if (bigInt(tokenAccount.info.balance).minus(request.fee).lesser(0)) {
      throw new Error('Invalid Request: Token Account does not have enough Logos to afford the fee to update controller')
    }
    request.sign(this._privateKey)
    if (request.work === null) {
      if (this.wallet.remoteWork) {
        request.work = Utils.EMPTY_WORK
      } else {
        request.work = await request.createWork(true)
      }
    }
    console.log(request.toJSON(true))
    let response = await request.publish(this.wallet.rpc)
    console.log(response)
    if (response.hash) {
      return request
    } else {
      throw new Error(`Invalid Request: Rejected by Logos Node \n ${JSON.stringify(response)}`)
    }
  }

  /**
   * Creates a Burn Token Request from the specified information
   *
   * @param {BurnOptions} options - The Token ID & amount
   * @throws An exception if the token account balance is less than the required amount to do a burn token request
   * @returns {Promise<Request>} the request object
   */
  async createBurnRequest (options) {
    let tokenAccount = await this.tokenAccountInfo(options)
    if (options.amount === undefined) throw new Error('You must pass amount in options')
    let request = new Burn({
      signature: null,
      work: null,
      previous: tokenAccount.info.frontier,
      fee: Utils.minimumFee,
      sequence: tokenAccount.info.sequence,
      origin: this._address,
      tokenID: tokenAccount.publicKey,
      amount: options.amount
    })
    if (bigInt(tokenAccount.info.balance).minus(request.fee).lesser(0)) {
      throw new Error('Invalid Request: Token Account does not have enough Logos to afford the fee to burn tokens')
    }
    request.sign(this._privateKey)
    if (request.work === null) {
      if (this.wallet.remoteWork) {
        request.work = Utils.EMPTY_WORK
      } else {
        request.work = await request.createWork(true)
      }
    }
    console.log(request.toJSON(true))
    let response = await request.publish(this.wallet.rpc)
    console.log(response)
    if (response.hash) {
      return request
    } else {
      throw new Error(`Invalid Request: Rejected by Logos Node \n ${JSON.stringify(response)}`)
    }
  }

  /**
   * Creates a request from the specified information
   *
   * @param {TokenDistributeOptions} options - The Token ID & transaction
   * @throws An exception if the pending balance is less than the required amount to do a token distibution
   * @returns {Promise<Request>} the request object
   */
  async createDistributeRequest (options) {
    let tokenAccount = await this.tokenAccountInfo(options)
    if (!options.transaction) throw new Error('You must pass transaction in options')
    let request = new Distribute({
      signature: null,
      work: null,
      previous: tokenAccount.info.frontier,
      fee: Utils.minimumFee,
      sequence: tokenAccount.info.sequence,
      origin: this._address,
      tokenID: tokenAccount.publicKey,
      transaction: options.transaction
    })
    if (bigInt(tokenAccount.info.balance).minus(request.fee).lesser(0)) {
      throw new Error('Invalid Request: Token Account does not have enough Logos to afford the fee to distribute tokens')
    }
    request.sign(this._privateKey)
    if (request.work === null) {
      if (this.wallet.remoteWork) {
        request.work = Utils.EMPTY_WORK
      } else {
        request.work = await request.createWork(true)
      }
    }
    console.log(request.toJSON(true))
    let response = await request.publish(this.wallet.rpc)
    console.log(response)
    if (response.hash) {
      return request
    } else {
      throw new Error(`Invalid Request: Rejected by Logos Node \n ${JSON.stringify(response)}`)
    }
  }

  /**
   * Creates a request from the specified information
   *
   * @param {WithdrawFeeOptions} options - The Token ID & transaction
   * @throws An exception if the pending balance is less than the required amount to do a withdraw fee request
   * @returns {Promise<Request>} the request object
   */
  async createWithdrawFeeRequest (options) {
    let tokenAccount = await this.tokenAccountInfo(options)
    if (!options.transaction) throw new Error('You must pass transaction in options')
    let request = new WithdrawFee({
      signature: null,
      work: null,
      previous: tokenAccount.info.frontier,
      fee: Utils.minimumFee,
      sequence: tokenAccount.info.sequence,
      origin: this._address,
      tokenID: tokenAccount.publicKey,
      transaction: options.transaction
    })
    if (bigInt(tokenAccount.info.balance).minus(request.fee).lesser(0)) {
      throw new Error('Invalid Request: Token Account does not have enough Logos to afford the fee to withdraw the token fees')
    }
    request.sign(this._privateKey)
    if (request.work === null) {
      if (this.wallet.remoteWork) {
        request.work = Utils.EMPTY_WORK
      } else {
        request.work = await request.createWork(true)
      }
    }
    console.log(request.toJSON(true))
    let response = await request.publish(this.wallet.rpc)
    console.log(response)
    if (response.hash) {
      return request
    } else {
      throw new Error(`Invalid Request: Rejected by Logos Node \n ${JSON.stringify(response)}`)
    }
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
    if (requestInfo.origin === this._address) {
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
        if (requestInfo.type === 'send' ||
          requestInfo.type === 'token_send' ||
          requestInfo.type === 'issuance') {
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

          // Clear sequence and previous
          this._sequence = null
          this._previous = null
        } else {
          // TODO Create Pending Token Stuff.
          let tokenAccount = Utils.accountFromHexKey(requestInfo.token_id)
          this._tokens[tokenAccount].sequence = parseInt(requestInfo.sequence) + 1
          this._tokens[tokenAccount].balance = bigInt(this._tokens[tokenAccount].balance).minus(bigInt(requestInfo.fee))
          this._tokens[tokenAccount].frontier = requestInfo.hash
          if (requestInfo.fee_type) {
            this._tokens[tokenAccount].fee_type = requestInfo.fee_type
          }
          if (requestInfo.fee_rate) {
            this._tokens[tokenAccount].fee_rate = requestInfo.fee_rate
          }
        }
      }
    }

    // Add block to receive chain if it is a recieve
    if (requestInfo.type === 'send') {
      if (requestInfo.transactions && requestInfo.transactions.length > 0) {
        for (let trans of requestInfo.transactions) {
          if (trans.destination === this._address) {
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
            if (this.wallet.fullSync) {
              this.updateBalancesFromChain()
            } else if (requestInfo.origin !== this._address) {
              // This block was already processed if we sent it.
              this.updateBalancesFromRequest(request)
            }
            break
          }
        }
      }
    }
  }

  /**
   * Batchs send requests
   *
   * @returns {Promise<void>}
   */
  async combineRequests () {
    // TODO Token Send Support
    let aggregate = 0
    let transactionsToCombine = [
      []
    ]
    for (let request of this._pendingChain) {
      if (request.type === 'send') {
        for (let transaction of request.transactions) {
          if (transactionsToCombine[aggregate].length < 8) {
            transactionsToCombine[aggregate].push(transaction)
          } else {
            aggregate++
            transactionsToCombine[aggregate] = [transaction]
          }
        }
      } else {
        // This isn't all sends lets just abort and send normally
        // There is probably a better way to handle this edge case
        if (this.wallet.rpc && this._pendingChain.length > 0) {
          this._pendingChain[0].publish(this.wallet.rpc)
        }
        return
      }
    }
    this.removePendingRequests()
    this._previous = null
    this._sequence = null
    const promises = transactionsToCombine.map(transactions => this.createSendRequest(transactions))
    await Promise.all(promises)
    if (this.wallet.rpc && this._pendingChain.length > 0) {
      this._pendingChain[0].publish(this.wallet.rpc)
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
