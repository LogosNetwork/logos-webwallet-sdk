const Utils = require('../Utils')
const Transaction = require('./Transaction')
const blake = require('blakejs')
const nacl = require('tweetnacl/nacl')
const Logos = require('@logosnetwork/logos-rpc-client')
const bigInt = require('big-integer')

/**
 * The Send class for Send Transactions.
 */
class Send extends Transaction {
  constructor (options = {
    transactions: []
  }) {
    super(options)

    /**
     * Transactions
     * @type {SendTransaction[]}
     * @private
     */
    if (options.transactions !== undefined) {
      this._transactions = options.transactions
    } else {
      this._transactions = []
    }

    /**
     * Block version of webwallet SDK
     * @type {number}
     * @private
     */
    this._version = 1
  }

  set transactions (transactions) {
    this._transactions = transactions
  }

  /**
   * Return the previous block as hash
   * @type {SendTransaction}
   */
  get transactions () {
    return this._transactions
  }

  /**
   * Return the total amount contained in this transaction
   * @type {string}
   * @readonly
   */
  get totalAmount () {
    let totalAmount = bigInt(0)
    for (let transaction of this._transactions) {
      totalAmount = totalAmount.plus(bigInt(transaction.amount))
    }
    return totalAmount.toString()
  }

  /**
   * Return the total amount contained in this transaction
   * @type {string}
   * @readonly
   */
  get type () {
    return 'send'
  }

  /**
   * Returns calculated hash or Builds the block and calculates the hash
   *
   * @throws An exception if missing parameters or invalid parameters
   * @type {Hexadecimal64Length}
   * @readonly
   */
  get hash () {
    if (!this.previous) throw new Error('Previous is not set.')
    if (!this.transactions) throw new Error('Transactions are not set.')
    if (this.sequence === null) throw new Error('Sequence is not set.')
    if (this.transactionFee === null) throw new Error('Transaction fee is not set.')
    if (!this.account) throw new Error('Account is not set.')
    const context = blake.blake2bInit(32, null)
    blake.blake2bUpdate(context, Utils.hexToUint8(this.account))
    blake.blake2bUpdate(context, Utils.hexToUint8(this.previous))
    blake.blake2bUpdate(context, Utils.hexToUint8(Utils.changeEndianness(Utils.decToHex(this.sequence, 4))))
    blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(0, 1)))
    blake.blake2bUpdate(context, Utils.hexToUint8(Utils.changeEndianness(Utils.decToHex(this.transactions.length, 2))))
    for (let transaction of this.transactions) {
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.keyFromAccount(transaction.target)))
      blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(transaction.amount, 16)))
    }
    blake.blake2bUpdate(context, Utils.hexToUint8(Utils.decToHex(this.transactionFee, 16)))
    return Utils.uint8ToHex(blake.blake2bFinal(context))
  }

  /**
   * Adds a tranction to the Send
   * @param {SendTransaction} transaction - transaction you want to add to this send block
   * @returns {SendTransaction[]} list of all transactions
   */
  addTransaction (transaction) {
    if (this.transactions.length === 8) throw new Error('Can only fit 8 transactions per send block!')
    if (!transaction.target || !transaction.amount) throw new Error('Send target and amount')
    this.transactions.push(transaction)
    return this.transactions
  }

  /**
   * Creates a signature for the block.
   * @param {Hexadecimal64Length} privateKey - private key in hex
   * @returns {boolean} if the signature is valid
   */
  sign (privateKey) {
    privateKey = Utils.hexToUint8(privateKey)
    if (privateKey.length !== 32) throw new Error('Invalid Private Key length. Should be 32 bytes.')
    let hash = Utils.hexToUint8(this.hash)
    this.signature = Utils.uint8ToHex(nacl.sign.detached(hash, privateKey))
    return this.verify()
  }

  /**
   * Verifies the blocks integrity
   * @returns {boolean}
   */
  verify () {
    if (!this.hash) throw new Error('Hash is not set.')
    if (!this.signature) throw new Error('Signature is not set.')
    if (!this.account) throw new Error('Account is not set.')
    return nacl.sign.detached.verify(Utils.hexToUint8(this.hash), Utils.hexToUint8(this.signature), Utils.hexToUint8(this.account))
  }

  /**
   * Publishes the block
   * @param {RPCOptions} options - rpc options
   * @returns {Promise<Hexadecimal64Length>} hash of transcation
   */
  async publish (options) {
    let delegateId = null
    if (this.previous !== '0000000000000000000000000000000000000000000000000000000000000000') {
      delegateId = parseInt(this.previous.slice(-2), 16) % 32
    } else {
      delegateId = parseInt(this.account.slice(-2), 16) % 32
    }
    const RPC = new Logos({ url: `http://${options.delegates[delegateId]}:55000`, proxyURL: options.proxy })
    let hash = await RPC.transactions.publish(this.toJSON())
    return hash
  }

  /**
   * Returns the block JSON ready for broadcast to the Logos Network
   * @param {boolean} pretty - if true it will format the JSON (note you can't broadcast pretty json)
   * @returns {BlockJSON} JSON block
   */
  toJSON (pretty = false) {
    const obj = {}
    obj.previous = this.previous
    obj.sequence = this.sequence.toString()
    obj.transaction_type = 'send'
    obj.account = this._account
    obj.transaction_fee = this.transactionFee
    obj.transactions = this.transactions
    obj.number_transactions = this.transactions.length
    obj.hash = this.hash
    obj.work = this.work
    obj.signature = this.signature
    if (pretty) return JSON.stringify(obj, null, 2)
    return JSON.stringify(obj)
  }
}

module.exports = Send
