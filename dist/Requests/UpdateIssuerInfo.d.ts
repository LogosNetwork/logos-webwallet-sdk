import TokenRequest, { TokenRequestOptions, TokenRequestJSON } from './TokenRequest';
export interface UpdateIssuerInfoOptions extends TokenRequestOptions {
    issuerInfo?: string;
    new_info?: string;
}
export interface UpdateIssuerInfoJSON extends TokenRequestJSON {
    new_info?: string;
}
export default class UpdateIssuerInfo extends TokenRequest {
    private _issuerInfo;
    constructor(options?: UpdateIssuerInfoOptions);
    /**
     * The issuer info of the token
     * @type {string}
     */
    issuerInfo: string;
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
     * @param {boolean} pretty - if true it will format the JSON (note you can't broadcast pretty json)
     * @returns {UpdateIssuerInfoJSON} JSON request
     */
    toJSON(): UpdateIssuerInfoJSON;
}
