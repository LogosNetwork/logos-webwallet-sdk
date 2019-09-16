import { keyFromAccount, hexToUint8, uint8ToHex, decToHex, changeEndianness, GENESIS_HASH, EMPTY_WORK } from '../Utils/Utils'
import Blake2b from '../Utils/blake2b'
import nacl from 'tweetnacl/nacl'
import Logos from '@logosnetwork/logos-rpc-client'
export interface RequestOptions {
  origin?: string;
  previous?: string;
  sequence?: number | string;
  fee?: string;
  signature?: string;
  timestamp?: string;
  work?: string;
  type?: RequestType | string;
}
interface RequestType {
  text: string;
  value: number;
}
export interface RequestJSON {
  previous?: string;
  sequence?: number;
  origin?: string;
  fee?: string;
  work?: string;
  hash?: string;
  type?: string;
  signature?: string;
  timestamp?: string;
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

  public constructor (options: RequestOptions = {
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
     * Type of the request
     * @type {RequestType}
     * @private
     */
    if (options.type !== undefined) {
      this._type = options.type as RequestType
    } else {
      this._type = null
    }

    /**
     * Request version of webwallet SDK
     * @type {number}
     * @private
     */
    this._version = 1
    this._published = false
  }

  public get published (): boolean {
    return this._published
  }

  public set published (val: boolean) {
    this._published = val
  }

  /**
   * Return the signature of the request
   * @type {string}
   * @readonly
   */
  public get signature (): string {
    return this._signature
  }

  public set signature (hex: string) {
    this._signature = hex
  }

  /**
   * Return the work of the request
   * @type {string}
   */
  public get work (): string {
    return this._work
  }

  public set work (hex: string) {
    if (!this._previous) throw new Error('Previous is not set.')
    this._work = hex
  }

  /**
   * Return the previous request as hash
   * @type {string}
   */
  public get previous (): string {
    return this._previous
  }

  public set previous (hex: string) {
    if (!/[0-9A-F]{64}/i.test(hex)) throw new Error('Invalid previous request hash.')
    this._previous = hex
  }

  /**
   * Return the string amount of the fee in reason
   * @type {string}
   */
  public get fee (): string {
    return this._fee
  }

  public set fee (val: string) {
    this._fee = val
  }

  /**
   * Return the the sequence of the request in the origin account
   * @type {number}
   */
  public get sequence (): number {
    return this._sequence
  }

  public set sequence (val: number) {
    this._sequence = val
  }

  /**
   * Return the the timestamp of when the request was confirmed
   * @type {number}
   */
  public get timestamp (): string {
    return this._timestamp
  }

  public set timestamp (timestamp: string) {
    this._timestamp = timestamp
  }

  /**
   * The origin account public key
   * @type {string}
   * @readonly
   */
  public get origin (): string {
    return keyFromAccount(this._origin)
  }

  public set origin (origin: string) {
    this._origin = origin
  }

  /**
   * The origin account address
   * @type {string}
   * @readonly
   */
  public get originAccount (): string {
    return this._origin
  }

  /**
   * Returns the type of this request
   * @type {string}
   * @readonly
   */
  public get type (): string {
    if (!this._type) return null
    return this._type.text
  }

  /**
   * Returns the type value of this request
   * @type {number}
   * @readonly
   */
  public get typeValue (): number {
    if (!this._type) return null
    return this._type.value
  }

  /**
   * Returns the version of this request
   * @type {number}
   * @readonly
   */
  public get version (): number {
    return this._version
  }

  /**
   * Returns a hash for the request
   * @returns {string} - Hash
   */
  public abstract get hash (): string

  /**
   * Creates a signature for the request
   * @param {string} privateKey - private key in hex
   * @returns {boolean} if the signature is valid
   */
  public sign (privateKey: string): boolean {
    const uint8Key: Uint8Array = hexToUint8(privateKey)
    if (uint8Key.length !== 32) throw new Error('Invalid Private Key length. Should be 32 bytes.')
    const hash = hexToUint8(this.hash)
    this.signature = uint8ToHex(nacl.sign.detached(hash, uint8Key))
    return this.verify()
  }

  /**
   * Creates a Blake2b Context for the request
   * @returns {context} - Blake2b Context
   */
  public requestHash (): Blake2b {
    if (!this.previous) throw new Error('Previous is not set.')
    if (this.sequence === null) throw new Error('Sequence is not set.')
    if (this.fee === null) throw new Error('Transaction fee is not set.')
    if (!this.origin) throw new Error('Origin account is not set.')
    if (!this.type) throw new Error('Request type is not defined.')
    return new Blake2b()
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
  public verify (): boolean {
    if (!this.hash) throw new Error('Hash is not set.')
    if (!this.signature) throw new Error('Signature is not set.')
    if (!this.origin) throw new Error('Origin account is not set.')
    return nacl.sign.detached.verify(hexToUint8(this.hash), hexToUint8(this.signature), hexToUint8(this.origin))
  }

  /**
   * Publishes the request
   * @param {string[]} delegates - current delegates
   * @returns {Promise<{hash:string}>} response of transcation publish
   */
  public async publish (delegates: string[], proxy: string | null = null, port = '55000'): Promise<{hash: string}> {
    let delegateId = null
    if (this.previous !== GENESIS_HASH) {
      delegateId = parseInt(this.previous.slice(-2), 16) % 32
    } else {
      // TODO 104 if token id and not token_send or issuance then use that else use origin
      delegateId = parseInt(this.origin.slice(-2), 16) % 32
    }
    const RPC = new Logos({
      url: `http://${delegates[delegateId]}:${port}`,
      proxyURL: proxy
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
  public toJSON (): RequestJSON {
    const obj: RequestJSON = {}
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
