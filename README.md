# logos-webwallet-sdk

Creates Logos wallets without full nodes

## Installation

```
yarn add logos-webwallet-sdk
```

or

```
npm install --save logos-webwallet-sdk
```

## Usage

### ES5

```
var LogosWallet = require('logos-webwallet-sdk');
var Wallet = LogosWallet.Wallet;
```

### ES6

```
import { Wallet } from 'logos-webwallet-sdk';
const wallet = new Wallet('password');
```

## Development

In this directory:

```
yarn link
```

In the directory you are working with `logos-webwallet-sdk`:

```
yarn link logos-webwallet-sdk
```
