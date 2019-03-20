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
      if (options.controller && options.controller.hasOwnProperty('privileges')) {
        this._controller = this.getControllerFromJSON(options.controller)
      } else {
        this._controller = options.controller
      }
    } else {
      this._controller = null
    }
  }

  /**
   * Returns the type of this request
   * @type {string}
   * @readonly
   */
  get type () {
    return {
      text: 'update_controller',
      value: 10
    }
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
    for (let val of Object.values(obj)) {
      if (typeof val === 'boolean') bits = (+val) + bits
    }
    return bits
  }

  getControllerJSON () {
    let newController = {}
    let controller = this.controller
    newController.account = controller.account
    newController.privileges = []
    for (let key in controller) {
      if (controller.hasOwnProperty(key) && controller[key] === true) {
        newController.privileges.push(key)
      }
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
    let privileges = Utils.hexToUint8(Utils.changeEndianness(Utils.decToHex(parseInt(this.getObjectBits(this.controller), 2), 8)))
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
