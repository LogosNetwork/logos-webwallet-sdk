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
    public currentAccountAddress: LogosAddress
    public seed: Hexadecimal64Length
		public readonly accounts: Account[]
		public readonly account: Account
		public readonly balance: string
    public readonly pendingBlocks: Block[]
    public setPassword(password: string): void
		public createSeed(overwrite?: boolean): Hexadecimal64Length
		public addAccount(account: Account): Account
		public createAccount(options?: AccountOptions): Account
		public recalculateWalletBalancesFromChain(): void
		public getBlock(hash: Hexadecimal64Length): Block | boolean
		public confirmBlock(account: LogosAddress, hash: Hexadecimal64Length): void
		public encrypt(): string
		public load(encryptedWallet: string): WalletData
		private _decrypt(encryptedWallet: string): WalletData | boolean
		private _generateAccountOptionsFromSeed(index: number): MinimialAccount
		private _generateAccountOptionsFromPrivateKey(privateKey: Hexadecimal64Length): MinimialAccount
	}

	export class Account {
    constructor(options?: AccountOptions);
    public label: string
    public readonly index: number
    public readonly previous: Hexadecimal64Length
    public readonly address: LogosAddress
    public readonly publicKey: Hexadecimal64Length
    public readonly privateKey: Hexadecimal64Length
    public readonly balance: string
    public readonly pendingBalance: string
    public readonly representative: LogosAddress
    public readonly chain: Block[]
    public readonly recieveChain: Block[]
    public readonly pendingChain: Block[]
    public readonly blockCount: number
    public readonly pendingBlockCount: number
    public readonly recieveCount: number
		public updateBalancesFromChain(): void
		public verifyChain(): boolean
		public verifyRecieveChain(): boolean
		public recentBlocks(count?: number, offset?: number): Block[]
		public recentPendingBlocks(count?: number, offset?: number): Block[]
		public recentReceiveBlocks(count?: number, offset?: number): Block[]
		public getBlocksUpTo(hash: Hexadecimal64Length): Block[]
		public getPendingBlocksUpTo(hash: Hexadecimal64Length): Block[]
		public getReceiveBlocksUpTo(hash: Hexadecimal64Length): Block[]
		public removePendingBlocks(): void
		public removePendingBlock(hash: Hexadecimal64Length): boolean
		public getBlock(hash: Hexadecimal64Length): Block
		public createBlock(to: LogosAddress, amount?: string, remoteWork?: boolean): Block
		public getPendingBlock(hash: Hexadecimal64Length): boolean | Block
		public confirmBlock(hash: Hexadecimal64Length): void
	}

	export class Block {
		constructor(options?: BlockOptions);
    public signature: Hexadecimal64Length
    public readonly hash: Hexadecimal64Length
    public work: Hexadecimal16Length
    public amount: string
    public previous: Hexadecimal64Length
    public transactionFee: string
    public readonly representative: Hexadecimal64Length
    public readonly destination: Hexadecimal64Length
    public readonly account: Hexadecimal64Length
    public createWork(testNet?: boolean): Hexadecimal16Length
    public setRepresentative(account: LogosAddress): void
    public setDestination(account: LogosAddress): void
    public setAccount(account: LogosAddress): void
		public sign(privateKey: Hexadecimal64Length): void
		public verify(): boolean
		public toJSON(pretty?: boolean): BlockJSON
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
    version?: number
    remoteWork?: boolean
  };

  type AccountOptions = {
    label?: string
    address?: LogosAddress
    publicKey?: Hexadecimal64Length
    privateKey?: Hexadecimal64Length
    balance?: string | number
    pendingBalance?: string | number
    representative?: LogosAddress
    chain?: Block[]
    receiveChain?: Block[]
    pendingChain?: Block[]
    previous?: Hexadecimal64Length
    version?: number
    index?: number
  };

  type BlockOptions = {
    signature?: Hexadecimal64Length
    work?: Hexadecimal16Length
    amount?: string
    previous?: Hexadecimal64Length
    transactionFee?: string
    representative?: LogosAddress
    destination?: LogosAddress
    account?: LogosAddress
  };

  type BlockJSON = string
  // This object is the JSON string
  // {
  //   type: string
  //   previous: Hexadecimal64Length
  //   link: Hexadecimal64Length
  //   representative: Hexadecimal64Length
  //   transactionFee: string | number
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

	type Hexadecimal64Length = string
	type Hexadecimal16Length = string
	type LogosAddress = string

//#endregion
}
