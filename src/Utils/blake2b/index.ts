import b2wasm from './blake2b'
interface Context {
    b: Uint8Array;
    h: Uint32Array;
    t: number; // input count
    c: number; // pointer within buffer
    outlen: number; // output length in bytes
}

const wasm = b2wasm()
const v = new Uint32Array(32)
const m = new Uint32Array(32)
let head = 64
const freeList: number[] = []

// 64-bit unsigned addition
// Sets v[a,a+1] += v[b,b+1]
// v should be a Uint32Array
const ADD64AA = (v: Uint32Array, a: number, b: number): void => {
    const o0 = v[a] + v[b]
    let o1 = v[a + 1] + v[b + 1]
    if (o0 >= 0x100000000) {
        o1++
    }
    v[a] = o0
    v[a + 1] = o1
}

// 64-bit unsigned addition
// Sets v[a,a+1] += b
// b0 is the low 32 bits of b, b1 represents the high 32 bits
const ADD64AC = (v: Uint32Array, a: number, b0: number, b1: number): void => {
    let o0 = v[a] + b0
    if (b0 < 0) {
        o0 += 0x100000000
    }
    let o1 = v[a + 1] + b1
    if (o0 >= 0x100000000) {
        o1++
    }
    v[a] = o0
    v[a + 1] = o1
}

// Little-endian byte access
const B2B_GET32 = (arr: Uint8Array, i: number): number => {
    return (arr[i] ^
  (arr[i + 1] << 8) ^
  (arr[i + 2] << 16) ^
  (arr[i + 3] << 24))
}

// G Mixing function
// The ROTRs are inlined for speed
const B2B_G = (a: number, b: number, c: number, d: number, ix: number, iy: number): void => {
    const x0 = m[ix]
    const x1 = m[ix + 1]
    const y0 = m[iy]
    const y1 = m[iy + 1]

    ADD64AA(v, a, b) // v[a,a+1] += v[b,b+1] ... in JS we must store a uint64 as two uint32s
    ADD64AC(v, a, x0, x1) // v[a, a+1] += x ... x0 is the low 32 bits of x, x1 is the high 32 bits

    // v[d,d+1] = (v[d,d+1] xor v[a,a+1]) rotated to the right by 32 bits
    let xor0 = v[d] ^ v[a]
    let xor1 = v[d + 1] ^ v[a + 1]
    v[d] = xor1
    v[d + 1] = xor0

    ADD64AA(v, c, d)

    // v[b,b+1] = (v[b,b+1] xor v[c,c+1]) rotated right by 24 bits
    xor0 = v[b] ^ v[c]
    xor1 = v[b + 1] ^ v[c + 1]
    v[b] = (xor0 >>> 24) ^ (xor1 << 8)
    v[b + 1] = (xor1 >>> 24) ^ (xor0 << 8)

    ADD64AA(v, a, b)
    ADD64AC(v, a, y0, y1)

    // v[d,d+1] = (v[d,d+1] xor v[a,a+1]) rotated right by 16 bits
    xor0 = v[d] ^ v[a]
    xor1 = v[d + 1] ^ v[a + 1]
    v[d] = (xor0 >>> 16) ^ (xor1 << 16)
    v[d + 1] = (xor1 >>> 16) ^ (xor0 << 16)

    ADD64AA(v, c, d)

    // v[b,b+1] = (v[b,b+1] xor v[c,c+1]) rotated right by 63 bits
    xor0 = v[b] ^ v[c]
    xor1 = v[b + 1] ^ v[c + 1]
    v[b] = (xor1 >>> 31) ^ (xor0 << 1)
    v[b + 1] = (xor0 >>> 31) ^ (xor1 << 1)
}

