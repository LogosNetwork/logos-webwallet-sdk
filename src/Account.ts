import { GENESIS_HASH } from './Utils/Utils'
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
  Request,
  RequestJSON
} from './Requests'
import Wallet from './Wallet'
import TokenAccount from './TokenAccount'

export interface AccountJSON {
  label?: string;
  address?: string;
  publicKey?: string;
  balance?: string;
  chain?: RequestJSON[];
  receiveChain?: RequestJSON[];
  version?: number;
}

export interface AccountOptions {
  label?: string;
  address?: string;
  publicKey?: string;
  balance?: string;
  pendingBalance?: string;
  timestamp?: string;
  wallet?: Wallet;
  chain?: RequestJSON[];
  receiveChain?: RequestJSON[];
  pendingChain?: RequestJSON[];
  version?: number;
}

export default abstract class Account {
  private _label: string

  private _address: string

  private _publicKey: string

  private _balance: string

  private _pendingBalance: string

  private _chain: Request[]

  private _receiveChain: Request[]

  private _pendingChain: Request[]

  private _previous: string

  private _sequence: number

  private _version: number

  private _wallet: Wallet

  private _synced: boolean

  public constructor (options: AccountOptions = {
    label: null,
    address: null,
    publicKey: null,
    balance: '0',
    pendingBalance: '0',
    wallet: null,
    chain: [],
    receiveChain: [],
    pendingChain: [],
    version: 1
  }) {
    if (new.target === Account) {
      throw new TypeError('Cannot construct Account instances directly. Account is an abstract class.')
    }

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
     * Address of this account
     * @type {string}
     * @private
     */
    if (options.address !== undefined) {
      this._address = options.address
    } else {
      this._address = null
    }

    /**
     * Public Key of this account
     * @type {string}
     * @private
     */
    if (options.publicKey !== undefined) {
      this._publicKey = options.publicKey
    } else {
      this._publicKey = null
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
     * Chain of the account
     * @type {Request[]}
     * @private
     */
    if (options.chain !== undefined) {
      this._chain = []
      for (const request of options.chain) {
        if (request.type === 'send') {
          this._chain.push(new Send(request))
        } else if (request.type === 'token_send') {
          this._chain.push(new TokenSend(request))
        } else if (request.type === 'issuance') {
          this._chain.push(new Issuance(request))
        } else if (request.type === 'issue_additional') {
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
      for (const request of options.receiveChain) {
        if (request.type === 'send') {
          this._receiveChain.push(new Send(request))
        } else if (request.type === 'token_send') {
          this._receiveChain.push(new TokenSend(request))
        } else if (request.type === 'distribute') {
          this._receiveChain.push(new Distribute(request))
        } else if (request.type === 'withdraw_fee') {
          this._receiveChain.push(new WithdrawFee(request))
        } else if (request.type === 'revoke') {
          this._receiveChain.push(new Revoke(request))
        } else if (request.type === 'withdraw_logos') {
          this._receiveChain.push(new WithdrawLogos(request))
        } else if (request.type === 'issuance') {
          this._receiveChain.push(new Issuance(request))
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
      for (const request of options.pendingChain) {
        if (request.type === 'send') {
          this._pendingChain.push(new Send(request))
        } else if (request.type === 'token_send') {
          this._pendingChain.push(new TokenSend(request))
        } else if (request.type === 'issuance') {
          this._pendingChain.push(new Issuance(request))
        } else if (request.type === 'issue_additional') {
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
     * Previous hexadecimal hash of the last confirmed or pending request
     * @type {string}
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
   * The label of the account
   * @type {string}
   */
  public get label (): string {
    if (this._label !== null) {
      return this._label
    } else if (this instanceof TokenAccount) {
      return `${this.name} (${this.symbol})`
    }
    return null
  }

  public set label (label: string) {
    this._label = label
  }

  /**
   * The address of the account
   * @type {string}
   * @readonly
   */
  public get address (): string {
    return this._address
  }

  /**
   * The public key of the account
   * @type {string}
   * @readonly
   */
  public get publicKey (): string {
    return this._publicKey
  }

  /**
   * The balance of the account in reason
   * @type {string}
   */
  public get balance (): string {
    return this._balance
  }

  public set balance (amount: string) {
    this._balance = amount
  }

  /**
   * The pending balance of the account in reason
   *
   * pending balance is balance minus the sends that are pending
   *
   * @type {string}
   * @readonly
   */
  public get pendingBalance (): string {
    return this._pendingBalance
  }

  public set pendingBalance (amount: string) {
    this._pendingBalance = amount
  }

  /**
   * The wallet this account belongs to
   * @type {Wallet}
   * @readonly
   */
  public get wallet (): Wallet {
    return this._wallet
  }

  public set wallet (wallet: Wallet) {
    this._wallet = wallet
  }

  /**
   * array of confirmed requests on the account
   * @type {Request[]}
   */
  public get chain (): Request[] {
    return this._chain
  }

  public set chain (val: Request[]) {
    this._chain = val
  }

  /**
   * array of confirmed receive requests on the account
   * @type {Request[]}
   */
  public get receiveChain (): Request[] {
    return this._receiveChain
  }

  public set receiveChain (val: Request[]) {
    this._receiveChain = val
  }

  /**
   * array of pending requests on the account
   *
   * These requests have been sent for consensus but we haven't heard back on if they are confirmed yet.
   *
   * @type {Request[]}
   */
  public get pendingChain (): Request[] {
    return this._pendingChain
  }

  public set pendingChain (val: Request[]) {
    this._pendingChain = val
  }

  /**
   * Gets the total number of requests on the send chain
   *
   * @type {number} count of all the requests
   * @readonly
   */
  public get requestCount (): number {
    return this._chain.length
  }

  /**
   * Gets the total number of requests on the pending chain
   *
   * @type {number} count of all the requests
   * @readonly
   */
  public get pendingRequestCount (): number {
    return this._pendingChain.length
  }

  /**
   * Gets the total number of requests on the receive chain
   *
   * @type {number} count of all the requests
   * @readonly
   */
  public get receiveCount (): number {
    return this._receiveChain.length
  }

  /**
   * Return the previous request as hash
   * @type {string}
   * @returns {string} hash of the previous transaction
   * @readonly
   */
  public get previous (): string {
    if (this._pendingChain.length > 0) {
      this._previous = this._pendingChain[this.pendingChain.length - 1].hash
    } else if (this._chain.length > 0) {
      this._previous = this._chain[this._chain.length - 1].hash
    } else {
      this._previous = GENESIS_HASH
    }
    return this._previous
  }

  /**
   * Return the sequence value
   * @type {number}
   * @returns {number} sequence of for the next transaction
   * @readonly
   */
  public get sequence (): number {
    if (this._pendingChain.length > 0) {
      this._sequence = this._pendingChain[this.pendingChain.length - 1].sequence
    } else if (this._chain.length > 0) {
      this._sequence = this._chain[this._chain.length - 1].sequence
    } else {
      this._sequence = -1
    }
    return this._sequence + 1
  }

  /**
   * If the account has been synced with the RPC
   * @type {boolean}
   */
  public get synced (): boolean {
    return this._synced
  }

  public set synced (val) {
    this._synced = val
  }

  /**
   * Account version of webwallet SDK
   * @type {number}
   * @readonly
   */
  public get version (): number {
    return this._version
  }

  /**
   * Return the balance of the account in Logos
   * @returns {string}
   * @readonly
   */
  public get balanceInLogos (): string {
    return this.wallet.rpcClient.convert.fromReason(this.balance, 'LOGOS')
  }

  /**
   * Verify the integrity of the send & pending chains
   *
   * @returns {boolean}
   */
  public verifyChain (): boolean {
    let last = GENESIS_HASH
    for (const request of this.chain) {
      if (request) {
        if (request.previous !== last) throw new Error('Invalid Chain (prev != current hash)')
        if (!request.verify()) throw new Error('Invalid request in this chain')
        last = request.hash
      }
    }
    for (const request of this.pendingChain) {
      if (request) {
        if (request.previous !== last) throw new Error('Invalid Pending Chain (prev != current hash)')
        if (!request.verify()) throw new Error('Invalid request in the pending chain')
        last = request.hash
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
  public verifyReceiveChain (): boolean {
    for (const request of this.receiveChain) {
      if (!request.verify()) throw new Error('Invalid request in the receive chain')
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
  public recentRequests (count = 5, offset = 0): Request[] {
    const requests = []
    if (count > this._chain.length) count = this._chain.length
    for (let i = this._chain.length - 1 - offset; i > this._chain.length - 1 - count - offset; i--) {
      requests.push(this._chain[i])
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
  public recentPendingRequests (count = 5, offset = 0): Request[] {
    const requests = []
    if (count > this._pendingChain.length) count = this._pendingChain.length
    for (let i = this._pendingChain.length - 1 - offset; i > this._pendingChain.length - 1 - count - offset; i--) {
      requests.push(this._pendingChain[i])
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
  public recentReceiveRequests (count = 5, offset = 0): Request[] {
    const requests = []
    if (count > this._receiveChain.length) count = this._receiveChain.length
    for (let i = this._receiveChain.length - 1 - offset; i > this._receiveChain.length - 1 - count - offset; i--) {
      requests.push(this._receiveChain[i])
    }
    return requests
  }

  /**
   * Gets the requests up to a certain hash from the send chain
   *
   * @param {string} hash - Hash of the request you wish to stop retrieving requests at
   * @returns {Request[]} all the requests up to and including the specified request
   */
  public getRequestsUpTo (hash: string): Request[] {
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
   * @param {string} hash - Hash of the request you wish to stop retrieving requests at
   * @returns {Request[]} all the requests up to and including the specified request
   */
  public getPendingRequestsUpTo (hash: string): Request[] {
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
   * @param {string} hash - Hash of the request you wish to stop retrieving requests at
   * @returns {Request[]} all the requests up to and including the specified request
   */
  public getReceiveRequestsUpTo (hash: string): Request[] {
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
  public removePendingRequests (): void {
    this._pendingChain = []
    this._pendingBalance = this._balance
  }

  /**
   * Called when a request is confirmed to remove it from the pending request pool
   *
   * @param {string} hash - The hash of the request we are confirming
   * @returns {boolean} true or false if the pending request was found and removed
   */
  public removePendingRequest (hash: string): boolean {
    for (const i in this._pendingChain) {
      const request = this._pendingChain[i]
      if (request.hash === hash) {
        this._pendingChain.splice(parseInt(i), 1)
        return true
      }
    }
    console.warn('Not found')
    return false
  }

  /**
   * Finds the request object of the specified request hash
   *
   * @param {string} hash - The hash of the request we are looking for
   * @returns {Request} null if no request object of the specified hash was found
   */
  public getRequest (hash: string): Request {
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
    return null
  }

  /**
   * Finds the request object of the specified request hash in the confirmed chain
   *
   * @param {string} hash - The hash of the request we are looking for
   * @returns {Request} false if no request object of the specified hash was found
   */
  public getChainRequest (hash: string): Request {
    for (let j = this._chain.length - 1; j >= 0; j--) {
      const blk = this._chain[j]
      if (blk.hash === hash) return blk
    }
    return null
  }

  /**
   * Finds the request object of the specified request hash in the pending chain
   *
   * @param {string} hash - The hash of the request we are looking for
   * @returns {Request} false if no request object of the specified hash was found
   */
  public getPendingRequest (hash: string): Request {
    for (let n = this._pendingChain.length - 1; n >= 0; n--) {
      const request = this._pendingChain[n]
      if (request.hash === hash) return request
    }
    return null
  }

  /**
   * Finds the request object of the specified request hash in the recieve chain
   *
   * @param {string} hash - The hash of the request we are looking for
   * @returns {Request} false if no request object of the specified hash was found
   */
  protected getRecieveRequest (hash: string): Request {
    for (let n = this._receiveChain.length - 1; n >= 0; n--) {
      const blk = this._receiveChain[n]
      if (blk.hash === hash) return blk
    }
    return null
  }

  /**
   * Adds the request to the Receive chain if it doesn't already exist
   *
   * @param {Request} request - Request Object
   * @returns {void}
   */
  protected addToReceiveChain (request: Request): void {
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
  protected addToSendChain (request: Request): void {
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
   * Validates that the account has enough funds at the current time to publish the request
   *
   * @param {Request} request - Request information from the RPC or MQTT
   * @returns {Promise<boolean>}
   */
  public abstract async validateRequest(request: Request): Promise<boolean>

  /**
   * Broadcasts the first pending request
   *
   * @returns {Promise<Request>}
   */
  public async broadcastRequest (): Promise<Request> {
    if (this.wallet.rpc && this._pendingChain.length > 0) {
      const request = this._pendingChain[0]
      if (!request.published && await this.validateRequest(request)) {
        request.published = true
        try {
          await request.publish(this.wallet.delegates, this.wallet.rpc.proxy)
        } catch (err) {
          console.error(err)
          this.removePendingRequests()
        }
        return request
      } else {
        console.info(`Request is already pending!`)
      }
    }
    return null
  }

  /**
   * Adds the request to the pending chain and publishes it
   *
   * @param {Request} request - Request information from the RPC or MQTT
   * @throws An exception if the pending balance is less than the required amount to adjust a users status
   * @returns {Promise<Request>}
   */
  public addRequest (request: Request): Promise<Request> {
    this._pendingChain.push(request)
    return this.broadcastRequest()
  }

  /**
   * Returns the base account JSON
   * @returns {AccountJSON} JSON request
   */
  public toJSON (): AccountJSON {
    const obj: AccountJSON = {}
    obj.label = this.label
    obj.address = this.address
    obj.publicKey = this.publicKey
    obj.balance = this.balance
    obj.chain = []
    for (const request of this.chain) {
      obj.chain.push(request.toJSON())
    }
    obj.receiveChain = []
    for (const request of this.receiveChain) {
      obj.receiveChain.push(request.toJSON())
    }
    obj.version = this.version
    return obj
  }
}
