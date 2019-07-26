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
var TokenRequest_1 = require("./TokenRequest");
var Actions = {
    add: 0,
    remove: 1
};
var UpdateController = /** @class */ (function (_super) {
    __extends(UpdateController, _super);
    function UpdateController(options) {
        if (options === void 0) { options = {
            action: null,
            controller: null
        }; }
        var _this = this;
        options.type = {
            text: 'update_controller',
            value: 10
        };
        _this = _super.call(this, options) || this;
        /**
         * Controller of the token
         * @type {Controller}
         * @private
         */
        if (options.controller !== undefined) {
            _this._controller = Utils_1.deserializeController(options.controller);
        }
        else {
            _this._controller = {
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
            };
        }
        /**
         * Action of Update Controller Request
         * @type {string}
         * @private
         */
        if (options.action !== undefined) {
            _this._action = options.action;
        }
        else {
            _this._action = null;
        }
        return _this;
    }
    Object.defineProperty(UpdateController.prototype, "action", {
        /**
         * Returns the string of the action
         * @type {action}
         */
        get: function () {
            return this._action;
        },
        set: function (val) {
            if (typeof Actions[val.toLowerCase()] !== 'number')
                throw new Error('Invalid action option, pass action as add or remove');
            this._action = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UpdateController.prototype, "controller", {
        /**
         * The contoller of the token
         * @type {Controller}
         */
        get: function () {
            return this._controller;
        },
        set: function (val) {
            this._controller = val;
        },
        enumerable: true,
        configurable: true
    });
    UpdateController.prototype.getObjectBits = function (obj) {
        var bits = '';
        for (var val in obj) {
            if (typeof obj[val] === 'boolean')
                bits = (+obj[val]) + bits;
        }
        return bits;
    };
    /**
     * Validates the controller
     * @throws a shit load of errors if it is wrong
     * @returns {boolean}
     */
    UpdateController.prototype.validateController = function () {
        if (!this.controller)
            throw new Error('Controller is null');
        if (!this.controller.account)
            throw new Error('Controller must have account');
        if (!this.controller.privileges)
            throw new Error('Controller must have privileges');
        if (typeof this.controller.privileges.change_issuance === 'undefined')
            throw new Error('change_issuance should be passed: Change issuance allows the controller account to add additional tokens');
        if (typeof this.controller.privileges.change_modify_issuance === 'undefined')
            throw new Error('change_modify_issuance should be passed: Change modify issuance allows the controller account to modify if the token is allowed to have additional tokens added');
        if (typeof this.controller.privileges.change_revoke === 'undefined')
            throw new Error('change_revoke should be passed: Change revoke allows the controller account to revoke tokens');
        if (typeof this.controller.privileges.change_modify_revoke === 'undefined')
            throw new Error('change_modify_revoke should be passed: Change modify revoke allows the controller account to modify if tokens can be revoked');
        if (typeof this.controller.privileges.change_freeze === 'undefined')
            throw new Error('change_freeze should be passed: Change Freeze allows the controller account to add or delete accounts from the freeze list');
        if (typeof this.controller.privileges.change_modify_freeze === 'undefined')
            throw new Error('change_modify_freeze should be passed: Change modify freeze allows the controller account to modify if accounts can be frozen');
        if (typeof this.controller.privileges.change_adjust_fee === 'undefined')
            throw new Error('change_adjust_fee should be passed: Change adjust fee allows the controller account to modify the fee of the token');
        if (typeof this.controller.privileges.change_modify_adjust_fee === 'undefined')
            throw new Error('change_modify_adjust_fee should be passed: Change modify fee allows the controller account to modify if the token fees can be adjusted');
        if (typeof this.controller.privileges.change_whitelist === 'undefined')
            throw new Error('change_whitelist should be passed: Change whitelist allows the controller account to add additional tokens');
        if (typeof this.controller.privileges.change_modify_whitelist === 'undefined')
            throw new Error('change_modify_whitelist should be passed: Change modify whitelist allows the controller account to modify if this token has whitelisting');
        if (typeof this.controller.privileges.issuance === 'undefined')
            throw new Error('issuance should be passed');
        if (typeof this.controller.privileges.revoke === 'undefined')
            throw new Error('revoke should be passed');
        if (typeof this.controller.privileges.freeze === 'undefined')
            throw new Error('freeze should be passed');
        if (typeof this.controller.privileges.adjust_fee === 'undefined')
            throw new Error('adjust_fee should be passed');
        if (typeof this.controller.privileges.whitelist === 'undefined')
            throw new Error('whitelist should be passed');
        if (typeof this.controller.privileges.update_issuer_info === 'undefined')
            throw new Error('update_issuer_info should be passed: Update issuer info allows the controller account to change the token information');
        if (typeof this.controller.privileges.update_controller === 'undefined')
            throw new Error('update_controller should be passed ');
        if (typeof this.controller.privileges.burn === 'undefined')
            throw new Error('burn should be passed');
        if (typeof this.controller.privileges.distribute === 'undefined')
            throw new Error('distribute should be passed');
        if (typeof this.controller.privileges.withdraw_fee === 'undefined')
            throw new Error('withdraw_fee should be passed');
        if (typeof this.controller.privileges.withdraw_logos === 'undefined')
            throw new Error('withdraw_logos should be passed');
        return true;
    };
    Object.defineProperty(UpdateController.prototype, "hash", {
        /**
         * Returns calculated hash or Builds the request and calculates the hash
         *
         * @throws An exception if missing parameters or invalid parameters
         * @type {string}
         * @readonly
         */
        get: function () {
            this.validateController();
            if (!this.action)
                throw new Error('action is not set.');
            if (typeof Actions[this.action] !== 'number')
                throw new Error('Invalid action option, pass action as add or remove');
            return _super.prototype.requestHash.call(this)
                .update(Utils_1.hexToUint8(Utils_1.decToHex(Actions[this.action], 1)))
                .update(Utils_1.hexToUint8(Utils_1.keyFromAccount(this.controller.account)))
                .update(Utils_1.hexToUint8(Utils_1.changeEndianness(Utils_1.decToHex(parseInt(this.getObjectBits(this.controller.privileges), 2), 8))))
                .digest('hex');
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns the request JSON ready for broadcast to the Logos Network
     * @returns {UpdateControllerJSON} JSON request
     */
    UpdateController.prototype.toJSON = function () {
        var obj = _super.prototype.toJSON.call(this);
        obj.action = this.action;
        obj.controller = Utils_1.serializeController(this.controller);
        return obj;
    };
    return UpdateController;
}(TokenRequest_1.default));
exports.default = UpdateController;
//# sourceMappingURL=UpdateController.js.map