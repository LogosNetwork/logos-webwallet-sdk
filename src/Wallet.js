import { hexToUint8, decToHex, uint8ToHex, accountFromHexKey, stringToHex, keyFromAccount } from './functions'
const pbkdf2 = require('pbkdf2')
const crypto = require('crypto')
const assert = require('assert')
const Block = require('./Block')
const Buffer = require('buffer').Buffer
const blake = require('blakejs')
const bigInt = require('big-integer')
const Logger = require('./Logger')
const nacl = require('tweetnacl/nacl') // We are using a forked version of tweetnacl, so need to import nacl

const MAIN_NET_WORK_THRESHOLD = 'ffffffc000000000'
const BLOCK_BIT_LEN = 128

const Iso10126 = {
  /*
   *   Fills remaining block space with random byte values, except for the
   *   final byte, which denotes the byte length of the padding
   */

  pad: function (dataBytes, nBytesPerBlock) {
    const nPaddingBytes = nBytesPerBlock - dataBytes.length % nBytesPerBlock
    const paddingBytes = crypto.randomBytes(nPaddingBytes - 1)
    const endByte = Buffer.from([nPaddingBytes])
    return Buffer.concat([dataBytes, paddingBytes, endByte])
  },

  unpad: function (dataBytes) {
    const nPaddingBytes = dataBytes[dataBytes.length - 1]
    return dataBytes.slice(0, -nPaddingBytes)
  }
}

const AES = {
  CBC: 'aes-256-cbc',
  OFB: 'aes-256-ofb',
  ECB: 'aes-256-ecb',

  /*
   *   Encrypt / Decrypt with aes-256
   *   - dataBytes, key, and salt are expected to be buffers
   *   - default options are mode=CBC and padding=auto (PKCS7)
   */

  encrypt: function (dataBytes, key, salt, options) {
    options = options || {}
    assert(Buffer.isBuffer(dataBytes), 'expected `dataBytes` to be a Buffer')
    assert(Buffer.isBuffer(key), 'expected `key` to be a Buffer')
    assert(Buffer.isBuffer(salt) || salt === null, 'expected `salt` to be a Buffer or null')

    const cipher = crypto.createCipheriv(options.mode || AES.CBC, key, salt || '')
    cipher.setAutoPadding(!options.padding)

    if (options.padding) dataBytes = options.padding.pad(dataBytes, BLOCK_BIT_LEN / 8)
    const encryptedBytes = Buffer.concat([cipher.update(dataBytes), cipher.final()])

    return encryptedBytes
  },

  decrypt: function (dataBytes, key, salt, options) {
    options = options || {}
    assert(Buffer.isBuffer(dataBytes), 'expected `dataBytes` to be a Buffer')
    assert(Buffer.isBuffer(key), 'expected `key` to be a Buffer')
    assert(Buffer.isBuffer(salt) || salt === null, 'expected `salt` to be a Buffer or null')

    const decipher = crypto.createDecipheriv(options.mode || AES.CBC, key, salt || '')
    decipher.setAutoPadding(!options.padding)

    let decryptedBytes = Buffer.concat([decipher.update(dataBytes), decipher.final()])
    if (options.padding) decryptedBytes = options.padding.unpad(decryptedBytes)

    return decryptedBytes
  }
}

const KEY_TYPE = {
  SEEDED: 'seeded',
  EXPLICIT: 'explicit'
}

