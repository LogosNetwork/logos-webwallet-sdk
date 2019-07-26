import Blake2b from '../Utils/blake2b';
export interface RequestOptions {
    origin?: string;
    previous?: string;
    sequence?: number | string;
    fee?: string;
    signature?: string;
    timestamp?: string;
    work?: string;
    type?: RequestType | string;
}
interface RequestType {
    text: string;
    value: number;
}
interface PublishOptions {
    proxy?: string;
    delegates: string[];
}
export interface RequestJSON {
    previous?: string;
    sequence?: number;
    origin?: string;
    fee?: string;
    work?: string;
    hash?: string;
    type?: string;
    signature?: string;
    timestamp?: string;
}
/**
 * The base class for all Requests.
 */
export default abstract class Request {
    private _signature;
    private _work;
    private _previous;
    private _fee;
    private _origin;
    private _sequence;
    private _timestamp;
    private _version;
    private _published;
    private _type;
    constructor(options?: RequestOptions);
    published: boolean;
    /**
     * Return the signature of the request
     * @type {string}
     * @readonly
     */
    signature: string;
    /**
     * Return the work of the request
     * @type {string}
     */
    work: string;
    /**
     * Return the previous request as hash
     * @type {string}
     */
    previous: string;
    /**
     * Return the string amount of the fee in reason
     * @type {string}
     */
    fee: string;
    /**
     * Return the the sequence of the request in the origin account
     * @type {number}
     */
    sequence: number;
    /**
     * Return the the timestamp of when the request was confirmed
     * @type {number}
     */
    timestamp: string;
    /**
     * The origin account public key
     * @type {string}
     * @readonly
     */
    origin: string;
    /**
     * The origin account address
     * @type {string}
     * @readonly
     */
    readonly originAccount: string;
    /**
     * Returns the type of this request
     * @type {string}
     * @readonly
     */
    readonly type: string;
    /**
     * Returns the type value of this request
     * @type {number}
     * @readonly
     */
    readonly typeValue: number;
    /**
     * Returns the version of this request
     * @type {number}
     * @readonly
     */
    readonly version: number;
    /**
     * Returns a hash for the request
     * @returns {string} - Hash
     */
    abstract readonly hash: string;
    /**
     * Creates a signature for the request
     * @param {string} privateKey - private key in hex
     * @returns {boolean} if the signature is valid
     */
    sign(privateKey: string): boolean;
    /**
     * Creates a Blake2b Context for the request
     * @returns {context} - Blake2b Context
     */
    requestHash(): Blake2b;
    /**
     * Verifies the request's integrity
     * @returns {boolean}
     */
    verify(): boolean;
    /**
     * Publishes the request
     * @param {RPCOptions} options - rpc options
     * @returns {Promise<{hash:string}>} response of transcation publish
     */
    publish(options?: PublishOptions): Promise<{
        hash: string;
    }>;
    /**
     * Returns the base request JSON
     * @returns {RequestJSON} RequestJSON as string
     */
    toJSON(): RequestJSON;
}
export {};
