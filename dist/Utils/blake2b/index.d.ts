/// <reference types="node" />
declare const WASM_LOADED: () => boolean;
declare const BYTES_MIN = 1;
declare const BYTES_MAX = 64;
declare const BYTES = 32;
declare const KEYBYTES_MIN = 16;
declare const KEYBYTES_MAX = 64;
declare const KEYBYTES = 32;
declare const SALTBYTES = 16;
declare const PERSONALBYTES = 16;
declare const SUPPORTED: boolean;
export default class Blake2b {
    private context;
    private outlen;
    private finalized;
    private pointer;
    private mode;
    private v;
    private m;
    private head;
    private freeList;
    constructor(outlen?: number, key?: Uint8Array, salt?: Uint8Array, personal?: Uint8Array, forceUseJS?: boolean);
    WASM: Uint8Array;
    private ADD64AA;
    private ADD64AC;
    private B2B_GET32;
    private B2B_G;
    private blake2bCompress;
    update: (input: Uint8Array | Buffer) => Blake2b;
    digest: (out?: Uint8Array | Buffer | "binary" | "hex") => string | Uint8Array;
    final: (out?: Uint8Array | Buffer | "binary" | "hex") => string | Uint8Array;
}
export { Blake2b, WASM_LOADED, SUPPORTED, BYTES_MIN, BYTES_MAX, BYTES, KEYBYTES_MIN, KEYBYTES_MAX, KEYBYTES, SALTBYTES, PERSONALBYTES };
