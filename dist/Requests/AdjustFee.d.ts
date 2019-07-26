import TokenRequest, { TokenRequestOptions, TokenRequestJSON } from './TokenRequest';
declare type feeType = 'flat' | 'percentage';
export interface AdjustFeeOptions extends TokenRequestOptions {
    feeType?: feeType;
    feeRate?: string;
    fee_type?: feeType;
    fee_rate?: string;
}
export interface AdjustFeeJSON extends TokenRequestJSON {
    fee_type?: feeType;
    fee_rate?: string;
}
export default class AdjustFee extends TokenRequest {
    private _feeType;
    private _feeRate;
    constructor(options?: AdjustFeeOptions);
    /**
     * The Type of fee for this token (flat or percentage)
     * @type {feeType}
     */
    feeType: feeType;
    /**
     * The fee rate of the token make sure to take in account the fee type
     * @type {string}
     */
    feeRate: string;
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
     * @returns {AdjustFeeJSON} JSON request
     */
    toJSON(): AdjustFeeJSON;
}
export {};
