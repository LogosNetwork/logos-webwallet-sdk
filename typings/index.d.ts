// Type definitions for Logos WebWallet 1.0.0
// Project: https://github.com/LogosNetwork/logos-webwallet-sdk/
// Definitions by:
//   Tyler Storm <tyler@pla.bs> (https://github.com/stormtv)
// License: MIT

declare module 'logos-webwallet-sdk' {
//#region Classes

export class Wallet {
  constructor(options?: WalletOptions)
  public walletID: string
  public batchSends: boolean
  public fullSync: boolean
  public currentAccountAddress: LogosAddress
  public seed: Hexadecimal64Length
  public rpc: RPCOptions
  public mqtt: string
  public readonly accounts: Account[]
  public readonly account: Account
  public readonly balance: string
  public readonly pendingRequests: Request[]
  public setPassword(password: string): void
  public createSeed(overwrite?: boolean): Hexadecimal64Length
  public addAccount(account: Account): Account
  public createAccount(options?: AccountOptions): Promise<Account>
  public recalculateWalletBalancesFromChain(): void
  public getRequest(hash: Hexadecimal64Length): Request | boolean
  public confirmRequest(address: LogosAddress, hash: Hexadecimal64Length): void
  public encrypt(): string
  public load(encryptedWallet: string): Promise<WalletData>
  private _decrypt(encryptedWallet: string): WalletData | boolean
  private _generateAccountOptionsFromSeed(index: number): MinimialAccount
  private _generateAccountOptionsFromPrivateKey(privateKey: Hexadecimal64Length): MinimialAccount
  private _subscribe(topic: string): void
  private _unsubscribe(topic: string): void
  private _mqttDisconnect(): void
  private _mqttConnect(): void
}

export class Account {
  constructor(options?: AccountOptions);
  public label: string
  public synced: boolean
  public readonly index: number
  public readonly previous: Hexadecimal64Length
  public readonly address: LogosAddress
  public readonly publicKey: Hexadecimal64Length
  public readonly privateKey: Hexadecimal64Length
  public readonly balance: string
  public readonly tokenBalances: TokenBalances
  public readonly pendingBalance: string
  public readonly pendingTokenBalances: TokenBalances
  public readonly representative: LogosAddress
  public readonly chain: Request[]
  public readonly recieveChain: Request[]
  public readonly pendingChain: Request[]
  public readonly requestCount: number
  public readonly pendingRequestCount: number
  public readonly recieveCount: number
  public sync(options: RPCOptions): Promise<Account>
  public updateBalancesFromChain(): void
  public updateBalancesFromRequest(request: Request): void
  public addRequest(requestInfo: RequestOptions): Request
  public verifyChain(): boolean
  public verifyRecieveChain(): boolean
  public recentRequests(count?: number, offset?: number): Request[]
  public recentPendingRequests(count?: number, offset?: number): Request[]
  public recentReceiveRequests(count?: number, offset?: number): Request[]
  public getRequestsUpTo(hash: Hexadecimal64Length): Request[]
  public getPendingRequestsUpTo(hash: Hexadecimal64Length): Request[]
  public getReceiveRequestsUpTo(hash: Hexadecimal64Length): Request[]
  public removePendingRequests(): void
  public removePendingRequest(hash: Hexadecimal64Length): boolean
  public getRequest(hash: Hexadecimal64Length): Request
  public getChainRequest(hash: Hexadecimal64Length): Request
  public getPendingRequest(hash: Hexadecimal64Length): boolean | Request
  public getRecieveRequest(hash: Hexadecimal64Length): boolean | Request
  public confirmRequest(hash: Hexadecimal64Length, rpc: RPCOptions | boolean): void
  public createSendRequest(transactions: Transaction[]): Promise<Request>
  public processRequest(requestInfo: MQTTRequestOptions): Promise<void>
  public combineRequests(): Promise<void>
  public addReceiveRequest(request: MQTTRequestOptions): boolean | Request
}

export class Request {
  constructor(options?: RequestOptions);
  public signature: Hexadecimal64Length
  public work: Hexadecimal16Length
  public previous: Hexadecimal64Length
  public fee: string
  public sequence: number
  public hash: Hexadecimal64Length
  public readonly origin: Hexadecimal64Length
  public createWork(testNet?: boolean): Hexadecimal16Length
  public setOrigin(address: LogosAddress): void
  public sign(privateKey: Hexadecimal64Length): boolean
  public verify(): boolean
  public publish(options: RPCOptions): Promise<Hexadecimal64Length>
}
//#endregion

//#region Typedefs

type WalletOptions = {
  password: string
  seed?: Hexadecimal64Length
  deterministicKeyIndex?: number
  currentAccountAddress?: LogosAddress
  accounts?: Map<LogosAddress, Account>
  walletID?: string
  remoteWork?: boolean
  batchSends?: boolean
  fullSync?: boolean
  mqtt?: string
  rpc?: RPCOptions
  version?: number
};

type AccountOptions = {
  label?: string
  address?: LogosAddress
  publicKey?: Hexadecimal64Length
  privateKey?: Hexadecimal64Length
  previous?: Hexadecimal64Length
  sequence?: number
  balance?: string | number
  tokenBalances?: TokenBalances
  pendingBalance?: string | number
  pendingTokenBalances?: TokenBalances
  representative?: LogosAddress
  chain?: Request[]
  pendingChain?: Request[]
  receiveChain?: Request[]
  remoteWork?: boolean
  batchSends?: boolean
  fullSync?: boolean
  rpc?: RPCOptions
  version?: number
  index?: number
};

type TokenBalances = Map<Hexadecimal64Length, string | number>

type Transaction = {
  destination: LogosAddress
  amount: string
}

type RequestOptions = {
  origin?: LogosAddress
  previous?: Hexadecimal64Length
  sequence?: string
  fee?: string
  signature?: Hexadecimal64Length
  work?: Hexadecimal16Length
};

type SendOptions = {
  origin?: LogosAddress
  previous?: Hexadecimal64Length
  sequence?: string
  fee?: string
  signature?: Hexadecimal64Length
  work?: Hexadecimal16Length
  transactions?: Transaction[]
};

type RequestJSON = string
// This object is the JSON string
// {
//   type: string
//   previous: Hexadecimal64Length
//   link: Hexadecimal64Length
//   representative: Hexadecimal64Length
//   fee: string | number
//   signature: Hexadecimal64Length
//   account: Hexadecimal64Length
//   amount: string
//   work: Hexadecimal16Length
// }

type WalletData = {
  seed?: Hexadecimal64Length
  deterministicKeyIndex?: number
  version?: number
  walletID?: string | boolean
  accounts?: MinimialAccount[]
}

type MinimialAccount = {
  privateKey?: Hexadecimal64Length
  publicKey?: Hexadecimal64Length
  address?: LogosAddress
  index?: number
  label?: string
}

type MQTTRequestOptions = {
  type: string
  origin: LogosAddress
  previous: Hexadecimal64Length
  representative: LogosAddress
  amount: string
  fee: string
  link: Hexadecimal64Length
  link_as_account: LogosAddress
  signature: string
  work: Hexadecimal16Length
  timestamp: string
  hash: Hexadecimal64Length
}

type RPCOptions = {
  proxy?: string,
  delegates: string[]
}

type Hexadecimal64Length = string
type Hexadecimal16Length = string
type LogosAddress = string

//#endregion
}
