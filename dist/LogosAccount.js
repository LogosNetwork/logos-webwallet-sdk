"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var bigInt = require("big-integer");
var Account_1 = require("./Account");
var Requests_1 = require("./Requests");
/**
 * The Accounts contain the keys, chains, and balances.
 */
var LogosAccount = /** @class */ (function (_super) {
    __extends(LogosAccount, _super);
    function LogosAccount(options) {
        if (options === void 0) { options = {
            privateKey: null,
            tokenBalances: {},
            tokens: [],
            pendingTokenBalances: {},
            index: null
        }; }
        var _this = _super.call(this, options) || this;
        /**
         * Deterministic Key Index used to generate this account - null means generated explicitly
         *
         * @type {number}
         * @private
         */
        if (options.index !== undefined) {
            _this._index = options.index;
        }
        else {
            _this._index = null;
        }
        /**
         * Private Key of this account
         * @type {string}
         * @private
         */
        if (options.privateKey !== undefined) {
            _this._privateKey = options.privateKey;
        }
        else {
            _this._privateKey = null;
        }
        /**
         * Tokens that are associated with your account
         * @type {string[]}
         * @private
         */
        if (options.tokens !== undefined) {
            _this._tokens = options.tokens;
        }
        else {
            _this._tokens = [];
        }
        /**
         * Token Balance of the token account in base unit of tokens
         * @type {TokenBalances}
         * @private
         */
        if (options.tokenBalances !== undefined) {
            _this._tokenBalances = options.tokenBalances;
        }
        else {
            _this._tokenBalances = {};
        }
        /**
         * Pending Token Balance of the token account in base unit of tokens
         *
         * pending token balance is the token balance minus the token sends that are pending
         * @type {TokenBalances}
         * @private
         */
        if (options.pendingTokenBalances !== undefined) {
            _this._pendingTokenBalances = options.pendingTokenBalances;
        }
        else {
            _this._pendingTokenBalances = {};
        }
        return _this;
    }
    Object.defineProperty(LogosAccount.prototype, "type", {
        /**
         * The type of the account (LogosAccount or TokenAccount)
         * @type {string}
         */
        get: function () {
            return 'LogosAccount';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LogosAccount.prototype, "index", {
        /**
         * The index of the account
         * @type {number}
         * @readonly
         */
        get: function () {
            return this._index;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LogosAccount.prototype, "privateKey", {
        /**
         * The private key of the account
         * @type {string}
         * @readonly
         */
        get: function () {
            return this._privateKey;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LogosAccount.prototype, "tokens", {
        /**
         * Array of associated token ids to this account (full list available only with fullsync)
         * @type {string[]}
         * @readonly
         */
        get: function () {
            return this._tokens;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LogosAccount.prototype, "tokenBalances", {
        /**
         * The balance of the tokens in base token unit
         * @type {TokenBalances}
         * @readonly
         */
        get: function () {
            return this._tokenBalances;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LogosAccount.prototype, "pendingTokenBalances", {
        /**
         * The pending token balance of the account in base token
         *
         * pending token balance is balance minus the token sends that are pending
         *
         * @type {TokenBalances}
         * @readonly
         */
        get: function () {
            return this._pendingTokenBalances;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * The balance of the given token in the base units
     * @param {string} tokenID - Token ID of the token in question, you can also send the token account address
     * @returns {string} the token account info object
     * @readonly
     */
    LogosAccount.prototype.tokenBalance = function (token) {
        return this.tokenBalances[Utils_1.keyFromAccount(token)];
    };
    /**
     * Adds a token to the accounts associated tokens if it doesn't already exist
     *
     * @param {string} tokenID - The TokenID you are associating with this account (this will be converted into a token account when stored)
     * @returns {string[]} Array of all the associated tokens
     */
    LogosAccount.prototype.addToken = function (tokenID) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenAddress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tokenAddress = Utils_1.accountFromHexKey(tokenID);
                        if (!!this.tokens.includes(tokenAddress)) return [3 /*break*/, 2];
                        this.tokens.push(tokenAddress);
                        if (!this.wallet.tokenSync) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.wallet.createTokenAccount(tokenAddress)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, this.tokens];
                }
            });
        });
    };
    /**
     * Checks if the account is synced
     * @returns {Promise<SyncedResponse>}
     */
    LogosAccount.prototype.isSynced = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var RPC = _this.wallet.rpcClient();
            RPC.accounts.info(_this.address).then(function (info) { return __awaiter(_this, void 0, void 0, function () {
                var synced, receiveBlock;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            synced = true;
                            if (!(info && info.frontier)) return [3 /*break*/, 3];
                            if (info.frontier !== Utils_1.GENESIS_HASH) {
                                if (this.chain.length === 0 || this.chain[this.chain.length - 1].hash !== info.frontier) {
                                    synced = false;
                                }
                            }
                            if (!synced) return [3 /*break*/, 2];
                            return [4 /*yield*/, RPC.requests.info(info.receive_tip)];
                        case 1:
                            receiveBlock = _a.sent();
                            if (this.receiveChain.length === 0 || this.receiveChain[this.receiveChain.length - 1].hash !== receiveBlock.send_hash) {
                                synced = false;
                            }
                            _a.label = 2;
                        case 2:
                            if (synced) {
                                this.updateBalancesFromChain();
                                if (this.wallet.validateSync) {
                                    if (this.verifyChain() && this.verifyReceiveChain()) {
                                        this.synced = synced;
                                        console.info(this.address + " has been fully synced and validated");
                                        resolve({ account: this.address, synced: this.synced, type: 'LogosAccount' });
                                    }
                                }
                                else {
                                    console.info("Finished Syncing: Requests were not validated");
                                    this.synced = synced;
                                    resolve({ account: this.address, synced: this.synced, type: 'LogosAccount' });
                                }
                            }
                            else {
                                this.synced = synced;
                                resolve({ account: this.address, synced: this.synced, type: 'LogosAccount' });
                            }
                            return [3 /*break*/, 4];
                        case 3:
                            if (this.receiveChain.length === 0 && this.chain.length === 0) {
                                console.info(this.address + " is empty and therefore valid");
                                this.synced = synced;
                                resolve({ account: this.address, synced: this.synced, type: 'LogosAccount' });
                            }
                            else {
                                console.error(this.address + " is not opened according to the RPC. This is a critical error if in a production enviroment. On testnet this just means the network has been restarted.");
                                this.synced = false;
                                resolve({ account: this.address, synced: this.synced, type: 'LogosAccount' });
                            }
                            _a.label = 4;
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
        });
    };
    /**
     * Scans the account history using RPC and updates the local chain
     * @returns {Promise<Account>}
     */
    LogosAccount.prototype.sync = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.synced = false;
            _this.chain = [];
            _this.receiveChain = [];
            _this.pendingChain = [];
            _this._tokenBalances = {};
            _this.balance = '0';
            _this.pendingBalance = '0';
            _this._tokens = [];
            _this._pendingTokenBalances = {};
            var RPC = _this.wallet.rpcClient();
            if (_this.wallet.fullSync) {
                RPC.accounts.history(_this.address, -1, true).then(function (history) { return __awaiter(_this, void 0, void 0, function () {
                    var _i, _a, requestInfo;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                if (!history) return [3 /*break*/, 5];
                                _i = 0, _a = history.reverse();
                                _b.label = 1;
                            case 1:
                                if (!(_i < _a.length)) return [3 /*break*/, 4];
                                requestInfo = _a[_i];
                                return [4 /*yield*/, this.addConfirmedRequest(requestInfo)];
                            case 2:
                                _b.sent();
                                _b.label = 3;
                            case 3:
                                _i++;
                                return [3 /*break*/, 1];
                            case 4:
                                this.updateBalancesFromChain();
                                if (this.wallet.validateSync) {
                                    if (this.verifyChain() && this.verifyReceiveChain()) {
                                        this.synced = true;
                                        console.info(this.address + " has been fully synced and validated");
                                        resolve(this);
                                    }
                                }
                                else {
                                    console.info("Finished Syncing: Requests were not validated");
                                    this.synced = true;
                                    resolve(this);
                                }
                                return [3 /*break*/, 6];
                            case 5:
                                this.synced = true;
                                console.info(this.address + " is empty and therefore valid");
                                resolve(this);
                                _b.label = 6;
                            case 6: return [2 /*return*/];
                        }
                    });
                }); });
            }
            else {
                RPC.accounts.info(_this.address).then(function (info) {
                    if (info && info.frontier && info.frontier !== Utils_1.GENESIS_HASH) {
                        RPC.requests.info(info.frontier).then(function (val) { return __awaiter(_this, void 0, void 0, function () {
                            var request, tokenBalances, _i, _a, _b, tokenID, accountInfo;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0: return [4 /*yield*/, this.addConfirmedRequest(val)];
                                    case 1:
                                        request = _c.sent();
                                        if (request !== null && !request.verify()) {
                                            throw new Error("Invalid Request from RPC sync! \n " + JSON.stringify(request.toJSON(), null, 2));
                                        }
                                        if (info.balance) {
                                            this.balance = info.balance;
                                            this.pendingBalance = info.balance;
                                        }
                                        tokenBalances = {};
                                        if (info.tokens) {
                                            for (_i = 0, _a = Object.entries(info.tokens); _i < _a.length; _i++) {
                                                _b = _a[_i], tokenID = _b[0], accountInfo = _b[1];
                                                this.addToken(tokenID);
                                                tokenBalances[tokenID] = accountInfo.balance;
                                            }
                                            this._tokenBalances = tokenBalances;
                                            this._pendingTokenBalances = tokenBalances;
                                        }
                                        this.synced = true;
                                        console.info(this.address + " has been lazy synced");
                                        resolve(this);
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                    }
                    else {
                        if (info) {
                            if (info.balance) {
                                _this.balance = info.balance;
                                _this.pendingBalance = info.balance;
                            }
                            var tokenBalances = {};
                            if (info.tokens) {
                                for (var _i = 0, _a = Object.entries(info.tokens); _i < _a.length; _i++) {
                                    var _b = _a[_i], tokenID = _b[0], accountInfo = _b[1];
                                    _this.addToken(tokenID);
                                    tokenBalances[tokenID] = accountInfo.balance;
                                }
                                _this._tokenBalances = tokenBalances;
                                _this._pendingTokenBalances = tokenBalances;
                            }
                        }
                        _this.synced = true;
                        console.info(_this.address + " is empty and therefore valid");
                        resolve(_this);
                    }
                });
            }
        });
    };
    /**
     * Updates the balances of the account by traversing the chain
     * @returns {void}
     */
    LogosAccount.prototype.updateBalancesFromChain = function () {
        var sum = bigInt(0);
        var tokenSums = {};
        for (var _i = 0, _a = this.receiveChain; _i < _a.length; _i++) {
            var request = _a[_i];
            if (request instanceof Requests_1.Send) {
                for (var _b = 0, _c = request.transactions; _b < _c.length; _b++) {
                    var transaction = _c[_b];
                    if (transaction.destination === this.address) {
                        sum = sum.plus(bigInt(transaction.amount));
                    }
                }
            }
            else if (request instanceof Requests_1.WithdrawLogos) {
                if (request.transaction.destination === this.address) {
                    sum = sum.plus(bigInt(request.transaction.amount));
                }
            }
            else if (request instanceof Requests_1.TokenSend) {
                for (var _d = 0, _e = request.transactions; _d < _e.length; _d++) {
                    var transaction = _e[_d];
                    if (transaction.destination === this.address) {
                        tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).plus(bigInt(transaction.amount)).toString();
                    }
                }
            }
            else if (request instanceof Requests_1.Distribute || request instanceof Requests_1.WithdrawFee || request instanceof Requests_1.Revoke) {
                if (request.transaction.destination === this.address) {
                    tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).plus(bigInt(request.transaction.amount)).toString();
                }
                if (request instanceof Requests_1.Revoke && request.source === this.address) {
                    tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).minus(bigInt(request.transaction.amount)).toString();
                }
            }
        }
        for (var _f = 0, _g = this.chain; _f < _g.length; _f++) {
            var request = _g[_f];
            if (request instanceof Requests_1.Send) {
                sum = sum.minus(bigInt(request.totalAmount)).minus(bigInt(request.fee));
            }
            else if (request instanceof Requests_1.TokenSend) {
                tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).minus(bigInt(request.totalAmount)).minus(bigInt(request.tokenFee)).toString();
                sum = sum.minus(bigInt(request.fee));
            }
            else if (request instanceof Requests_1.Issuance) {
                sum = sum.minus(bigInt(request.fee));
            }
        }
        this.balance = sum.toString();
        this._tokenBalances = tokenSums;
        for (var _h = 0, _j = this.pendingChain; _h < _j.length; _h++) {
            var pendingRequest = _j[_h];
            if (pendingRequest instanceof Requests_1.Send) {
                sum = sum.minus(bigInt(pendingRequest.totalAmount)).minus(bigInt(pendingRequest.fee));
                for (var _k = 0, _l = pendingRequest.transactions; _k < _l.length; _k++) {
                    var transaction = _l[_k];
                    if (transaction.destination === this.address) {
                        sum = sum.plus(bigInt(transaction.amount));
                    }
                }
            }
            else if (pendingRequest instanceof Requests_1.TokenSend) {
                sum = sum.minus(bigInt(pendingRequest.fee));
                tokenSums[pendingRequest.tokenID] = bigInt(tokenSums[pendingRequest.tokenID]).minus(bigInt(pendingRequest.totalAmount)).minus(bigInt(pendingRequest.tokenFee)).toString();
                for (var _m = 0, _o = pendingRequest.transactions; _m < _o.length; _m++) {
                    var transaction = _o[_m];
                    if (transaction.destination === this.address) {
                        tokenSums[pendingRequest.tokenID] = bigInt(tokenSums[pendingRequest.tokenID]).plus(bigInt(transaction.amount)).toString();
                    }
                }
            }
            else if (pendingRequest.type === 'issuance') {
                sum = sum.minus(bigInt(pendingRequest.fee));
            }
        }
        this.pendingBalance = sum.toString();
        this._pendingTokenBalances = tokenSums;
    };
    /**
     * Updates the balances of the account by doing math on the previous balance when given a new request
     * Also updates the pending balance based on the new balance and the pending chain
     * @param {Request} request - request that is being calculated on
     * @returns {void}
     */
    LogosAccount.prototype.updateBalancesFromRequest = function (request) {
        var sum = bigInt(this.balance);
        var tokenSums = this.tokenBalances;
        if (request instanceof Requests_1.Send) {
            if (request.originAccount === this.address) {
                sum = sum.minus(bigInt(request.totalAmount)).minus(bigInt(request.fee));
            }
            for (var _i = 0, _a = request.transactions; _i < _a.length; _i++) {
                var transaction = _a[_i];
                if (transaction.destination === this.address) {
                    sum = sum.plus(bigInt(transaction.amount));
                }
            }
        }
        else if (request instanceof Requests_1.TokenSend) {
            sum = sum.minus(bigInt(request.fee));
            if (request.originAccount === this.address) {
                tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).minus(bigInt(request.totalAmount)).minus(bigInt(request.tokenFee)).toString();
            }
            for (var _b = 0, _c = request.transactions; _b < _c.length; _b++) {
                var transaction = _c[_b];
                if (transaction.destination === this.address) {
                    tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).plus(bigInt(transaction.amount)).toString();
                }
            }
        }
        else if (request instanceof Requests_1.Issuance) {
            sum = sum.minus(bigInt(request.fee));
        }
        else if (request instanceof Requests_1.WithdrawLogos) {
            if (request.transaction.destination === this.address) {
                sum = sum.plus(bigInt(request.transaction.amount));
            }
        }
        else if (request instanceof Requests_1.Distribute || request instanceof Requests_1.WithdrawFee || request instanceof Requests_1.Revoke) {
            if (request.transaction.destination === this.address) {
                tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).plus(bigInt(request.transaction.amount)).toString();
            }
            if (request instanceof Requests_1.Revoke && request.source === this.address) {
                tokenSums[request.tokenID] = bigInt(tokenSums[request.tokenID]).minus(bigInt(request.transaction.amount)).toString();
            }
        }
        this.balance = sum.toString();
        this._tokenBalances = __assign({}, tokenSums);
        for (var _d = 0, _e = this.pendingChain; _d < _e.length; _d++) {
            var pendingRequest = _e[_d];
            if (pendingRequest instanceof Requests_1.Send) {
                sum = sum.minus(bigInt(pendingRequest.totalAmount)).minus(bigInt(pendingRequest.fee));
                for (var _f = 0, _g = pendingRequest.transactions; _f < _g.length; _f++) {
                    var transaction = _g[_f];
                    if (transaction.destination === this.address) {
                        sum = sum.plus(bigInt(transaction.amount));
                    }
                }
            }
            else if (pendingRequest instanceof Requests_1.TokenSend) {
                sum = sum.minus(bigInt(pendingRequest.fee));
                tokenSums[pendingRequest.tokenID] = bigInt(tokenSums[pendingRequest.tokenID]).minus(bigInt(pendingRequest.totalAmount)).minus(bigInt(pendingRequest.tokenFee)).toString();
                for (var _h = 0, _j = pendingRequest.transactions; _h < _j.length; _h++) {
                    var transaction = _j[_h];
                    if (transaction.destination === this.address) {
                        tokenSums[pendingRequest.tokenID] = bigInt(tokenSums[pendingRequest.tokenID]).plus(bigInt(transaction.amount)).toString();
                    }
                }
            }
            else if (pendingRequest.type === 'issuance') {
                sum = sum.minus(bigInt(pendingRequest.fee));
            }
        }
        this.pendingBalance = sum.toString();
        this._pendingTokenBalances = __assign({}, tokenSums);
    };
    /**
     * Creates a request object from the mqtt info and adds the request to the appropriate chain
     *
     * @param {RequestOptions} requestInfo - Request information from the RPC or MQTT
     * @returns {Request}
     */
    LogosAccount.prototype.addConfirmedRequest = function (requestInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var request, _i, _a, trans;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        request = null;
                        if (!requestInfo.token_id) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.addToken(requestInfo.token_id)];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        if (requestInfo.type === 'send' || requestInfo.type === 'token_send') {
                            if (requestInfo.type === 'send') {
                                request = new Requests_1.Send(requestInfo);
                            }
                            else {
                                request = new Requests_1.TokenSend(requestInfo);
                            }
                            // If this request was created by us
                            // add the request to confirmed chain
                            if (request.originAccount === this.address) {
                                this.addToSendChain(request);
                            }
                            // If the request has transactions pointed to us
                            // add the request to the receive chain
                            if (request.transactions && request.transactions.length > 0) {
                                for (_i = 0, _a = request.transactions; _i < _a.length; _i++) {
                                    trans = _a[_i];
                                    if (trans.destination === this.address) {
                                        this.addToReceiveChain(request);
                                        break;
                                    }
                                }
                            }
                            return [2 /*return*/, request];
                        }
                        else if (requestInfo.type === 'issuance') {
                            request = new Requests_1.Issuance(requestInfo);
                            this.addToSendChain(request);
                            return [2 /*return*/, request];
                        }
                        else if (requestInfo.type === 'distribute') {
                            request = new Requests_1.Distribute(requestInfo);
                            this.addToReceiveChain(request);
                            return [2 /*return*/, request];
                        }
                        else if (requestInfo.type === 'withdraw_fee') {
                            request = new Requests_1.WithdrawFee(requestInfo);
                            this.addToReceiveChain(request);
                            return [2 /*return*/, request];
                        }
                        else if (requestInfo.type === 'revoke') {
                            request = new Requests_1.Revoke(requestInfo);
                            this.addToReceiveChain(request);
                            return [2 /*return*/, request];
                        }
                        else if (requestInfo.type === 'withdraw_logos') {
                            request = new Requests_1.WithdrawLogos(requestInfo);
                            this.addToReceiveChain(request);
                            return [2 /*return*/, request];
                        }
                        else {
                            console.error("MQTT sent " + this.address + " an unknown block type: " + requestInfo.type + " hash: " + requestInfo.hash);
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Removes all pending requests from the pending chain
     * @returns {void}
     */
    LogosAccount.prototype.removePendingRequests = function () {
        _super.prototype.removePendingRequests.call(this);
        this._pendingTokenBalances = __assign({}, this.tokenBalances);
    };
    /**
     * Validates that the account has enough funds at the current time to publish the request
     *
     * @param {Request} request - Request Class
     * @returns {boolean}
     */
    LogosAccount.prototype.validateRequest = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenAccount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(request instanceof Requests_1.Send)) return [3 /*break*/, 1];
                        if (bigInt(this.balance).minus(bigInt(request.totalAmount)).minus(request.fee).lesser(0)) {
                            console.error("Invalid Request: Not Enough Funds including fee to send that amount");
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/, true];
                    case 1:
                        if (!(request instanceof Requests_1.TokenSend)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.getTokenAccount(request.tokenID)];
                    case 2:
                        tokenAccount = _a.sent();
                        if (bigInt(this.balance).minus(request.fee).lesser(0)) {
                            console.error("Invalid Token Send Request: Not Enough Logos to pay the logos fee for token sends");
                            return [2 /*return*/, false];
                        }
                        if (!this.tokenBalances[tokenAccount.tokenID]) {
                            console.error("Invalid Token Send Request: User doesn't have a token account with the specified token");
                            return [2 /*return*/, false];
                        }
                        if (tokenAccount.feeType === 'flat' && bigInt(tokenAccount.feeRate).greater(request.tokenFee)) {
                            console.error("Invalid Token Send Request: Requests token is less than the required flat token fee of " + tokenAccount.feeRate);
                            return [2 /*return*/, false];
                        }
                        if (tokenAccount.feeType === 'percentage' &&
                            bigInt(request.totalAmount)
                                .multiply(bigInt(tokenAccount.feeRate))
                                .divide(100)
                                .greater(bigInt(request.tokenFee))) {
                            console.error("Invalid Token Send Request: Requests token is less than the required percentage token fee of " + tokenAccount.feeRate + "%");
                            return [2 /*return*/, false];
                        }
                        if (bigInt(this.tokenBalances[tokenAccount.tokenID]).minus(bigInt(request.totalAmount)).minus(bigInt(request.tokenFee)).lesser(0)) {
                            console.error("Invalid Token Send Request: Not Enough Token to pay the token fee for token sends");
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/, true];
                    case 3:
                        if (request.type === 'issuance') {
                            if (bigInt(this.balance).minus(request.fee).lesser(0)) {
                                console.error("Invalid Issuance Request: Account does not have enough Logos to afford the fee to broadcast an issuance");
                                return [2 /*return*/, false];
                            }
                            return [2 /*return*/, true];
                        }
                        _a.label = 4;
                    case 4: return [2 /*return*/, false];
                }
            });
        });
    };
    /**
     * Adds the request to the pending chain and publishes it
     *
     * @param {Request} request - Request information from the RPC or MQTT
     * @throws An exception if the pending balance is less than the required amount to adjust a users status
     * @returns {Request}
     */
    LogosAccount.prototype.addRequest = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                request.sign(this.privateKey);
                return [2 /*return*/, _super.prototype.addRequest.call(this, request)];
            });
        });
    };
    /**
     * Creates a request from the specified information
     *
     * @param {Transaction[]} transactions - The account destinations and amounts you wish to send them
     * @throws An exception if the account has not been synced
     * @throws An exception if the pending balance is less than the required amount to do a send
     * @throws An exception if the request is rejected by the RPC
     * @returns {Promise<Request>} the request object
     */
    LogosAccount.prototype.createSendRequest = function (transactions) {
        return __awaiter(this, void 0, void 0, function () {
            var request, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.synced === false)
                            throw new Error('This account has not been synced or is being synced with the RPC network');
                        request = new Requests_1.Send({
                            signature: null,
                            previous: this.previous,
                            fee: Utils_1.minimumFee,
                            transactions: transactions,
                            sequence: this.sequence,
                            origin: this.address
                        });
                        if (!this.wallet.lazyErrors) {
                            if (bigInt(this.pendingBalance).minus(bigInt(request.totalAmount)).minus(request.fee).lesser(0)) {
                                throw new Error('Invalid Request: Not Enough Funds including fee to send that amount');
                            }
                        }
                        this.pendingBalance = bigInt(this.pendingBalance).minus(bigInt(request.totalAmount)).minus(request.fee).toString();
                        return [4 /*yield*/, this.addRequest(request)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Creates a request from the specified information
     *
     * @param {TokenIssuanceOptions} options - The options for the token creation
     * @throws An exception if the account has not been synced
     * @throws An exception if the pending balance is less than the required amount to do a token issuance
     * @throws An exception if the request is rejected by the RPC
     * @returns {Promise<Request>} the request object
     */
    LogosAccount.prototype.createTokenIssuanceRequest = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var request, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!options.name)
                            throw new Error('You must pass name as a part of the TokenOptions');
                        if (!options.symbol)
                            throw new Error('You must pass symbol as a part of the TokenOptions');
                        if (this.synced === false)
                            throw new Error('This account has not been synced or is being synced with the RPC network');
                        request = new Requests_1.Issuance({
                            signature: null,
                            previous: this.previous,
                            fee: Utils_1.minimumFee,
                            sequence: this.sequence,
                            origin: this.address,
                            name: options.name,
                            symbol: options.symbol
                        });
                        if (options.feeType) {
                            request.feeType = options.feeType;
                        }
                        if (options.feeRate) {
                            request.feeRate = options.feeRate;
                        }
                        if (options.totalSupply) {
                            request.totalSupply = options.totalSupply;
                        }
                        if (options.settings) {
                            request.settings = options.settings;
                        }
                        if (options.controllers) {
                            request.controllers = options.controllers;
                        }
                        if (options.issuerInfo) {
                            request.issuerInfo = options.issuerInfo;
                        }
                        if (!this.wallet.lazyErrors) {
                            if (bigInt(this.pendingBalance).minus(request.fee).lesser(0)) {
                                throw new Error('Invalid Request: Not Enough Logos to afford the fee to issue a token');
                            }
                        }
                        this.pendingBalance = bigInt(this.pendingBalance).minus(request.fee).toString();
                        return [4 /*yield*/, this.wallet.createTokenAccount(Utils_1.accountFromHexKey(request.tokenID), request)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.addRequest(request)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Gets tokenAccount
     *
     * @param {TokenRequest} options - Object contained the tokenID or tokenAccount
     * @throws An exception if no tokenID or tokenAccount
     * @returns {Promise<TokenAccount>} the token account info object
     */
    LogosAccount.prototype.getTokenAccount = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenAccount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof token === 'object' && token.token_id)
                            token = token.token_id;
                        if (typeof token === 'object' && token.tokenID)
                            token = token.tokenID;
                        if (typeof token === 'object' && token.tokenAccount)
                            token = token.tokenAccount;
                        if (typeof token === 'object' && token.token_account)
                            token = token.token_account;
                        if (!token || typeof token === 'object')
                            throw new Error('You must pass a token id or token account address for token actions');
                        return [4 /*yield*/, this.wallet.createTokenAccount(Utils_1.accountFromHexKey(token))];
                    case 1:
                        tokenAccount = _a.sent();
                        return [2 /*return*/, tokenAccount];
                }
            });
        });
    };
    /**
     * Creates a request from the specified information
     *
     * @param {string} token - The token address or token id
     * @param {Transaction} transactions - The account destinations and amounts you wish to send them
     * @throws An exception if the account has not been synced
     * @throws An exception if the pending balance is less than the required amount to do a send
     * @throws An exception if the request is rejected by the RPC
     * @returns {Promise<Request>} the request object
     */
    LogosAccount.prototype.createTokenSendRequest = function (token, transactions) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenAccount, request, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.synced === false)
                            throw new Error('This account has not been synced or is being synced with the RPC network');
                        if (!transactions)
                            throw new Error('You must pass transaction in the token send options');
                        if (!token)
                            throw new Error('You must pass token which is either tokenID or tokenAddress');
                        return [4 /*yield*/, this.getTokenAccount(token)];
                    case 1:
                        tokenAccount = _a.sent();
                        request = new Requests_1.TokenSend({
                            signature: null,
                            previous: this.previous,
                            fee: Utils_1.minimumFee,
                            sequence: this.sequence,
                            origin: this.address,
                            tokenID: tokenAccount.tokenID,
                            transactions: transactions
                        });
                        if (tokenAccount.feeType === 'flat') {
                            request.tokenFee = tokenAccount.feeRate.toString();
                        }
                        else {
                            request.tokenFee = bigInt(request.totalAmount).multiply(bigInt(tokenAccount.feeRate)).divide(100).toString();
                        }
                        if (!this.wallet.lazyErrors) {
                            if (bigInt(this.pendingBalance).minus(request.fee).lesser(0)) {
                                throw new Error('Invalid Request: Not Enough Logos to pay the logos fee for token sends');
                            }
                            if (bigInt(this.pendingTokenBalances[tokenAccount.tokenID]).minus(request.totalAmount).minus(request.tokenFee).lesser(0)) {
                                throw new Error('Invalid Request: Not Enough Token to pay the for the token fee and the token send amounts');
                            }
                        }
                        this.pendingBalance = bigInt(this.pendingBalance).minus(request.fee).toString();
                        this.pendingTokenBalances[tokenAccount.tokenID] = bigInt(this.pendingTokenBalances[tokenAccount.tokenID]).minus(bigInt(request.totalAmount)).minus(request.tokenFee).toString();
                        return [4 /*yield*/, this.addRequest(request)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Creates a IssueAdditional Token Request from the specified information
     *
     * @param {IssueAdditionalOptions} options - The Token ID & amount
     * @throws An exception if the token account balance is less than the required amount to do a issue additional token request
     * @returns {Promise<Request>} the request object
     */
    LogosAccount.prototype.createIssueAdditionalRequest = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenAccount, request, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTokenAccount(options)];
                    case 1:
                        tokenAccount = _a.sent();
                        if (options.amount === undefined)
                            throw new Error('You must pass amount in options');
                        request = new Requests_1.IssueAdditional({
                            signature: null,
                            previous: tokenAccount.previous,
                            fee: Utils_1.minimumFee,
                            sequence: tokenAccount.sequence,
                            origin: this.address,
                            tokenID: tokenAccount.tokenID,
                            amount: options.amount
                        });
                        request.sign(this.privateKey);
                        return [4 /*yield*/, tokenAccount.addRequest(request)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Creates a ChangeSetting Token Request from the specified information
     *
     * @param {ChangeSettingOptions} options - Token ID, setting, value
     * @throws An exception if the token account balance is less than the required amount to do a change setting token request
     * @returns {Promise<Request>} the request object
     */
    LogosAccount.prototype.createChangeSettingRequest = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenAccount, request, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTokenAccount(options)];
                    case 1:
                        tokenAccount = _a.sent();
                        request = new Requests_1.ChangeSetting({
                            signature: null,
                            previous: tokenAccount.previous,
                            fee: Utils_1.minimumFee,
                            sequence: tokenAccount.sequence,
                            origin: this.address,
                            tokenID: tokenAccount.tokenID
                        });
                        request.setting = options.setting;
                        request.value = options.value.toString() === 'true';
                        request.sign(this.privateKey);
                        return [4 /*yield*/, tokenAccount.addRequest(request)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Creates a ImmuteSetting Token Request from the specified information
     *
     * @param {ImmuteSettingOptions} options - Token ID, setting
     * @throws An exception if the token account balance is less than the required amount to do a immute setting token request
     * @returns {Promise<Request>} the request object
     */
    LogosAccount.prototype.createImmuteSettingRequest = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenAccount, request, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTokenAccount(options)];
                    case 1:
                        tokenAccount = _a.sent();
                        request = new Requests_1.ImmuteSetting({
                            signature: null,
                            previous: tokenAccount.previous,
                            fee: Utils_1.minimumFee,
                            sequence: tokenAccount.sequence,
                            origin: this.address,
                            tokenID: tokenAccount.tokenID
                        });
                        request.setting = options.setting;
                        request.sign(this.privateKey);
                        return [4 /*yield*/, tokenAccount.addRequest(request)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Creates a Revoke Token Request from the specified information
     *
     * @param {RevokeOptions} options - Token ID, transaction, source
     * @throws An exception if the token account balance is less than the required amount to do a Revoke token request
     * @returns {Promise<Request>} the request object
     */
    LogosAccount.prototype.createRevokeRequest = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenAccount, request, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTokenAccount(options)];
                    case 1:
                        tokenAccount = _a.sent();
                        if (!options.transaction)
                            throw new Error('You must pass transaction in the options');
                        if (!options.source)
                            throw new Error('You must source in the options');
                        request = new Requests_1.Revoke({
                            signature: null,
                            previous: tokenAccount.previous,
                            fee: Utils_1.minimumFee,
                            sequence: tokenAccount.sequence,
                            origin: this.address,
                            tokenID: tokenAccount.tokenID,
                            source: options.source,
                            transaction: options.transaction
                        });
                        request.sign(this.privateKey);
                        return [4 /*yield*/, tokenAccount.addRequest(request)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Creates a request from the specified information
     *
     * @param {AdjustUserStatusOptions} options - The Token ID, account, and status
     * @throws An exception if the pending balance is less than the required amount to adjust a users status
     * @returns {Promise<Request>} the request object
     */
    LogosAccount.prototype.createAdjustUserStatusRequest = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenAccount, request, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTokenAccount(options)];
                    case 1:
                        tokenAccount = _a.sent();
                        if (!options.account)
                            throw new Error('You must pass account in options');
                        request = new Requests_1.AdjustUserStatus({
                            signature: null,
                            previous: tokenAccount.previous,
                            fee: Utils_1.minimumFee,
                            sequence: tokenAccount.sequence,
                            origin: this.address,
                            tokenID: tokenAccount.tokenID,
                            account: options.account
                        });
                        request.status = options.status;
                        request.sign(this.privateKey);
                        return [4 /*yield*/, tokenAccount.addRequest(request)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Creates a request from the specified information
     *
     * @param {AdjustFeeOptions} options - The Token ID, feeRate, and feeType
     * @throws An exception if the pending balance is less than the required amount to do a token distibution
     * @returns {Promise<Request>} the request object
     */
    LogosAccount.prototype.createAdjustFeeRequest = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenAccount, request, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTokenAccount(options)];
                    case 1:
                        tokenAccount = _a.sent();
                        if (!options.feeRate)
                            throw new Error('You must pass feeRate in options');
                        if (!options.feeType)
                            throw new Error('You must pass feeType in options');
                        request = new Requests_1.AdjustFee({
                            signature: null,
                            previous: tokenAccount.previous,
                            fee: Utils_1.minimumFee,
                            sequence: tokenAccount.sequence,
                            origin: this.address,
                            tokenID: tokenAccount.tokenID,
                            feeRate: options.feeRate,
                            feeType: options.feeType
                        });
                        request.sign(this.privateKey);
                        return [4 /*yield*/, tokenAccount.addRequest(request)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Creates a request from the specified information
     *
     * @param {UpdateIssuerInfoOptions} options - The Token ID and issuerInfo
     * @throws An exception if the pending balance is less than the required amount to Update Issuer Info
     * @returns {Promise<Request>} the request object
     */
    LogosAccount.prototype.createUpdateIssuerInfoRequest = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenAccount, request, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTokenAccount(options)];
                    case 1:
                        tokenAccount = _a.sent();
                        if (!options.issuerInfo)
                            throw new Error('You must pass issuerInfo in the options');
                        request = new Requests_1.UpdateIssuerInfo({
                            signature: null,
                            previous: tokenAccount.previous,
                            fee: Utils_1.minimumFee,
                            sequence: tokenAccount.sequence,
                            origin: this.address,
                            tokenID: tokenAccount.tokenID
                        });
                        request.issuerInfo = options.issuerInfo;
                        request.sign(this.privateKey);
                        return [4 /*yield*/, tokenAccount.addRequest(request)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Creates a request from the specified information
     *
     * @param {UpdateControllerOptions} options - The Token ID, action ('add' or 'remove'), and controller
     * @throws An exception if the pending balance is less than the required amount to Update Controller
     * @returns {Promise<Request>} the request object
     */
    LogosAccount.prototype.createUpdateControllerRequest = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenAccount, request, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTokenAccount(options)];
                    case 1:
                        tokenAccount = _a.sent();
                        if (!options.controller)
                            throw new Error('You must pass controller in the options');
                        if (!options.action)
                            throw new Error('You must pass action in the options');
                        request = new Requests_1.UpdateController({
                            signature: null,
                            previous: tokenAccount.previous,
                            fee: Utils_1.minimumFee,
                            sequence: tokenAccount.sequence,
                            origin: this.address,
                            tokenID: tokenAccount.tokenID,
                            controller: options.controller
                        });
                        request.action = options.action;
                        request.sign(this.privateKey);
                        return [4 /*yield*/, tokenAccount.addRequest(request)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Creates a Burn Token Request from the specified information
     *
     * @param {BurnOptions} options - The Token ID & amount
     * @throws An exception if the token account balance is less than the required amount to do a burn token request
     * @returns {Promise<Request>} the request object
     */
    LogosAccount.prototype.createBurnRequest = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenAccount, request, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTokenAccount(options)];
                    case 1:
                        tokenAccount = _a.sent();
                        if (options.amount === undefined)
                            throw new Error('You must pass amount in options');
                        request = new Requests_1.Burn({
                            signature: null,
                            previous: tokenAccount.previous,
                            fee: Utils_1.minimumFee,
                            sequence: tokenAccount.sequence,
                            origin: this.address,
                            tokenID: tokenAccount.tokenID,
                            amount: options.amount
                        });
                        request.sign(this.privateKey);
                        return [4 /*yield*/, tokenAccount.addRequest(request)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Creates a request from the specified information
     *
     * @param {TokenDistributeOptions} options - The Token ID & transaction
     * @throws An exception if the pending balance is less than the required amount to do a token distibution
     * @returns {Promise<Request>} the request object
     */
    LogosAccount.prototype.createDistributeRequest = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenAccount, request, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTokenAccount(options)];
                    case 1:
                        tokenAccount = _a.sent();
                        if (!options.transaction)
                            throw new Error('You must pass transaction in options');
                        request = new Requests_1.Distribute({
                            signature: null,
                            previous: tokenAccount.previous,
                            fee: Utils_1.minimumFee,
                            sequence: tokenAccount.sequence,
                            origin: this.address,
                            tokenID: tokenAccount.tokenID,
                            transaction: options.transaction
                        });
                        request.sign(this.privateKey);
                        return [4 /*yield*/, tokenAccount.addRequest(request)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Creates a request from the specified information
     *
     * @param {WithdrawFeeOptions} options - The Token ID & transaction
     * @throws An exception if the pending balance is less than the required amount to do a withdraw fee request
     * @returns {Promise<Request>} the request object
     */
    LogosAccount.prototype.createWithdrawFeeRequest = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenAccount, request, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTokenAccount(options)];
                    case 1:
                        tokenAccount = _a.sent();
                        if (!options.transaction)
                            throw new Error('You must pass transaction in options');
                        request = new Requests_1.WithdrawFee({
                            signature: null,
                            previous: tokenAccount.previous,
                            fee: Utils_1.minimumFee,
                            sequence: tokenAccount.sequence,
                            origin: this.address,
                            tokenID: tokenAccount.tokenID,
                            transaction: options.transaction
                        });
                        request.sign(this.privateKey);
                        return [4 /*yield*/, tokenAccount.addRequest(request)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Creates a request from the specified information
     *
     * @param {WithdrawLogosOptions} options - The Token ID & transaction
     * @throws An exception if the pending balance is less than the required amount to do a withdraw logos request
     * @returns {Promise<Request>} the request object
     */
    LogosAccount.prototype.createWithdrawLogosRequest = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenAccount, request, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTokenAccount(options)];
                    case 1:
                        tokenAccount = _a.sent();
                        if (!options.transaction)
                            throw new Error('You must pass transaction in options');
                        request = new Requests_1.WithdrawLogos({
                            signature: null,
                            previous: tokenAccount.previous,
                            fee: Utils_1.minimumFee,
                            sequence: tokenAccount.sequence,
                            origin: this.address,
                            tokenID: tokenAccount.tokenID,
                            transaction: options.transaction
                        });
                        request.sign(this.privateKey);
                        return [4 /*yield*/, tokenAccount.addRequest(request)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Confirms the request in the local chain
     *
     * @param {MQTTRequestOptions} requestInfo The request from MQTT
     * @returns {Promise<void>}
     */
    LogosAccount.prototype.processRequest = function (requestInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.addConfirmedRequest(requestInfo)];
                    case 1:
                        request = _a.sent();
                        if (request !== null) {
                            if (!request.verify())
                                throw new Error("Invalid Request! \n " + JSON.stringify(request.toJSON(), null, 2));
                            if (request.originAccount === this.address &&
                                (request.type === 'send' || request.type === 'token_send' || request.type === 'issuance')) {
                                if (this.getPendingRequest(requestInfo.hash)) {
                                    this.removePendingRequest(requestInfo.hash);
                                }
                                else {
                                    console.error('Someone is sending blocks from this account that is not us!!!');
                                    // Remove all pendings as they are now invalidated
                                    // It is possible to update the pending blocks but this could
                                    // lead to unintended consequences so its best to just reset IMO
                                    this.removePendingRequests();
                                }
                            }
                            if (this.wallet.fullSync) {
                                this.updateBalancesFromChain();
                            }
                            else {
                                this.updateBalancesFromRequest(request);
                            }
                            if (this.shouldCombine()) {
                                this.combineRequests();
                            }
                            else {
                                this.broadcastRequest();
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Determines if you shold combine requests
     *
     * Returns true if the pending chain has x sends and
     * the count of total transactions is <= (x-minimumSaved) * 8
     *
     * @param {number} minimumSaved The minimum amount of requests saved in order to combine defaults to 1
     * @returns {boolean}
     */
    LogosAccount.prototype.shouldCombine = function (minimumSaved) {
        if (minimumSaved === void 0) { minimumSaved = 1; }
        if (this.wallet.batchSends) {
            var sendTxCount = 0;
            var sendCount = 0;
            var tokenTxCount = 0;
            var tokenCount = 0;
            for (var _i = 0, _a = this.pendingChain; _i < _a.length; _i++) {
                var request = _a[_i];
                if (request instanceof Requests_1.Send) {
                    sendCount++;
                    sendTxCount += request.transactions.length;
                }
                else if (request instanceof Requests_1.TokenSend) {
                    tokenCount++;
                    tokenTxCount += request.transactions.length;
                }
            }
            return ((sendTxCount <= (sendCount - minimumSaved) * 8) || (tokenTxCount <= (tokenCount - minimumSaved) * 8));
        }
        else {
            return false;
        }
    };
    /**
     * Batchs send requests
     *
     * @returns {Promise<void>}
     */
    LogosAccount.prototype.combineRequests = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sendCounter, tokenCounter, logosTransactionsToCombine, issuances, tokenTransactionsToCombine, _i, _a, request, _b, _c, transaction, tokenAggregates, _d, _e, transaction, _loop_1, _f, _g, _h, tokenID, tokenTransactions, sendPromises, _j, issuances_1, issuance;
            var _this = this;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        sendCounter = 0;
                        tokenCounter = 0;
                        logosTransactionsToCombine = [
                            []
                        ];
                        issuances = [];
                        tokenTransactionsToCombine = {};
                        for (_i = 0, _a = this.pendingChain; _i < _a.length; _i++) {
                            request = _a[_i];
                            if (request instanceof Requests_1.Send) {
                                for (_b = 0, _c = request.transactions; _b < _c.length; _b++) {
                                    transaction = _c[_b];
                                    if (logosTransactionsToCombine[sendCounter].length < 8) {
                                        logosTransactionsToCombine[sendCounter].push(transaction);
                                    }
                                    else {
                                        sendCounter++;
                                        logosTransactionsToCombine[sendCounter] = [transaction];
                                    }
                                }
                            }
                            else if (request instanceof Requests_1.TokenSend) {
                                tokenAggregates = [[]];
                                if (tokenTransactionsToCombine[request.tokenID]) {
                                    tokenAggregates = tokenTransactionsToCombine[request.tokenID];
                                }
                                for (_d = 0, _e = request.transactions; _d < _e.length; _d++) {
                                    transaction = _e[_d];
                                    if (tokenAggregates[tokenCounter].length < 8) {
                                        tokenAggregates[tokenCounter].push(transaction);
                                    }
                                    else {
                                        tokenCounter++;
                                        tokenAggregates[tokenCounter] = [transaction];
                                    }
                                }
                                tokenTransactionsToCombine[request.tokenID] = tokenAggregates;
                            }
                            else if (request.type === 'issuance') {
                                issuances.push(request);
                            }
                        }
                        // Clear Pending Chain
                        this.removePendingRequests();
                        _loop_1 = function (tokenID, tokenTransactions) {
                            var tokenPromises;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        tokenPromises = tokenTransactions.map(function (transactions) { return _this.createTokenSendRequest(tokenID, transactions); });
                                        return [4 /*yield*/, Promise.all(tokenPromises)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        };
                        _f = 0, _g = Object.entries(tokenTransactionsToCombine);
                        _k.label = 1;
                    case 1:
                        if (!(_f < _g.length)) return [3 /*break*/, 4];
                        _h = _g[_f], tokenID = _h[0], tokenTransactions = _h[1];
                        return [5 /*yield**/, _loop_1(tokenID, tokenTransactions)];
                    case 2:
                        _k.sent();
                        _k.label = 3;
                    case 3:
                        _f++;
                        return [3 /*break*/, 1];
                    case 4:
                        sendPromises = logosTransactionsToCombine.map(function (transactions) { return _this.createSendRequest(transactions); });
                        return [4 /*yield*/, Promise.all(sendPromises)
                            // Add Issuances
                        ];
                    case 5:
                        _k.sent();
                        // Add Issuances
                        if (issuances.length > 0) {
                            for (_j = 0, issuances_1 = issuances; _j < issuances_1.length; _j++) {
                                issuance = issuances_1[_j];
                                issuance.previous = this.previous;
                                issuance.sequence = this.sequence;
                                issuance.sign(this.privateKey);
                                this.pendingChain.push(issuance);
                            }
                            this.broadcastRequest();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Returns the logos account JSON
     * @returns {LogosAccountJSON} JSON request
     */
    LogosAccount.prototype.toJSON = function () {
        var obj = _super.prototype.toJSON.call(this);
        obj.privateKey = this.privateKey;
        obj.tokenBalances = this.tokenBalances;
        obj.tokens = this.tokens;
        obj.type = this.type;
        obj.index = this.index;
        return obj;
    };
    return LogosAccount;
}(Account_1.default));
exports.default = LogosAccount;
//# sourceMappingURL=LogosAccount.js.map