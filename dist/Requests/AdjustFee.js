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
var AdjustFee = /** @class */ (function (_super) {
    __extends(AdjustFee, _super);
    function AdjustFee(options) {
        if (options === void 0) { options = {
            feeType: 'flat',
            feeRate: '0'
        }; }
        var _this = this;
        options.type = {
            text: 'adjust_fee',
            value: 8
        };
        _this = _super.call(this, options) || this;
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
        return _this;
    }
    Object.defineProperty(AdjustFee.prototype, "feeType", {
        /**
         * The Type of fee for this token (flat or percentage)
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
    Object.defineProperty(AdjustFee.prototype, "feeRate", {
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
    Object.defineProperty(AdjustFee.prototype, "hash", {
        /**
         * Returns calculated hash or Builds the request and calculates the hash
         *
         * @throws An exception if missing parameters or invalid parameters
         * @type {string}
         * @readonly
         */
        get: function () {
            if (!this.feeType)
                throw new Error('Fee Type is not set.');
            if (!this.feeRate)
                throw new Error('Fee Rate is not set.');
            if (this.feeType === 'percentage' && bigInt(this.feeRate).greater(bigInt('100')))
                throw new Error('Fee Type is percentage and exceeds the maximum of 100');
            return _super.prototype.requestHash.call(this)
                .update(Utils_1.hexToUint8(Utils_1.decToHex(+(this.feeType === 'flat'), 1)))
                .update(Utils_1.hexToUint8(Utils_1.decToHex(this.feeRate, 16)))
                .digest('hex');
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns the request JSON ready for broadcast to the Logos Network
     * @returns {AdjustFeeJSON} JSON request
     */
    AdjustFee.prototype.toJSON = function () {
        var obj = _super.prototype.toJSON.call(this);
        obj.fee_type = this.feeType;
        obj.fee_rate = this.feeRate;
        return obj;
    };
    return AdjustFee;
}(TokenRequest_1.default));
exports.default = AdjustFee;
//# sourceMappingURL=AdjustFee.js.map