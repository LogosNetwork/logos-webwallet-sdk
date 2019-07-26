import Request, { RequestOptions, RequestJSON } from './Request';
import Blake2b from '../Utils/blake2b';
/**
 * The TokenRequest class.
 */
export interface TokenRequestOptions extends RequestOptions {
    tokenID?: string;
    token_id?: string;
    tokenAccount?: string;
    token_account?: string;
}
export interface TokenRequestJSON extends RequestJSON {
    token_id?: string;
    token_account?: string;
}
export default abstract class TokenRequest extends Request {
    private _tokenID;
    constructor(options?: TokenRequestOptions);
    /**
    * Return the token id
    * @type {string}
    */
    tokenID: string;
    /**
     * Creates a Blake2b Context for the request
     * @returns {context} - Blake2b Context
     */
    requestHash(): Blake2b;
    /**
     * Returns the base TokenRequest JSON
     * @returns {TokenRequestJSON} JSON request
     */
    toJSON(): TokenRequestJSON;
}
