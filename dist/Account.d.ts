import { Request, RequestJSON } from './Requests';
import Wallet from './Wallet';
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
    private _label;
    private _address;
    private _publicKey;
    private _balance;
    private _pendingBalance;
    private _chain;
    private _receiveChain;
    private _pendingChain;
    private _previous;
    private _sequence;
    private _version;
    private _wallet;
    private _synced;
    constructor(options?: AccountOptions);
    /**
     * The label of the account
     * @type {string}
     */
    label: string;
    /**
     * The address of the account
     * @type {string}
     * @readonly
     */
    readonly address: string;
    /**
     * The public key of the account
     * @type {string}
     * @readonly
     */
    readonly publicKey: string;
    /**
     * The balance of the account in reason
     * @type {string}
     */
    balance: string;
    /**
     * The pending balance of the account in reason
     *
     * pending balance is balance minus the sends that are pending
     *
     * @type {string}
     * @readonly
     */
    pendingBalance: string;
    /**
     * The wallet this account belongs to
     * @type {Wallet}
     * @readonly
     */
    wallet: Wallet;
    /**
     * array of confirmed requests on the account
     * @type {Request[]}
     */
    chain: Request[];
    /**
     * array of confirmed receive requests on the account
     * @type {Request[]}
     */
    receiveChain: Request[];
    /**
     * array of pending requests on the account
     *
     * These requests have been sent for consensus but we haven't heard back on if they are confirmed yet.
     *
     * @type {Request[]}
     */
    pendingChain: Request[];
    /**
     * Gets the total number of requests on the send chain
     *
     * @type {number} count of all the requests
     * @readonly
     */
    readonly requestCount: number;
    /**
     * Gets the total number of requests on the pending chain
     *
     * @type {number} count of all the requests
     * @readonly
     */
    readonly pendingRequestCount: number;
    /**
     * Gets the total number of requests on the receive chain
     *
     * @type {number} count of all the requests
     * @readonly
     */
    readonly receiveCount: number;
    /**
     * Return the previous request as hash
     * @type {string}
     * @returns {string} hash of the previous transaction
     * @readonly
     */
    readonly previous: string;
    /**
     * Return the sequence value
     * @type {number}
     * @returns {number} sequence of for the next transaction
     * @readonly
     */
    readonly sequence: number;
    /**
     * If the account has been synced with the RPC
     * @type {boolean}
     */
    synced: boolean;
    /**
     * Account version of webwallet SDK
     * @type {number}
     * @readonly
     */
    readonly version: number;
    /**
     * Verify the integrity of the send & pending chains
     *
     * @returns {boolean}
     */
    verifyChain(): boolean;
    /**
     * Verify the integrity of the receive chain
     *
     * @throws An exception if there is an invalid request in the receive requestchain
     * @returns {boolean}
     */
    verifyReceiveChain(): boolean;
    /**
     * Retreives requests from the send chain
     *
     * @param {number} count - Number of requests you wish to retrieve
     * @param {number} offset - Number of requests back from the frontier tip you wish to start at
     * @returns {Request[]} all the requests
     */
    recentRequests(count?: number, offset?: number): Request[];
    /**
     * Retreives pending requests from the send chain
     *
     * @param {number} count - Number of requests you wish to retrieve
     * @param {number} offset - Number of requests back from the frontier tip you wish to start at
     * @returns {Request[]} all the requests
     */
    recentPendingRequests(count?: number, offset?: number): Request[];
    /**
     * Retreives requests from the receive chain
     *
     * @param {number} count - Number of requests you wish to retrieve
     * @param {number} offset - Number of requests back from the frontier tip you wish to start at
     * @returns {Request[]} all the requests
     */
    recentReceiveRequests(count?: number, offset?: number): Request[];
    /**
     * Gets the requests up to a certain hash from the send chain
     *
     * @param {string} hash - Hash of the request you wish to stop retrieving requests at
     * @returns {Request[]} all the requests up to and including the specified request
     */
    getRequestsUpTo(hash: string): Request[];
    /**
     * Gets the requests up to a certain hash from the pending chain
     *
     * @param {string} hash - Hash of the request you wish to stop retrieving requests at
     * @returns {Request[]} all the requests up to and including the specified request
     */
    getPendingRequestsUpTo(hash: string): Request[];
    /**
     * Gets the requests up to a certain hash from the receive chain
     *
     * @param {string} hash - Hash of the request you wish to stop retrieving requests at
     * @returns {Request[]} all the requests up to and including the specified request
     */
    getReceiveRequestsUpTo(hash: string): Request[];
    /**
     * Removes all pending requests from the pending chain
     * @returns {void}
     */
    removePendingRequests(): void;
    /**
     * Called when a request is confirmed to remove it from the pending request pool
     *
     * @param {string} hash - The hash of the request we are confirming
     * @returns {boolean} true or false if the pending request was found and removed
     */
    removePendingRequest(hash: string): boolean;
    /**
     * Finds the request object of the specified request hash
     *
     * @param {string} hash - The hash of the request we are looking for
     * @returns {Request} null if no request object of the specified hash was found
     */
    getRequest(hash: string): Request;
    /**
     * Finds the request object of the specified request hash in the confirmed chain
     *
     * @param {string} hash - The hash of the request we are looking for
     * @returns {Request} false if no request object of the specified hash was found
     */
    getChainRequest(hash: string): Request;
    /**
     * Finds the request object of the specified request hash in the pending chain
     *
     * @param {string} hash - The hash of the request we are looking for
     * @returns {Request} false if no request object of the specified hash was found
     */
    getPendingRequest(hash: string): Request;
    /**
     * Finds the request object of the specified request hash in the recieve chain
     *
     * @param {string} hash - The hash of the request we are looking for
     * @returns {Request} false if no request object of the specified hash was found
     */
    protected getRecieveRequest(hash: string): Request;
    /**
     * Adds the request to the Receive chain if it doesn't already exist
     *
     * @param {Request} request - Request Object
     * @returns {void}
     */
    protected addToReceiveChain(request: Request): void;
    /**
     * Adds the request to the Send chain if it doesn't already exist
     *
     * @param {Request} request - Request Object
     * @returns {void}
     */
    protected addToSendChain(request: Request): void;
    /**
     * Validates that the account has enough funds at the current time to publish the request
     *
     * @param {Request} request - Request information from the RPC or MQTT
     * @returns {Promise<boolean>}
     */
    abstract validateRequest(request: Request): Promise<boolean>;
    /**
     * Broadcasts the first pending request
     *
     * @returns {Promise<Request>}
     */
    broadcastRequest(): Promise<Request>;
    /**
     * Adds the request to the pending chain and publishes it
     *
     * @param {Request} request - Request information from the RPC or MQTT
     * @throws An exception if the pending balance is less than the required amount to adjust a users status
     * @returns {Promise<Request>}
     */
    addRequest(request: Request): Promise<Request>;
    /**
     * Returns the base account JSON
     * @returns {AccountJSON} JSON request
     */
    toJSON(): AccountJSON;
}
