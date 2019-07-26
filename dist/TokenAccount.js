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
var bigInt = require("big-integer");
var Account_1 = require("./Account");
var Utils_1 = require("./Utils/Utils");
var Requests_1 = require("./Requests");
/**
 * TokenAccount contain the keys, chains, and balances.
 */
var TokenAccount = /** @class */ (function (_super) {
    __extends(TokenAccount, _super);
    // private _pendingTokenBalance: string
    // private _pendingTotalSupply: string
    function TokenAccount(options) {
        var _this = this;
        if (!options)
            throw new Error('You must pass settings to initalize the token account');
        if (!options.address && !options.tokenID)
            throw new Error('You must initalize a token account with an address or tokenID');
        if (!options.wallet)
            throw new Error('You must initalize a token account with a wallet');
        if (options.tokenID !== undefined) {
            options.publicKey = options.tokenID;
            options.address = Utils_1.accountFromHexKey(options.tokenID);
        }
        else if (options.address !== undefined) {
            options.publicKey = Utils_1.keyFromAccount(options.address);
        }
        _this = _super.call(this, options) || this;
        if (options.issuance !== undefined) {
            _this._tokenBalance = options.issuance.totalSupply;
            _this._totalSupply = options.issuance.totalSupply;
            _this._tokenFeeBalance = '0';
            _this._symbol = options.issuance.symbol;
            _this._name = options.issuance.name;
            _this._issuerInfo = options.issuance.issuerInfo;
            _this._feeRate = options.issuance.feeRate;
            _this._feeType = options.issuance.feeType;
            _this._controllers = options.issuance.controllersAsObject;
            _this._settings = options.issuance.settingsAsObject;
        }
        /**
         * Token Balance of the token account
         *
         * @type {string}
         * @private
         */
        if (options.tokenBalance !== undefined) {
            _this._tokenBalance = options.tokenBalance;
        }
        else {
            _this._tokenBalance = '0';
        }
        /**
         * Total Supply of tokens
         *
         * @type {string}
         * @private
         */
        if (options.totalSupply !== undefined) {
            _this._totalSupply = options.totalSupply;
        }
        else {
            _this._totalSupply = null;
        }
        /**
         * Token Fee Balance
         *
         * @type {string}
         * @private
         */
        if (options.tokenFeeBalance !== undefined) {
            _this._tokenFeeBalance = options.tokenFeeBalance;
        }
        else {
            _this._tokenFeeBalance = '0';
        }
        /**
         * Symbol of the token
         *
         * @type {string}
         * @private
         */
        if (options.symbol !== undefined) {
            _this._symbol = options.symbol;
        }
        else {
            _this._symbol = null;
        }
        /**
         * Name of the token
         *
         * @type {string}
         * @private
         */
        if (options.name !== undefined) {
            _this._name = options.name;
        }
        else {
            _this._name = 'Unknown Token';
        }
        /**
         * Issuer Info of the token
         * @type {string}
         * @private
         */
        if (options.issuerInfo !== undefined) {
            _this._issuerInfo = options.issuerInfo;
        }
        else {
            _this._issuerInfo = null;
        }
        /**
         * Fee Rate of the token
         *
         * @type {string}
         * @private
         */
        if (options.feeRate !== undefined) {
            _this._feeRate = options.feeRate;
        }
        else {
            _this._feeRate = null;
        }
        /**
         * Fee Type of the token
         *
         * @type {string}
         * @private
         */
        if (options.feeType !== undefined) {
            _this._feeType = options.feeType;
        }
        else {
            _this._feeType = null;
        }
        /**
         * Controllers of the token
         *
         * @type {string}
         * @private
         */
        if (options.controllers !== undefined) {
            _this._controllers = options.controllers;
        }
        else {
            _this._controllers = null;
        }
        /**
         * Settings of the token
         * @type {Settings}
         * @private
         */
        if (options.settings !== undefined) {
            _this._settings = options.settings;
        }
        else {
            _this._settings = {
                issuance: null,
                modify_issuance: null,
                revoke: null,
                modify_revoke: null,
                freeze: null,
                modify_freeze: null,
                adjust_fee: null,
                modify_adjust_fee: null,
                whitelist: null,
                modify_whitelist: null
            };
        }
        /**
         * Account Statuses
         *
         * @type {AccountStatuses}
         */
        if (options.accountStatuses !== undefined) {
            _this._accountStatuses = options.accountStatuses;
        }
        else {
            _this._accountStatuses = {};
        }
        return _this;
    }
    Object.defineProperty(TokenAccount.prototype, "type", {
        /**
         * The type of the account (LogosAccount or TokenAccount)
         * @type {string}
         */
        get: function () { return 'TokenAccount'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TokenAccount.prototype, "tokenID", {
        /**
         * The public key of the token account
         * @type {string}
         * @readonly
         */
        get: function () {
            return this.publicKey;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TokenAccount.prototype, "accountStatuses", {
        /**
         * The accounts statuses (Frozen / Whitelisted)
         * @type {string}
         * @readonly
         */
        get: function () {
            return this._accountStatuses;
        },
        set: function (statuses) {
            this._accountStatuses = statuses;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TokenAccount.prototype, "tokenBalance", {
        /**
         * The balance of the token in the base token unit
         * @type {string}
         * @readonly
         */
        get: function () {
            return this._tokenBalance;
        },
        set: function (val) {
            this._tokenBalance = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TokenAccount.prototype, "totalSupply", {
        /**
         * The total supply of the token in base token
         * @type {string}
         * @readonly
         */
        get: function () {
            return this._totalSupply;
        },
        set: function (val) {
            this._totalSupply = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TokenAccount.prototype, "tokenFeeBalance", {
        /**
         * The total supply of the token in base token
         * @type {string}
         * @readonly
         */
        get: function () {
            return this._tokenFeeBalance;
        },
        set: function (val) {
            this._tokenFeeBalance = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TokenAccount.prototype, "issuerInfo", {
        /**
         * The issuer info of the token
         * @type {string}
         */
        get: function () {
            return this._issuerInfo;
        },
        set: function (val) {
            this._issuerInfo = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TokenAccount.prototype, "symbol", {
        /**
         * The symbol of the token
         * @type {string}
         */
        get: function () {
            return this._symbol;
        },
        set: function (val) {
            this._symbol = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TokenAccount.prototype, "name", {
        /**
         * The name of the token
         * @type {string}
         */
        get: function () {
            return this._name;
        },
        set: function (val) {
            this._name = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TokenAccount.prototype, "feeRate", {
        /**
         * The fee rate of the token
         * @type {string}
         */
        get: function () {
            return this._feeRate;
        },
        set: function (val) {
            this._feeRate = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TokenAccount.prototype, "feeType", {
        /**
         * The fee type of the token
         * @type {feeType}
         */
        get: function () {
            return this._feeType;
        },
        set: function (val) {
            this._feeType = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TokenAccount.prototype, "settings", {
        /**
         * The settings of the token
         * @type {Settings}
         */
        get: function () {
            return this._settings;
        },
        set: function (val) {
            this._settings = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TokenAccount.prototype, "controllers", {
        /**
         * The controllers of the token
         * @type {Controller[]}
         */
        get: function () {
            return this._controllers;
        },
        set: function (val) {
            this._controllers = val;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Checks if the account is synced
     * @returns {Promise<SyncedResponse>}
     */
    TokenAccount.prototype.isSynced = function () {
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
                            this.tokenBalance = info.token_balance;
                            this.totalSupply = info.total_supply;
                            this.tokenFeeBalance = info.token_fee_balance;
                            this.symbol = info.symbol;
                            this.name = info.name;
                            this.issuerInfo = info.issuer_info;
                            this.feeRate = info.fee_rate;
                            this.feeType = info.fee_type;
                            this.controllers = Utils_1.deserializeControllers(info.controllers);
                            this.settings = Utils_1.deserializeSettings(info.settings);
                            this.balance = info.balance;
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
                                if (this.wallet.validateSync) {
                                    if (this.verifyChain() && this.verifyReceiveChain()) {
                                        this.synced = synced;
                                        console.info(info.name + " has been fully synced and validated");
                                        resolve({ account: this.address, synced: this.synced, type: 'TokenAccount' });
                                    }
                                }
                                else {
                                    console.info("Finished Syncing: Requests were not validated");
                                    this.synced = synced;
                                    resolve({ account: this.address, synced: this.synced, type: 'TokenAccount' });
                                }
                            }
                            else {
                                this.synced = synced;
                                resolve({ account: this.address, synced: this.synced, type: 'TokenAccount' });
                            }
                            return [3 /*break*/, 4];
                        case 3:
                            if (this.receiveChain.length === 0 && this.chain.length === 0) {
                                console.info(this.address + " is empty and therefore valid");
                                this.synced = synced;
                                resolve({ account: this.address, synced: this.synced, type: 'TokenAccount' });
                            }
                            else {
                                console.error(this.address + " is not opened according to the RPC. This is a critical error if in a production enviroment. On testnet this just means the network has been restarted.");
                                this.synced = false;
                                resolve({ account: this.address, synced: this.synced, type: 'TokenAccount', remove: true });
                            }
                            _a.label = 4;
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
        });
    };
    /**
     * Scans the account history using RPC and updates the local chains
     * @returns {Promise<Account>}
     */
    TokenAccount.prototype.sync = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.synced = false;
            _this.chain = [];
            _this.receiveChain = [];
            var RPC = _this.wallet.rpcClient();
            RPC.accounts.info(_this.address).then(function (info) {
                if (!info || !info.type || info.type !== 'TokenAccount') {
                    throw new Error('Invalid Address - This is not a valid token account');
                }
                _this.tokenBalance = info.token_balance;
                _this.totalSupply = info.total_supply;
                _this.tokenFeeBalance = info.token_fee_balance;
                _this.symbol = info.symbol;
                _this.name = info.name;
                _this.issuerInfo = info.issuer_info;
                _this.feeRate = info.fee_rate;
                _this.feeType = info.fee_type;
                _this.controllers = Utils_1.deserializeControllers(info.controllers);
                _this.settings = Utils_1.deserializeSettings(info.settings);
                _this.balance = info.balance;
                if (_this.wallet.fullSync) {
                    RPC.accounts.history(_this.address, -1, true).then(function (history) {
                        if (history) {
                            // Add Genesis to latest
                            for (var _i = 0, _a = history.reverse(); _i < _a.length; _i++) {
                                var requestInfo = _a[_i];
                                var request = _this.addConfirmedRequest(requestInfo);
                                if (request instanceof Requests_1.AdjustUserStatus) {
                                    _this.updateAccountStatusFromRequest(request);
                                }
                            }
                            if (_this.wallet.validateSync) {
                                if (_this.verifyChain() && _this.verifyReceiveChain()) {
                                    _this.synced = true;
                                    console.info(info.name + " has been fully synced and validated");
                                    resolve(_this);
                                }
                            }
                            else {
                                console.info("Finished Syncing: Requests were not validated");
                                _this.synced = true;
                                resolve(_this);
                            }
                        }
                        else {
                            _this.synced = true;
                            console.info(_this.address + " is empty and therefore valid");
                            resolve(_this);
                        }
                    });
                }
                else {
                    if (info && info.frontier && info.frontier !== Utils_1.GENESIS_HASH) {
                        RPC.requests.info(info.frontier).then(function (val) {
                            var request = _this.addConfirmedRequest(val);
                            if (request !== null && !request.verify()) {
                                throw new Error("Invalid Request from RPC sync! \n " + JSON.stringify(request.toJSON(), null, 2));
                            }
                            _this.synced = true;
                            console.info(info.name + " has been lazy synced");
                            resolve(_this);
                        });
                    }
                    else {
                        _this.synced = true;
                        console.info(_this.address + " is empty and therefore valid");
                        resolve(_this);
                    }
                }
            });
        });
    };
    /**
     * Updates the token account by comparing the RPC token account info with the changes in a new request
     * Also updates the pending balance based on the new balance and the pending chain
     * @param {Request} request - request that is being calculated on
     * @returns {void}
     */
    TokenAccount.prototype.updateTokenInfoFromRequest = function (request) {
        if (request instanceof Requests_1.IssueAdditional) {
            this.totalSupply = bigInt(this.totalSupply).plus(bigInt(request.amount)).toString();
            this.tokenBalance = bigInt(this.tokenBalance).plus(bigInt(request.amount)).toString();
        }
        else if (request instanceof Requests_1.ChangeSetting) {
            this.settings[request.setting] = request.value;
        }
        else if (request instanceof Requests_1.ImmuteSetting) {
            this.settings["modify_" + request.setting] = false;
        }
        else if (request instanceof Requests_1.Revoke) {
            if (request.transaction.destination === this.address) {
                this.tokenBalance = bigInt(this.tokenBalance).plus(bigInt(request.transaction.amount)).toString();
            }
            // Handle if TK account is SRC?
        }
        else if (request instanceof Requests_1.AdjustUserStatus) {
            this.updateAccountStatusFromRequest(request);
        }
        else if (request instanceof Requests_1.AdjustFee) {
            this.feeRate = request.feeRate;
            this.feeType = request.feeType;
        }
        else if (request instanceof Requests_1.UpdateIssuerInfo) {
            this.issuerInfo = request.issuerInfo;
        }
        else if (request instanceof Requests_1.UpdateController) {
            var updatedPrivs = Utils_1.serializeController(request.controller).privileges;
            if (request.action === 'remove' && updatedPrivs.length === 0) {
                this.controllers = this.controllers.filter(function (controller) { return controller.account !== request.controller.account; });
            }
            else if (request.action === 'remove' && updatedPrivs.length > 0) {
                for (var _i = 0, _a = this.controllers; _i < _a.length; _i++) {
                    var controller = _a[_i];
                    if (controller.account === request.controller.account) {
                        for (var _b = 0, updatedPrivs_1 = updatedPrivs; _b < updatedPrivs_1.length; _b++) {
                            var priv = updatedPrivs_1[_b];
                            controller.privileges[priv] = false;
                        }
                    }
                }
            }
            else if (request.action === 'add') {
                if (this.controllers.some(function (controller) { return controller.account === request.controller.account; })) {
                    for (var _c = 0, _d = this.controllers; _c < _d.length; _c++) {
                        var controller = _d[_c];
                        if (controller.account === request.controller.account) {
                            for (var _e = 0, updatedPrivs_2 = updatedPrivs; _e < updatedPrivs_2.length; _e++) {
                                var priv = updatedPrivs_2[_e];
                                controller.privileges[priv] = true;
                            }
                        }
                    }
                }
                else {
                    this.controllers.push(request.controller);
                }
            }
        }
        else if (request instanceof Requests_1.Burn) {
            this.totalSupply = bigInt(this.totalSupply).minus(bigInt(request.amount)).toString();
            this.tokenBalance = bigInt(this.tokenBalance).minus(bigInt(request.amount)).toString();
        }
        else if (request instanceof Requests_1.Distribute) {
            this.tokenBalance = bigInt(this.tokenBalance).minus(bigInt(request.transaction.amount)).toString();
        }
        else if (request instanceof Requests_1.WithdrawFee) {
            this.tokenFeeBalance = bigInt(this.tokenFeeBalance).minus(bigInt(request.transaction.amount)).toString();
        }
        else if (request instanceof Requests_1.WithdrawLogos) {
            if (request.tokenID === this.tokenID) {
                this.balance = bigInt(this.balance).minus(bigInt(request.transaction.amount)).minus(bigInt(request.fee)).toString();
            }
            if (request.transaction.destination === this.address) {
                this.balance = bigInt(this.balance).plus(bigInt(request.transaction.amount)).toString();
            }
        }
        else if (request instanceof Requests_1.Send) {
            for (var _f = 0, _g = request.transactions; _f < _g.length; _f++) {
                var transaction = _g[_f];
                if (transaction.destination === this.address) {
                    this.balance = bigInt(this.balance).plus(bigInt(transaction.amount)).toString();
                }
            }
        }
        else if (request instanceof Requests_1.Issuance) {
            this.tokenBalance = request.totalSupply;
            // this._pendingTokenBalance = request.totalSupply
            this.totalSupply = request.totalSupply;
            // this._pendingTotalSupply = request.totalSupply
            this.tokenFeeBalance = '0';
            this.symbol = request.symbol;
            this.name = request.name;
            this.issuerInfo = request.issuerInfo;
            this.feeRate = request.feeRate;
            this.feeType = request.feeType;
            this.controllers = request.controllersAsObject;
            this.settings = request.settingsAsObject;
            this.balance = '0';
            this.pendingBalance = '0';
        }
        else if (request.type === 'token_send') {
            if (request.tokenFee) {
                this.tokenFeeBalance = bigInt(this.tokenFeeBalance).plus(request.tokenFee).toString();
            }
        }
        if (request.type !== 'send' && request.type !== 'issuance' &&
            request.type !== 'token_send' && request.type !== 'withdraw_logos') {
            this.balance = bigInt(this.balance).minus(bigInt(request.fee)).toString();
        }
    };
    /**
     * Validates if the token account contains the controller
     *
     * @param {string} address - Address of the logos account you are checking if they are a controller
     * @returns {boolean}
     */
    TokenAccount.prototype.isController = function (address) {
        for (var _i = 0, _a = this.controllers; _i < _a.length; _i++) {
            var controller = _a[_i];
            if (controller.account === address) {
                return true;
            }
        }
        return false;
    };
    /**
     * Validates if the token has the setting
     *
     * @param {Setting} setting - Token setting you are checking
     * @returns {boolean}
     */
    TokenAccount.prototype.hasSetting = function (setting) {
        return Boolean(this.settings[setting]);
    };
    /**
     * Validates if the token account contains the controller and the controller has the specified privilege
     *
     * @param {string} address - Address of the controller you are checking
     * @param {privilege} privilege - Privilege you are checking for
     * @returns {boolean}
     */
    TokenAccount.prototype.controllerPrivilege = function (address, privilege) {
        for (var _i = 0, _a = this.controllers; _i < _a.length; _i++) {
            var controller = _a[_i];
            if (controller.account === address) {
                return controller.privileges[privilege];
            }
        }
        return false;
    };
    /**
     * Validates if the account has enough token funds to complete the transaction
     *
     * @param {string} address - Address of the controller you are checking
     * @param {string} amount - Amount you are checking for
     * @returns {Promise<boolean>}
     */
    TokenAccount.prototype.accountHasFunds = function (address, amount) {
        return __awaiter(this, void 0, void 0, function () {
            var RPC, info;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.wallet.rpc) return [3 /*break*/, 1];
                        console.warn('Cannot client-side validate if an account has funds without RPC enabled');
                        return [2 /*return*/, true];
                    case 1:
                        RPC = this.wallet.rpcClient();
                        return [4 /*yield*/, RPC.accounts.info(address)];
                    case 2:
                        info = _a.sent();
                        return [2 /*return*/, bigInt(info.tokens[this.tokenID].balance).greaterOrEquals(bigInt(amount))];
                }
            });
        });
    };
    /**
     * Validates if the account is a valid destination to send token funds to
     *
     * @param {string} address - Address of the controller you are checking
     * @returns {Promise<boolean>}
     */
    TokenAccount.prototype.validTokenDestination = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var RPC, info, tokenInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.wallet.rpc) return [3 /*break*/, 1];
                        console.warn('Cannot client-side validate destination without RPC enabled');
                        return [2 /*return*/, true];
                    case 1:
                        RPC = this.wallet.rpcClient();
                        return [4 /*yield*/, RPC.accounts.info(address)];
                    case 2:
                        info = _a.sent();
                        if (info.type !== 'LogosAccount')
                            return [2 /*return*/, false];
                        tokenInfo = null;
                        if (info && info.tokens && info.tokens[this.tokenID]) {
                            tokenInfo = info.tokens[this.tokenID];
                        }
                        if (!tokenInfo && this.hasSetting('whitelist')) {
                            return [2 /*return*/, false];
                        }
                        else if (!tokenInfo && !this.hasSetting('whitelist')) {
                            return [2 /*return*/, true];
                        }
                        else if (this.hasSetting('whitelist') && tokenInfo.whitelisted === 'false') {
                            return [2 /*return*/, false];
                        }
                        else if (tokenInfo.frozen === 'true') {
                            return [2 /*return*/, false];
                        }
                        else {
                            return [2 /*return*/, true];
                        }
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validates that the account has enough funds at the current time to publish the request
     *
     * @param {Request} request - Request information from the RPC or MQTT
     * @returns {Promise<boolean>}
     */
    TokenAccount.prototype.validateRequest = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!bigInt(this.balance).minus(request.fee).lesser(0)) return [3 /*break*/, 1];
                        console.error('Invalid Request: Token Account does not have enough Logos to afford the fee perform token opperation');
                        return [2 /*return*/, false];
                    case 1:
                        if (!(request instanceof Requests_1.IssueAdditional)) return [3 /*break*/, 2];
                        if (bigInt(this.totalSupply).plus(bigInt(request.amount)).greater(bigInt(Utils_1.MAXUINT128))) {
                            console.error('Invalid Issue Additional Request: Total Supply would exceed MAXUINT128');
                            return [2 /*return*/, false];
                        }
                        else if (!this.hasSetting('issuance')) {
                            console.error('Invalid Issue Additional Request: Token does not allow issuance');
                            return [2 /*return*/, false];
                        }
                        else if (!this.controllerPrivilege(request.originAccount, 'issuance')) {
                            console.error('Invalid Issue Additional Request: Controller does not have permission to issue additional tokens');
                            return [2 /*return*/, false];
                        }
                        else {
                            return [2 /*return*/, true];
                        }
                        return [3 /*break*/, 27];
                    case 2:
                        if (!(request instanceof Requests_1.ChangeSetting)) return [3 /*break*/, 3];
                        if (!this.hasSetting(this.settingToModify(request.setting))) {
                            console.error("Invalid Change Setting Request: " + this.name + " does not allow changing " + request.setting);
                            return [2 /*return*/, false];
                        }
                        else if (!this.controllerPrivilege(request.originAccount, this.settingToChange(request.setting))) {
                            console.error("Invalid Change Setting Request: Controller does not have permission to change " + request.setting);
                            return [2 /*return*/, false];
                        }
                        else {
                            return [2 /*return*/, true];
                        }
                        return [3 /*break*/, 27];
                    case 3:
                        if (!(request instanceof Requests_1.ImmuteSetting)) return [3 /*break*/, 4];
                        if (!this.hasSetting(this.settingToModify(request.setting))) {
                            console.error("Invalid Immute Setting Request: " + request.setting + " is already immuatable");
                            return [2 /*return*/, false];
                        }
                        else if (!this.controllerPrivilege(request.originAccount, this.settingToChangeModify(request.setting))) {
                            console.error("Invalid Immute Setting Request: Controller does not have permission to immute " + request.setting);
                            return [2 /*return*/, false];
                        }
                        else {
                            return [2 /*return*/, true];
                        }
                        return [3 /*break*/, 27];
                    case 4:
                        if (!(request instanceof Requests_1.Revoke)) return [3 /*break*/, 11];
                        if (!!this.hasSetting("revoke")) return [3 /*break*/, 5];
                        console.error("Invalid Revoke Request: " + this.name + " does not support revoking accounts");
                        return [2 /*return*/, false];
                    case 5:
                        if (!!this.controllerPrivilege(request.originAccount, "revoke")) return [3 /*break*/, 6];
                        console.error("Invalid Revoke Request: Controller does not have permission to issue revoke requests");
                        return [2 /*return*/, false];
                    case 6: return [4 /*yield*/, !this.accountHasFunds(request.source, request.transaction.amount)];
                    case 7:
                        if (!_a.sent()) return [3 /*break*/, 8];
                        console.error("Invalid Revoke Request: Source account does not have sufficient " + this.symbol + " to complete this request");
                        return [2 /*return*/, false];
                    case 8: return [4 /*yield*/, !this.validTokenDestination(request.transaction.destination)];
                    case 9:
                        if (_a.sent()) {
                            console.error("Invalid Revoke Request: Destination does not have permission to receive " + this.symbol);
                            return [2 /*return*/, false];
                        }
                        else {
                            return [2 /*return*/, true];
                        }
                        _a.label = 10;
                    case 10: return [3 /*break*/, 27];
                    case 11:
                        if (!(request instanceof Requests_1.AdjustUserStatus)) return [3 /*break*/, 12];
                        if (request.status === 'frozen' || request.status === 'unfrozen') {
                            if (!this.hasSetting("freeze")) {
                                console.error("Invalid Adjust User Status: " + this.name + " does not support freezing accounts");
                                return [2 /*return*/, false];
                            }
                            else if (!this.controllerPrivilege(request.originAccount, "freeze")) {
                                console.error("Invalid Adjust User Status Request: Controller does not have permission to freeze accounts");
                                return [2 /*return*/, false];
                            }
                            else {
                                return [2 /*return*/, true];
                            }
                        }
                        else if (request.status === 'whitelisted' || request.status === 'not_whitelisted') {
                            if (!this.hasSetting("whitelist")) {
                                console.error("Invalid Adjust User Status: " + this.name + " does not require whitelisting accounts");
                                return [2 /*return*/, false];
                            }
                            else if (!this.controllerPrivilege(request.originAccount, "revoke")) {
                                console.error("Invalid Adjust User Status Request: Controller does not have permission to whitelist accounts");
                                return [2 /*return*/, false];
                            }
                            else {
                                return [2 /*return*/, true];
                            }
                        }
                        else {
                            console.error("Invalid Adjust User Status: " + request.status + " is not a valid status");
                            return [2 /*return*/, false];
                        }
                        return [3 /*break*/, 27];
                    case 12:
                        if (!(request instanceof Requests_1.AdjustFee)) return [3 /*break*/, 13];
                        if (!this.hasSetting("adjust_fee")) {
                            console.error("Invalid Adjust Fee Request: " + this.name + " does not allow changing the fee type or fee rate");
                            return [2 /*return*/, false];
                        }
                        else if (!this.controllerPrivilege(request.originAccount, "adjust_fee")) {
                            console.error("Invalid Adjust Fee Request: Controller does not have permission to freeze accounts");
                            return [2 /*return*/, false];
                        }
                        else {
                            return [2 /*return*/, true];
                        }
                        return [3 /*break*/, 27];
                    case 13:
                        if (!(request instanceof Requests_1.UpdateIssuerInfo)) return [3 /*break*/, 14];
                        if (!this.controllerPrivilege(request.originAccount, "update_issuer_info")) {
                            console.error("Invalid Update Issuer Info Request: Controller does not have permission to update the issuer info");
                            return [2 /*return*/, false];
                        }
                        else {
                            return [2 /*return*/, true];
                        }
                        return [3 /*break*/, 27];
                    case 14:
                        if (!(request instanceof Requests_1.UpdateController)) return [3 /*break*/, 15];
                        if (!this.controllerPrivilege(request.originAccount, "update_controller")) {
                            console.error("Invalid Update Controller Request: Controller does not have permission to update controllers");
                            return [2 /*return*/, false];
                        }
                        else if (this.controllers.length === 10 && request.action === 'add' && !this.isController(request.controller.account)) {
                            console.error("Invalid Update Controller Request: " + this.name + " already has 10 controllers you must remove one first");
                            return [2 /*return*/, false];
                        }
                        else {
                            return [2 /*return*/, true];
                        }
                        return [3 /*break*/, 27];
                    case 15:
                        if (!(request instanceof Requests_1.Burn)) return [3 /*break*/, 16];
                        if (!this.controllerPrivilege(request.originAccount, "burn")) {
                            console.error("Invalid Burn Request: Controller does not have permission to burn tokens");
                            return [2 /*return*/, false];
                        }
                        else if (bigInt(this.tokenBalance).lesser(bigInt(request.amount))) {
                            console.error("Invalid Burn Request: the token balance of the token account is less than the amount of tokens you are trying to burn");
                            return [2 /*return*/, false];
                        }
                        else {
                            return [2 /*return*/, true];
                        }
                        return [3 /*break*/, 27];
                    case 16:
                        if (!(request instanceof Requests_1.Distribute)) return [3 /*break*/, 21];
                        if (!!this.controllerPrivilege(request.originAccount, "distribute")) return [3 /*break*/, 17];
                        console.error("Invalid Distribute Request: Controller does not have permission to distribute tokens");
                        return [2 /*return*/, false];
                    case 17:
                        if (!bigInt(this.tokenBalance).lesser(bigInt(request.transaction.amount))) return [3 /*break*/, 18];
                        console.error("Invalid Distribute Request: Token account does not have sufficient " + this.symbol + " to distribute");
                        return [2 /*return*/, false];
                    case 18: return [4 /*yield*/, !this.validTokenDestination(request.transaction.destination)];
                    case 19:
                        if (_a.sent()) {
                            console.error("Invalid Distribute Request: Destination does not have permission to receive " + this.symbol);
                            return [2 /*return*/, false];
                        }
                        else {
                            return [2 /*return*/, true];
                        }
                        _a.label = 20;
                    case 20: return [3 /*break*/, 27];
                    case 21:
                        if (!(request instanceof Requests_1.WithdrawFee)) return [3 /*break*/, 26];
                        if (!!this.controllerPrivilege(request.originAccount, "withdraw_fee")) return [3 /*break*/, 22];
                        console.error("Invalid Withdraw Fee Request: Controller does not have permission to withdraw fee");
                        return [2 /*return*/, false];
                    case 22:
                        if (!bigInt(this.tokenFeeBalance).lesser(bigInt(request.transaction.amount))) return [3 /*break*/, 23];
                        console.error("Invalid Withdraw Fee Request: Token account does not have a sufficient token fee balance to withdraw the specified amount");
                        return [2 /*return*/, false];
                    case 23: return [4 /*yield*/, !this.validTokenDestination(request.transaction.destination)];
                    case 24:
                        if (_a.sent()) {
                            console.error("Invalid Withdraw Fee Request: Destination does not have permission to receive " + this.symbol);
                            return [2 /*return*/, false];
                        }
                        else {
                            return [2 /*return*/, true];
                        }
                        _a.label = 25;
                    case 25: return [3 /*break*/, 27];
                    case 26:
                        if (request instanceof Requests_1.WithdrawLogos) {
                            if (!this.controllerPrivilege(request.originAccount, "withdraw_logos")) {
                                console.error("Invalid Withdraw Logos Request: Controller does not have permission to withdraw logos");
                                return [2 /*return*/, false];
                            }
                            else if (bigInt(this.balance).lesser(bigInt(request.transaction.amount).plus(bigInt(request.fee)))) {
                                console.error("Invalid Withdraw Logos Request: Token account does not have sufficient balance to withdraw the specified amount + the minimum logos fee");
                                return [2 /*return*/, false];
                            }
                            else {
                                return [2 /*return*/, true];
                            }
                        }
                        else {
                            return [2 /*return*/, false];
                        }
                        _a.label = 27;
                    case 27: return [2 /*return*/];
                }
            });
        });
    };
    TokenAccount.prototype.settingToModify = function (setting) {
        if (setting === 'issuance') {
            return 'modify_issuance';
        }
        else if (setting === 'revoke') {
            return 'modify_revoke';
        }
        else if (setting === 'adjust_fee') {
            return 'modify_adjust_fee';
        }
        else if (setting === 'freeze') {
            return 'modify_freeze';
        }
        else if (setting === 'whitelist') {
            return 'modify_whitelist';
        }
        return null;
    };
    TokenAccount.prototype.settingToChange = function (setting) {
        if (setting === 'issuance') {
            return 'change_issuance';
        }
        else if (setting === 'revoke') {
            return 'change_revoke';
        }
        else if (setting === 'adjust_fee') {
            return 'change_adjust_fee';
        }
        else if (setting === 'freeze') {
            return 'change_freeze';
        }
        else if (setting === 'whitelist') {
            return 'change_whitelist';
        }
        return null;
    };
    TokenAccount.prototype.settingToChangeModify = function (setting) {
        if (setting === 'issuance') {
            return 'change_modify_issuance';
        }
        else if (setting === 'revoke') {
            return 'change_modify_revoke';
        }
        else if (setting === 'adjust_fee') {
            return 'change_modify_adjust_fee';
        }
        else if (setting === 'freeze') {
            return 'change_modify_freeze';
        }
        else if (setting === 'whitelist') {
            return 'change_modify_whitelist';
        }
        return null;
    };
    /**
     * Adds a request to the appropriate chain
     *
     * @param {RequestOptions} requestInfo - Request information from the RPC or MQTT
     * @returns {Request}
     */
    TokenAccount.prototype.addConfirmedRequest = function (requestInfo) {
        var request = null;
        if (requestInfo.type === 'send') {
            var request_1 = new Requests_1.Send(requestInfo);
            if (requestInfo.transactions && requestInfo.transactions.length > 0) {
                for (var _i = 0, _a = requestInfo.transactions; _i < _a.length; _i++) {
                    var trans = _a[_i];
                    if (trans.destination === this.address) {
                        this.addToReceiveChain(request_1);
                        break;
                    }
                }
            }
            return request_1;
        }
        else if (requestInfo.type === 'withdraw_logos') {
            request = new Requests_1.WithdrawLogos(requestInfo);
            if (requestInfo.transaction.destination === this.address) {
                this.addToReceiveChain(request);
            }
            if (requestInfo.token_id === this.tokenID) {
                this.addToSendChain(request);
            }
            return request;
        }
        else if (requestInfo.type === 'issue_additional') {
            request = new Requests_1.IssueAdditional(requestInfo);
            this.addToSendChain(request);
            return request;
        }
        else if (requestInfo.type === 'change_setting') {
            request = new Requests_1.ChangeSetting(requestInfo);
            this.addToSendChain(request);
            return request;
        }
        else if (requestInfo.type === 'immute_setting') {
            request = new Requests_1.ImmuteSetting(requestInfo);
            this.addToSendChain(request);
            return request;
        }
        else if (requestInfo.type === 'revoke') {
            request = new Requests_1.Revoke(requestInfo);
            this.addToSendChain(request);
            return request;
        }
        else if (requestInfo.type === 'adjust_user_status') {
            request = new Requests_1.AdjustUserStatus(requestInfo);
            this.addToSendChain(request);
            return request;
        }
        else if (requestInfo.type === 'adjust_fee') {
            request = new Requests_1.AdjustFee(requestInfo);
            this.addToSendChain(request);
            return request;
        }
        else if (requestInfo.type === 'update_issuer_info') {
            request = new Requests_1.UpdateIssuerInfo(requestInfo);
            this.addToSendChain(request);
            return request;
        }
        else if (requestInfo.type === 'update_controller') {
            request = new Requests_1.UpdateController(requestInfo);
            this.addToSendChain(request);
            return request;
        }
        else if (requestInfo.type === 'burn') {
            request = new Requests_1.Burn(requestInfo);
            this.addToSendChain(request);
            return request;
        }
        else if (requestInfo.type === 'distribute') {
            request = new Requests_1.Distribute(requestInfo);
            this.addToSendChain(request);
            return request;
        }
        else if (requestInfo.type === 'withdraw_fee') {
            request = new Requests_1.WithdrawFee(requestInfo);
            this.addToSendChain(request);
            return request;
        }
        else if (requestInfo.type === 'issuance') {
            request = new Requests_1.Issuance(requestInfo);
            this.addToReceiveChain(request);
            return request;
        }
        else if (requestInfo.type === 'token_send') {
            request = new Requests_1.TokenSend(requestInfo);
            return request;
        }
        else {
            console.error("MQTT sent " + this.name + " an unknown block type: " + requestInfo.type + " hash: " + requestInfo.hash);
            return null;
        }
    };
    /**
     * Returns the status of the given address for this token
     *
     * @param {string} address - The address of the account
     * @returns {AccountStatus} status of the account { whitelisted and frozen }
     */
    TokenAccount.prototype.getAccountStatus = function (address) {
        if (Object.prototype.hasOwnProperty.call(this.accountStatuses, address)) {
            return this.accountStatuses[address];
        }
        else {
            return {
                whitelisted: false,
                frozen: false
            };
        }
    };
    /**
     * Returns the status of the given address for this token
     *
     * @param {AdjustUserStatus} request - The adjust_user_status request
     * @returns {AccountStatus} status of the account { whitelisted and frozen }
     */
    TokenAccount.prototype.updateAccountStatusFromRequest = function (request) {
        if (!this.accountStatuses[request.account]) {
            this.accountStatuses[request.account] = {
                frozen: false,
                whitelisted: false
            };
        }
        if (request.status === 'frozen') {
            this.accountStatuses[request.account].frozen = true;
        }
        else if (request.status === 'unfrozen') {
            this.accountStatuses[request.account].frozen = false;
        }
        else if (request.status === 'whitelisted') {
            this.accountStatuses[request.account].whitelisted = true;
        }
        else if (request.status === 'not_whitelisted') {
            this.accountStatuses[request.account].whitelisted = false;
        }
        return this.accountStatuses[request.account];
    };
    /**
     * Confirms the request in the local chain
     *
     * @param {MQTTRequestOptions} requestInfo The request from MQTT
     * @throws An exception if the request is not found in the pending requests array
     * @throws An exception if the previous request does not match the last chain request
     * @throws An exception if the request amount is greater than your balance minus the transaction fee
     * @returns {Promise<void>}
     */
    TokenAccount.prototype.processRequest = function (requestInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = this.addConfirmedRequest(requestInfo);
                if (request !== null) {
                    if (!request.verify())
                        throw new Error("Invalid Request! \n " + JSON.stringify(request.toJSON(), null, 2));
                    // Todo 104 - revoke, token_send, distribute, withdraw_Fee, withdraw_logos
                    // could be recieved by TokenAccount???
                    if (request instanceof Requests_1.TokenRequest &&
                        request.tokenID === this.tokenID &&
                        request instanceof Requests_1.TokenSend === false) {
                        if (this.getPendingRequest(requestInfo.hash)) {
                            this.removePendingRequest(requestInfo.hash);
                        }
                        else {
                            console.error('Someone is performing token account requests that is not us!!!');
                            // Remove all pendings as they are now invalidated
                            // It is possible to update the pending blocks but this could
                            // lead to unintended consequences so its best to just reset IMO
                            this.removePendingRequests();
                        }
                    }
                    this.updateTokenInfoFromRequest(request);
                    this.broadcastRequest();
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Returns the token account JSON
     * @returns {TokenAccountJSON} JSON request
     */
    TokenAccount.prototype.toJSON = function () {
        var obj = _super.prototype.toJSON.call(this);
        obj.tokenID = this.tokenID;
        obj.tokenBalance = this.tokenBalance;
        obj.totalSupply = this.totalSupply;
        obj.tokenFeeBalance = this.tokenFeeBalance;
        obj.symbol = this.symbol;
        obj.name = this.name;
        obj.issuerInfo = this.issuerInfo;
        obj.feeRate = this.feeRate;
        obj.feeType = this.feeType;
        obj.accountStatuses = this.accountStatuses;
        obj.controllers = this.controllers;
        obj.settings = this.settings;
        obj.type = this.type;
        return obj;
    };
    return TokenAccount;
}(Account_1.default));
exports.default = TokenAccount;
//# sourceMappingURL=TokenAccount.js.map