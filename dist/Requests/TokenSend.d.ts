import TokenRequest, { TokenRequestOptions, TokenRequestJSON } from './TokenRequest';
import { Transaction } from '@logosnetwork/logos-rpc-client/dist/api';
interface TokenSendOptions extends TokenRequestOptions {
    transactions?: Transaction[];
    tokenFee?: string;
    token_fee?: string;
}
export interface TokenSendJSON extends TokenRequestJSON {
    transactions?: Transaction[];
    token_fee?: string;
}
export default class TokenSend extends TokenRequest {
    private _transactions;
    private _tokenFee;
    constructor(options?: TokenSendOptions);
    /**
    * Return the transactions
    * @type {Transaction[]}
    */
    transactions: Transaction[];
    /**
    * Return the string amount of the Token Fee in the base unit of the token
    * @type {string}
    */
    tokenFee: string;
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
     * Adds a tranction to the Token Send
     * @param {Transaction} transaction - transaction you want to add to this token send request
     * @returns {Transaction[]} list of all transactions
     */
    addTransaction(transaction: Transaction): Transaction[];
    /**
     * Returns the request JSON ready for broadcast to the Logos Network
     * @returns {TokenSendJSON} JSON request
     */
    toJSON(): TokenSendJSON;
}
export {};
