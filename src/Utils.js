const MAIN_NET_WORK_THRESHOLD = 'ffffffc000000000'
const TEST_NET_WORK_THRESHOLD = 'ff00000000000000'
const BLOCK_BIT_LEN = 128
const minimumFee = '10000000000000000000000'
const EMPTY_WORK = '0000000000000000'
const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000'
const officialRepresentative = 'lgs_3e3j5tkog48pnny9dmfzj1r16pg8t1e76dz5tmac6iq689wyjfpiij4txtdo'
const blake = require('blakejs')
const crypto = require('crypto')
const alphabet = '13456789abcdefghijkmnopqrstuwxyz'
const assert = require('assert')
const MAXUINT128 = '340282366920938463463374607431768211455'
const defaultRPC = {
  proxy: 'https://pla.bs',
  delegates: ['3.215.28.211', '3.214.93.111', '3.214.55.84', '3.214.51.200', '3.214.37.34', '3.214.209.198', '3.214.205.240', '3.214.204.82', '3.214.195.211', '3.214.188.128', '3.214.175.150', '3.213.75.16', '3.213.212.158', '3.213.17.31', '3.213.150.192', '3.213.110.174', '3.213.108.208', '3.212.255.243', '3.212.220.108', '3.209.93.207', '3.209.30.240', '3.208.253.215', '3.208.232.242', '18.233.235.87', '18.233.175.15', '18.211.221.254', '18.211.1.90', '18.208.239.123', '18.206.29.223', '18.204.189.145', '174.129.135.230', '100.25.175.142']
}
const defaultMQTT = 'wss://pla.bs:8443'
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

const defaultPrivileges = {
  change_issuance: false,
  change_modify_issuance: false,
  change_revoke: false,
  change_modify_revoke: false,
  change_freeze: false,
  change_modify_freeze: false,
  change_adjust_fee: false,
  change_modify_adjust_fee: false,
  change_whitelist: false,
  change_modify_whitelist: false,
  issuance: false,
  revoke: false,
  freeze: false,
  adjust_fee: false,
  whitelist: false,
  update_issuer_info: false,
  update_controller: false,
  burn: false,
  distribute: false,
  withdraw_fee: false,
  withdraw_logos: false
}

const defaulSettings = {
  issuance: false,
  modify_issuance: false,
  revoke: false,
  modify_revoke: false,
  freeze: false,
  modify_freeze: false,
  adjust_fee: false,
  modify_adjust_fee: false,
  whitelist: false,
  modify_whitelist: false
}

function deserializeController (controller) {
  let newController = {}
  newController.account = controller.account
  newController.privileges = {}
  if (controller.privileges instanceof Array) {
    if (controller.privileges.length > 0) {
      newController.privileges.change_issuance = controller.privileges.indexOf('change_issuance') > -1
      newController.privileges.change_modify_issuance = controller.privileges.indexOf('change_modify_issuance') > -1
      newController.privileges.change_revoke = controller.privileges.indexOf('change_revoke') > -1
      newController.privileges.change_modify_revoke = controller.privileges.indexOf('change_modify_revoke') > -1
      newController.privileges.change_freeze = controller.privileges.indexOf('change_freeze') > -1
      newController.privileges.change_modify_freeze = controller.privileges.indexOf('change_modify_freeze') > -1
      newController.privileges.change_adjust_fee = controller.privileges.indexOf('change_adjust_fee') > -1
      newController.privileges.change_modify_adjust_fee = controller.privileges.indexOf('change_modify_adjust_fee') > -1
      newController.privileges.change_whitelist = controller.privileges.indexOf('change_whitelist') > -1
      newController.privileges.change_modify_whitelist = controller.privileges.indexOf('change_modify_whitelist') > -1
      newController.privileges.issuance = controller.privileges.indexOf('issuance') > -1
      newController.privileges.revoke = controller.privileges.indexOf('revoke') > -1
      newController.privileges.freeze = controller.privileges.indexOf('freeze') > -1
      newController.privileges.adjust_fee = controller.privileges.indexOf('adjust_fee') > -1
      newController.privileges.whitelist = controller.privileges.indexOf('whitelist') > -1
      newController.privileges.update_issuer_info = controller.privileges.indexOf('update_issuer_info') > -1
      newController.privileges.update_controller = controller.privileges.indexOf('update_controller') > -1
      newController.privileges.burn = controller.privileges.indexOf('burn') > -1
      newController.privileges.distribute = controller.privileges.indexOf('distribute') > -1
      newController.privileges.withdraw_fee = controller.privileges.indexOf('withdraw_fee') > -1
      newController.privileges.withdraw_logos = controller.privileges.indexOf('withdraw_logos') > -1
    } else {
      newController.privileges = defaultPrivileges
    }
  } else if (typeof controller.privileges === 'object' && controller.privileges !== null) {
    newController.privileges = controller.privileges
  } else {
    newController.privileges = defaultPrivileges
  }
  return newController
}