// Initialization Vector
const BLAKE2B_IV32 = new Uint32Array([
    0xF3BCC908, 0x6A09E667, 0x84CAA73B, 0xBB67AE85,
    0xFE94F82B, 0x3C6EF372, 0x5F1D36F1, 0xA54FF53A,
    0xADE682D1, 0x510E527F, 0x2B3E6C1F, 0x9B05688C,
    0xFB41BD6B, 0x1F83D9AB, 0x137E2179, 0x5BE0CD19
])

const SIGMA8 = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3,
    11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4,
    7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8,
    9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13,
    2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9,
    12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11,
    13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10,
    6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5,
    10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0,
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3
]

// These are offsets into a uint64 buffer.
// Multiply them all by 2 to make them offsets into a uint32 buffer,
// because this is Javascript and we don't have uint64s
const SIGMA82 = new Uint8Array(SIGMA8.map((x): number => x * 2))

// Compression function. 'last' flag indicates last block.
// Note we're representing 16 uint64s as 32 uint32s
const blake2bCompress = (ctx: Context, last: boolean): void => {
    let i = 0

    // init work variables
    for (i = 0; i < 16; i++) {
        v[i] = ctx.h[i]
        v[i + 16] = BLAKE2B_IV32[i]
    }

    // low 64 bits of offset
    v[24] = v[24] ^ ctx.t
    v[25] = v[25] ^ (ctx.t / 0x100000000)
    // high 64 bits not supported, offset may not be higher than 2**53-1

    // last block flag set ?
    if (last) {
        v[28] = ~v[28]
        v[29] = ~v[29]
    }

    // get little-endian words
    for (i = 0; i < 32; i++) {
        m[i] = B2B_GET32(ctx.b, 4 * i)
    }

    // twelve rounds of mixing
    for (i = 0; i < 12; i++) {
        B2B_G(0, 8, 16, 24, SIGMA82[i * 16 + 0], SIGMA82[i * 16 + 1])
        B2B_G(2, 10, 18, 26, SIGMA82[i * 16 + 2], SIGMA82[i * 16 + 3])
        B2B_G(4, 12, 20, 28, SIGMA82[i * 16 + 4], SIGMA82[i * 16 + 5])
        B2B_G(6, 14, 22, 30, SIGMA82[i * 16 + 6], SIGMA82[i * 16 + 7])
        B2B_G(0, 10, 20, 30, SIGMA82[i * 16 + 8], SIGMA82[i * 16 + 9])
        B2B_G(2, 12, 22, 24, SIGMA82[i * 16 + 10], SIGMA82[i * 16 + 11])
        B2B_G(4, 14, 16, 26, SIGMA82[i * 16 + 12], SIGMA82[i * 16 + 13])
        B2B_G(6, 8, 18, 28, SIGMA82[i * 16 + 14], SIGMA82[i * 16 + 15])
    }

    for (i = 0; i < 16; i++) {
        ctx.h[i] = ctx.h[i] ^ v[i] ^ v[i + 16]
    }
}

// default parameterBlock
const parameterBlock = new Uint8Array([
    0, 0, 0, 0, //  0: outlen, keylen, fanout, depth
    0, 0, 0, 0, //  4: leaf length, sequential mode
    0, 0, 0, 0, //  8: node offset
    0, 0, 0, 0, // 12: node offset
    0, 0, 0, 0, // 16: node depth, inner length, rfu
    0, 0, 0, 0, // 20: rfu
    0, 0, 0, 0, // 24: rfu
    0, 0, 0, 0, // 28: rfu
    0, 0, 0, 0, // 32: salt
    0, 0, 0, 0, // 36: salt
    0, 0, 0, 0, // 40: salt
    0, 0, 0, 0, // 44: salt
    0, 0, 0, 0, // 48: personal
    0, 0, 0, 0, // 52: personal
    0, 0, 0, 0, // 56: personal
    0, 0, 0, 0 // 60: personal
])

export const initalizeBlake2b = (): Promise<boolean|Error> => {
    return new Promise<boolean|Error>((resolve, reject): void => {
        if (!wasm) resolve(false)
        wasm.onload((err): void => {
            if (err) {
                resolve(true)
            } else {
                reject(err)
            }
        })
    })
}

