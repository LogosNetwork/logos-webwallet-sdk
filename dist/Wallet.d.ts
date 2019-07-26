import Logos from '@logosnetwork/logos-rpc-client';
import TokenAccount, { TokenAccountJSON } from './TokenAccount';
import LogosAccount, { LogosAccountJSON, LogosAccountOptions } from './LogosAccount';
import { Request, Issuance } from './Requests';
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
    rpc: RPCOptions | false;
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
    rpc?: RPCOptions | false;
    version?: number;
}
export default class Wallet {
    private _password;
    private _deterministicKeyIndex;
    private _currentAccountAddress;
    private _walletID;
    private _batchSends;
    private _fullSync;
    private _tokenSync;
    private _validateSync;
    private _lazyErrors;
    private _rpc;
    private _iterations;
    private _seed;
    private _accounts;
    private _tokenAccounts;
    private _mqttConnected;
    private _mqtt;
    private _mqttClient;
    constructor(options?: WalletOptions);
    private loadOptions;
    /**
     * The id of the wallet
     * @type {string} The hex identifier of the wallet
     */
    walletID: string;
    /**
     * Should the webwallet SDK batch requests
     * @type {boolean}
     */
    batchSends: boolean;
    /**
     * Full Sync - syncs the entire send and recieve chains
     * This is recommend to be true when using an untrusted RPC node
     * In the future this will be safe when we have BLS sig validation of Request Blocks
     * @type {boolean}
     */
    fullSync: boolean;
    /**
     * Sync Tokens - Syncs all associated token's of the accounts on the account sync instead of on use
     * @type {boolean}
     */
    tokenSync: boolean;
    /**
     * Validate Sync
     * if this option is true the SDK will generate hashes of each requests based on the content data and verify signatures
     * This should always be true when using a untrusted RPC node
     * @type {boolean}
     */
    validateSync: boolean;
    /**
     * Lazy Errors allows you to add request that are not valid for the current pending balances to the pending chain
     * @type {boolean}
     */
    lazyErrors: boolean;
    /**
     * Array of all the accounts in the wallet
     * @type {AccountMap}
     * @readonly
     */
    accounts: AccountMap;
    /**
     * Map of all the TokenAccounts in the wallet
     * @type {TokenAccountMap}
     * @readonly
     */
    readonly tokenAccounts: TokenAccountMap;
    /**
     * The current account
     * @type {LogosAccount}
     * @readonly
     */
    readonly account: LogosAccount;
    /**
     * The current account address
     * @type {string}
     */
    currentAccountAddress: string;
    /**
     * The current balance of all the wallets in reason
     * @type {string}
     * @readonly
     */
    readonly balance: string;
    /**
     * The mqtt host for listening to confirmations from Logos consensus
     * @type {string}
     */
    mqtt: string;
    /**
     * The rpc options for connecting to the RPC
     * @type {RPCOptions | false}
     */
    rpc: RPCOptions | false;
    password: string;
    /**
    * Return the seed of the wallet
    * @type {string}
    */
    seed: string;
    /**
     * Return boolean if all the accounts in the wallet are synced
     * @type {boolean}
     */
    readonly synced: boolean;
    /**
     * Return all the requests that are pending in every account associated to this wallet
     * @type {Request[]}
     * @readonly
     */
    readonly pendingRequests: Request[];
    /**
     * Sets a random seed for the wallet
     *
     * @param {boolean} overwrite - Set to true to overwrite an existing seed
     * @throws An exception on existing seed
     * @returns {string}
     */
    createSeed(overwrite?: boolean): string;
    /**
     * Adds a account to the wallet
     *
     * @param {LogosAccount} account - the account you wish to add
     * @returns {LogosAccount}
     */
    addAccount(account: LogosAccount): LogosAccount;
    /**
     * Removes an account to the wallet
     *
     * @param {string} address - the account you wish to remove
     * @returns {boolean}
     */
    removeAccount(address: string): boolean;
    /**
     * Adds a tokenAccount to the wallet
     *
     * @param {TokenAccount} tokenAccount - the tokenAccount you wish to add
     * @returns {TokenAccount}
     */
    addTokenAccount(tokenAccount: TokenAccount): TokenAccount;
    /**
     * Create a TokenAccount
     *
     * You are allowed to add a tokenAccount using the address
     *
     * @param {string} address - address of the token account.
     * @returns {Promise<Account>}
     */
    createTokenAccount(address: string, issuance?: Issuance): Promise<TokenAccount>;
    /**
     * Create an account
     *
     * You are allowed to create an account using your seed, precalculated account options, or a privateKey
     *
     * @param {AccountOptions} options - the options to populate the account. If you send just private key it will generate the account from that privateKey. If you just send index it will genereate the account from that determinstic seed index.
     * @param {boolean} setCurrent - sets the current account to newly created accounts this is default true
     * @returns {Promise<Account>}
     */
    createAccount(options?: LogosAccountOptions, setCurrent?: boolean): Promise<LogosAccount>;
    /**
     * Updates the balance of all the accounts
     * @returns {void}
     */
    recalculateWalletBalancesFromChain(): void;
    /**
     * Finds the request object of the specified hash of one of our accounts
     *
     * @param {string} hash - The hash of the request we are looking for the object of
     * @returns {Request | false } false if no request object of the specified hash was found
     */
    getRequest(hash: string): Request | false;
    /**
     * Encrypts and packs the wallet data in a hex string
     *
     * @returns {string}
     */
    encrypt(): string;
    /**
     * Scans the accounts to make sure they are synced and if they are not synced it syncs them
     *
     * @param {boolean} - encrypted wallet
     * @returns {Promise<boolean>}
     */
    sync(force?: boolean): Promise<boolean>;
    /**
     * Returns a Logos RPC Client Instance using the given delegate id
     *
     * @param {number} delegateIndex - The delegate you wish to connect to
     * @returns {Logos}
     */
    rpcClient(delegateIndex?: number): Logos;
    /**
     * Constructs the wallet from an encrypted base64 encoded wallet
     *
     * @param {string} - encrypted wallet
     * @returns {Promise<Wallet>} wallet data
     */
    load(encryptedWallet: string): Wallet;
    /**
     * Decrypts the wallet data
     *
     * @param {Buffer | string} - encrypted wallet
     * @returns {Buffer | false} The request data or returns false if it is unable to decrypt the data
     * @private
     */
    private decrypt;
    /**
     * Generates an account based on the determinstic index of the key
     *
     * @param {number} - The determinstic seed index
     * @returns {AccountOptions} The minimal account options to create the account
     * @private
     */
    private generateAccountOptionsFromSeed;
    /**
     * Generates an account based on the given private key
     *
     * @param {string} - The private key
     * @returns {AccountOptions} The minimal account options to create the account
     * @private
     */
    private generateAccountOptionsFromPrivateKey;
    /**
     * Subscribe to the mqtt topic
     *
     * @param {string} topic - topic to subscribe to
     * @returns {void}
     * @private
     */
    private subscribe;
    /**
     * Unsubscribe to the mqtt topic
     *
     * @param {string} topic - topic to unsubscribe to
     * @returns {void}
     * @private
     */
    private unsubscribe;
    /**
     * Disconnect from the mqtt
     *
     * @returns {void}
     */
    mqttDisconnect(): void;
    /**
     * Connect to the mqtt
     *
     * @returns {void}
     */
    mqttConnect(): void;
    /**
     * Returns the base Wallet JSON
     * @returns {WalletJSON} JSON request
     */
    toJSON(): WalletJSON;
}
export {};