function deserializeControllers (controllers) {
  let newControllers = []
  for (let controller of controllers) {
    newControllers.push(this.deserializeController(controller))
  }
  return newControllers
}

// Convert's the webwallet SDK controller into a Logos Node compatiable controller
function serializeController (controllerObject) {
  let newController = {}
  newController.account = controllerObject.account
  newController.privileges = this.convertObjectToArray(controllerObject.privileges)
  return newController
}

function serializeControllers (controllersObject) {
  let controllers = []
  for (let controller of controllersObject) {
    controllers.push(this.serializeController(controller))
  }
  return controllers
}

function deserializeSettings (settings) {
  if (settings instanceof Array) {
    if (settings.length > 0) {
      return {
        issuance: settings.indexOf('issuance') > -1,
        modify_issuance: settings.indexOf('modify_issuance') > -1,
        revoke: settings.indexOf('revoke') > -1,
        modify_revoke: settings.indexOf('modify_revoke') > -1,
        freeze: settings.indexOf('freeze') > -1,
        modify_freeze: settings.indexOf('modify_freeze') > -1,
        adjust_fee: settings.indexOf('adjust_fee') > -1,
        modify_adjust_fee: settings.indexOf('modify_adjust_fee') > -1,
        whitelist: settings.indexOf('whitelist') > -1,
        modify_whitelist: settings.indexOf('modify_whitelist') > -1
      }
    }
  } else if (typeof settings === 'object' && settings !== null) {
    return settings
  }
  return defaulSettings
}

function convertObjectToArray (myObjects) {
  let myArray = []
  for (let key in myObjects) {
    if (myObjects[key] === true) {
      myArray.push(key)
    }
  }
  return myArray
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

/**
 * Encode provided Uint8Array using the Base-32 implementeation.
 * @param {Uint8Array} view Input buffer formatted as a Uint8Array
 * @returns {string}
 */
function encode (view) {
  if (view.constructor !== Uint8Array) {
    throw new Error('View must be a Uint8Array!')
  }
  const length = view.length
  const leftover = (length * 8) % 5
  const offset = leftover === 0 ? 0 : 5 - leftover

  let value = 0
  let output = ''
  let bits = 0

  for (var i = 0; i < length; i++) {
    value = (value << 8) | view[i]
    bits += 8

    while (bits >= 5) {
      output += alphabet[(value >>> (bits + offset - 5)) & 31]
      bits -= 5
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - (bits + offset))) & 31]
  }

  return output
}

function readChar (char) {
  var idx = alphabet.indexOf(char)

  if (idx === -1) {
    throw new Error('Invalid character found: ' + char)
  }

  return idx
}

/**
 * Decodes an Implementation Base32 encoded string into a Uint8Array
 * @param {string} input A Base32 encoded string
 * @returns {Uint8Array}
 */
