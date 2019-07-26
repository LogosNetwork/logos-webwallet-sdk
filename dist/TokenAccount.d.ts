import Account, { AccountJSON, AccountOptions } from './Account';
import { Settings as RpcSettings, Privileges as RpcPrivileges, Request as RpcRequest } from '@logosnetwork/logos-rpc-client/dist/api';
import { Issuance, AdjustUserStatus, Request } from './Requests';
declare type feeType = 'flat' | 'percentage';
export interface TokenAccountJSON extends AccountJSON {
    tokenID?: string;
    tokenBalance?: string;
    totalSupply?: string;
    tokenFeeBalance?: string;
    symbol?: string;
    name?: string;
    issuerInfo?: string;
    feeRate?: string;
    feeType?: feeType;
    accountStatuses?: AccountStatuses;
    controllers?: Controller[];
    settings?: Settings;
    type?: string;
}
interface AccountStatuses {
    [address: string]: {
        whitelisted: boolean;
        frozen: boolean;
    };
}
interface AccountStatus {
    whitelisted: boolean;
    frozen: boolean;
}
export interface SyncedResponse {
    account?: string;
    synced?: boolean;
    type?: string;
    remove?: boolean;
}
export interface Privileges {
    change_issuance: boolean;
    change_modify_issuance: boolean;
    change_revoke: boolean;
    change_modify_revoke: boolean;
    change_freeze: boolean;
    change_modify_freeze: boolean;
    change_adjust_fee: boolean;
    change_modify_adjust_fee: boolean;
    change_whitelist: boolean;
    change_modify_whitelist: boolean;
    issuance: boolean;
    revoke: boolean;
    freeze: boolean;
    adjust_fee: boolean;
    whitelist: boolean;
    update_issuer_info: boolean;
    update_controller: boolean;
    burn: boolean;
    distribute: boolean;
    withdraw_fee: boolean;
    withdraw_logos: boolean;
}
export interface Controller {
    account?: string;
    privileges?: Privileges;
}
export interface Settings {
    issuance: boolean;
    modify_issuance: boolean;
    revoke: boolean;
    modify_revoke: boolean;
    freeze: boolean;
    modify_freeze: boolean;
    adjust_fee: boolean;
    modify_adjust_fee: boolean;
    whitelist: boolean;
    modify_whitelist: boolean;
}
export interface TokenAccountOptions extends AccountOptions {
    tokenID?: string;
    issuance?: Issuance;
    tokenBalance?: string;
    totalSupply?: string;
    tokenFeeBalance?: string;
    symbol?: string;
    name?: string;
    issuerInfo?: string;
    feeRate?: string;
    feeType?: feeType;
    controllers?: Controller[];
    settings?: Settings;
    accountStatuses?: AccountStatuses;
}
/**
 * TokenAccount contain the keys, chains, and balances.
 */
