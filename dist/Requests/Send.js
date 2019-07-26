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
var Send = /** @class */ (function (_super) {
    __extends(Send, _super);
    function Send(options) {
        if (options === void 0) { options = {
            transactions: []
        }; }
        var _this = this;
        options.type = {
            text: 'send',
            value: 0
        };
        _this = _super.call(this, options) || this;
        if (options.transactions !== undefined) {
            _this._transactions = options.transactions;
        }
        else {
            _this._transactions = [];
        }
        return _this;
    }
    Object.defineProperty(Send.prototype, "transactions", {
        /**
         * Return the previous request as hash
         * @type {Transaction[]}
         */
        get: function () {
            return this._transactions;
        },
        set: function (transactions) {
            this._transactions = transactions;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Send.prototype, "totalAmount", {
        /**
         * Returns the total amount contained in this request
         * @type {string}
         * @readonly
         */
        get: function () {
            var totalAmount = bigInt(0);
            for (var _i = 0, _a = this._transactions; _i < _a.length; _i++) {
                var transaction = _a[_i];
                totalAmount = totalAmount.plus(bigInt(transaction.amount));
            }
            return totalAmount.toString();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Send.prototype, "hash", {
        /**
         * Returns calculated hash or Builds the request and calculates the hash
         *
         * @throws An exception if missing parameters or invalid parameters
         * @type {string}
         * @readonly
         */
        get: function () {
            if (!this.transactions)
                throw new Error('Transactions are not set.');
            var context = _super.prototype.requestHash.call(this);
            for (var _i = 0, _a = this.transactions; _i < _a.length; _i++) {
                var transaction = _a[_i];
                context.update(Utils_1.hexToUint8(Utils_1.keyFromAccount(transaction.destination)));
                context.update(Utils_1.hexToUint8(Utils_1.decToHex(transaction.amount, 16)));
            }
            return context.digest('hex');
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Adds a tranction to the Send
     * @param {Transaction} transaction - transaction you want to add to this send request
     * @returns {Transaction[]} list of all transactions
     */
    Send.prototype.addTransaction = function (transaction) {
        if (this.transactions.length === 8)
            throw new Error('Can only fit 8 transactions per send request!');
        if (!transaction.destination || !transaction.amount)
            throw new Error('Send destination and amount');
        this.transactions.push(transaction);
        return this.transactions;
    };
    /**
     * Returns the request JSON ready for broadcast to the Logos Network
     * @returns {SendJSON} Send Request JSON
     */
    Send.prototype.toJSON = function () {
        var obj = _super.prototype.toJSON.call(this);
        obj.transactions = this.transactions;
        return obj;
    };
    return Send;
}(Request_1.default));
exports.default = Send;
//# sourceMappingURL=Send.js.map