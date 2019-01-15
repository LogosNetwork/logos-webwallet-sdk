import { hexToUint8, decToHex, uint8ToHex, accountFromHexKey, keyFromAccount, hexToDec } from './functions'

const MAIN_NET_WORK_THRESHOLD = 'ffffffc000000000'
const TEST_NET_WORK_THRESHOLD = 'ff00000000000000'
const STATE_BLOCK_PREAMBLE = '0000000000000000000000000000000000000000000000000000000000000006'
const blake = require('blakejs')
const bigInt = require('big-integer')

module.exports = () => {
  const api = {} // public methods
  const _private = {} // private methods
  let hash // block hash
  let signed = false // if block has signature
  let worked = false // if block has work
  let signature = '' // signature
  let work = '' // work
  let testNet = true
  let amount = bigInt(0) // amount transferred
  let blockAccount // account owner of this block
  let immutable = false // if true means block has already been confirmed and cannot be changed, some checks are ignored

  let previous // previous block hash
  let destination // send
  let transactionFee = bigInt(0) // send
  let source // receive and open
  let representative // open and change
  let previousBlock // the whole previous block, data type = Block
  let link // state blocks

  let version = 1 // to make updates compatible with previous versions of the wallet

  /**
   * Builds the block and calculates the hash
   *
   * @throws An exception on invalid type
   * @returns {Array} The block hash
   */
  api.build = () => {
    if (!previous) {
      if (!previousBlock) {
        throw new Error('Previous block is missing.')
      }
      previous = previousBlock.getHash(true)
    }

    if (!amount) throw new Error('Amount is not set.')
    if (!link) throw new Error('State block link is missing.')
    if (!transactionFee) throw new Error('Transaction fee is missing.')

    // all good here, compute the block hash
    const context = blake.blake2bInit(32, null)
    blake.blake2bUpdate(context, hexToUint8(STATE_BLOCK_PREAMBLE))
    blake.blake2bUpdate(context, hexToUint8(keyFromAccount(blockAccount)))
    blake.blake2bUpdate(context, hexToUint8(previous))
    blake.blake2bUpdate(context, hexToUint8(representative))
    blake.blake2bUpdate(context, hexToUint8(amount))
    blake.blake2bUpdate(context, hexToUint8(transactionFee))
    blake.blake2bUpdate(context, hexToUint8(link))
    hash = uint8ToHex(blake.blake2bFinal(context))

    return hash
  }

  /**
   * Sets the send parameters and builds the block
   *
   * @param {string} previousBlockHash - The previous block 32 byte hash hex encoded
   * @param {string} destinationAccount - The Logos account receiving the money
   * @param {string} sendAmount - Amount of Logos you wish to send in this block (Raw)
   * @param {Block} previousBlk - The whole previous block
   * @throws An exception on invalid block hash
   * @throws An exception on invalid destination account
   * @throws An exception on invalid amount
   */
  api.setSendParameters = (previousBlockHash, destinationAccount, sendAmount, previousBlk = false, transactionFee = '10000000000000000000000') => {
    if (previousBlk) {
      previousBlock = previousBlk
      previousBlockHash = previousBlk.getHash(true)
    }

    if (!/[0-9A-F]{64}/i.test(previousBlockHash)) throw new Error('Invalid previous block hash.')

    let pk
    try {
      pk = keyFromAccount(destinationAccount)
    } catch (err) {
      throw new Error('Invalid destination account.')
    }

    _private.reset()
    previous = previousBlockHash
    destination = pk
    transactionFee = decToHex(transactionFee, 16)
    amount = decToHex(sendAmount, 16)

    link = destination
  }

  /**
   * Sets the block signature
   *
   * @param {string} hex - The hex encoded 64 byte block hash signature
   */
  api.setSignature = (hex) => {
    signature = hex
    signed = true
  }

  /**
   * Sets the block work
   *
   * @param {string} hex - The hex encoded 8 byte block hash PoW
   * @throws An exception if work is not enough
   */
  api.setWork = function (hex, force = false) {
    if (!force && !api.checkWork(hex)) throw new Error('Work not valid for block')
    work = hex
    worked = true
  }

  /**
   * Sets block amount, to be retrieved from it directly instead of calculating it quering the chain
   *
   * @param {number | string} am - The amount
   */
  api.setAmount = (am) => {
    amount = bigInt(am)
  }

  /**
   *
   * @returns {bigInteger} blockAmount - The amount transferred in raw
   */
  api.getAmount = () => {
    return amount
  }

  /**
   * Sets transaction fee
   *
   * @param {number} am - The amount
   */
  api.setTransactionFee = function (am) {
    transactionFee = bigInt(am)
  }

  /**
   *
   * @returns {bigInteger} transaction fee - The amount in raw
   */
  api.getTransactionFee = () => {
    return transactionFee
  }

  /**
   * Sets whether you are on TestNet or MainNet
   *
   * @param {boolean} testNet - True if you are on TestNet or False if you are on MainNet
   */
  api.setTestNet = (tn) => {
    testNet = tn
  }

  /**
   *
   * @returns TestNet - True or False value of if you are on the TestNet or not.
   */
  api.getTestNet = () => {
    return testNet
  }

  /**
   * Sets the account owner of the block
   *
   * @param {string} acc - The Logos account
   */
  api.setAccount = (acc) => {
    blockAccount = acc
  }

  /**
   *
   * @returns blockAccount
   */
  api.getAccount = () => {
    return blockAccount
  }

  /**
   * Sets the account/block representative. With state blocks, each block contains it so it can be set anytime with this
   * @param {string} rep - The representative account or its hex encoded public key
   * @throws An exception if rep is invalid and a rep cannot be pulled from the previous block
   */
  api.setRepresentative = (rep) => {
    if (/[0-9A-F]{64}/i.test(rep)) {
      representative = rep
    } else {
      rep = keyFromAccount(rep)
      if (rep) {
        representative = rep
      } else {
        // try to pull it from the previous block
        rep = false
        if (previousBlock) {
          rep = keyFromAccount(previousBlock.getRepresentative())
        }
        if (!rep) throw new Error('Representative passed is invalid. Also, unable to get the one used on the previous block.')
        representative = rep
      }
    }
  }

  /**
   *
   * @param {boolean} hex - To get the hash hex encoded
   * @returns {string} The block hash
   */
  api.getHash = (hex = false) => {
    return hex ? hash : hexToUint8(hash)
  }

  api.getSignature = () => {
    return signature
  }

  /**
   * Returns the previous block hash if its not an open block, the public key if it is
   *
   * @returns {string} The previous block hash
   */
  api.getPrevious = () => {
    return previous
  }

  api.getSource = () => {
    return source
  }

  api.getRepresentative = () => {
    return accountFromHexKey(representative)
  }

  api.getLink = () => {
    return link
  }

  api.getLinkAsAccount = () => {
    return accountFromHexKey(link)
  }

  api.ready = () => {
    return signed && worked
  }

  api.setImmutable = (bool) => {
    immutable = bool
  }

  api.isImmutable = function () {
    return immutable
  }

  /**
   *
   * @returns {string} The block JSON encoded to be broadcasted with RPC
   */
  api.getJSONBlock = (pretty = false) => {
    if (!signed) throw new Error('Block lacks signature')
    const obj = {}

    obj.type = 'state'
    obj.previous = previous
    obj.link = link
    obj.representative = accountFromHexKey(representative) // state blocks are processed with the rep encoded as an account
    obj.transactionFee = hexToDec(transactionFee)
    obj.account = blockAccount
    obj.amount = hexToDec(amount) // needs to be processed in dec in state blocks

    obj.work = work
    obj.signature = signature

    if (pretty) return JSON.stringify(obj, null, 2)
    return JSON.stringify(obj)
  }

  api.getEntireJSON = () => {
    const obj = JSON.parse(api.getJSONBlock())
    const extras = {}

    extras.blockAccount = blockAccount
    if (amount) {
      extras.amount = amount.toString()
    } else {
      extras.amount = 0
    }
    obj.extras = extras
    obj.version = version
    return JSON.stringify(obj)
  }

  api.buildFromJSON = (json, v = false) => {
    let obj
    if (typeof json !== 'object') {
      obj = JSON.parse(json)
    } else {
      obj = json
    }
    blockAccount = obj.account
    previous = obj.previous
    api.setRepresentative(obj.representative)
    amount = decToHex(obj.amount, 16)
    link = obj.link
    signature = obj.signature
    work = obj.work

    if (work) worked = true
    if (signature) signed = true

    if (obj.extras !== undefined) {
      api.setAccount(obj.extras.blockAccount)
      api.setAmount(obj.extras.amount ? obj.extras.amount : 0)
      api.setTransactionFee(obj.extras.transactionFee ? obj.extras.transactionFee : 0)
    }

    api.build()
  }

  api.checkWork = (work, blockHash = false) => {
    if (blockHash === false) {
      blockHash = api.getPrevious()
    }
    let t = hexToUint8(MAIN_NET_WORK_THRESHOLD)
    if (testNet) {
      t = hexToUint8(TEST_NET_WORK_THRESHOLD)
    }
    var context = blake.blake2bInit(8, null)
    blake.blake2bUpdate(context, hexToUint8(work).reverse())
    blake.blake2bUpdate(context, hexToUint8(blockHash))
    var threshold = blake.blake2bFinal(context).reverse()
    if (testNet && threshold[0] === t[0]) return true
    if (!testNet && threshold[0] === t[0] && threshold[1] === t[1] && threshold[2] === t[2] && threshold[3] >= t[3]) return true
    return false
  }

  api.getVersion = () => {
    return version
  }

  api.setVersion = (v) => {
    version = v
  }

  _private.reset = () => {
    signed = false
    worked = false
    signature = null
    work = null
    destination = false
  }

  return api
}
