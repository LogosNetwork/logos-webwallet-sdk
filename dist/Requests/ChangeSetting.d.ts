import TokenRequest, { TokenRequestOptions, TokenRequestJSON } from './TokenRequest';
export declare type Setting = 'issuance' | 'revoke' | 'freeze' | 'adjust_fee' | 'whitelist';
export interface ChangeSettingOptions extends TokenRequestOptions {
    setting?: Setting;
    value?: boolean | string;
}
export interface ChangeSettingJSON extends TokenRequestJSON {
    setting?: Setting;
    value?: boolean;
}
export default class ChangeSetting extends TokenRequest {
    private _setting;
    private _value;
    constructor(options?: ChangeSettingOptions);
    /**
    * Return the value of the changed setting
    * @type {boolean}
    */
    value: boolean;
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
     * @returns {ChangeSettingJSON} JSON request
     */
    toJSON(): ChangeSettingJSON;
}
