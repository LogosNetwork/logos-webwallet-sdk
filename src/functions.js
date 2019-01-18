// general functions
const MAIN_NET_WORK_THRESHOLD = 'ffffffc000000000'
const TEST_NET_WORK_THRESHOLD = 'ff00000000000000'
const blake = require('blakejs')
const crypto = require('crypto')
const alphabet = '13456789abcdefghijkmnopqrstuwxyz'

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

export const stringFromHex = (hex) => {
  let stringHex = hex.toString() // force conversion
  let str = ''
  for (let i = 0; i < stringHex.length; i += 2) {
    str += String.fromCharCode(parseInt(stringHex.substr(i, 2), 16))
  }
  return str
}

export const stringToHex = (str) => {
  let hex = ''
  for (let i = 0; i < str.length; i++) {
    hex += '' + str.charCodeAt(i).toString(16)
  }
  return hex
}

export const accountFromHexKey = function (hex) {
  let keyBytes = hexToUint8(hex)
  let checksumBytes = blake.blake2b(keyBytes, null, 5).reverse()
  let checksum = encode(checksumBytes)
  let account = encode(keyBytes)
  return 'lgs_' + account + checksum
}

export const parseAccount = (str) => {
  let i = str.indexOf('lgs_')
  let acc = false
  if (i !== -1) acc = str.slice(i, i + 64)
  try {
    keyFromAccount(acc)
    return acc
  } catch (e) {
    return false
  }
}

export const decToHex = (str, bytes = null) => {
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

export const hexToDec = (s) => {
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

export const hexToUint8 = (hex) => {
  const length = (hex.length / 2) | 0
  const uint8 = new Uint8Array(length)
  for (let i = 0; i < length; i++) uint8[i] = parseInt(hex.substr(i * 2, 2), 16)
  return uint8
}

export const uint8ToHex = (uint8) => {
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

export const uint4ToHex = (uint4) => {
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
  if (window.crypto && window.crypto.getRandomValues) {
    return window.crypto.getRandomValues(buf)
  }
  if (typeof window.msCrypto === 'object' && typeof window.msCrypto.getRandomValues === 'function') {
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
    let context = blake.blake2bInit(8, null)
    blake.blake2bUpdate(context, random)
    blake.blake2bUpdate(context, hash)
    let work = blake.blake2bFinal(context).reverse()
    let check = checkWork(uint8ToHex(work), hash, testNet)
    if (check === true) return random.reverse()
  }
  return false
}

export const checkWork = (work, previousHash, testNet) => {
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

export const generateWork = (hash, testNet) => {
  return new Promise((resolve, reject) => {
    for (let i = 0; i < 4096; i++) {
      let validWork = generator256(hash, testNet)
      if (validWork) resolve(validWork)
    }
  })
}

export const keyFromAccount = (account) => {
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
