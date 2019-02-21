const expect = require('chai').expect
const LogosWallet = require('../')
const Wallet = LogosWallet.Wallet

describe('Wallet', () => {
  describe('Create Wallet', () => {
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
      expect(encryptedWallet).to.have.a.lengthOf(576)
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
      expect(wallet.accounts).to.have.a.lengthOf(2)
    })
  })
  describe('Send', function () {
    const LogosWallet = require('../')
    const Wallet = LogosWallet.Wallet
    let wallet = new Wallet({
      password: 'password',
      mqtt: false
    })
    it('Creates Wallets | Sends Two Transactions', async function () {
      this.timeout(600000)
      await wallet.createAccount({
        privateKey: '4ECA359CE31900144EE44DFB28553368C0F95E0F25746408A9B59928FD05AB57'
      })
      expect(wallet.account.address).to.equal('lgs_15iaeuk818zfgkbtou9fwu41mdrx81adygzaa9uhzc9pdjpqjaqdaz1my9mt')
      await wallet.account.createSend([{
        target: 'lgs_3e3j5tkog48pnny9dmfzj1r16pg8t1e76dz5tmac6iq689wyjfpiij4txtdo',
        amount: '100000000000000000000000000000'
      }], true, false)
      await wallet.account.createSend([{
        target: 'lgs_3e3j5tkog48pnny9dmfzj1r16pg8t1e76dz5tmac6iq689wyjfpiij4txtdo',
        amount: '100000000000000000000000000000'
      }], true, false)
      expect(wallet.account.pendingChain).to.have.a.lengthOf(2)
    })
  })
})
