import { hexToUint8, decToHex, uint8ToHex, keyFromAccount } from './Functions'
const testNet = true
const MAIN_NET_WORK_THRESHOLD = 'ffffffc000000000'
const TEST_NET_WORK_THRESHOLD = 'ff00000000000000'
const STATE_BLOCK_PREAMBLE = '0000000000000000000000000000000000000000000000000000000000000006'
const blake = require('blakejs')

/**
 * The base class for all blocks.
 * We will create different classes for each request type once we get those implemented on core
 */
class Block {
  constructor (options = {
    hash: null,
    signature: null,
    work: null,
    amount: null,
    previous: null,
    transactionFee: null,
    representative: null,
    destination: null,
    account: null
  }) {
    /**
     * Hash of the block
     * @type {string}
     * @private
     */
    this._hash = options.hash

    /**
     * Signature of the block
     * @type {string}
     * @private
     */
    this._signature = options.signature

    /**
     * Work of the block based on previous hash
     * @type {string}
     * @private
     */
    this._work = options.work

    /**
     * Amount transfered in this block
     * @type {string}
     */
    this._amount = options.amount

    /**
     * Previous block hash
     * @type {string}
     * @private
     */
    this._previous = options.previous

    /**
     * Transcation Fee of the block
     * @type {string}
     * @private
     */
    this._transactionFee = options.transactionFee

    /**
     * Representative's public key of the account
     * @type {string}
     * @private
     */
    this._representative = options.representative

    /**
     * Destination of where you are sending the block to
     * @type {string}
     * @private
     */
    this._destination = options.destination

    /**
     * Account public key of block publisher
     * @type {string}
     * @private
     */
    this._account = options.account

    /**
     * Block version of webwallet SDK
     * @type {number}
     * @private
     */
    this._version = 1
  }

  /**
   * Returns calculated hash or Builds the block and calculates the hash
   *
   * @throws An exception if missing parameters or invalid parameters
   * @returns {string} The block hash
   */
  get hash () {
    if (this._hash !== null) {
      return this._hash
    } else {
      if (!this._previous) throw new Error('Previous is not set.')
      if (!this._amount) throw new Error('Amount is not set.')
      if (!this._destination) throw new Error('Destination is not set.')
      if (!this._transactionFee) throw new Error('Transaction fee is not set.')
      if (!this._account) throw new Error('Account is not set.')
      if (!this._representative) throw new Error('Representative is not set.')

      const context = blake.blake2bInit(32, null)
      blake.blake2bUpdate(context, hexToUint8(STATE_BLOCK_PREAMBLE))
      try {
        blake.blake2bUpdate(context, hexToUint8(this.account))
      } catch (err) {
        throw new Error(`Invalid account ${this._account}`)
      }
      blake.blake2bUpdate(context, hexToUint8(this._previous))
      blake.blake2bUpdate(context, hexToUint8(this._representative))
      blake.blake2bUpdate(context, hexToUint8(decToHex(this._amount, 16)))
      blake.blake2bUpdate(context, hexToUint8(decToHex(this._transactionFee, 16)))
      try {
        blake.blake2bUpdate(context, hexToUint8(this.destination))
      } catch (err) {
        throw new Error(`Invalid desintation ${this._destination}`)
      }
      let hash = uint8ToHex(blake.blake2bFinal(context))

      this._hash = hash

      return hash
    }
  }

  /**
   * Sets the block signature
   *
   * @param {string} hex - The hex encoded 64 byte block hash signature
   */
  set signature (val) {
    this._signature = val
  }

  /**
   * Return the signature of the block
   * @type {hex}
   * @readonly
   */
  get signature () {
    return this._signature
  }

  /**
   * Sets the block work
   *
   * @param {string} hex - The hex encoded 8 byte block hash PoW
   */
  set work (val) {
    if (!this._previous) throw new Error('Previous is not set.')
    if (checkWork(val, this._previous)) {
      if (this._signature) this._signature = null
      this._work = val
    } else {
      throw new Error('Invalid Work for this Block')
    }
  }

  // TODO Look into generating work on get work
  /**
   * Return the work of the block
   * @type {hex}
   * @readonly
   */
  get work () {
    return this._work
  }

  /**
   * Sets block amount
   *
   * @param {number | string} am - The amount in reason
   */
  set amount (val) {
    if (this._signature) this._signature = null
    this._amount = val
  }

  /**
   * Return the amount of the block as string
   * @type {string}
   * @readonly
   */
  get amount () {
    return this._amount
  }

  /**
   * Sets the previous block hash
   *
   * @param {string} hex - The hex encoded 64 byte previous block hash
   * @throws An exception on invalid block hash
   */
  set previous (val) {
    if (!/[0-9A-F]{64}/i.test(val)) throw new Error('Invalid previous block hash.')
    if (this._signature) this._signature = null
    this._previous = val
  }

  /**
   * Return the previous block as hash
   * @type {hex}
   * @readonly
   */
  get previous () {
    return this._previous
  }

  /**
   * Sets the transaction fee
   *
   * @param {number | string} amount - The amount in reason
   */
  set transactionFee (val) {
    if (this._signature) this._signature = null
    this._transactionFee = val
  }

  /**
   * Return the string amount of the transaction fee in reason
   * @type {string}
   * @readonly
   */
  get transactionFee () {
    return this._transactionFee
  }

  /**
   * Sets the representative
   *
   * @param {string} account - The Logos account that is your representative
   */
  set representative (val) {
    if (this._signature) this._signature = null
    this._representative = val
  }

  /**
   * Return the account of the representative
   * @type {string}
   * @readonly
   */
  get representative () {
    return this._representative
  }

  /**
   * Sets the destination
   *
   * @param {string} account - The Logos account that receives the block
   */
  set destination (val) {
    if (this._signature) this._signature = null
    this._destination = val
  }
  /**
   * The destination public key of the block
   * @type {hex}
   * @readonly
   */
  get destination () {
    return keyFromAccount(this._destination)
  }

  /**
   * Sets the account
   *
   * @param {string} account - The Logos account that creates the block
   */
  set account (val) {
    if (this._signature) this._signature = null
    this._account = val
  }

  /**
   * The account public key
   * @type {hex}
   * @readonly
   */
  get account () {
    return keyFromAccount(this._account)
  }

  toJSON (pretty = false) {
    const obj = {}
    obj.type = 'state'
    obj.previous = this._previous
    obj.link = this.destination
    obj.representative = this._representative
    obj.transactionFee = this._transactionFee
    obj.account = this.account
    obj.amount = this._amount
    obj.work = this._work
    obj.signature = this._signature
    return JSON.stringify(obj)
  }
}

function checkWork (work, previousHash) {
  let t = hexToUint8(MAIN_NET_WORK_THRESHOLD)
  if (testNet) t = hexToUint8(TEST_NET_WORK_THRESHOLD)
  const context = blake.blake2bInit(8, null)
  blake.blake2bUpdate(context, hexToUint8(work).reverse())
  blake.blake2bUpdate(context, hexToUint8(previousHash))
  const threshold = blake.blake2bFinal(context).reverse()
  if (testNet && threshold[0] === t[0]) return true
  if (!testNet && threshold[0] === t[0] && threshold[1] === t[1] && threshold[2] === t[2] && threshold[3] >= t[3]) return true
  return false
}

module.exports = Block
