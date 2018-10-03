var RAI_TO_RAW = "000000000000000000000000";
var MAIN_NET_WORK_THRESHOLD = "ffffffc000000000";
var STATE_BLOCK_PREAMBLE = '0000000000000000000000000000000000000000000000000000000000000006';
var HEX_32_BYTE_ZERO = '0000000000000000000000000000000000000000000000000000000000000000';
var blake = require('blakejs');
var bigInt = require('big-integer');
import { hex_uint8, dec2hex, uint8_hex, accountFromHexKey, keyFromAccount, hex2dec, stringFromHex } from './functions';

var blockID = { invalid: 0, not_a_block: 1, send: 2, receive: 3, open: 4, change: 5 }

module.exports = function (isState = true) {
  var api = {};       // public methods
  var _private = {};  // private methods
  var data = "";      // raw block to be relayed to the network directly
  var type;           // block type
  var hash;           // block hash
  var signed = false; // if block has signature
  var worked = false; // if block has work
  var signature = ""; // signature
  var work = "";      // work
  var amount = bigInt(0);// amount transferred
  var decAmount;
  var blockAccount;   // account owner of this block
  var origin;			// account sending money in case of receive or open block
  var immutable = false; // if true means block has already been confirmed and cannot be changed, some checks are ignored
  var isState = isState; // state or legacy block
  var isSending;
  var isReceiving;

  var previous;       // send, receive and change // it's the block hash
  var destination;    // send
  var source;         // receive and open
  var representative; // open and change
  var account;        // open
  var previousBlock; // the whole previous block, data type = Block
  var link;           // state blocks

  var version = 1;		// to make updates compatible with previous versions of the wallet

  /**
   * Builds the block and calculates the hash
   *
   * @throws An exception on invalid type
   * @returns {Array} The block hash
   */
  api.build = function () {

    if (isState) {
      if (!previous) {
        if (!previousBlock) {
          throw "Previous block is missing.";
        }
        previous = previousBlock.getHash(true);
      }

      if (!amount)
        throw "Amount is not set.";
      if (!link)
        throw "State block link is missing.";

      // all good here, compute the block hash
      var context = blake.blake2bInit(32, null);
      blake.blake2bUpdate(context, hex_uint8(STATE_BLOCK_PREAMBLE));
      blake.blake2bUpdate(context, hex_uint8(keyFromAccount(blockAccount)));
      blake.blake2bUpdate(context, hex_uint8(previous));
      blake.blake2bUpdate(context, hex_uint8(representative));
      blake.blake2bUpdate(context, hex_uint8(amount));
      blake.blake2bUpdate(context, hex_uint8(link));
      hash = uint8_hex(blake.blake2bFinal(context));
    } else { // legacy block
      switch (type) {
        case 'send':
          var context = blake.blake2bInit(32, null);
          blake.blake2bUpdate(context, hex_uint8(previous));
          blake.blake2bUpdate(context, hex_uint8(destination));
          blake.blake2bUpdate(context, hex_uint8(amount));
          hash = uint8_hex(blake.blake2bFinal(context));
          break;

        case 'receive':
          var context = blake.blake2bInit(32, null);
          blake.blake2bUpdate(context, hex_uint8(previous));
          blake.blake2bUpdate(context, hex_uint8(source));
          hash = uint8_hex(blake.blake2bFinal(context));
          break;

        case 'open':
          var context = blake.blake2bInit(32, null);
          blake.blake2bUpdate(context, hex_uint8(source));
          blake.blake2bUpdate(context, hex_uint8(representative));
          blake.blake2bUpdate(context, hex_uint8(account));
          hash = uint8_hex(blake.blake2bFinal(context));
          break;

        case 'change':
          var context = blake.blake2bInit(32, null);
          blake.blake2bUpdate(context, hex_uint8(previous));
          blake.blake2bUpdate(context, hex_uint8(representative));
          hash = uint8_hex(blake.blake2bFinal(context));
          break;

        default:
          throw "Block parameters need to be set first.";
      }
    }

    return hash;
  }

  /**
   * Sets the send parameters and builds the block
   *
   * @param {string} previousBlockHash - The previous block 32 byte hash hex encoded
   * @param {string} destinationAccount - The Logos account receiving the money
   * @param {string} sendAmount - Amount of Logos you wish to send in this block (Raw)
   * @param {Block} previousBlk - The whole previous block
   * @throws An exception on invalid block hash
   * @throws An exception on invalid destination account
   * @throws An exception on invalid amount
   */
  api.setSendParameters = function (previousBlockHash, destinationAccount, sendAmount, previousBlk = false) {
    if (previousBlk) {
      previousBlock = previousBlk;
      previousBlockHash = previousBlk.getHash(true);
    }

    if (!/[0-9A-F]{64}/i.test(previousBlockHash))
      throw "Invalid previous block hash.";

    try {
      var pk = keyFromAccount(destinationAccount);
    } catch (err) {
      throw "Invalid destination account.";
    }

    _private.reset();
    previous = previousBlockHash;
    destination = pk;
    decAmount = sendAmount;
    amount = dec2hex(sendAmount, 16);

    if (isState) {
      link = destination;
      isSending = true;
    } else {
      type = 'send';
    }
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

    _private.reset();
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
   * Sets block amount, to be retrieved from it directly instead of calculating it quering the chain
   *
   * @param {number} am - The amount
   */
  api.setAmount = function (am) {
    amount = bigInt(am);
  }

  /**
   *
   * @returns blockAmount - The amount transferred in raw
   */
  api.getAmount = function () {
    return amount;
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
   * @param {string} acc - The xrb account
   */
  api.setOrigin = function (acc) {
    if (type == 'receive' || type == 'open')
      origin = acc;
    else if (isState) {
      isReceiving = true;
      origin = acc;
    }
  }

  /**
   * Sets the account/block representative. With state blocks, each block contains it so it can be set anytime with this
   * @param {string} rep - The representative account or its hex encoded public key
   * @throws An exception if rep is invalid and a rep cannot be pulled from the previous block
   */
  api.setRepresentative = function (rep) {
    if (/[0-9A-F]{64}/i.test(rep))
      representative = rep;
    else {
      rep = keyFromAccount(rep);
      if (rep)
        representative = rep;
      else {
        // try to pull it from the previous block
        rep = false;
        if (previousBlock) {
          rep = keyFromAccount(previousBlock.getRepresentative());
        }
        if (!rep)
          throw "Representative passed is invalid. Also, unable to get the one used on the previous block.";
        representative = rep;
      }
    }
  }

  /**
   *
   * @returns originAccount
   */
  api.getOrigin = function () {
    if (type == 'receive' || type == 'open' || (isState && isReceiving))
      return origin;
    if (type == 'send' || (isState && isSending))
      return blockAccount;
    return false;
  }

  /**
   *
   * @returns destinationAccount
   */
  api.getDestination = function () {
    if (type == 'send' || ( isSending && isState) )
      return accountFromHexKey(destination);
    if (type == 'receive' || type == 'open' || (isState && isReceiving))
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
    if (isState)
      return 'state';
    return type;
  }

  /**
   * Returns the previous block hash if its not an open block, the public key if it is
   *
   * @returns {string} The previous block hash
   */
  api.getPrevious = function () {
    return previous;
  }

  api.getSource = function () {
    return source;
  }

  api.getRepresentative = function () {
    if (type == 'change' || type == 'open' || isState)
      return accountFromHexKey(representative);
    else
      return false;
  }

  api.getLink = function () {
    if (isState)
      return link;
  }

  api.getLinkAsAccount = function () {
    if (isState)
      return accountFromHexKey(link);
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
        api.setSendParameters(newPrevious, destination, stringFromHex(amount).replace(RAI_TO_RAW, ''));
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
   * Sets the previous block.
   * @param {Block} blk - The previous block
   * @throws An exception if the arg passed is not a block.
   * @throws An exception if the arg passed is an incomplete block.
   */
  api.setPreviousBlock = function (blk) {
    let h;
    try{
      h = blk.build();
    } catch(e) {
      // block incomplete
      throw "Block is incomplete.";
    }

    if(!h) {
      // not a Block
      throw "Arg passed is not a Block";
    }
    previousBlock = blk;
  }

  /**
   *
   * @returns {string} The block JSON encoded to be broadcasted with RPC
   */
  api.getJSONBlock = function (pretty = false) {
    if (!signed)
      throw "Block lacks signature";
    var obj = {};

    if (isState) {
      obj.type = 'state';
      obj.previous = previous;
      obj.link = link;
      obj.representative = accountFromHexKey(representative); // state blocks are processed with the rep encoded as an account
      obj.account = blockAccount;
      obj.amount = hex2dec(amount); // needs to be processed in dec in state blocks
    } else {
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
    if (amount)
      extras.amount = amount.toString();
    else
      extras.amount = 0;
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

    isState = false;
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

      case 'state':
        isState = true;
        blockAccount = obj.account;
        previous = obj.previous;
        api.setRepresentative(obj.representative);
        amount = dec2hex(obj.amount, 16);
        link = obj.link;
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
      api.setAmount(obj.extras.amount ? obj.extras.amount : 0);
      api.setOrigin(obj.extras.origin);
    }

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

  _private.reset = function () {
    isSending = false;
    isReceiving = false;
    signed = false;
    worked = false;
    signature = null;
    work = null;
    origin = false;
    destination = false;
  }

  return api;
}
