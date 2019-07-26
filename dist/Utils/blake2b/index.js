"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var blake2b_1 = require("./blake2b");
var wasm = blake2b_1.default();
// Initialization Vector
var BLAKE2B_IV32 = new Uint32Array([
    0xF3BCC908, 0x6A09E667, 0x84CAA73B, 0xBB67AE85,
    0xFE94F82B, 0x3C6EF372, 0x5F1D36F1, 0xA54FF53A,
    0xADE682D1, 0x510E527F, 0x2B3E6C1F, 0x9B05688C,
    0xFB41BD6B, 0x1F83D9AB, 0x137E2179, 0x5BE0CD19
]);
var SIGMA8 = [
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
];
// These are offsets into a uint64 buffer.
// Multiply them all by 2 to make them offsets into a uint32 buffer,
// because this is Javascript and we don't have uint64s
var SIGMA82 = new Uint8Array(SIGMA8.map(function (x) { return x * 2; }));
var toHex = function (n) {
    if (n < 16)
        return '0' + n.toString(16);
    return n.toString(16);
};
var hexSlice = function (buf) {
    var str = '';
    for (var i = 0; i < buf.length; i++)
        str += toHex(buf[i]);
    return str;
};
var wasmHexSlice = function (buf, start, len) {
    var str = '';
    for (var i = 0; i < len; i++)
        str += toHex(buf[start + i]);
    return str;
};
var WASM_LOADED = function () { return Boolean(wasm && wasm.exports); };
exports.WASM_LOADED = WASM_LOADED;
var BYTES_MIN = 1;
exports.BYTES_MIN = BYTES_MIN;
var BYTES_MAX = 64;
exports.BYTES_MAX = BYTES_MAX;
var BYTES = 32;
exports.BYTES = BYTES;
var KEYBYTES_MIN = 16;
exports.KEYBYTES_MIN = KEYBYTES_MIN;
var KEYBYTES_MAX = 64;
exports.KEYBYTES_MAX = KEYBYTES_MAX;
var KEYBYTES = 32;
exports.KEYBYTES = KEYBYTES;
var SALTBYTES = 16;
exports.SALTBYTES = SALTBYTES;
var PERSONALBYTES = 16;
exports.PERSONALBYTES = PERSONALBYTES;
var SUPPORTED = typeof WebAssembly !== 'undefined';
exports.SUPPORTED = SUPPORTED;
// Creates a BLAKE2b hashing context
// Requires an output length between 1 and 64 bytes
// Takes an optional Uint8Array key
var Blake2b = /** @class */ (function () {
    function Blake2b(outlen, key, salt, personal, forceUseJS) {
        var _this = this;
        if (outlen === void 0) { outlen = 32; }
        if (key === void 0) { key = null; }
        if (salt === void 0) { salt = null; }
        if (personal === void 0) { personal = null; }
        if (forceUseJS === void 0) { forceUseJS = false; }
        this.WASM = wasm && wasm.buffer;
        // 64-bit unsigned addition
        // Sets v[a,a+1] += v[b,b+1]
        this.ADD64AA = function (a, b) {
            var o0 = _this.v[a] + _this.v[b];
            var o1 = _this.v[a + 1] + _this.v[b + 1];
            if (o0 >= 0x100000000) {
                o1++;
            }
            _this.v[a] = o0;
            _this.v[a + 1] = o1;
        };
        // 64-bit unsigned addition
        // Sets v[a,a+1] += b
        // b0 is the low 32 bits of b, b1 represents the high 32 bits
        this.ADD64AC = function (a, b0, b1) {
            var o0 = _this.v[a] + b0;
            if (b0 < 0) {
                o0 += 0x100000000;
            }
            var o1 = _this.v[a + 1] + b1;
            if (o0 >= 0x100000000) {
                o1++;
            }
            _this.v[a] = o0;
            _this.v[a + 1] = o1;
        };
        // Little-endian byte access
        this.B2B_GET32 = function (arr, i) {
            return (arr[i] ^
                (arr[i + 1] << 8) ^
                (arr[i + 2] << 16) ^
                (arr[i + 3] << 24));
        };
        // G Mixing function
        // The ROTRs are inlined for speed
        this.B2B_G = function (a, b, c, d, ix, iy) {
            var x0 = _this.m[ix];
            var x1 = _this.m[ix + 1];
            var y0 = _this.m[iy];
            var y1 = _this.m[iy + 1];
            _this.ADD64AA(a, b); // v[a,a+1] += v[b,b+1] ... in JS we must store a uint64 as two uint32s
            _this.ADD64AC(a, x0, x1); // v[a, a+1] += x ... x0 is the low 32 bits of x, x1 is the high 32 bits
            // v[d,d+1] = (v[d,d+1] xor v[a,a+1]) rotated to the right by 32 bits
            var xor0 = _this.v[d] ^ _this.v[a];
            var xor1 = _this.v[d + 1] ^ _this.v[a + 1];
            _this.v[d] = xor1;
            _this.v[d + 1] = xor0;
            _this.ADD64AA(c, d);
            // v[b,b+1] = (v[b,b+1] xor v[c,c+1]) rotated right by 24 bits
            xor0 = _this.v[b] ^ _this.v[c];
            xor1 = _this.v[b + 1] ^ _this.v[c + 1];
            _this.v[b] = (xor0 >>> 24) ^ (xor1 << 8);
            _this.v[b + 1] = (xor1 >>> 24) ^ (xor0 << 8);
            _this.ADD64AA(a, b);
            _this.ADD64AC(a, y0, y1);
            // v[d,d+1] = (v[d,d+1] xor v[a,a+1]) rotated right by 16 bits
            xor0 = _this.v[d] ^ _this.v[a];
            xor1 = _this.v[d + 1] ^ _this.v[a + 1];
            _this.v[d] = (xor0 >>> 16) ^ (xor1 << 16);
            _this.v[d + 1] = (xor1 >>> 16) ^ (xor0 << 16);
            _this.ADD64AA(c, d);
            // v[b,b+1] = (v[b,b+1] xor v[c,c+1]) rotated right by 63 bits
            xor0 = _this.v[b] ^ _this.v[c];
            xor1 = _this.v[b + 1] ^ _this.v[c + 1];
            _this.v[b] = (xor1 >>> 31) ^ (xor0 << 1);
            _this.v[b + 1] = (xor0 >>> 31) ^ (xor1 << 1);
        };
        // Compression function. 'last' flag indicates last block.
        // Note we're representing 16 uint64s as 32 uint32s
        this.blake2bCompress = function (last) {
            // init work variables
            for (var i = 0; i < 16; i++) {
                _this.v[i] = _this.context.h[i];
                _this.v[i + 16] = BLAKE2B_IV32[i];
            }
            // low 64 bits of offset
            _this.v[24] = _this.v[24] ^ _this.context.t;
            _this.v[25] = _this.v[25] ^ (_this.context.t / 0x100000000);
            // high 64 bits not supported, offset may not be higher than 2**53-1
            // last block flag set ?
            if (last) {
                _this.v[28] = ~_this.v[28];
                _this.v[29] = ~_this.v[29];
            }
            // get little-endian words
            for (var i = 0; i < 32; i++) {
                _this.m[i] = _this.B2B_GET32(_this.context.b, 4 * i);
            }
            // twelve rounds of mixing
            for (var i = 0; i < 12; i++) {
                _this.B2B_G(0, 8, 16, 24, SIGMA82[i * 16 + 0], SIGMA82[i * 16 + 1]);
                _this.B2B_G(2, 10, 18, 26, SIGMA82[i * 16 + 2], SIGMA82[i * 16 + 3]);
                _this.B2B_G(4, 12, 20, 28, SIGMA82[i * 16 + 4], SIGMA82[i * 16 + 5]);
                _this.B2B_G(6, 14, 22, 30, SIGMA82[i * 16 + 6], SIGMA82[i * 16 + 7]);
                _this.B2B_G(0, 10, 20, 30, SIGMA82[i * 16 + 8], SIGMA82[i * 16 + 9]);
                _this.B2B_G(2, 12, 22, 24, SIGMA82[i * 16 + 10], SIGMA82[i * 16 + 11]);
                _this.B2B_G(4, 14, 16, 26, SIGMA82[i * 16 + 12], SIGMA82[i * 16 + 13]);
                _this.B2B_G(6, 8, 18, 28, SIGMA82[i * 16 + 14], SIGMA82[i * 16 + 15]);
            }
            for (var i = 0; i < 16; i++) {
                _this.context.h[i] = _this.context.h[i] ^ _this.v[i] ^ _this.v[i + 16];
            }
        };
        this.update = function (input) {
            if (_this.finalized)
                throw new Error("Hash instance finalized");
            if (wasm && wasm.exports && _this.mode === 'wasm') {
                if (_this.head + input.length > wasm.memory.length)
                    wasm.realloc(_this.head + input.length);
                wasm.memory.set(input, _this.head);
                wasm.exports.blake2b_update(_this.pointer, _this.head, _this.head + input.length);
            }
            else {
                for (var i = 0; i < input.length; i++) {
                    if (_this.context.c === 128) { // buffer full ?
                        _this.context.t += _this.context.c; // add counters
                        _this.blake2bCompress(false); // compress (not last)
                        _this.context.c = 0; // counter to zero
                    }
                    _this.context.b[_this.context.c++] = input[i];
                }
            }
            return _this;
        };
        this.digest = function (out) {
            if (_this.finalized)
                throw new Error("Hash instance finalized");
            if (wasm && wasm.exports && _this.mode === 'wasm') {
                _this.freeList.push(_this.pointer);
                wasm.exports.blake2b_final(_this.pointer);
                if (!out || out === 'binary') {
                    return wasm.memory.slice(_this.pointer + 128, _this.pointer + 128 + _this.outlen);
                }
                if (out === 'hex') {
                    return wasmHexSlice(wasm.memory, _this.pointer + 128, _this.outlen).toUpperCase();
                }
                if (out.length < _this.outlen)
                    throw new Error('input must be TypedArray or Buffer');
                for (var i = 0; i < _this.outlen; i++) {
                    out[i] = wasm.memory[_this.pointer + 128 + i];
                }
                return out;
            }
            else {
                var buf = (!out || out === 'binary' || out === 'hex') ? new Uint8Array(_this.context.outlen) : out;
                if (buf.length < _this.context.outlen)
                    throw new Error("out must have at least " + _this.context.outlen + " bytes of space");
                _this.context.t += _this.context.c; // mark last block offset
                while (_this.context.c < 128) { // fill up with zeros
                    _this.context.b[_this.context.c++] = 0;
                }
                _this.blake2bCompress(true); // final block flag = 1
                for (var i = 0; i < _this.context.outlen; i++) {
                    buf[i] = _this.context.h[i >> 2] >> (8 * (i & 3));
                }
                if (out === 'hex')
                    return hexSlice(buf).toUpperCase();
                return buf;
            }
        };
        this.final = this.digest;
        if (outlen < BYTES_MIN)
            throw new Error("outlen must be at least " + BYTES_MIN + ", was given " + outlen);
        if (outlen > BYTES_MAX)
            throw new Error("outlen must be at most " + BYTES_MAX + ", was given " + outlen);
        if (key !== null) {
            if (key.length < KEYBYTES_MIN)
                throw new Error("key must be at least " + KEYBYTES_MIN + ", was given " + key.length);
            if (key.length > KEYBYTES_MAX)
                throw new Error("key must be at most " + KEYBYTES_MAX + ", was given " + key.length);
        }
        if (salt !== null) {
            if (salt.length !== SALTBYTES)
                throw new Error("salt must be exactly " + SALTBYTES + ", was given " + salt.length);
        }
        if (personal !== null) {
            if (personal.length !== PERSONALBYTES)
                throw new Error("personal must be exactly " + PERSONALBYTES + ", was given " + personal.length);
        }
        this.v = new Uint32Array(32);
        this.m = new Uint32Array(32);
        this.mode = null;
        this.finalized = false;
        this.outlen = outlen;
        if (!forceUseJS && wasm && wasm.exports && (this.mode === null || this.mode === 'wasm')) {
            this.freeList = [];
            this.head = 64;
            this.mode = 'wasm';
            if (!this.freeList.length) {
                this.freeList.push(this.head);
                this.head += 216;
            }
            this.pointer = this.freeList.pop();
            wasm.memory.fill(0, 0, 64);
            wasm.memory[0] = this.outlen;
            wasm.memory[1] = key ? key.length : 0;
            wasm.memory[2] = 1; // fanout
            wasm.memory[3] = 1; // depth
            if (salt)
                wasm.memory.set(salt, 32);
            if (personal)
                wasm.memory.set(personal, 48);
            if (this.pointer + 216 > wasm.memory.length)
                wasm.realloc(this.pointer + 216); // we need 216 bytes for the state
            wasm.exports.blake2b_init(this.pointer, this.outlen);
            if (key) {
                this.update(key);
                wasm.memory.fill(0, this.head, this.head + key.length); // whiteout key
                wasm.memory[this.pointer + 200] = 128;
            }
        }
        else {
            if (wasm && !wasm.exports && this.mode === null)
                console.log("Using JS Fallback since WASM is still loading");
            this.mode = 'js';
            // state, 'param block'
            this.context = {
                b: new Uint8Array(128),
                h: new Uint32Array(16),
                t: 0,
                c: 0,
                outlen: outlen // output length in bytes
            };
            // initialize hash state
            for (var i = 0; i < 16; i++) {
                this.context.h[i] = BLAKE2B_IV32[i];
            }
            var keylen = key ? key.length : 0;
            this.context.h[0] ^= 0x01010000 ^ (keylen << 8) ^ this.context.outlen;
            // key the hash, if applicable
            if (key) {
                this.update(key);
                // at the end
                this.context.c = 128;
            }
        }
    }
    return Blake2b;
}());
exports.Blake2b = Blake2b;
exports.default = Blake2b;
//# sourceMappingURL=index.js.map