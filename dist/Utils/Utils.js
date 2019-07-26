"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var blake2b_1 = require("../Utils/blake2b");
var crypto_1 = require("crypto");
exports.minimumFee = '10000000000000000000000';
exports.EMPTY_WORK = '0000000000000000';
exports.GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';
exports.MAXUINT128 = '340282366920938463463374607431768211455';
exports.defaultRPC = {
    proxy: 'https://pla.bs',
    delegates: ['3.215.28.211', '3.214.93.111', '3.214.55.84', '3.214.51.200', '3.214.37.34', '3.214.209.198', '3.214.205.240', '3.214.204.82', '3.214.195.211', '3.214.188.128', '3.214.175.150', '3.213.75.16', '3.213.212.158', '3.213.17.31', '3.213.150.192', '3.213.110.174', '3.213.108.208', '3.212.255.243', '3.212.220.108', '3.209.93.207', '3.209.30.240', '3.208.253.215', '3.208.232.242', '18.233.235.87', '18.233.175.15', '18.211.221.254', '18.211.1.90', '18.208.239.123', '18.206.29.223', '18.204.189.145', '174.129.135.230', '100.25.175.142']
};
exports.defaultMQTT = 'wss://pla.bs:8443';
exports.Iso10126 = {
    pad: function (dataBytes, nBytesPerBlock) {
        var nPaddingBytes = nBytesPerBlock - dataBytes.length % nBytesPerBlock;
        var paddingBytes = crypto_1.randomBytes(nPaddingBytes - 1);
        var endByte = Buffer.from([nPaddingBytes]);
        return Buffer.concat([dataBytes, paddingBytes, endByte]);
    },
    unpad: function (dataBytes) {
        var nPaddingBytes = dataBytes[dataBytes.length - 1];
        return dataBytes.slice(0, -nPaddingBytes);
    }
};
exports.convertObjectToArray = function (myObject) {
    var myArray = [];
    for (var key in myObject) {
        if (myObject[key] === true) {
            myArray.push(key);
        }
    }
    return myArray;
};
exports.deserializeController = function (controller) {
    var defaultPrivileges = {
        change_issuance: false,
        change_modify_issuance: false,
        change_revoke: false,
        change_modify_revoke: false,
        change_freeze: false,
        change_modify_freeze: false,
        change_adjust_fee: false,
        change_modify_adjust_fee: false,
        change_whitelist: false,
        change_modify_whitelist: false,
        issuance: false,
        revoke: false,
        freeze: false,
        adjust_fee: false,
        whitelist: false,
        update_issuer_info: false,
        update_controller: false,
        burn: false,
        distribute: false,
        withdraw_fee: false,
        withdraw_logos: false
    };
    var newController = {};
    newController.account = controller.account;
    var privileges = defaultPrivileges;
    if (controller.privileges instanceof Array) {
        if (controller.privileges.length > 0) {
            privileges.change_issuance = controller.privileges.indexOf('change_issuance') > -1;
            privileges.change_modify_issuance = controller.privileges.indexOf('change_modify_issuance') > -1;
            privileges.change_revoke = controller.privileges.indexOf('change_revoke') > -1;
            privileges.change_modify_revoke = controller.privileges.indexOf('change_modify_revoke') > -1;
            privileges.change_freeze = controller.privileges.indexOf('change_freeze') > -1;
            privileges.change_modify_freeze = controller.privileges.indexOf('change_modify_freeze') > -1;
            privileges.change_adjust_fee = controller.privileges.indexOf('change_adjust_fee') > -1;
            privileges.change_modify_adjust_fee = controller.privileges.indexOf('change_modify_adjust_fee') > -1;
            privileges.change_whitelist = controller.privileges.indexOf('change_whitelist') > -1;
            privileges.change_modify_whitelist = controller.privileges.indexOf('change_modify_whitelist') > -1;
            privileges.issuance = controller.privileges.indexOf('issuance') > -1;
            privileges.revoke = controller.privileges.indexOf('revoke') > -1;
            privileges.freeze = controller.privileges.indexOf('freeze') > -1;
            privileges.adjust_fee = controller.privileges.indexOf('adjust_fee') > -1;
            privileges.whitelist = controller.privileges.indexOf('whitelist') > -1;
            privileges.update_issuer_info = controller.privileges.indexOf('update_issuer_info') > -1;
            privileges.update_controller = controller.privileges.indexOf('update_controller') > -1;
            privileges.burn = controller.privileges.indexOf('burn') > -1;
            privileges.distribute = controller.privileges.indexOf('distribute') > -1;
            privileges.withdraw_fee = controller.privileges.indexOf('withdraw_fee') > -1;
            privileges.withdraw_logos = controller.privileges.indexOf('withdraw_logos') > -1;
        }
    }
    else if (typeof controller.privileges === 'object' && controller.privileges !== null) {
        privileges = controller.privileges;
    }
    newController.privileges = privileges;
    return newController;
};
exports.deserializeControllers = function (controllers) {
    var newControllers = [];
    for (var _i = 0, controllers_1 = controllers; _i < controllers_1.length; _i++) {
        var controller = controllers_1[_i];
        newControllers.push(exports.deserializeController(controller));
    }
    return newControllers;
};
exports.serializeController = function (controllerObject) {
    return {
        account: controllerObject.account,
        privileges: exports.convertObjectToArray(controllerObject.privileges)
    };
};
exports.serializeControllers = function (controllersObject) {
    var controllers = [];
    for (var _i = 0, controllersObject_1 = controllersObject; _i < controllersObject_1.length; _i++) {
        var controller = controllersObject_1[_i];
        controllers.push(exports.serializeController(controller));
    }
    return controllers;
};
exports.deserializeSettings = function (settings) {
    var defaulSettings = {
        issuance: false,
        modify_issuance: false,
        revoke: false,
        modify_revoke: false,
        freeze: false,
        modify_freeze: false,
        adjust_fee: false,
        modify_adjust_fee: false,
        whitelist: false,
        modify_whitelist: false
    };
    if (settings instanceof Array) {
        if (settings.length > 0) {
            return {
                issuance: settings.indexOf('issuance') > -1,
                modify_issuance: settings.indexOf('modify_issuance') > -1,
                revoke: settings.indexOf('revoke') > -1,
                modify_revoke: settings.indexOf('modify_revoke') > -1,
                freeze: settings.indexOf('freeze') > -1,
                modify_freeze: settings.indexOf('modify_freeze') > -1,
                adjust_fee: settings.indexOf('adjust_fee') > -1,
                modify_adjust_fee: settings.indexOf('modify_adjust_fee') > -1,
                whitelist: settings.indexOf('whitelist') > -1,
                modify_whitelist: settings.indexOf('modify_whitelist') > -1
            };
        }
    }
    else if (typeof settings === 'object' && settings !== null) {
        return settings;
    }
    return defaulSettings;
};
exports.AES = {
    CBC: 'aes-256-cbc',
    OFB: 'aes-256-ofb',
    ECB: 'aes-256-ecb',
    encrypt: function (dataBytes, key, salt, options) {
        options = options || {};
        var cipher = crypto_1.createCipheriv(options.mode || exports.AES.CBC, key, salt || '');
        cipher.setAutoPadding(!options.padding);
        var BLOCK_BIT_LEN = 128;
        if (options.padding)
            dataBytes = options.padding.pad(dataBytes, BLOCK_BIT_LEN / 8);
        var encryptedBytes = Buffer.concat([cipher.update(dataBytes), cipher.final()]);
        return encryptedBytes;
    },
    decrypt: function (dataBytes, key, salt, options) {
        if (salt === void 0) { salt = null; }
        options = options || {};
        var decipher = crypto_1.createDecipheriv(options.mode || exports.AES.CBC, key, salt || '');
        decipher.setAutoPadding(!options.padding);
        var decryptedBytes = Buffer.concat([decipher.update(dataBytes), decipher.final()]);
        if (options.padding)
            decryptedBytes = options.padding.unpad(decryptedBytes);
        return decryptedBytes;
    }
};
/**
 * Encode provided Uint8Array using the Base-32 implementeation.
 * @param {Uint8Array} view Input buffer formatted as a Uint8Array
 * @returns {string}
 */
