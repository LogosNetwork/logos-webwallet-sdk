import TokenRequest, { TokenRequestOptions, TokenRequestJSON } from './TokenRequest';
export declare type Setting = 'issuance' | 'revoke' | 'freeze' | 'adjust_fee' | 'whitelist';
export interface ImmuteSettingJSON extends TokenRequestJSON {
    setting?: Setting;
}
export interface ImmuteSettingOptions extends TokenRequestOptions {
    setting?: Setting;
}
export default class ImmuteSetting extends TokenRequest {
    private _setting;
    constructor(options?: ImmuteSettingOptions);
    /**
    * Returns the string of the setting
    * @type {Setting}
    */
    setting: Setting;
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
     * @returns {ImmuteSettingJSON} JSON request
     */
    toJSON(): ImmuteSettingJSON;
}
