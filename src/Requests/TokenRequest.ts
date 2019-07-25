/* eslint @typescript-eslint/camelcase: 0 */
import { hexToUint8, keyFromAccount, accountFromHexKey } from '../Utils/Utils'
import Request, { RequestOptions, RequestJSON } from './Request'
import Blake2b from '../Utils/blake2b';

/**
 * The TokenRequest class.
 */
export interface TokenRequestOptions extends RequestOptions {
    tokenID?: string;
    token_id?: string;
    tokenAccount?: string;
    token_account?: string;
}
export interface TokenRequestJSON extends RequestJSON {
    token_id?: string;
    token_account?: string;
}
export default abstract class TokenRequest extends Request {
    private _tokenID: string
    public constructor (options: TokenRequestOptions = {
        tokenID: null
    }) {
        super(options)

        /**
     * TokenID of the token
     * @type {string}
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

    public set tokenID (val: string) {
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
    public get tokenID (): string {
        return this._tokenID
    }

    /**
   * Creates a Blake2b Context for the request
   * @returns {context} - Blake2b Context
   */
    public requestHash (): Blake2b {
        if (!this.tokenID) throw new Error('TokenID is not set.')
        return super.requestHash().update(hexToUint8(this.tokenID))
    }

    /**
   * Returns the base TokenRequest JSON
   * @returns {TokenRequestJSON} JSON request
   */
    public toJSON (): TokenRequestJSON {
        const obj: TokenRequestJSON = super.toJSON()
        obj.token_id = this.tokenID
        obj.token_account = accountFromHexKey(this.tokenID)
        return obj
    }
}
