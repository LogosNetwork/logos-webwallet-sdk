import mqttPattern from './Utils/mqttPattern'
import Logos from '@logosnetwork/logos-rpc-client'
import { AES, defaultMQTT, defaultRPC, uint8ToHex, stringToHex, Iso10126, hexToUint8, decToHex, accountFromHexKey } from './Utils/Utils'
import { pbkdf2Sync } from 'pbkdf2'
import * as nacl from 'tweetnacl/nacl'
import Blake2b from './Utils/blake2b'
import * as bigInt from 'big-integer'
import { connect, MqttClient } from 'mqtt'
import LogosAccount, { LogosAccountJSON, LogosAccountOptions } from './LogosAccount'
import TokenAccount, { TokenAccountJSON, SyncedResponse } from './TokenAccount'
import { Request, Issuance } from './Requests'
import { AccountOptions } from './Account'

interface RPCOptions {
    proxy?: string;
    delegates: string[];
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
    mqtt?: string;
    rpc?: RPCOptions|false;
    version?: number;
}

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

    private _mqttConnected: boolean

    private _mqtt: string

    private _mqttClient: MqttClient

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
        this._mqttConnected = false
        this.mqttConnect()
    }

    /**
   * The id of the wallet
   * @type {string} The hex identifier of the wallet
   */
    public get walletID (): string {
        return this._walletID
    }

    public set walletID (id: string) {
        this._walletID = id
    }

    /**
   * Should the webwallet SDK batch requests
   * @type {boolean}
   */
    public get batchSends (): boolean {
        return this._batchSends
    }

    public set batchSends (val: boolean) {
        this._batchSends = val
    }

    /**
   * Full Sync - syncs the entire send and recieve chains
   * This is recommend to be true when using an untrusted RPC node
   * In the future this will be safe when we have BLS sig validation of Request Blocks
   * @type {boolean}
   */
    public get fullSync (): boolean {
        return this._fullSync
    }

    public set fullSync (val: boolean) {
        this._fullSync = val
    }

    /**
   * Sync Tokens - Syncs all associated token's of the accounts on the account sync instead of on use
   * @type {boolean}
   */
    public get tokenSync (): boolean {
        return this._tokenSync
    }

    public set tokenSync (val: boolean) {
        this._tokenSync = val
    }

    /**
   * Validate Sync
   * if this option is true the SDK will generate hashes of each requests based on the content data and verify signatures
   * This should always be true when using a untrusted RPC node
   * @type {boolean}
   */
    public get validateSync (): boolean {
        return this._validateSync
    }

    public set validateSync (val: boolean) {
        this._validateSync = val
    }

    /**
   * Lazy Errors allows you to add request that are not valid for the current pending balances to the pending chain
   * @type {boolean}
   */
    public get lazyErrors (): boolean {
        return this._lazyErrors
    }

    public set lazyErrors (val: boolean) {
        this._lazyErrors = val
    }

    /**
   * Array of all the accounts in the wallet
   * @type {AccountMap}
   * @readonly
   */
    public get accounts (): AccountMap {
        return this._accounts
    }

    /**
   * Map of all the TokenAccounts in the wallet
   * @type {TokenAccountMap}
   * @readonly
   */
    public get tokenAccounts (): TokenAccountMap {
        return this._tokenAccounts
    }

    /**
   * The current account
   * @type {LogosAccount}
   * @readonly
   */
    public get account (): LogosAccount {
        return this._accounts[this._currentAccountAddress]
    }

    /**
   * The current account address
   * @type {string}
   */
    public get currentAccountAddress (): string {
        return this._currentAccountAddress
    }

    public set currentAccountAddress (address: string) {
        if (!Object.prototype.hasOwnProperty.call(this._accounts, address)) throw new Error(`Account ${address} does not exist in this wallet.`)
        this._currentAccountAddress = address
    }

    /**
   * The current balance of all the wallets in reason
   * @type {string}
   * @readonly
   */
    public get balance (): string {
        const totalBalance = bigInt(0)
        for (const account in this._accounts) {
            totalBalance.add(bigInt(this._accounts[account].balance))
        }
        return totalBalance.toString()
    }

    /**
   * The mqtt host for listening to confirmations from Logos consensus
   * @type {string}
   */
    public get mqtt (): string {
        return this._mqtt
    }

    public set mqtt (val: string) {
        this.mqttDisconnect()
        this._mqtt = val
        this.mqttConnect()
    }

    /**
   * The rpc options for connecting to the RPC
   * @type {RPCOptions | false}
   */
    public get rpc (): RPCOptions|false {
        return this._rpc
    }

    public set rpc (val: RPCOptions|false) {
        this._rpc = val
    }

    public set password (password: string) {
        this._password = password
    }

    public set seed (hexSeed: string) {
        if (!/[0-9A-F]{64}/i.test(hexSeed)) throw new Error('Invalid Hex Seed.')
        this._seed = hexSeed
    }

    /**
   * Return the seed of the wallet
   * @type {string}
   */
    public get seed (): string {
        return this._seed
    }

    /**
   * Return boolean if all the accounts in the wallet are synced
   * @type {boolean}
   */
    public get synced (): boolean {
        for (const address in this._tokenAccounts) {
            if (!this._tokenAccounts[address].synced) {
                return false
            }
        }
        for (const address in this._accounts) {
            if (!this._accounts[address].synced) {
                return false
            }
        }
        return true
    }

    /**
   * Return all the requests that are pending in every account associated to this wallet
   * @type {Request[]}
   * @readonly
   */
    public get pendingRequests (): Request[] {
        const pendingRequests: Request[] = []
        for (const account of Object.values(this._accounts)) {
            pendingRequests.concat(account.pendingChain)
        }
        return pendingRequests
    }

    /**
   * Sets a random seed for the wallet
   *
   * @param {boolean} overwrite - Set to true to overwrite an existing seed
   * @throws An exception on existing seed
   * @returns {string}
   */
    public createSeed (overwrite: boolean = false): string {
        if (this._seed && !overwrite) throw new Error('Seed already exists. To overwrite set the seed or set overwrite to true')
        this._seed = uint8ToHex(nacl.randomBytes(32))
        return this._seed
    }

    /**
   * Adds a account to the wallet
   *
   * @param {LogosAccount} account - the account you wish to add
   * @returns {LogosAccount}
   */
    public addAccount (account: LogosAccount): LogosAccount {
        this._accounts[account.address] = account
        if (this._mqtt && this._mqttConnected) this.subscribe(`account/${account.address}`)
        return this._accounts[account.address]
    }

    /**
   * Removes an account to the wallet
   *
   * @param {string} address - the account you wish to remove
   * @returns {boolean}
   */
    public removeAccount (address: string): boolean {
        if (this._accounts[address]) {
            delete this._accounts[address]
            if (this._mqtt && this._mqttConnected) this.unsubscribe(`account/${address}`)
            if (address === this._currentAccountAddress) {
                this._currentAccountAddress = Object.keys(this._accounts)[0]
            }
            return true
        }
        return false
    }

    /**
   * Adds a tokenAccount to the wallet
   *
   * @param {TokenAccount} tokenAccount - the tokenAccount you wish to add
   * @returns {TokenAccount}
   */
    public addTokenAccount (tokenAccount: TokenAccount): TokenAccount {
        this._tokenAccounts[tokenAccount.address] = tokenAccount
        if (this._mqtt && this._mqttConnected) this.subscribe(`account/${tokenAccount.address}`)
        return this._tokenAccounts[tokenAccount.address]
    }

    /**
   * Create a TokenAccount
   *
   * You are allowed to add a tokenAccount using the address
   *
   * @param {string} address - address of the token account.
   * @returns {Promise<Account>}
   */
    public async createTokenAccount (address: string, issuance: Issuance = null): Promise<TokenAccount> {
        if (this._tokenAccounts[address]) {
            return this._tokenAccounts[address]
        } else {
            const tokenAccount = new TokenAccount({
                address: address,
                wallet: this,
                issuance: issuance
            })
            if (this._mqtt && this._mqttConnected) this.subscribe(`account/${tokenAccount.address}`)
            this._tokenAccounts[tokenAccount.address] = tokenAccount
            if (this._rpc && !issuance) {
                await this._tokenAccounts[tokenAccount.address].sync()
            } else {
                if (!this._rpc) console.warn('RPC not ENABLED TOKEN ACTIONS - TokenAccount cannot sync')
                this._tokenAccounts[tokenAccount.address].synced = true
            }
            return this._tokenAccounts[tokenAccount.address]
        }
    }

    /**
   * Create an account
   *
   * You are allowed to create an account using your seed, precalculated account options, or a privateKey
   *
   * @param {AccountOptions} options - the options to populate the account. If you send just private key it will generate the account from that privateKey. If you just send index it will genereate the account from that determinstic seed index.
   * @param {boolean} setCurrent - sets the current account to newly created accounts this is default true
   * @returns {Promise<Account>}
   */
    public async createAccount (options: LogosAccountOptions = null, setCurrent = true): Promise<LogosAccount> {
        let accountInfo = null
        if (options === null) { // No options generate from seed
            if (!this._seed) throw new Error('Cannot generate an account without a seed! Make sure to first set your seed or pass a private key or explicitly pass the options for the account.')
            accountInfo = this.generateAccountOptionsFromSeed(this._deterministicKeyIndex)
            this._deterministicKeyIndex++
        } else {
            if (options.privateKey !== undefined) {
                accountInfo = this.generateAccountOptionsFromPrivateKey(options.privateKey)
            } else if (options.index !== undefined) {
                if (!this._seed) throw new Error('Cannot generate an account without a seed! Make sure to first set your seed or pass a private key or explicitly pass the options for the account.')
                accountInfo = this.generateAccountOptionsFromSeed(options.index)
            } else {
                if (!this._seed) throw new Error('Cannot generate an account without a seed! Make sure to first set your seed or pass a private key or explicitly pass the options for the account.')
                accountInfo = this.generateAccountOptionsFromSeed(this._deterministicKeyIndex)
                this._deterministicKeyIndex++
            }
        }
        const accountOptions = {
            ...accountInfo,
            wallet: this,
            label: `Account ${Object.values(this._accounts).length}`
        }
        const account = new LogosAccount(accountOptions)
        this.addAccount(account)
        if (this._rpc) {
            await this._accounts[account.address].sync()
        } else {
            this._accounts[account.address].synced = true
        }
        if (setCurrent || this._currentAccountAddress === null) this._currentAccountAddress = account.address
        return this._accounts[account.address]
    }

    /**
   * Updates the balance of all the accounts
   * @returns {void}
   */
    public recalculateWalletBalancesFromChain (): void {
        for (const account of Object.values(this._accounts)) {
            account.updateBalancesFromChain()
        }
    }

    /**
   * Finds the request object of the specified hash of one of our accounts
   *
   * @param {string} hash - The hash of the request we are looking for the object of
   * @returns {Request | false } false if no request object of the specified hash was found
   */
    public getRequest (hash: string): Request | false {
        for (const account of Object.values(this._accounts)) {
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
   */
    public async sync (force = false): Promise<boolean> {
        return new Promise<boolean>((resolve): void => {
            type SyncedPromises = Promise<SyncedResponse>[]
            const isSyncedPromises: SyncedPromises = []
            for (const account in this._accounts) {
                if (!this._accounts[account].synced || force) {
                    isSyncedPromises.push(this._accounts[account].isSynced())
                }
            }
            for (const tokenAccount in this._tokenAccounts) {
                if (!this._tokenAccounts[tokenAccount].synced || force) {
                    isSyncedPromises.push(this._tokenAccounts[tokenAccount].isSynced())
                }
            }
            if (isSyncedPromises.length > 0) {
                Promise.all(isSyncedPromises).then((values): void => {
                    const syncPromises = []
                    for (const isSynced of values) {
                        if (!isSynced.synced) {
                            if (isSynced.type === 'LogosAccount') {
                                syncPromises.push(this._accounts[isSynced.account].sync())
                            } else if (isSynced.type === 'TokenAccount') {
                                if (isSynced.remove) {
                                    delete this._tokenAccounts[isSynced.account]
                                } else {
                                    syncPromises.push(this._tokenAccounts[isSynced.account].sync())
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
   * Returns a Logos RPC Client Instance using the given delegate id
   *
   * @param {number} delegateIndex - The delegate you wish to connect to
   * @returns {Logos}
   */
    public rpcClient (delegateIndex = 0): Logos {
        if (this.rpc) {
            return new Logos({
                url: `http://${this.rpc.delegates[delegateIndex]}:55000`,
                proxyURL: this.rpc.proxy
            })
        } else {
            return null
        }
    }

    /**
   * Constructs the wallet from an encrypted base64 encoded wallet
   *
   * @param {string} - encrypted wallet
   * @returns {Promise<Wallet>} wallet data
   */
    public load (encryptedWallet: string): Wallet {
        this._accounts = {}
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
        if (this._seed.length !== 64) throw new Error('Invalid Seed.')
        const indexBytes = hexToUint8(decToHex(index, 4))

        const privateKey = new Blake2b()
            .update(hexToUint8(this._seed))
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
        if (this._mqttConnected && this._mqttClient) {
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
        if (this._mqttConnected && this._mqttClient) {
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
   */
    public mqttDisconnect (): void {
        this._mqttClient.end()
    }

    /**
   * Connect to the mqtt
   *
   * @returns {void}
   */
    public mqttConnect (): void {
        if (this._mqtt) {
            this._mqttClient = connect(this._mqtt)
            this._mqttClient.on('connect', (): void => {
                console.info('Webwallet SDK Connected to MQTT')
                this._mqttConnected = true
                this.subscribe(`delegateChange`)
                for (const address of Object.keys(this._accounts)) {
                    this.subscribe(`account/${address}`)
                }
                for (const tkAddress of Object.keys(this._tokenAccounts)) {
                    this.subscribe(`account/${tkAddress}`)
                }
            })
            this._mqttClient.on('close', (): void => {
                this._mqttConnected = false
                console.info('Webwallet SDK disconnected from MQTT')
            })
            this._mqttClient.on('message', (topic, request): void => {
                const requestObject = JSON.parse(request.toString())
                if (topic === 'delegateChange' && this._rpc) {
                    console.info(`MQTT Delegate Change`)
                    this._rpc.delegates = Object.values(requestObject)
                } else {
                    const params = mqttPattern('account/+address', topic)
                    if (params) {
                        if (this._accounts[params.address as string]) {
                            console.info(`MQTT Confirmation - Account - ${requestObject.type} - ${requestObject.sequence}`)
                            this._accounts[params.address as string].processRequest(requestObject)
                        } else if (this._tokenAccounts[params.address as string]) {
                            console.info(`MQTT Confirmation - TK Account - ${requestObject.type} - ${requestObject.sequence}`)
                            this._tokenAccounts[params.address as string].processRequest(requestObject)
                        }
                    }
                }
            })
        }
    }

    /**
   * Returns the base Wallet JSON
   * @returns {WalletJSON} JSON request
   */
    public toJSON (): WalletJSON {
        const obj: WalletJSON = {
            password: this._password,
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
        for (const account in this._accounts) {
            tempAccounts[account] = this._accounts[account].toJSON()
        }
        obj.accounts = tempAccounts
        const tempTokenAccounts = {}
        for (const account in this._tokenAccounts) {
            tempTokenAccounts[account] = this._tokenAccounts[account].toJSON()
        }
        obj.tokenAccounts = tempTokenAccounts
        return obj
    }
}
