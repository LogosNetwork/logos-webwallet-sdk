import { hexToUint8, keyFromAccount, accountFromHexKey } from '../Utils'
import { blake2bUpdate } from 'blakejs'
import Request, { RequestOptions, RequestJSON } from './Request'

/**
 * The TokenRequest class.
 */
export interface TokenRequestOptions extends RequestOptions {
  tokenID?: string
  token_id?: string
  tokenAccount?: string
  token_account?: string
}
export interface TokenRequestJSON extends RequestJSON {
  token_id?: string
  token_account?: string
}
export default abstract class TokenRequest extends Request {
  private _tokenID: string
  constructor (options:TokenRequestOptions = {
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
      this._tokenID = keyFromAccount(options.tokenAccount)
    } else if (options.token_account) {
      this._tokenID = keyFromAccount(options.token_account)
    } else {
      this._tokenID = null
    }
  }

  set tokenID (val) {
    if (val.startsWith('lgs_')) {
      this._tokenID = keyFromAccount(val)
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

  /**
   * Creates a Blake2b Context for the request
   * @returns {context} - Blake2b Context
   */
  requestHash () {
    if (!this.tokenID) throw new Error('TokenID is not set.')
    const context = super.requestHash()
    const tokenID = hexToUint8(this.tokenID)
    blake2bUpdate(context, tokenID)
    return context
  }

  /**
   * Returns the base TokenRequest JSON
   * @returns {TokenRequestJSON} JSON request
   */
  toJSON () {
    const obj:TokenRequestJSON = super.toJSON()
    obj.token_id = this.tokenID
    obj.token_account = accountFromHexKey(this.tokenID)
    return obj
  }
}
