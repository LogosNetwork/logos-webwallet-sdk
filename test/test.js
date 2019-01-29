const LogosWallet = require('../')
const Wallet = LogosWallet.Wallet
let wallet = new Wallet({
  password: 'password',
  seed: '6F9BD621FDED3C2FB3A2DA8B75C4B6B4ADFE3DF8809B74F8EFF44DDC1120CACA',
  mqtt: false
})
wallet.createAccount()
console.log(wallet)
