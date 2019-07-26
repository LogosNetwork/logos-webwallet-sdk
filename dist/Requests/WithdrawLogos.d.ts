import TokenRequest, { TokenRequestOptions, TokenRequestJSON } from './TokenRequest';
import { Transaction } from '@logosnetwork/logos-rpc-client/dist/api';
export interface WithdrawLogosOptions extends TokenRequestOptions {
    transaction?: Transaction;
}
export interface WithdrawLogosJSON extends TokenRequestJSON {
    transaction?: Transaction;
}
export default class WithdrawLogos extends TokenRequest {
    private _transaction;
    constructor(options?: WithdrawLogosOptions);
    /**
    * Return the previous request as hash
    * @type {Transaction}
    */
    transaction: Transaction;
    /**
     * Returns calculated hash or Builds the request and calculates the hash
     *
     * @throws An exception if missing parameters or invalid parameters
     * @type {string}
     * @readonly
     */
    readonly hash: string;
    /**
     * Returns the request JSON ready for broadcast to the Logos Network
     * @returns {WithdrawLogosJSON} JSON request
     */
    toJSON(): WithdrawLogosJSON;
}
