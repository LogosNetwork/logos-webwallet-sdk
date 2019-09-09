# logos-webwallet-sdk

Creates Logos wallets without full nodes

## Installation
```
npm i @logosnetwork/logos-webwallet-sdk
```

## Classes Documentation
 * [Wallet](https://logosnetwork.github.io/logos-webwallet-sdk/classes/_wallet_.wallet.html)
 * [LogosAccount](https://logosnetwork.github.io/logos-webwallet-sdk/classes/_logosaccount_.logosaccount.html)
 * [TokenAccount](https://logosnetwork.github.io/logos-webwallet-sdk/classes/_tokenaccount_.tokenaccount.html)
 * [AdjustFee](https://logosnetwork.github.io/logos-webwallet-sdk/classes/_requests_adjustfee_.adjustfee.html)
 * [AdjustUserStatus](https://logosnetwork.github.io/logos-webwallet-sdk/classes/_requests_adjustuserstatus_.adjustuserstatus.html)
 * [Burn](https://logosnetwork.github.io/logos-webwallet-sdk/classes/_requests_burn_.burn.html)
 * [ChangeSetting](https://logosnetwork.github.io/logos-webwallet-sdk/classes/_requests_changesetting_.changesetting.html)
 * [Distribute](https://logosnetwork.github.io/logos-webwallet-sdk/classes/_requests_distribute_.distribute.html)
 * [ImmuteSetting](https://logosnetwork.github.io/logos-webwallet-sdk/classes/_requests_immutesetting_.immutesetting.html)
 * [Issuance](https://logosnetwork.github.io/logos-webwallet-sdk/classes/_requests_issuance_.issuance.html)
 * [IssueAdditional](https://logosnetwork.github.io/logos-webwallet-sdk/classes/_requests_issueadditional_.issueadditional.html)
 * [Revoke](https://logosnetwork.github.io/logos-webwallet-sdk/classes/_requests_revoke_.revoke.html)
 * [Send](https://logosnetwork.github.io/logos-webwallet-sdk/classes/_requests_send_.send.html)
 * [TokenSend](https://logosnetwork.github.io/logos-webwallet-sdk/classes/_requests_tokensend_.tokensend.html)
 * [UpdateController](https://logosnetwork.github.io/logos-webwallet-sdk/classes/_requests_updatecontroller_.updatecontroller.html)
 * [UpdateIssuerInfo](https://logosnetwork.github.io/logos-webwallet-sdk/classes/_requests_updateissuerinfo_.updateissuerinfo.html)
 * [WithdrawFee](https://logosnetwork.github.io/logos-webwallet-sdk/classes/_requests_withdrawfee_.withdrawfee.html)
 * [WithdrawLogos](https://logosnetwork.github.io/logos-webwallet-sdk/classes/_requests_withdrawlogos_.withdrawlogos.html)

## Quick Examples

### Sending Logos
```js
const SDK = require('@logosnetwork/logos-webwallet-sdk')
const wallet = new SDK.Wallet({
  password: 'password' // Make this strong
})
wallet.createAccount({
  privateKey: '34F0A37AAD20F4A260F0A5B3CB3D7FB50673212263E58A380BC10474BB039CE4'
}).then((account) => {
  account.createSendRequest([{
    destination: 'lgs_3mjbkiwijkbt3aqz8kzm5nmsfhtrbjwkmnyeqi1aoscc46t4xdnfdaunerr6',
    amount: '300000000000000000000000000000'
  }])
})
```

### Creating a Token
```js
const SDK = require('@logosnetwork/logos-webwallet-sdk')
const wallet = new SDK.Wallet({
  password: 'password' // Make this strong
})
wallet.createAccount({
  privateKey: '34F0A37AAD20F4A260F0A5B3CB3D7FB50673212263E58A380BC10474BB039CE4'
}).then((account) => {
  account.createTokenIssuanceRequest({
    name: `UnitTestCoin`,
    symbol: `UTC`,
    totalSupply: '1000',
    feeRate: '1',
    issuerInfo: '{"decimals":0,"website":"https://github.com/LogosNetwork/logos-webwallet-sdk"}',
    settings: {
      issuance: true,
      modify_issuance: true,
      revoke: true,
      modify_revoke: true,
      freeze: true,
      modify_freeze: true,
      adjust_fee: true,
      modify_adjust_fee: true,
      whitelist: false,
      modify_whitelist: true
    },
    controllers: [{
      account: 'lgs_3e3j5tkog48pnny9dmfzj1r16pg8t1e76dz5tmac6iq689wyjfpiij4txtdo',
      privileges: {
        change_issuance: true,
        change_modify_issuance: true,
        change_revoke: true,
        change_modify_revoke: true,
        change_freeze: true,
        change_modify_freeze: true,
        change_adjust_fee: true,
        change_modify_adjust_fee: true,
        change_whitelist: true,
        change_modify_whitelist: true,
        issuance: true,
        revoke: true,
        freeze: true,
        adjust_fee: true,
        whitelist: true,
        update_issuer_info: true,
        update_controller: true,
        burn: true,
        distribute: true,
        withdraw_fee: true,
        withdraw_logos: true
      }
    }]
  })
})
```
