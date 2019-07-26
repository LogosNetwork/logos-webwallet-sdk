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
var Utils_1 = require("./Utils/Utils");
var Requests_1 = require("./Requests");
var TokenAccount_1 = require("./TokenAccount");
var Account = /** @class */ (function () {
    function Account(options) {
        var _newTarget = this.constructor;
        if (options === void 0) { options = {
            label: null,
            address: null,
            publicKey: null,
            balance: '0',
            pendingBalance: '0',
            wallet: null,
            chain: [],
            receiveChain: [],
            pendingChain: [],
            version: 1
        }; }
        if (_newTarget === Account) {
            throw new TypeError('Cannot construct Account instances directly. Account is an abstract class.');
        }
        /**
         * Label of this account
         *
         * This allows you to set a readable string for each account.
         *
         * @type {string}
         * @private
         */
        if (options.label !== undefined) {
            this._label = options.label;
        }
        else {
            this._label = null;
        }
        /**
         * Address of this account
         * @type {string}
         * @private
         */
        if (options.address !== undefined) {
            this._address = options.address;
        }
        else {
            this._address = null;
        }
        /**
         * Public Key of this account
         * @type {string}
         * @private
         */
        if (options.publicKey !== undefined) {
            this._publicKey = options.publicKey;
        }
        else {
            this._publicKey = null;
        }
        /**
         * Balance of this account in reason
         * @type {string}
         * @private
         */
        if (options.balance !== undefined) {
            this._balance = options.balance;
        }
        else {
            this._balance = '0';
        }
        /**
         * Pending Balance of the account in reason
         *
         * pending balance is balance minus the sends that are pending
         * @type {string}
         * @private
         */
        if (options.pendingBalance !== undefined) {
            this._pendingBalance = options.pendingBalance;
        }
        else {
            this._pendingBalance = '0';
        }
        /**
         * Chain of the account
         * @type {Request[]}
         * @private
         */
        if (options.chain !== undefined) {
            this._chain = [];
            for (var _i = 0, _a = options.chain; _i < _a.length; _i++) {
                var request = _a[_i];
                if (request.type === 'send') {
                    this._chain.push(new Requests_1.Send(request));
                }
                else if (request.type === 'token_send') {
                    this._chain.push(new Requests_1.TokenSend(request));
                }
                else if (request.type === 'issuance') {
                    this._chain.push(new Requests_1.Issuance(request));
                }
                else if (request.type === 'issue_additional') {
                    this._chain.push(new Requests_1.IssueAdditional(request));
                }
                else if (request.type === 'change_setting') {
                    this._chain.push(new Requests_1.ChangeSetting(request));
                }
                else if (request.type === 'immute_setting') {
                    this._chain.push(new Requests_1.ImmuteSetting(request));
                }
                else if (request.type === 'revoke') {
                    this._chain.push(new Requests_1.Revoke(request));
                }
                else if (request.type === 'adjust_user_status') {
                    this._chain.push(new Requests_1.AdjustUserStatus(request));
                }
                else if (request.type === 'adjust_fee') {
                    this._chain.push(new Requests_1.AdjustFee(request));
                }
                else if (request.type === 'update_issuer_info') {
                    this._chain.push(new Requests_1.UpdateIssuerInfo(request));
                }
                else if (request.type === 'update_controller') {
                    this._chain.push(new Requests_1.UpdateController(request));
                }
                else if (request.type === 'burn') {
                    this._chain.push(new Requests_1.Burn(request));
                }
                else if (request.type === 'distribute') {
                    this._chain.push(new Requests_1.Distribute(request));
                }
                else if (request.type === 'withdraw_fee') {
                    this._chain.push(new Requests_1.WithdrawFee(request));
                }
                else if (request.type === 'withdraw_logos') {
                    this._chain.push(new Requests_1.WithdrawLogos(request));
                }
            }
        }
        else {
            this._chain = [];
        }
        /**
         * Receive chain of the account
         * @type {Request[]}
         * @private
         */
        if (options.receiveChain !== undefined) {
            this._receiveChain = [];
            for (var _b = 0, _c = options.receiveChain; _b < _c.length; _b++) {
                var request = _c[_b];
                if (request.type === 'send') {
                    this._receiveChain.push(new Requests_1.Send(request));
                }
                else if (request.type === 'token_send') {
                    this._receiveChain.push(new Requests_1.TokenSend(request));
                }
                else if (request.type === 'distribute') {
                    this._receiveChain.push(new Requests_1.Distribute(request));
                }
                else if (request.type === 'withdraw_fee') {
                    this._receiveChain.push(new Requests_1.WithdrawFee(request));
                }
                else if (request.type === 'revoke') {
                    this._receiveChain.push(new Requests_1.Revoke(request));
                }
                else if (request.type === 'withdraw_logos') {
                    this._receiveChain.push(new Requests_1.WithdrawLogos(request));
                }
                else if (request.type === 'issuance') {
                    this._receiveChain.push(new Requests_1.Issuance(request));
                }
            }
        }
        else {
            this._receiveChain = [];
        }
        /**
         * Pending chain of the account (local unconfirmed sends)
         * @type {Request[]}
         * @private
         */
        if (options.pendingChain !== undefined) {
            this._pendingChain = [];
            for (var _d = 0, _e = options.pendingChain; _d < _e.length; _d++) {
                var request = _e[_d];
                if (request.type === 'send') {
                    this._pendingChain.push(new Requests_1.Send(request));
                }
                else if (request.type === 'token_send') {
                    this._pendingChain.push(new Requests_1.TokenSend(request));
                }
                else if (request.type === 'issuance') {
                    this._pendingChain.push(new Requests_1.Issuance(request));
                }
                else if (request.type === 'issue_additional') {
                    this._pendingChain.push(new Requests_1.IssueAdditional(request));
                }
                else if (request.type === 'change_setting') {
                    this._pendingChain.push(new Requests_1.ChangeSetting(request));
                }
                else if (request.type === 'immute_setting') {
                    this._pendingChain.push(new Requests_1.ImmuteSetting(request));
                }
                else if (request.type === 'revoke') {
                    this._pendingChain.push(new Requests_1.Revoke(request));
                }
                else if (request.type === 'adjust_user_status') {
                    this._pendingChain.push(new Requests_1.AdjustUserStatus(request));
                }
                else if (request.type === 'adjust_fee') {
                    this._pendingChain.push(new Requests_1.AdjustFee(request));
                }
                else if (request.type === 'update_issuer_info') {
                    this._pendingChain.push(new Requests_1.UpdateIssuerInfo(request));
                }
                else if (request.type === 'update_controller') {
                    this._pendingChain.push(new Requests_1.UpdateController(request));
                }
                else if (request.type === 'burn') {
                    this._pendingChain.push(new Requests_1.Burn(request));
                }
                else if (request.type === 'distribute') {
                    this._pendingChain.push(new Requests_1.Distribute(request));
                }
                else if (request.type === 'withdraw_fee') {
                    this._pendingChain.push(new Requests_1.WithdrawFee(request));
                }
                else if (request.type === 'withdraw_logos') {
                    this._pendingChain.push(new Requests_1.WithdrawLogos(request));
                }
            }
        }
        else {
            this._pendingChain = [];
        }
        /**
         * Previous hexadecimal hash of the last confirmed or pending request
         * @type {string}
         * @private
         */
        this._previous = null;
        /**
         * Sequence number of the last confirmed or pending request plus one
         * @type {number}
         * @private
         */
        this._sequence = null;
        /**
         * Account version of webwallet SDK
         * @type {number}
         * @private
         */
        if (options.version !== undefined) {
            this._version = options.version;
        }
        else {
            this._version = 1;
        }
        /**
         * The Wallet this account belongs to
         * @type {Wallet}
         * @private
         */
        if (options.wallet !== undefined) {
            this._wallet = options.wallet;
        }
        else {
            this._wallet = null;
        }
        this._synced = false;
    }
    Object.defineProperty(Account.prototype, "label", {
        /**
         * The label of the account
         * @type {string}
         */
        get: function () {
            if (this._label !== null) {
                return this._label;
            }
            else if (this instanceof TokenAccount_1.default) {
                return this.name + " (" + this.symbol + ")";
            }
            return null;
        },
        set: function (label) {
            this._label = label;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Account.prototype, "address", {
        /**
         * The address of the account
         * @type {string}
         * @readonly
         */
        get: function () {
            return this._address;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Account.prototype, "publicKey", {
        /**
         * The public key of the account
         * @type {string}
         * @readonly
         */
        get: function () {
            return this._publicKey;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Account.prototype, "balance", {
        /**
         * The balance of the account in reason
         * @type {string}
         */
        get: function () {
            return this._balance;
        },
        set: function (amount) {
            this._balance = amount;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Account.prototype, "pendingBalance", {
        /**
         * The pending balance of the account in reason
         *
         * pending balance is balance minus the sends that are pending
         *
         * @type {string}
         * @readonly
         */
        get: function () {
            return this._pendingBalance;
        },
        set: function (amount) {
            this._pendingBalance = amount;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Account.prototype, "wallet", {
        /**
         * The wallet this account belongs to
         * @type {Wallet}
         * @readonly
         */
        get: function () {
            return this._wallet;
        },
        set: function (wallet) {
            this._wallet = wallet;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Account.prototype, "chain", {
        /**
         * array of confirmed requests on the account
         * @type {Request[]}
         */
        get: function () {
            return this._chain;
        },
        set: function (val) {
            this._chain = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Account.prototype, "receiveChain", {
        /**
         * array of confirmed receive requests on the account
         * @type {Request[]}
         */
        get: function () {
            return this._receiveChain;
        },
        set: function (val) {
            this._receiveChain = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Account.prototype, "pendingChain", {
        /**
         * array of pending requests on the account
         *
         * These requests have been sent for consensus but we haven't heard back on if they are confirmed yet.
         *
         * @type {Request[]}
         */
        get: function () {
            return this._pendingChain;
        },
        set: function (val) {
            this._pendingChain = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Account.prototype, "requestCount", {
        /**
         * Gets the total number of requests on the send chain
         *
         * @type {number} count of all the requests
         * @readonly
         */
        get: function () {
            return this._chain.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Account.prototype, "pendingRequestCount", {
        /**
         * Gets the total number of requests on the pending chain
         *
         * @type {number} count of all the requests
         * @readonly
         */
        get: function () {
            return this._pendingChain.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Account.prototype, "receiveCount", {
        /**
         * Gets the total number of requests on the receive chain
         *
         * @type {number} count of all the requests
         * @readonly
         */
        get: function () {
            return this._receiveChain.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Account.prototype, "previous", {
        /**
         * Return the previous request as hash
         * @type {string}
         * @returns {string} hash of the previous transaction
         * @readonly
         */
        get: function () {
            if (this._pendingChain.length > 0) {
                this._previous = this._pendingChain[this.pendingChain.length - 1].hash;
            }
            else if (this._chain.length > 0) {
                this._previous = this._chain[this._chain.length - 1].hash;
            }
            else {
                this._previous = Utils_1.GENESIS_HASH;
            }
            return this._previous;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Account.prototype, "sequence", {
        /**
         * Return the sequence value
         * @type {number}
         * @returns {number} sequence of for the next transaction
         * @readonly
         */
        get: function () {
            if (this._pendingChain.length > 0) {
                this._sequence = this._pendingChain[this.pendingChain.length - 1].sequence;
            }
            else if (this._chain.length > 0) {
                this._sequence = this._chain[this._chain.length - 1].sequence;
            }
            else {
                this._sequence = -1;
            }
            return this._sequence + 1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Account.prototype, "synced", {
        /**
         * If the account has been synced with the RPC
         * @type {boolean}
         */
        get: function () {
            return this._synced;
        },
        set: function (val) {
            this._synced = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Account.prototype, "version", {
        /**
         * Account version of webwallet SDK
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
     * Verify the integrity of the send & pending chains
     *
     * @returns {boolean}
     */
    Account.prototype.verifyChain = function () {
        var last = Utils_1.GENESIS_HASH;
        for (var _i = 0, _a = this.chain; _i < _a.length; _i++) {
            var request = _a[_i];
            if (request) {
                if (request.previous !== last)
                    throw new Error('Invalid Chain (prev != current hash)');
                if (!request.verify())
                    throw new Error('Invalid request in this chain');
                last = request.hash;
            }
        }
        for (var _b = 0, _c = this.pendingChain; _b < _c.length; _b++) {
            var request = _c[_b];
            if (request) {
                if (request.previous !== last)
                    throw new Error('Invalid Pending Chain (prev != current hash)');
                if (!request.verify())
                    throw new Error('Invalid request in the pending chain');
                last = request.hash;
            }
        }
        return true;
    };
    /**
     * Verify the integrity of the receive chain
     *
     * @throws An exception if there is an invalid request in the receive requestchain
     * @returns {boolean}
     */
    Account.prototype.verifyReceiveChain = function () {
        for (var _i = 0, _a = this.receiveChain; _i < _a.length; _i++) {
            var request = _a[_i];
            if (!request.verify())
                throw new Error('Invalid request in the receive chain');
        }
        return true;
    };
    /**
     * Retreives requests from the send chain
     *
     * @param {number} count - Number of requests you wish to retrieve
     * @param {number} offset - Number of requests back from the frontier tip you wish to start at
     * @returns {Request[]} all the requests
     */
    Account.prototype.recentRequests = function (count, offset) {
        if (count === void 0) { count = 5; }
        if (offset === void 0) { offset = 0; }
        var requests = [];
        if (count > this._chain.length)
            count = this._chain.length;
        for (var i = this._chain.length - 1 - offset; i > this._chain.length - 1 - count - offset; i--) {
            requests.push(this._chain[i]);
        }
        return requests;
    };
    /**
     * Retreives pending requests from the send chain
     *
     * @param {number} count - Number of requests you wish to retrieve
     * @param {number} offset - Number of requests back from the frontier tip you wish to start at
     * @returns {Request[]} all the requests
     */
    Account.prototype.recentPendingRequests = function (count, offset) {
        if (count === void 0) { count = 5; }
        if (offset === void 0) { offset = 0; }
        var requests = [];
        if (count > this._pendingChain.length)
            count = this._pendingChain.length;
        for (var i = this._pendingChain.length - 1 - offset; i > this._pendingChain.length - 1 - count - offset; i--) {
            requests.push(this._pendingChain[i]);
        }
        return requests;
    };
    /**
     * Retreives requests from the receive chain
     *
     * @param {number} count - Number of requests you wish to retrieve
     * @param {number} offset - Number of requests back from the frontier tip you wish to start at
     * @returns {Request[]} all the requests
     */
    Account.prototype.recentReceiveRequests = function (count, offset) {
        if (count === void 0) { count = 5; }
        if (offset === void 0) { offset = 0; }
        var requests = [];
        if (count > this._receiveChain.length)
            count = this._receiveChain.length;
        for (var i = this._receiveChain.length - 1 - offset; i > this._receiveChain.length - 1 - count - offset; i--) {
            requests.push(this._receiveChain[i]);
        }
        return requests;
    };
    /**
     * Gets the requests up to a certain hash from the send chain
     *
     * @param {string} hash - Hash of the request you wish to stop retrieving requests at
     * @returns {Request[]} all the requests up to and including the specified request
     */
    Account.prototype.getRequestsUpTo = function (hash) {
        var requests = [];
        for (var i = this._chain.length - 1; i > 0; i--) {
            requests.push(this._chain[i]);
            if (this._chain[i].hash === hash)
                break;
        }
        return requests;
    };
    /**
     * Gets the requests up to a certain hash from the pending chain
     *
     * @param {string} hash - Hash of the request you wish to stop retrieving requests at
     * @returns {Request[]} all the requests up to and including the specified request
     */
    Account.prototype.getPendingRequestsUpTo = function (hash) {
        var requests = [];
        for (var i = this._pendingChain.length - 1; i > 0; i--) {
            requests.push(this._pendingChain[i]);
            if (this._pendingChain[i].hash === hash)
                break;
        }
        return requests;
    };
    /**
     * Gets the requests up to a certain hash from the receive chain
     *
     * @param {string} hash - Hash of the request you wish to stop retrieving requests at
     * @returns {Request[]} all the requests up to and including the specified request
     */
    Account.prototype.getReceiveRequestsUpTo = function (hash) {
        var requests = [];
        for (var i = this._receiveChain.length - 1; i > 0; i--) {
            requests.push(this._receiveChain[i]);
            if (this._receiveChain[i].hash === hash)
                break;
        }
        return requests;
    };
    /**
     * Removes all pending requests from the pending chain
     * @returns {void}
     */
    Account.prototype.removePendingRequests = function () {
        this._pendingChain = [];
        this._pendingBalance = this._balance;
    };
    /**
     * Called when a request is confirmed to remove it from the pending request pool
     *
     * @param {string} hash - The hash of the request we are confirming
     * @returns {boolean} true or false if the pending request was found and removed
     */
    Account.prototype.removePendingRequest = function (hash) {
        for (var i in this._pendingChain) {
            var request = this._pendingChain[i];
            if (request.hash === hash) {
                this._pendingChain.splice(parseInt(i), 1);
                return true;
            }
        }
        console.warn('Not found');
        return false;
    };
    /**
     * Finds the request object of the specified request hash
     *
     * @param {string} hash - The hash of the request we are looking for
     * @returns {Request} null if no request object of the specified hash was found
     */
    Account.prototype.getRequest = function (hash) {
        for (var j = this._chain.length - 1; j >= 0; j--) {
            var blk = this._chain[j];
            if (blk.hash === hash)
                return blk;
        }
        for (var n = this._receiveChain.length - 1; n >= 0; n--) {
            var blk = this._receiveChain[n];
            if (blk.hash === hash)
                return blk;
        }
        for (var n = this._pendingChain.length - 1; n >= 0; n--) {
            var blk = this._receiveChain[n];
            if (blk.hash === hash)
                return blk;
        }
        return null;
    };
    /**
     * Finds the request object of the specified request hash in the confirmed chain
     *
     * @param {string} hash - The hash of the request we are looking for
     * @returns {Request} false if no request object of the specified hash was found
     */
    Account.prototype.getChainRequest = function (hash) {
        for (var j = this._chain.length - 1; j >= 0; j--) {
            var blk = this._chain[j];
            if (blk.hash === hash)
                return blk;
        }
        return null;
    };
    /**
     * Finds the request object of the specified request hash in the pending chain
     *
     * @param {string} hash - The hash of the request we are looking for
     * @returns {Request} false if no request object of the specified hash was found
     */
    Account.prototype.getPendingRequest = function (hash) {
        for (var n = this._pendingChain.length - 1; n >= 0; n--) {
            var request = this._pendingChain[n];
            if (request.hash === hash)
                return request;
        }
        return null;
    };
    /**
     * Finds the request object of the specified request hash in the recieve chain
     *
     * @param {string} hash - The hash of the request we are looking for
     * @returns {Request} false if no request object of the specified hash was found
     */
    Account.prototype.getRecieveRequest = function (hash) {
        for (var n = this._receiveChain.length - 1; n >= 0; n--) {
            var blk = this._receiveChain[n];
            if (blk.hash === hash)
                return blk;
        }
        return null;
    };
    /**
     * Adds the request to the Receive chain if it doesn't already exist
     *
     * @param {Request} request - Request Object
     * @returns {void}
     */
    Account.prototype.addToReceiveChain = function (request) {
        var addBlock = true;
        for (var j = this._receiveChain.length - 1; j >= 0; j--) {
            var blk = this._receiveChain[j];
            if (blk.hash === request.hash) {
                addBlock = false;
                break;
            }
        }
        if (addBlock)
            this._receiveChain.push(request);
    };
    /**
     * Adds the request to the Send chain if it doesn't already exist
     *
     * @param {Request} request - Request Object
     * @returns {void}
     */
    Account.prototype.addToSendChain = function (request) {
        var addBlock = true;
        for (var j = this._chain.length - 1; j >= 0; j--) {
            var blk = this._chain[j];
            if (blk.hash === request.hash) {
                addBlock = false;
                break;
            }
        }
        if (addBlock)
            this._chain.push(request);
    };
    /**
     * Broadcasts the first pending request
     *
     * @returns {Promise<Request>}
     */
    Account.prototype.broadcastRequest = function () {
        return __awaiter(this, void 0, void 0, function () {
            var request, _a, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(this.wallet.rpc && this._pendingChain.length > 0)) return [3 /*break*/, 8];
                        request = this._pendingChain[0];
                        _a = !request.published;
                        if (!_a) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.validateRequest(request)];
                    case 1:
                        _a = (_b.sent());
                        _b.label = 2;
                    case 2:
                        if (!_a) return [3 /*break*/, 7];
                        request.published = true;
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, request.publish(this.wallet.rpc)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        err_1 = _b.sent();
                        console.error(err_1);
                        this.removePendingRequests();
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/, request];
                    case 7:
                        console.info("Request is already pending!");
                        _b.label = 8;
                    case 8: return [2 /*return*/, null];
                }
            });
        });
    };
    /**
     * Adds the request to the pending chain and publishes it
     *
     * @param {Request} request - Request information from the RPC or MQTT
     * @throws An exception if the pending balance is less than the required amount to adjust a users status
     * @returns {Promise<Request>}
     */
    Account.prototype.addRequest = function (request) {
        this._pendingChain.push(request);
        return this.broadcastRequest();
    };
    /**
     * Returns the base account JSON
     * @returns {AccountJSON} JSON request
     */
    Account.prototype.toJSON = function () {
        var obj = {};
        obj.label = this.label;
        obj.address = this.address;
        obj.publicKey = this.publicKey;
        obj.balance = this.balance;
        obj.chain = [];
        for (var _i = 0, _a = this.chain; _i < _a.length; _i++) {
            var request = _a[_i];
            obj.chain.push(request.toJSON());
        }
        obj.receiveChain = [];
        for (var _b = 0, _c = this.receiveChain; _b < _c.length; _b++) {
            var request = _c[_b];
            obj.receiveChain.push(request.toJSON());
        }
        obj.version = this.version;
        return obj;
    };
    return Account;
}());
exports.default = Account;
//# sourceMappingURL=Account.js.map