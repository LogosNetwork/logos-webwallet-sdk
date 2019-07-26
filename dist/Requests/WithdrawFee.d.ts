import TokenRequest, { TokenRequestOptions, TokenRequestJSON } from './TokenRequest';
import { Transaction } from '@logosnetwork/logos-rpc-client/dist/api';
export interface WithdrawFeeOptions extends TokenRequestOptions {
    transaction?: Transaction;
}
export interface WithdrawFeeJSON extends TokenRequestJSON {
    transaction?: Transaction;
}
export default class WithdrawFee extends TokenRequest {
    private _transaction;
    constructor(options?: WithdrawFeeOptions);
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
     * @returns {WithdrawFeeJSON} JSON request
     */
    toJSON(): WithdrawFeeJSON;
}
