import Request, { RequestOptions, RequestJSON } from './Request';
import { Settings, Controller } from '../TokenAccount';
import { Settings as RpcSettings, Controller as RpcController } from '@logosnetwork/logos-rpc-client/dist/api';
declare type feeType = 'flat' | 'percentage';
export interface IssuanceOptions extends RequestOptions {
    tokenID?: string;
    token_id?: string;
    symbol?: string;
    name?: string;
    totalSupply?: string;
    total_supply?: string;
    feeType?: feeType;
    fee_type?: feeType;
    feeRate?: string;
    fee_rate?: string;
    settings?: Settings | RpcSettings[];
    controllers?: Controller[] | RpcController[];
    issuerInfo?: string;
    issuer_info?: string;
}
export interface IssuanceJSON extends RequestJSON {
    token_id?: string;
    token_account?: string;
    symbol?: string;
    name?: string;
    total_supply?: string;
    fee_type?: feeType;
    fee_rate?: string;
    settings?: RpcSettings[];
    controllers?: RpcController[];
    issuer_info?: string;
}
export default class Issuance extends Request {
    private _tokenID;
    private _symbol;
    private _name;
    private _totalSupply;
    private _feeType;
    private _feeRate;
    private _settings;
    private _controllers;
    private _issuerInfo;
    constructor(options?: IssuanceOptions);
    /**
    * Return the token id
    * @type {string}
    */
    tokenID: string;
    /**
    * The symbol of the token (8 Bytes Max)
    * @type {string}
    */
    symbol: string;
    /**
    * The name of the token (32 Bytes Max)
    * @type {string}
    */
    name: string;
    /**
     * The total supply of the token (340282366920938463463374607431768211455 is Max)
     * @type {string}
     */
    totalSupply: string;
    /**
     * The Type of fee for this token (flat or percentage)
     * @type {string}
     */
    feeType: feeType;
    /**
     * The fee rate of the token make sure to take in account the fee type
     * @type {string}
     */
    feeRate: string;
    /**
     * The settings for the token
     * Same as get settings but typescript
     * doesn't allow different types for getter setter
     * @type {Settings}
     */
    readonly settingsAsObject: Settings;
    /**
     * The settings for the token
     * @type {Settings}
     */
    settings: Settings | RpcSettings[];
    /**
     * The contollers of the token
     * Same as get controllers but typescript
     * doesn't allow different types for getter setter
     * @type {Controller[]}
     */
    readonly controllersAsObject: Controller[];
    /**
     * The contollers of the token
     * Typescript is really dumb and won't let us use different types for getter setters
     * @type {Controller[]}
     */
    controllers: Controller[] | RpcController[];
    /**
     * The issuer info of the token
     * @type {string}
     */
    issuerInfo: string;
    /**
     * Validates the settings
     * @throws a shit load of errors if it is wrong
     * @returns {boolean}
     */
    validateSettings(settings?: Settings): boolean;
    /**
     * Validates the controller
     * @param {Controller} controller - controller you want to validate
     * @throws a shit load of errors if it is wrong
     * @returns {boolean}
     */
    validateController(controller: Controller): boolean;
    /**
     * Adds a controller to the Token Issuance
     * @param {Controller} controller - controller you want to add to this request
     * @returns {Controller[]} list of all controllers
     */
    addController(controller: Controller | RpcController): Controller[];
    private getObjectBits;
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
     * @returns {IssuanceJSON} JSON request
     */
    toJSON(): IssuanceJSON;
}
export {};
