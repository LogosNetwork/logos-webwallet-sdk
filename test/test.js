let create = async () => {
  // const LogosWallet = require('../')
  // const Wallet = LogosWallet.Wallet
  // let wallet = new Wallet({
  //   password: 'password',
  //   fullSync: false
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
  //     freeze: false,
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
  //   destination: 'lgs_39tqbdtibuggsswhbsex1qw7jqpmpw5quyb9p5gjbwindix5snc6edtwbqmm',
  //   amount: '1000000000000000000000000000000'
  // }])

  // await account.createAdjustUserStatusRequest({
  //   tokenAccount: 'lgs_39tqbdtibuggsswhbsex1qw7jqpmpw5quyb9p5gjbwindix5snc6edtwbqmm',
  //   account: 'lgs_3mjbkiwijkbt3aqz8kzm5nmsfhtrbjwkmnyeqi1aoscc46t4xdnfdaunerr6',
  //   status: 'whitelisted'
  // })

  // await account.createDistributeRequest({
  //   tokenAccount: 'lgs_39tqbdtibuggsswhbsex1qw7jqpmpw5quyb9p5gjbwindix5snc6edtwbqmm',
  //   transaction: {
  //     destination: 'lgs_3mjbkiwijkbt3aqz8kzm5nmsfhtrbjwkmnyeqi1aoscc46t4xdnfdaunerr6',
  //     amount: '1000000000000000000000000000000'
  //   }
  // })

  // TODO Broken
  // await account.createTokenSendRequest({
  //   tokenAccount: 'lgs_39tqbdtibuggsswhbsex1qw7jqpmpw5quyb9p5gjbwindix5snc6edtwbqmm',
  //   transactions: [
  //     {
  //       destination: 'lgs_1ypa5i4c1srejgreg1ukqmsp1166g477diob3rchsujrh6jqjd8memwrsti3',
  //       amount: '1000000'
  //     }
  //   ]
  // })

  // await account.createChangeSettingRequest({
  //   tokenAccount: 'lgs_39tqbdtibuggsswhbsex1qw7jqpmpw5quyb9p5gjbwindix5snc6edtwbqmm',
  //   setting: 'whitelist',
  //   value: false
  // })

  // await account.createChangeSettingRequest({
  //   tokenAccount: 'lgs_39tqbdtibuggsswhbsex1qw7jqpmpw5quyb9p5gjbwindix5snc6edtwbqmm',
  //   setting: 'whitelist',
  //   value: true
  // })

  // TODO Broken
  // await account.createImmuteSettingRequest({
  //   tokenAccount: 'lgs_39tqbdtibuggsswhbsex1qw7jqpmpw5quyb9p5gjbwindix5snc6edtwbqmm',
  //   setting: 'modify_issuance'
  // })

  // TODO Broken
  // await account.createRevokeRequest({
  //   tokenAccount: 'lgs_39tqbdtibuggsswhbsex1qw7jqpmpw5quyb9p5gjbwindix5snc6edtwbqmm',
  //   source: 'lgs_1ypa5i4c1srejgreg1ukqmsp1166g477diob3rchsujrh6jqjd8memwrsti3',
  //   transaction: {
  //     destination: 'lgs_3mjbkiwijkbt3aqz8kzm5nmsfhtrbjwkmnyeqi1aoscc46t4xdnfdaunerr6',
  //     amount: '10000'
  //   }
  // })

  // await account.createAdjustFeeRequest({
  //   tokenAccount: 'lgs_39tqbdtibuggsswhbsex1qw7jqpmpw5quyb9p5gjbwindix5snc6edtwbqmm',
  //   feeRate: '10000',
  //   feeType: 'flat'
  // })

  // await account.createUpdateIssuerInfoRequest({
  //   tokenAccount: 'lgs_39tqbdtibuggsswhbsex1qw7jqpmpw5quyb9p5gjbwindix5snc6edtwbqmm',
  //   issuerInfo: 'Hello update the token info'
  // })

  // await account.createUpdateControllerRequest({
  //   tokenAccount: 'lgs_39tqbdtibuggsswhbsex1qw7jqpmpw5quyb9p5gjbwindix5snc6edtwbqmm',
  //   action: 'add',
  //   controller: {
  //     account: 'lgs_1ypa5i4c1srejgreg1ukqmsp1166g477diob3rchsujrh6jqjd8memwrsti3',
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
  //   }
  // })

  // await account.createBurnRequest({
  //   tokenAccount: 'lgs_39tqbdtibuggsswhbsex1qw7jqpmpw5quyb9p5gjbwindix5snc6edtwbqmm',
  //   amount: '1000000000000000000000000000000'
  // })

  // await account.createIssueAdditionalRequest({
  //   tokenAccount: 'lgs_39tqbdtibuggsswhbsex1qw7jqpmpw5quyb9p5gjbwindix5snc6edtwbqmm',
  //   amount: '10000'
  // })

  // await account.createWithdrawFeeRequest({
  //   tokenAccount: 'lgs_39tqbdtibuggsswhbsex1qw7jqpmpw5quyb9p5gjbwindix5snc6edtwbqmm',
  //   transaction: {
  //     destination: 'lgs_3mjbkiwijkbt3aqz8kzm5nmsfhtrbjwkmnyeqi1aoscc46t4xdnfdaunerr6',
  //     amount: '10000'
  //   }
  // })
}
create()
