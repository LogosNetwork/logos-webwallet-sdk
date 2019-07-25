/* eslint @typescript-eslint/no-explicit-any: 0 */
/* eslint @typescript-eslint/no-unused-vars: 0 */
/**
 * WebAssembly v1 (MVP) declaration file for TypeScript
 * Definitions by: 01alchemist (https://twitter.com/01alchemist)
 */
declare namespace WebAssembly {
    /**
   * WebAssembly.Module
   **/
    class Module {
        public constructor (bufferSource: ArrayBuffer | Uint8Array);

        public static customSections(module: Module, sectionName: string): ArrayBuffer[];
        public static exports(module: Module): {
            name: string;
            kind: string;
        }[];
        public static imports(module: Module): {
            module: string;
            name: string;
            kind: string;
        }[];
    }

    /**
   * WebAssembly.Instance
   **/
    class Instance {
        public exports: any;
        public constructor (module: Module, importObject?: any);
    }

    /**
   * WebAssembly.Memory
   * Note: A WebAssembly page has a constant size of 65,536 bytes, i.e., 64KiB.
   **/
    interface MemoryDescriptor {
        initial: number;
        maximum?: number;
    }

    class Memory {
        public readonly buffer: ArrayBuffer;
        public constructor (memoryDescriptor: MemoryDescriptor);
        public grow(numPages: number): number;
    }

    /**
   * WebAssembly.Table
   **/
    interface TableDescriptor {
        element: "anyfunc";
        initial: number;
        maximum?: number;
    }

    class Table {
        public readonly length: number;
        public constructor (tableDescriptor: TableDescriptor);
        public get(index: number): Function;
        public grow(numElements: number): number;
        public set(index: number, value: Function): void;
    }

    /**
   * Errors
   */
    class CompileError extends Error {
        public readonly fileName: string;
        public readonly lineNumber: string;
        public readonly columnNumber: string;
        public constructor (message?: string, fileName?: string, lineNumber?: number);
        public toString(): string;
    }

    class LinkError extends Error {
        public readonly fileName: string;
        public readonly lineNumber: string;
        public readonly columnNumber: string;
        public constructor (message?: string, fileName?: string, lineNumber?: number);
        public toString(): string;
    }

    class RuntimeError extends Error {
        public readonly fileName: string;
        public readonly lineNumber: string;
        public readonly columnNumber: string;
        public constructor (message?: string, fileName?: string, lineNumber?: number);
        public toString(): string;
    }

    function compile(bufferSource: ArrayBuffer | Uint8Array): Promise<Module>;

    interface ResultObject {
        module: Module;
        instance: Instance;
    }

    function instantiate(bufferSource: ArrayBuffer | Uint8Array, importObject?: any): Promise<ResultObject>;
    function instantiate(module: Module, importObject?: any): Promise<Instance>;

    function validate(bufferSource: ArrayBuffer | Uint8Array): boolean;
}