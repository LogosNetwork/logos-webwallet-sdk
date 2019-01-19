const bigInt = require('big-integer')
const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000'
class Account {
  constructor (options = {
    label: null,
    address: null,
    publicKey: null,
    privateKey: null,
    balance: bigInt(0),
    pendingBalance: bigInt(0),
    representative: null,
    chain: [],
    receiveChain: [],
    pendingChain: [],
    version: 1
  }) {
    /**
     * Label of this account
     *
     * This allows you to set a readable string for each account.
     *
     * @type {string}
     * @private
     */
    this._label = options.label

    /**
     * Address of this account
     * @type {string}
     * @private
     */
    this._address = options.address

    /**
     * Public Key of this account
     * @type {string}
     * @private
     */
    this._publicKey = options.publicKey

    /**
     * Private Key of this account
     * @type {string}
     * @private
     */
    this._privateKey = options.privateKey

    /**
     * Balance of this account in reason
     * @type {string | number}
     * @private
     */
    this._balance = bigInt(options.balance)

    /**
     * Pending Balance of the account in reason
     *
     * pending balance is balance minus the sends that are pending
     * @type {string | number}
     * @private
     */
    this._pendingBalance = bigInt(options.pendingBalance)

    /**
     * Representative of the account
     * @type {string}
     * @private
     */
    this._representative = options.representative

    /**
     * Chain of the account
     * @type {array<Block>}
     * @private
     */
    this._chain = options.chain

    /**
     * Receive chain of the account
     * @type {array<Block>}
     * @private
     */
    this._receiveChain = options.receiveChain

    /**
     * Pending chain of the account (local unconfirmed sends)
     * @type {array<Block>}
     * @private
     */
    this._chain = options.chain

    /**
     * Chain of confirmed blocks
     * @type {array<blocks>}
     * @private
     */
    this._pendingChain = options.pendingChain

    /**
     * Account version of webwallet SDK
     * @type {number}
     * @private
     */
    this._version = 1
  }

  /**
   * The label of the account
   * @type {string}
   * @readonly
   */
  get label () {
    return this._label
  }

  /**
   * The address of the account
   * @type {string}
   * @readonly
   */
  get address () {
    return this._address
  }

  /**
   * The public key of the account
   * @type {hex}
   * @readonly
   */
  get publicKey () {
    return this._publicKey
  }

  /**
   * The private key of the account
   * @type {hex}
   * @readonly
   */
  get privateKey () {
    return this._privateKey
  }

  /**
   * The balance of the account in reason
   * @type {string}
   * @readonly
   */
  get balance () {
    return this._balance.toString()
  }

  /**
   * The pending balance of the account in reason
   *
   * pending balance is balance minus the sends that are pending
   *
   * @type {string}
   * @readonly
   */
  get pendingBalance () {
    return this._pendingBalance.toString()
  }

  /**
   * The representative of the account
   * @type {string}
   * @readonly
   */
  get representative () {
    let rep = null
    if (this._representative) {
      rep = this._representative
    } else {
      // look for a state, change or open block on the chain
      this._pendingChain.forEach(block => {
        if (block.representative) rep = block.representative
      })
      // No pending change blocks. Scanning previous sends to find rep
      if (!rep) {
        this._chain.forEach(block => {
          if (block.representative) rep = block.representative
        })
      }
    }
    return rep
  }

  /**
   * array of confirmed blocks on the account
   * @type {array<Block>}
   * @readonly
   */
  get chain () {
    return this._chain
  }

  /**
   * array of confirmed receive blocks on the account
   * @type {array<Block>}
   * @readonly
   */
  get receiveChain () {
    return this._receiveChain
  }

  /**
   * array of pending blocks on the account
   *
   * These blocks have been sent for consensus but we haven't heard back on if they are confirmed yet.
   *
   * @type {array<Block>}
   * @readonly
   */
  get pendingChain () {
    return this._pendingChain
  }

  /**
   * Add any data you want to the account
   * @param {string} label - The label you want to add to the account
   * @returns {string} label you set
   */
  set label (label) {
    this._label = label
    return this._label
  }

  /**
   * Updates the balance of the account by traversing the chain
   *
   * @returns {boolean}
   */
  updateBalanceFromChain () {
    if (this._chain.length + this._pendingChain.length + this._receiveChain.length === 0) return bigInt(0)
    let sum = bigInt(0)
    this._chain.forEach(block => {
      sum = sum.minus(bigInt(block.amount))
    })
    this._pendingChain.forEach(block => {
      sum = sum.minus(bigInt(block.amount))
    })
    this._receiveChain.forEach(block => {
      sum = sum.plus(bigInt(block.amount))
    })
    this._balance = sum
    return sum
  }

