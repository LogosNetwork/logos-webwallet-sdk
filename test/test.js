let create = async () => {
  // const LogosWallet = require('../')
  // const Wallet = LogosWallet.Wallet
  // let wallet = new Wallet({
  //   password: 'password',
  //   fullSync: true
  // })
  // let account = await wallet.createAccount({
  //   privateKey: '872C745C3401354C6BF4BFD869CCC2B8382736DA68BF6D7A23AF01AAFDD67700'
  // })

  // await account.createTokenIssuanceRequest({
  //   name: 'AnotherNewCoin',
  //   symbol: 'NC',
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

  // await account.createSendRequest([{
  //   destination: 'lgs_3zeis94j83oaozmmxa3rse1skbyetu3sgzf47ts43eobatn9trznpn4kigzh',
  //   amount: '1000000000000000000000000000000'
  // }])

  // await account.createSendRequest([{
  //   destination: 'lgs_1ypa5i4c1srejgreg1ukqmsp1166g477diob3rchsujrh6jqjd8memwrsti3',
  //   amount: '1000000000000000000000000000000'
  // }])

  // await account.createAdjustUserStatusRequest({
  //   tokenAccount: 'lgs_3zeis94j83oaozmmxa3rse1skbyetu3sgzf47ts43eobatn9trznpn4kigzh',
  //   account: 'lgs_3mjbkiwijkbt3aqz8kzm5nmsfhtrbjwkmnyeqi1aoscc46t4xdnfdaunerr6',
  //   status: 'whitelisted'
  // })

  // await account.createAdjustUserStatusRequest({
  //   tokenAccount: 'lgs_3zeis94j83oaozmmxa3rse1skbyetu3sgzf47ts43eobatn9trznpn4kigzh',
  //   account: 'lgs_1ypa5i4c1srejgreg1ukqmsp1166g477diob3rchsujrh6jqjd8memwrsti3',
  //   status: 'whitelisted'
  // })

  // await account.createDistributeRequest({
  //   tokenAccount: 'lgs_3zeis94j83oaozmmxa3rse1skbyetu3sgzf47ts43eobatn9trznpn4kigzh',
  //   transaction: {
  //     destination: 'lgs_3mjbkiwijkbt3aqz8kzm5nmsfhtrbjwkmnyeqi1aoscc46t4xdnfdaunerr6',
  //     amount: '1000000000000000000000000000000'
  //   }
  // })

  // await account.createTokenSendRequest({
  //   tokenAccount: 'lgs_3zeis94j83oaozmmxa3rse1skbyetu3sgzf47ts43eobatn9trznpn4kigzh',
  //   transactions: [
  //     {
  //       destination: 'lgs_3mjbkiwijkbt3aqz8kzm5nmsfhtrbjwkmnyeqi1aoscc46t4xdnfdaunerr6',
  //       amount: '1000000000000000'
  //     }
  //   ]
  // })

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
  //   tokenAccount: 'lgs_3zeis94j83oaozmmxa3rse1skbyetu3sgzf47ts43eobatn9trznpn4kigzh',
  //   feeRate: '1000000000',
  //   feeType: 'flat'
  // })

  // await account.createUpdateIssuerInfoRequest({
  //   tokenAccount: 'lgs_3zeis94j83oaozmmxa3rse1skbyetu3sgzf47ts43eobatn9trznpn4kigzh',
  //   issuerInfo: '{"image":"https://s2.coinmarketcap.com/static/img/coins/64x64/1.png","decimals":"30","website":"https://www.logos.network/"}'
  // })

  // await account.createUpdateControllerRequest({
  //   tokenAccount: 'lgs_3zeis94j83oaozmmxa3rse1skbyetu3sgzf47ts43eobatn9trznpn4kigzh',
  //   action: 'add',
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
  //   tokenAccount: 'lgs_3zeis94j83oaozmmxa3rse1skbyetu3sgzf47ts43eobatn9trznpn4kigzh',
  //   amount: '1000000000000000000000000000000'
  // })

  // await account.createIssueAdditionalRequest({
  //   tokenAccount: 'lgs_3zeis94j83oaozmmxa3rse1skbyetu3sgzf47ts43eobatn9trznpn4kigzh',
  //   amount: '10000'
  // })

  // await account.createWithdrawFeeRequest({
  //   tokenAccount: 'lgs_3zeis94j83oaozmmxa3rse1skbyetu3sgzf47ts43eobatn9trznpn4kigzh',
  //   transaction: {
  //     destination: 'lgs_3mjbkiwijkbt3aqz8kzm5nmsfhtrbjwkmnyeqi1aoscc46t4xdnfdaunerr6',
  //     amount: '10000'
  //   }
  // })
}
create()
