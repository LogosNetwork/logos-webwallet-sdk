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
     * Controllers of the token
     * @type {Controller}
     * @private
     */
    if (options.controller !== undefined) {
      this._controller = this.getControllerFromJSON(options.controller)
    } else {
      this._controller = null
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
    if (typeof Actions[val] !== 'number') throw new Error('Invalid action option, pass action as add or remove')
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
    } else {
      newController.privileges = controller.privileges
    }
    return newController
  }

  /**
   * Returns calculated hash or Builds the request and calculates the hash
   *
   * @throws An exception if missing parameters or invalid parameters
   * @type {Hexadecimal64Length}
   * @readonly
   */
  get hash () {
    if (!this.controller) throw new Error('Controller is not set.')
    if (!this.action) throw new Error('action is not set.')
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
