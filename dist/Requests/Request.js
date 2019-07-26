"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Utils_1 = require("../Utils/Utils");
var blake2b_1 = require("../Utils/blake2b");
var nacl = require("tweetnacl/nacl");
var logos_rpc_client_1 = require("@logosnetwork/logos-rpc-client");
/**
 * The base class for all Requests.
 */
var Request = /** @class */ (function () {
    function Request(options) {
        if (options === void 0) { options = {
            origin: null,
            previous: null,
            sequence: null,
            fee: null,
            signature: null,
            timestamp: null,
            work: Utils_1.EMPTY_WORK,
            type: null
        }; }
        /**
         * Signature of the request
         * @type {string}
         * @private
         */
        if (options.signature !== undefined) {
            this._signature = options.signature;
        }
        else {
            this._signature = null;
        }
        /**
         * Work of the request based on previous hash
         * @type {Hexadecimal16Length}
         * @private
         */
        if (options.work !== undefined) {
            this._work = options.work;
        }
        else {
            this._work = Utils_1.EMPTY_WORK;
        }
        /**
         * Previous request hash
         * @type {string}
         * @private
         */
        if (options.previous !== undefined) {
            this._previous = options.previous;
        }
        else {
            this._previous = null;
        }
        /**
         * Fee of the request
         * @type {string}
         * @private
         */
        if (options.fee !== undefined) {
            this._fee = options.fee;
        }
        else {
            this._fee = null;
        }
        /**
         * Logos account address of the request origin account
         * @type {string}
         * @private
         */
        if (options.origin !== undefined) {
            this._origin = options.origin;
        }
        else {
            this._origin = null;
        }
        /**
         * Sequence of the request in the chain
         * @type {number}
         * @private
         */
        if (options.sequence !== undefined) {
            this._sequence = parseInt(options.sequence.toString());
        }
        else {
            this._sequence = null;
        }
        /**
         * Timestamp of the request (this might not be perfectly accurate)
         * @type {string}
         * @private
         */
        if (options.timestamp !== undefined) {
            this._timestamp = options.timestamp;
        }
        else {
            this._timestamp = null;
        }
        /**
         * Request version of webwallet SDK
         * @type {number}
         * @private
         */
        this._version = 1;
        this._published = false;
    }
    Object.defineProperty(Request.prototype, "published", {
        get: function () {
            return this._published;
        },
        set: function (val) {
            this._published = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Request.prototype, "signature", {
        /**
         * Return the signature of the request
         * @type {string}
         * @readonly
         */
        get: function () {
            return this._signature;
        },
        set: function (hex) {
            this._signature = hex;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Request.prototype, "work", {
        /**
         * Return the work of the request
         * @type {string}
         */
        get: function () {
            return this._work;
        },
        set: function (hex) {
            if (!this._previous)
                throw new Error('Previous is not set.');
            this._work = hex;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Request.prototype, "previous", {
        /**
         * Return the previous request as hash
         * @type {string}
         */
        get: function () {
            return this._previous;
        },
        set: function (hex) {
            if (!/[0-9A-F]{64}/i.test(hex))
                throw new Error('Invalid previous request hash.');
            this._previous = hex;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Request.prototype, "fee", {
        /**
         * Return the string amount of the fee in reason
         * @type {string}
         */
        get: function () {
            return this._fee;
        },
        set: function (val) {
            this._fee = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Request.prototype, "sequence", {
        /**
         * Return the the sequence of the request in the origin account
         * @type {number}
         */
        get: function () {
            return this._sequence;
        },
        set: function (val) {
            this._sequence = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Request.prototype, "timestamp", {
        /**
         * Return the the timestamp of when the request was confirmed
         * @type {number}
         */
        get: function () {
            return this._timestamp;
        },
        set: function (timestamp) {
            this._timestamp = timestamp;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Request.prototype, "origin", {
        /**
         * The origin account public key
         * @type {string}
         * @readonly
         */
        get: function () {
            return Utils_1.keyFromAccount(this._origin);
        },
        set: function (origin) {
            this._origin = origin;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Request.prototype, "originAccount", {
        /**
         * The origin account address
         * @type {string}
         * @readonly
         */
        get: function () {
            return this._origin;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Request.prototype, "type", {
        /**
         * Returns the type of this request
         * @type {string}
         * @readonly
         */
        get: function () {
            return this._type.text;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Request.prototype, "typeValue", {
        /**
         * Returns the type value of this request
         * @type {number}
         * @readonly
         */
        get: function () {
            return this._type.value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Request.prototype, "version", {
        /**
         * Returns the version of this request
         * @type {number}
         * @readonly
         */
        get: function () {
            return this._version;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Creates a signature for the request
     * @param {string} privateKey - private key in hex
     * @returns {boolean} if the signature is valid
     */
    Request.prototype.sign = function (privateKey) {
        var uint8Key = Utils_1.hexToUint8(privateKey);
        if (uint8Key.length !== 32)
            throw new Error('Invalid Private Key length. Should be 32 bytes.');
        var hash = Utils_1.hexToUint8(this.hash);
        this.signature = Utils_1.uint8ToHex(nacl.sign.detached(hash, uint8Key));
        return this.verify();
    };
    /**
     * Creates a Blake2b Context for the request
     * @returns {context} - Blake2b Context
     */
    Request.prototype.requestHash = function () {
        if (!this.previous)
            throw new Error('Previous is not set.');
        if (this.sequence === null)
            throw new Error('Sequence is not set.');
        if (this.fee === null)
            throw new Error('Transaction fee is not set.');
        if (!this.origin)
            throw new Error('Origin account is not set.');
        if (!this.type)
            throw new Error('Request type is not defined.');
        return new blake2b_1.default()
            .update(Utils_1.hexToUint8(Utils_1.decToHex(this.typeValue, 1)))
            .update(Utils_1.hexToUint8(this.origin))
            .update(Utils_1.hexToUint8(this.previous))
            .update(Utils_1.hexToUint8(Utils_1.decToHex(this.fee, 16)))
            .update(Utils_1.hexToUint8(Utils_1.changeEndianness(Utils_1.decToHex(this.sequence, 4))));
    };
    /**
     * Verifies the request's integrity
     * @returns {boolean}
     */
    Request.prototype.verify = function () {
        if (!this.hash)
            throw new Error('Hash is not set.');
        if (!this.signature)
            throw new Error('Signature is not set.');
        if (!this.origin)
            throw new Error('Origin account is not set.');
        return nacl.sign.detached.verify(Utils_1.hexToUint8(this.hash), Utils_1.hexToUint8(this.signature), Utils_1.hexToUint8(this.origin));
    };
    /**
     * Publishes the request
     * @param {RPCOptions} options - rpc options
     * @returns {Promise<{hash:string}>} response of transcation publish
     */
    Request.prototype.publish = function (options) {
        if (options === void 0) { options = Utils_1.defaultRPC; }
        return __awaiter(this, void 0, void 0, function () {
            var delegateId, RPC, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        delegateId = null;
                        if (this.previous !== Utils_1.GENESIS_HASH) {
                            delegateId = parseInt(this.previous.slice(-2), 16) % 32;
                        }
                        else {
                            // TODO 104 if token id and not token_send or issuance then use that else use origin
                            delegateId = parseInt(this.origin.slice(-2), 16) % 32;
                        }
                        RPC = new logos_rpc_client_1.default({
                            url: "http://" + options.delegates[delegateId] + ":55000",
                            proxyURL: options.proxy
                        });
                        console.info("Publishing " + this.type + " " + this.sequence + " to Delegate " + delegateId);
                        return [4 /*yield*/, RPC.requests.publish(JSON.stringify(this.toJSON()))];
                    case 1:
                        response = _a.sent();
                        if (response.hash) {
                            console.info("Delegate " + delegateId + " accepted " + this.type + " " + this.sequence);
                            return [2 /*return*/, response];
                        }
                        else {
                            console.error("Invalid Request: Rejected by Logos Node \n " + JSON.stringify(response));
                            throw new Error("Invalid Request: Rejected by Logos Node \n " + JSON.stringify(response));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Returns the base request JSON
     * @returns {RequestJSON} RequestJSON as string
     */
    Request.prototype.toJSON = function () {
        var obj = {};
        obj.previous = this.previous;
        obj.sequence = this.sequence;
        obj.origin = this._origin;
        obj.fee = this.fee;
        obj.work = this.work;
        obj.hash = this.hash;
        obj.type = this.type;
        obj.signature = this.signature;
        if (this.timestamp)
            obj.timestamp = this.timestamp;
        return obj;
    };
    return Request;
}());
exports.default = Request;
//# sourceMappingURL=Request.js.map