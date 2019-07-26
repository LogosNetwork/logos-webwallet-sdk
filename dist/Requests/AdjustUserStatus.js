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
var Statuses = {
    frozen: 0,
    unfrozen: 1,
    whitelisted: 2,
    not_whitelisted: 3
};
var AdjustUserStatus = /** @class */ (function (_super) {
    __extends(AdjustUserStatus, _super);
    function AdjustUserStatus(options) {
        if (options === void 0) { options = {
            account: null,
            status: null
        }; }
        var _this = this;
        options.type = {
            text: 'adjust_user_status',
            value: 7
        };
        _this = _super.call(this, options) || this;
        /**
         * Account to change the status of
         * @type {string}
         * @private
         */
        if (options.account !== undefined) {
            _this._account = options.account;
        }
        else {
            _this._account = null;
        }
        /**
         * Status that we are applying to the user
         * @type {Status}
         * @private
         */
        if (options.status !== undefined) {
            _this._status = options.status;
        }
        else {
            _this._status = null;
        }
        return _this;
    }
    Object.defineProperty(AdjustUserStatus.prototype, "status", {
        /**
         * Returns the string of the status
         * @type {Status}
         */
        get: function () {
            return this._status;
        },
        set: function (val) {
            this._status = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AdjustUserStatus.prototype, "account", {
        /**
         * Return the account which the status is being changed
         * @type {string}
         */
        get: function () {
            return this._account;
        },
        set: function (account) {
            this._account = account;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AdjustUserStatus.prototype, "hash", {
        /**
         * Returns calculated hash or Builds the request and calculates the hash
         *
         * @throws An exception if missing parameters or invalid parameters
         * @type {string}
         * @readonly
         */
        get: function () {
            if (!this.account)
                throw new Error('Account is not set.');
            if (!this.status)
                throw new Error('Status is not set.');
            return _super.prototype.requestHash.call(this)
                .update(Utils_1.hexToUint8(Utils_1.keyFromAccount(this.account)))
                .update(Utils_1.hexToUint8(Utils_1.decToHex(Statuses[this.status], 1)))
                .digest('hex');
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns the request JSON ready for broadcast to the Logos Network
     * @returns {AdjustUserStatusJSON} JSON request
     */
    AdjustUserStatus.prototype.toJSON = function () {
        var obj = _super.prototype.toJSON.call(this);
        obj.account = this.account;
        obj.status = this.status;
        return obj;
    };
    return AdjustUserStatus;
}(TokenRequest_1.default));
exports.default = AdjustUserStatus;
//# sourceMappingURL=AdjustUserStatus.js.map