"use strict";
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
var mqttPattern_1 = require("./Utils/mqttPattern");
var logos_rpc_client_1 = require("@logosnetwork/logos-rpc-client");
var Utils_1 = require("./Utils/Utils");
var pbkdf2_1 = require("pbkdf2");
var nacl = require("tweetnacl/nacl");
var blake2b_1 = require("./Utils/blake2b");
var bigInt = require("big-integer");
var mqtt_1 = require("mqtt");
var TokenAccount_1 = require("./TokenAccount");
var LogosAccount_1 = require("./LogosAccount");
var Wallet = /** @class */ (function () {
    function Wallet(options) {
        if (options === void 0) { options = {
            password: null,
            seed: null,
            deterministicKeyIndex: 0,
            currentAccountAddress: null,
            accounts: {},
            tokenAccounts: {},
            walletID: null,
            batchSends: true,
            fullSync: true,
            lazyErrors: false,
            tokenSync: false,
            validateSync: true,
            mqtt: Utils_1.defaultMQTT,
            rpc: Utils_1.defaultRPC,
            version: 1
        }; }
        this.loadOptions(options);
    }
    Wallet.prototype.loadOptions = function (options) {
        /**
         * Password used to encrypt and decrypt the wallet data
         * @type {string}
         * @private
         */
        if (options.password !== undefined) {
            this._password = options.password;
        }
        else {
            this._password = null;
        }
        /**
         * Deterministic Key Index is used to generate accounts
         * @type {number}
         * @private
         */
        if (options.deterministicKeyIndex !== undefined) {
            this._deterministicKeyIndex = options.deterministicKeyIndex;
        }
        else {
            this._deterministicKeyIndex = 0;
        }
        /**
         * Current Account address is the public key of the current account
         * @type {string}
         * @private
         */
        if (options.currentAccountAddress !== undefined) {
            this._currentAccountAddress = options.currentAccountAddress;
        }
        else {
            this._currentAccountAddress = null;
        }
        /**
         * Wallet Identifer
         * @type {string}
         * @private
         */
        if (options.walletID !== undefined) {
            this._walletID = options.walletID;
        }
        else {
            this._walletID = Utils_1.uint8ToHex(nacl.randomBytes(32));
        }
        /**
         * Batch Sends - When lots of requests are pending auto batch them togeather for speed
         * @type {boolean}
         * @private
         */
        if (options.batchSends !== undefined) {
            this._batchSends = options.batchSends;
        }
        else {
            this._batchSends = true;
        }
        /**
         * Full Sync - Should we fully sync and validate the full request chain or just sync the request
         * @type {boolean}
         * @private
         */
        if (options.fullSync !== undefined) {
            this._fullSync = options.fullSync;
        }
        else {
            this._fullSync = true;
        }
        /**
         * Sync Tokens - Syncs all associated token's of the accounts on the account sync instead of on use
         * @type {boolean}
         * @private
         */
        if (options.tokenSync !== undefined) {
            this._tokenSync = options.tokenSync;
        }
        else {
            this._tokenSync = false;
        }
        /**
         * Validate Sync
         * if this option is true the SDK will generate hashes of each requests based on the content data and verify signatures
         * This should always be true when using a untrusted RPC node
         * @type {boolean}
         * @private
         */
        if (options.validateSync !== undefined) {
            this._validateSync = options.validateSync;
        }
        else {
            this._validateSync = true;
        }
        /**
         * Lazy Errors - Do not reject invalid requests when adding to pending chain
         *
         * Lazy errors will not prevent you from creating blocks but only from broadcasting them
         *
         * @type {boolean}
         * @private
         */
        if (options.lazyErrors !== undefined) {
            this._lazyErrors = options.lazyErrors;
        }
        else {
            this._lazyErrors = false;
        }
        /**
         * RPC enabled
         * @type {RPCOptions | false}
         * @private
         */
        if (options.rpc !== undefined) {
            this._rpc = options.rpc;
        }
        else {
            this._rpc = Utils_1.defaultRPC;
        }
        /**
         * PBKDF2 Iterations
         * I don't think people need to edit this
         * NIST guidelines recommend 10,000 so lets do that
         * @type {number}
         * @private
         */
        this._iterations = 10000;
        /**
         * Seed used to generate accounts
         * @type {string} The 32 byte seed hex encoded
         * @private
         */
        if (options.seed !== undefined) {
            this._seed = options.seed;
        }
        else {
            this._seed = Utils_1.uint8ToHex(nacl.randomBytes(32));
        }
        /**
         * Array of accounts in this wallet
         * @type {Map<string, Account>}
         * @private
         */
        if (options.accounts !== undefined) {
            this._accounts = {};
            for (var account in options.accounts) {
                if (this._currentAccountAddress === null) {
                    this._currentAccountAddress = account;
                }
                var accountOptions = options.accounts[account];
                accountOptions.wallet = this;
                this._accounts[account] = new LogosAccount_1.default(accountOptions);
            }
        }
        else {
            this._accounts = {};
        }
        /**
         * Array of accounts in this wallet
         * @type {Map<string, TokenAccount>}
         * @private
         */
        if (options.tokenAccounts !== undefined) {
            this._tokenAccounts = {};
            for (var account in options.tokenAccounts) {
                var accountOptions = options.tokenAccounts[account];
                accountOptions.wallet = this;
                this._tokenAccounts[account] = new TokenAccount_1.default(accountOptions);
            }
        }
        else {
            this._tokenAccounts = {};
        }
        /**
         * MQTT host to listen for data
         * @type {string | boolean} The mqtt websocket address (false if you don't want this)
         * @private
         */
        if (options.mqtt !== undefined) {
            this._mqtt = options.mqtt;
        }
        else {
            this._mqtt = Utils_1.defaultMQTT;
        }
        this._mqttConnected = false;
        this.mqttConnect();
    };
    Object.defineProperty(Wallet.prototype, "walletID", {
        /**
         * The id of the wallet
         * @type {string} The hex identifier of the wallet
         */
        get: function () {
            return this._walletID;
        },
        set: function (id) {
            this._walletID = id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wallet.prototype, "batchSends", {
        /**
         * Should the webwallet SDK batch requests
         * @type {boolean}
         */
        get: function () {
            return this._batchSends;
        },
        set: function (val) {
            this._batchSends = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wallet.prototype, "fullSync", {
        /**
         * Full Sync - syncs the entire send and recieve chains
         * This is recommend to be true when using an untrusted RPC node
         * In the future this will be safe when we have BLS sig validation of Request Blocks
         * @type {boolean}
         */
        get: function () {
            return this._fullSync;
        },
        set: function (val) {
            this._fullSync = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wallet.prototype, "tokenSync", {
        /**
         * Sync Tokens - Syncs all associated token's of the accounts on the account sync instead of on use
         * @type {boolean}
         */
        get: function () {
            return this._tokenSync;
        },
        set: function (val) {
            this._tokenSync = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wallet.prototype, "validateSync", {
        /**
         * Validate Sync
         * if this option is true the SDK will generate hashes of each requests based on the content data and verify signatures
         * This should always be true when using a untrusted RPC node
         * @type {boolean}
         */
        get: function () {
            return this._validateSync;
        },
        set: function (val) {
            this._validateSync = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wallet.prototype, "lazyErrors", {
        /**
         * Lazy Errors allows you to add request that are not valid for the current pending balances to the pending chain
         * @type {boolean}
         */
        get: function () {
            return this._lazyErrors;
        },
        set: function (val) {
            this._lazyErrors = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wallet.prototype, "accounts", {
        /**
         * Array of all the accounts in the wallet
         * @type {AccountMap}
         * @readonly
         */
        get: function () {
            return this._accounts;
        },
        set: function (accounts) {
            this._accounts = accounts;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wallet.prototype, "tokenAccounts", {
        /**
         * Map of all the TokenAccounts in the wallet
         * @type {TokenAccountMap}
         * @readonly
         */
        get: function () {
            return this._tokenAccounts;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wallet.prototype, "account", {
        /**
         * The current account
         * @type {LogosAccount}
         * @readonly
         */
        get: function () {
            return this.accounts[this.currentAccountAddress];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wallet.prototype, "currentAccountAddress", {
        /**
         * The current account address
         * @type {string}
         */
        get: function () {
            return this._currentAccountAddress;
        },
        set: function (address) {
            if (!Object.prototype.hasOwnProperty.call(this.accounts, address))
                throw new Error("Account " + address + " does not exist in this wallet.");
            this._currentAccountAddress = address;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wallet.prototype, "balance", {
        /**
         * The current balance of all the wallets in reason
         * @type {string}
         * @readonly
         */
        get: function () {
            var totalBalance = bigInt(0);
            for (var account in this.accounts) {
                totalBalance.add(bigInt(this.accounts[account].balance));
            }
            return totalBalance.toString();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wallet.prototype, "mqtt", {
        /**
         * The mqtt host for listening to confirmations from Logos consensus
         * @type {string}
         */
        get: function () {
            return this._mqtt;
        },
        set: function (val) {
            this.mqttDisconnect();
            this._mqtt = val;
            this.mqttConnect();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wallet.prototype, "rpc", {
        /**
         * The rpc options for connecting to the RPC
         * @type {RPCOptions | false}
         */
        get: function () {
            return this._rpc;
        },
        set: function (val) {
            this._rpc = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wallet.prototype, "password", {
        set: function (password) {
            this._password = password;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wallet.prototype, "seed", {
        /**
         * Return the seed of the wallet
         * @type {string}
         */
        get: function () {
            return this._seed;
        },
        set: function (hexSeed) {
            if (!/[0-9A-F]{64}/i.test(hexSeed))
                throw new Error('Invalid Hex Seed.');
            this._seed = hexSeed;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wallet.prototype, "synced", {
        /**
         * Return boolean if all the accounts in the wallet are synced
         * @type {boolean}
         */
        get: function () {
            for (var address in this.tokenAccounts) {
                if (!this.tokenAccounts[address].synced) {
                    return false;
                }
            }
            for (var address in this.accounts) {
                if (!this.accounts[address].synced) {
                    return false;
                }
            }
            return true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wallet.prototype, "pendingRequests", {
        /**
         * Return all the requests that are pending in every account associated to this wallet
         * @type {Request[]}
         * @readonly
         */
        get: function () {
            var pendingRequests = [];
            for (var _i = 0, _a = Object.values(this.accounts); _i < _a.length; _i++) {
                var account = _a[_i];
                pendingRequests.concat(account.pendingChain);
            }
            return pendingRequests;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Sets a random seed for the wallet
     *
     * @param {boolean} overwrite - Set to true to overwrite an existing seed
     * @throws An exception on existing seed
     * @returns {string}
     */
    Wallet.prototype.createSeed = function (overwrite) {
        if (overwrite === void 0) { overwrite = false; }
        if (this.seed && !overwrite)
            throw new Error('Seed already exists. To overwrite set the seed or set overwrite to true');
        this.seed = Utils_1.uint8ToHex(nacl.randomBytes(32));
        return this.seed;
    };
    /**
     * Adds a account to the wallet
     *
     * @param {LogosAccount} account - the account you wish to add
     * @returns {LogosAccount}
     */
    Wallet.prototype.addAccount = function (account) {
        this.accounts[account.address] = account;
        if (this.mqtt && this._mqttConnected)
            this.subscribe("account/" + account.address);
        return this.accounts[account.address];
    };
    /**
     * Removes an account to the wallet
     *
     * @param {string} address - the account you wish to remove
     * @returns {boolean}
     */
    Wallet.prototype.removeAccount = function (address) {
        if (this.accounts[address]) {
            delete this.accounts[address];
            if (this.mqtt && this._mqttConnected)
                this.unsubscribe("account/" + address);
            if (address === this.currentAccountAddress) {
                this.currentAccountAddress = Object.keys(this.accounts)[0];
            }
            return true;
        }
        return false;
    };
    /**
     * Adds a tokenAccount to the wallet
     *
     * @param {TokenAccount} tokenAccount - the tokenAccount you wish to add
     * @returns {TokenAccount}
     */
    Wallet.prototype.addTokenAccount = function (tokenAccount) {
        this.tokenAccounts[tokenAccount.address] = tokenAccount;
        if (this.mqtt && this._mqttConnected)
            this.subscribe("account/" + tokenAccount.address);
        return this.tokenAccounts[tokenAccount.address];
    };
    /**
     * Create a TokenAccount
     *
     * You are allowed to add a tokenAccount using the address
     *
     * @param {string} address - address of the token account.
     * @returns {Promise<Account>}
     */
    Wallet.prototype.createTokenAccount = function (address, issuance) {
        if (issuance === void 0) { issuance = null; }
        return __awaiter(this, void 0, void 0, function () {
            var tokenAccount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.tokenAccounts[address]) return [3 /*break*/, 1];
                        return [2 /*return*/, this.tokenAccounts[address]];
                    case 1:
                        tokenAccount = new TokenAccount_1.default({
                            address: address,
                            wallet: this,
                            issuance: issuance
                        });
                        if (this.mqtt && this._mqttConnected)
                            this.subscribe("account/" + tokenAccount.address);
                        this.tokenAccounts[tokenAccount.address] = tokenAccount;
                        if (!(this.rpc && !issuance)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.tokenAccounts[tokenAccount.address].sync()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        if (!this.rpc)
                            console.warn('RPC not ENABLED TOKEN ACTIONS - TokenAccount cannot sync');
                        this.tokenAccounts[tokenAccount.address].synced = true;
                        _a.label = 4;
                    case 4: return [2 /*return*/, this.tokenAccounts[tokenAccount.address]];
                }
            });
        });
    };
    /**
     * Create an account
     *
     * You are allowed to create an account using your seed, precalculated account options, or a privateKey
     *
     * @param {AccountOptions} options - the options to populate the account. If you send just private key it will generate the account from that privateKey. If you just send index it will genereate the account from that determinstic seed index.
     * @param {boolean} setCurrent - sets the current account to newly created accounts this is default true
     * @returns {Promise<Account>}
     */
    Wallet.prototype.createAccount = function (options, setCurrent) {
        if (options === void 0) { options = null; }
        if (setCurrent === void 0) { setCurrent = true; }
        return __awaiter(this, void 0, void 0, function () {
            var accountInfo, accountOptions, account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        accountInfo = null;
                        if (options === null) { // No options generate from seed
                            if (!this.seed)
                                throw new Error('Cannot generate an account without a seed! Make sure to first set your seed or pass a private key or explicitly pass the options for the account.');
                            accountInfo = this.generateAccountOptionsFromSeed(this._deterministicKeyIndex);
                            this._deterministicKeyIndex++;
                        }
                        else {
                            if (options.privateKey !== undefined) {
                                accountInfo = this.generateAccountOptionsFromPrivateKey(options.privateKey);
                            }
                            else if (options.index !== undefined) {
                                if (!this.seed)
                                    throw new Error('Cannot generate an account without a seed! Make sure to first set your seed or pass a private key or explicitly pass the options for the account.');
                                accountInfo = this.generateAccountOptionsFromSeed(options.index);
                            }
                            else {
                                if (!this.seed)
                                    throw new Error('Cannot generate an account without a seed! Make sure to first set your seed or pass a private key or explicitly pass the options for the account.');
                                accountInfo = this.generateAccountOptionsFromSeed(this._deterministicKeyIndex);
                                this._deterministicKeyIndex++;
                            }
                        }
                        accountOptions = __assign({}, accountInfo, { wallet: this, label: "Account " + Object.values(this.accounts).length });
                        account = new LogosAccount_1.default(accountOptions);
                        this.addAccount(account);
                        if (!this.rpc) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.accounts[account.address].sync()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        this.accounts[account.address].synced = true;
                        _a.label = 3;
                    case 3:
                        if (setCurrent || this.currentAccountAddress === null)
                            this.currentAccountAddress = account.address;
                        return [2 /*return*/, this.accounts[account.address]];
                }
            });
        });
    };
    /**
     * Updates the balance of all the accounts
     * @returns {void}
     */
    Wallet.prototype.recalculateWalletBalancesFromChain = function () {
        for (var _i = 0, _a = Object.values(this.accounts); _i < _a.length; _i++) {
            var account = _a[_i];
            account.updateBalancesFromChain();
        }
    };
    /**
     * Finds the request object of the specified hash of one of our accounts
     *
     * @param {string} hash - The hash of the request we are looking for the object of
     * @returns {Request | false } false if no request object of the specified hash was found
     */
    Wallet.prototype.getRequest = function (hash) {
        for (var _i = 0, _a = Object.values(this.accounts); _i < _a.length; _i++) {
            var account = _a[_i];
            var request = account.getRequest(hash);
            if (request) {
                return request;
            }
            return false;
        }
        return false;
    };
    /**
     * Encrypts and packs the wallet data in a hex string
     *
     * @returns {string}
     */
    Wallet.prototype.encrypt = function () {
        var encryptedWallet = JSON.stringify(this.toJSON());
        encryptedWallet = Utils_1.stringToHex(encryptedWallet);
        var WalletBuffer = Buffer.from(encryptedWallet, 'hex');
        var checksum = new blake2b_1.default().update(WalletBuffer).digest();
        var salt = Buffer.from(nacl.randomBytes(16));
        var localPassword = '';
        if (!this._password) {
            localPassword = 'password';
        }
        else {
            localPassword = this._password;
        }
        var key = pbkdf2_1.pbkdf2Sync(localPassword, salt, this._iterations, 32, 'sha512');
        var options = {
            mode: Utils_1.AES.CBC,
            padding: Utils_1.Iso10126
        };
        var encryptedBytes = Utils_1.AES.encrypt(WalletBuffer, key, salt, options);
        var payload = Buffer.concat([Buffer.from(checksum), salt, encryptedBytes]);
        // decrypt to check if wallet was corrupted during ecryption somehow
        if (this.decrypt(payload) === false) {
            return this.encrypt(); // try again, shouldnt happen often
        }
        return payload.toString('hex');
    };
    /**
     * Scans the accounts to make sure they are synced and if they are not synced it syncs them
     *
     * @param {boolean} - encrypted wallet
     * @returns {Promise<boolean>}
     */
    Wallet.prototype.sync = function (force) {
        if (force === void 0) { force = false; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        var isSyncedPromises = [];
                        for (var account in _this.accounts) {
                            if (!_this.accounts[account].synced || force) {
                                isSyncedPromises.push(_this.accounts[account].isSynced());
                            }
                        }
                        for (var tokenAccount in _this.tokenAccounts) {
                            if (!_this.tokenAccounts[tokenAccount].synced || force) {
                                isSyncedPromises.push(_this.tokenAccounts[tokenAccount].isSynced());
                            }
                        }
                        if (isSyncedPromises.length > 0) {
                            Promise.all(isSyncedPromises).then(function (values) {
                                var syncPromises = [];
                                for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
                                    var isSynced = values_1[_i];
                                    if (!isSynced.synced) {
                                        if (isSynced.type === 'LogosAccount') {
                                            syncPromises.push(_this.accounts[isSynced.account].sync());
                                        }
                                        else if (isSynced.type === 'TokenAccount') {
                                            if (isSynced.remove) {
                                                delete _this.tokenAccounts[isSynced.account];
                                            }
                                            else {
                                                syncPromises.push(_this.tokenAccounts[isSynced.account].sync());
                                            }
                                        }
                                    }
                                }
                                if (syncPromises.length > 0) {
                                    Promise.all(syncPromises).then(function () {
                                        resolve(true);
                                    });
                                }
                                else {
                                    resolve(true);
                                }
                            });
                        }
                        else {
                            resolve(true);
                        }
                    })];
            });
        });
    };
    /**
     * Returns a Logos RPC Client Instance using the given delegate id
     *
     * @param {number} delegateIndex - The delegate you wish to connect to
     * @returns {Logos}
     */
    Wallet.prototype.rpcClient = function (delegateIndex) {
        if (delegateIndex === void 0) { delegateIndex = 0; }
        if (this.rpc) {
            return new logos_rpc_client_1.default({
                url: "http://" + this.rpc.delegates[delegateIndex] + ":55000",
                proxyURL: this.rpc.proxy
            });
        }
        else {
            return null;
        }
    };
    /**
     * Constructs the wallet from an encrypted base64 encoded wallet
     *
     * @param {string} - encrypted wallet
     * @returns {Promise<Wallet>} wallet data
     */
    Wallet.prototype.load = function (encryptedWallet) {
        this.accounts = {};
        var decryptedBytes = this.decrypt(encryptedWallet);
        if (decryptedBytes === false)
            throw new Error('Wallet is corrupted or has been tampered.');
        var walletData = JSON.parse(decryptedBytes.toString('utf8'));
        this.loadOptions(walletData);
        return this;
    };
    /**
     * Decrypts the wallet data
     *
     * @param {Buffer | string} - encrypted wallet
     * @returns {Buffer | false} The request data or returns false if it is unable to decrypt the data
     * @private
     */
    Wallet.prototype.decrypt = function (encryptedWallet) {
        var bytes = null;
        if (encryptedWallet instanceof Buffer) {
            bytes = encryptedWallet;
        }
        else {
            bytes = Buffer.from(encryptedWallet, 'hex');
        }
        var checksum = bytes.slice(0, 32);
        var salt = bytes.slice(32, 48);
        var payload = bytes.slice(48);
        var localPassword = '';
        if (!this._password) {
            localPassword = 'password';
        }
        else {
            localPassword = this._password;
        }
        var key = pbkdf2_1.pbkdf2Sync(localPassword, salt, this._iterations, 32, 'sha512');
        var options = {
            padding: Utils_1.Iso10126
        };
        var decryptedBytes = Utils_1.AES.decrypt(payload, key, salt, options);
        var hash = new blake2b_1.default().update(decryptedBytes).digest('hex');
        if (hash !== checksum.toString('hex').toUpperCase())
            return false;
        return decryptedBytes;
    };
    /**
     * Generates an account based on the determinstic index of the key
     *
     * @param {number} - The determinstic seed index
     * @returns {AccountOptions} The minimal account options to create the account
     * @private
     */
    Wallet.prototype.generateAccountOptionsFromSeed = function (index) {
        if (this.seed.length !== 64)
            throw new Error('Invalid Seed.');
        var indexBytes = Utils_1.hexToUint8(Utils_1.decToHex(index, 4));
        var privateKey = new blake2b_1.default()
            .update(Utils_1.hexToUint8(this.seed))
            .update(indexBytes)
            .digest();
        var publicKey = nacl.sign.keyPair.fromSecretKey(privateKey).publicKey;
        var address = Utils_1.accountFromHexKey(Utils_1.uint8ToHex(publicKey));
        return {
            privateKey: Utils_1.uint8ToHex(privateKey),
            publicKey: Utils_1.uint8ToHex(publicKey),
            address: address,
            index: index
        };
    };
    /**
     * Generates an account based on the given private key
     *
     * @param {string} - The private key
     * @returns {AccountOptions} The minimal account options to create the account
     * @private
     */
    Wallet.prototype.generateAccountOptionsFromPrivateKey = function (privateKey) {
        if (privateKey.length !== 64)
            throw new Error('Invalid Private Key length. Should be 32 bytes.');
        if (!/[0-9A-F]{64}/i.test(privateKey))
            throw new Error('Invalid Hex Private Key.');
        var publicKey = nacl.sign.keyPair.fromSecretKey(Utils_1.hexToUint8(privateKey)).publicKey;
        var address = Utils_1.accountFromHexKey(Utils_1.uint8ToHex(publicKey));
        return {
            privateKey: privateKey,
            publicKey: Utils_1.uint8ToHex(publicKey),
            address: address
        };
    };
    /**
     * Subscribe to the mqtt topic
     *
     * @param {string} topic - topic to subscribe to
     * @returns {void}
     * @private
     */
    Wallet.prototype.subscribe = function (topic) {
        if (this._mqttConnected && this._mqttClient) {
            this._mqttClient.subscribe(topic, function (err) {
                if (!err) {
                    console.info("subscribed to " + topic);
                }
                else {
                    console.error(err);
                }
            });
        }
    };
    /**
     * Unsubscribe to the mqtt topic
     *
     * @param {string} topic - topic to unsubscribe to
     * @returns {void}
     * @private
     */
    Wallet.prototype.unsubscribe = function (topic) {
        if (this._mqttConnected && this._mqttClient) {
            this._mqttClient.unsubscribe(topic, function (err) {
                if (!err) {
                    console.info("unsubscribed from " + topic);
                }
                else {
                    console.error(err);
                }
            });
        }
    };
    /**
     * Disconnect from the mqtt
     *
     * @returns {void}
     */
    Wallet.prototype.mqttDisconnect = function () {
        this._mqttClient.end();
    };
    /**
     * Connect to the mqtt
     *
     * @returns {void}
     */
    Wallet.prototype.mqttConnect = function () {
        var _this = this;
        if (this.mqtt) {
            this._mqttClient = mqtt_1.connect(this.mqtt);
            this._mqttClient.on('connect', function () {
                console.info('Webwallet SDK Connected to MQTT');
                _this._mqttConnected = true;
                _this.subscribe("delegateChange");
                for (var _i = 0, _a = Object.keys(_this.accounts); _i < _a.length; _i++) {
                    var address = _a[_i];
                    _this.subscribe("account/" + address);
                }
                for (var _b = 0, _c = Object.keys(_this.tokenAccounts); _b < _c.length; _b++) {
                    var tkAddress = _c[_b];
                    _this.subscribe("account/" + tkAddress);
                }
            });
            this._mqttClient.on('close', function () {
                _this._mqttConnected = false;
                console.info('Webwallet SDK disconnected from MQTT');
            });
            this._mqttClient.on('message', function (topic, request) {
                var requestObject = JSON.parse(request.toString());
                if (topic === 'delegateChange' && _this.rpc) {
                    console.info("MQTT Delegate Change");
                    _this.rpc.delegates = Object.values(requestObject);
                }
                else {
                    var params = mqttPattern_1.default('account/+address', topic);
                    if (params) {
                        if (_this.accounts[params.address]) {
                            console.info("MQTT Confirmation - Account - " + requestObject.type + " - " + requestObject.sequence);
                            _this.accounts[params.address].processRequest(requestObject);
                        }
                        else if (_this.tokenAccounts[params.address]) {
                            console.info("MQTT Confirmation - TK Account - " + requestObject.type + " - " + requestObject.sequence);
                            _this.tokenAccounts[params.address].processRequest(requestObject);
                        }
                    }
                }
            });
        }
    };
    /**
     * Returns the base Wallet JSON
     * @returns {WalletJSON} JSON request
     */
    Wallet.prototype.toJSON = function () {
        var obj = {
            password: this.password,
            seed: this.seed,
            deterministicKeyIndex: this._deterministicKeyIndex,
            currentAccountAddress: this.currentAccountAddress,
            walletID: this.walletID,
            batchSends: this.batchSends,
            fullSync: this.fullSync,
            lazyErrors: this.lazyErrors,
            tokenSync: this.tokenSync,
            validateSync: this.validateSync,
            mqtt: this.mqtt,
            rpc: this.rpc
        };
        var tempAccounts = {};
        for (var account in this.accounts) {
            tempAccounts[account] = this.accounts[account].toJSON();
        }
        obj.accounts = tempAccounts;
        var tempTokenAccounts = {};
        for (var account in this.tokenAccounts) {
            tempTokenAccounts[account] = this.tokenAccounts[account].toJSON();
        }
        obj.tokenAccounts = tempTokenAccounts;
        return obj;
    };
    return Wallet;
}());
exports.default = Wallet;
//# sourceMappingURL=Wallet.js.map