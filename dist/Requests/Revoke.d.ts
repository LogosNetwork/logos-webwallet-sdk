import TokenRequest, { TokenRequestOptions, TokenRequestJSON } from './TokenRequest';
import { Transaction } from '@logosnetwork/logos-rpc-client/dist/api';
export interface RevokeOptions extends TokenRequestOptions {
    source?: string;
    transaction?: Transaction;
}
export interface RevokeJSON extends TokenRequestJSON {
    source?: string;
    transaction?: Transaction;
}
export default class Revoke extends TokenRequest {
    private _source;
    private _transaction;
    constructor(options?: RevokeOptions);
    /**
    * Return the previous request as hash
    * @type {Transaction}
    */
    transaction: Transaction;
    /**
    * Return where the token is being revoked from
    * @type {string}
    */
    source: string;
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
     * @returns {RevokeJSON} JSON request
     */
    toJSON(): RevokeJSON;
}
