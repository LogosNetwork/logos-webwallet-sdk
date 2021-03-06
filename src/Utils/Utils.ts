import Blake2b from '../Utils/blake2b'
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto'
import { Controller as RpcController, Settings as RpcSettings, Privileges as RpcPrivileges } from '@logosnetwork/logos-rpc-client/api'
import { Controller, Settings, Privileges } from '../TokenAccount'

export const minimumFee = '10000000000000000000000'
export const EMPTY_WORK = '0000000000000000'
export const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000'
export const MAXUINT128 = '340282366920938463463374607431768211455'
export const defaultRPC = {
  proxy: 'https://pla.bs',
  nodeURL: '3.215.28.211',
  nodePort: '55000',
  wsPort: '18000'
}
export const defaultMQTT = 'wss://pla.bs:8443'
export const Iso10126 = {
  pad: (dataBytes: Buffer, nBytesPerBlock: number): Buffer => {
    const nPaddingBytes = nBytesPerBlock - dataBytes.length % nBytesPerBlock
    const paddingBytes = randomBytes(nPaddingBytes - 1)
    const endByte = Buffer.from([nPaddingBytes])
    return Buffer.concat([dataBytes, paddingBytes, endByte])
  },
  unpad: (dataBytes: Buffer): Buffer => {
    const nPaddingBytes = dataBytes[dataBytes.length - 1]
    return dataBytes.slice(0, -nPaddingBytes)
  }
}

export const convertObjectToArray = (myObject: Privileges | Settings): string[] => {
  const myArray = []
  for (const key in myObject) {
    if (myObject[key] === true) {
      myArray.push(key)
    }
  }
  return myArray
}

export const deserializeController = (controller: RpcController | Controller): Controller => {
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
  const newController: Controller = {}
  newController.account = controller.account
  let privileges = defaultPrivileges
  if (controller.privileges instanceof Array) {
    if (controller.privileges.length > 0) {
      privileges.change_issuance = controller.privileges.indexOf('change_issuance') > -1
      privileges.change_modify_issuance = controller.privileges.indexOf('change_modify_issuance') > -1
      privileges.change_revoke = controller.privileges.indexOf('change_revoke') > -1
      privileges.change_modify_revoke = controller.privileges.indexOf('change_modify_revoke') > -1
      privileges.change_freeze = controller.privileges.indexOf('change_freeze') > -1
      privileges.change_modify_freeze = controller.privileges.indexOf('change_modify_freeze') > -1
      privileges.change_adjust_fee = controller.privileges.indexOf('change_adjust_fee') > -1
      privileges.change_modify_adjust_fee = controller.privileges.indexOf('change_modify_adjust_fee') > -1
      privileges.change_whitelist = controller.privileges.indexOf('change_whitelist') > -1
      privileges.change_modify_whitelist = controller.privileges.indexOf('change_modify_whitelist') > -1
      privileges.issuance = controller.privileges.indexOf('issuance') > -1
      privileges.revoke = controller.privileges.indexOf('revoke') > -1
      privileges.freeze = controller.privileges.indexOf('freeze') > -1
      privileges.adjust_fee = controller.privileges.indexOf('adjust_fee') > -1
      privileges.whitelist = controller.privileges.indexOf('whitelist') > -1
      privileges.update_issuer_info = controller.privileges.indexOf('update_issuer_info') > -1
      privileges.update_controller = controller.privileges.indexOf('update_controller') > -1
      privileges.burn = controller.privileges.indexOf('burn') > -1
      privileges.distribute = controller.privileges.indexOf('distribute') > -1
      privileges.withdraw_fee = controller.privileges.indexOf('withdraw_fee') > -1
      privileges.withdraw_logos = controller.privileges.indexOf('withdraw_logos') > -1
    }
  } else if (typeof controller.privileges === 'object' && controller.privileges !== null) {
    privileges = controller.privileges
  }
  newController.privileges = privileges
  return newController
}

export const deserializeControllers = (controllers: RpcController[] | Controller[]): Controller[] => {
  const newControllers = []
  for (const controller of controllers) {
    newControllers.push(deserializeController(controller))
  }
  return newControllers
}