export default class TokenAccount extends Account {
    private _tokenBalance;
    private _totalSupply;
    private _tokenFeeBalance;
    private _symbol;
    private _name;
    private _issuerInfo;
    private _feeRate;
    private _feeType;
    private _controllers;
    private _settings;
    private _accountStatuses;
    constructor(options: TokenAccountOptions);
    /**
     * The type of the account (LogosAccount or TokenAccount)
     * @type {string}
     */
    readonly type: 'TokenAccount';
    /**
     * The public key of the token account
     * @type {string}
     * @readonly
     */
    readonly tokenID: string;
    /**
     * The accounts statuses (Frozen / Whitelisted)
     * @type {string}
     * @readonly
     */
    accountStatuses: AccountStatuses;
    /**
     * The balance of the token in the base token unit
     * @type {string}
     * @readonly
     */
    tokenBalance: string;
    /**
     * The total supply of the token in base token
     * @type {string}
     * @readonly
     */
    totalSupply: string;
    /**
     * The total supply of the token in base token
     * @type {string}
     * @readonly
     */
    tokenFeeBalance: string;
    /**
     * The issuer info of the token
     * @type {string}
     */
    issuerInfo: string;
    /**
     * The symbol of the token
     * @type {string}
     */
    symbol: string;
    /**
     * The name of the token
     * @type {string}
     */
    name: string;
    /**
     * The fee rate of the token
     * @type {string}
     */
    feeRate: string;
    /**
     * The fee type of the token
     * @type {feeType}
     */
    feeType: feeType;
    /**
     * The settings of the token
     * @type {Settings}
     */
    settings: Settings;
    /**
     * The controllers of the token
     * @type {Controller[]}
     */
    controllers: Controller[];
    /**
     * Checks if the account is synced
     * @returns {Promise<SyncedResponse>}
     */
    isSynced(): Promise<SyncedResponse>;
    /**
     * Scans the account history using RPC and updates the local chains
     * @returns {Promise<Account>}
     */
    sync(): Promise<Account>;
    /**
     * Updates the token account by comparing the RPC token account info with the changes in a new request
     * Also updates the pending balance based on the new balance and the pending chain
     * @param {Request} request - request that is being calculated on
     * @returns {void}
     */
    updateTokenInfoFromRequest(request: Request): void;
    /**
     * Validates if the token account contains the controller
     *
     * @param {string} address - Address of the logos account you are checking if they are a controller
     * @returns {boolean}
     */
    isController(address: string): boolean;
    /**
     * Validates if the token has the setting
     *
     * @param {Setting} setting - Token setting you are checking
     * @returns {boolean}
     */
    hasSetting(setting: RpcSettings): boolean;
    /**
     * Validates if the token account contains the controller and the controller has the specified privilege
     *
     * @param {string} address - Address of the controller you are checking
     * @param {privilege} privilege - Privilege you are checking for
     * @returns {boolean}
     */
    controllerPrivilege(address: string, privilege: RpcPrivileges): boolean;
    /**
     * Validates if the account has enough token funds to complete the transaction
     *
     * @param {string} address - Address of the controller you are checking
     * @param {string} amount - Amount you are checking for
     * @returns {Promise<boolean>}
     */
    accountHasFunds(address: string, amount: string): Promise<boolean>;
    /**
     * Validates if the account is a valid destination to send token funds to
     *
     * @param {string} address - Address of the controller you are checking
     * @returns {Promise<boolean>}
     */
    validTokenDestination(address: string): Promise<boolean>;
    /**
     * Validates that the account has enough funds at the current time to publish the request
     *
     * @param {Request} request - Request information from the RPC or MQTT
     * @returns {Promise<boolean>}
     */
    validateRequest(request: Request): Promise<boolean>;
    private settingToModify;
    private settingToChange;
    private settingToChangeModify;
    /**
     * Adds a request to the appropriate chain
     *
     * @param {RequestOptions} requestInfo - Request information from the RPC or MQTT
     * @returns {Request}
     */
    addConfirmedRequest(requestInfo: RpcRequest): Request;
    /**
     * Returns the status of the given address for this token
     *
     * @param {string} address - The address of the account
     * @returns {AccountStatus} status of the account { whitelisted and frozen }
     */
    getAccountStatus(address: string): AccountStatus;
    /**
     * Returns the status of the given address for this token
     *
     * @param {AdjustUserStatus} request - The adjust_user_status request
     * @returns {AccountStatus} status of the account { whitelisted and frozen }
     */
    updateAccountStatusFromRequest(request: AdjustUserStatus): AccountStatus;
    /**
     * Confirms the request in the local chain
     *
     * @param {MQTTRequestOptions} requestInfo The request from MQTT
     * @throws An exception if the request is not found in the pending requests array
     * @throws An exception if the previous request does not match the last chain request
     * @throws An exception if the request amount is greater than your balance minus the transaction fee
     * @returns {Promise<void>}
     */
    processRequest(requestInfo: RpcRequest): Promise<void>;
    /**
     * Returns the token account JSON
     * @returns {TokenAccountJSON} JSON request
     */
    toJSON(): TokenAccountJSON;
}
export {};
