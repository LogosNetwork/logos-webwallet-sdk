import {
  accountFromHexKey,
  keyFromAccount,
  GENESIS_HASH,
  minimumFee
} from './Utils/Utils'
import bigInt from 'big-integer'
import Account, { AccountOptions, AccountJSON } from './Account'
import { Request as RpcRequest, Transaction } from '@logosnetwork/logos-rpc-client/api'

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
  Request
} from './Requests'
import { IssuanceOptions } from './Requests/Issuance'
import { IssueAdditionalJSON } from './Requests/IssueAdditional'
import { ChangeSettingOptions } from './Requests/ChangeSetting'
import { ImmuteSettingOptions } from './Requests/ImmuteSetting'
import { RevokeOptions } from './Requests/Revoke'
import { AdjustUserStatusOptions } from './Requests/AdjustUserStatus'
import { AdjustFeeOptions } from './Requests/AdjustFee'
import { UpdateIssuerInfoOptions } from './Requests/UpdateIssuerInfo'
import { UpdateControllerOptions } from './Requests/UpdateController'
import { BurnOptions } from './Requests/Burn'
import { DistributeOptions } from './Requests/Distribute'
import { WithdrawFeeOptions } from './Requests/WithdrawFee'
import { WithdrawLogosOptions } from './Requests/WithdrawLogos'
import TokenAccount from './TokenAccount'

export interface LogosAccountOptions extends AccountOptions {
  index?: number;
  privateKey?: string;
  tokens?: string[];
  tokenBalances?: TokenBalances;
  pendingTokenBalances?: TokenBalances;
}

export interface LogosAccountJSON extends AccountJSON {
  privateKey?: string;
  tokenBalances?: TokenBalances;
  tokens?: string[];
  type?: string;
  index?: number;
}

interface TokenBalances {
  [tokenID: string]: string;
}

export interface SyncedResponse {
  account?: string;
  synced?: boolean;
  type?: string;
  remove?: boolean;
}

/**
 * ## Logos Account
 * This class is the base class of an account on the Logos Network.
 * The most common uses for this account is to check the balance, history, and create new requests from this account as the origin.
 */
export default class LogosAccount extends Account {
  private _index: number

  private _privateKey: string

  private _tokens: string[]

  private _tokenBalances: TokenBalances

  private _pendingTokenBalances: TokenBalances

