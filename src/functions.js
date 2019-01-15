// general functions

const blake = require('blakejs')
const nanoBase32 = require('nano-base32')

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
  let checksum = nanoBase32.encode(checksumBytes)
  let account = nanoBase32.encode(keyBytes)
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

export const keyFromAccount = (account) => {
  if ((account.startsWith('lgs_1') || account.startsWith('lgs_3')) && account.length === 64) {
    const accountCrop = account.replace('lgs_', '')
    const isValid = /^[13456789abcdefghijkmnopqrstuwxyz]+$/.test(accountCrop)
    if (isValid) {
      const keyBytes = nanoBase32.decode(accountCrop.substring(0, 52))
      const hashBytes = nanoBase32.decode(accountCrop.substring(52, 60))
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
