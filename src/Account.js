const bigInt = require('big-integer')
const Block = require('./Block.js')
const Logger = require('./Logger')
const logger = new Logger()
const minimumTransactionFee = '10000000000000000000000'
const EMPTY_WORK = '0000000000000000'
const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000'
const officialRepresentative = 'lgs_3e3j5tkog48pnny9dmfzj1r16pg8t1e76dz5tmac6iq689wyjfpiij4txtdo'

class Account {
  constructor (options = {
    label: null,
    address: null,
    publicKey: null,
    privateKey: null,
    previous: null,
    balance: bigInt(0),
    pendingBalance: bigInt(0),
    representative: null,
    chain: [],
    receiveChain: [],
    pendingChain: [],
    version: 1,
    remoteWork: true,
    index: null
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
     * Deterministic Key Index used to generate this account
     *
     * @type {string}
     * @private
     */
    if (options.index !== null) this._index = options.index

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
     * Previous hexadecimal hash of the last confirmed or pending block
     * @type {string}
     * @private
     */
    this._previous = options.previous

    /**
     * Account version of webwallet SDK
     * @type {number}
     * @private
     */
    this._version = options.version

    /**
     * Remote work enabled
     * @type {boolean}
     * @private
     */
    this._remoteWork = options.remoteWork
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
    let rep = officialRepresentative
    if (this._representative) {
      rep = this._representative
    } else {
      // look for a state, change or open block on the chain
      this._pendingChain.forEach(block => {
        if (block.representative) {
          rep = block.representative
          this._representative = rep
        }
      })
      // No pending change blocks. Scanning previous sends to find rep
      if (!rep) {
        this._chain.forEach(block => {
          if (block.representative) {
            rep = block.representative
            this._representative = rep
          }
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
   * Return the previous block as hash
   * @type {hex}
   * @returns {hash} hash of the previous transaction
   */
  get previous () {
    if (this._previous !== null) {
      return this._previous
    } else {
      if (this._pendingChain.length > 0) {
        return this._pendingChain[this.pendingChain.length - 1].hash
      } else if (this._chain.length > 0) {
        return this._chain[this._chain.length - 1].hash
      } else {
        return null
      }
    }
  }

  /**
   * Sets the previous block hash
   *
   * @param {string} hex - The hex encoded 64 byte previous block hash
   * @throws An exception on invalid block hash
   */
  set previous (val) {
    if (!/[0-9A-F]{64}/i.test(val)) throw new Error('Invalid previous block hash.')
    this._previous = val
  }

  /**
   * Updates the balances of the account by traversing the chain
   */
  updateBalancesFromChain () {
    if (this._chain.length + this._pendingChain.length + this._receiveChain.length === 0) return bigInt(0)
    let sum = bigInt(0)
    this._chain.forEach(block => {
      sum = sum.minus(bigInt(block.amount))
    })
    this._receiveChain.forEach(block => {
      sum = sum.plus(bigInt(block.amount))
    })
    this._balance = sum
    this._pendingChain.forEach(block => {
      sum = sum.minus(bigInt(block.amount))
    })
    this._pendingBalance = sum
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
   * Removes all pending blocks from the pending chain
   */
  removePendingBlocks () {
    this._pendingChain = []
    this._pendingBalance = bigInt(0)
  }

  /**
   * Called when a block is confirmed to remove it from the pending block pool
   *
   * @param {string} blockHash - The hash of the block we are confirming
   */
  removePendingBlock (blockHash) {
    let found = false
    for (let i in this._pendingChain) {
      const block = this._pendingChain[i]
      if (block.hash === blockHash) {
        this._pendingChain.splice(i, 1)
        return true
      }
    }
    if (!found) {
      console.log('Not found')
      return false
    }
  }

  /**
   * Finds the block object of the specified block hash
   *
   * @param {string} hash - The hash of the block we are looking for
   * @returns {block} false if no block object of the specified hash was found
   */
  getBlock (hash) {
    for (let j = this._chain.length - 1; j >= 0; j--) {
      const blk = this._chain[j]
      if (blk.hash === hash) return blk
    }
    for (let n = this._receiveChain.length - 1; n >= 0; n--) {
      const blk = this._receiveChain[n]
      if (blk.hash === hash) return blk
    }
    for (let n = this._pendingChain.length - 1; n >= 0; n--) {
      const blk = this._receiveChain[n]
      if (blk.hash === hash) return blk
    }
    return false
  }

  /**
   * Finds the block object of the specified block hash in the pending chain
   *
   * @param {string} hash - The hash of the block we are looking for
   * @returns {block} false if no block object of the specified hash was found
   */
  getPendingBlock (hash) {
    for (let n = this._pendingChain.length - 1; n >= 0; n--) {
      const blk = this._receiveChain[n]
      if (blk.hash === hash) return blk
    }
    return false
  }

  /**
   * Creates a block from the specified information
   *
   * @param {string} to - The account address of who you are sending to
   * @param {string | bigInt | number} amount - The amount you wish to send in reason
   * @returns {block} the block object
   */
  async createBlock (to, amount = 0) {
    let block = new Block({
      signature: null,
      work: null,
      amount: amount.toString(),
      previous: this.previous,
      transactionFee: minimumTransactionFee,
      representative: this.representative,
      destination: to,
      account: this._address
    })

    block.sign(this._privateKey)

    this._previous = block.hash
    this._balance = this._balance.minus(bigInt(amount))
    if (block.work === null) {
      if (this._remoteWork) {
        // TODO Send request to the remote work cluster
        block.work = EMPTY_WORK
      } else {
        await block.createWork(true)
      }
    }
    this._pendingChain.push(block)

    return block
  }

  /**
   * Confirms the block in the local chain
   *
   * @param {string} hash The block hash
   * @throws An exception if the block is not found in the pending blocks array
   * @throws An exception if the previous block does not match the last chain block
   * @throws An exception if the block amount is greater than your balance minus the transaction fee
   */
  confirmBlock (hash) {
    const block = this.getPendingBlock(hash)
    if (block) {
      if (block.previous === this._chain[this._chain.length - 1].hash) {
        if (this._balance.minus(block.transactionFee).lesser(block.amount)) {
          throw new Error('Insufficient funds to confirm this block there must be an issue in our local chain or someone is sending us bad blocks')
        } else {
          // Confirm the block add it to the local confirmed chain and remove from pending.
          this._chain.push(block)
          this.removePendingBlock(hash)
          this.updateBalancesFromChain()
          logger.log('Block added to chain: ' + block.hash)
        }
      } else {
        console.log(`Block Previous :${block.previous}\n Local Previous: ${this._chain[this._chain.length - 1].hash}`)
        throw new Error('Previous block does not match actual previous block')
      }
    } else {
      logger.warn('Block trying to be confirmed has not been found.')
      throw new Error('Block not found')
    }
  }
}

module.export = Account
