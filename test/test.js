const LogosWallet = require('../')
const Wallet = LogosWallet.Wallet

let create = async () => {
  let wallet = new Wallet({
    password: 'password',
    fullSync: false,
    mqtt: 'ws:localhost:8883',
    batchSends: false
  })
  let account = await wallet.createAccount({
    privateKey: '872C745C3401354C6BF4BFD869CCC2B8382736DA68BF6D7A23AF01AAFDD67700'
  })

  // await account.createTokenIssuanceRequest({
  //   name: 'Railblocks',
  //   symbol: 'RAI',
  //   issuerInfo: '{"image":"https://cryptocalendar.pro/img/coin_icons/128x128/raiblocks.png","decimals":"30","website":"https://www.raiblocks.net/"}',
  //   settings: {
  //     issuance: false,
  //     modify_issuance: false,
  //     revoke: false,
  //     modify_revoke: false,
  //     freeze: false,
  //     modify_freeze: false,
  //     adjust_fee: true,
  //     modify_adjust_fee: true,
  //     whitelist: false,
  //     modify_whitelist: false
  //   },
  //   controllers: [{
  //     account: 'lgs_3mjbkiwijkbt3aqz8kzm5nmsfhtrbjwkmnyeqi1aoscc46t4xdnfdaunerr6',
  //     change_issuance: false,
  //     change_modify_issuance: false,
  //     change_revoke: false,
  //     change_modify_revoke: false,
  //     change_freeze: false,
  //     change_modify_freeze: false,
  //     change_adjust_fee: true,
  //     change_modify_adjust_fee: false,
  //     change_whitelist: false,
  //     change_modify_whitelist: false,
  //     issuance: false,
  //     revoke: false,
  //     freeze: false,
  //     adjust_fee: true,
  //     whitelist: false,
  //     update_issuer_info: true,
  //     update_controller: true,
  //     burn: false,
  //     distribute: true,
  //     withdraw_fee: true
  //   }]
  // })

  // await account.createDistributeRequest({
  //   tokenAccount: 'lgs_34i1uyene47uksqp7t8wes3aib5e9yf5kfkz7xy7nmowmmoffr4s39xrq1zj',
  //   transaction: {
  //     destination: 'lgs_3mjbkiwijkbt3aqz8kzm5nmsfhtrbjwkmnyeqi1aoscc46t4xdnfdaunerr6',
  //     amount: '100000000000000000000000000000000'
  //   }
  // })

  // await account.createSendRequest([{
  //   destination: 'lgs_34i1uyene47uksqp7t8wes3aib5e9yf5kfkz7xy7nmowmmoffr4s39xrq1zj',
  //   amount: '1000000000000000000000000000000'
  // }])

  // await account.createAdjustUserStatusRequest({
  //   tokenAccount: 'lgs_1eg8cmt5dz3ntgqz1qi6964u7zr7r7wtoi5ih9jp5ng99pfy34qhkqx9s1k1',
  //   account: 'lgs_17cb9nxouwcd16dfr53xd3km8aheko3taf6zhyqu18j59ng786yoprb8gqns',
  //   status: 'whitelisted'
  // })

  // for (let i = 0; i < 10; i++) {
  //   await account.createTokenSendRequest({
  //     tokenAccount: 'lgs_34i1uyene47uksqp7t8wes3aib5e9yf5kfkz7xy7nmowmmoffr4s39xrq1zj',
  //     transactions: [
  //       {
  //         destination: 'lgs_17cb9nxouwcd16dfr53xd3km8aheko3taf6zhyqu18j59ng786yoprb8gqns',
  //         amount: '10000'
  //       }
  //     ]
  //   })
  // }

  // Invalid to send to token account?
  // await account.createTokenSendRequest({
  //   tokenAccount: 'lgs_3zeis94j83oaozmmxa3rse1skbyetu3sgzf47ts43eobatn9trznpn4kigzh',
  //   transactions: [
  //     {
  //       destination: 'lgs_3zm5igpgy657hotwfxkfq9utjxb11j9k4y7iuqb91f6xxaf3kkgu3ugd59ab',
  //       amount: '1000000000000000'
  //     }
  //   ]
  // })

  // await account.createChangeSettingRequest({
  //   tokenAccount: 'lgs_3zeis94j83oaozmmxa3rse1skbyetu3sgzf47ts43eobatn9trznpn4kigzh',
  //   setting: 'whitelist',
  //   value: false
  // })

  // await account.createChangeSettingRequest({
  //   tokenAccount: 'lgs_3zeis94j83oaozmmxa3rse1skbyetu3sgzf47ts43eobatn9trznpn4kigzh',
  //   setting: 'whitelist',
  //   value: true
  // })

  // await account.createImmuteSettingRequest({
  //   tokenAccount: 'lgs_3zeis94j83oaozmmxa3rse1skbyetu3sgzf47ts43eobatn9trznpn4kigzh',
  //   setting: 'issuance'
  // })

  // TODO Broken - ???
  // await account.createRevokeRequest({
  //   tokenAccount: 'lgs_3zeis94j83oaozmmxa3rse1skbyetu3sgzf47ts43eobatn9trznpn4kigzh',
  //   source: 'lgs_3mjbkiwijkbt3aqz8kzm5nmsfhtrbjwkmnyeqi1aoscc46t4xdnfdaunerr6',
  //   transaction: {
  //     destination: 'lgs_1ypa5i4c1srejgreg1ukqmsp1166g477diob3rchsujrh6jqjd8memwrsti3',
  //     amount: '100000'
  //   }
  // })

  // await account.createAdjustFeeRequest({
  //   tokenAccount: 'lgs_34i1uyene47uksqp7t8wes3aib5e9yf5kfkz7xy7nmowmmoffr4s39xrq1zj',
  //   feeRate: '1000000000000000000000000000000',
  //   feeType: 'flat'
  // })

  // await account.createUpdateIssuerInfoRequest({
  //   tokenAccount: 'lgs_1eg8cmt5dz3ntgqz1qi6964u7zr7r7wtoi5ih9jp5ng99pfy34qhkqx9s1k1',
  //   issuerInfo: '{"image":"https://pbs.twimg.com/profile_images/1078394218689765383/tt_XD0KW_bigger.jpg","decimals":"30","website":"https://brainblocks.io/"}'
  // })

  // await account.createUpdateControllerRequest({
  //   tokenAccount: 'lgs_1eg8cmt5dz3ntgqz1qi6964u7zr7r7wtoi5ih9jp5ng99pfy34qhkqx9s1k1',
  //   action: 'remove',
  //   controller: {
  //     account: 'lgs_1ypa5i4c1srejgreg1ukqmsp1166g477diob3rchsujrh6jqjd8memwrsti3',
  //     change_issuance: true,
  //     change_modify_issuance: false,
  //     change_revoke: false,
  //     change_modify_revoke: false,
  //     change_freeze: false,
  //     change_modify_freeze: false,
  //     change_adjust_fee: false,
  //     change_modify_adjust_fee: false,
  //     change_whitelist: false,
  //     change_modify_whitelist: false,
  //     issuance: false,
  //     revoke: false,
  //     freeze: false,
  //     adjust_fee: false,
  //     whitelist: false,
  //     update_issuer_info: false,
  //     update_controller: false,
  //     burn: false,
  //     distribute: false,
  //     withdraw_fee: false
  //   }
  // })

  // await account.createBurnRequest({
  //   tokenAccount: 'lgs_1zcuehdr5k1cmzc65kcapmqwjzk9xroijz1tn9f4omgy947mj8huqh8c9b3n',
  //   amount: '100000'
  // })

  // await account.createIssueAdditionalRequest({
  //   tokenAccount: 'lgs_3zeis94j83oaozmmxa3rse1skbyetu3sgzf47ts43eobatn9trznpn4kigzh',
  //   amount: '10000'
  // })

  // await account.createWithdrawFeeRequest({
  //   tokenAccount: 'lgs_1zcuehdr5k1cmzc65kcapmqwjzk9xroijz1tn9f4omgy947mj8huqh8c9b3n',
  //   transaction: {
  //     destination: 'lgs_3mjbkiwijkbt3aqz8kzm5nmsfhtrbjwkmnyeqi1aoscc46t4xdnfdaunerr6',
  //     amount: '10000'
  //   }
  // })
}
create()
