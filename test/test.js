var LogosWallet = require('../')
var Wallet = LogosWallet.Wallet
var wallet = new Wallet({
  password: 'password'
})
console.log(wallet)
let encryptedWallet = wallet.encrypt()
wallet = new Wallet({
  password: 'password'
})
wallet.load(encryptedWallet)
console.log(wallet)
