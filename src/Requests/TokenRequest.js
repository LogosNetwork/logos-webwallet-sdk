const Utils = require('../Utils')
const Request = require('./Request')

/**
 * The TokenRequest class.
 */
class TokenRequest extends Request {
  constructor (options = {
    tokenID: null
  }) {
    super(options)

    /**
     * TokenID of the token
     * @type {Hexadecimal64Length}
     * @private
     */
    if (options.tokenID !== undefined) {
      this._tokenID = options.tokenID
    } else if (options.token_id !== undefined) {
      this._tokenID = options.token_id
    } else if (options.tokenAccount) {
      this._tokenID = Utils.keyFromAccount(options.tokenAccount)
    } else if (options.token_account) {
      this._tokenID = Utils.keyFromAccount(options.token_account)
    } else {
      this._tokenID = null
    }
  }

  set tokenID (val) {
    super.hash = null
    if (val.startsWith('lgs_')) {
      this._tokenID = Utils.keyFromAccount(val)
    } else {
      this._tokenID = val
    }
  }

  /**
   * Return the token id
   * @type {string}
   */
  get tokenID () {
    return this._tokenID
  }
}

module.exports = TokenRequest