module.exports = (password) => {
  let api = {} // wallet public methods
  let _private = {} // wallet private methods

  const officialRepresentative = 'lgs_3e3j5tkog48pnny9dmfzj1r16pg8t1e76dz5tmac6iq689wyjfpiij4txtdo' // Change this so you don't vote for offical rep

  let current // current active key (shortcut for keys[currentIdx])
  let currentIdx = -1 // active wallet index being used

  let keys = [] // wallet keys, accounts, and all necessary data
  let readyBlocks = [] // wallet blocks signed and worked, ready to be broadcasted
  let walletPendingBlocks = [] // Blocks that have been broadcasted but not yet have been confirmed
  let errorBlocks = [] // blocks which could not be confirmed

  let remoteWork = [] // work pool

  let seed = '' // wallet seed
  let lastKeyFromSeed = -1 // seed index
  let passPhrase = password // wallet password
  let iterations = 5000 // pbkdf2 iterations
  let ciphered = true
  let loginKey = false // key to tell the server when the wallet was successfully decrypted
  let version = 1 // wallet version

  let logger = new Logger()

  api.debug = () => {
    console.log(readyBlocks)
  }

  api.debugSendChain = (acc) => {
    const temp = keys[currentIdx].account
    api.useAccount(acc)
    for (let i in current.chain) {
      console.log(current.chain[i].getHash(true))
      console.log(current.chain[i].getPrevious())
    }
    api.useAccount(temp)
  }

  api.debugReceiveChain = (acc) => {
    const temp = keys[currentIdx].account
    api.useAccount(acc)
    for (let i in current.receiveChain) {
      console.log(current.receiveChain[i].getHash(true))
      console.log(current.receiveChain[i].getPrevious())
    }
    api.useAccount(temp)
  }

  api.setLogger = (loggerObj) => {
    logger = loggerObj
  }

  /**
   * Signs a message with the secret key
   *
   * @param {Array} message - The message to be signed in a byte array
   * @returns {Array} The 64 byte signature
   */
  api.sign = (message, pk) => {
    if (current && current.priv) pk = current.priv
    if (pk.length !== 32) throw new Error('Invalid Secret Key length. Should be 32 bytes.')
    return nacl.sign.detached(message, pk)
  }

  api.changePass = (pswd, newPass) => {
    if (ciphered) throw new Error('Wallet needs to be decrypted first.')
    if (pswd === passPhrase) {
      passPhrase = newPass
      logger.log('Password changed')
    } else {
      throw new Error('Incorrect password.')
    }
  }

  api.setIterations = (newIterationNumber) => {
    newIterationNumber = parseInt(newIterationNumber)
    if (newIterationNumber < 2) throw new Error('Minumum iteration number is 2.')
    iterations = newIterationNumber
  }

  /**
   * Sets a seed for the wallet
   *
   * @param {string} hexSeed - The 32 byte seed hex encoded
   * @throws An exception on malformed seed
   */
  api.setSeed = (hexSeed) => {
    if (!/[0-9A-F]{64}/i.test(hexSeed)) throw new Error('Invalid Hex Seed.')
    seed = hexToUint8(hexSeed)
  }

  api.getSeed = (pswd) => {
    if (pswd === passPhrase) return uint8ToHex(seed)
    throw new Error('Incorrect password.')
  }

  /**
   * Sets a random seed for the wallet
   *
   * @param {boolean} overwrite - Set to true to overwrite an existing seed
   * @throws An exception on existing seed
   */
  api.setRandomSeed = function (overwrite = false) {
    if (seed && !overwrite) throw new Error('Seed already exists. To overwrite use setSeed or set overwrite to true')
    seed = nacl.randomBytes(32)
  }

  _private.addKey = (o) => {
    let key = {
      account: accountFromHexKey(uint8ToHex(o.pub)),
      balance: bigInt(0),
      lastBlock: '',
      lastPendingBlock: '',
      pendingBlocks: [],
      subscribed: false,
      chain: [],
      representative: '',
      label: ''
    }
    for (let k in o) {
      key[k] = o[k]
    }
    keys.push(key)
    return key
  }

  _private.newKeyDataFromSeed = (index) => {
    if (seed.length !== 32) throw new Error('Seed should be set first.')

    const indexBytes = hexToUint8(decToHex(index, 4))

    const context = blake.blake2bInit(32)
    blake.blake2bUpdate(context, seed)
    blake.blake2bUpdate(context, indexBytes)

    const secretKey = blake.blake2bFinal(context)
    const publicKey = nacl.sign.keyPair.fromSecretKey(secretKey).publicKey

    return {
      type: KEY_TYPE.SEEDED,
      seedIndex: index,
      priv: secretKey,
      pub: publicKey
    }
  }

  _private.newKeyDataFromSecret = (secretKey) => {
    const publicKey = nacl.sign.keyPair.fromSecretKey(secretKey).publicKey
    return {
      type: KEY_TYPE.EXPLICIT,
      priv: secretKey,
      pub: publicKey
    }
  }

  /**
   * Derives a new secret key from the seed and adds it to the wallet
   *
   * @throws An exception if theres no seed
   * @returns {string} The freshly added account address
   */
  api.newKeyFromSeed = () => {
    const index = lastKeyFromSeed + 1

    let key = _private.newKeyDataFromSeed(index)
    key = _private.addKey(key)
    logger.log('New seeded key added to wallet.')

    lastKeyFromSeed = index
    return key.account
  }

  /**
   * Adds a key to the wallet
   *
   * @param {string} hex - The secret key hex encoded
   * @throws An exception on invalid secret key length
   * @throws An exception on invalid hex format
   * @returns {string} The freshly added account address
   */
  api.addSecretKey = (hex) => {
    if (hex.length !== 64) throw new Error('Invalid Secret Key length. Should be 32 bytes.')

    if (!/[0-9A-F]{64}/i.test(hex)) throw new Error('Invalid Hex Secret Key.')

    let key = _private.newKeyDataFromSecret(hexToUint8(hex))
    key = _private.addKey(key)
    logger.log('New explicit key added to wallet.')

    return key.account
  }

  /**
   *
   * @param {boolean} hex - To return the result hex encoded
   * @returns {string} The public key hex encoded
   * @returns {Array} The public key in a byte array
   */
  api.getPublicKey = (hex = false) => {
    if (hex) return uint8ToHex(current.pub)
    return current.pub
  }

  /**
   * List all the accounts in the wallet
   *
   * @returns {Array}
   */
  api.getAccounts = () => {
    const accounts = []
    for (let i in keys) {
      if (!keys[i].balance) {
        keys[i].balance = 0
      }
      accounts.push({
        type: keys[i].type,
        account: keys[i].account,
        balance: bigInt(keys[i].balance),
        label: keys[i].label,
        lastHash: keys[i].chain.length > 0 ? keys[i].chain[keys[i].chain.length - 1] : false
      })
    }
    return accounts
  }

  /**
   * Switches the account being used by the wallet
   *
   * @param {string} accountToUse
   * @throws An exception if the account is not found in the wallet
   */
  api.useAccount = (accountToUse) => {
    for (let i in keys) {
      if (keys[i].account === accountToUse) {
        currentIdx = i
        current = keys[i]
        return
      }
    }
    throw new Error('Account not found in wallet (' + accountToUse + ') ' + JSON.stringify(api.getAccounts()))
  }

  /**
   * TODO - Revisit and rewrite or remove
   *
   * Doesn't set any global values
   * Seems to just verify the chain.
   * Doesn't pull receive chain
   * But it looks to throw an error on the second block everytime as last is no longer older block?
   */
  api.importChain = (blocks, acc) => {
    api.useAccount(acc)
    const last = current.chain.length > 0 ? current.chain[current.chain.length - 1].getHash(true) : uint8ToHex(current.pub)
    // verify chain
    for (let i in blocks) {
      if (blocks[i].getPrevious() !== last) throw new Error('Invalid chain')
      if (!api.verifyBlock(blocks[i])) throw new Error('There is an invalid block')
    }
  }

  /**
   * Retreives N send blocks from the send chain
   *
   * @param {string} acc - Account you wish to retrieve blocks from
   * @param {number} n - Number of blocks you wish to retrieve
   * @param {number} offset - Number of blocks back from the frontier tip you wish to start at
   * @returns {Array} all the blocks
   */
  api.getLastNBlocks = (acc, n, offset = 0) => {
    const temp = keys[currentIdx].account
    api.useAccount(acc)
    const blocks = []

    if (n > current.chain.length) n = current.chain.length

    for (let i = current.chain.length - 1 - offset; i > current.chain.length - 1 - n - offset; i--) {
      blocks.push(current.chain[i])
    }
    api.useAccount(temp)
    return blocks
  }

  /**
   * Retreives N receive blocks from the receive chain
   *
   * @param {string} acc - Account you wish to retrieve blocks from
   * @param {number} n - Number of blocks you wish to retrieve
   * @param {number} offset - Number of blocks back from the frontier tip you wish to start at
   * @returns {Array} all the blocks
   */
  api.getLastNReceives = (acc, n, offset = 0) => {
    const temp = keys[currentIdx].account
    api.useAccount(acc)
    const blocks = []

    if (n > current.receiveChain.length) n = current.receiveChain.length

    for (let i = current.receiveChain.length - 1 - offset; i > current.receiveChain.length - 1 - n - offset; i--) {
      blocks.push(current.receiveChain[i])
    }
    api.useAccount(temp)
    return blocks
  }

  /**
   * Gets the blocks up to a certain hash
   *
   * @param {string} acc - Account you wish to retrieve blocks from
   * @param {string} hash - Hash of the block you wish to stop retrieving blocks at
   * @returns {Array} all the blocks up to and including the specified block
   */
  api.getBlocksUpTo = (acc, hash) => {
    const temp = keys[currentIdx].account
    api.useAccount(acc)
    const blocks = []
    for (let i = current.chain.length - 1; i > 0; i--) {
      blocks.push(current.chain[i])
      if (current.chain[i].getHash(true) === hash) break
    }
    api.useAccount(temp)
    return blocks
  }

  /**
   * Gets the recieve blocks up to a certain hash
   *
   * @param {string} acc - Account you wish to retrieve blocks from
   * @param {string} hash - Hash of the block you wish to stop retrieving blocks at
   * @returns {Array} all the blocks up to and including the specified block
   */
  api.getReceiveUpTo = (acc, hash) => {
    const temp = keys[currentIdx].account
    api.useAccount(acc)
    const blocks = []
    for (let i = current.receiveChain.length - 1; i > 0; i--) {
      blocks.push(current.receiveChain[i])
      if (current.receiveChain[i].getHash(true) === hash) break
    }
    api.useAccount(temp)
    return blocks
  }

  /**
   * Gets the total number of blocks
   *
   * @param {string} acc - Account you wish to retrieve the block count of
   * @returns {number} count of all the blocks
   */
  api.getAccountBlockCount = (acc) => {
    const temp = keys[currentIdx].account
    api.useAccount(acc)
    const n = current.chain.length
    api.useAccount(temp)
    return n
  }

  /**
   * Gets the total number of recieve blocks
   *
   * @param {string} acc - Account you wish to retrieve the block count of
   * @returns {number} count of all the blocks
   */
  api.getAccountReceiveBlockCount = (acc) => {
    const temp = keys[currentIdx].account
    api.useAccount(acc)
    const n = current.receiveChain.length
    api.useAccount(temp)
    return n
  }

  /**
   * Generates a block signature from the block hash using the secret key
   *
   * @param {string} blockHash - The block hash hex encoded
   * @throws An exception on invalid block hash length
   * @throws An exception on invalid block hash hex encoding
   * @returns {string} The 64 byte hex encoded signature
   */
  api.signBlock = (block) => {
    const blockHash = block.getHash()

    if (blockHash.length !== 32) throw new Error('Invalid block hash length. It should be 32 bytes.')

    block.setSignature(uint8ToHex(api.sign(blockHash)))
    block.setAccount(keys[currentIdx].account)

    logger.log('Block ' + block.getHash(true) + ' signed.')
  }

  /**
   * Verifies a block signature given its hash, sig, and Logos account
   *
   * @param {string} blockHash - 32 byte hex encoded block hash
   * @param {string} blockSignature - 64 byte hex encoded signature
   * @param {string} account - A Logos account supposed to have signed the block
   * @returns {boolean}
   */
  api.verifyBlockSignature = (blockHash, blockSignature, account) => {
    const pubKey = hexToUint8(keyFromAccount(account))
    return nacl.sign.detached.verify(hexToUint8(blockHash), hexToUint8(blockSignature), pubKey)
  }

  /**
   * Verifies a signature given a block
   *
   * @param {object} block - a block object
   * @returns {boolean}
   */
  api.verifyBlock = (block) => {
    return api.verifyBlockSignature(block.getHash(true), block.getSignature(), block.getAccount())
  }

  /**
   * Returns current account balance
   *
   * @returns {bigInteger} balance
   */
  api.getBalance = () => {
    return current.balance
  }

  // TODO Refactor block types
  /**
   * Returns account representative
   *
   * @param {string} acc - Account you wish to retrieve the representative of
   * @returns {string} representative
   */
  api.getRepresentative = (acc = false) => {
    let rep
    let temp
    if (acc) {
      temp = currentIdx
      api.useAccount(acc)
    }
    if (current.representative) {
      rep = current.representative
    } else {
      // look for a state, change or open block on the chain
      for (let i in current.pendingBlocks) {
        if (current.pendingBlocks[i].getType() === 'open' || current.pendingBlocks[i].getType() === 'change' || current.pendingBlocks[i].getType() === 'state') {
          rep = current.pendingBlocks[i].getRepresentative()
        }
      }
      // No pending change blocks. Scanning previous sends to find rep
      if (!rep) {
        for (let i in current.chain) {
          if (current.chain[i].getType() === 'open' || current.chain[i].getType() === 'change' || current.chain[i].getType() === 'state') {
            rep = current.chain[i].getRepresentative()
          }
        }
      }
    }

    if (temp) api.useAccount(keys[temp].account)
    return rep
  }

  _private.setRepresentative = (repr) => {
    current.representative = repr
  }

  /**
   * Updates current account balance
   *
   * @param {number} newBalance - The new balance in raw units
   * @returns {bigInteger} balance
   */
  _private.setBalance = (newBalance) => {
    current.balance = bigInt(newBalance)
    return current.balance
  }

  /**
   * Updates current pending balance
   *
   * @param {number} newBalance - The new balance in raw units
   * @returns {bigInteger} pending balance
   */
  _private.setPendingBalance = function (newBalance) {
    current.pendingBalance = bigInt(newBalance)
    return current.pendingBalance
  }

  /**
   * Returns the balance of the specified account
   *
   * @param {string} acc - The account you want the balance of
   * @returns {bigInteger} balance
   */
  api.getAccountBalance = (acc) => {
    const temp = keys[currentIdx].account
    api.useAccount(acc)
    const bal = api.getBalanceFromChain()
    api.useAccount(temp)
    return bal
  }

  /**
   * Returns the balance of all the accounts
   *
   * @returns {bigInteger} balance
   */
  api.getWalletBalance = () => {
    let bal = bigInt(0)
    for (let i in keys) {
      if (!keys[i].balance) {
        keys[i].balance = 0
      }
      bal = bal.add(keys[i].balance)
    }
    return bal
  }

  /**
   * Updates the balance of all the accounts
   */
  api.recalculateWalletBalances = () => {
    const temp = keys[currentIdx].account
    for (let i in keys) {
      api.useAccount(keys[i].account)
      _private.setBalance(api.getBalanceFromChain())
    }
    api.useAccount(temp)
  }

  /**
   * Calculates the current account's balance at the current time.
   * @returns {bigInteger} - The calculated account balance
   */
  api.getBalanceFromChain = () => {
    if (current.chain.length + current.pendingBlocks.length + current.receiveChain.length === 0) return bigInt(0)

    let sum = bigInt(0)
    let blk

    // check pending blocks first
    for (let i = current.pendingBlocks.length - 1; i >= 0; i--) {
      blk = current.pendingBlocks[i]
      sum = sum.subtract(blk.getAmount())
    }

    // check send chain next
    for (let i = current.chain.length - 1; i >= 0; i--) {
      blk = current.chain[i]
      sum = sum.subtract(blk.getAmount())
    }

    // Finally check receive chain
    for (let i = current.receiveChain.length - 1; i >= 0; i--) {
      blk = current.receiveChain[i]
      sum = sum.add(blk.getAmount())
    }
    return sum
  }

  /**
   * Add any data you want to the account
   * @param {string} acc - The account you want to work on
   * @param {string} label - The label you want to add to the account
   * @returns true or false if it was successful
   */
  api.setLabel = (acc, label) => {
    for (let i in keys) {
      if (keys[i].account === acc) {
        keys[i].label = label
        return true
      }
    }
    return false
  }

  api.removePendingBlocks = () => {
    current.pendingBlocks = []
  }

  /**
   * Called when a block is confirmed to remove it from the pending block pool
   *
   * @param {string} blockHash - The hash of the block we are confirming
   */
  api.removePendingBlock = (blockHash) => {
    let found = false
    for (let i in current.pendingBlocks) {
      const tmp = current.pendingBlocks[i]
      if (tmp.getHash(true) === blockHash) {
        current.pendingBlocks.splice(i, 1)
        found = true
      }
    }
    if (!found) {
      console.log('Not found')
      return
    }
    for (let i in walletPendingBlocks) {
      const tmp = walletPendingBlocks[i]
      if (tmp.getHash(true) === blockHash) {
        walletPendingBlocks.splice(i, 1)
        return
      }
    }
  }

  /**
   * Finds the block object of the specified block hash
   *
   * @param {string} blockHash - The hash of the block we are looking for the object of
   * @returns {block} false if no block object of the specified hash was found
   */
  api.getBlockFromHash = (blockHash) => {
    for (let i = 0; i < keys.length; i++) {
      api.useAccount(keys[i].account)
      for (let j = current.chain.length - 1; j >= 0; j--) {
        const blk = current.chain[j]
        if (blk.getHash(true) === blockHash) return blk
      }
      for (let n = current.receiveChain.length - 1; n >= 0; n--) {
        const blk = current.receiveChain[n]
        if (blk.getHash(true) === blockHash) return blk
      }
    }
    return false
  }

  api.addBlockToReadyBlocks = (blk) => {
    readyBlocks.push(blk)
    logger.log('Block ready to be broadcasted: ' + blk.getHash(true))
  }

  api.addPendingSendBlock = (from, to, amount = 0, representative = false) => {
    api.useAccount(from)
    amount = bigInt(amount)

    let bal = api.getBalanceFromChain()
    // let bal = current.balance
    let blk = new Block()

    // This will not be neccessary in next version of Logos
    let rep
    if (representative !== false) {
      rep = representative
    } else {
      rep = api.getRepresentative()
      if (!rep) rep = officialRepresentative
    }

    blk.setSendParameters(current.lastPendingBlock, to)
    blk.setAmount(amount)
    blk.setAccount(from)
    blk.setRepresentative(rep) // This will not be neccessary in next version of Logos
    blk.build()
    api.signBlock(blk)

    current.lastPendingBlock = blk.getHash(true)
    _private.setBalance(bal.minus(amount))
    current.pendingBlocks.push(blk)
    walletPendingBlocks.push(blk)

    // check if we have received work already
    let worked = false
    for (let i in remoteWork) {
      if (remoteWork[i].hash === blk.getPrevious()) {
        if (remoteWork[i].worked) {
          worked = api.updateWorkPool(blk.getPrevious(), remoteWork[i].work)
          break
        }
      }
    }

    if (!worked) {
      api.workPoolAdd(blk.getPrevious(), from, true)
      logger.log('New send block waiting for work: ' + blk.getHash(true))
    } else {
      api.workPoolAdd(blk.getHash(true), from)
      logger.log('New send block & we have work: ' + blk.getHash(true))
    }

    return blk
  }

  api.getPendingBlocks = () => {
    return current.pendingBlocks
  }

  api.getPendingBlockByHash = (blockHash) => {
    for (let i in walletPendingBlocks) {
      if (walletPendingBlocks[i].getHash(true) === blockHash) return walletPendingBlocks[i]
    }
    return false
  }

  /**
   * Looks for the block in the current account chain and pending list
   * @param {string} blockHash - The hash of the block looked for, hex encoded
   * @returns the block if found, false if not
   */
  api.getBlockByHash = (blockHash) => {
    for (let i in current.pendingBlocks) {
      if (current.pendingBlocks[i].getHash(true) === blockHash) return current.pendingBlocks[i]
    }
    for (let i in current.receiveChain) {
      if (current.receiveChain[i].getHash(true) === blockHash) return current.receiveChain[i]
    }
    for (let i in current.chain) {
      if (current.chain[i].getHash(true) === blockHash) return current.chain[i]
    }
    return false
  }

  /**
   * Gets the hash of the previous block or the current public key if no previous block exists
   * @param {string} acc - The account you want to work on
   * @returns hash of block to work
   */
  api.getNextWorkBlockHash = (acc) => {
    const temp = keys[currentIdx].account
    api.useAccount(acc)

    let hash
    if (current.lastBlock.length > 0) {
      hash = current.lastBlock
    } else {
      hash = uint8ToHex(current.pub)
    }

    api.useAccount(temp)
    return hash
  }

  /**
   * Adds hashes to the work pool
   * @param {string} hash - The hash you need to get the work form
   * @param {string} acc - The account you want to work on
   * @param {boolean} needed - This represents if work is needed
   * @param {string} work - The work hex for this block
   */
  api.workPoolAdd = (hash, acc, needed = false, work = false) => {
    for (let i in remoteWork) {
      if (remoteWork[i].hash === hash) return // Already in the work pool
    }
    if (work !== false) {
      remoteWork.push({ hash: hash, worked: true, work: work, requested: true, needed: needed, account: acc })
    } else {
      remoteWork.push({ hash: hash, work: '', worked: false, requested: false, needed: needed, account: acc })
      logger.log('New work target: ' + hash)
    }
  }

  /**
   * Gets work pool
   * @returns array of work
   */
  api.getWorkPool = () => {
    return remoteWork
  }

  /**
   * Update the status of the work saying it has been requested
   * @param {string} hash - The hash you wish to request work on
   */
  api.setWorkRequested = (hash) => {
    for (let i in remoteWork) {
      if (remoteWork[i].hash === hash) {
        remoteWork[i].requested = true
        break
      }
    }
  }

  /**
   * Sets needed on the work now it is okay to request work for
   * @param {string} hash - The hash you need work for
   */
  api.setWorkNeeded = (hash) => {
    for (let i in remoteWork) {
      if (remoteWork[i].hash === hash) {
        remoteWork[i].needed = true
        break
      }
    }
  }

  /**
   * Checks to see if a work is valid for a given hash
   * @param {string} hash - The hash you need validate the work on
   * @param {string} work - The work
   * @returns boolean if the work is valid or not
   */
  api.checkWork = (hash, work) => {
    const t = hexToUint8(MAIN_NET_WORK_THRESHOLD)
    let context = blake.blake2bInit(8, null)
    blake.blake2bUpdate(context, hexToUint8(work).reverse())
    blake.blake2bUpdate(context, hexToUint8(hash))
    const threshold = blake.blake2bFinal(context).reverse()

    return (threshold[0] === t[0] &&
            threshold[1] === t[1] &&
            threshold[2] === t[2] &&
            threshold[3] >= t[3])
  }

  /**
   * Update the work pool given the work on a new hash
   * @param {string} hash - The hash you have work for
   * @param {string} work - The work that goes with the hash
   * @returns boolean if the work pool was updated properly with the new worked vaule
   */
  api.updateWorkPool = (hash, work) => {
    let found = false
    if (!api.checkWork(work, hash)) {
      logger.warn('Invalid PoW received (' + work + ') (' + hash + ').')
      return false
    }

    for (let i in remoteWork) {
      if (remoteWork[i].hash === hash) {
        remoteWork[i].work = work
        remoteWork[i].worked = true
        remoteWork[i].requested = true
        remoteWork[i].needed = false

        found = true
        for (let j in walletPendingBlocks) {
          if (walletPendingBlocks[j].getPrevious() === hash) {
            logger.log('Work received for block ' + walletPendingBlocks[j].getHash(true) + ' previous: ' + hash)
            let pendingBlock = walletPendingBlocks[j]
            pendingBlock.setWork(work)
            try {
              api.confirmBlock(pendingBlock.getHash(true))
              remoteWork.splice(i, 1)
              api.setWorkNeeded(pendingBlock.getHash(true))
              return true
            } catch (e) {
              logger.error('Error adding block ' + pendingBlock.getHash(true) + ' to chain: ' + e.message)
              errorBlocks.push(pendingBlock)
            }
            break
          }
        }
        break
      }
    }

    if (!found) {
      logger.warn('Work received for missing target: ' + hash)
      // add to work pool just in case, it may be a cached from the last block
      api.workPoolAdd(hash, '', false, work)
      return false
    }
    return true
  }

  /**
   * @returns boolean true if you have work pending false if you are all up to date on work.
   */
  api.waitingRemoteWork = () => {
    for (let i in remoteWork) {
      if (!remoteWork[i].worked) return true
    }
    return false
  }

  /**
   * @returns array of blocks that are ready to be published.
   */
  api.getReadyBlocks = () => {
    return readyBlocks
  }

  /**
   * @returns next block that is ready to be published.
   */
  api.getNextReadyBlock = () => {
    if (readyBlocks.length > 0) {
      return readyBlocks[0]
    } else {
      return false
    }
  }

  /**
   * Get a ready block by hash
   * @param {string} blockHash - The hash of the block you are looking for
   * @returns block of the specified blockhash that is ready to be broadcasted
   */
  api.getReadyBlockByHash = (blockHash) => {
    for (let i in readyBlocks) {
      if (readyBlocks[i].getHash(true) === blockHash) {
        return readyBlocks[i]
      }
    }
    return false
  }

  /**
   * remove a ready block by hash
   * @param {string} blockHash - The hash of the block you are looking for
   * @returns block of the deleted block or false if block was unabled to be found
   */
  api.removeReadyBlock = (blockHash) => {
    for (let i in readyBlocks) {
      if (readyBlocks[i].getHash(true) === blockHash) {
        let blk = readyBlocks[i]
        readyBlocks.splice(i, 1)
        return blk
      }
    }
    return false
  }

  /**
   * Adds block to account chain
   *
   * @param {string} - blockHash The block hash
   * @throws An exception if the block is not found in the ready blocks array
   * @throws An exception if the previous block does not match the last chain block
   * @throws An exception if the block has not yet been signed
   * @throws An exception if the block amount is greater than your balance minus the transaction fee
   */
  api.confirmBlock = (blockHash, broadcast = true) => {
    const blk = api.getPendingBlockByHash(blockHash)
    if (blk) {
      if (blk.ready()) {
        api.useAccount(blk.getAccount())
        if (blk.getPrevious() === current.chain[current.chain.length - 1].getHash(true)) {
          if (current.getBalance().minus(blk.getTransactionFee()).lesser(blk.getAmount)) {
            throw new Error('Insufficient funds to confirm this block')
          } else {
            current.chain.push(blk)
            if (broadcast) readyBlocks.push(blk)
            api.removePendingBlock(blockHash)
            api.recalculateWalletBalances()
          }
        } else {
          console.log(blk.getPrevious() + ' ' + current.chain[current.chain.length - 1].getHash(true))
          logger.warn('Previous block does not match actual previous block')
          throw new Error('Previous block does not match actual previous block')
        }
        logger.log('Block added to chain: ' + blk.getHash(true))
      } else {
        logger.error('Trying to confirm block without signature or work.')
        throw new Error('Block lacks signature or work.')
      }
    } else {
      logger.warn('Block trying to be confirmed has not been found.')
      throw new Error('Block not found')
    }
  }

  api.getLoginKey = () => {
    return loginKey
  }

  api.setLoginKey = (lk = false) => {
    if (loginKey === false) {
      if (lk) {
        loginKey = lk
      } else {
        loginKey = uint8ToHex(nacl.randomBytes(32))
      }
    }
  }

  /**
   * Encrypts an packs the wallet data in a hex string
   *
   * @returns {string}
   */
  api.pack = function () {
    let pack = {}

    pack.seed = uint8ToHex(seed)
    pack.last = lastKeyFromSeed
    pack.version = version
    pack.loginKey = loginKey

    pack.accounts = []
    for (let i in keys) {
      const key = keys[i]
      switch (key.type) {
        case KEY_TYPE.SEEDED:
          pack.accounts.push({
            type: KEY_TYPE.SEEDED,
            label: key.label,
            seedIndex: key.seedIndex
          })
          break
        case KEY_TYPE.EXPLICIT:
          pack.accounts.push({
            type: KEY_TYPE.EXPLICIT,
            label: key.label,
            secretKey: uint8ToHex(key.priv)
          })
          break
        default: throw new Error('Unsupported key type')
      }
    }

    pack = JSON.stringify(pack)
    pack = stringToHex(pack)
    pack = Buffer.from(pack, 'hex')

    const context = blake.blake2bInit(32)
    blake.blake2bUpdate(context, pack)
    const checksum = blake.blake2bFinal(context)

    const salt = Buffer.form(nacl.randomBytes(16))
    const key = pbkdf2.pbkdf2Sync(passPhrase, salt, iterations, 32, 'sha1')

    const options = { mode: AES.CBC, padding: Iso10126 }
    const encryptedBytes = AES.encrypt(pack, key, salt, options)

    const payload = Buffer.concat([Buffer.from(checksum), salt, encryptedBytes])

    // decrypt to check if wallet was corrupted during ecryption somehow
    if (api.decryptAndCheck(payload).toString('hex') === false) {
      return api.pack() // try again, shouldnt happen often
    }
    return payload.toString('hex')
  }

  /**
   * Constructs the wallet from an encrypted base64 encoded wallet
   *
   */
  api.load = (data) => {
    const decryptedBytes = api.decryptAndCheck(data)
    if (decryptedBytes === false) throw new Error('Wallet is corrupted or has been tampered.')

    const walletData = JSON.parse(decryptedBytes.toString('utf8'))

    seed = hexToUint8(walletData.seed)
    loginKey = walletData.loginKey !== undefined ? walletData.loginKey : false

    for (let i in (walletData.accounts || [])) {
      const acc = walletData.accounts[i]
      switch (acc.type) {
        case KEY_TYPE.SEEDED: {
          let key = _private.newKeyDataFromSeed(acc.seedIndex)
          key.label = acc.label
          _private.addKey(key)
          lastKeyFromSeed = Math.max(lastKeyFromSeed, acc.seedIndex)
          break
        }
        case KEY_TYPE.EXPLICIT: {
          let key = _private.newKeyDataFromSecret(hexToUint8(acc.secretKey))
          key.label = acc.label
          _private.addKey(key)
          break
        }
        default: throw new Error('Unsupported key type')
      }
    }

    lastKeyFromSeed = Math.max(walletData.last || 0, lastKeyFromSeed)

    api.useAccount(keys[0].account)

    ciphered = false
    return walletData
  }

  api.decryptAndCheck = (data) => {
    const bytes = Buffer.from(data, 'hex')
    const checksum = bytes.slice(0, 32)
    const salt = bytes.slice(32, 48)
    const payload = bytes.slice(48)
    const key = pbkdf2.pbkdf2Sync(passPhrase, salt, iterations, 32, 'sha1')

    const options = {}
    options.padding = options.padding || Iso10126
    const decryptedBytes = AES.decrypt(payload, key, salt, options)

    const context = blake.blake2bInit(32)
    blake.blake2bUpdate(context, decryptedBytes)
    const hash = uint8ToHex(blake.blake2bFinal(context))

    if (hash !== checksum.toString('hex').toUpperCase()) return false
    return decryptedBytes
  }

  api.createWallet = (setSeed = false) => {
    if (!setSeed) {
      seed = nacl.randomBytes(32)
    } else {
      api.setSeed(setSeed)
    }
    api.newKeyFromSeed()
    api.useAccount(keys[0].account)
    loginKey = uint8ToHex(nacl.randomBytes(32))
    return uint8ToHex(seed)
  }

  return api
}
