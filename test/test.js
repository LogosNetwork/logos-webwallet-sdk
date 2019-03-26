const LogosWallet = require('../')
const Wallet = LogosWallet.Wallet
const Utils = LogosWallet.Utils
let create = async () => {
  let wallet = new Wallet({
    password: 'password',
    lazyErrors: true,
    mqtt: 'ws:localhost:8883',
    batchSends: false
  })

  let account = await wallet.createAccount({
    privateKey: '872C745C3401354C6BF4BFD869CCC2B8382736DA68BF6D7A23AF01AAFDD67700'
  })
  for (let i = 0; i < 1; i++) {
    let request = await account.createTokenIssuanceRequest({
      name: `TestCoin`,
      symbol: `TC`,
      totalSupply: '2779530283000000',
      issuerInfo: '{"decimals":"10","website":"https://www.stormtv.dev/"}',
      settings: {
        issuance: true,
        modify_issuance: Math.random() >= 0.5,
        revoke: Math.random() >= 0.5,
        modify_revoke: Math.random() >= 0.5,
        freeze: Math.random() >= 0.5,
        modify_freeze: Math.random() >= 0.5,
        adjust_fee: true,
        modify_adjust_fee: Math.random() >= 0.5,
        whitelist: false,
        modify_whitelist: Math.random() >= 0.5
      },
      controllers: [{
        account: 'lgs_3mjbkiwijkbt3aqz8kzm5nmsfhtrbjwkmnyeqi1aoscc46t4xdnfdaunerr6',
        privileges: {
          change_issuance: Math.random() >= 0.5,
          change_modify_issuance: Math.random() >= 0.5,
          change_revoke: Math.random() >= 0.5,
          change_modify_revoke: Math.random() >= 0.5,
          change_freeze: Math.random() >= 0.5,
          change_modify_freeze: Math.random() >= 0.5,
          change_adjust_fee: Math.random() >= 0.5,
          change_modify_adjust_fee: Math.random() >= 0.5,
          change_whitelist: Math.random() >= 0.5,
          change_modify_whitelist: Math.random() >= 0.5,
          issuance: true,
          revoke: Math.random() >= 0.5,
          freeze: Math.random() >= 0.5,
          adjust_fee: true,
          whitelist: Math.random() >= 0.5,
          update_issuer_info: Math.random() >= 0.5,
          update_controller: Math.random() >= 0.5,
          burn: true,
          distribute: true,
          withdraw_fee: true
        }
      }]
    })
    let tokenAddress = Utils.accountFromHexKey(request.tokenID)
    await account.createSendRequest([{
      destination: tokenAddress,
      amount: '500000000000000000000000000000'
    }])
    await account.createDistributeRequest({
      tokenAccount: tokenAddress,
      transaction: {
        destination: 'lgs_3mjbkiwijkbt3aqz8kzm5nmsfhtrbjwkmnyeqi1aoscc46t4xdnfdaunerr6',
        amount: '10000000000'
      }
    })
    await account.createAdjustFeeRequest({
      tokenAccount: tokenAddress,
      feeRate: '1000000',
      feeType: 'flat'
    })
    await account.createTokenSendRequest(
      tokenAddress,
      [
        {
          destination: 'lgs_1ypa5i4c1srejgreg1ukqmsp1166g477diob3rchsujrh6jqjd8memwrsti3',
          amount: '10000000'
        }
      ]
    )
    await account.createBurnRequest({
      tokenAccount: tokenAddress,
      amount: '100000000000'
    })
    await account.createIssueAdditionalRequest({
      tokenAccount: tokenAddress,
      amount: '50000000000'
    })
    await account.createWithdrawFeeRequest({
      tokenAccount: tokenAddress,
      transaction: {
        destination: 'lgs_3mjbkiwijkbt3aqz8kzm5nmsfhtrbjwkmnyeqi1aoscc46t4xdnfdaunerr6',
        amount: '10000'
      }
    })
  }
  // for (let i = 0; i < 100; i++) {
  //   await account.createSendRequest([{
  //     destination: 'lgs_34i1uyene47uksqp7t8wes3aib5e9yf5kfkz7xy7nmowmmoffr4s39xrq1zj',
  //     amount: '1000000000000000000000000000000'
  //   }])
  //   await account.createTokenSendRequest(
  //     'lgs_3xnnxe59j4qppwgei1ehwanpeddar5cm3xkia38xiax1i77tyadddi9zfaqn',
  //     [
  //       {
  //         destination: 'lgs_1ypa5i4c1srejgreg1ukqmsp1166g477diob3rchsujrh6jqjd8memwrsti3',
  //         amount: '100000'
  //       }
  //     ]
  //   )
  //   await account.createDistributeRequest({
  //     tokenAccount: 'lgs_3xnnxe59j4qppwgei1ehwanpeddar5cm3xkia38xiax1i77tyadddi9zfaqn',
  //     transaction: {
  //       destination: 'lgs_3mjbkiwijkbt3aqz8kzm5nmsfhtrbjwkmnyeqi1aoscc46t4xdnfdaunerr6',
  //       amount: '100000'
  //     }
  //   })
  //   await account.createAdjustUserStatusRequest({
  //     tokenAccount: 'lgs_3xnnxe59j4qppwgei1ehwanpeddar5cm3xkia38xiax1i77tyadddi9zfaqn',
  //     account: 'lgs_17cb9nxouwcd16dfr53xd3km8aheko3taf6zhyqu18j59ng786yoprb8gqns',
  //     status: i % 2 ? 'unfrozen' : 'frozen'
  //   })
  //   await account.createChangeSettingRequest({
  //     tokenAccount: 'lgs_3xnnxe59j4qppwgei1ehwanpeddar5cm3xkia38xiax1i77tyadddi9zfaqn',
  //     setting: 'revoke',
  //     value: i % 2 === 0
  //   })
  //   await account.createImmuteSettingRequest({
  //     tokenAccount: 'lgs_3xnnxe59j4qppwgei1ehwanpeddar5cm3xkia38xiax1i77tyadddi9zfaqn',
  //     setting: 'whitelist'
  //   })
  //   await account.createAdjustFeeRequest({
  //     tokenAccount: 'lgs_3xnnxe59j4qppwgei1ehwanpeddar5cm3xkia38xiax1i77tyadddi9zfaqn',
  //     feeRate: '10000',
  //     feeType: 'flat'
  //   })
  //   await account.createUpdateIssuerInfoRequest({
  //     tokenAccount: 'lgs_3xnnxe59j4qppwgei1ehwanpeddar5cm3xkia38xiax1i77tyadddi9zfaqn',
  //     issuerInfo: '{"decimals":"5","website":"https://stormtv.dev/"}'
  //   })
  //   await account.createUpdateControllerRequest({
  //     tokenAccount: 'lgs_3xnnxe59j4qppwgei1ehwanpeddar5cm3xkia38xiax1i77tyadddi9zfaqn',
  //     action: i % 2 ? 'remove' : 'add',
  //     controller: {
  //       account: 'lgs_1ypa5i4c1srejgreg1ukqmsp1166g477diob3rchsujrh6jqjd8memwrsti3',
  //       change_issuance: true,
  //       change_modify_issuance: false,
  //       change_revoke: false,
  //       change_modify_revoke: false,
  //       change_freeze: false,
  //       change_modify_freeze: false,
  //       change_adjust_fee: false,
  //       change_modify_adjust_fee: false,
  //       change_whitelist: false,
  //       change_modify_whitelist: false,
  //       issuance: false,
  //       revoke: false,
  //       freeze: false,
  //       adjust_fee: false,
  //       whitelist: false,
  //       update_issuer_info: false,
  //       update_controller: false,
  //       burn: false,
  //       distribute: false,
  //       withdraw_fee: false
  //     }
  //   })
  //   await account.createBurnRequest({
  //     tokenAccount: 'lgs_3xnnxe59j4qppwgei1ehwanpeddar5cm3xkia38xiax1i77tyadddi9zfaqn',
  //     amount: '100000000000'
  //   })

  //   await account.createIssueAdditionalRequest({
  //     tokenAccount: 'lgs_3xnnxe59j4qppwgei1ehwanpeddar5cm3xkia38xiax1i77tyadddi9zfaqn',
  //     amount: '100000000000'
  //   })

  //   await account.createWithdrawFeeRequest({
  //     tokenAccount: 'lgs_3xnnxe59j4qppwgei1ehwanpeddar5cm3xkia38xiax1i77tyadddi9zfaqn',
  //     transaction: {
  //       destination: 'lgs_3mjbkiwijkbt3aqz8kzm5nmsfhtrbjwkmnyeqi1aoscc46t4xdnfdaunerr6',
  //       amount: '10000'
  //     }
  //   })
  // }
  // for (let i = 0; i < 10; i++) {
  //   await account.createTokenSendRequest(
  //     'lgs_3xnnxe59j4qppwgei1ehwanpeddar5cm3xkia38xiax1i77tyadddi9zfaqn',
  //     [
  //       {
  //         destination: 'lgs_1ypa5i4c1srejgreg1ukqmsp1166g477diob3rchsujrh6jqjd8memwrsti3',
  //         amount: '100000'
  //       }
  //     ]
  //   )
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
  //   value: true
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
}
create()
