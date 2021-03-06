const expect = require('chai').expect
const LogosWallet = require('../')
const Wallet = LogosWallet.Wallet

describe('Wallet', () => {
  describe('Create Wallet', () => {
    it('creates a wallet and seed', () => {
      let wallet = new Wallet({
        password: 'password',
        mqtt: false,
        rpc: false
      })
      wallet.createAccount()
      expect(Object.values(wallet.accounts)).to.have.a.lengthOf(1)
    })
    it('creates the wallet', () => {
      let wallet = new Wallet({
        password: 'password',
        seed: '6F9BD621FDED3C2FB3A2DA8B75C4B6B4ADFE3DF8809B74F8EFF44DDC1120CACA',
        mqtt: false,
        rpc: false
      })
      wallet.createAccount()
      expect(wallet.currentAccountAddress).to.equal('lgs_16qe43ioiirkgq1pbm7esb96qqwk3wjihf9ey7broncwa7doy85c4xkapkob')
    })
    it('creates second account deterministically', () => {
      let wallet = new Wallet({
        password: 'password',
        seed: '6F9BD621FDED3C2FB3A2DA8B75C4B6B4ADFE3DF8809B74F8EFF44DDC1120CACA',
        mqtt: false,
        rpc: false
      })
      wallet.createAccount()
      wallet.createAccount()
      expect(wallet.currentAccountAddress).to.equal('lgs_1wfecwmyqqoo3sjredpn336jwfjh9jqsi6qz6jj7y1kpwijq4pue4jkg6mjz')
    })
    it('creates a wallet from private key', () => {
      let wallet = new Wallet({
        password: 'password',
        seed: '6F9BD621FDED3C2FB3A2DA8B75C4B6B4ADFE3DF8809B74F8EFF44DDC1120CACA',
        mqtt: false,
        rpc: false
      })
      wallet.createAccount({
        privateKey: '50F6320A0BF3CAFE656A9FEF0941621B3DDB0031CCA536C9F9F285D856D32412'
      })
      expect(wallet.currentAccountAddress).to.equal('lgs_3kq6qw4npptycwpsh1k1utxr1jx39wemcxpdfbxyh8y9tih5bn88i1pthhbe')
    })
    it('creates 10th account deterministically', () => {
      let wallet = new Wallet({
        password: 'password',
        seed: '6F9BD621FDED3C2FB3A2DA8B75C4B6B4ADFE3DF8809B74F8EFF44DDC1120CACA',
        mqtt: false,
        rpc: false
      })
      wallet.createAccount({
        index: 10
      })
      expect(wallet.currentAccountAddress).to.equal('lgs_3tq554dtqwqynmyzqejhkch75brfuzxykcqb4hjkx8snghzjm9pc65bw7swq')
    })
  })
  describe('Encryption and Decryption', () => {
    let wallet = new Wallet({
      password: 'password',
      seed: '6F9BD621FDED3C2FB3A2DA8B75C4B6B4ADFE3DF8809B74F8EFF44DDC1120CACA',
      mqtt: false,
      rpc: false
    })
    wallet.createAccount()
    let encryptedWallet = null
    it('encrypts the wallet', () => {
      encryptedWallet = wallet.encrypt()
      let hex = /([\da-fA-F]+)/g
      expect(hex.test(encryptedWallet)).to.be.true
    })
    it('decrypts the wallet', () => {
      let loadWallet = new Wallet({
        password: 'password',
        mqtt: false,
        rpc: false
      })
      loadWallet.load(encryptedWallet)
      expect(wallet.currentAccountAddress).to.equal(loadWallet.currentAccountAddress)
      expect(wallet.seed).to.equal(loadWallet.seed)
    })
  })
  describe('Properties', () => {
    let wallet = new Wallet({
      password: 'password',
      seed: '6F9BD621FDED3C2FB3A2DA8B75C4B6B4ADFE3DF8809B74F8EFF44DDC1120CACA',
      mqtt: false,
      rpc: false
    })
    wallet.createAccount()
    wallet.createAccount()
    it('Sets wallet id', () => {
      wallet.WalletID = 'Checking Account'
      expect(wallet.WalletID).to.equal('Checking Account')
    })
    it('Sets account', () => {
      expect(wallet.account.address).to.equal('lgs_1wfecwmyqqoo3sjredpn336jwfjh9jqsi6qz6jj7y1kpwijq4pue4jkg6mjz')
      wallet.currentAccountAddress = 'lgs_16qe43ioiirkgq1pbm7esb96qqwk3wjihf9ey7broncwa7doy85c4xkapkob'
      expect(wallet.account.address).to.equal('lgs_16qe43ioiirkgq1pbm7esb96qqwk3wjihf9ey7broncwa7doy85c4xkapkob')
    })
    it('Sets seed', () => {
      expect(wallet.seed).to.equal('6F9BD621FDED3C2FB3A2DA8B75C4B6B4ADFE3DF8809B74F8EFF44DDC1120CACA')
      wallet.seed = 'ED58CB56E372DBEC785B2CE4A2372C5DC695041BFCD8E6CC3D22BC4B2CF73B7A'
      expect(wallet.seed).to.equal('ED58CB56E372DBEC785B2CE4A2372C5DC695041BFCD8E6CC3D22BC4B2CF73B7A')
    })
    it('Create seed', () => {
      expect(wallet.seed).to.equal('ED58CB56E372DBEC785B2CE4A2372C5DC695041BFCD8E6CC3D22BC4B2CF73B7A')
      wallet.createSeed(true)
      expect(wallet.seed).to.have.a.lengthOf(64)
    })
    it('Gets Accounts', () => {
      expect(Object.values(wallet.accounts)).to.have.a.lengthOf(2)
    })
  })
  describe('Send', function () {
    const LogosWallet = require('../')
    const Wallet = LogosWallet.Wallet
    let wallet = new Wallet({
      password: 'password',
      mqtt: false,
      logging: 'error',
      fullSync: false
    })
    it('Creates Wallets | Sends Two Transactions', async function () {
      this.timeout(600000)
      await wallet.createAccount({
        privateKey: '34F0A37AAD20F4A260F0A5B3CB3D7FB50673212263E58A380BC10474BB039CE4'
      })
      expect(wallet.account.address).to.equal('lgs_3e3j5tkog48pnny9dmfzj1r16pg8t1e76dz5tmac6iq689wyjfpiij4txtdo')
      await wallet.account.createSendRequest([{
        destination: 'lgs_3mjbkiwijkbt3aqz8kzm5nmsfhtrbjwkmnyeqi1aoscc46t4xdnfdaunerr6',
        amount: '300000000000000000000000000000'
      }])
      await wallet.account.createSendRequest([{
        destination: 'lgs_3mjbkiwijkbt3aqz8kzm5nmsfhtrbjwkmnyeqi1aoscc46t4xdnfdaunerr6',
        amount: '300000000000000000000000000000'
      }])
      expect(wallet.account.pendingChain).to.have.a.lengthOf(2)
    }),
    it('Issues a Token', async function () {
      this.timeout(600000)
      await wallet.account.createTokenIssuanceRequest({
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
      expect(wallet.account.pendingChain).to.have.a.lengthOf(3)
    })
  })
})
