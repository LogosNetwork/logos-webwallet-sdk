// {
//   "account": "lgs_3e3j5tkog48pnny9dmfzj1r16pg8t1e76dz5tmac6iq689wyjfpiij4txtdo",
//   "previous": "0000000000000000000000000000000000000000000000000000000000000000",
//   "sequence": "0",
//   "transaction_type": "send",
//   "transaction_fee": "0",
//   "signature": "B9102BBECB89D3E3B2EDCB7D09D76C07B51DB99760464CBB8F60829B907FF1504567F33414FC37270E9EB04F06BD7A41ADE2661B8C9AABAFEF3C90F78829A401",
//   "number_transactions": "1",
//   "transactions": [
//    {
//     "target": "lgs_3e3j5tkog48pnny9dmfzj1r16pg8t1e76dz5tmac6iq689wyjfpiij4txtdo",
//     "amount": "340282366920938463463374607431768211455"
//    }
//   ],
//   "hash": "87769D2FDDAB0E8C85B2D3EEBD8527CF8FC958AECFE9BEC372130A914C2697E6",
//   "timestamp": "0"
//  }

// const nacl = require('tweetnacl/nacl')
// let keys = nacl.sign.keyPair.fromSecretKey(Utils.hexToUint8('34F0A37AAD20F4A260F0A5B3CB3D7FB50673212263E58A380BC10474BB039CE4'))
// console.log(Utils.uint8ToHex(keys.publicKey))
// console.log(Utils.uint8ToHex(keys.secretKey))
// console.log('------------------------------')

// const Utils = require('../src/Utils')
// let create = async () => {
//   const LogosWallet = require('../')
//   const Wallet = LogosWallet.Wallet
//   let wallet = new Wallet({
//     password: 'password'
//   })
//   let account = await wallet.createAccount({
//     privateKey: '6D1B166DDEA7BEC8AA2F8B914E539CF93739C38B622E3F36BC2FB3FB7FDDE6DD'
//   })
//   console.log(account.privateKey)
//   console.log(account.address)
//   console.log(Utils.keyFromAccount(account.address))
//   console.log(account.balance)
// }
// create()

// const Utils = require('../src/Utils')
// const nacl = require('tweetnacl/nacl')
// let hash = '92997BBEE52E67FC2A73A2D276292D5BD68368F3DBE40B0122397E3BEE5F11AF'
// let signature = '919AE8A455FA7AAD1183280DC8100A3EEE8032EC34726FC080B03A48DADC994D7656FC0A62C44D1159D5B4483619833E3AC4981B052B6CA0E8DDF8B5BC90070F'
// let publicKey = Utils.keyFromAccount('lgs_3e3j5tkog48pnny9dmfzj1r16pg8t1e76dz5tmac6iq689wyjfpiij4txtdo')
// console.log(hash)
// console.log(signature)
// console.log(publicKey)
// let result = nacl.sign.detached.verify(
//   Utils.hexToUint8(hash),
//   Utils.hexToUint8(signature),
//   Utils.hexToUint8(publicKey)
// )
// console.log(result)