export const serializeController = (controllerObject: Controller): RpcController => {
  return {
    account: controllerObject.account,
    privileges: convertObjectToArray(controllerObject.privileges) as RpcPrivileges[]
  }
}

export const serializeControllers = (controllersObject: Controller[]): RpcController[] => {
  const controllers = []
  for (const controller of controllersObject) {
    controllers.push(serializeController(controller))
  }
  return controllers
}

export const deserializeSettings = (settings: RpcSettings[] | Settings): Settings => {
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

interface Options {
  mode?: 'aes-256-cbc' | 'aes-256-ofb' | 'aes-256-ecb';
  padding?: {
    pad: (dataBytes: Buffer, nBytesPerBlock: number) => Buffer;
    unpad: (dataBytes: Buffer) => Buffer;
  };
}
interface AES {
  CBC: 'aes-256-cbc';
  OFB: 'aes-256-ofb';
  ECB: 'aes-256-ecb';
  encrypt: (dataBytes: Buffer, key: Buffer, salt: Buffer, options: Options) => Buffer;
  decrypt: (dataBytes: Buffer, key: Buffer, salt: Buffer, options: Options) => Buffer;
}
export const AES: AES = {
  CBC: 'aes-256-cbc',
  OFB: 'aes-256-ofb',
  ECB: 'aes-256-ecb',

  encrypt: (dataBytes: Buffer, key: Buffer, salt: Buffer, options: Options): Buffer => {
    options = options || {}

    const cipher = createCipheriv(options.mode || AES.CBC, key, salt || '')
    cipher.setAutoPadding(!options.padding)

    const BLOCK_BIT_LEN = 128
    if (options.padding) dataBytes = options.padding.pad(dataBytes, BLOCK_BIT_LEN / 8)
    const encryptedBytes = Buffer.concat([cipher.update(dataBytes), cipher.final()])

    return encryptedBytes
  },

  decrypt: (dataBytes: Buffer, key: Buffer, salt: Buffer = null, options: Options): Buffer => {
    options = options || {}

    const decipher = createDecipheriv(options.mode || AES.CBC, key, salt || '')
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
const encode = (view: Uint8Array): string => {
  const length = view.length
  const leftover = (length * 8) % 5
  const offset = leftover === 0 ? 0 : 5 - leftover
  const alphabet = '13456789abcdefghijkmnopqrstuwxyz'

  let value = 0
  let output = ''
  let bits = 0

  for (let i = 0; i < length; i++) {
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

const readChar = (char: string): number => {
  const alphabet = '13456789abcdefghijkmnopqrstuwxyz'
  const idx = alphabet.indexOf(char)

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
const decode = (input: string): Uint8Array => {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string!')
  }
  const length = input.length
  const leftover = (length * 5) % 8
  const offset = leftover === 0 ? 0 : 8 - leftover

  let bits = 0
  let value = 0

  let index = 0
  let output = new Uint8Array(Math.ceil(length * 5 / 8))

  for (let i = 0; i < length; i++) {
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

export const stringFromHex = (hex: string): string => {
  const stringHex = hex.toString() // force conversion
  let str = ''
  for (let i = 0; i < stringHex.length; i += 2) {
    str += String.fromCharCode(parseInt(stringHex.substr(i, 2), 16))
  }
  return str
}

export const stringToHex = (str: string): string => {
  let hex = ''
  for (let i = 0; i < str.length; i++) {
    hex += '' + str.charCodeAt(i).toString(16)
  }
  return hex
}

export const changeEndianness = (data: string): string => {
  const result = []
  let len = data.length - 2
  while (len >= 0) {
    result.push(data.substr(len, 2))
    len -= 2
  }
  return result.join('')
}

export const decToHex = (str: string | number, bytes: number = null): string => {
  const dec = str.toString().split('')
  const sum = []
  const hex = []
  let i
  let s
  while (dec.length) {
    s = parseInt(dec.shift())
    for (i = 0; s || i < sum.length; i++) {
      s += (sum[i] || 0) * 10
      sum[i] = s % 16
      s = (s - sum[i]) / 16
    }
  }
  while (sum.length) {
    hex.push(sum.pop().toString(16))
  }
  let hexConcat = hex.join('')
  if (hexConcat.length % 2 !== 0) hexConcat = '0' + hexConcat
  if (bytes > hexConcat.length / 2) {
    const diff = bytes - hexConcat.length / 2
    for (let i = 0; i < diff; i++) hexConcat = '00' + hexConcat
  }
  return hexConcat
}

export const hexToDec = (s: string): string => {
  const add = (x: string, y: string): string => {
    let c = 0
    const r = []
    const newX = x.split('').map(Number)
    const newY = y.split('').map(Number)
    while (newX.length || newY.length) {
      const s = (newX.pop() || 0) + (newY.pop() || 0) + c
      r.unshift(s < 10 ? s : s - 10)
      c = s < 10 ? 0 : 1
    }
    if (c) r.unshift(c)
    return r.join('')
  }

  let dec = '0'
  s.split('').forEach((chr): void => {
    const n = parseInt(chr, 16)
    for (let t = 8; t; t >>= 1) {
      dec = add(dec, dec)
      if (n & t) dec = add(dec, '1')
    }
  })
  return dec
}

export const hexToUint8 = (hex: string): Uint8Array => {
  const length = (hex.length / 2) | 0
  const uint8 = new Uint8Array(length)
  for (let i = 0; i < length; i++) uint8[i] = parseInt(hex.substr(i * 2, 2), 16)
  return uint8
}

export const uint8ToHex = (uint8: Uint8Array): string => {
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

const equalArrays = (array1: Uint8Array, array2: Uint8Array): boolean => {
  for (let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) return false
  }
  return true
}

export const byteCount = (s: string): number => {
  return encodeURI(s).split(/%(?:u[0-9A-F]{2})?[0-9A-F]{2}|./).length - 1
}

export const isAlphanumeric = (s: string): boolean => {
  return /^[a-z0-9]+$/i.test(s)
}

export const isAlphanumericExtended = (s: string): boolean => {
  return /^[a-z0-9-_ ]+$/i.test(s)
}

export const isHexKey = (hex: string): boolean => {
  return /^[0-9A-Fa-f]{64}$/.test(hex)
}

export const isLogosAccount = (account: string): boolean => {
  if (/^lgs_[?:13]{1}[13-9-a-km-uw-z]{59}$/.test(account)) {
    const accountCrop = account.replace('lgs_', '')
    const keyBytes = decode(accountCrop.substring(0, 52))
    const hashBytes = decode(accountCrop.substring(52, 60))
    const blakeHash = (new Blake2b(5).update(keyBytes).digest() as Uint8Array).reverse()
    return equalArrays(hashBytes, blakeHash)
  }
  return false
}

export const accountFromHexKey = (hex: string): string => {
  if (isHexKey(hex)) {
    const keyBytes = hexToUint8(hex)
    const checksumBytes = (new Blake2b(5).update(keyBytes).digest() as Uint8Array).reverse()
    const checksum = encode(checksumBytes)
    const account = encode(keyBytes)
    return 'lgs_' + account + checksum
  } else if (isLogosAccount(hex)) {
    return hex
  } else {
    throw new Error(`Failed to execute 'accountFromHexKey' on '${hex}': The hex provided is not a valid hex.`)
  }
}

export const keyFromAccount = (account: string): string => {
  if (/^lgs_[?:13]{1}[13-9-a-km-uw-z]{59}$/.test(account)) {
    const accountCrop = account.replace('lgs_', '')
    const keyBytes = decode(accountCrop.substring(0, 52))
    const hashBytes = decode(accountCrop.substring(52, 60))
    const blakeHash = (new Blake2b(5).update(keyBytes).digest() as Uint8Array).reverse()
    if (equalArrays(hashBytes, blakeHash)) {
      return uint8ToHex(keyBytes).toUpperCase()
    } else {
      throw new Error(`Failed to execute 'keyFromAccount' on '${account}': The checksum of the address is not valid.`)
    }
  } else if (isHexKey(account)) {
    return account
  } else {
    throw new Error(`Failed to execute 'keyFromAccount' on '${account}': The account is not a valid logos address.`)
  }
}

export const testnetDelegates = {
  '172.31.80.176': '54.147.201.7',
  '172.31.80.245': '34.224.133.182',
  '172.31.80.249': '34.195.24.15',
  '172.31.81.11': '54.145.253.93',
  '172.31.81.153': '3.215.6.167',
  '172.31.81.156': '3.214.175.150',
  '172.31.81.162': '52.72.139.247',
  '172.31.81.173': '3.209.30.240',
  '172.31.81.25': '3.215.48.205',
  '172.31.81.54': '3.81.242.200',
  '172.31.81.76': '3.214.188.128',
  '172.31.82.117': '18.208.239.123',
  '172.31.82.20': '52.6.230.153',
  '172.31.82.245': '3.214.209.198',
  '172.31.82.91': '52.86.212.70',
  '172.31.84.148': '18.211.221.254',
  '172.31.84.206': '35.174.67.255',
  '172.31.84.231': '52.55.236.233',
  '172.31.84.250': '3.215.28.211',
  '172.31.85.161': '18.211.1.90',
  '172.31.85.198': '3.213.17.31',
  '172.31.85.94': '3.94.16.110',
  '172.31.86.144': '35.170.167.20',
  '172.31.86.168': '3.82.164.171',
  '172.31.86.18': '34.227.209.242',
  '172.31.86.224': '3.214.37.34',
  '172.31.86.80': '3.208.232.242',
  '172.31.87.122': '54.145.211.218',
  '172.31.87.214': '34.226.253.156',
  '172.31.87.229': '18.206.29.223',
  '172.31.87.9': '52.203.151.67',
  '172.31.89.100': '3.86.169.97',
  '172.31.89.165': '3.93.97.122',
  '172.31.89.169': '100.25.175.142',
  '172.31.89.235': '3.215.33.33',
  '172.31.89.241': '34.239.238.121',
  '172.31.89.248': '174.129.135.230',
  '172.31.89.4': '52.6.18.99',
  '172.31.89.74': '50.17.125.174',
  '172.31.89.83': '34.237.166.184',
  '172.31.89.91': '52.0.107.11',
  '172.31.90.39': '3.213.108.208',
  '172.31.90.42': '3.212.220.108',
  '172.31.90.64': '3.213.150.192',
  '172.31.90.80': '18.233.235.87',
  '172.31.91.0': '18.233.175.15',
  '172.31.91.247': '52.23.71.123',
  '172.31.91.254': '3.209.93.207',
  '172.31.91.32': '3.214.51.200',
  '172.31.92.10': '3.212.255.243',
  '172.31.92.201': '3.214.195.211',
  '172.31.93.13': '3.213.212.158',
  '172.31.93.159': '3.213.75.16',
  '172.31.93.179': '3.214.205.240',
  '172.31.93.224': '34.237.214.48',
  '172.31.94.105': '3.213.110.174',
  '172.31.94.148': '54.147.253.43',
  '172.31.94.238': '3.214.93.111',
  '172.31.94.88': '52.202.140.111',
  '172.31.94.93': '3.214.55.84',
  '172.31.95.15': '3.208.253.215',
  '172.31.95.23': '34.193.8.68',
  '172.31.95.235': '3.214.204.82',
  '172.31.95.73': '18.204.189.145'
}

export default {
  EMPTY_WORK,
  GENESIS_HASH,
  MAXUINT128,
  minimumFee,
  defaultRPC,
  defaultMQTT,
  testnetDelegates,
  Iso10126,
  AES,
  stringFromHex,
  stringToHex,
  decToHex,
  hexToDec,
  hexToUint8,
  uint8ToHex,
  changeEndianness,
  isAlphanumeric,
  isAlphanumericExtended,
  byteCount,
  deserializeController,
  deserializeControllers,
  deserializeSettings,
  serializeController,
  serializeControllers,
  convertObjectToArray,
  keyFromAccount,
  accountFromHexKey,
  isLogosAccount
}