  /**
   * Verify the integrity of the send & pending chains
   *
   * @returns {boolean}
   */
  verifyChain () {
    let last = GENESIS_HASH
    this._chain.forEach(block => {
      if (block.previous !== last) throw new Error('Invalid Chain')
      if (!block.verify()) throw new Error('Invalid block in this chain')
      last = block.previous
    })
    this._pendingChain.forEach(block => {
      if (block.previous !== last) throw new Error('Invalid Chain')
      if (!block.verify()) throw new Error('Invalid block in this chain')
      last = block.previous
    })
    return true
  }

  /**
   * Verify the integrity of the recieve chain
   *
   * @returns {boolean}
   */
  verifyRecieveChain () {
    let last = GENESIS_HASH
    this._receiveChain.forEach(block => {
      if (block.previous !== last) throw new Error('Invalid Chain')
      if (!block.verify()) throw new Error('Invalid block in this chain')
      last = block.previous
    })
    return true
  }

  /**
   * Retreives blocks from the send chain
   *
   * @param {number} count - Number of blocks you wish to retrieve
   * @param {number} offset - Number of blocks back from the frontier tip you wish to start at
   * @returns {Array} all the blocks
   */
  recentBlocks (count = 5, offset = 0) {
    const blocks = []
    if (count > this._chain.length) count = this._chain.length
    for (let i = this._chain.length - 1 - offset; i > this._chain.length - 1 - count - offset; i--) {
      blocks.push(this._chain)
    }
    return blocks
  }

  /**
   * Retreives pending blocks from the send chain
   *
   * @param {number} count - Number of blocks you wish to retrieve
   * @param {number} offset - Number of blocks back from the frontier tip you wish to start at
   * @returns {Array} all the blocks
   */
  recentPendingBlocks (count = 5, offset = 0) {
    const blocks = []
    if (count > this._pendingChain.length) count = this._pendingChain.length
    for (let i = this._pendingChain.length - 1 - offset; i > this._pendingChain.length - 1 - count - offset; i--) {
      blocks.push(this._pendingChain)
    }
    return blocks
  }

  /**
   * Retreives blocks from the recieve chain
   *
   * @param {number} count - Number of blocks you wish to retrieve
   * @param {number} offset - Number of blocks back from the frontier tip you wish to start at
   * @returns {Array} all the blocks
   */
  recentReceiveBlocks (count = 5, offset = 0) {
    const blocks = []
    if (count > this._receiveChain.length) count = this._receiveChain.length
    for (let i = this._receiveChain.length - 1 - offset; i > this._receiveChain.length - 1 - count - offset; i--) {
      blocks.push(this._receiveChain)
    }
    return blocks
  }

  /**
   * Gets the blocks up to a certain hash from the send chain
   *
   * @param {string} hash - Hash of the block you wish to stop retrieving blocks at
   * @returns {Array} all the blocks up to and including the specified block
   */
  getBlocksUpTo (hash) {
    const blocks = []
    for (let i = this._chain.length - 1; i > 0; i--) {
      blocks.push(this._chain[i])
      if (this._chain[i].hash === hash) break
    }
    return blocks
  }

  /**
   * Gets the blocks up to a certain hash from the pending chain
   *
   * @param {string} hash - Hash of the block you wish to stop retrieving blocks at
   * @returns {Array} all the blocks up to and including the specified block
   */
  getPendingBlocksUpTo (hash) {
    const blocks = []
    for (let i = this._pendingChain.length - 1; i > 0; i--) {
      blocks.push(this._pendingChain[i])
      if (this._pendingChain[i].hash === hash) break
    }
    return blocks
  }

  /**
   * Gets the blocks up to a certain hash from the receive chain
   *
   * @param {string} hash - Hash of the block you wish to stop retrieving blocks at
   * @returns {Array} all the blocks up to and including the specified block
   */
  getReceiveBlocksUpTo (hash) {
    const blocks = []
    for (let i = this._receiveChain.length - 1; i > 0; i--) {
      blocks.push(this._receiveChain[i])
      if (this._receiveChain[i].hash === hash) break
    }
    return blocks
  }

  /**
   * Gets the total number of blocks on the send chain
   *
   * @returns {number} count of all the blocks
   */
  get blockCount () {
    return this._chain.length
  }

  /**
   * Gets the total number of blocks on the pending chain
   *
   * @returns {number} count of all the blocks
   */
  get pendingBlockCount () {
    return this._pendingChain.length
  }

  /**
   * Gets the total number of blocks on the receive chain
   *
   * @returns {number} count of all the blocks
   */
  get receiveCount () {
    return this._receiveChain.length
  }
}

module.export = Account
