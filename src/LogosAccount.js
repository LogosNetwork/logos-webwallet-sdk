import {
  accountFromHexKey,
  keyFromAccount,
  GENESIS_HASH,
  minimumFee
} from './Utils'
import bigInt from 'big-integer'
import Account from './Account'
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

/**
 * The Accounts contain the keys, chains, and balances.
 */
export default class LogosAccount extends Account {
  constructor (options = {
    privateKey: null,
    pendingBalance: '0',
    tokenBalances: {},
    tokens: [],
    pendingTokenBalances: {},
    chain: [],
    receiveChain: [],
    pendingChain: [],
    wallet: null,
    version: 1,
    index: null
  }) {
    super(options)

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
     * Tokens that are associated with your account
     * @type {LogosAddress[]}
     * @private
     */
    if (options.tokens !== undefined) {
      this._tokens = options.tokens
    } else {
      this._tokens = []
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
  }

  /**
   * The type of the account (LogosAccount or TokenAccount)
   * @type {String}
   */
  get type () {
    return 'LogosAccount'
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
   * The private key of the account
   * @type {Hexadecimal64Length}
   * @readonly
   */
  get privateKey () {
    return this._privateKey
  }

  /**
   * Array of associated token ids to this account (full list available only with fullsync)
   * @type {LogosAddress[]}
   * @readonly
   */
  get tokens () {
    return this._tokens
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
   * The balance of the given token in the base units
   * @param {Hexadecimal64Length} tokenID - Token ID of the token in question, you can also send the token account address
   * @returns {String} the token account info object
   * @readonly
   */
  tokenBalance (token) {
    return this.tokenBalances[keyFromAccount(token)]
  }

  /**
   * Adds a token to the accounts associated tokens if it doesn't already exist
   *
   * @param {Hexadecimal64Length} tokenID - The TokenID you are associating with this account (this will be converted into a token account when stored)
   * @returns {LogosAddress[]} Array of all the associated tokens
   */
  async addToken (tokenID) {
    const tokenAddress = accountFromHexKey(tokenID)
    if (!this.tokens.includes(tokenAddress)) {
      this.tokens.push(tokenAddress)
      if (this.wallet.tokenSync) {
        await this.wallet.createTokenAccount(tokenAddress)
      }
    }
    return this.tokens
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
            this.updateBalancesFromChain()
            if (this.wallet.validateSync) {
              if (this.verifyChain() && this.verifyReceiveChain()) {
                this.synced = synced
                console.info(`${this.address} has been fully synced and validated`)
                resolve({ account: this.address, synced: this.synced, type: 'LogosAccount' })
              }
            } else {
              console.info(`Finished Syncing: Requests were not validated`)
              this.synced = synced
              resolve({ account: this.address, synced: this.synced, type: 'LogosAccount' })
            }
          } else {
            this.synced = synced
            resolve({ account: this.address, synced: this.synced, type: 'LogosAccount' })
          }
        } else {
          if (this.receiveChain.length === 0 && this.chain.length === 0) {
            console.info(`${this.address} is empty and therefore valid`)
            this.synced = synced
            resolve({ account: this.address, synced: this.synced, type: 'LogosAccount' })
          } else {
            console.error(`${this.address} is not opened according to the RPC. This is a critical error if in a production enviroment. On testnet this just means the network has been restarted.`)
            this.synced = false
            resolve({ account: this.address, synced: this.synced, type: 'LogosAccount' })
          }
        }
      })
    })
  }

  /**
   * Scans the account history using RPC and updates the local chain
   * @returns {Promise<Account>}
   */
  sync () {
    return new Promise((resolve, reject) => {
      this.synced = false
      this.chain = []
      this.receiveChain = []
      this.pendingChain = []
      this.tokenBalances = {}
      this.balance = '0'
      this.pendingBalance = '0'
      this.tokens = []
      this.pendingTokenBalances = {}
      const RPC = this.wallet.rpcClient()
      if (this.wallet.fullSync) {
        RPC.accounts.history(this.address, -1, true).then(async history => {
          if (history) {
            // Add Genesis to latest
            for (const requestInfo of history.reverse()) {
              await this.addConfirmedRequest(requestInfo)
            }
            this.updateBalancesFromChain()
            if (this.wallet.validateSync) {
              if (this.verifyChain() && this.verifyReceiveChain()) {
                this.synced = true
                console.info(`${this.address} has been fully synced and validated`)
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
        RPC.accounts.info(this.address).then(info => {
          if (info && info.frontier && info.frontier !== GENESIS_HASH) {
            RPC.requests.info(info.frontier).then(async val => {
              const request = await this.addConfirmedRequest(val)
              if (request !== null && !request.verify()) {
                throw new Error(`Invalid Request from RPC sync! \n ${request.toJSON(true)}`)
              }
              if (info.balance) {
                this.balance = info.balance
                this.pendingBalance = info.balance
              }
              if (info.tokens) {
                for (const pairs of Object.entries(info.tokens)) {
                  this.addToken(pairs[0])
                  info.tokens[pairs[0]] = pairs[1].balance
                }
                this.tokenBalances = { ...info.tokens }
                this.pendingTokenBalances = { ...info.tokens }
              }
              this.synced = true
              console.info(`${this.address} has been lazy synced`)
              resolve(this)
            })
          } else {
            if (info) {
              if (info.balance) {
                this.balance = info.balance
                this.pendingBalance = info.balance
              }
              if (info.tokens) {
                for (const pairs of Object.entries(info.tokens)) {
                  this.addToken(pairs[0])
                  info.tokens[pairs[0]] = pairs[1].balance
                }
                this.tokenBalances = { ...info.tokens }
                this.pendingTokenBalances = { ...info.tokens }
              }
            }
            this.synced = true
            console.info(`${this.address} is empty and therefore valid`)
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
    if (this.chain.length + this.pendingChain.length + this.receiveChain.length === 0) return bigInt(0)
    let sum = bigInt(0)
    const tokenSums = {}
    this.receiveChain.forEach(request => {
      if (request.type === 'send') {
        for (const transaction of request.transactions) {
          if (transaction.destination === this.address) {
            sum = sum.plus(bigInt(transaction.amount))
          }
        }
      } else if (request.type === 'withdraw_logos') {
        if (request.transaction.destination === this.address) {
          sum = sum.plus(bigInt(request.transaction.amount))
        }
      } else if (request.type === 'token_send') {
        for (const transaction of request.transactions) {
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
    this.chain.forEach(request => {
      if (request.type === 'send') {
        sum = sum.minus(bigInt(request.totalAmount)).minus(bigInt(request.fee))
      } else if (request.type === 'token_send') {
        tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).minus(bigInt(request.totalAmount)).minus(bigInt(request.tokenFee)).toString()
        sum = sum.minus(bigInt(request.fee))
      } else if (request.type === 'issuance') {
        sum = sum.minus(bigInt(request.fee))
      }
    })
    this.balance = sum.toString()
    this.tokenBalances = { ...tokenSums }
    this.pendingChain.forEach(pendingRequest => {
      if (pendingRequest.type === 'send') {
        sum = sum.minus(bigInt(pendingRequest.totalAmount)).minus(bigInt(pendingRequest.fee))
        for (const transaction of pendingRequest.transactions) {
          if (transaction.destination === this.address) {
            sum = sum.plus(bigInt(transaction.amount))
          }
        }
      } else if (pendingRequest.type === 'token_send') {
        sum = sum.minus(bigInt(pendingRequest.fee))
        tokenSums[pendingRequest.tokenID] = bigInt(tokenSums[pendingRequest.tokenID]).minus(bigInt(pendingRequest.totalAmount)).minus(bigInt(pendingRequest.tokenFee)).toString()
        for (const transaction of pendingRequest.transactions) {
          if (transaction.destination === this.address) {
            tokenSums[pendingRequest.tokenID] = bigInt(tokenSums[pendingRequest.tokenID]).plus(bigInt(transaction.amount)).toString()
          }
        }
      } else if (pendingRequest.type === 'issuance') {
        sum = sum.minus(bigInt(pendingRequest.fee))
      }
    })
    this.pendingBalance = sum.toString()
    this.pendingTokenBalances = { ...tokenSums }
  }

  /**
   * Updates the balances of the account by doing math on the previous balance when given a new request
   * Also updates the pending balance based on the new balance and the pending chain
   * @param {Request} request - request that is being calculated on
   * @returns {void}
   */
  updateBalancesFromRequest (request) {
    let sum = bigInt(this.balance)
    const tokenSums = this.tokenBalances
    if (request.type === 'send') {
      if (request.originAccount === this.address) {
        sum = sum.minus(bigInt(request.totalAmount)).minus(bigInt(request.fee))
      }
      for (const transaction of request.transactions) {
        if (transaction.destination === this.address) {
          sum = sum.plus(bigInt(transaction.amount))
        }
      }
    } else if (request.type === 'token_send') {
      sum = sum.minus(bigInt(request.fee))
      if (request.originAccount === this.address) {
        tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).minus(bigInt(request.totalAmount)).minus(bigInt(request.tokenFee)).toString()
      }
      for (const transaction of request.transactions) {
        if (transaction.destination === this.address) {
          tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).plus(bigInt(transaction.amount)).toString()
        }
      }
    } else if (request.type === 'issuance') {
      sum = sum.minus(bigInt(request.fee))
    } else if (request.type === 'withdraw_logos') {
      if (request.transaction.destination === this.address) {
        sum = sum.plus(bigInt(request.transaction.amount))
      }
    } else if (request.type === 'distribute' || request.type === 'withdraw_fee' || request.type === 'revoke') {
      if (request.transaction.destination === this.address) {
        tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).plus(bigInt(request.transaction.amount)).toString()
      }
      if (request.type === 'revoke' && request.source === this.address) {
        tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).minus(bigInt(request.transaction.amount)).toString()
      }
    }
    this.balance = sum.toString()
    this.tokenBalances = { ...tokenSums }
    this.pendingChain.forEach(pendingRequest => {
      if (pendingRequest.type === 'send') {
        sum = sum.minus(bigInt(pendingRequest.totalAmount)).minus(bigInt(pendingRequest.fee))
        for (const transaction of pendingRequest.transactions) {
          if (transaction.destination === this.address) {
            sum = sum.plus(bigInt(transaction.amount))
          }
        }
      } else if (pendingRequest.type === 'token_send') {
        sum = sum.minus(bigInt(pendingRequest.fee))
        tokenSums[pendingRequest.tokenID] = bigInt(tokenSums[pendingRequest.tokenID]).minus(bigInt(pendingRequest.totalAmount)).minus(bigInt(pendingRequest.tokenFee)).toString()
        for (const transaction of pendingRequest.transactions) {
          if (transaction.destination === this.address) {
            tokenSums[pendingRequest.tokenID] = bigInt(tokenSums[pendingRequest.tokenID]).plus(bigInt(transaction.amount)).toString()
          }
        }
      } else if (pendingRequest.type === 'issuance') {
        sum = sum.minus(bigInt(pendingRequest.fee))
      }
    })
    this.pendingBalance = sum.toString()
    this.pendingTokenBalances = { ...tokenSums }
  }

  /**
   * Creates a request object from the mqtt info and adds the request to the appropriate chain
   *
   * @param {RequestOptions} requestInfo - Request information from the RPC or MQTT
   * @returns {Request}
   */
  async addConfirmedRequest (requestInfo) {
    let request = null
    if (requestInfo.token_id) {
      await this.addToken(requestInfo.token_id)
    }
    if (requestInfo.type === 'send' || requestInfo.type === 'token_send') {
      if (requestInfo.type === 'send') {
        request = new Send(requestInfo)
      } else {
        request = new TokenSend(requestInfo)
      }
      // If this request was created by us
      // add the request to confirmed chain
      if (request.originAccount === this.address) {
        this._addToSendChain(request)
      }
      // If the request has transactions pointed to us
      // add the request to the receive chain
      if (request.transactions && request.transactions.length > 0) {
        for (const trans of request.transactions) {
          if (trans.destination === this.address) {
            this._addToReceiveChain(request)
            break
          }
        }
      }
      return request
    } else if (requestInfo.type === 'issuance') {
      request = new Issuance(requestInfo)
      this._addToSendChain(request)
      return request
    } else if (requestInfo.type === 'distribute') {
      request = new Distribute(requestInfo)
      this._addToReceiveChain(request)
      return request
    } else if (requestInfo.type === 'withdraw_fee') {
      request = new WithdrawFee(requestInfo)
      this._addToReceiveChain(request)
      return request
    } else if (requestInfo.type === 'revoke') {
      request = new Revoke(requestInfo)
      this._addToReceiveChain(request)
      return request
    } else if (requestInfo.type === 'withdraw_logos') {
      request = new WithdrawLogos(requestInfo)
      this._addToReceiveChain(request)
      return request
    } else {
      console.error(`MQTT sent ${this.address} an unknown block type: ${requestInfo.type} hash: ${requestInfo.hash}`)
      return null
    }
  }

  /**
   * Removes all pending requests from the pending chain
   * @returns {void}
   */
  removePendingRequests () {
    super.removePendingRequest()
    this.pendingTokenBalances = { ...this.tokenBalances }
  }

  /**
   * Validates that the account has enough funds at the current time to publish the request
   *
   * @param {Request} request - Request information from the RPC or MQTT
   * @returns {Boolean}
   */
  async validateRequest (request) {
    // Validate current values are appropriate for sends
    if (request.type === 'send') {
      if (bigInt(this.balance).minus(bigInt(request.totalAmount)).minus(request.fee).lesser(0)) {
        console.error(`Invalid Request: Not Enough Funds including fee to send that amount`)
        return false
      }
      return true
    } else if (request.type === 'token_send') {
      const tokenAccount = await this.getTokenAccount(request.tokenID)
      if (bigInt(this.balance).minus(request.fee).lesser(0)) {
        console.error(`Invalid Token Send Request: Not Enough Logos to pay the logos fee for token sends`)
        return false
      }
      if (!this.tokenBalances[tokenAccount.tokenID]) {
        console.error(`Invalid Token Send Request: User doesn't have a token account with the specified token`)
        return false
      }
      if (tokenAccount.feeType === 'flat' && bigInt(tokenAccount.feeRate).greater(request.tokenFee)) {
        console.error(`Invalid Token Send Request: Requests token is less than the required flat token fee of ${tokenAccount.feeRate}`)
        return false
      }
      if (tokenAccount.feeType === 'percentage' &&
        bigInt(request.totalAmount)
          .multiply(bigInt(tokenAccount.feeRate))
          .divide(100)
          .greater(bigInt(request.tokenFee))) {
        console.error(`Invalid Token Send Request: Requests token is less than the required percentage token fee of ${tokenAccount.feeRate}%`)
        return false
      }
      if (bigInt(this.tokenBalances[tokenAccount.tokenID]).minus(bigInt(request.totalAmount)).minus(bigInt(request.tokenFee)).lesser(0)) {
        console.error(`Invalid Token Send Request: Not Enough Token to pay the token fee for token sends`)
        return false
      }
      return true
    } else if (request.type === 'issuance') {
      if (bigInt(this.balance).minus(request.fee).lesser(0)) {
        console.error(`Invalid Issuance Request: Account does not have enough Logos to afford the fee to broadcast an issuance`)
        return false
      }
      return true
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
    request.sign(this.privateKey)
    return super.addRequest(request)
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
    if (this.synced === false) throw new Error('This account has not been synced or is being synced with the RPC network')
    const request = new Send({
      signature: null,
      previous: this.previous,
      fee: minimumFee,
      transactions: transactions,
      sequence: this.sequence,
      origin: this.address
    })
    if (!this.wallet.lazyErrors) {
      if (bigInt(this.pendingBalance).minus(bigInt(request.totalAmount)).minus(request.fee).lesser(0)) {
        throw new Error('Invalid Request: Not Enough Funds including fee to send that amount')
      }
    }
    this.pendingBalance = bigInt(this.pendingBalance).minus(bigInt(request.totalAmount)).minus(request.fee).toString()
    const result = await this.addRequest(request)
    return result
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
    if (this.synced === false) throw new Error('This account has not been synced or is being synced with the RPC network')
    const request = new Issuance({
      signature: null,
      previous: this.previous,
      fee: minimumFee,
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
    if (!this.wallet.lazyErrors) {
      if (bigInt(this.pendingBalance).minus(request.fee).lesser(0)) {
        throw new Error('Invalid Request: Not Enough Logos to afford the fee to issue a token')
      }
    }
    this.pendingBalance = bigInt(this.pendingBalance).minus(request.fee).toString()
    await this.wallet.createTokenAccount(accountFromHexKey(request.tokenID), request)
    const result = await this.addRequest(request)
    return result
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
    const tokenAccount = await this.wallet.createTokenAccount(accountFromHexKey(token))
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
    if (this.synced === false) throw new Error('This account has not been synced or is being synced with the RPC network')
    if (!transactions) throw new Error('You must pass transaction in the token send options')
    if (!token) throw new Error('You must pass token which is either tokenID or tokenAddress')
    const tokenAccount = await this.getTokenAccount(token)
    const request = new TokenSend({
      signature: null,
      previous: this.previous,
      fee: minimumFee,
      sequence: this.sequence,
      origin: this.address,
      tokenID: tokenAccount.tokenID,
      transactions: transactions
    })
    if (tokenAccount.feeType === 'flat') {
      request.tokenFee = tokenAccount.feeRate.toString()
    } else {
      request.tokenFee = bigInt(request.totalAmount).multiply(bigInt(tokenAccount.feeRate)).divide(100).toString()
    }
    if (!this.wallet.lazyErrors) {
      if (bigInt(this.pendingBalance).minus(request.fee).lesser(0)) {
        throw new Error('Invalid Request: Not Enough Logos to pay the logos fee for token sends')
      }
      if (bigInt(this.pendingTokenBalances[tokenAccount.tokenID]).minus(request.totalAmount).minus(request.tokenFee).lesser(0)) {
        throw new Error('Invalid Request: Not Enough Token to pay the for the token fee and the token send amounts')
      }
    }
    this.pendingBalance = bigInt(this.pendingBalance).minus(request.fee).toString()
    this.pendingTokenBalances[tokenAccount.tokenID] = bigInt(this.pendingTokenBalances[tokenAccount.tokenID]).minus(bigInt(request.totalAmount)).minus(request.tokenFee).toString()
    const result = await this.addRequest(request)
    return result
  }

  /**
   * Creates a IssueAdditional Token Request from the specified information
   *
   * @param {IssueAdditionalOptions} options - The Token ID & amount
   * @throws An exception if the token account balance is less than the required amount to do a issue additional token request
   * @returns {Promise<Request>} the request object
   */
  async createIssueAdditionalRequest (options) {
    const tokenAccount = await this.getTokenAccount(options)
    if (options.amount === undefined) throw new Error('You must pass amount in options')
    const request = new IssueAdditional({
      signature: null,
      previous: tokenAccount.previous,
      fee: minimumFee,
      sequence: tokenAccount.sequence,
      origin: this.address,
      tokenID: tokenAccount.tokenID,
      amount: options.amount
    })
    request.sign(this.privateKey)
    const result = await tokenAccount.addRequest(request)
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
    const tokenAccount = await this.getTokenAccount(options)
    const request = new ChangeSetting({
      signature: null,
      previous: tokenAccount.previous,
      fee: minimumFee,
      sequence: tokenAccount.sequence,
      origin: this.address,
      tokenID: tokenAccount.tokenID
    })
    request.setting = options.setting
    request.value = options.value
    request.sign(this.privateKey)
    const result = await tokenAccount.addRequest(request)
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
    const tokenAccount = await this.getTokenAccount(options)
    const request = new ImmuteSetting({
      signature: null,
      previous: tokenAccount.previous,
      fee: minimumFee,
      sequence: tokenAccount.sequence,
      origin: this.address,
      tokenID: tokenAccount.tokenID
    })
    request.setting = options.setting
    request.sign(this.privateKey)
    const result = await tokenAccount.addRequest(request)
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
    const tokenAccount = await this.getTokenAccount(options)
    if (!options.transaction) throw new Error('You must pass transaction in the options')
    if (!options.source) throw new Error('You must source in the options')
    const request = new Revoke({
      signature: null,
      previous: tokenAccount.previous,
      fee: minimumFee,
      sequence: tokenAccount.sequence,
      origin: this.address,
      tokenID: tokenAccount.tokenID,
      source: options.source,
      transaction: options.transaction
    })
    request.sign(this.privateKey)
    const result = await tokenAccount.addRequest(request)
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
    const tokenAccount = await this.getTokenAccount(options)
    if (!options.account) throw new Error('You must pass account in options')
    const request = new AdjustUserStatus({
      signature: null,
      previous: tokenAccount.previous,
      fee: minimumFee,
      sequence: tokenAccount.sequence,
      origin: this.address,
      tokenID: tokenAccount.tokenID,
      account: options.account
    })
    request.status = options.status
    request.sign(this.privateKey)
    const result = await tokenAccount.addRequest(request)
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
    const tokenAccount = await this.getTokenAccount(options)
    if (!options.feeRate) throw new Error('You must pass feeRate in options')
    if (!options.feeType) throw new Error('You must pass feeType in options')
    const request = new AdjustFee({
      signature: null,
      previous: tokenAccount.previous,
      fee: minimumFee,
      sequence: tokenAccount.sequence,
      origin: this.address,
      tokenID: tokenAccount.tokenID,
      feeRate: options.feeRate,
      feeType: options.feeType
    })
    request.sign(this.privateKey)
    const result = await tokenAccount.addRequest(request)
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
    const tokenAccount = await this.getTokenAccount(options)
    if (!options.issuerInfo) throw new Error('You must pass issuerInfo in the options')
    const request = new UpdateIssuerInfo({
      signature: null,
      previous: tokenAccount.previous,
      fee: minimumFee,
      sequence: tokenAccount.sequence,
      origin: this.address,
      tokenID: tokenAccount.tokenID
    })
    request.issuerInfo = options.issuerInfo
    request.sign(this.privateKey)
    const result = await tokenAccount.addRequest(request)
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
    const tokenAccount = await this.getTokenAccount(options)
    if (!options.controller) throw new Error('You must pass controller in the options')
    if (!options.action) throw new Error('You must pass action in the options')
    const request = new UpdateController({
      signature: null,
      previous: tokenAccount.previous,
      fee: minimumFee,
      sequence: tokenAccount.sequence,
      origin: this.address,
      tokenID: tokenAccount.tokenID,
      controller: options.controller
    })
    request.action = options.action
    request.sign(this.privateKey)
    const result = await tokenAccount.addRequest(request)
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
    const tokenAccount = await this.getTokenAccount(options)
    if (options.amount === undefined) throw new Error('You must pass amount in options')
    const request = new Burn({
      signature: null,
      previous: tokenAccount.previous,
      fee: minimumFee,
      sequence: tokenAccount.sequence,
      origin: this.address,
      tokenID: tokenAccount.tokenID,
      amount: options.amount
    })
    request.sign(this.privateKey)
    const result = await tokenAccount.addRequest(request)
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
    const tokenAccount = await this.getTokenAccount(options)
    if (!options.transaction) throw new Error('You must pass transaction in options')
    const request = new Distribute({
      signature: null,
      previous: tokenAccount.previous,
      fee: minimumFee,
      sequence: tokenAccount.sequence,
      origin: this.address,
      tokenID: tokenAccount.tokenID,
      transaction: options.transaction
    })
    request.sign(this.privateKey)
    const result = await tokenAccount.addRequest(request)
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
    const tokenAccount = await this.getTokenAccount(options)
    if (!options.transaction) throw new Error('You must pass transaction in options')
    const request = new WithdrawFee({
      signature: null,
      previous: tokenAccount.previous,
      fee: minimumFee,
      sequence: tokenAccount.sequence,
      origin: this.address,
      tokenID: tokenAccount.tokenID,
      transaction: options.transaction
    })
    request.sign(this.privateKey)
    const result = await tokenAccount.addRequest(request)
    return result
  }

  /**
   * Creates a request from the specified information
   *
   * @param {WithdrawLogosOptions} options - The Token ID & transaction
   * @throws An exception if the pending balance is less than the required amount to do a withdraw logos request
   * @returns {Promise<Request>} the request object
   */
  async createWithdrawLogosRequest (options) {
    const tokenAccount = await this.getTokenAccount(options)
    if (!options.transaction) throw new Error('You must pass transaction in options')
    const request = new WithdrawLogos({
      signature: null,
      previous: tokenAccount.previous,
      fee: minimumFee,
      sequence: tokenAccount.sequence,
      origin: this.address,
      tokenID: tokenAccount.tokenID,
      transaction: options.transaction
    })
    request.sign(this.privateKey)
    const result = await tokenAccount.addRequest(request)
    return result
  }

  /**
   * Confirms the request in the local chain
   *
   * @param {MQTTRequestOptions} requestInfo The request from MQTT
   * @returns {Promise<void>}
   */
  async processRequest (requestInfo) {
    // Confirm the requests / updates balances / broadcasts next block
    const request = await this.addConfirmedRequest(requestInfo)
    if (request !== null) {
      if (!request.verify()) throw new Error(`Invalid Request! \n ${request.toJSON(true)}`)
      if (request.originAccount === this.address &&
        (request.type === 'send' || request.type === 'token_send' || request.type === 'issuance')) {
        if (this.getPendingRequest(requestInfo.hash)) {
          this.removePendingRequest(requestInfo.hash)
        } else {
          console.error('Someone is sending blocks from this account that is not us!!!')
          // Remove all pendings as they are now invalidated
          // It is possible to update the pending blocks but this could
          // lead to unintended consequences so its best to just reset IMO
          this.removePendingRequests()
        }
      }
      if (this.wallet.fullSync) {
        this.updateBalancesFromChain()
      } else {
        this.updateBalancesFromRequest(request)
      }
      if (this.shouldCombine()) {
        this.combineRequests()
      } else {
        this.broadcastRequest()
      }
    }
  }

  /**
   * Determines if you shold combine requests
   *
   * Returns true if the pending chain has x sends and
   * the count of total transactions is <= (x-minimumSaved) * 8
   *
   * @param {Number} minimumSaved The minimum amount of requests saved in order to combine defaults to 1
   * @returns {Boolean}
   */
  _shouldCombine (minimumSaved = 1) {
    if (this.wallet.batchSends) {
      let sendTxCount = 0
      let sendCount = 0
      let tokenTxCount = 0
      let tokenCount = 0
      for (const request of this.pendingChain) {
        if (request.type === 'send') {
          sendCount++
          sendTxCount += request.transactions.length
        } else if (request.type === 'token_send') {
          tokenCount++
          tokenTxCount += request.transactions.length
        }
      }
      return ((sendTxCount <= (sendCount - minimumSaved) * 8) || (tokenTxCount <= (tokenCount - minimumSaved) * 8))
    } else {
      return false
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
    const logosTransactionsToCombine = [
      []
    ]
    const issuances = []
    const tokenTransactionsToCombine = new Map()
    for (const request of this.pendingChain) {
      if (request.type === 'send') {
        for (const transaction of request.transactions) {
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
        for (const transaction of request.transactions) {
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

    // Clear Pending Chain
    this.removePendingRequests()

    // Add Token Sends
    for (const [tokenID, tokenTransactions] of tokenTransactionsToCombine) {
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
      for (const issuance of issuances) {
        issuance.previous = this.previous
        issuance.sequence = this.sequence
        issuance.sign(this.privateKey)
        this.pendingChain.push(issuance)
      }
      this.broadcastRequest()
    }
  }

  /**
   * Returns the base account JSON
   * @returns {AccountJSON} JSON request
   */
  toJSON () {
    const obj = super.toJSON()
    obj.privateKey = this.privateKey
    obj.tokenBalances = this.tokenBalances
    obj.tokens = this.tokens
    obj.type = this.type
    obj.index = this.index
    return JSON.stringify(obj)
  }
}
