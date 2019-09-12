import mqttPattern from './Utils/mqttPattern'
import * as WebSocket from 'ws'
import ReconnectingWebSocket from 'reconnecting-websocket'
import Logos, { LogosConstructorOptions } from '@logosnetwork/logos-rpc-client'
import { AES, defaultMQTT, defaultRPC, testnetDelegates, uint8ToHex, stringToHex, Iso10126, hexToUint8, decToHex, accountFromHexKey } from './Utils/Utils'
import { pbkdf2Sync } from 'pbkdf2'
import * as nacl from 'tweetnacl/nacl'
import Blake2b from './Utils/blake2b'
import * as bigInt from 'big-integer'
import { connect, MqttClient } from 'mqtt'
import TokenAccount, { TokenAccountJSON, SyncedResponse } from './TokenAccount'
import LogosAccount, { LogosAccountJSON, LogosAccountOptions } from './LogosAccount'
import { Request, Issuance } from './Requests'
import { AccountOptions } from './Account'

export interface RPCOptions {
  proxy?: string;
  node: string;
}
interface AccountJSONMap {
  [address: string]: LogosAccountJSON;
}
interface TokenAccountJSONMap {
  [address: string]: TokenAccountJSON;
}
interface AccountMap {
  [address: string]: LogosAccount;
}
interface TokenAccountMap {
  [address: string]: TokenAccount;
}
interface WalletJSON {
  password: string;
  seed: string;
  deterministicKeyIndex: number;
  currentAccountAddress: string;
  accounts?: AccountJSONMap; 
  tokenAccounts?: TokenAccountJSONMap;
  walletID: string;
  batchSends: boolean;
  fullSync: boolean;
  lazyErrors: boolean;
  tokenSync: boolean;
  validateSync: boolean;
  mqtt: string;
  rpc: RPCOptions|false;
}

interface WalletOptions {
  password?: string;
  seed?: string;
  deterministicKeyIndex?: number;
  currentAccountAddress?: string;
  accounts?: AccountMap;
  tokenAccounts?: TokenAccountMap;
  walletID?: string;
  batchSends?: boolean;
  fullSync?: boolean;
  lazyErrors?: boolean;
  tokenSync?: boolean;
  validateSync?: boolean;
  ws?: boolean;
  mqtt?: string;
  rpc?: RPCOptions|false;
  version?: number;
}

/**
 * ## Wallet
 * The wallet is the primary way you will interact with the SDK.
 */
export default class Wallet {
  private _password: string

  private _deterministicKeyIndex: number

  private _currentAccountAddress: string

  private _walletID: string

  private _batchSends: boolean

  private _fullSync: boolean

  private _tokenSync: boolean

  private _validateSync: boolean

  private _lazyErrors: boolean

  private _rpc: RPCOptions|false

  private _iterations: number

  private _seed: string

  private _accounts: {
    [address: string]: LogosAccount;
  }

  private _tokenAccounts: {
    [address: string]: TokenAccount;
  }

  private _wsConnected: boolean

  private _mqtt: string

  private _ws: boolean

  private _mqttClient: MqttClient

  private _delegates: string[]

  /**
  * ### Instantiating
  * ```typescript
  * import Wallet from '@logosnetwork/logos-webwallet-sdk'
  * const wallet = new Wallet({
  *     password: null,
  *     seed: null,
  *     deterministicKeyIndex: 0,
  *     currentAccountAddress: null,
  *     accounts: {},
  *     tokenAccounts: {},
  *     walletID: null,
  *     batchSends: true,
  *     fullSync: true,
  *     lazyErrors: false,
  *     tokenSync: false,
  *     validateSync: true,
  *     ws: false,
  *     mqtt: defaultMQTT,
  *     rpc: defaultRPC
  * })
  * ```
  * 
  * All wallet options are optional defaults are shown in the example above
  * 
  * |Wallet Option| Description |
  * |--|--|
  * | [[password]] | Password is used to encrypt and decrypt the wallet data |
  * | [[seed]] | Seed is the deterministic entropy that we will use to generate key pairs from  |
  * | [[deterministicKeyIndex]] | index of where you wish to start generating key paris from |
  * | [[currentAccountAddress]] | the current selected account address |
  * | [[accounts]] | [[AccountMap]] of all the [[LogosAccount|logos accounts]] in the Wallet  |
  * | [[tokenAccounts]] | [[TokenAccountMap]] of all the [[TokenAccount|token accounts]] in the Wallet |
  * | [[walletID]] | identifier of this wallet instance |
  * | [[batchSends]] | when batchsends is true the SDK automatically combines send transactions to reduce overall amount of transactions |
  * | [[fullSync]] | when fullSync is true the SDK will load the full history of the TokenAccounts and Accounts in the system. This is recommend to be true when working with tokens. |
  * | [[lazyErrors]] | when lazyErrors is true the SDK will not throw errors for transactions that have insufficient funds and will queue the transactions until the account has the funds to complete the action. |
  * | [[tokenSync]] | when tokenSync is true the SDK will load and sync the TokenAccounts that have interacted with the LogosAccounts. |
  * | [[validateSync]] | when validateSync is true the SDK will check all signatures of all the requests in the account chains. This is recommended to be true but when syncing an account with a long history this can be computationally heavy. |
  * | [[ws]] | when ws is true connect to local logos node websocket. You should only use mqtt or ws not both! mqtt will take priority over WS the MQTT setup uses less resources at the current time. |
  * | [[mqtt]] | address of your mqtt server `'wss://pla.bs:8443'` is the default server. Check out the logos backend repo to run your own backend mqtt. |
  * | [[rpc]] | Node information of the delegates where you are sending requests to. This will change in the future as we get more core node functionality such as websockets and proper tx acceptor delegate lists. See [[RPCOptions]] |
  */
  public constructor (options: WalletOptions = {
    password: null,
    seed: null,
    deterministicKeyIndex: 0,
    currentAccountAddress: null,
    accounts: {},
    tokenAccounts: {},
    walletID: null,
    batchSends: true,
    fullSync: true,
    lazyErrors: false,
    tokenSync: false,
    validateSync: true,
    ws: false,
    mqtt: defaultMQTT,
    rpc: defaultRPC,
    version: 1
  }) {
    this.loadOptions(options)
  }

