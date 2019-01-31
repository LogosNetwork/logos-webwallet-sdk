const bigInt = require('big-integer')
const Block = require('./Block.js')
const Logos = require('@logosnetwork/logos-rpc-client')
const minimumTransactionFee = '10000000000000000000000'
const EMPTY_WORK = '0000000000000000'
const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000'
const officialRepresentative = 'lgs_3e3j5tkog48pnny9dmfzj1r16pg8t1e76dz5tmac6iq689wyjfpiij4txtdo'

/**
 * The Accounts contain the keys, chains, and balances.
 */
class Account {
  constructor (options = {
    label: null,
    address: null,
    publicKey: null,
    privateKey: null,
    previous: null,
    balance: '0',
    pendingBalance: '0',
    representative: null,
    chain: [],
    receiveChain: [],
    pendingChain: [],
    version: 1,
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
    if (options.label !== undefined) {
      this._label = options.label
    } else {
      this._label = null
    }

    /**
     * Deterministic Key Index used to generate this account - null means generated explicitly
     *
     * @type {number}
     * @private
     */
    if (options.index !== undefined) {
      this._index = options.index
    } else {
      this._index = null
    }

    /**
     * Address of this account
     * @type {LogosAddress}
     * @private
     */
    if (options.address !== undefined) {
      this._address = options.address
    } else {
      this._address = null
    }

    /**
     * Public Key of this account
     * @type {Hexadecimal64Length}
     * @private
     */
    if (options.publicKey !== undefined) {
      this._publicKey = options.publicKey
    } else {
      this._publicKey = null
    }

    /**
     * Private Key of this account
     * @type {Hexadecimal64Length}
     * @private
     */
    if (options.privateKey !== undefined) {
      this._privateKey = options.privateKey
    } else {
      this._privateKey = null
    }
    /**
     * Balance of this account in reason
     * @type {string}
     * @private
     */
    if (options.balance !== undefined) {
      this._balance = options.balance
    } else {
      this._balance = '0'
    }

    /**
     * Pending Balance of the account in reason
     *
     * pending balance is balance minus the sends that are pending
     * @type {string}
     * @private
     */
    if (options.pendingBalance !== undefined) {
      this._pendingBalance = options.pendingBalance
    } else {
      this._pendingBalance = '0'
    }

    /**
     * Representative of the account
     * @type {LogosAddress}
     * @private
     */
    if (options.representative !== undefined) {
      this._representative = options.representative
    } else {
      this._representative = null
    }

    /**
     * Chain of the account
     * @type {Block[]}
     * @private
     */
    if (options.chain !== undefined) {
      this._chain = options.chain
    } else {
      this._chain = []
    }

    /**
     * Receive chain of the account
     * @type {Block[]}
     * @private
     */
    if (options.receiveChain !== undefined) {
      this._receiveChain = options.receiveChain
    } else {
      this._receiveChain = []
    }

    /**
     * Pending chain of the account (local unconfirmed sends)
     * @type {Block[]}
     * @private
     */
    if (options.pendingChain !== undefined) {
      this._pendingChain = options.pendingChain
    } else {
      this._pendingChain = []
    }

    /**
     * Previous hexadecimal hash of the last confirmed or pending block
     * @type {Hexadecimal64Length}
     * @private
     */
    if (options.previous !== undefined) {
      this._previous = options.previous
    } else {
      this._previous = null
    }

    /**
     * Account version of webwallet SDK
     * @type {number}
     * @private
     */
    if (options.version !== undefined) {
      this._version = options.version
    } else {
      this._version = 1
    }

    this._synced = false
  }

  /**
   * If the account has been synced with the RPC or if RPC is disabled this is true
   * @type {boolean}
   */
  get synced () {
    return this._synced
  }

  /**
   * The index of the account
   * @type {number}
   * @readonly
   */
  get index () {
    return this._index
  }

  /**
   * The label of the account
   * @type {string}
   */
  get label () {
    return this._label
  }

  /**
   * The address of the account
   * @type {LogosAddress}
   * @readonly
   */
  get address () {
    return this._address
  }

  /**
   * The public key of the account
   * @type {Hexadecimal64Length}
   * @readonly
   */
  get publicKey () {
    return this._publicKey
  }

  /**
   * The private key of the account
   * @type {Hexadecimal64Length}
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
    return this._balance
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
    return this._pendingBalance
  }

  /**
   * The representative of the account
   * @type {LogosAddress}
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
   * @type {Block[]}
   * @readonly
   */
  get chain () {
    return this._chain
  }

  /**
   * array of confirmed receive blocks on the account
   * @type {Block[]}
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
   * @type {Block[]}
   * @readonly
   */
  get pendingChain () {
    return this._pendingChain
  }

  /**
   * Gets the total number of blocks on the send chain
   *
   * @type {number} count of all the blocks
   * @readonly
   */
  get blockCount () {
    return this._chain.length
  }

  /**
   * Gets the total number of blocks on the pending chain
   *
   * @type {number} count of all the blocks
   * @readonly
   */
  get pendingBlockCount () {
    return this._pendingChain.length
  }

  /**
   * Gets the total number of blocks on the receive chain
   *
   * @type {number} count of all the blocks
   * @readonly
   */
  get receiveCount () {
    return this._receiveChain.length
  }

  set label (label) {
    this._label = label
  }

  set synced (val) {
    this._synced = val
  }

  /**
   * Return the previous block as hash
   * @type {Hexadecimal64Length}
   * @returns {Hexadecimal64Length} hash of the previous transaction
   * @readonly
   */
  get previous () {
    if (this._previous !== null) {
      return this._previous
    } else {
      if (this._pendingChain.length > 0) {
        this._previous = this._pendingChain[this.pendingChain.length - 1].hash
      } else if (this._chain.length > 0) {
        this._previous = this._chain[this._chain.length - 1].hash
      } else {
        this._previous = GENESIS_HASH
      }
      return this._previous
    }
  }

  /**
   * Scans the account history using RPC and updates the local chain
   * @param {RPCOptions} options host and proxy used to sync the chain to (this data will be validated)
   * @returns {void}
   */
  async sync (options) {
    this._synced = false
    this._chain = []
    this._receiveChain = []
    const RPC = new Logos({ url: options.host, proxyURL: options.proxy })
    let history = await RPC.accounts.history(this._address, -1)
    if (history) {
      for await (const blockInfo of history) {
        let blockOptions = await RPC.transactions.info(blockInfo.hash)
        if (blockOptions.type === 'receive') blockOptions = await RPC.transactions.info(blockOptions.link)
        let block = new Block({
          signature: blockOptions.signature,
          work: blockOptions.work,
          amount: blockOptions.amount,
          previous: blockOptions.previous,
          transactionFee: blockOptions.transaction_fee,
          representative: blockOptions.representative,
          destination: blockOptions.link_as_account,
          account: blockOptions.account
        })
        if (block.verify()) {
          if (blockInfo.type === 'receive') {
            this._receiveChain.unshift(block)
          } else if (blockInfo.type === 'send') {
            this._chain.unshift(block)
          }
        } else {
          throw new Error('Invalid Block inside the returned RPC Blocks or the Webwallet has a bug with this account')
        }
      }
      this.updateBalancesFromChain()
      if (this.verifyChain() && this.verifyReceiveChain()) {
        this._synced = true
        console.log(`${this._address} is synced and valid`)
      }
    } else {
      this._synced = true
      console.log(`${this._address} is empty and therefore valid`)
    }
    return this
  }

  /**
   * Updates the balances of the account by traversing the chain
   * @returns {void}
   */
  updateBalancesFromChain () {
    if (this._chain.length + this._pendingChain.length + this._receiveChain.length === 0) return bigInt(0)
    let sum = bigInt(0)
    this._receiveChain.forEach(block => {
      sum = sum.plus(bigInt(block.amount))
    })
    this._chain.forEach(block => {
      sum = sum.minus(bigInt(block.amount))
    })
    this._balance = sum.toString()
    this._pendingChain.forEach(block => {
      sum = sum.minus(bigInt(block.amount))
    })
    this._pendingBalance = sum.toString()
  }

  /**
   * Verify the integrity of the send & pending chains
   *
   * @returns {boolean}
   */
  verifyChain () {
    let last = GENESIS_HASH
    this._chain.forEach(block => {
      if (block.previous !== last) throw new Error('Invalid Chain (prev != current hash)')
      if (!block.verify()) throw new Error('Invalid block in this chain')
      last = block.hash
    })
    this._pendingChain.reverse().forEach(block => {
      if (block.previous !== last) throw new Error('Invalid Pending Chain (prev != current hash)')
      if (!block.verify()) throw new Error('Invalid block in the pending chain')
      last = block.hash
    })
    return true
  }

  /**
   * Verify the integrity of the receive chain
   *
   * @throws An exception if there is an invalid block in the receive blockchain
   * @returns {boolean}
   */
  verifyReceiveChain () {
    this._receiveChain.forEach(block => {
      if (!block.verify()) throw new Error('Invalid block in this chain')
    })
    return true
  }

  /**
   * Retreives blocks from the send chain
   *
   * @param {number} count - Number of blocks you wish to retrieve
   * @param {number} offset - Number of blocks back from the frontier tip you wish to start at
   * @returns {Block[]} all the blocks
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
   * @returns {Block[]} all the blocks
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
   * Retreives blocks from the receive chain
   *
   * @param {number} count - Number of blocks you wish to retrieve
   * @param {number} offset - Number of blocks back from the frontier tip you wish to start at
   * @returns {Block[]} all the blocks
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
   * @param {Hexadecimal64Length} hash - Hash of the block you wish to stop retrieving blocks at
   * @returns {Block[]} all the blocks up to and including the specified block
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
   * @param {Hexadecimal64Length} hash - Hash of the block you wish to stop retrieving blocks at
   * @returns {Block[]} all the blocks up to and including the specified block
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
   * @param {Hexadecimal64Length} hash - Hash of the block you wish to stop retrieving blocks at
   * @returns {Block[]} all the blocks up to and including the specified block
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
   * @returns {void}
   */
  removePendingBlocks () {
    this._pendingChain = []
    this._pendingBalance = this._balance
  }

  /**
   * Called when a block is confirmed to remove it from the pending block pool
   *
   * @param {Hexadecimal64Length} hash - The hash of the block we are confirming
   * @returns {boolean}
   */
  removePendingBlock (hash) {
    let found = false
    for (let i in this._pendingChain) {
      const block = this._pendingChain[i]
      if (block.hash === hash) {
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
   * @param {Hexadecimal64Length} hash - The hash of the block we are looking for
   * @returns {Block} false if no block object of the specified hash was found
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
   * @param {Hexadecimal64Length} hash - The hash of the block we are looking for
   * @returns {Block} false if no block object of the specified hash was found
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
   * @param {LogosAddress} to - The account address of who you are sending to
   * @param {string} amount - The amount you wish to send in reason
   * @param {boolean} remoteWork - Should the work be genereated locally or remote
   * @param {RPCOptions} rpc - Options to send the public command if null it will not publish the block
   * @throws An exception if the account has not been synced
   * @throws An exception if the pending balance is less than the required amount to do a send
   * @throws An exception if the block is rejected by the RPC
   * @returns {Promise<Block>} the block object
   */
  async createBlock (to, amount = 0, remoteWork = true, rpc = {
    host: 'http://100.25.175.142:55000',
    proxy: 'https://pla.bs'
  }) {
    if (this._synced === false) throw new Error('This account has not been synced or is being synced with the RPC network')
    if (bigInt(this._pendingBalance).minus(bigInt(amount)).minus(minimumTransactionFee).lesser(0)) {
      throw new Error('Invalid Block: Not Enough Funds including fee to send that amount')
    }
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
    this._pendingBalance = bigInt(this._pendingBalance).minus(bigInt(amount)).minus(minimumTransactionFee).toString()
    if (block.work === null) {
      if (remoteWork) {
        // TODO Send request to the remote work cluster
        block.work = EMPTY_WORK
      } else {
        block.work = await block.createWork(true)
      }
    }
    this._pendingChain.push(block)
    if (rpc) {
      let response = await block.publish(rpc)
      if (response.hash) {
        return block
      } else {
        throw new Error('Invalid Block: Rejected by Logos Node')
      }
    } else {
      return block
    }
  }

  /**
   * Confirms the block in the local chain
   *
   * @param {Hexadecimal64Length} hash The block hash
   * @throws An exception if the block is not found in the pending blocks array
   * @throws An exception if the previous block does not match the last chain block
   * @throws An exception if the block amount is greater than your balance minus the transaction fee
   * @returns {void}
   */
  confirmBlock (hash) {
    const block = this.getPendingBlock(hash)
    if (block) {
      if (block.previous === this._chain[this._chain.length - 1].hash) {
        if (bigInt(this._balance).minus(block.transactionFee).lesser(block.amount)) {
          throw new Error('Insufficient funds to confirm this block there must be an issue in our local chain or someone is sending us bad blocks')
        } else {
          // Confirm the block add it to the local confirmed chain and remove from pending.
          this._chain.push(block)
          this.removePendingBlock(hash)
          this.updateBalancesFromChain()
        }
      } else {
        console.log(`Block Previous :${block.previous}\n Local Previous: ${this._chain[this._chain.length - 1].hash}`)
        throw new Error('Previous block does not match actual previous block')
      }
    } else {
      throw new Error('Block not found')
    }
  }

  /**
   * Adds a receive block to the local chain
   *
   * @param {MQTTBlockOptions} block The mqtt block options
   * @returns {void}
   */
  addReceiveBlock (block) {
    let receive = new Block({
      signature: block.signature,
      work: block.work,
      amount: block.amount,
      previous: block.previous,
      transactionFee: block.transactionFee,
      representative: block.representative,
      destination: block.link_as_account,
      account: block.account
    })
    if (receive.verify()) {
      this._receiveChain.push(receive)
      this.updateBalancesFromChain()
      return receive
    } else {
      return false
    }
  }
}

module.exports = Account