  /**
  * ### Instantiating
  * ```typescript
  * const LogosAccount = new LogosAccount({
  *     label: null,
  *     address: null,
  *     publicKey: null,
  *     balance: '0',
  *     pendingBalance: '0',
  *     wallet: null,
  *     chain: [],
  *     receiveChain: [],
  *     pendingChain: [],
  *     privateKey: null
  *     tokenBalances: {},
  *     tokens: [],
  *     pendingTokenBalances: {},
  *     index: null
  * })
  * ```
  * 
  * All logos account options are optional defaults are shown in the example above
  * 
  * |Account Options| Description |
  * |--|--|
  * | label | Account label e.g. Checking Account |
  * | address | Address is the lgs_ string  |
  * | publicKey | Public key of the account |
  * | balance | Balance of the account in the minor unit of Logos |
  * | pendingBalance | balance of the account including pending transaction in the minor unit of Logos |
  * | wallet | reference back to the parent wallet class |
  * | chain | Array of [[Request]] that are confirmed on this account's send chain |
  * | receiveChain | Array of [[Request]] that are confirmed on this account's receive chain |
  * | pendingChain | Array of [[Request]] that are *not* confirmed on this account's send chain |
  * | [[privateKey]] | Private key of the account used to sign transactions |
  * | [[tokenBalances]] | Balances tokens that this account has in their  |
  * | [[tokens]] | Array of token addresses associated with this account |
  * | [[pendingTokenBalances]] | Unconfirmed balances of the tokens |
  * | [[index]] | index of the account |
  */
  public constructor (options: LogosAccountOptions = {
    privateKey: null,
    tokenBalances: {},
    tokens: [],
    pendingTokenBalances: {},
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
     * @type {string}
     * @private
     */
    if (options.privateKey !== undefined) {
      this._privateKey = options.privateKey
    } else {
      this._privateKey = null
    }

    /**
     * Tokens that are associated with your account
     * @type {string[]}
     * @private
     */
    if (options.tokens !== undefined) {
      this._tokens = options.tokens
    } else {
      this._tokens = []
    }

    /**
     * Token Balance of the token account in minor unit of tokens
     * @type {TokenBalances}
     * @private
     */
    if (options.tokenBalances !== undefined) {
      this._tokenBalances = options.tokenBalances
    } else {
      this._tokenBalances = {}
    }

    /**
     * Pending Token Balance of the token account in minor unit of tokens
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
   * #### Example
   * ```typescript
   * const type = logosAccount.type
   * ```
   */
  public get type (): 'LogosAccount' {
    return 'LogosAccount'
  }

  /**
   * The index of the account
   * #### Example
   * ```typescript
   * const index = logosAccount.index
   * ```
   */
  public get index (): number {
    return this._index
  }

  /**
   * The private key of the account
   * #### Example
   * ```typescript
   * const privateKey = logosAccount.privateKey
   * ```
   */
  public get privateKey (): string {
    return this._privateKey
  }

  /**
   * Array of associated token ids to this account (full list available only with fullsync)
   * #### Example
   * ```typescript
   * const tokens = logosAccount.tokens
   * ```
   */
  public get tokens (): string[] {
    return this._tokens
  }

  /**
   * The balance of the tokens in the minor token unit
   * #### Example
   * ```typescript
   * const tokenBalances = logosAccount.tokenBalances
   * ```
   */
  public get tokenBalances (): TokenBalances {
    return this._tokenBalances
  }

  /**
   * The pending token balance of the account in the minor token unit
   *
   * pending token balance is balance minus the token sends that are pending
   *
   * #### Example
   * ```typescript
   * const pendingTokenBalances = logosAccount.pendingTokenBalances
   * ```
   */
  public get pendingTokenBalances (): TokenBalances {
    return this._pendingTokenBalances
  }

  /**
   * The balance of the given token in the minor unit and major unit (if available)
   * @param {string} tokenID - Token ID of the token in question, you can also send the token account address
   * @returns {{minor: string;major?: string}} The balance in minor unit or converted units
   * #### Example
   * ```typescript
   * const tokenBalance = logosAccount.tokenBalance('lgs_3q69z3kf6cq9n9smago3p1ptuyqy9pa3mdykyi9o8f7gnof47qdyxj9gejxd')
   * ```
   */
  public tokenBalance (token: string): {minor: string;major?: string} {
    const tokenAccountKey = keyFromAccount(token)
    const tokenAddress = accountFromHexKey(tokenAccountKey)
    const minorValue = this.tokenBalances[tokenAccountKey]
    if (minorValue) {
      const result: {minor: string;major?: string} = {
        minor: minorValue
      }
      if (!this.wallet.tokenAccounts[tokenAddress]) return result
      result.major = this.wallet.tokenAccounts[tokenAddress].convertToMajor(minorValue)
      return result
    } else {
      return null
    }
  }

  /**
   * Adds a token to the accounts associated tokens if it doesn't already exist
   *
   * @param {string} tokenID - The TokenID you are associating with this account (this will be converted into a token account when stored)
   * @returns {string[]} Array of all the associated tokens
   * #### Example
   * ```typescript
   * const token = await logosAccount.addToken('lgs_3q69z3kf6cq9n9smago3p1ptuyqy9pa3mdykyi9o8f7gnof47qdyxj9gejxd')
   * ```
   */
  public async addToken (tokenID: string): Promise<string[]> {
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
   * @returns {Promise<SyncedResponse>}
   * #### Example
   * ```typescript
   * const isSynced = await logosAccount.isSynced()
   * ```
   */
  public isSynced (): Promise<SyncedResponse> {
    return new Promise((resolve): void => {
      const RPC = this.wallet.rpcClient
      RPC.accounts.info(this.address).then(async (info): Promise<void> => {
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
              console.info('Finished Syncing: Requests were not validated')
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
   * 
   * @returns {Promise<Account>}
   * #### Example
   * ```typescript
   * const isSynced = await logosAccount.sync()
   * ```
   */
  public sync (): Promise<Account> {
    return new Promise((resolve): void => {
      this.synced = false
      this.chain = []
      this.receiveChain = []
      this.pendingChain = []
      this._tokenBalances = {}
      this.balance = '0'
      this.pendingBalance = '0'
      this._tokens = []
      this._pendingTokenBalances = {}
      const RPC = this.wallet.rpcClient
      if (this.wallet.fullSync) {
        RPC.accounts.history(this.address, -1, true).then(async (history): Promise<void> => {
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
        RPC.accounts.info(this.address).then((info): void => {
          if (info && info.frontier && info.frontier !== GENESIS_HASH) {
            RPC.requests.info(info.frontier).then(async (val): Promise<void> => {
              const request = await this.addConfirmedRequest(val)
              if (request !== null && !request.verify()) {
                throw new Error(`Invalid Request from RPC sync! \n ${JSON.stringify(request.toJSON(), null, 2)}`)
              }
              if (info.balance) {
                this.balance = info.balance
                this.pendingBalance = info.balance
              }
              const tokenBalances: TokenBalances = {}
              if (info.tokens) {
                for (const [tokenID, accountInfo] of Object.entries(info.tokens)) {
                  this.addToken(tokenID)
                  tokenBalances[tokenID] = accountInfo.balance
                }
                this._tokenBalances = { ...tokenBalances }
                this._pendingTokenBalances = { ...tokenBalances }
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
              const tokenBalances: TokenBalances = {}
              if (info.tokens) {
                for (const [tokenID, accountInfo] of Object.entries(info.tokens)) {
                  this.addToken(tokenID)
                  tokenBalances[tokenID] = accountInfo.balance
                }
                this._tokenBalances = { ...tokenBalances }
                this._pendingTokenBalances = { ...tokenBalances }
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
   * #### Example
   * ```typescript
   * logosAccount.updateBalancesFromChain()
   * ```
   */
  public updateBalancesFromChain (): void {
    let sum = bigInt(0)
    const tokenSums = {}
    for (const request of this.receiveChain) {
      if (request instanceof Send) {
        for (const transaction of request.transactions) {
          if (transaction.destination === this.address) {
            sum = sum.plus(bigInt(transaction.amount))
          }
        }
      } else if (request instanceof WithdrawLogos) {
        if (request.transaction.destination === this.address) {
          sum = sum.plus(bigInt(request.transaction.amount))
        }
      } else if (request instanceof TokenSend) {
        for (const transaction of request.transactions) {
          if (transaction.destination === this.address) {
            tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).plus(bigInt(transaction.amount)).toString()
          }
        }
      } else if (request instanceof Distribute || request instanceof WithdrawFee || request instanceof Revoke) {
        if (request.transaction.destination === this.address) {
          tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).plus(bigInt(request.transaction.amount)).toString()
        }
        if (request instanceof Revoke && request.source === this.address) {
          tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).minus(bigInt(request.transaction.amount)).toString()
        }
      }
    }
    for (const request of this.chain) {
      if (request instanceof Send) {
        sum = sum.minus(bigInt(request.totalAmount)).minus(bigInt(request.fee))
      } else if (request instanceof TokenSend) {
        tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).minus(bigInt(request.totalAmount)).minus(bigInt(request.tokenFee)).toString()
        sum = sum.minus(bigInt(request.fee))
      } else if (request instanceof Issuance) {
        sum = sum.minus(bigInt(request.fee))
      }
    }
    this.balance = sum.toString()
    this._tokenBalances = { ...tokenSums }
    for (const pendingRequest of this.pendingChain) {
      if (pendingRequest instanceof Send) {
        sum = sum.minus(bigInt(pendingRequest.totalAmount)).minus(bigInt(pendingRequest.fee))
        for (const transaction of pendingRequest.transactions) {
          if (transaction.destination === this.address) {
            sum = sum.plus(bigInt(transaction.amount))
          }
        }
      } else if (pendingRequest instanceof TokenSend) {
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
    }
    this.pendingBalance = sum.toString()
    this._pendingTokenBalances = { ...tokenSums }
  }

  /**
   * Updates the balances of the account by doing math on the previous balance when given a new request
   * Also updates the pending balance based on the new balance and the pending chain
   * @param {Request} request - request that is being calculated on
   * #### Example
   * ```typescript
   * logosAccount.updateBalancesFromRequest()
   * ```
   */
  public updateBalancesFromRequest (request: Request): void {
    let sum = bigInt(this.balance)
    const tokenSums = this.tokenBalances
    if (request instanceof Send) {
      if (request.originAccount === this.address) {
        sum = sum.minus(bigInt(request.totalAmount)).minus(bigInt(request.fee))
      }
      for (const transaction of request.transactions) {
        if (transaction.destination === this.address) {
          sum = sum.plus(bigInt(transaction.amount))
        }
      }
    } else if (request instanceof TokenSend) {
      sum = sum.minus(bigInt(request.fee))
      if (request.originAccount === this.address) {
        tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).minus(bigInt(request.totalAmount)).minus(bigInt(request.tokenFee)).toString()
      }
      for (const transaction of request.transactions) {
        if (transaction.destination === this.address) {
          tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).plus(bigInt(transaction.amount)).toString()
        }
      }
    } else if (request instanceof Issuance) {
      sum = sum.minus(bigInt(request.fee))
    } else if (request instanceof WithdrawLogos) {
      if (request.transaction.destination === this.address) {
        sum = sum.plus(bigInt(request.transaction.amount))
      }
    } else if (request instanceof Distribute || request instanceof WithdrawFee || request instanceof Revoke) {
      if (request.transaction.destination === this.address) {
        tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).plus(bigInt(request.transaction.amount)).toString()
      }
      if (request instanceof Revoke && request.source === this.address) {
        tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).minus(bigInt(request.transaction.amount)).toString()
      }
    }
    this.balance = sum.toString()
    this._tokenBalances = { ...tokenSums }
    for (const pendingRequest of this.pendingChain) {
      if (pendingRequest instanceof Send) {
        sum = sum.minus(bigInt(pendingRequest.totalAmount)).minus(bigInt(pendingRequest.fee))
        for (const transaction of pendingRequest.transactions) {
          if (transaction.destination === this.address) {
            sum = sum.plus(bigInt(transaction.amount))
          }
        }
      } else if (pendingRequest instanceof TokenSend) {
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
    }
    this.pendingBalance = sum.toString()
    this._pendingTokenBalances = { ...tokenSums }
  }

  /**
   * Creates a request object from the mqtt info and adds the request to the appropriate chain
   *
   * @param {RequestOptions} requestInfo - Request information from the RPC or MQTT
   * #### Example
   * ```typescript
   * logosAccount.addConfirmedRequest([[RpcRequest]])
   * ```
   */
  public async addConfirmedRequest (requestInfo: RpcRequest): Promise<Request> {
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
        this.addToSendChain(request)
      }
      // If the request has transactions pointed to us
      // add the request to the receive chain
      if (request.transactions && request.transactions.length > 0) {
        for (const trans of request.transactions) {
          if (trans.destination === this.address) {
            this.addToReceiveChain(request)
            break
          }
        }
      }
      return request
    } else if (requestInfo.type === 'issuance') {
      request = new Issuance(requestInfo)
      this.addToSendChain(request)
      return request
    } else if (requestInfo.type === 'distribute') {
      request = new Distribute(requestInfo)
      this.addToReceiveChain(request)
      return request
    } else if (requestInfo.type === 'withdraw_fee') {
      request = new WithdrawFee(requestInfo)
      this.addToReceiveChain(request)
      return request
    } else if (requestInfo.type === 'revoke') {
      request = new Revoke(requestInfo)
      this.addToReceiveChain(request)
      return request
    } else if (requestInfo.type === 'withdraw_logos') {
      request = new WithdrawLogos(requestInfo)
      this.addToReceiveChain(request)
      return request
    } else {
      console.error(`Error processing new request for logos account ${this.address} unknown block type: ${requestInfo.type} hash: ${requestInfo.hash}`)
      return null
    }
  }

  /**
   * Removes all pending requests from the pending chain
   * #### Example
   * ```typescript
   * logosAccount.removePendingRequests()
   * ```
   */
  public removePendingRequests (): void {
    super.removePendingRequests()
    this._pendingTokenBalances = { ...this.tokenBalances }
  }

  /**
   * Validates that the account has enough funds at the current time to publish the request
   *
   * @param {Request} request - Request Class
   * #### Example
   * ```typescript
   * await logosAccount.validateRequest(REQUEST)
   * ```
   */
  public async validateRequest (request: Request): Promise<boolean> {
    // Validate current values are appropriate for sends
    if (request instanceof Send) {
      if (bigInt(this.balance).minus(bigInt(request.totalAmount)).minus(request.fee).lesser(0)) {
        console.error('Invalid Request: Not Enough Funds including fee to send that amount')
        return false
      }
      return true
    } else if (request instanceof TokenSend) {
      const tokenAccount = await this.getTokenAccount(request.tokenID)
      if (bigInt(this.balance).minus(request.fee).lesser(0)) {
        console.error('Invalid Token Send Request: Not Enough Logos to pay the logos fee for token sends')
        return false
      }
      if (!this.tokenBalances[tokenAccount.tokenID]) {
        console.error('Invalid Token Send Request: User doesn\'t have a token account with the specified token')
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
        console.error('Invalid Token Send Request: Not Enough Token to pay the token fee for token sends')
        return false
      }
      return true
    } else if (request.type === 'issuance') {
      if (bigInt(this.balance).minus(request.fee).lesser(0)) {
        console.error('Invalid Issuance Request: Account does not have enough Logos to afford the fee to broadcast an issuance')
        return false
      }
      return true
    }
    return false
  }

  /**
   * Adds the request to the pending chain and publishes it
   *
   * @param {Request} request - Request information from the RPC or MQTT
   * @throws An exception if the pending balance is less than the required amount to adjust a users status
   * #### Example
   * ```typescript
   * const request = await logosAccount.addRequest(REQUEST)
   * ```
   */
  public async addRequest (request: Request): Promise<Request> {
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
   * #### Example
   * ```typescript
   * const request = await logosAccount.createSendRequest([
   *  {
   *    destination: 'lgs_3e3j5tkog48pnny9dmfzj1r16pg8t1e76dz5tmac6iq689wyjfpiij4txtdo',
   *    amount: '1'
   *  }
   * ])
   * ```
   */
  public async createSendRequest (transactions: Transaction[]): Promise<Request> {
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
   * #### Example
   * ```typescript
   * const request = await logosAccount.createTokenIssuanceRequest(
   *  {
   *   name: `UnitTestCoin`,
   *   symbol: `UTC`,
   *   totalSupply: '1000',
   *   feeRate: '1',
   *   issuerInfo: '{"decimals":0,"website":"https://github.com/LogosNetwork/logos-webwallet-sdk"}',
   *   settings: {
   *     issuance: true,
   *     modify_issuance: true,
   *     revoke: true,
   *     modify_revoke: true,
   *     freeze: true,
   *     modify_freeze: true,
   *     adjust_fee: true,
   *     modify_adjust_fee: true,
   *     whitelist: false,
   *     modify_whitelist: true
   *   },
   *   controllers: [{
   *     account: 'lgs_3e3j5tkog48pnny9dmfzj1r16pg8t1e76dz5tmac6iq689wyjfpiij4txtdo',
   *     privileges: {
   *       change_issuance: true,
   *       change_modify_issuance: true,
   *       change_revoke: true,
   *       change_modify_revoke: true,
   *       change_freeze: true,
   *       change_modify_freeze: true,
   *       change_adjust_fee: true,
   *       change_modify_adjust_fee: true,
   *       change_whitelist: true,
   *       change_modify_whitelist: true,
   *       issuance: true,
   *       revoke: true,
   *       freeze: true,
   *       adjust_fee: true,
   *       whitelist: true,
   *       update_issuer_info: true,
   *       update_controller: true,
   *       burn: true,
   *       distribute: true,
   *       withdraw_fee: true,
   *       withdraw_logos: true
   *     }
   *   }]
   *  }
   * )
   * ```
   */
  public async createTokenIssuanceRequest (options: IssuanceOptions): Promise<Request> {
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
   * #### Example
   * ```typescript
   * const request = await logosAccount.getTokenAccount('lgs_3q69z3kf6cq9n9smago3p1ptuyqy9pa3mdykyi9o8f7gnof47qdyxj9gejxd')
   * ```
   */
  public async getTokenAccount (token: string | {
    token_id?: string;
    tokenID?: string;
    tokenAccount?: string;
    token_account?: string;
  }): Promise<TokenAccount> {
    if (typeof token === 'object' && token.token_id) token = token.token_id
    if (typeof token === 'object' && token.tokenID) token = token.tokenID
    if (typeof token === 'object' && token.tokenAccount) token = token.tokenAccount
    if (typeof token === 'object' && token.token_account) token = token.token_account
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
   * #### Example
   * ```typescript
   * const request = await logosAccount.createTokenSendRequest('lgs_3q69z3kf6cq9n9smago3p1ptuyqy9pa3mdykyi9o8f7gnof47qdyxj9gejxd', [{
   *  destination: 'lgs_3e3j5tkog48pnny9dmfzj1r16pg8t1e76dz5tmac6iq689wyjfpiij4txtdo',
   *  amount: '1'
   * }])
   * ```
   */
  public async createTokenSendRequest (token: string, transactions: Transaction[]): Promise<Request> {
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
   * #### Example
   * ```typescript
   * const request = await logosAccount.createIssueAdditionalRequest({
   *  tokenAccount: 'lgs_3q69z3kf6cq9n9smago3p1ptuyqy9pa3mdykyi9o8f7gnof47qdyxj9gejxd',
   *  amount: '1'
   * })
   * ```
   */
  public async createIssueAdditionalRequest (options: IssueAdditionalJSON): Promise<Request> {
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
   * #### Example
   * ```typescript
   * const request = await logosAccount.createChangeSettingRequest({
   *  tokenAccount: 'lgs_3q69z3kf6cq9n9smago3p1ptuyqy9pa3mdykyi9o8f7gnof47qdyxj9gejxd',
   *  setting: 'issuance',
   *  value: true
   * })
   * ```
   */
  public async createChangeSettingRequest (options: ChangeSettingOptions): Promise<Request> {
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
    request.value = options.value.toString() === 'true'
    request.sign(this.privateKey)
    const result = await tokenAccount.addRequest(request)
    return result
  }

  /**
   * Creates a ImmuteSetting Token Request from the specified information
   *
   * @param {ImmuteSettingOptions} options - Token ID, setting
   * @throws An exception if the token account balance is less than the required amount to do a immute setting token request
   * #### Example
   * ```typescript
   * const request = await logosAccount.createImmuteSettingRequest({
   *  tokenAccount: 'lgs_3q69z3kf6cq9n9smago3p1ptuyqy9pa3mdykyi9o8f7gnof47qdyxj9gejxd',
   *  setting: 'issuance'
   * })
   * ```
   */
  public async createImmuteSettingRequest (options: ImmuteSettingOptions): Promise<Request> {
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
   * #### Example
   * ```typescript
   * const request = await logosAccount.createRevokeRequest({
   *  tokenAccount: 'lgs_3q69z3kf6cq9n9smago3p1ptuyqy9pa3mdykyi9o8f7gnof47qdyxj9gejxd',
   *  source: 'lgs_3e3j5tkog48pnny9dmfzj1r16pg8t1e76dz5tmac6iq689wyjfpiij4txtdo',
   *  transaction: {
   *    amount: '1',
   *    destination: 'lgs_3mjbkiwijkbt3aqz8kzm5nmsfhtrbjwkmnyeqi1aoscc46t4xdnfdaunerr6' 
   *  }
   * })
   * ```
   */
  public async createRevokeRequest (options: RevokeOptions): Promise<Request> {
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
   * #### Example
   * ```typescript
   * const request = await logosAccount.createAdjustUserStatusRequest({
   *  tokenAccount: 'lgs_3q69z3kf6cq9n9smago3p1ptuyqy9pa3mdykyi9o8f7gnof47qdyxj9gejxd',
   *  account: 'lgs_3e3j5tkog48pnny9dmfzj1r16pg8t1e76dz5tmac6iq689wyjfpiij4txtdo',
   *  status: 'frozen'
   * })
   * ```
   */
  public async createAdjustUserStatusRequest (options: AdjustUserStatusOptions): Promise<Request> {
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
   * #### Example
   * ```typescript
   * const request = await logosAccount.createAdjustFeeRequest({
   *  tokenAccount: 'lgs_3q69z3kf6cq9n9smago3p1ptuyqy9pa3mdykyi9o8f7gnof47qdyxj9gejxd',
   *  feeType: 'flat',
   *  feeRate: '0'
   * })
   * ```
   */
  public async createAdjustFeeRequest (options: AdjustFeeOptions): Promise<Request> {
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
   * #### Example
   * ```typescript
   * const request = await logosAccount.createUpdateIssuerInfoRequest({
   *  tokenAccount: 'lgs_3q69z3kf6cq9n9smago3p1ptuyqy9pa3mdykyi9o8f7gnof47qdyxj9gejxd',
   *  issuerInfo: '{"decimals":0,"website":"https://github.com/LogosNetwork/logos-webwallet-sdk"}'
   * })
   * ```
   */
  public async createUpdateIssuerInfoRequest (options: UpdateIssuerInfoOptions): Promise<Request> {
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
   * #### Example
   * ```typescript
   * const request = await logosAccount.createUpdateControllerRequest({
   *  tokenAccount: 'lgs_3q69z3kf6cq9n9smago3p1ptuyqy9pa3mdykyi9o8f7gnof47qdyxj9gejxd',
   *  action: 'add',
   *  controller: {
   *     account: 'lgs_3e3j5tkog48pnny9dmfzj1r16pg8t1e76dz5tmac6iq689wyjfpiij4txtdo',
   *     privileges: {
   *       change_issuance: true,
   *       change_modify_issuance: true,
   *       change_revoke: true,
   *       change_modify_revoke: true,
   *       change_freeze: true,
   *       change_modify_freeze: true,
   *       change_adjust_fee: true,
   *       change_modify_adjust_fee: true,
   *       change_whitelist: true,
   *       change_modify_whitelist: true,
   *       issuance: true,
   *       revoke: true,
   *       freeze: true,
   *       adjust_fee: true,
   *       whitelist: true,
   *       update_issuer_info: true,
   *       update_controller: true,
   *       burn: true,
   *       distribute: true,
   *       withdraw_fee: true,
   *       withdraw_logos: true
   *     }
   *   }
   * })
   * ```
   */
  public async createUpdateControllerRequest (options: UpdateControllerOptions): Promise<Request> {
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
   * #### Example
   * ```typescript
   * const request = await logosAccount.createBurnRequest({
   *  tokenAccount: 'lgs_3q69z3kf6cq9n9smago3p1ptuyqy9pa3mdykyi9o8f7gnof47qdyxj9gejxd',
   *  amount: '1'
   * })
   * ```
   */
  public async createBurnRequest (options: BurnOptions): Promise<Request> {
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
   * #### Example
   * ```typescript
   * const request = await logosAccount.createDistributeRequest({
   *  tokenAccount: 'lgs_3q69z3kf6cq9n9smago3p1ptuyqy9pa3mdykyi9o8f7gnof47qdyxj9gejxd',
   *  transaction: {
   *    amount: '1',
   *    destination: 'lgs_3mjbkiwijkbt3aqz8kzm5nmsfhtrbjwkmnyeqi1aoscc46t4xdnfdaunerr6' 
   *  }
   * })
   * ```
   */
  public async createDistributeRequest (options: DistributeOptions): Promise<Request> {
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
   * #### Example
   * ```typescript
   * const request = await logosAccount.createWithdrawFeeRequest({
   *  tokenAccount: 'lgs_3q69z3kf6cq9n9smago3p1ptuyqy9pa3mdykyi9o8f7gnof47qdyxj9gejxd',
   *  transaction: {
   *    amount: '1',
   *    destination: 'lgs_3mjbkiwijkbt3aqz8kzm5nmsfhtrbjwkmnyeqi1aoscc46t4xdnfdaunerr6' 
   *  }
   * })
   * ```
   */
  public async createWithdrawFeeRequest (options: WithdrawFeeOptions): Promise<Request> {
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
   * #### Example
   * ```typescript
   * const request = await logosAccount.createWithdrawLogosRequest({
   *  tokenAccount: 'lgs_3q69z3kf6cq9n9smago3p1ptuyqy9pa3mdykyi9o8f7gnof47qdyxj9gejxd',
   *  transaction: {
   *    amount: '1',
   *    destination: 'lgs_3mjbkiwijkbt3aqz8kzm5nmsfhtrbjwkmnyeqi1aoscc46t4xdnfdaunerr6' 
   *  }
   * })
   * ```
   */
  public async createWithdrawLogosRequest (options: WithdrawLogosOptions): Promise<Request> {
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
   * #### Example
   * ```typescript
   * await logosAccount.processRequest(
   *  RpcRequest
   * )
   * ```
   */
  public async processRequest (requestInfo: RpcRequest): Promise<void> {
    // Confirm the requests / updates balances / broadcasts next block
    const request = await this.addConfirmedRequest(requestInfo)
    if (request !== null) {
      if (!request.verify()) throw new Error(`Invalid Request! \n ${JSON.stringify(request.toJSON(), null, 2)}`)
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
   * @param {number} minimumSaved The minimum amount of requests saved in order to combine defaults to 1
   * @returns {boolean}
   */
  private shouldCombine (minimumSaved = 1): boolean {
    if (this.wallet.batchSends) {
      let sendTxCount = 0
      let sendCount = 0
      let tokenTxCount = 0
      let tokenCount = 0
      for (const request of this.pendingChain) {
        if (request instanceof Send) {
          sendCount++
          sendTxCount += request.transactions.length
        } else if (request instanceof TokenSend) {
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
  private async combineRequests (): Promise<void> {
    let sendCounter = 0
    let tokenCounter = 0
    const logosTransactionsToCombine: Transaction[][] = [
      []
    ]
    const issuances = []
    interface TokenTransactionsCombined {
      [tokenID: string]: Transaction[][];
    }
    const tokenTransactionsToCombine: TokenTransactionsCombined = {}
    for (const request of this.pendingChain) {
      if (request instanceof Send) {
        for (const transaction of request.transactions) {
          if (logosTransactionsToCombine[sendCounter].length < 8) {
            logosTransactionsToCombine[sendCounter].push(transaction)
          } else {
            sendCounter++
            logosTransactionsToCombine[sendCounter] = [transaction]
          }
        }
      } else if (request instanceof TokenSend) {
        let tokenAggregates: Transaction[][] = [[]]
        if (tokenTransactionsToCombine[request.tokenID]) {
          tokenAggregates = tokenTransactionsToCombine[request.tokenID]
        }
        for (const transaction of request.transactions) {
          if (tokenAggregates[tokenCounter].length < 8) {
            tokenAggregates[tokenCounter].push(transaction)
          } else {
            tokenCounter++
            tokenAggregates[tokenCounter] = [transaction]
          }
        }
        tokenTransactionsToCombine[request.tokenID] = tokenAggregates
      } else if (request.type === 'issuance') {
        issuances.push(request)
      }
    }

    // Clear Pending Chain
    this.removePendingRequests()

    // Add Token Sends
    for (const [tokenID, tokenTransactions] of Object.entries(tokenTransactionsToCombine)) {
      const tokenPromises = tokenTransactions.map((transactions): Promise<Request> => this.createTokenSendRequest(tokenID, transactions))
      await Promise.all(tokenPromises)
    }

    // Normal Sends
    const sendPromises = logosTransactionsToCombine.map((transactions): Promise<Request> => this.createSendRequest(transactions))
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
   * Returns the logos account JSON
   * #### Example
   * ```typescript
   * const logosAccountJSON = await logosAccount.toJSON()
   * ```
   */
  public toJSON (): LogosAccountJSON {
    const obj: LogosAccountJSON = super.toJSON()
    obj.privateKey = this.privateKey
    obj.tokenBalances = this.tokenBalances
    obj.tokens = this.tokens
    obj.type = this.type
    obj.index = this.index
    return obj
  }
}