var encode = function (view) {
    var length = view.length;
    var leftover = (length * 8) % 5;
    var offset = leftover === 0 ? 0 : 5 - leftover;
    var alphabet = '13456789abcdefghijkmnopqrstuwxyz';
    var value = 0;
    var output = '';
    var bits = 0;
    for (var i = 0; i < length; i++) {
        value = (value << 8) | view[i];
        bits += 8;
        while (bits >= 5) {
            output += alphabet[(value >>> (bits + offset - 5)) & 31];
            bits -= 5;
        }
    }
    if (bits > 0) {
        output += alphabet[(value << (5 - (bits + offset))) & 31];
    }
    return output;
};
var readChar = function (char) {
    var alphabet = '13456789abcdefghijkmnopqrstuwxyz';
    var idx = alphabet.indexOf(char);
    if (idx === -1) {
        throw new Error('Invalid character found: ' + char);
    }
    return idx;
};
/**
 * Decodes an Implementation Base32 encoded string into a Uint8Array
 * @param {string} input A Base32 encoded string
 * @returns {Uint8Array}
 */
var decode = function (input) {
    if (typeof input !== 'string') {
        throw new Error('Input must be a string!');
    }
    var length = input.length;
    var leftover = (length * 5) % 8;
    var offset = leftover === 0 ? 0 : 8 - leftover;
    var bits = 0;
    var value = 0;
    var index = 0;
    var output = new Uint8Array(Math.ceil(length * 5 / 8));
    for (var i = 0; i < length; i++) {
        value = (value << 5) | readChar(input[i]);
        bits += 5;
        if (bits >= 8) {
            output[index++] = (value >>> (bits + offset - 8)) & 255;
            bits -= 8;
        }
    }
    if (bits > 0) {
        output[index++] = (value << (bits + offset - 8)) & 255;
    }
    if (leftover !== 0) {
        output = output.slice(1);
    }
    return output;
};
exports.stringFromHex = function (hex) {
    var stringHex = hex.toString(); // force conversion
    var str = '';
    for (var i = 0; i < stringHex.length; i += 2) {
        str += String.fromCharCode(parseInt(stringHex.substr(i, 2), 16));
    }
    return str;
};
exports.stringToHex = function (str) {
    var hex = '';
    for (var i = 0; i < str.length; i++) {
        hex += '' + str.charCodeAt(i).toString(16);
    }
    return hex;
};
exports.changeEndianness = function (data) {
    var result = [];
    var len = data.length - 2;
    while (len >= 0) {
        result.push(data.substr(len, 2));
        len -= 2;
    }
    return result.join('');
};
exports.decToHex = function (str, bytes) {
    if (bytes === void 0) { bytes = null; }
    var dec = str.toString().split('');
    var sum = [];
    var hex = [];
    var i;
    var s;
    while (dec.length) {
        s = 1 * parseInt(dec.shift());
        for (i = 0; s || i < sum.length; i++) {
            s += (sum[i] || 0) * 10;
            sum[i] = s % 16;
            s = (s - sum[i]) / 16;
        }
    }
    while (sum.length) {
        hex.push(sum.pop().toString(16));
    }
    var hexConcat = hex.join('');
    if (hexConcat.length % 2 !== 0)
        hexConcat = '0' + hexConcat;
    if (bytes > hexConcat.length / 2) {
        var diff = bytes - hexConcat.length / 2;
        for (var i_1 = 0; i_1 < diff; i_1++)
            hexConcat = '00' + hexConcat;
    }
    return hexConcat;
};
exports.hexToDec = function (s) {
    var add = function (x, y) {
        var c = 0;
        var r = [];
        var newX = x.split('').map(Number);
        var newY = y.split('').map(Number);
        while (x.length || y.length) {
            var s_1 = (newX.pop() || 0) + (newY.pop() || 0) + c;
            r.unshift(s_1 < 10 ? s_1 : s_1 - 10);
            c = s_1 < 10 ? 0 : 1;
        }
        if (c)
            r.unshift(c);
        return r.join('');
    };
    var dec = '0';
    s.split('').forEach(function (chr) {
        var n = parseInt(chr, 16);
        for (var t = 8; t; t >>= 1) {
            dec = add(dec, dec);
            if (n & t)
                dec = add(dec, '1');
        }
    });
    return dec;
};
exports.hexToUint8 = function (hex) {
    var length = (hex.length / 2) | 0;
    var uint8 = new Uint8Array(length);
    for (var i = 0; i < length; i++)
        uint8[i] = parseInt(hex.substr(i * 2, 2), 16);
    return uint8;
};
exports.uint8ToHex = function (uint8) {
    var hex = '';
    var aux;
    for (var i = 0; i < uint8.length; i++) {
        aux = uint8[i].toString(16).toUpperCase();
        if (aux.length === 1)
            aux = '0' + aux;
        hex += aux;
        aux = '';
    }
    return hex;
};
var equalArrays = function (array1, array2) {
    for (var i = 0; i < array1.length; i++) {
        if (array1[i] !== array2[i])
            return false;
    }
    return true;
};
exports.byteCount = function (s) {
    return encodeURI(s).split(/%(?:u[0-9A-F]{2})?[0-9A-F]{2}|./).length - 1;
};
exports.isAlphanumeric = function (s) {
    return /^[a-z0-9]+$/i.test(s);
};
exports.isAlphanumericExtended = function (s) {
    return /^[a-z0-9-_ ]+$/i.test(s);
};
exports.isHexKey = function (hex) {
    return /^[0-9A-Fa-f]{64}$/.test(hex);
};
exports.isLogosAccount = function (account) {
    if (/^lgs_[?:13]{1}[13-9-a-km-uw-z]{59}$/.test(account)) {
        var accountCrop = account.replace('lgs_', '');
        var keyBytes = decode(accountCrop.substring(0, 52));
        var hashBytes = decode(accountCrop.substring(52, 60));
        var blakeHash = new blake2b_1.default(5).update(keyBytes).digest().reverse();
        return equalArrays(hashBytes, blakeHash);
    }
    return false;
};
exports.accountFromHexKey = function (hex) {
    if (exports.isHexKey(hex)) {
        var keyBytes = exports.hexToUint8(hex);
        var checksumBytes = new blake2b_1.default(5).update(keyBytes).digest().reverse();
        var checksum = encode(checksumBytes);
        var account = encode(keyBytes);
        return 'lgs_' + account + checksum;
    }
    else if (exports.isLogosAccount(hex)) {
        return hex;
    }
    else {
        throw new Error("Failed to execute 'accountFromHexKey' on '" + hex + "': The hex provided is not a valid hex.");
    }
};
exports.keyFromAccount = function (account) {
    if (/^lgs_[?:13]{1}[13-9-a-km-uw-z]{59}$/.test(account)) {
        var accountCrop = account.replace('lgs_', '');
        var keyBytes = decode(accountCrop.substring(0, 52));
        var hashBytes = decode(accountCrop.substring(52, 60));
        var blakeHash = new blake2b_1.default(5).update(keyBytes).digest().reverse();
        if (equalArrays(hashBytes, blakeHash)) {
            return exports.uint8ToHex(keyBytes).toUpperCase();
        }
        else {
            throw new Error("Failed to execute 'keyFromAccount' on '" + account + "': The checksum of the address is not valid.");
        }
    }
    else if (exports.isHexKey(account)) {
        return account;
    }
    else {
        throw new Error("Failed to execute 'keyFromAccount' on '" + account + "': The account is not a valid logos address.");
    }
};
exports.default = {
    EMPTY_WORK: exports.EMPTY_WORK,
    GENESIS_HASH: exports.GENESIS_HASH,
    MAXUINT128: exports.MAXUINT128,
    minimumFee: exports.minimumFee,
    defaultRPC: exports.defaultRPC,
    defaultMQTT: exports.defaultMQTT,
    Iso10126: exports.Iso10126,
    AES: exports.AES,
    stringFromHex: exports.stringFromHex,
    stringToHex: exports.stringToHex,
    decToHex: exports.decToHex,
    hexToDec: exports.hexToDec,
    hexToUint8: exports.hexToUint8,
    uint8ToHex: exports.uint8ToHex,
    changeEndianness: exports.changeEndianness,
    isAlphanumeric: exports.isAlphanumeric,
    isAlphanumericExtended: exports.isAlphanumericExtended,
    byteCount: exports.byteCount,
    deserializeController: exports.deserializeController,
    deserializeControllers: exports.deserializeControllers,
    deserializeSettings: exports.deserializeSettings,
    serializeController: exports.serializeController,
    serializeControllers: exports.serializeControllers,
    convertObjectToArray: exports.convertObjectToArray,
    keyFromAccount: exports.keyFromAccount,
    accountFromHexKey: exports.accountFromHexKey,
    isLogosAccount: exports.isLogosAccount
};
//# sourceMappingURL=Utils.js.map