function decode (input) {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string!')
  }
  var length = input.length
  const leftover = (length * 5) % 8
  const offset = leftover === 0 ? 0 : 8 - leftover

  var bits = 0
  var value = 0

  var index = 0
  var output = new Uint8Array(Math.ceil(length * 5 / 8))

  for (var i = 0; i < length; i++) {
    value = (value << 5) | readChar(input[i])
    bits += 5

    if (bits >= 8) {
      output[index++] = (value >>> (bits + offset - 8)) & 255
      bits -= 8
    }
  }
  if (bits > 0) {
    output[index++] = (value << (bits + offset - 8)) & 255
  }

  if (leftover !== 0) {
    output = output.slice(1)
  }
  return output
}

const stringFromHex = (hex) => {
  let stringHex = hex.toString() // force conversion
  let str = ''
  for (let i = 0; i < stringHex.length; i += 2) {
    str += String.fromCharCode(parseInt(stringHex.substr(i, 2), 16))
  }
  return str
}

const stringToHex = (str) => {
  let hex = ''
  for (let i = 0; i < str.length; i++) {
    hex += '' + str.charCodeAt(i).toString(16)
  }
  return hex
}

const accountFromHexKey = function (hex) {
  let keyBytes = hexToUint8(hex)
  let checksumBytes = blake.blake2b(keyBytes, null, 5).reverse()
  let checksum = encode(checksumBytes)
  let account = encode(keyBytes)
  return 'lgs_' + account + checksum
}

const parseAccount = (str) => {
  let i = str.indexOf('lgs_')
  let acc = false
  if (i !== -1) acc = str.slice(i, i + 64)
  if (i === -1) acc = accountFromHexKey(str)
  try {
    keyFromAccount(acc)
    return acc
  } catch (e) {
    return false
  }
}

const changeEndianness = (string) => {
  const result = []
  let len = string.length - 2
  while (len >= 0) {
    result.push(string.substr(len, 2))
    len -= 2
  }
  return result.join('')
}

const decToHex = (str, bytes = null) => {
  let dec = str.toString().split('')
  let sum = []
  let hex = []
  let i
  let s
  while (dec.length) {
    s = 1 * dec.shift()
    for (i = 0; s || i < sum.length; i++) {
      s += (sum[i] || 0) * 10
      sum[i] = s % 16
      s = (s - sum[i]) / 16
    }
  }
  while (sum.length) {
    hex.push(sum.pop().toString(16))
  }
  hex = hex.join('')
  if (hex.length % 2 !== 0) hex = '0' + hex
  if (bytes > hex.length / 2) {
    let diff = bytes - hex.length / 2
    for (let i = 0; i < diff; i++) hex = '00' + hex
  }
  return hex
}

const hexToDec = (s) => {
  function add (x, y) {
    let c = 0
    let r = []
    x = x.split('').map(Number)
    y = y.split('').map(Number)
    while (x.length || y.length) {
      var s = (x.pop() || 0) + (y.pop() || 0) + c
      r.unshift(s < 10 ? s : s - 10)
      c = s < 10 ? 0 : 1
    }
    if (c) r.unshift(c)
    return r.join('')
  }

  let dec = '0'
  s.split('').forEach((chr) => {
    const n = parseInt(chr, 16)
    for (let t = 8; t; t >>= 1) {
      dec = add(dec, dec)
      if (n & t) dec = add(dec, '1')
    }
  })
  return dec
}

const hexToUint8 = (hex) => {
  const length = (hex.length / 2) | 0
  const uint8 = new Uint8Array(length)
  for (let i = 0; i < length; i++) uint8[i] = parseInt(hex.substr(i * 2, 2), 16)
  return uint8
}

const uint8ToHex = (uint8) => {
  let hex = ''
  let aux
  for (let i = 0; i < uint8.length; i++) {
    aux = uint8[i].toString(16).toUpperCase()
    if (aux.length === 1) aux = '0' + aux
    hex += aux
    aux = ''
  }
  return hex
}