const toHex = (n: number): string => {
    if (n < 16) return '0' + n.toString(16)
    return n.toString(16)
}

const hexSlice = (buf: Buffer|Uint8Array): string => {
    let str = ''
    for (let i = 0; i < buf.length; i++) str += toHex(buf[i])
    return str
}

// Updates a BLAKE2b streaming hash
// Requires hash context and Uint8Array (byte array)
const blake2bUpdate = (ctx: Context, input: Uint8Array): Context => {
    for (let i = 0; i < input.length; i++) {
        if (ctx.c === 128) { // buffer full ?
            ctx.t += ctx.c // add counters
            blake2bCompress(ctx, false) // compress (not last)
            ctx.c = 0 // counter to zero
        }
        ctx.b[ctx.c++] = input[i]
    }
    return ctx
}

// Completes a BLAKE2b streaming hash
// Returns a Uint8Array containing the message digest
const blake2bFinal = (ctx: Context, out: Uint8Array): Uint8Array => {
    ctx.t += ctx.c // mark last block offset
    while (ctx.c < 128) { // fill up with zeros
        ctx.b[ctx.c++] = 0
    }
    blake2bCompress(ctx, true) // final block flag = 1
    for (let i = 0; i < ctx.outlen; i++) {
        out[i] = ctx.h[i >> 2] >> (8 * (i & 3))
    }
    return out
}

const blake2bDigest = (ctx: Context, out?: 'binary'|'hex'|Uint8Array): string|Uint8Array => {
    const buf = (!out || out === 'binary' || out === 'hex') ? new Uint8Array(ctx.outlen) : out
    if (buf.length < ctx.outlen) throw new Error('out must have at least outlen bytes of space')
    blake2bFinal(ctx, buf)
    if (out === 'hex') return hexSlice(buf)
    return buf
}

const wasmHexSlice = (buf: Buffer|Uint8Array, start: number, len: number): string => {
    let str = ''
    for (let i = 0; i < len; i++) str += toHex(buf[start + i])
    return str
}

const WASM_LOADED = (): boolean => Boolean(wasm && wasm.exports)
const BYTES_MIN = 16
const BYTES_MAX = 64
const BYTES = 32
const KEYBYTES_MIN = 16
const KEYBYTES_MAX = 64
const KEYBYTES = 32
const SALTBYTES = 16
const PERSONALBYTES = 16
const SUPPORTED = typeof WebAssembly !== 'undefined'

// Creates a BLAKE2b hashing context
// Requires an output length between 1 and 64 bytes
// Takes an optional Uint8Array key
export default class Blake2b {
    private context: Context

    private parameterBlock: Uint8Array

    private outlen: number

    private finalized: boolean

    private pointer: number

    private mode: 'wasm' | 'js'

