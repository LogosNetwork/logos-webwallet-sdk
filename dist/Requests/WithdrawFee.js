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
var WithdrawFee = /** @class */ (function (_super) {
    __extends(WithdrawFee, _super);
    function WithdrawFee(options) {
        if (options === void 0) { options = {
            transaction: null
        }; }
        var _this = this;
        options.type = {
            text: 'withdraw_fee',
            value: 13
        };
        _this = _super.call(this, options) || this;
        /**
         * Transaction to withdraw the token fees
         * @type {string}
         * @private
         */
        if (options.transaction !== undefined) {
            _this._transaction = options.transaction;
        }
        else {
            _this._transaction = null;
        }
        return _this;
    }
    Object.defineProperty(WithdrawFee.prototype, "transaction", {
        /**
         * Return the previous request as hash
         * @type {Transaction}
         */
        get: function () {
            return this._transaction;
        },
        set: function (transaction) {
            if (typeof transaction.destination === 'undefined')
                throw new Error('destination should be passed in transaction object');
            if (typeof transaction.amount === 'undefined')
                throw new Error('amount should be passed in transaction object - pass this as the base unit of your token (e.g. satoshi)');
            this._transaction = transaction;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WithdrawFee.prototype, "hash", {
        /**
         * Returns calculated hash or Builds the request and calculates the hash
         *
         * @throws An exception if missing parameters or invalid parameters
         * @type {string}
         * @readonly
         */
        get: function () {
            if (this.transaction === null)
                throw new Error('transaction is not set.');
            return _super.prototype.requestHash.call(this)
                .update(Utils_1.hexToUint8(Utils_1.keyFromAccount(this.transaction.destination)))
                .update(Utils_1.hexToUint8(Utils_1.decToHex(this.transaction.amount, 16)))
                .digest('hex');
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns the request JSON ready for broadcast to the Logos Network
     * @returns {WithdrawFeeJSON} JSON request
     */
    WithdrawFee.prototype.toJSON = function () {
        var obj = _super.prototype.toJSON.call(this);
        obj.transaction = this.transaction;
        return obj;
    };
    return WithdrawFee;
}(TokenRequest_1.default));
exports.default = WithdrawFee;
//# sourceMappingURL=WithdrawFee.js.map