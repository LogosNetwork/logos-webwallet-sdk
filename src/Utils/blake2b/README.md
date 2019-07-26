# blake2b with WASM where available

Blake2b implemented in WASM

```
npm install FuturePackageLocation
```

Works in browsers that support WASM and Node.js 8+.
Also works in all browsers that don't support WASM by falling back to a JS implementation of blake2b

## Usage

``` js
import Blake2b from 'FuturePackageLocation'
let hash = new Blake2b()
  .update(Buffer.from('hello')) // pass in a buffer or uint8array
  .update(Buffer.from(' '))
  .update(Buffer.from('world'))
  .digest('hex')

console.log('Blake2b hash of "hello world" is %s', hash)
```

## API

#### `let hash = new Blake2b(outlen: number = 32, key: Uint8Array = null, salt: Uint8Array = null, personal: Uint8Array = null, forceUseJS: boolean = false)`

Create a new hash instance. `outputLength` defaults to `32`.

#### `hash.update(data)`

Update the hash with a new piece of data. `data` should be a buffer or uint8array.

#### `let digest = hash.digest(out?: ('binary'|'hex')|(Uint8Array|Buffer))`

Digest / Finalize the hash. Passing 'out' as 'hex' will return a hex output where as passing nothing or 'binary' will return the binary output. You many also pass a final piece of data as a buffer or uint8array this will return the final hash in binary.

## Browser demo

TBD

## Contributing

The bulk of this module is implemented in WebAssembly in the [blake2b.wat](blake2b.wat) file.
The format of this file is S-Expressions that can be compiled to their binary WASM representation by doing

```
wat2wasm blake2b.wat -o blake2b.wasm
```

If you do not have `wat2wasm` installed follow the instructions here, https://github.com/WebAssembly/wabt

## License

MIT