    public constructor (outlen: number = 32, key: Uint8Array = null, salt: Uint8Array = null, personal: Uint8Array = null) {
        if (outlen < BYTES_MIN) throw new Error(`outlen must be at least ${BYTES_MIN}, was given ${outlen}`)
        if (outlen > BYTES_MAX) throw new Error(`outlen must be at most ${BYTES_MAX}, was given ${outlen}`)
        if (key !== null) {
            if (key.length < KEYBYTES_MIN) throw new Error(`key must be at least ${KEYBYTES_MIN}, was given ${key.length}`)
            if (key.length > KEYBYTES_MAX) throw new Error(`key must be at most ${KEYBYTES_MAX}, was given ${key.length}`)
        }
        if (salt !== null) {
            if (salt.length !== SALTBYTES) throw new Error(`salt must be exactly ${SALTBYTES}, was given ${salt.length}`)
        }
        if (personal !== null) {
            if (personal.length !== PERSONALBYTES) throw new Error(`personal must be exactly ${PERSONALBYTES}, was given ${personal.length}`)
        }
        this.finalized = false
        this.outlen = outlen

        if (wasm && wasm.exports && (this.mode === null || this.mode === 'wasm')) {
            this.mode = 'wasm'
            if (!freeList.length) {
                freeList.push(head)
                head += 216
            }
            this.pointer = freeList.pop()
            wasm.memory.fill(0, 0, 64)
            wasm.memory[0] = this.outlen
            wasm.memory[1] = key ? key.length : 0
            wasm.memory[2] = 1 // fanout
            wasm.memory[3] = 1 // depth
            if (salt) wasm.memory.set(salt, 32)
            if (personal) wasm.memory.set(personal, 48)
            if (this.pointer + 216 > wasm.memory.length) wasm.realloc(this.pointer + 216) // we need 216 bytes for the state
            wasm.exports.blake2b_init(this.pointer, this.outlen)
            if (key) {
                this.update(key)
                wasm.memory.fill(0, head, head + key.length) // whiteout key
                wasm.memory[this.pointer + 200] = 128
            }
        } else {
            if (wasm && !wasm.exports && this.mode === null) console.log('Using JS Fallback since WASM is still loading')
            this.mode = 'js'
            // zero out parameterBlock before usage
            this.parameterBlock = parameterBlock
            this.parameterBlock.fill(0)
            // state, 'param block'
            this.context.b = new Uint8Array(128)
            this.context.h = new Uint32Array(16)
            this.context.t = 0 // input count
            this.context.c = 0 // pointer within buffer
            this.context.outlen = outlen // output length in bytes
            this.parameterBlock[0] = outlen
            if (key) this.parameterBlock[1] = key.length
            this.parameterBlock[2] = 1 // fanout
            this.parameterBlock[3] = 1 // depth
            if (salt) this.parameterBlock.set(salt, 32)
            if (personal) this.parameterBlock.set(personal, 48)
            // initialize hash state
            for (let i = 0; i < 16; i++) {
                this.context.h[i] = BLAKE2B_IV32[i] ^ B2B_GET32(this.parameterBlock, i * 4)
            }
            // key the hash, if applicable
            if (key) {
                blake2bUpdate(this.context, key)
                // at the end
                this.context.c = 128
            }
        }
    }

    public update = (input: Uint8Array | Buffer): Blake2b => {
        if (this.finalized) throw new Error(`Hash instance finalized`)
        if (wasm) {
            if (head + input.length > wasm.memory.length) wasm.realloc(head + input.length)
            wasm.memory.set(input, head)
            wasm.exports.blake2b_update(this.pointer, head, head + input.length)
        } else {
            this.context = blake2bUpdate(this.context, input)
        }
        return this
    }

    public digest = (out?: 'binary'|'hex'|Uint8Array|Buffer): Uint8Array|string => {
        if (this.finalized) throw new Error(`Hash instance finalized`)
        if (wasm) {
            freeList.push(this.pointer)
            wasm.exports.blake2b_final(this.pointer)
            if (!out || out === 'binary') {
                return wasm.memory.slice(this.pointer + 128, this.pointer + 128 + this.outlen)
            }
            if (out === 'hex') {
                return wasmHexSlice(wasm.memory, this.pointer + 128, this.outlen)
            }
            if (out.length < this.outlen) throw new Error('input must be TypedArray or Buffer')
            for (let i = 0; i < this.outlen; i++) {
                out[i] = wasm.memory[this.pointer + 128 + i]
            }
            return out
        } else {
            return blake2bDigest(this.context, out)
        }
    }

    public final = this.digest

    public WASM = wasm && wasm.buffer
}

export {
    Blake2b,
    WASM_LOADED,
    SUPPORTED,
    BYTES_MIN,
    BYTES_MAX,
    BYTES,
    KEYBYTES_MIN,
    KEYBYTES_MAX,
    KEYBYTES,
    SALTBYTES,
    PERSONALBYTES
}
