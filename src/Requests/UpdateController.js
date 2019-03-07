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
    return 'update_controller'
  }

  set action (val) {
    if (typeof Actions[val] !== 'number') throw new Error('Invalid action option, pass action as add or remove')
    super.hash = null
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
    super.hash = null
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
    if (super.hash) {
      return super.hash
    } else {
      if (!this.previous) throw new Error('Previous is not set.')
      if (!this.origin) throw new Error('Origin account is not set.')
      if (this.fee === null) throw new Error('fee is not set.')
      if (this.sequence === null) throw new Error('Sequence is not set.')
      if (!this.tokenID) throw new Error('TokenID is not set.')
      if (!this.controller) throw new Error('Controller is not set.')
      if (!this.action) throw new Error('action is not set.')
      const context = blake.blake2bInit(32, null)
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(11, 1)))
      blake.blake2bUpdate(context, Utils.hexToUint8(this.previous))
      blake.blake2bUpdate(context, Utils.hexToUint8(this.origin))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(this.fee, 16)))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.changeEndianness(Utils.decToHex(this.sequence, 4))))

      // TokenID
      let tokenID = Utils.hexToUint8(this.tokenID)
      blake.blake2bUpdate(context, tokenID)

      // Controller Properties
      let action = Utils.hexToUint8(Utils.decToHex(Actions[this.action], 1))
      blake.blake2bUpdate(context, action)
      let account = Utils.hexToUint8(Utils.keyFromAccount(this.controller.account))
      blake.blake2bUpdate(context, account)
      let privileges = Utils.hexToUint8(Utils.changeEndianness(Utils.decToHex(parseInt(this.getObjectBits(this.controller), 2), 8)))
      blake.blake2bUpdate(context, privileges)

      super.hash = Utils.uint8ToHex(blake.blake2bFinal(context))
      return super.hash
    }
  }

  /**
   * Returns the request JSON ready for broadcast to the Logos Network
   * @param {boolean} pretty - if true it will format the JSON (note you can't broadcast pretty json)
   * @returns {RequestJSON} JSON request
   */
  toJSON (pretty = false) {
    const obj = {}
    obj.type = this.type
    obj.origin = this._origin
    obj.signature = this.signature
    obj.previous = this.previous
    obj.fee = this.fee
    obj.hash = this.hash
    obj.sequence = this.sequence.toString()
    obj.next = '0000000000000000000000000000000000000000000000000000000000000000'
    obj.token_id = this.tokenID
    obj.token_account = Utils.accountFromHexKey(this.tokenID)
    obj.issuer_info = this.issuerInfo
    obj.action = this.action
    obj.controller = this.getControllerJSON()
    if (pretty) return JSON.stringify(obj, null, 2)
    return JSON.stringify(obj)
  }
}

module.exports = UpdateController
