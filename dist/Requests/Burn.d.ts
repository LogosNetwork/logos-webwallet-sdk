import TokenRequest, { TokenRequestOptions, TokenRequestJSON } from './TokenRequest';
export interface BurnOptions extends TokenRequestOptions {
    amount?: string;
}
export interface BurnJSON extends TokenRequestJSON {
    amount?: string;
}
export default class Burn extends TokenRequest {
    private _amount;
    constructor(options?: BurnOptions);
    /**
    * Return the amount you are adding
    * @type {string}
    */
    amount: string;
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
     * @returns {BurnJSON} JSON request
     */
    toJSON(): BurnJSON;
}
