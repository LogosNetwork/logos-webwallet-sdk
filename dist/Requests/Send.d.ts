import Request, { RequestOptions, RequestJSON } from './Request';
import { Transaction } from '@logosnetwork/logos-rpc-client/dist/api';
interface SendOptions extends RequestOptions {
    transactions?: Transaction[];
}
export interface SendJSON extends RequestJSON {
    transactions?: Transaction[];
}
export default class Send extends Request {
    private _transactions;
    constructor(options?: SendOptions);
    /**
    * Return the previous request as hash
    * @type {Transaction[]}
    */
    transactions: Transaction[];
    /**
     * Returns the total amount contained in this request
     * @type {string}
     * @readonly
     */
    readonly totalAmount: string;
    /**
     * Returns calculated hash or Builds the request and calculates the hash
     *
     * @throws An exception if missing parameters or invalid parameters
     * @type {string}
     * @readonly
     */
    readonly hash: string;
    /**
     * Adds a tranction to the Send
     * @param {Transaction} transaction - transaction you want to add to this send request
     * @returns {Transaction[]} list of all transactions
     */
    addTransaction(transaction: Transaction): Transaction[];
    /**
     * Returns the request JSON ready for broadcast to the Logos Network
     * @returns {SendJSON} Send Request JSON
     */
    toJSON(): SendJSON;
}
export {};
