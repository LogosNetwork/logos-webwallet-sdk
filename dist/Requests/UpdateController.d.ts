import TokenRequest, { TokenRequestOptions, TokenRequestJSON } from './TokenRequest';
import { Controller } from '../TokenAccount';
import { Controller as RpcController } from '@logosnetwork/logos-rpc-client/dist/api';
declare type action = 'add' | 'remove';
export interface UpdateControllerOptions extends TokenRequestOptions {
    action?: action;
    controller?: Controller | RpcController;
}
export interface UpdateControllerJSON extends TokenRequestJSON {
    action?: action;
    controller?: RpcController;
}
export default class UpdateController extends TokenRequest {
    private _action;
    private _controller;
    constructor(options?: UpdateControllerOptions);
    /**
    * Returns the string of the action
    * @type {action}
    */
    action: action;
    /**
     * The contoller of the token
     * @type {Controller}
     */
    controller: Controller;
    private getObjectBits;
    /**
     * Validates the controller
     * @throws a shit load of errors if it is wrong
     * @returns {boolean}
     */
    private validateController;
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
     * @returns {UpdateControllerJSON} JSON request
     */
    toJSON(): UpdateControllerJSON;
}
export {};
