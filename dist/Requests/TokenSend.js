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
var bigInt = require("big-integer");
var TokenSend = /** @class */ (function (_super) {
    __extends(TokenSend, _super);
    function TokenSend(options) {
        if (options === void 0) { options = {
            transactions: [],
            tokenFee: '0'
        }; }
        var _this = this;
        options.type = {
            text: 'token_send',
            value: 15
        };
        _this = _super.call(this, options) || this;
        /**
         * Transactions
         * @type {Transaction[]}
         * @private
         */
        if (options.transactions !== undefined) {
            _this._transactions = options.transactions;
        }
        else {
            _this._transactions = [];
        }
        /**
         * Fee Rate of the token
         * @type {string}
         * @private
         */
        if (options.tokenFee !== undefined) {
            _this._tokenFee = options.tokenFee;
        }
        else if (options.token_fee !== undefined) {
            _this._tokenFee = options.token_fee;
        }
        else {
            _this._tokenFee = '0';
        }
        return _this;
    }
    Object.defineProperty(TokenSend.prototype, "transactions", {
        /**
         * Return the transactions
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
    Object.defineProperty(TokenSend.prototype, "tokenFee", {
        /**
         * Return the string amount of the Token Fee in the base unit of the token
         * @type {string}
         */
        get: function () {
            return this._tokenFee;
        },
        set: function (val) {
            this._tokenFee = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TokenSend.prototype, "totalAmount", {
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
    Object.defineProperty(TokenSend.prototype, "hash", {
        /**
         * Returns calculated hash or Builds the request and calculates the hash
         *
         * @throws An exception if missing parameters or invalid parameters
         * @type {string}
         * @readonly
         */
        get: function () {
            if (this.transactions === null)
                throw new Error('transaction is not set.');
            if (this.tokenFee === null)
                throw new Error('token fee is not set.');
            var context = _super.prototype.requestHash.call(this);
            for (var _i = 0, _a = this.transactions; _i < _a.length; _i++) {
                var transaction = _a[_i];
                context.update(Utils_1.hexToUint8(Utils_1.keyFromAccount(transaction.destination)));
                context.update(Utils_1.hexToUint8(Utils_1.decToHex(transaction.amount, 16)));
            }
            context.update(Utils_1.hexToUint8(Utils_1.decToHex(this.tokenFee, 16)));
            return context.digest('hex');
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Adds a tranction to the Token Send
     * @param {Transaction} transaction - transaction you want to add to this token send request
     * @returns {Transaction[]} list of all transactions
     */
    TokenSend.prototype.addTransaction = function (transaction) {
        if (this.transactions.length === 8)
            throw new Error('Can only fit 8 transactions per token send request!');
        if (!transaction.destination || !transaction.amount)
            throw new Error('Token send destination and amount');
        this.transactions.push(transaction);
        return this.transactions;
    };
    /**
     * Returns the request JSON ready for broadcast to the Logos Network
     * @returns {TokenSendJSON} JSON request
     */
    TokenSend.prototype.toJSON = function () {
        var obj = _super.prototype.toJSON.call(this);
        obj.transactions = this.transactions;
        obj.token_fee = this.tokenFee;
        return obj;
    };
    return TokenSend;
}(TokenRequest_1.default));
exports.default = TokenSend;
//# sourceMappingURL=TokenSend.js.map