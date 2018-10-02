var MAGIC_NUMBER = "5243";   // 0x52 0x43
var VERSION_MAX = "01";      // 0x01
var VERSION_MIN = "01";      // 0x01
var VERSION_USING = "01";    // 0x01
var EXTENSIONS = "0002";     // 0x00 0x02
var RAI_TO_RAW = "000000000000000000000000";
var MAIN_NET_WORK_THRESHOLD = "ffffffc000000000";
var blake = require('blakejs');
var bigInt = require('big-integer');
import { hex_uint8, dec2hex, uint8_hex, accountFromHexKey, keyFromAccount, hex2dec, stringFromHex } from './functions';

var blockID = { invalid: 0, not_a_block: 1, send: 2, receive: 3, open: 4, change: 5 }

module.exports = function () {
  var api = {};       // public methods
  var data = "";      // raw block to be relayed to the network directly
  var type;           // block type
  var hash;           // block hash
  var signed = false; // if block has signature
  var worked = false; // if block has work
  var signature = ""; // signature
  var work = "";      // work
  var blockAccount;   // account owner of this block
  var origin;			// account sending money in case of receive or open block
  var immutable = false; // if true means block has already been confirmed and cannot be changed, some checks are ignored

  var previous;       // send, receive and change
  var destination;    // send
  var amount = bigInt(0);// send and receive
  var decAmount;      // send
  var source;         // receive and open
  var representative; // open and change
  var account;        // open

  var version = 1;		// to make updates compatible with previous versions of the wallet
  var BLOCK_MAX_VERSION = 1;

  /**
   * Builds the block and calculates the hash
   *
   * @throws An exception on invalid type
   * @returns {Array} The block hash
   */
  api.build = function () {

    switch (type) {
      case 'send':
        data = "";
        data += MAGIC_NUMBER + VERSION_MAX + VERSION_USING + VERSION_MIN + uint8_hex(blockID[type]) + EXTENSIONS;
        data += previous;
        data += destination
        data += amount;

        var context = blake.blake2bInit(32, null);
        blake.blake2bUpdate(context, hex_uint8(previous));
        blake.blake2bUpdate(context, hex_uint8(destination));
        blake.blake2bUpdate(context, hex_uint8(amount));
        hash = uint8_hex(blake.blake2bFinal(context));
        break;

      case 'change':
        data = "";
        data += MAGIC_NUMBER + VERSION_MAX + VERSION_USING + VERSION_MIN + uint8_hex(blockID[type]) + EXTENSIONS;
        data += previous;
        data += representative;

        var context = blake.blake2bInit(32, null);
        blake.blake2bUpdate(context, hex_uint8(previous));
        blake.blake2bUpdate(context, hex_uint8(representative));
        hash = uint8_hex(blake.blake2bFinal(context));
        break;

      default:
        throw "Block parameters need to be set first.";
    }

    return hash;
  }

  /**
   * Sets the send parameters and builds the block
   *
   * @param {string} previousBlockHash - The previous block 32 byte hash hex encoded
   * @param {string} destinationAccount - The Logos account receiving the money
   * @param {string} sendAmount - Amount of Logos you wish to send in this block (Raw)
   * @throws An exception on invalid block hash
   * @throws An exception on invalid destination account
   * @throws An exception on invalid amount
   */
  api.setSendParameters = function (previousBlockHash, destinationAccount, sendAmount) {
    if (!/[0-9A-F]{64}/i.test(previousBlockHash))
      throw "Invalid previous block hash.";

    try {
      var pk = keyFromAccount(destinationAccount);
    } catch (err) {
      throw "Invalid destination account.";
    }

    previous = previousBlockHash;
    destination = pk;
    decAmount = sendAmount;
    amount = dec2hex(sendAmount, 16);
    type = 'send';
  }

  /**
   * Sets the change parameters and builds the block
   *
   * @param {string} previousBlockHash - The previous block 32 byte hash hex encoded
   * @param {string} representativeAccount - The account to be set as representative
   * @throws An exception on invalid previousBlockHash
   * @throws An exception on invalid representative account
   */
  api.setChangeParameters = function (previousBlockHash, representativeAccount) {
    if (!/[0-9A-F]{64}/i.test(previousBlockHash))
      throw "Invalid previous block hash.";

    try {
      representative = keyFromAccount(representativeAccount);
    } catch (err) {
      throw "Invalid representative account.";
    }

    previous = previousBlockHash;
    type = "change";
  }


  /**
   * Sets the block signature
   *
   * @param {string} hex - The hex encoded 64 byte block hash signature
   */
  api.setSignature = function (hex) {
    signature = hex;
    signed = true;
  }

  /**
   * Sets the block work
   *
   * @param {string} hex - The hex encoded 8 byte block hash PoW
   * @throws An exception if work is not enough
   */
  api.setWork = function (hex) {
    if (!api.checkWork(hex))
      throw "Work not valid for block";
    work = hex;
    worked = true;
  }

  /**
   * Sets the account owner of the block
   *
   * @param {string} acc - The Logos account
   */
  api.setAccount = function (acc) {
    blockAccount = acc;
    if (type == 'send')
      origin = acc;
  }

  /**
   *
   * @returns blockAccount
   */
  api.getAccount = function () {
    return blockAccount;
  }

  /**
   * Sets the account which sent the block
   * @param {string} acc - The Logos account
   */
  api.setOrigin = function (acc) {
    if (type == 'receive' || type == 'open')
      origin = acc;
  }

  /**
   *
   * @returns originAccount
   */
  api.getOrigin = function () {
    if (type == 'receive' || type == 'open')
      return origin;
    if (type == 'send')
      return blockAccount;
    return false;
  }

  /**
   *
   * @returns destinationAccount
   */
  api.getDestination = function () {
    if (type == 'send')
      return accountFromHexKey(destination);
    if (type == 'receive' || type == 'open')
      return blockAccount;
  }

  /**
   *
   * @param {boolean} hex - To get the hash hex encoded
   * @returns {string} The block hash
   */
  api.getHash = function (hex = false) {
    return hex ? hash : hex_uint8(hash);
  }

  api.getSignature = function () {
    return signature;
  }

  api.getType = function () {
    return type;
  }

  api.getAmount = function (format = 'dec') {
    if (format == 'dec') {
      var dec = bigInt(hex2dec(amount));
      return dec;
    }
    return amount;
  }

  /**
   * Returns the previous block hash if its not an open block, the public key if it is
   *
   * @returns {string} The previous block hash
   */
  api.getPrevious = function () {
    if (type == 'open')
      return account;
    return previous;
  }

  api.getSource = function () {
    return source;
  }

  api.getRepresentative = function () {
    if (type == 'change' || type == 'open')
      return accountFromHexKey(representative);
    else
      return false;
  }

  api.ready = function () {
    return signed && worked;
  }

  api.setImmutable = function (bool) {
    immutable = bool;
  }

  api.isImmutable = function () {
    return immutable;
  }

  /**
   * Changes the previous block hash and rebuilds the block
   *
   * @param {string} newPrevious - The previous block hash hex encoded
   * @throws An exception if its an open block
   * @throws An exception if block is not built
   */
  api.changePrevious = function (newPrevious) {
    switch (type) {
      case 'open':
        throw 'Open has no previous block.';
        break;
      case 'receive':
        api.setReceiveParameters(newPrevious, source);
        api.build();
        break;
      case 'send':
        //TODO FIX THIS its annoying
        api.setSendParameters(newPrevious, destination, amount);
        api.build();
        break;
      case 'change':
        api.setChangeParameters(newPrevious, representative);
        api.build();
        break;
      default:
        throw "Invalid block type";
    }
  }

  /**
   *
   * @returns {string} The raw block hex encoded ready to be sent to the network
   */
  api.getRawBlock = function () {
    if (!signed || !worked)
      throw "Incomplete block";
    return data;
  }

  /**
   *
   * @returns {string} The block JSON encoded to be broadcasted with RPC
   */
  api.getJSONBlock = function (pretty = false) {
    if (!signed)
      throw "Block lacks signature";
    var obj = {};
    obj.type = type;

    switch (type) {
      case 'send':
        obj.previous = previous;
        obj.destination = accountFromHexKey(destination);
        obj.amount = amount;
        break;

      case 'receive':
        obj.previous = previous;
        obj.source = source;
        break;

      case 'open':
        obj.source = source;
        obj.representative = accountFromHexKey(representative ? representative : account);
        obj.account = accountFromHexKey(account);
        break;

      case 'change':
        obj.previous = previous;
        obj.representative = accountFromHexKey(representative);
        break;

      default:
        throw "Invalid block type.";
    }

    obj.work = work;
    obj.signature = signature;

    if (pretty)
      return JSON.stringify(obj, null, 2);
    return JSON.stringify(obj);
  }

  api.getEntireJSON = function () {
    var obj = JSON.parse(api.getJSONBlock());
    var extras = {};

    extras.blockAccount = blockAccount;
    extras.origin = origin;
    obj.extras = extras;
    obj.version = version;
    return JSON.stringify(obj);
  }

  api.buildFromJSON = function (json, v = false) {
    if (typeof(json) != 'object')
      var obj = JSON.parse(json);
    else
      var obj = json;

    switch (obj.type) {
      case 'send':
        type = 'send';
        previous = obj.previous;
        destination = keyFromAccount(obj.destination);
        amount = obj.amount;
        break;

      case 'receive':
        type = 'receive';
        previous = obj.previous;
        source = obj.source;
        break;

      case 'open':
        type = 'open';
        source = obj.source;
        representative = keyFromAccount(obj.representative);
        account = keyFromAccount(obj.account);
        break;

      case 'change':
        type = 'change';
        previous = obj.previous;
        representative = keyFromAccount(obj.representative);
        break;

      default:
        throw "Invalid block type.";
    }

    signature = obj.signature;
    work = obj.work;

    if (work)
      worked = true;
    if (signature)
      signed = true;

    if (obj.extras !== undefined) {
      api.setAccount(obj.extras.blockAccount);
      api.setAmount(obj.amount ? obj.amount : 0);
      api.setOrigin(obj.extras.origin);
    }
    version = v;
    api.build();
  }

  api.checkWork = function (work, blockHash = false) {
    if (blockHash === false) {
      blockHash = api.getPrevious();
    }

    var t = hex_uint8(MAIN_NET_WORK_THRESHOLD);
    var context = blake.blake2bInit(8, null);
    blake.blake2bUpdate(context, hex_uint8(work).reverse());
    blake.blake2bUpdate(context, hex_uint8(blockHash));
    var threshold = blake.blake2bFinal(context).reverse();

    if (threshold[0] == t[0])
      if (threshold[1] == t[1])
        if (threshold[2] == t[2])
          if (threshold[3] >= t[3])
            return true;
    return false;
  }

  api.getVersion = function () {
    return version;
  }

  api.setVersion = function (v) {
    version = v;
  }

  api.getMaxVersion = function () {
    return BLOCK_MAX_VERSION;
  }

  return api;
}
