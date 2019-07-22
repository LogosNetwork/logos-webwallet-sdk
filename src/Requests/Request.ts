import { keyFromAccount, hexToUint8, uint8ToHex, decToHex, changeEndianness, GENESIS_HASH, EMPTY_WORK, defaultRPC } from '../Utils/Utils'
import blake2b from '../Utils/blake2b'
import * as nacl from 'tweetnacl/nacl'
import Logos from '@logosnetwork/logos-rpc-client'
export interface RequestOptions {
  origin?: string
  previous?: string
  sequence?: number | string
  fee?: string
  signature?: string
  timestamp?: string
  work?: string
  type?: RequestType | string
}
interface RequestType {
  text: string
  value: number
}
interface PublishOptions {
  proxy: string
  delegates: string[]
}
export interface RequestJSON {
  previous?: string
  sequence?: number
  origin?: string
  fee?: string
  work?: string
  hash?: string
  type?: string
  signature?: string
  timestamp?: string
}
/**
 * The base class for all Requests.
 */
export default abstract class Request {
  private _signature: string
  private _work: string
  private _previous: string
  private _fee: string
  private _origin: string
  private _sequence: number
  private _timestamp: string
  private _version: number
  private _published: boolean
  private _type: RequestType
  constructor (options: RequestOptions = {
    origin: null,
    previous: null,
    sequence: null,
    fee: null,
    signature: null,
    timestamp: null,
    work: EMPTY_WORK,
    type: null
  }) {
    /**
     * Signature of the request
     * @type {string}
     * @private
     */
    if (options.signature !== undefined) {
      this._signature = options.signature
    } else {
      this._signature = null
    }

    /**
     * Work of the request based on previous hash
     * @type {Hexadecimal16Length}
     * @private
     */
    if (options.work !== undefined) {
      this._work = options.work
    } else {
      this._work = EMPTY_WORK
    }

    /**
     * Previous request hash
     * @type {string}
     * @private
     */
    if (options.previous !== undefined) {
      this._previous = options.previous
    } else {
      this._previous = null
    }

    /**
     * Fee of the request
     * @type {string}
     * @private
     */
    if (options.fee !== undefined) {
      this._fee = options.fee
    } else {
      this._fee = null
    }

    /**
     * Logos account address of the request origin account
     * @type {string}
     * @private
     */
    if (options.origin !== undefined) {
      this._origin = options.origin
    } else {
      this._origin = null
    }

    /**
     * Sequence of the request in the chain
     * @type {number}
     * @private
     */
    if (options.sequence !== undefined) {
      this._sequence = parseInt(options.sequence.toString())
    } else {
      this._sequence = null
    }

    /**
     * Timestamp of the request (this might not be perfectly accurate)
     * @type {string}
     * @private
     */
    if (options.timestamp !== undefined) {
      this._timestamp = options.timestamp
    } else {
      this._timestamp = null
    }

    /**
     * Request version of webwallet SDK
     * @type {number}
     * @private
     */
    this._version = 1
    this._published = false
  }

  set published (val) {
    this._published = val
  }

  get published () {
    return this._published
  }

  set signature (hex) {
    this._signature = hex
  }

  /**
   * Return the signature of the request
   * @type {string}
   * @readonly
   */
  get signature () {
    return this._signature
  }

  set work (hex) {
    if (!this._previous) throw new Error('Previous is not set.')
    this._work = hex
  }

  /**
   * Return the work of the request
   * @type {Hexadecimal16Length}
   */
  get work () {
    return this._work
  }

  set previous (hex) {
    if (!/[0-9A-F]{64}/i.test(hex)) throw new Error('Invalid previous request hash.')
    this._previous = hex
  }

  /**
   * Return the previous request as hash
   * @type {string}
   */
  get previous () {
    return this._previous
  }

  set fee (val) {
    this._fee = val
  }

  /**
   * Return the string amount of the fee in reason
   * @type {string}
   */
  get fee () {
    return this._fee
  }

  set sequence (val) {
    this._sequence = val
  }

  /**
   * Return the the sequence of the request in the origin account
   * @type {number}
   */
  get sequence () {
    return this._sequence
  }

  set origin (origin) {
    this._origin = origin
  }

  /**
   * Return the the timestamp of when the request was confirmed
   * @type {number}
   */
  get timestamp () {
    return this._timestamp
  }

