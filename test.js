const { LogosUtils } = require('./dist')
console.log(LogosUtils)
const nacl = require('tweetnacl/nacl')
console.log(LogosUtils.uint8ToHex(nacl.randomBytes(32)))