const uint4ToHex = (uint4) => {
  let hex = ''
  for (let i = 0; i < uint4.length; i++) hex += uint4[i].toString(16).toUpperCase()
  return (hex)
}

function equalArrays (array1, array2) {
  for (let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) return false
  }
  return true
}

function getRandomValues (buf) {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    return window.crypto.getRandomValues(buf)
  }
  if (typeof window !== 'undefined' && typeof window.msCrypto === 'object' && typeof window.msCrypto.getRandomValues === 'function') {
    return window.msCrypto.getRandomValues(buf)
  }
  if (crypto.randomBytes) {
    if (!(buf instanceof Uint8Array)) {
      throw new TypeError('expected Uint8Array')
    }
    if (buf.length > 65536) {
      var e = new Error()
      e.code = 22
      e.message = 'Failed to execute \'getRandomValues\' on \'Crypto\': The ' +
        'ArrayBufferView\'s byte length (' + buf.length + ') exceeds the ' +
        'number of bytes of entropy available via this API (65536).'
      e.name = 'QuotaExceededError'
      throw e
    }
    var bytes = crypto.randomBytes(buf.length)
    buf.set(bytes)
    return buf
  } else {
    throw new Error('No secure random number generator available.')
  }
}

function randomUint () {
  let array = new Uint8Array(8)
  getRandomValues(array)
  return array
}

function generator256 (hash, testNet) {
  let random = randomUint()
  for (let r = 0; r < 256; r++) {
    random[7] = (random[7] + r) % 256 // pseudo random part
    let check = checkWork(uint8ToHex(random), hash, testNet)
    if (check === true) return uint8ToHex(random)
  }
  return false
}

const checkWork = (work, previousHash, testNet) => {
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

const generateWork = (hash, testNet = true) => {
  return new Promise((resolve, reject) => {
    for (let i = 0; i < 4096; i++) {
      let validWork = generator256(hash, testNet)
      if (validWork) {
        resolve(validWork)
        break
      }
    }
  })
}

const keyFromAccount = (account) => {
  if ((account.startsWith('lgs_1') || account.startsWith('lgs_3')) && account.length === 64) {
    const accountCrop = account.replace('lgs_', '')
    const isValid = /^[13456789abcdefghijkmnopqrstuwxyz]+$/.test(accountCrop)
    if (isValid) {
      const keyBytes = decode(accountCrop.substring(0, 52))
      const hashBytes = decode(accountCrop.substring(52, 60))
      const blakeHash = blake.blake2b(keyBytes, null, 5).reverse()
      if (equalArrays(hashBytes, blakeHash)) {
        return uint8ToHex(keyBytes).toUpperCase()
      } else {
        throw new Error('Checksum incorrect.')
      }
    } else {
      throw new Error('Invalid Logos account.')
    }
  }
  throw new Error('Invalid Logos account.')
}

const byteCount = (s) => {
  return encodeURI(s).split(/%(?:u[0-9A-F]{2})?[0-9A-F]{2}|./).length - 1
}

const isAlphanumeric = (s) => {
  return /^[a-z0-9]+$/i.test(s)
}

const isAlphanumericExtended = (s) => {
  return /^[a-z0-9-_ ]+$/i.test(s)
}

module.exports = {
  Iso10126,
  AES,
  stringFromHex,
  stringToHex,
  accountFromHexKey,
  parseAccount,
  decToHex,
  hexToDec,
  hexToUint8,
  uint8ToHex,
  uint4ToHex,
  checkWork,
  generateWork,
  keyFromAccount,
  changeEndianness,
  byteCount,
  isAlphanumeric,
  isAlphanumericExtended,
  minimumFee,
  EMPTY_WORK,
  GENESIS_HASH,
  officialRepresentative,
  defaultRPC,
  defaultMQTT,
  MAXUINT128,
  deserializeController,
  deserializeControllers,
  deserializeSettings,
  serializeController,
  serializeControllers,
  convertObjectToArray
}
