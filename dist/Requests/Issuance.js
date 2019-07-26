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
Object.defineProperty(exports, "__esModule", { value: true });
var Utils_1 = require("../Utils/Utils");
var Request_1 = require("./Request");
var bigInt = require("big-integer");
var blake2b_1 = require("../Utils/blake2b");
var Issuance = /** @class */ (function (_super) {
    __extends(Issuance, _super);
    function Issuance(options) {
        if (options === void 0) { options = {
            tokenID: null,
            symbol: null,
            name: null,
            totalSupply: Utils_1.MAXUINT128,
            feeType: 'flat',
            feeRate: '0',
            settings: {
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
            },
            controllers: [],
            issuerInfo: ''
        }; }
        var _this = this;
        options.type = {
            text: 'issuance',
            value: 2
        };
        _this = _super.call(this, options) || this;
        /**
         * TokenID of the token
         * @type {string}
         * @private
         */
        if (options.tokenID !== undefined) {
            _this._tokenID = options.tokenID;
        }
        else if (options.token_id !== undefined) {
            _this._tokenID = options.token_id;
        }
        else {
            _this._tokenID = null;
        }
        /**
         * Symbol of the token
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
         * @type {string}
         * @private
         */
        if (options.name !== undefined) {
            _this._name = options.name;
        }
        else {
            _this._name = null;
        }
        /**
         * Total Supply of the token
         * @type {string}
         * @private
         */
        if (options.totalSupply !== undefined) {
            _this._totalSupply = options.totalSupply;
        }
        else if (options.total_supply !== undefined) {
            _this._totalSupply = options.total_supply;
        }
        else {
            _this._totalSupply = Utils_1.MAXUINT128;
        }
        /**
         * Fee type of the Token flat or percentage
         * @type {string}
         * @private
         */
        if (options.feeType !== undefined) {
            _this._feeType = options.feeType;
        }
        else if (options.fee_type !== undefined) {
            _this._feeType = options.fee_type;
        }
        else {
            _this._feeType = 'flat';
        }
        /**
         * Fee Rate of the token
         * @type {string}
         * @private
         */
        if (options.feeRate !== undefined) {
            _this._feeRate = options.feeRate;
        }
        else if (options.fee_rate !== undefined) {
            _this._feeRate = options.fee_rate;
        }
        else {
            _this._feeRate = '0';
        }
        /**
         * Settings of the token
         * @type {TokenSettings}
         * @private
         */
        if (options.settings !== undefined) {
            _this._settings = Utils_1.deserializeSettings(options.settings);
        }
        else {
            _this._settings = {
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
        }
        /**
         * Controllers of the token
         * @type {Controller[]}
         * @private
         */
        if (options.controllers !== undefined) {
            _this._controllers = Utils_1.deserializeControllers(options.controllers);
        }
        else {
            _this._controllers = [{
                    account: Utils_1.accountFromHexKey(_this.origin),
                    privileges: {
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
                        distribute: true,
                        withdraw_fee: false,
                        withdraw_logos: false
                    }
                }];
        }
        /**
         * Issuer Info of the token
         * @type {TokenSettings}
         * @private
         */
        if (options.issuerInfo !== undefined) {
            _this._issuerInfo = options.issuerInfo;
        }
        else if (options.issuer_info) {
            _this._issuerInfo = options.issuer_info;
        }
        else {
            _this._issuerInfo = '';
        }
        return _this;
    }
    Object.defineProperty(Issuance.prototype, "tokenID", {
        /**
         * Return the token id
         * @type {string}
         */
        get: function () {
            if (this._tokenID) {
                return this._tokenID;
            }
            else {
                if (!this.origin)
                    throw new Error('Origin account is not set.');
                if (!this.previous)
                    throw new Error('Previous is not set.');
                if (!this.symbol)
                    throw new Error('Symbol is not set.');
                if (!this.name)
                    throw new Error('Name is not set.');
                var tokenID = new blake2b_1.default()
                    .update(Utils_1.hexToUint8(this.origin))
                    .update(Utils_1.hexToUint8(this.previous))
                    .update(Utils_1.hexToUint8(Utils_1.stringToHex(this.symbol + this.name)))
                    .digest('hex');
                this.tokenID = tokenID;
                return this.tokenID;
            }
        },
        set: function (val) {
            this._tokenID = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Issuance.prototype, "symbol", {
        /**
         * The symbol of the token (8 Bytes Max)
         * @type {string}
         */
        get: function () {
            return this._symbol;
        },
        set: function (val) {
            if (Utils_1.byteCount(val) > 8)
                throw new Error('Token Symbol - Invalid Size. Max Size 8 Bytes');
            if (!Utils_1.isAlphanumeric(val))
                throw new Error('Token Symbol - Non-alphanumeric characters');
            this._tokenID = null;
            this._symbol = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Issuance.prototype, "name", {
        /**
         * The name of the token (32 Bytes Max)
         * @type {string}
         */
        get: function () {
            return this._name;
        },
        set: function (val) {
            if (Utils_1.byteCount(val) > 32)
                throw new Error('Token Name - Invalid Size. Max Size 32 Bytes');
            if (!Utils_1.isAlphanumericExtended(val))
                throw new Error('Token Name - Invalid Characters (alphanumeric, space, hypen, and underscore are allowed)');
            this._tokenID = null;
            this._name = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Issuance.prototype, "totalSupply", {
        /**
         * The total supply of the token (340282366920938463463374607431768211455 is Max)
         * @type {string}
         */
        get: function () {
            return this._totalSupply;
        },
        set: function (val) {
            if (bigInt(val).gt(bigInt(Utils_1.MAXUINT128)))
                throw new Error("Invalid Total Supply - Maximum supply is " + Utils_1.MAXUINT128);
            this._totalSupply = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Issuance.prototype, "feeType", {
        /**
         * The Type of fee for this token (flat or percentage)
         * @type {string}
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
    Object.defineProperty(Issuance.prototype, "feeRate", {
        /**
         * The fee rate of the token make sure to take in account the fee type
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
    Object.defineProperty(Issuance.prototype, "settingsAsObject", {
        /**
         * The settings for the token
         * Same as get settings but typescript
         * doesn't allow different types for getter setter
         * @type {Settings}
         */
        get: function () {
            return this._settings;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Issuance.prototype, "settings", {
        /**
         * The settings for the token
         * @type {Settings}
         */
        get: function () {
            return this._settings;
        },
        set: function (val) {
            val = Utils_1.deserializeSettings(val);
            this.validateSettings(val);
            this._settings = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Issuance.prototype, "controllersAsObject", {
        /**
         * The contollers of the token
         * Same as get controllers but typescript
         * doesn't allow different types for getter setter
         * @type {Controller[]}
         */
        get: function () {
            return this._controllers;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Issuance.prototype, "controllers", {
        /**
         * The contollers of the token
         * Typescript is really dumb and won't let us use different types for getter setters
         * @type {Controller[]}
         */
        get: function () {
            return this._controllers;
        },
        set: function (val) {
            val = Utils_1.deserializeControllers(val);
            for (var _i = 0, val_1 = val; _i < val_1.length; _i++) {
                var controller = val_1[_i];
                this.validateController(controller);
            }
            this._controllers = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Issuance.prototype, "issuerInfo", {
        /**
         * The issuer info of the token
         * @type {string}
         */
        get: function () {
            return this._issuerInfo;
        },
        set: function (val) {
            if (Utils_1.byteCount(val) > 512)
                throw new Error('Issuer Info - Invalid Size. Max Size 512 Bytes');
            this._issuerInfo = val;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Validates the settings
     * @throws a shit load of errors if it is wrong
     * @returns {boolean}
     */
    Issuance.prototype.validateSettings = function (settings) {
        if (settings === void 0) { settings = this.settingsAsObject; }
        if (typeof settings.issuance === 'undefined')
            throw new Error('issuance should be passed in token settings');
        if (typeof settings.modify_issuance === 'undefined')
            throw new Error('modify_issuance should be passed in token settings');
        if (typeof settings.revoke === 'undefined')
            throw new Error('revoke should be passed in token settings');
        if (typeof settings.modify_revoke === 'undefined')
            throw new Error('modify_revoke should be passed in token settings');
        if (typeof settings.freeze === 'undefined')
            throw new Error('freeze should be passed in token settings');
        if (typeof settings.modify_freeze === 'undefined')
            throw new Error('modify_freeze should be passed in token settings');
        if (typeof settings.adjust_fee === 'undefined')
            throw new Error('adjust_fee should be passed in token settings');
        if (typeof settings.modify_adjust_fee === 'undefined')
            throw new Error('modify_adjust_fee should be passed in token settings');
        if (typeof settings.whitelist === 'undefined')
            throw new Error('whitelist should be passed in token settings');
        if (typeof settings.modify_whitelist === 'undefined')
            throw new Error('modify_whitelist should be passed in token settings');
        return true;
    };
    /**
     * Validates the controller
     * @param {Controller} controller - controller you want to validate
     * @throws a shit load of errors if it is wrong
     * @returns {boolean}
     */
    Issuance.prototype.validateController = function (controller) {
        if (!controller)
            throw new Error('Controller is null');
        if (!controller.account)
            throw new Error('Controller must have account');
        if (!controller.privileges)
            throw new Error('Controller must have privileges');
        if (typeof controller.privileges.change_issuance === 'undefined')
            throw new Error('change_issuance should be passed: Change issuance allows the controller account to add additional tokens');
        if (typeof controller.privileges.change_modify_issuance === 'undefined')
            throw new Error('change_modify_issuance should be passed: Change modify issuance allows the controller account to modify if the token is allowed to have additional tokens added');
        if (typeof controller.privileges.change_revoke === 'undefined')
            throw new Error('change_revoke should be passed: Change revoke allows the controller account to revoke tokens');
        if (typeof controller.privileges.change_modify_revoke === 'undefined')
            throw new Error('change_modify_revoke should be passed: Change modify revoke allows the controller account to modify if tokens can be revoked');
        if (typeof controller.privileges.change_freeze === 'undefined')
            throw new Error('change_freeze should be passed: Change Freeze allows the controller account to add or delete accounts from the freeze list');
        if (typeof controller.privileges.change_modify_freeze === 'undefined')
            throw new Error('change_modify_freeze should be passed: Change modify freeze allows the controller account to modify if accounts can be frozen');
        if (typeof controller.privileges.change_adjust_fee === 'undefined')
            throw new Error('change_adjust_fee should be passed: Change adjust fee allows the controller account to modify the fee of the token');
        if (typeof controller.privileges.change_modify_adjust_fee === 'undefined')
            throw new Error('change_modify_adjust_fee should be passed: Change modify fee allows the controller account to modify if the token fees can be adjusted');
        if (typeof controller.privileges.change_whitelist === 'undefined')
            throw new Error('change_whitelist should be passed: Change whitelist allows the controller account to add additional tokens');
        if (typeof controller.privileges.change_modify_whitelist === 'undefined')
            throw new Error('change_modify_whitelist should be passed: Change modify whitelist allows the controller account to modify if this token has whitelisting');
        if (typeof controller.privileges.issuance === 'undefined')
            throw new Error('issuance should be passed');
        if (typeof controller.privileges.revoke === 'undefined')
            throw new Error('revoke should be passed');
        if (typeof controller.privileges.freeze === 'undefined')
            throw new Error('freeze should be passed');
        if (typeof controller.privileges.adjust_fee === 'undefined')
            throw new Error('adjust_fee should be passed');
        if (typeof controller.privileges.whitelist === 'undefined')
            throw new Error('whitelist should be passed');
        if (typeof controller.privileges.update_issuer_info === 'undefined')
            throw new Error('update_issuer_info should be passed: Update issuer info allows the controller account to change the token information');
        if (typeof controller.privileges.update_controller === 'undefined')
            throw new Error('update_controller should be passed ');
        if (typeof controller.privileges.burn === 'undefined')
            throw new Error('burn should be passed');
        if (typeof controller.privileges.distribute === 'undefined')
            throw new Error('distribute should be passed');
        if (typeof controller.privileges.withdraw_fee === 'undefined')
            throw new Error('withdraw_fee should be passed');
        if (typeof controller.privileges.withdraw_logos === 'undefined')
            throw new Error('withdraw_logos should be passed');
        return true;
    };
    /**
     * Adds a controller to the Token Issuance
     * @param {Controller} controller - controller you want to add to this request
     * @returns {Controller[]} list of all controllers
     */
    Issuance.prototype.addController = function (controller) {
        if (this.controllers.length === 10)
            throw new Error('Can only fit 10 controllers per token issuance request!');
        var newCtrl = Utils_1.deserializeController(controller);
        if (this.validateController(newCtrl)) {
            this._controllers.push(newCtrl);
        }
        return this._controllers;
    };
    Issuance.prototype.getObjectBits = function (obj) {
        var bits = '';
        for (var val in obj) {
            if (typeof obj[val] === 'boolean')
                bits = (+obj[val]) + bits;
        }
        return bits;
    };
    Object.defineProperty(Issuance.prototype, "hash", {
        /**
         * Returns calculated hash or Builds the request and calculates the hash
         *
         * @throws An exception if missing parameters or invalid parameters
         * @type {string}
         * @readonly
         */
        get: function () {
            // Validate Symbol
            if (!this.symbol)
                throw new Error('Symbol is not set.');
            if (Utils_1.byteCount(this.symbol) > 8)
                throw new Error('Token Symbol - Invalid Size. Max Size 8 Bytes');
            if (!Utils_1.isAlphanumeric(this.symbol))
                throw new Error('Token Symbol - Non-alphanumeric characters');
            // Validate Name
            if (!this.name)
                throw new Error('Name is not set.');
            if (Utils_1.byteCount(this.name) > 32)
                throw new Error('Token Name - Invalid Size. Max Size 32 Bytes');
            if (!Utils_1.isAlphanumericExtended(this.name))
                throw new Error('Token Name - Non-alphanumeric characters');
            // Validate Total Supply
            if (!this.totalSupply)
                throw new Error('Total Supply is not set.');
            if (bigInt(this.totalSupply).gt(bigInt(Utils_1.MAXUINT128)))
                throw new Error("Invalid Total Supply - Maximum supply is " + Utils_1.MAXUINT128);
            // Validate Fee Type
            if (!this.feeType)
                throw new Error('Fee Type is not set.');
            if (this.feeType !== 'flat' && this.feeType !== 'percentage')
                throw new Error('Token Fee Type - Invalid Fee Type use "flat" or "percentage"');
            // Validate Fee Rate
            if (!this.feeRate)
                throw new Error('Fee Rate is not set.');
            if (this.feeType === 'percentage' && bigInt(this.feeRate).greater(bigInt('100')))
                throw new Error('Fee Type is percentage and exceeds the maximum of 100');
            // Validate Settings
            if (!this.settings)
                throw new Error('Settings is not set.');
            this.validateSettings();
            // Controllers are validated in the controller hash loop saves some time....
            if (!this.controllers)
                throw new Error('Controllers is not set.');
            // Validate Issuer Info
            if (this.issuerInfo === null)
                throw new Error('IssuerInfo is not set.');
            if (Utils_1.byteCount(this.issuerInfo) > 512)
                throw new Error('Issuer Info - Invalid Size. Max Size 512 Bytes');
            var context = _super.prototype.requestHash.call(this);
            var tokenID = Utils_1.hexToUint8(this.tokenID);
            context.update(tokenID);
            var symbol = Utils_1.hexToUint8(Utils_1.stringToHex(this.symbol));
            context.update(symbol);
            var name = Utils_1.hexToUint8(Utils_1.stringToHex(this.name));
            context.update(name);
            var totalSupply = Utils_1.hexToUint8(Utils_1.decToHex(this.totalSupply, 16));
            context.update(totalSupply);
            var feeType = Utils_1.hexToUint8(Utils_1.decToHex(+(this.feeType === 'flat'), 1));
            context.update(feeType);
            var feeRate = Utils_1.hexToUint8(Utils_1.decToHex(this.feeRate, 16));
            context.update(feeRate);
            var settings = Utils_1.hexToUint8(Utils_1.changeEndianness(Utils_1.decToHex(parseInt(this.getObjectBits(this.settingsAsObject), 2), 8)));
            context.update(settings);
            var accounts = [];
            for (var _i = 0, _a = this.controllersAsObject; _i < _a.length; _i++) {
                var controller = _a[_i];
                this.validateController(controller);
                var account = Utils_1.hexToUint8(Utils_1.keyFromAccount(controller.account));
                if (accounts.includes(account))
                    throw new Error('Duplicate Controllers are not allowed');
                accounts.push(account);
                context.update(account);
                var privileges = Utils_1.hexToUint8(Utils_1.changeEndianness(Utils_1.decToHex(parseInt(this.getObjectBits(controller.privileges), 2), 8)));
                context.update(privileges);
            }
            var issuerInfo = Utils_1.hexToUint8(Utils_1.stringToHex(this.issuerInfo));
            context.update(issuerInfo);
            return context.digest('hex');
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns the request JSON ready for broadcast to the Logos Network
     * @returns {IssuanceJSON} JSON request
     */
    Issuance.prototype.toJSON = function () {
        var obj = _super.prototype.toJSON.call(this);
        obj.token_id = this.tokenID;
        obj.token_account = Utils_1.accountFromHexKey(this.tokenID);
        obj.symbol = this.symbol;
        obj.name = this.name;
        obj.total_supply = this.totalSupply;
        obj.fee_type = this.feeType;
        obj.fee_rate = this.feeRate;
        obj.settings = Utils_1.convertObjectToArray(this.settingsAsObject);
        obj.controllers = Utils_1.serializeControllers(this.controllersAsObject);
        obj.issuer_info = this.issuerInfo;
        return obj;
    };
    return Issuance;
}(Request_1.default));
exports.default = Issuance;
//# sourceMappingURL=Issuance.js.map