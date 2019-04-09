const Utils = require('../Utils')
const TokenRequest = require('./TokenRequest')
const blake = require('blakejs')
const Actions = {
  'add': 0,
  'remove': 1
}

/**
 * The Token UpdateController class.
 */
class UpdateController extends TokenRequest {
  constructor (options = {
    action: null,
    controller: null
  }) {
    super(options)

    /**
     * Controller of the token
     * @type {Controller}
     * @private
     */
    if (options.controller !== undefined) {
      this._controller = this.getControllerFromJSON(options.controller)
    } else {
      this._controller = null
    }

    /**
     * Action of Update Controller Request
     * @type {string}
     * @private
     */
    if (options.action !== undefined) {
      this._action = options.action.toLowerCase()
    } else {
      this._action = null
    }

    this._type = {
      text: 'update_controller',
      value: 10
    }
  }

  /**
   * Returns the type of this request
   * @type {string}
   * @readonly
   */
  get type () {
    return this._type.text
  }

  /**
   * Returns the type value of this request
   * @type {number}
   * @readonly
   */
  get typeValue () {
    return this._type.value
  }

  set action (val) {
    if (typeof Actions[val.toLowerCase()] !== 'number') throw new Error('Invalid action option, pass action as add or remove')
    this._action = val.toLowerCase()
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

  getObjectBits (obj) {
    let bits = ''
    for (let val in obj) {
      if (typeof obj[val] === 'boolean') bits = (+obj[val]) + bits
    }
    return bits
  }

  getControllerJSON () {
    let newController = {}
    newController.account = this.controller.account
    newController.privileges = []
    for (let key in this.controller.privileges) {
      if (this.controller.privileges[key] === true) {
        newController.privileges.push(key)
      }
    }
    return newController
  }

  getControllerFromJSON (controller) {
    let newController = {}
    newController.account = controller.account
    if (controller.privileges instanceof Array) {
      newController.privileges = {}
      newController.privileges.change_issuance = controller.privileges.indexOf('change_issuance') > -1
      newController.privileges.change_modify_issuance = controller.privileges.indexOf('change_modify_issuance') > -1
      newController.privileges.change_revoke = controller.privileges.indexOf('change_revoke') > -1
      newController.privileges.change_modify_revoke = controller.privileges.indexOf('change_modify_revoke') > -1
      newController.privileges.change_freeze = controller.privileges.indexOf('change_freeze') > -1
      newController.privileges.change_modify_freeze = controller.privileges.indexOf('change_modify_freeze') > -1
      newController.privileges.change_adjust_fee = controller.privileges.indexOf('change_adjust_fee') > -1
      newController.privileges.change_modify_adjust_fee = controller.privileges.indexOf('change_modify_adjust_fee') > -1
      newController.privileges.change_whitelist = controller.privileges.indexOf('change_whitelist') > -1
      newController.privileges.change_modify_whitelist = controller.privileges.indexOf('change_modify_whitelist') > -1
      newController.privileges.issuance = controller.privileges.indexOf('issuance') > -1
      newController.privileges.revoke = controller.privileges.indexOf('revoke') > -1
      newController.privileges.freeze = controller.privileges.indexOf('freeze') > -1
      newController.privileges.adjust_fee = controller.privileges.indexOf('adjust_fee') > -1
      newController.privileges.whitelist = controller.privileges.indexOf('whitelist') > -1
      newController.privileges.update_issuer_info = controller.privileges.indexOf('update_issuer_info') > -1
      newController.privileges.update_controller = controller.privileges.indexOf('update_controller') > -1
      newController.privileges.burn = controller.privileges.indexOf('burn') > -1
      newController.privileges.distribute = controller.privileges.indexOf('distribute') > -1
      newController.privileges.withdraw_fee = controller.privileges.indexOf('withdraw_fee') > -1
      newController.privileges.withdraw_logos = controller.privileges.indexOf('withdraw_logos') > -1
    } else {
      if (controller.privileges === '[]') {
        newController.privileges = {
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
          distribute: false,
          withdraw_fee: false,
          withdraw_logos: false
        }
      } else {
        newController.privileges = controller.privileges
      }
    }
    return newController
  }

  /**
   * Validates the controller
   * @throws a shit load of errors if it is wrong
   * @returns {Boolean}
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
   * @type {Hexadecimal64Length}
   * @readonly
   */
  get hash () {
    this.validateController()
    if (!this.action) throw new Error('action is not set.')
    if (typeof Actions[this.action] !== 'number') throw new Error('Invalid action option, pass action as add or remove')
    const context = super.hash()
    let action = Utils.hexToUint8(Utils.decToHex(Actions[this.action], 1))
    blake.blake2bUpdate(context, action)
    let account = Utils.hexToUint8(Utils.keyFromAccount(this.controller.account))
    blake.blake2bUpdate(context, account)
    let privileges = Utils.hexToUint8(Utils.changeEndianness(Utils.decToHex(parseInt(this.getObjectBits(this.controller.privileges), 2), 8)))
    blake.blake2bUpdate(context, privileges)

    return Utils.uint8ToHex(blake.blake2bFinal(context))
  }

  /**
   * Returns the request JSON ready for broadcast to the Logos Network
   * @param {boolean} pretty - if true it will format the JSON (note you can't broadcast pretty json)
   * @returns {RequestJSON} JSON request
   */
  toJSON (pretty = false) {
    const obj = JSON.parse(super.toJSON())
    obj.action = this.action
    obj.controller = this.getControllerJSON()
    if (pretty) return JSON.stringify(obj, null, 2)
    return JSON.stringify(obj)
  }
}

module.exports = UpdateController
