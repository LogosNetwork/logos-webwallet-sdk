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
var Burn = /** @class */ (function (_super) {
    __extends(Burn, _super);
    function Burn(options) {
        if (options === void 0) { options = {
            amount: '0'
        }; }
        var _this = this;
        options.type = {
            text: 'burn',
            value: 11
        };
        _this = _super.call(this, options) || this;
        /**
         * Amount to add to the token
         * @type {string}
         * @private
         */
        if (options.amount !== undefined) {
            _this._amount = options.amount;
        }
        else {
            _this._amount = '0';
        }
        return _this;
    }
    Object.defineProperty(Burn.prototype, "amount", {
        /**
         * Return the amount you are adding
         * @type {string}
         */
        get: function () {
            return this._amount;
        },
        set: function (amount) {
            if (typeof amount === 'undefined')
                throw new Error('amount should be passed - pass this as the base unit of your token (e.g. satoshi)');
            this._amount = amount;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Burn.prototype, "hash", {
        /**
         * Returns calculated hash or Builds the request and calculates the hash
         *
         * @throws An exception if missing parameters or invalid parameters
         * @type {string}
         * @readonly
         */
        get: function () {
            if (this.amount === null)
                throw new Error('Amount is not set.');
            return _super.prototype.requestHash.call(this)
                .update(Utils_1.hexToUint8(Utils_1.decToHex(this.amount, 16)))
                .digest('hex');
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns the request JSON ready for broadcast to the Logos Network
     * @returns {BurnJSON} JSON request
     */
    Burn.prototype.toJSON = function () {
        var obj = _super.prototype.toJSON.call(this);
        obj.amount = this.amount;
        return obj;
    };
    return Burn;
}(TokenRequest_1.default));
exports.default = Burn;
//# sourceMappingURL=Burn.js.map