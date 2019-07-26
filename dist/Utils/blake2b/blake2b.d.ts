export interface WasmModule extends WebAssembly.Instance {
    buffer: Uint8Array;
    memory: Uint8Array;
    realloc: (size: number) => void;
    onload: (cb: (err?: Error) => void) => void;
}
declare const _default: () => WasmModule;
export default _default;
