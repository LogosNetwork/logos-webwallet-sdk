const { LogosFunctions } = require('./')

const pubKey = '0D7471E5D11FADDCE5315C97B23B464184AFA8C4C396DCF219696B2682D0ADF6'
const account = 'lgs_15dng9kx49xfumkm4q6qpaxneie6oynebiwpums3ktdd6t3f3dhp69nxgb38'

const derivedAccount = LogosFunctions.accountFromHexKey(pubKey)
const derivedKey = LogosFunctions.keyFromAccount(account)

console.log(pubKey)
console.log(derivedKey)
console.log()
console.log(account)
console.log(derivedAccount)