  set timestamp (timestamp) {
    this._timestamp = timestamp
  }

  /**
   * The origin account public key
   * @type {string}
   * @readonly
   */
  get origin () {
    return keyFromAccount(this._origin)
  }

  /**
   * The origin account address
   * @type {string}
   * @readonly
   */
  get originAccount () {
    return this._origin
  }

  /**
   * Returns the type of this request
   * @type {string}
   * @readonly
   */
  get type () {
    return this._type.text
  }

  /**
   * Returns the type value of this request
   * @type {number}
   * @readonly
   */
  get typeValue () {
    return this._type.value
  }

  /**
   * Returns the version of this request
   * @type {number}
   * @readonly
   */
  get version () {
    return this._version
  }

  /**
   * Returns a hash for the request
   * @returns {string} - Hash
   */
  abstract get hash (): string

  /**
   * Creates a signature for the request
   * @param {string} privateKey - private key in hex
   * @returns {boolean} if the signature is valid
   */
  sign (privateKey: string) {
    let uint8Key:Uint8Array = hexToUint8(privateKey)
    if (uint8Key.length !== 32) throw new Error('Invalid Private Key length. Should be 32 bytes.')
    const hash = hexToUint8(this.hash)
    this.signature = uint8ToHex(nacl.sign.detached(hash, uint8Key))
    return this.verify()
  }

  /**
   * Creates a Blake2b Context for the request
   * @returns {context} - Blake2b Context
   */
  requestHash () {
    if (!this.previous) throw new Error('Previous is not set.')
    if (this.sequence === null) throw new Error('Sequence is not set.')
    if (this.fee === null) throw new Error('Transaction fee is not set.')
    if (!this.origin) throw new Error('Origin account is not set.')
    if (!this.type) throw new Error('Request type is not defined.')
    return new blake2b()
      .update(hexToUint8(decToHex(this.typeValue, 1)))
      .update(hexToUint8(this.origin))
      .update(hexToUint8(this.previous))
      .update(hexToUint8(decToHex(this.fee, 16)))
      .update(hexToUint8(changeEndianness(decToHex(this.sequence, 4))))
  }

  /**
   * Verifies the request's integrity
   * @returns {boolean}
   */
  verify () {
    if (!this.hash) throw new Error('Hash is not set.')
    if (!this.signature) throw new Error('Signature is not set.')
    if (!this.origin) throw new Error('Origin account is not set.')
    return nacl.sign.detached.verify(hexToUint8(this.hash), hexToUint8(this.signature), hexToUint8(this.origin))
  }

  /**
   * Publishes the request
   * @param {RPCOptions} options - rpc options
   * @returns {Promise<{hash:string}>} response of transcation publish
   */
  async publish (options:PublishOptions = defaultRPC) {
    let delegateId = null
    if (this.previous !== GENESIS_HASH) {
      delegateId = parseInt(this.previous.slice(-2), 16) % 32
    } else {
      // TODO 104 if token id and not token_send or issuance then use that else use origin
      delegateId = parseInt(this.origin.slice(-2), 16) % 32
    }
    const RPC = new Logos({
      url: `http://${options.delegates[delegateId]}:55000`,
      proxyURL: options.proxy
    })
    console.info(`Publishing ${this.type} ${this.sequence} to Delegate ${delegateId}`)
    const response = await RPC.requests.publish(JSON.stringify(this.toJSON()))
    if (response.hash) {
      console.info(`Delegate ${delegateId} accepted ${this.type} ${this.sequence}`)
      return response
    } else {
      console.error(`Invalid Request: Rejected by Logos Node \n ${JSON.stringify(response)}`)
      throw new Error(`Invalid Request: Rejected by Logos Node \n ${JSON.stringify(response)}`)
    }
  }

  /**
   * Returns the base request JSON
   * @returns {RequestJSON} RequestJSON as string
   */
  toJSON () {
    const obj:RequestJSON = {}
    obj.previous = this.previous
    obj.sequence = this.sequence
    obj.origin = this._origin
    obj.fee = this.fee
    obj.work = this.work
    obj.hash = this.hash
    obj.type = this.type
    obj.signature = this.signature
    if (this.timestamp) obj.timestamp = this.timestamp
    return obj
  }
}
