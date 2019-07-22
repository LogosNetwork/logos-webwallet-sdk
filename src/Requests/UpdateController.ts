import { hexToUint8, decToHex, keyFromAccount, deserializeController, changeEndianness, serializeController, accountFromHexKey } from '../Utils/Utils'
import TokenRequest, { TokenRequestOptions, TokenRequestJSON } from './TokenRequest'
import { Controller, Privileges, Settings } from '../TokenAccount'
import { Controller as RpcController } from '@logosnetwork/logos-rpc-client/dist/api'

const Actions = {
  add: 0,
  remove: 1
}

export interface UpdateControllerOptions extends TokenRequestOptions {
  action?: 'add' | 'remove'
  controller?: Controller | RpcController
}
export interface UpdateControllerJSON extends TokenRequestJSON {
  action?: 'add' | 'remove'
  controller?: RpcController
}
export default class UpdateController extends TokenRequest {
  private _action: 'add' | 'remove'
  private _controller: Controller
  constructor (options:UpdateControllerOptions = {
    action: null,
    controller: null
  }) {
    options.type = {
      text: 'update_controller',
      value: 10
    }
    super(options)

    /**
     * Controller of the token
     * @type {Controller}
     * @private
     */
    if (options.controller !== undefined) {
      this._controller = deserializeController(options.controller)
    } else {
      this._controller = {
        account: accountFromHexKey(this.origin),
        privileges: {
          change_issuance: false,
          change_modify_issuance: false,
          change_revoke: false,
          change_modify_revoke: false,
          change_freeze: false,
          change_modify_freeze: false,
          change_adjust_fee: false,
          change_modify_adjust_fee: false,
          change_whitelist: false,
          change_modify_whitelist: false,
          issuance: false,
          revoke: false,
          freeze: false,
          adjust_fee: false,
          whitelist: false,
          update_issuer_info: false,
          update_controller: false,
          burn: false,
          distribute: true,
          withdraw_fee: false,
          withdraw_logos: false
        }
      }
    }

    /**
     * Action of Update Controller Request
     * @type {string}
     * @private
     */
    if (options.action !== undefined) {
      this._action = options.action
    } else {
      this._action = null
    }
  }

  set action (val) {
    if (typeof Actions[val.toLowerCase()] !== 'number') throw new Error('Invalid action option, pass action as add or remove')
    this._action = val
  }

  /**
   * Returns the string of the action
   * @type {string}
   */
  get action () {
    return this._action
  }

  /**
   * The contoller of the token
   * @type {Controller}
   */
  get controller () {
    return this._controller
  }

  set controller (val) {
    this._controller = val
  }

  getObjectBits (obj: Privileges | Settings) {
    let bits = ''
    for (const val in obj) {
      if (typeof obj[val] === 'boolean') bits = (+obj[val]) + bits
    }
    return bits
  }

  /**
   * Validates the controller
   * @throws a shit load of errors if it is wrong
   * @returns {boolean}
   */
  validateController () {
    if (!this.controller) throw new Error('Controller is null')
    if (!this.controller.account) throw new Error('Controller must have account')
    if (!this.controller.privileges) throw new Error('Controller must have privileges')
    if (typeof this.controller.privileges.change_issuance === 'undefined') throw new Error('change_issuance should be passed: Change issuance allows the controller account to add additional tokens')
    if (typeof this.controller.privileges.change_modify_issuance === 'undefined') throw new Error('change_modify_issuance should be passed: Change modify issuance allows the controller account to modify if the token is allowed to have additional tokens added')
    if (typeof this.controller.privileges.change_revoke === 'undefined') throw new Error('change_revoke should be passed: Change revoke allows the controller account to revoke tokens')
    if (typeof this.controller.privileges.change_modify_revoke === 'undefined') throw new Error('change_modify_revoke should be passed: Change modify revoke allows the controller account to modify if tokens can be revoked')
    if (typeof this.controller.privileges.change_freeze === 'undefined') throw new Error('change_freeze should be passed: Change Freeze allows the controller account to add or delete accounts from the freeze list')
    if (typeof this.controller.privileges.change_modify_freeze === 'undefined') throw new Error('change_modify_freeze should be passed: Change modify freeze allows the controller account to modify if accounts can be frozen')
    if (typeof this.controller.privileges.change_adjust_fee === 'undefined') throw new Error('change_adjust_fee should be passed: Change adjust fee allows the controller account to modify the fee of the token')
    if (typeof this.controller.privileges.change_modify_adjust_fee === 'undefined') throw new Error('change_modify_adjust_fee should be passed: Change modify fee allows the controller account to modify if the token fees can be adjusted')
    if (typeof this.controller.privileges.change_whitelist === 'undefined') throw new Error('change_whitelist should be passed: Change whitelist allows the controller account to add additional tokens')
    if (typeof this.controller.privileges.change_modify_whitelist === 'undefined') throw new Error('change_modify_whitelist should be passed: Change modify whitelist allows the controller account to modify if this token has whitelisting')
    if (typeof this.controller.privileges.issuance === 'undefined') throw new Error('issuance should be passed')
    if (typeof this.controller.privileges.revoke === 'undefined') throw new Error('revoke should be passed')
    if (typeof this.controller.privileges.freeze === 'undefined') throw new Error('freeze should be passed')
    if (typeof this.controller.privileges.adjust_fee === 'undefined') throw new Error('adjust_fee should be passed')
    if (typeof this.controller.privileges.whitelist === 'undefined') throw new Error('whitelist should be passed')
    if (typeof this.controller.privileges.update_issuer_info === 'undefined') throw new Error('update_issuer_info should be passed: Update issuer info allows the controller account to change the token information')
    if (typeof this.controller.privileges.update_controller === 'undefined') throw new Error('update_controller should be passed ')
    if (typeof this.controller.privileges.burn === 'undefined') throw new Error('burn should be passed')
    if (typeof this.controller.privileges.distribute === 'undefined') throw new Error('distribute should be passed')
    if (typeof this.controller.privileges.withdraw_fee === 'undefined') throw new Error('withdraw_fee should be passed')
    if (typeof this.controller.privileges.withdraw_logos === 'undefined') throw new Error('withdraw_logos should be passed')
    return true
  }

  /**
   * Returns calculated hash or Builds the request and calculates the hash
   *
   * @throws An exception if missing parameters or invalid parameters
   * @type {string}
   * @readonly
   */
  get hash () {
    this.validateController()
    if (!this.action) throw new Error('action is not set.')
    if (typeof Actions[this.action] !== 'number') throw new Error('Invalid action option, pass action as add or remove')
    return <string>super.requestHash()
      .update(hexToUint8(decToHex(Actions[this.action], 1)))
      .update(hexToUint8(keyFromAccount(this.controller.account)))
      .update(hexToUint8(changeEndianness(decToHex(parseInt(this.getObjectBits(this.controller.privileges), 2), 8))))
      .digest('hex')
  }

  /**
   * Returns the request JSON ready for broadcast to the Logos Network
   * @returns {UpdateControllerJSON} JSON request
   */
  toJSON () {
    const obj:UpdateControllerJSON = super.toJSON()
    obj.action = this.action
    obj.controller = serializeController(this.controller)
    return obj
  }
}
