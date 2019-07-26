import Account, { AccountOptions, AccountJSON } from './Account';
import { Request as RpcRequest, Transaction } from '@logosnetwork/logos-rpc-client/dist/api';
import { Request } from './Requests';
import { IssuanceOptions } from './Requests/Issuance';
import { IssueAdditionalJSON } from './Requests/IssueAdditional';
import { ChangeSettingOptions } from './Requests/ChangeSetting';
import { ImmuteSettingOptions } from './Requests/ImmuteSetting';
import { RevokeOptions } from './Requests/Revoke';
import { AdjustUserStatusOptions } from './Requests/AdjustUserStatus';
import { AdjustFeeOptions } from './Requests/AdjustFee';
import { UpdateIssuerInfoOptions } from './Requests/UpdateIssuerInfo';
import { UpdateControllerOptions } from './Requests/UpdateController';
import { BurnOptions } from './Requests/Burn';
import { DistributeOptions } from './Requests/Distribute';
import { WithdrawFeeOptions } from './Requests/WithdrawFee';
import { WithdrawLogosOptions } from './Requests/WithdrawLogos';
import TokenAccount from './TokenAccount';
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
 * The Accounts contain the keys, chains, and balances.
 */
export default class LogosAccount extends Account {
    private _index;
    private _privateKey;
    private _tokens;
    private _tokenBalances;
    private _pendingTokenBalances;
    constructor(options?: LogosAccountOptions);
    /**
     * The type of the account (LogosAccount or TokenAccount)
     * @type {string}
     */
    readonly type: 'LogosAccount';
    /**
     * The index of the account
     * @type {number}
     * @readonly
     */
    readonly index: number;
    /**
     * The private key of the account
     * @type {string}
     * @readonly
     */
    readonly privateKey: string;
    /**
     * Array of associated token ids to this account (full list available only with fullsync)
     * @type {string[]}
     * @readonly
     */
    readonly tokens: string[];
    /**
     * The balance of the tokens in base token unit
     * @type {TokenBalances}
     * @readonly
     */
    readonly tokenBalances: TokenBalances;
    /**
     * The pending token balance of the account in base token
     *
     * pending token balance is balance minus the token sends that are pending
     *
     * @type {TokenBalances}
     * @readonly
     */
    readonly pendingTokenBalances: TokenBalances;
    /**
     * The balance of the given token in the base units
     * @param {string} tokenID - Token ID of the token in question, you can also send the token account address
     * @returns {string} the token account info object
     * @readonly
     */
    tokenBalance(token: string): string;
    /**
     * Adds a token to the accounts associated tokens if it doesn't already exist
     *
     * @param {string} tokenID - The TokenID you are associating with this account (this will be converted into a token account when stored)
     * @returns {string[]} Array of all the associated tokens
     */
    addToken(tokenID: string): Promise<string[]>;
    /**
     * Checks if the account is synced
     * @returns {Promise<SyncedResponse>}
     */
    isSynced(): Promise<SyncedResponse>;
    /**
     * Scans the account history using RPC and updates the local chain
     * @returns {Promise<Account>}
     */
    sync(): Promise<Account>;
    /**
     * Updates the balances of the account by traversing the chain
     * @returns {void}
     */
    updateBalancesFromChain(): void;
    /**
     * Updates the balances of the account by doing math on the previous balance when given a new request
     * Also updates the pending balance based on the new balance and the pending chain
     * @param {Request} request - request that is being calculated on
     * @returns {void}
     */
    updateBalancesFromRequest(request: Request): void;
    /**
     * Creates a request object from the mqtt info and adds the request to the appropriate chain
     *
     * @param {RequestOptions} requestInfo - Request information from the RPC or MQTT
     * @returns {Request}
     */
    addConfirmedRequest(requestInfo: RpcRequest): Promise<Request>;
    /**
     * Removes all pending requests from the pending chain
     * @returns {void}
     */
    removePendingRequests(): void;
    /**
     * Validates that the account has enough funds at the current time to publish the request
     *
     * @param {Request} request - Request Class
     * @returns {boolean}
     */
    validateRequest(request: Request): Promise<boolean>;
    /**
     * Adds the request to the pending chain and publishes it
     *
     * @param {Request} request - Request information from the RPC or MQTT
     * @throws An exception if the pending balance is less than the required amount to adjust a users status
     * @returns {Request}
     */
    addRequest(request: Request): Promise<Request>;
    /**
     * Creates a request from the specified information
     *
     * @param {Transaction[]} transactions - The account destinations and amounts you wish to send them
     * @throws An exception if the account has not been synced
     * @throws An exception if the pending balance is less than the required amount to do a send
     * @throws An exception if the request is rejected by the RPC
     * @returns {Promise<Request>} the request object
     */
    createSendRequest(transactions: Transaction[]): Promise<Request>;
    /**
     * Creates a request from the specified information
     *
     * @param {TokenIssuanceOptions} options - The options for the token creation
     * @throws An exception if the account has not been synced
     * @throws An exception if the pending balance is less than the required amount to do a token issuance
     * @throws An exception if the request is rejected by the RPC
     * @returns {Promise<Request>} the request object
     */
    createTokenIssuanceRequest(options: IssuanceOptions): Promise<Request>;
    /**
     * Gets tokenAccount
     *
     * @param {TokenRequest} options - Object contained the tokenID or tokenAccount
     * @throws An exception if no tokenID or tokenAccount
     * @returns {Promise<TokenAccount>} the token account info object
     */
    getTokenAccount(token: string | {
        token_id?: string;
        tokenID?: string;
        tokenAccount?: string;
        token_account?: string;
    }): Promise<TokenAccount>;
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
    createTokenSendRequest(token: string, transactions: Transaction[]): Promise<Request>;
    /**
     * Creates a IssueAdditional Token Request from the specified information
     *
     * @param {IssueAdditionalOptions} options - The Token ID & amount
     * @throws An exception if the token account balance is less than the required amount to do a issue additional token request
     * @returns {Promise<Request>} the request object
     */
    createIssueAdditionalRequest(options: IssueAdditionalJSON): Promise<Request>;
    /**
     * Creates a ChangeSetting Token Request from the specified information
     *
     * @param {ChangeSettingOptions} options - Token ID, setting, value
     * @throws An exception if the token account balance is less than the required amount to do a change setting token request
     * @returns {Promise<Request>} the request object
     */
    createChangeSettingRequest(options: ChangeSettingOptions): Promise<Request>;
    /**
     * Creates a ImmuteSetting Token Request from the specified information
     *
     * @param {ImmuteSettingOptions} options - Token ID, setting
     * @throws An exception if the token account balance is less than the required amount to do a immute setting token request
     * @returns {Promise<Request>} the request object
     */
    createImmuteSettingRequest(options: ImmuteSettingOptions): Promise<Request>;
    /**
     * Creates a Revoke Token Request from the specified information
     *
     * @param {RevokeOptions} options - Token ID, transaction, source
     * @throws An exception if the token account balance is less than the required amount to do a Revoke token request
     * @returns {Promise<Request>} the request object
     */
    createRevokeRequest(options: RevokeOptions): Promise<Request>;
    /**
     * Creates a request from the specified information
     *
     * @param {AdjustUserStatusOptions} options - The Token ID, account, and status
     * @throws An exception if the pending balance is less than the required amount to adjust a users status
     * @returns {Promise<Request>} the request object
     */
    createAdjustUserStatusRequest(options: AdjustUserStatusOptions): Promise<Request>;
    /**
     * Creates a request from the specified information
     *
     * @param {AdjustFeeOptions} options - The Token ID, feeRate, and feeType
     * @throws An exception if the pending balance is less than the required amount to do a token distibution
     * @returns {Promise<Request>} the request object
     */
    createAdjustFeeRequest(options: AdjustFeeOptions): Promise<Request>;
    /**
     * Creates a request from the specified information
     *
     * @param {UpdateIssuerInfoOptions} options - The Token ID and issuerInfo
     * @throws An exception if the pending balance is less than the required amount to Update Issuer Info
     * @returns {Promise<Request>} the request object
     */
    createUpdateIssuerInfoRequest(options: UpdateIssuerInfoOptions): Promise<Request>;
    /**
     * Creates a request from the specified information
     *
     * @param {UpdateControllerOptions} options - The Token ID, action ('add' or 'remove'), and controller
     * @throws An exception if the pending balance is less than the required amount to Update Controller
     * @returns {Promise<Request>} the request object
     */
    createUpdateControllerRequest(options: UpdateControllerOptions): Promise<Request>;
    /**
     * Creates a Burn Token Request from the specified information
     *
     * @param {BurnOptions} options - The Token ID & amount
     * @throws An exception if the token account balance is less than the required amount to do a burn token request
     * @returns {Promise<Request>} the request object
     */
    createBurnRequest(options: BurnOptions): Promise<Request>;
    /**
     * Creates a request from the specified information
     *
     * @param {TokenDistributeOptions} options - The Token ID & transaction
     * @throws An exception if the pending balance is less than the required amount to do a token distibution
     * @returns {Promise<Request>} the request object
     */
    createDistributeRequest(options: DistributeOptions): Promise<Request>;
    /**
     * Creates a request from the specified information
     *
     * @param {WithdrawFeeOptions} options - The Token ID & transaction
     * @throws An exception if the pending balance is less than the required amount to do a withdraw fee request
     * @returns {Promise<Request>} the request object
     */
    createWithdrawFeeRequest(options: WithdrawFeeOptions): Promise<Request>;
    /**
     * Creates a request from the specified information
     *
     * @param {WithdrawLogosOptions} options - The Token ID & transaction
     * @throws An exception if the pending balance is less than the required amount to do a withdraw logos request
     * @returns {Promise<Request>} the request object
     */
    createWithdrawLogosRequest(options: WithdrawLogosOptions): Promise<Request>;
    /**
     * Confirms the request in the local chain
     *
     * @param {MQTTRequestOptions} requestInfo The request from MQTT
     * @returns {Promise<void>}
     */
    processRequest(requestInfo: RpcRequest): Promise<void>;
    /**
     * Determines if you shold combine requests
     *
     * Returns true if the pending chain has x sends and
     * the count of total transactions is <= (x-minimumSaved) * 8
     *
     * @param {number} minimumSaved The minimum amount of requests saved in order to combine defaults to 1
     * @returns {boolean}
     */
    private shouldCombine;
    /**
     * Batchs send requests
     *
     * @returns {Promise<void>}
     */
    private combineRequests;
    /**
     * Returns the logos account JSON
     * @returns {LogosAccountJSON} JSON request
     */
    toJSON(): LogosAccountJSON;
}
export {};
