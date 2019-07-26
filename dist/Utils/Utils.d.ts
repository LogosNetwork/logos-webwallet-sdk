/// <reference types="node" />
import { Controller as RpcController, Settings as RpcSettings } from '@logosnetwork/logos-rpc-client/dist/api';
import { Controller, Settings, Privileges } from '../TokenAccount';
export declare const minimumFee = "10000000000000000000000";
export declare const EMPTY_WORK = "0000000000000000";
export declare const GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";
export declare const MAXUINT128 = "340282366920938463463374607431768211455";
export declare const defaultRPC: {
    proxy: string;
    delegates: string[];
};
export declare const defaultMQTT = "wss://pla.bs:8443";
export declare const Iso10126: {
    pad: (dataBytes: Buffer, nBytesPerBlock: number) => Buffer;
    unpad: (dataBytes: Buffer) => Buffer;
};
export declare const convertObjectToArray: (myObject: Settings | Privileges) => string[];
export declare const deserializeController: (controller: Controller | RpcController) => Controller;
export declare const deserializeControllers: (controllers: Controller[] | RpcController[]) => Controller[];
export declare const serializeController: (controllerObject: Controller) => RpcController;
export declare const serializeControllers: (controllersObject: Controller[]) => RpcController[];
export declare const deserializeSettings: (settings: Settings | RpcSettings[]) => Settings;
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
export declare const AES: AES;
export declare const stringFromHex: (hex: string) => string;
export declare const stringToHex: (str: string) => string;
export declare const changeEndianness: (data: string) => string;
export declare const decToHex: (str: string | number, bytes?: number) => string;
export declare const hexToDec: (s: string) => string;
export declare const hexToUint8: (hex: string) => Uint8Array;
export declare const uint8ToHex: (uint8: Uint8Array) => string;
export declare const byteCount: (s: string) => number;
export declare const isAlphanumeric: (s: string) => boolean;
export declare const isAlphanumericExtended: (s: string) => boolean;
export declare const isHexKey: (hex: string) => boolean;
export declare const isLogosAccount: (account: string) => boolean;
export declare const accountFromHexKey: (hex: string) => string;
export declare const keyFromAccount: (account: string) => string;
declare const _default: {
    EMPTY_WORK: string;
    GENESIS_HASH: string;
    MAXUINT128: string;
    minimumFee: string;
    defaultRPC: {
        proxy: string;
        delegates: string[];
    };
    defaultMQTT: string;
    Iso10126: {
        pad: (dataBytes: Buffer, nBytesPerBlock: number) => Buffer;
        unpad: (dataBytes: Buffer) => Buffer;
    };
    AES: AES;
    stringFromHex: (hex: string) => string;
    stringToHex: (str: string) => string;
    decToHex: (str: string | number, bytes?: number) => string;
    hexToDec: (s: string) => string;
    hexToUint8: (hex: string) => Uint8Array;
    uint8ToHex: (uint8: Uint8Array) => string;
    changeEndianness: (data: string) => string;
    isAlphanumeric: (s: string) => boolean;
    isAlphanumericExtended: (s: string) => boolean;
    byteCount: (s: string) => number;
    deserializeController: (controller: Controller | RpcController) => Controller;
    deserializeControllers: (controllers: Controller[] | RpcController[]) => Controller[];
    deserializeSettings: (settings: Settings | RpcSettings[]) => Settings;
    serializeController: (controllerObject: Controller) => RpcController;
    serializeControllers: (controllersObject: Controller[]) => RpcController[];
    convertObjectToArray: (myObject: Settings | Privileges) => string[];
    keyFromAccount: (account: string) => string;
    accountFromHexKey: (hex: string) => string;
    isLogosAccount: (account: string) => boolean;
};
export default _default;
