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
var WithdrawLogos = /** @class */ (function (_super) {
    __extends(WithdrawLogos, _super);
    function WithdrawLogos(options) {
        if (options === void 0) { options = {
            transaction: null
        }; }
        var _this = this;
        options.type = {
            text: 'withdraw_logos',
            value: 14
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
    Object.defineProperty(WithdrawLogos.prototype, "transaction", {
        /**
         * Return the previous request as hash
         * @type {Transaction}
         */
        get: function () {
            return this._transaction;
        },
        set: function (transaction) {
            if (!transaction)
                throw new Error('transaction is was not sent.');
            if (!transaction.destination)
                throw new Error('destination should be passed in transaction object');
            if (!transaction.amount)
                throw new Error('amount should be passed in transaction object - pass this as the base unit logos');
            this._transaction = transaction;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WithdrawLogos.prototype, "hash", {
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
            if (!this.transaction.destination)
                throw new Error('transaction destination is not set.');
            if (!this.transaction.amount)
                throw new Error('transaction amount is not set.');
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
     * @returns {WithdrawLogosJSON} JSON request
     */
    WithdrawLogos.prototype.toJSON = function () {
        var obj = _super.prototype.toJSON.call(this);
        obj.transaction = this.transaction;
        return obj;
    };
    return WithdrawLogos;
}(TokenRequest_1.default));
exports.default = WithdrawLogos;
//# sourceMappingURL=WithdrawLogos.js.map