import TokenRequest, { TokenRequestOptions, TokenRequestJSON } from './TokenRequest';
export declare type Status = 'frozen' | 'unfrozen' | 'whitelisted' | 'not_whitelisted';
export interface AdjustUserStatusOptions extends TokenRequestOptions {
    account?: string;
    status?: Status;
}
export interface AdjustUserStatusJSON extends TokenRequestJSON {
    account?: string;
    status?: Status;
}
export default class AdjustUserStatus extends TokenRequest {
    private _account;
    private _status;
    constructor(options?: AdjustUserStatusOptions);
    /**
    * Returns the string of the status
    * @type {Status}
    */
    status: Status;
    /**
    * Return the account which the status is being changed
    * @type {string}
    */
    account: string;
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
     * @returns {AdjustUserStatusJSON} JSON request
     */
    toJSON(): AdjustUserStatusJSON;
}
