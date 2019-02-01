# logos-webwallet-sdk

Creates Logos wallets without full nodes

## Installation
```
npm i @logosnetwork/logos-webwallet-sdk
```

## Usage

```
const LogosWallet = require('@logosnetwork/logos-webwallet-sdk')
const Wallet = LogosWallet.Wallet
let wallet = new Wallet({
  password: 'password' // Make this strong
})
let account = await wallet.createAccount({
  index: 0
})
console.log(account)
await account.createBlock('lgs_3e3j5tkog48pnny9dmfzj1r16pg8t1e76dz5tmac6iq689wyjfpiij4txtdo', '1000000000000000000000000000000', true, wallet.rpc)
```


## Documentation

Coming Soon