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

let create = async () => {
  const LogosWallet = require('../')
  const Wallet = LogosWallet.Wallet
  let wallet = new Wallet({
    password: 'password',
    fullSync: false
  })
  let account = await wallet.createAccount({
    privateKey: '872C745C3401354C6BF4BFD869CCC2B8382736DA68BF6D7A23AF01AAFDD67700'
  })
  console.log(account.balance)
  // account.createSendRequest([{
  //   destination: 'lgs_1z78k8wo6nthic4seqtxfx8j4m44apk4e3coccohyjmesmzaf1w3wwzm4x7k',
  //   amount: '1000000000000000000000000000000'
  // }])

  // account.createTokenIssuanceRequest({
  //   name: 'FullPermissionCoin',
  //   symbol: 'FP',
  //   issuerInfo: 'I have full control of this coin',
  //   settings: {
  //     issuance: true,
  //     modify_issuance: true,
  //     revoke: true,
  //     modify_revoke: true,
  //     freeze: true,
  //     modify_freeze: true,
  //     adjust_fee: true,
  //     modify_adjust_fee: true,
  //     whitelist: true,
  //     modify_whitelist: true
  //   },
  //   controllers: [{
  //     account: 'lgs_3mjbkiwijkbt3aqz8kzm5nmsfhtrbjwkmnyeqi1aoscc46t4xdnfdaunerr6',
  //     change_issuance: true,
  //     change_modify_issuance: true,
  //     change_revoke: true,
  //     change_modify_revoke: true,
  //     change_freeze: true,
  //     change_modify_freeze: true,
  //     change_adjust_fee: true,
  //     change_modify_adjust_fee: true,
  //     change_whitelist: true,
  //     change_modify_whitelist: true,
  //     issuance: true,
  //     revoke: true,
  //     freeze: true,
  //     adjust_fee: true,
  //     whitelist: true,
  //     update_issuer_info: true,
  //     update_controller: true,
  //     burn: true,
  //     distribute: true,
  //     withdraw_fee: true
  //   }]
  // })

  // account.createDistributeTokenRequest({
  //   tokenID: 'B7438C6BB8145AC5ABE2852FEC0DC4772AAA1338F23DA8D7CE0D84DB5C09B8EC',
  //   transaction: {
  //     destination: 'lgs_134fyzk9kxp5tkm7pte7ttb3bhwedm8za4qqagyeu4r64jowybmuy8dkjk1u',
  //     amount: '1000000000000000000000000000000'
  //   }
  // })
}
create()

// const Utils = require('../src/Utils')
// const nacl = require('tweetnacl/nacl')
// let hash = 'AB1D7496D49B37D058770647E208211038538A5FB15ADA11F0E434824BC7E526'
// let signature = 'F9449BD3D71460E9536015DAB56FFE6C1A734670FD9D0DC7E95D03D5978A796045DDD58DB2AC05DAB665358AD312B72C49182F9E79A9AF7B36B1014179D65005'
// let publicKey = Utils.keyFromAccount('lgs_3doxa7dnodj97thewjxycxhdrki4g9pdk9e5wzg7techfke8tphk935poer8')
// console.log(hash)
// console.log(signature)
// console.log(publicKey)
// let result = nacl.sign.detached.verify(
//   Utils.hexToUint8(hash),
//   Utils.hexToUint8(signature),
//   Utils.hexToUint8(publicKey)
// )
// console.log(result)

// AA0AA31A4686BD44ED3A6247EEBFD450D49F78662940558C1C7BEC260BA99C15
// lgs_3q9a53g4uznbpbhsz3nryezg6gq71ois4o5ym4fk6zej5wbggtd1bso5gcpg
