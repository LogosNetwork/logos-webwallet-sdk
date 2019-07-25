import { hexToUint8, decToHex, keyFromAccount } from '../Utils/Utils'
import TokenRequest, { TokenRequestOptions, TokenRequestJSON } from './TokenRequest'
import { Transaction } from '@logosnetwork/logos-rpc-client/dist/api';
export interface WithdrawLogosOptions extends TokenRequestOptions {
    transaction?: Transaction;
}
export interface WithdrawLogosJSON extends TokenRequestJSON {
    transaction?: Transaction;
}
export default class WithdrawLogos extends TokenRequest {
    private _transaction: Transaction
    public constructor (options: WithdrawLogosOptions = {
        transaction: null
    }) {
        options.type = {
            text: 'withdraw_logos',
            value: 14
        }
        super(options)

        /**
     * Transaction to withdraw the token fees
     * @type {string}
     * @private
     */
        if (options.transaction !== undefined) {
            this._transaction = options.transaction
        } else {
            this._transaction = null
        }
    }

    public set transaction (transaction: Transaction) {
        if (!transaction) throw new Error('transaction is was not sent.')
        if (!transaction.destination) throw new Error('destination should be passed in transaction object')
        if (!transaction.amount) throw new Error('amount should be passed in transaction object - pass this as the base unit logos')
        this._transaction = transaction
    }

    /**
   * Return the previous request as hash
   * @type {Transaction}
   */
    public get transaction (): Transaction {
        return this._transaction
    }

    /**
   * Returns calculated hash or Builds the request and calculates the hash
   *
   * @throws An exception if missing parameters or invalid parameters
   * @type {string}
   * @readonly
   */
    public get hash (): string {
        if (this.transaction === null) throw new Error('transaction is not set.')
        if (!this.transaction.destination) throw new Error('transaction destination is not set.')
        if (!this.transaction.amount) throw new Error('transaction amount is not set.')
        return super.requestHash()
            .update(hexToUint8(keyFromAccount(this.transaction.destination)))
            .update(hexToUint8(decToHex(this.transaction.amount, 16)))
            .digest('hex') as string
    }

    /**
   * Returns the request JSON ready for broadcast to the Logos Network
   * @returns {WithdrawLogosJSON} JSON request
   */
    public toJSON (): WithdrawLogosJSON {
        const obj: WithdrawLogosJSON = super.toJSON()
        obj.transaction = this.transaction
        return obj
    }
}