  private loadOptions (options: WalletOptions): void {
    /**
     * Password used to encrypt and decrypt the wallet data
     * @type {string}
     * @private
     */
    if (options.password !== undefined) {
      this._password = options.password
    } else {
      this._password = null
    }

    /**
     * Deterministic Key Index is used to generate accounts
     * @type {number}
     * @private
     */
    if (options.deterministicKeyIndex !== undefined) {
      this._deterministicKeyIndex = options.deterministicKeyIndex
    } else {
      this._deterministicKeyIndex = 0
    }

    /**
     * Current Account address is the public key of the current account
     * @type {string}
     * @private
     */
    if (options.currentAccountAddress !== undefined) {
      this._currentAccountAddress = options.currentAccountAddress
    } else {
      this._currentAccountAddress = null
    }

    /**
     * Wallet Identifer
     * @type {string}
     * @private
     */
    if (options.walletID !== undefined) {
      this._walletID = options.walletID
    } else {
      this._walletID = uint8ToHex(nacl.randomBytes(32))
    }

    /**
     * Batch Sends - When lots of requests are pending auto batch them togeather for speed
     * @type {boolean}
     * @private
     */
    if (options.batchSends !== undefined) {
      this._batchSends = options.batchSends
    } else {
      this._batchSends = true
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

    /**
     * Sync Tokens - Syncs all associated token's of the accounts on the account sync instead of on use
     * @type {boolean}
     * @private
     */
    if (options.tokenSync !== undefined) {
      this._tokenSync = options.tokenSync
    } else {
      this._tokenSync = false
    }

    /**
     * Validate Sync
     * if this option is true the SDK will generate hashes of each requests based on the content data and verify signatures
     * This should always be true when using a untrusted RPC node
     * @type {boolean}
     * @private
     */
    if (options.validateSync !== undefined) {
      this._validateSync = options.validateSync
    } else {
      this._validateSync = true
    }

    /**
     * Lazy Errors - Do not reject invalid requests when adding to pending chain
     *
     * Lazy errors will not prevent you from creating blocks but only from broadcasting them
     *
     * @type {boolean}
     * @private
     */
    if (options.lazyErrors !== undefined) {
      this._lazyErrors = options.lazyErrors
    } else {
      this._lazyErrors = false
    }

    /**
     * RPC enabled
     * @type {RPCOptions | false}
     * @private
     */
    if (options.rpc !== undefined) {
      this._rpc = options.rpc
    } else {
      this._rpc = defaultRPC
    }

    const delegates = this.rpcClient.epochs.delegateIPs()
    for (const index in delegates) {
      delegates[index] = testnetDelegates[delegates[index].ip]
    }
    for (const delegate of Object.values(delegates)) {
      this._delegates.push(delegate)
    }

    /**
     * PBKDF2 Iterations
     * I don't think people need to edit this
     * NIST guidelines recommend 10,000 so lets do that
     * @type {number}
     * @private
     */
    this._iterations = 10000

    /**
     * Seed used to generate accounts
     * @type {string} The 32 byte seed hex encoded
     * @private
     */
    if (options.seed !== undefined) {
      this._seed = options.seed
    } else {
      this._seed = uint8ToHex(nacl.randomBytes(32))
    }

    /**
     * Array of accounts in this wallet
     * @type {Map<string, Account>}
     * @private
     */
    if (options.accounts !== undefined) {
      this._accounts = {}
      for (const account in options.accounts) {
        if (this._currentAccountAddress === null) {
          this._currentAccountAddress = account
        }
        const accountOptions = options.accounts[account]
        accountOptions.wallet = this
        this._accounts[account] = new LogosAccount(accountOptions)
      }
    } else {
      this._accounts = {}
    }

    /**
     * Array of accounts in this wallet
     * @type {Map<string, TokenAccount>}
     * @private
     */
    if (options.tokenAccounts !== undefined) {
      this._tokenAccounts = {}
      for (const account in options.tokenAccounts) {
        const accountOptions = options.tokenAccounts[account]
        accountOptions.wallet = this
        this._tokenAccounts[account] = new TokenAccount(accountOptions)
      }
    } else {
      this._tokenAccounts = {}
    }

    /**
     * MQTT host to listen for data
     * @type {string | boolean} The mqtt websocket address (false if you don't want this)
     * @private
     */
    if (options.mqtt !== undefined) {
      this._mqtt = options.mqtt
    } else {
      this._mqtt = defaultMQTT
    }
    this._wsConnected = false
    this.wsConnect()
  }

  /**
   * The id of the wallet
   * #### Example
   * ```typescript
   * const walletID = wallet.walletID
   * ```
   */
  public get walletID (): string {
    return this._walletID
  }

  /**
   * The id of the wallet
   * #### Example
   * ```typescript
   * wallet.walletID = '2c0a4be6b9ccda9158ed96f0dd596f72dad66015e8444c64e2ea0b9c7e553ec6'
   * ```
   */
  public set walletID (id: string) {
    this._walletID = id
  }

  /**
   * Is the wallet batching requests
   * #### Example
   * ```typescript
   * const isBatchingSends = wallet.batchSends
   * ```
   */
  public get batchSends (): boolean {
    return this._batchSends
  }

  /**
   * Is the wallet batching requests
   * #### Example
   * ```typescript
   * wallet.batchSends = true
   * ```
   */
  public set batchSends (val: boolean) {
    this._batchSends = val
  }

  /**
   * Full Sync - syncs the entire send and recieve chains
   * This is recommend to be true when using an untrusted RPC node
   * In the future this will be safe when we have BLS sig validation of Request Blocks
   * #### Example
   * ```typescript
   * const isFullSyncing = wallet.fullSync
   * ```
   */
  public get fullSync (): boolean {
    return this._fullSync
  }

  /**
   * Full Sync - syncs the entire send and recieve chains
   * This is recommend to be true when using an untrusted RPC node
   * In the future this will be safe when we have BLS sig validation of Request Blocks
   * #### Example
   * ```typescript
   * wallet.fullSync = true
   * ```
   */
  public set fullSync (val: boolean) {
    this._fullSync = val
  }

  /**
   * Sync Tokens - Syncs all associated token's of the accounts on the account sync instead of on use
   * #### Example
   * ```typescript
   * const areTokensSyncing = wallet.tokenSync
   * ```
   */
  public get tokenSync (): boolean {
    return this._tokenSync
  }

  /**
   * Sync Tokens - Syncs all associated token's of the accounts on the account sync instead of on use
   * #### Example
   * ```typescript
   * wallet.tokenSync = false
   * ```
   */
  public set tokenSync (val: boolean) {
    this._tokenSync = val
  }

  /**
   * Validate Sync
   * if this option is true the SDK will generate hashes of each requests based on the content data and verify signatures
   * This should always be true when using a untrusted RPC node
   * #### Example
   * ```typescript
   * const isValidatingSignatures = wallet.validateSync
   * ```
   */
  public get validateSync (): boolean {
    return this._validateSync
  }

  /**
   * Validate Sync
   * if this option is true the SDK will generate hashes of each requests based on the content data and verify signatures
   * This should always be true when using a untrusted RPC node
   * #### Example
   * ```typescript
   * wallet.validateSync = false
   * ```
   */
  public set validateSync (val: boolean) {
    this._validateSync = val
  }

  /**
   * Lazy Errors allows you to add request that are not valid for the current pending balances to the pending chain
   * #### Example
   * ```typescript
   * const delayingErros = wallet.lazyErrors
   * ```
   */
  public get lazyErrors (): boolean {
    return this._lazyErrors
  }

  /**
   * Lazy Errors allows you to add request that are not valid for the current pending balances to the pending chain
   * #### Example
   * ```typescript
   * wallet.lazyErrors = false
   * ```
   */
  public set lazyErrors (val: boolean) {
    this._lazyErrors = val
  }

  /**
   * When ws is true connect to local logos node websocket
   * If mqtt is set then logos node websocket will not be used
   * #### Example
   * ```typescript
   * const usingLogosWebsocket = wallet.ws
   * ```
   */
  public get ws (): boolean {
    return this._ws
  }

  /**
   * When ws is true connect to local logos node websocket
   * If mqtt is set then logos node websocket will not be used
   * #### Example
   * ```typescript
   * wallet.ws = true
   * ```
   */
  public set ws (val: boolean) {
    this._ws = val
  }

  /**
   * [[AccountMap]] of all the [[LogosAccount|LogosAccounts]] in the wallet
   * #### Example
   * ```typescript
   * const accounts = wallet.accounts
   * ```
   */
  public get accounts (): AccountMap {
    return this._accounts
  }

  /**
   * [[AccountMap]] of all the [[LogosAccount|LogosAccounts]] in the wallet
   * #### Example
   * ```typescript
   * wallet.accounts = {
   *  'lgs_3e3j5tkog48pnny9dmfzj1r16pg8t1e76dz5tmac6iq689wyjfpiij4txtdo': new LogosAccount({
   *    privateKey: 34F0A37AAD20F4A260F0A5B3CB3D7FB50673212263E58A380BC10474BB039CE4
   *  })
   * }
   * ```
   */  
  public set accounts (accounts: AccountMap) {
    this._accounts = accounts
  }

  /**
   * [[TokenAccountMap]] of all the [[TokenAccount|TokenAccounts]] in the wallet
   * #### Example
   * ```typescript
   * const tokenAccounts = wallet.tokenAccounts
   * ```
   */
  public get tokenAccounts (): TokenAccountMap {
    return this._tokenAccounts
  }

  /**
   * Returns the current [[LogosAccount]] of the wallet
   * #### Example
   * ```typescript
   * const account = wallet.account
   * ```
   */
  public get account (): LogosAccount {
    return this.accounts[this.currentAccountAddress]
  }

  /**
   * The current account address
   * #### Example
   * ```typescript
   * const currentAccountAddress = wallet.currentAccountAddress
   * ```
   */
  public get currentAccountAddress (): string {
    return this._currentAccountAddress
  }

  /**
   * The current account address
   * #### Example
   * ```typescript
   * wallet.currentAccountAddress = 'lgs_3e3j5tkog48pnny9dmfzj1r16pg8t1e76dz5tmac6iq689wyjfpiij4txtdo'
   * ```
   */
  public set currentAccountAddress (address: string) {
    if (!Object.prototype.hasOwnProperty.call(this.accounts, address)) throw new Error(`Account ${address} does not exist in this wallet.`)
    this._currentAccountAddress = address
  }

  /**
   * The current balance of all the [[LogosAccount|LogosAccounts]] in reason
   * #### Example
   * ```typescript
   * const walletBalanceInReason = wallet.balance
   * ```
   */
  public get balance (): string {
    const totalBalance = bigInt(0)
    for (const account in this.accounts) {
      totalBalance.add(bigInt(this.accounts[account].balance))
    }
    return totalBalance.toString()
  }

  /**
   * The mqtt host for listening to confirmations from Logos consensus
   * #### Example
   * ```typescript
   * const mqttWsAddress = wallet.mqtt
   * ```
   */
  public get mqtt (): string {
    return this._mqtt
  }

  /**
   * The mqtt host for listening to confirmations from Logos consensus
   * #### Example
   * ```typescript
   * wallet.mqtt = 'wss://pla.bs:8443'
   * ```
   */
  public set mqtt (val: string) {
    this.mqttDisconnect()
    this._mqtt = val
    this.wsConnect()
  }

  /**
   * The [[RPCOptions]] for connecting to the RPC or set this to false to disable communication
   * #### Example
   * ```typescript
   * const rpcInfo = wallet.rpc
   * ```
   */
  public get rpc (): RPCOptions|false {
    return this._rpc
  }

  /**
   * The [[RPCOptions]] for connecting to the RPC or set this to false to disable communication
   * #### Example
   * ```typescript
   * wallet.rpc = {
   *  proxy: 'https://pla.bs',
   *  delegates: ['3.215.28.211', '3.214.93.111', '3.214.55.84', '3.214.51.200', '3.214.37.34', '3.214.209.198', '3.214.205.240', '3.214.204.82', '3.214.195.211', '3.214.188.128', '3.214.175.150', '3.213.75.16', '3.213.212.158', '3.213.17.31', '3.213.150.192', '3.213.110.174', '3.213.108.208', '3.212.255.243', '3.212.220.108', '3.209.93.207', '3.209.30.240', '3.208.253.215', '3.208.232.242', '18.233.235.87', '18.233.175.15', '18.211.221.254', '18.211.1.90', '18.208.239.123', '18.206.29.223', '18.204.189.145', '174.129.135.230', '100.25.175.142']
   * }
   * ```
   */  
  public set rpc (val: RPCOptions|false) {
    this._rpc = val
  }

  /**
   * Returns a Logos RPC Client Instance using the given delegate id
   *
   * @returns {Logos}
   * #### Example
   * ```typescript
   * const rpcClient = wallet.rpcClient
   * ```
   */
  public get rpcClient (): Logos {
    if (this.rpc) {
      const rpcInfo: LogosConstructorOptions = {
        url: this.rpc.node
      }
      if (this.rpc.proxy) rpcInfo.proxyURL = this.rpc.proxy
      return new Logos(rpcInfo)
    } else {
      return null
    }
  }

  /**
   * The password of the wallet
   * in the future we will remove the ability to store the password and request it in realtime so it is in memory for less time
   * #### Example
   * ```typescript
   * const password = wallet.password
   * ```
   */
  public get password (): string {
    return this._password
  }

  /**
   * The password of the wallet
   * in the future we will remove the ability to store the password and request it in realtime so it is in memory for less time
   * #### Example
   * ```typescript
   * wallet.password = 'password'
   * ```
   */  
  public set password (password: string) {
    this._password = password
  }

  /**
   * The current delegates of the network
   * #### Example
   * ```typescript
   * const delegates = wallet.delegates
   * ```
   */
  public get delegates (): string[] {
    return this._delegates
  }

  /**
   * The current delegates of the network
   * #### Example
   * ```typescript
   * wallet.delegates = ['http://3.215.28.211:55000'] // Should be 32 length but I cba
   * ```
   */  
  public set delegates (delegates: string[]) {
    this._delegates = delegates
  }

  /**
   * Return the seed of the wallet
   * in the future we will remove the ability to access the seed unless you pass a password
   * #### Example
   * ```typescript
   * wallet.seed = '6A4C54C619A784891D5DBCA1FCC5FA08D6B910B49A51BEA13C3DC913BB45AF13'
   * ```
   */  
  public set seed (hexSeed: string) {
    if (!/[0-9A-F]{64}/i.test(hexSeed)) throw new Error('Invalid Hex Seed.')
    this._seed = hexSeed
  }

  /**
   * Return the seed of the wallet
   * in the future we will remove the ability to access the seed unless you pass a password
   * #### Example
   * ```typescript
   * const seed = wallet.seed
   * ```
   */
  public get seed (): string {
    return this._seed
  }

  /**
   * Return boolean if all the accounts in the wallet are synced
   * #### Example
   * ```typescript
   * const isWalletSynced = wallet.synced
   * ```
   */
  public get synced (): boolean {
    for (const address in this.tokenAccounts) {
      if (!this.tokenAccounts[address].synced) {
        return false
      }
    }
    for (const address in this.accounts) {
      if (!this.accounts[address].synced) {
        return false
      }
    }
    return true
  }

  /**
   * Return all the requests that are pending in every [[LogosAccount]] in this wallet
   * #### Example
   * ```typescript
   * const pendingRequests = wallet.pendingRequests
   * ```
   */
  public get pendingRequests (): Request[] {
    const pendingRequests: Request[] = []
    for (const account of Object.values(this.accounts)) {
      pendingRequests.concat(account.pendingChain)
    }
    return pendingRequests
  }

  /**
   * Generates and sets a random seed for the wallet
   * 
   * #### Example
   * ```typescript
   * wallet.createSeed()
   * ```
   */
  public createSeed (overwrite = false): string {
    if (this.seed && !overwrite) throw new Error('Seed already exists. To overwrite set the seed or set overwrite to true')
    this.seed = uint8ToHex(nacl.randomBytes(32))
    return this.seed
  }

  /**
   * Adds a account to the wallet
   *
   * #### Example
   * ```typescript
   * wallet.addAccount(new LogosAccount(
   *   {
   *     privateKey: 34F0A37AAD20F4A260F0A5B3CB3D7FB50673212263E58A380BC10474BB039CE4
   *   }
   * ))
   * ```
   */
  public addAccount (account: LogosAccount): LogosAccount {
    this.accounts[account.address] = account
    if (this.mqtt && this._wsConnected) this.subscribe(`account/${account.address}`)
    return this.accounts[account.address]
  }

  /**
   * Removes an account to the wallet
   *
   * #### Example
   * ```typescript
   * wallet.removeAccount('lgs_3e3j5tkog48pnny9dmfzj1r16pg8t1e76dz5tmac6iq689wyjfpiij4txtdo')
   * ```
   */
  public removeAccount (address: string): boolean {
    if (this.accounts[address]) {
      delete this.accounts[address]
      if (this.mqtt && this._wsConnected) this.unsubscribe(`account/${address}`)
      if (address === this.currentAccountAddress) {
        this.currentAccountAddress = Object.keys(this.accounts)[0]
      }
      return true
    }
    return false
  }

  /**
   * Adds a tokenAccount to the wallet
   *
   * #### Example
   * ```typescript
   * const tokenAccount = await wallet.createTokenAccount('lgs_3q69z3kf6cq9n9smago3p1ptuyqy9pa3mdykyi9o8f7gnof47qdyxj9gejxd')
   * wallet.addTokenAccount(tokenAccount)
   * ```
   */
  public addTokenAccount (tokenAccount: TokenAccount): TokenAccount {
    this.tokenAccounts[tokenAccount.address] = tokenAccount
    if (this.mqtt && this._wsConnected) this.subscribe(`account/${tokenAccount.address}`)
    return this.tokenAccounts[tokenAccount.address]
  }

  /**
   * Create a TokenAccount
   *
   * You are allowed to add a tokenAccount using the address
   *
   * #### Example
   * ```typescript
   * const tokenAccount = await wallet.createTokenAccount('lgs_3q69z3kf6cq9n9smago3p1ptuyqy9pa3mdykyi9o8f7gnof47qdyxj9gejxd')
   * ```
   */
  public async createTokenAccount (address: string, issuance: Issuance = null): Promise<TokenAccount> {
    if (this.tokenAccounts[address]) {
      return this.tokenAccounts[address]
    } else {
      const tokenAccount = new TokenAccount({
        address: address,
        wallet: this,
        issuance: issuance
      })
      if (this.mqtt && this._wsConnected) this.subscribe(`account/${tokenAccount.address}`)
      this.tokenAccounts[tokenAccount.address] = tokenAccount
      if (this.rpc && !issuance) {
        await this.tokenAccounts[tokenAccount.address].sync()
      } else {
        if (!this.rpc) console.warn('RPC not ENABLED TOKEN ACTIONS - TokenAccount cannot sync')
        this.tokenAccounts[tokenAccount.address].synced = true
      }
      return this.tokenAccounts[tokenAccount.address]
    }
  }

  /**
   * Create an account
   *
   * You are allowed to create an account using your seed, precalculated account options, or a privateKey
   *
   * @param {LogosAccountOptions} options - the options to populate the account. If you send just private key it will generate the account from that privateKey. If you just send index it will genereate the account from that determinstic seed index.
   * @param {boolean} setCurrent - sets the current account to newly created accounts this is default true
   * @returns {Promise<LogosAccount>}
   * 
   * #### Example
   * ```typescript
   * const account = await wallet.createAccount()
   * ```
   */
  public async createAccount (options: LogosAccountOptions = null, setCurrent = true): Promise<LogosAccount> {
    let accountInfo = null
    if (options === null) { // No options generate from seed
      if (!this.seed) throw new Error('Cannot generate an account without a seed! Make sure to first set your seed or pass a private key or explicitly pass the options for the account.')
      accountInfo = this.generateAccountOptionsFromSeed(this._deterministicKeyIndex)
      this._deterministicKeyIndex++
    } else {
      if (options.privateKey !== undefined) {
        accountInfo = this.generateAccountOptionsFromPrivateKey(options.privateKey)
      } else if (options.index !== undefined) {
        if (!this.seed) throw new Error('Cannot generate an account without a seed! Make sure to first set your seed or pass a private key or explicitly pass the options for the account.')
        accountInfo = this.generateAccountOptionsFromSeed(options.index)
      } else {
        if (!this.seed) throw new Error('Cannot generate an account without a seed! Make sure to first set your seed or pass a private key or explicitly pass the options for the account.')
        accountInfo = this.generateAccountOptionsFromSeed(this._deterministicKeyIndex)
        this._deterministicKeyIndex++
      }
    }
    const accountOptions = {
      ...accountInfo,
      wallet: this,
      label: `Account ${Object.values(this.accounts).length}`
    }
    const account = new LogosAccount(accountOptions)
    this.addAccount(account)
    if (this.rpc) {
      await this.accounts[account.address].sync()
    } else {
      this.accounts[account.address].synced = true
    }
    if (setCurrent || this.currentAccountAddress === null) this.currentAccountAddress = account.address
    return this.accounts[account.address]
  }

  /**
   * Updates the balance of all the accounts
   * @returns {void}
   * #### Example
   * ```typescript
   * wallet.recalculateWalletBalancesFromChain()
   * ```
   */
  public recalculateWalletBalancesFromChain (): void {
    for (const account of Object.values(this.accounts)) {
      account.updateBalancesFromChain()
    }
  }

  /**
   * Finds the request object of the specified hash of one of our accounts
   *
   * @param {string} hash - The hash of the request we are looking for the object of
   * @returns {Request | false } false if no request object of the specified hash was found
   * #### Example
   * ```typescript
   * wallet.getRequest('E8CA715349FFD12DE7CB76045CAAA52448655F3B34624A1E31514763C81C4795')
   * ```
   */
  public getRequest (hash: string): Request | false {
    for (const account of Object.values(this.accounts)) {
      const request = account.getRequest(hash)
      if (request) {
        return request
      }
      return false
    }
    return false
  }

  /**
   * Encrypts and packs the wallet data in a hex string
   *
   * @returns {string}
   * #### Example
   * ```typescript
   * wallet.encrypt()
   * ```
   */
  public encrypt (): string {
    let encryptedWallet = JSON.stringify(this.toJSON())
    encryptedWallet = stringToHex(encryptedWallet)
    const WalletBuffer = Buffer.from(encryptedWallet, 'hex')

    const checksum = new Blake2b().update(WalletBuffer).digest() as Uint8Array

    const salt = Buffer.from(nacl.randomBytes(16))
    let localPassword = ''
    if (!this._password) {
      localPassword = 'password'
    } else {
      localPassword = this._password
    }
    const key = pbkdf2Sync(localPassword, salt, this._iterations, 32, 'sha512')

    const options = {
      mode: AES.CBC,
      padding: Iso10126
    }
    const encryptedBytes = AES.encrypt(WalletBuffer, key, salt, options)

    const payload = Buffer.concat([Buffer.from(checksum), salt, encryptedBytes])

    // decrypt to check if wallet was corrupted during ecryption somehow
    if (this.decrypt(payload) === false) {
      return this.encrypt() // try again, shouldnt happen often
    }
    return payload.toString('hex')
  }

  /**
   * Scans the accounts to make sure they are synced and if they are not synced it syncs them
   *
   * @param {boolean} - encrypted wallet
   * @returns {Promise<boolean>}
   * #### Example
   * ```typescript
   * const isWalletSynced = await wallet.sync()
   * ```
   */
  public async sync (force = false): Promise<boolean> {
    return new Promise<boolean>((resolve): void => {
            type SyncedPromises = Promise<SyncedResponse>[]
            const isSyncedPromises: SyncedPromises = []
            for (const account in this.accounts) {
              if (!this.accounts[account].synced || force) {
                isSyncedPromises.push(this.accounts[account].isSynced())
              }
            }
            for (const tokenAccount in this.tokenAccounts) {
              if (!this.tokenAccounts[tokenAccount].synced || force) {
                isSyncedPromises.push(this.tokenAccounts[tokenAccount].isSynced())
              }
            }
            if (isSyncedPromises.length > 0) {
              Promise.all(isSyncedPromises).then((values): void => {
                const syncPromises = []
                for (const isSynced of values) {
                  if (!isSynced.synced) {
                    if (isSynced.type === 'LogosAccount') {
                      syncPromises.push(this.accounts[isSynced.account].sync())
                    } else if (isSynced.type === 'TokenAccount') {
                      if (isSynced.remove) {
                        delete this.tokenAccounts[isSynced.account]
                      } else {
                        syncPromises.push(this.tokenAccounts[isSynced.account].sync())
                      }
                    }
                  }
                }
                if (syncPromises.length > 0) {
                  Promise.all(syncPromises).then((): void => {
                    resolve(true)
                  })
                } else {
                  resolve(true)
                }
              })
            } else {
              resolve(true)
            }
    })
  }

  /**
   * Constructs the wallet from an encrypted base64 encoded wallet and the password
   *
   * @param {string} - encrypted wallet
   * @returns {Wallet} wallet data
   * #### Example
   * ```typescript
   * const wallet = wallet.load(encryptedWalletData)
   * ```
   */
  public load (encryptedWallet: string): Wallet {
    this.accounts = {}
    const decryptedBytes = this.decrypt(encryptedWallet)
    if (decryptedBytes === false) throw new Error('Wallet is corrupted or has been tampered.')
    const walletData = JSON.parse(decryptedBytes.toString('utf8'))
    this.loadOptions(walletData)
    return this
  }

  /**
   * Decrypts the wallet data
   *
   * @param {Buffer | string} - encrypted wallet
   * @returns {Buffer | false} The request data or returns false if it is unable to decrypt the data
   * @private
   */
  private decrypt (encryptedWallet: Buffer | string): Buffer | false {
    let bytes = null
    if (encryptedWallet instanceof Buffer) {
      bytes = encryptedWallet
    } else {
      bytes = Buffer.from(encryptedWallet, 'hex')
    }
    const checksum = bytes.slice(0, 32)
    const salt = bytes.slice(32, 48)
    const payload = bytes.slice(48)
    let localPassword = ''
    if (!this._password) {
      localPassword = 'password'
    } else {
      localPassword = this._password
    }
    const key = pbkdf2Sync(localPassword, salt, this._iterations, 32, 'sha512')

    const options = {
      padding: Iso10126
    }
    const decryptedBytes = AES.decrypt(payload, key, salt, options)

    const hash = new Blake2b().update(decryptedBytes).digest('hex') as string
    if (hash !== checksum.toString('hex').toUpperCase()) return false
    return decryptedBytes
  }

  /**
   * Generates an account based on the determinstic index of the key
   *
   * @param {number} - The determinstic seed index
   * @returns {AccountOptions} The minimal account options to create the account
   * @private
   */
  private generateAccountOptionsFromSeed (index: number): AccountOptions {
    if (this.seed.length !== 64) throw new Error('Invalid Seed.')
    const indexBytes = hexToUint8(decToHex(index, 4))

    const privateKey = new Blake2b()
      .update(hexToUint8(this.seed))
      .update(indexBytes)
      .digest() as Uint8Array
    const publicKey = nacl.sign.keyPair.fromSecretKey(privateKey).publicKey
    const address = accountFromHexKey(uint8ToHex(publicKey))

    return {
      privateKey: uint8ToHex(privateKey),
      publicKey: uint8ToHex(publicKey),
      address: address,
      index: index
    }
  }

  /**
   * Generates an account based on the given private key
   *
   * @param {string} - The private key
   * @returns {AccountOptions} The minimal account options to create the account
   * @private
   */
  private generateAccountOptionsFromPrivateKey (privateKey: string): AccountOptions {
    if (privateKey.length !== 64) throw new Error('Invalid Private Key length. Should be 32 bytes.')
    if (!/[0-9A-F]{64}/i.test(privateKey)) throw new Error('Invalid Hex Private Key.')
    const publicKey = nacl.sign.keyPair.fromSecretKey(hexToUint8(privateKey)).publicKey
    const address = accountFromHexKey(uint8ToHex(publicKey))
    return {
      privateKey: privateKey,
      publicKey: uint8ToHex(publicKey),
      address: address
    }
  }

  /**
   * Subscribe to the mqtt topic
   *
   * @param {string} topic - topic to subscribe to
   * @returns {void}
   * @private
   */
  private subscribe (topic: string): void {
    if (this._wsConnected && this._mqttClient) {
      this._mqttClient.subscribe(topic, (err): void => {
        if (!err) {
          console.info(`subscribed to ${topic}`)
        } else {
          console.error(err)
        }
      })
    }
  }

  /**
   * Unsubscribe to the mqtt topic
   *
   * @param {string} topic - topic to unsubscribe to
   * @returns {void}
   * @private
   */
  private unsubscribe (topic: string): void {
    if (this._wsConnected && this._mqttClient) {
      this._mqttClient.unsubscribe(topic, (err: Error): void => {
        if (!err) {
          console.info(`unsubscribed from ${topic}`)
        } else {
          console.error(err)
        }
      })
    }
  }

  /**
   * Disconnect from the mqtt
   *
   * @returns {void}
   * #### Example
   * ```typescript
   * wallet.mqttDisconnect()
   * ```
   */
  public mqttDisconnect (): void {
    this._mqttClient.end()
  }

  /**
   * Connect to the mqtt
   *
   * @returns {void}
   * #### Example
   * ```typescript
   * wallet.wsConnect()
   * ```
   */
  public wsConnect (): void {
    if (this.mqtt) {
      this._mqttClient = connect(this.mqtt)
      this._mqttClient.on('connect', (): void => {
        console.info('Webwallet SDK Connected to MQTT')
        this._wsConnected = true
        this.subscribe('delegateChange')
        for (const address of Object.keys(this.accounts)) {
          this.subscribe(`account/${address}`)
        }
        for (const tkAddress of Object.keys(this.tokenAccounts)) {
          this.subscribe(`account/${tkAddress}`)
        }
      })
      this._mqttClient.on('close', (): void => {
        this._wsConnected = false
        console.info('Webwallet SDK disconnected from MQTT')
      })
      this._mqttClient.on('message', (topic, request): void => {
        const requestObject = JSON.parse(request.toString())
        if (topic === 'delegateChange' && this.rpc) {
          console.info('MQTT Delegate Change')
          this.delegates = []
          for (const delegate of Object.values(requestObject)) {
            this.delegates.push(`http://${delegate}:55000`)
          }
        } else {
          const params = mqttPattern('account/+address', topic)
          if (params) {
            if (this.accounts[params.address as string]) {
              console.info(`MQTT Confirmation - Account - ${requestObject.type} - ${requestObject.sequence}`)
              this.accounts[params.address as string].processRequest(requestObject)
            } else if (this.tokenAccounts[params.address as string]) {
              console.info(`MQTT Confirmation - TK Account - ${requestObject.type} - ${requestObject.sequence}`)
              this.tokenAccounts[params.address as string].processRequest(requestObject)
            }
          }
        }
      })
    } else if (this.ws && this.rpc) {
      const ws = new ReconnectingWebSocket(`ws://${this.rpc.node}:18000`, [], {
        WebSocket,
        connectionTimeout: 1000,
        maxRetries: 1000,
        maxReconnectionDelay: 2000,
        minReconnectionDelay: 10
      })

      ws.onopen = () => {
        console.info('Webwallet SDK Connected to Logos Node Websocket')
        const confirmation_subscription = {
          "action": "subscribe", 
          "topic": "confirmation"
        }
        ws.send(JSON.stringify(confirmation_subscription))
      };

      ws.onmessage = msg => {
        console.log(msg.data)
        const json = JSON.parse(msg.data)
        if (json.topic === "confirmation") {
          console.log ('Confirmed', json.message.hash)
        }
      };
    }
  }

  /**
   * Returns the base Wallet JSON
   * @returns {WalletJSON} JSON request
   * #### Example
   * ```typescript
   * const walletJSON = wallet.toJSON()
   * ```
   */
  public toJSON (): WalletJSON {
    const obj: WalletJSON = {
      password: this.password,
      seed: this.seed,
      deterministicKeyIndex: this._deterministicKeyIndex,
      currentAccountAddress: this.currentAccountAddress,
      walletID: this.walletID,
      batchSends: this.batchSends,
      fullSync: this.fullSync,
      lazyErrors: this.lazyErrors,
      tokenSync: this.tokenSync,
      validateSync: this.validateSync,
      mqtt: this.mqtt,
      rpc: this.rpc
    }
    const tempAccounts = {}
    for (const account in this.accounts) {
      tempAccounts[account] = this.accounts[account].toJSON()
    }
    obj.accounts = tempAccounts
    const tempTokenAccounts = {}
    for (const account in this.tokenAccounts) {
      tempTokenAccounts[account] = this.tokenAccounts[account].toJSON()
    }
    obj.tokenAccounts = tempTokenAccounts
    return obj
  }
}
