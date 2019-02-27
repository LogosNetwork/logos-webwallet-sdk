const Utils = require('./Utils')
const bigInt = require('big-integer')
const Send = require('./Requests/Send.js')
const Logos = require('@logosnetwork/logos-rpc-client')
const minimumFee = '10000000000000000000000'
const EMPTY_WORK = '0000000000000000'
const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000'
const officialRepresentative = 'lgs_3e3j5tkog48pnny9dmfzj1r16pg8t1e76dz5tmac6iq689wyjfpiij4txtdo'

/**
 * The Accounts contain the keys, chains, and balances.
 */
class Account {
  constructor (options = {
    label: null,
    address: null,
    publicKey: null,
    privateKey: null,
    previous: null,
    sequence: null,
    balance: '0',
    pendingBalance: '0',
    representative: null,
    chain: [],
    receiveChain: [],
    pendingChain: [],
    fullSync: true,
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
    if (options.previous !== undefined) {
      this._previous = options.previous
    } else {
      this._previous = null
    }

    /**
     * Sequence number of the last confirmed or pending request
     * @type {number}
     * @private
     */
    if (options.sequence !== undefined) {
      this._sequence = options.sequence
    } else {
      this._sequence = null
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

    /**
     * Full Sync - Should we fully sync and validate the full request chain or just sync the request
     * @type {boolean}
     * @private
     */
    if (options.fullSync !== undefined) {
      this._fullSync = options.fullSync
    } else {
      this._fullSync = true
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
   * The representative of the account
   * @type {LogosAddress}
   * @readonly
   */
  get representative () {
    let rep = officialRepresentative
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
        this._previous = GENESIS_HASH
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
   * @param {RPCOptions} options host and proxy used to sync the chain to (this data will be validated)
   * @returns {Promise<Account>}
   */
  sync (options) {
    return new Promise((resolve, reject) => {
      this._synced = false
      this._chain = []
      this._receiveChain = []
      const RPC = new Logos({ url: `http://${options.delegates[0]}:55000`, proxyURL: options.proxy })
      if (this._fullSync) {
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
          if (info && info.frontier && info.frontier !== GENESIS_HASH) {
            RPC.transactions.info(info.frontier).then(val => {
              this.addRequest(val)
              this._balance = info.balance
              this._pendingBalance = info.balance
              this._sequence = null
              this._previous = null
              this._synced = true
              resolve(this)
            })
          } else {
            if (info && info.balance) {
              this._balance = info.balance
              this._pendingBalance = info.balance
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
    this._receiveChain.forEach(request => {
      for (let transaction of request.transactions) {
        if (transaction.destination === this._address) {
          sum = sum.plus(bigInt(transaction.amount))
        }
      }
    })
    this._chain.forEach(request => {
      sum = sum.minus(bigInt(request.totalAmount)).minus(bigInt(request.fee))
    })
    this._balance = sum.toString()
    this._pendingChain.forEach(request => {
      sum = sum.minus(bigInt(request.totalAmount)).minus(bigInt(request.fee))
    })
    this._pendingBalance = sum.toString()
  }

  /**
   * Adds a request to the appropriate chain
   *
   * @param {RequestOptions} requestInfo - Request information from the RPC or MQTT
   * @returns {void}
   */
  addRequest (requestInfo) {
    if (requestInfo.type === 'send') {
      let request = new Send({
        origin: requestInfo.origin,
        signature: requestInfo.signature,
        work: requestInfo.work,
        sequence: requestInfo.sequence,
        previous: requestInfo.previous,
        fee: requestInfo.fee
      })
      if (requestInfo.transactions) {
        request.transactions = requestInfo.transactions
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
    }
    // TODO HANDLE OTHER BLOCKS
  }

  /**
   * Verify the integrity of the send & pending chains
   *
   * @returns {boolean}
   */
  verifyChain () {
    let last = GENESIS_HASH
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
   * @param {SendTransaction[]} transactions - The account destinations and amounts you wish to send them
   * @param {boolean} remoteWork - Should the work be genereated locally or remote
   * @param {RPCOptions} rpc - Options to send the publish command if null it will not publish the request
   * @throws An exception if the account has not been synced
   * @throws An exception if the pending balance is less than the required amount to do a send
   * @throws An exception if the request is rejected by the RPC
   * @returns {Promise<Request>} the request object
   */
  async createSend (transactions, remoteWork = true, rpc) {
    if (this._synced === false) throw new Error('This account has not been synced or is being synced with the RPC network')
    let request = new Send({
      signature: null,
      work: null,
      previous: this.previous,
      fee: minimumFee,
      transactions: transactions,
      sequence: this.sequence + 1,
      origin: this._address
    })
    if (bigInt(this._pendingBalance).minus(bigInt(request.totalAmount)).minus(minimumFee).lesser(0)) {
      throw new Error('Invalid Request: Not Enough Funds including fee to send that amount')
    }
    request.sign(this._privateKey)
    this._previous = request.hash
    this._sequence = request.sequence
    this._pendingBalance = bigInt(this._pendingBalance).minus(bigInt(request.totalAmount)).minus(minimumFee).toString()
    if (request.work === null) {
      if (remoteWork) {
        // TODO Send request to the remote work cluster
        request.work = EMPTY_WORK
      } else {
        request.work = await request.createWork(true)
      }
    }
    this._pendingChain.push(request)
    if (rpc) {
      // If this is the only request in the pending chain then publish it
      if (this._pendingChain.length === 1) {
        let response = await request.publish(rpc)
        if (response.hash) {
          return request
        } else {
          console.log(response)
          throw new Error('Invalid Request: Rejected by Logos Node')
        }
      } else {
        return request
      }
    } else {
      return request
    }
  }

  /**
   * Confirms the request in the local chain
   *
   * @param {MQTTRequestOptions} requestInfo The request from MQTT
   * @param {boolean} batchSends proccess transactions and batches them togeather
   * @param {RPCOptions} rpc - Options to send the publish command if null it will not publish the request
   * @throws An exception if the request is not found in the pending requests array
   * @throws An exception if the previous request does not match the last chain request
   * @throws An exception if the request amount is greater than your balance minus the transaction fee
   * @returns {void}
   */
  processRequest (requestInfo, batchSends, rpc) {
    if (requestInfo.type === 'send') {
      if (requestInfo.origin === this._address) {
        let request = this.getPendingRequest(requestInfo.hash)
        if (request) {
          if (bigInt(this._balance).minus(request.fee).lesser(request.totalAmount)) {
            throw new Error('Insufficient funds to confirm this request there must be an issue in our local chain or someone is sending us bad requests')
          } else {
            // Confirm the request add it to the local confirmed chain and remove from pending.
            this._chain.push(request)
            this.removePendingRequest(requestInfo.hash)
            if (this._fullSync) {
              this.updateBalancesFromChain()
            } else {
              this._balance = bigInt(this._balance).minus(request.fee).minus(request.totalAmount)
            }
            // Publish the next request in the pending as the previous request has been confirmed
            if (rpc && this._pendingChain.length > 0) {
              if (this._pendingChain.length > 1 &&
                this._pendingChain[0].type === 'send' &&
                this._pendingChain[0].transactions.length < 8) {
                // Combine if there are two of more pending transactions and the
                // Next transaction is a send with less than 8 transactions
                if (batchSends) {
                  this.combineRequests(rpc)
                } else {
                  if (rpc && this._pendingChain.length > 0) {
                    this._pendingChain[0].publish(rpc)
                  }
                }
              } else {
                this._pendingChain[0].publish(rpc)
              }
            }
          }
        }
      }
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
            if (this._fullSync) {
              this.updateBalancesFromChain()
            } else {
              let sum = bigInt(0)
              for (let transaction of request.transactions) {
                if (transaction.destination === this._address) {
                  sum = sum.plus(bigInt(transaction.amount))
                }
              }
              let newBalance = bigInt(this._balance).plus(sum)
              let newPendingBalance = bigInt(this._pendingBalance).plus(sum)
              this._balance = newBalance
              this._pendingBalance = newPendingBalance
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
   * @param {RPCOptions} rpc - Options to send the publish command if null or false it will not publish the request
   * @returns {void}
   */
  async combineRequests (rpc) {
    let aggregate = 0
    let transactionsToCombine = [[]]
    let otherRequests = []
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
        // TODO HANDLE OTHER BLOCK TYPES
        otherRequests.push(request)
      }
    }
    this.removePendingRequests()
    this._previous = null
    this._sequence = null
    const promises = transactionsToCombine.map(transactions => this.createSend(transactions, true, false))
    await Promise.all(promises)
    if (rpc && this._pendingChain.length > 0) {
      this._pendingChain[0].publish(rpc)
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
      if (this._fullSync) {
        this.updateBalancesFromChain()
      } else {
        let sum = bigInt(0)
        for (let transaction of request.transactions) {
          if (transaction.destination === this._address) {
            sum = sum.plus(bigInt(transaction.amount))
          }
        }
        this._balance = bigInt(this._balance).plus(sum)
        this._pendingBalance = bigInt(this._pendingBalance).plus(sum)
      }
      return receive
    } else {
      return false
    }
  }
}

module.exports = Account
