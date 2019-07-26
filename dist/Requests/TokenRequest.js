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
var TokenRequest = /** @class */ (function (_super) {
    __extends(TokenRequest, _super);
    function TokenRequest(options) {
        if (options === void 0) { options = {
            tokenID: null
        }; }
        var _this = _super.call(this, options) || this;
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
        else if (options.tokenAccount) {
            _this._tokenID = Utils_1.keyFromAccount(options.tokenAccount);
        }
        else if (options.token_account) {
            _this._tokenID = Utils_1.keyFromAccount(options.token_account);
        }
        else {
            _this._tokenID = null;
        }
        return _this;
    }
    Object.defineProperty(TokenRequest.prototype, "tokenID", {
        /**
         * Return the token id
         * @type {string}
         */
        get: function () {
            return this._tokenID;
        },
        set: function (val) {
            if (val.startsWith('lgs_')) {
                this._tokenID = Utils_1.keyFromAccount(val);
            }
            else {
                this._tokenID = val;
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Creates a Blake2b Context for the request
     * @returns {context} - Blake2b Context
     */
    TokenRequest.prototype.requestHash = function () {
        if (!this.tokenID)
            throw new Error('TokenID is not set.');
        return _super.prototype.requestHash.call(this).update(Utils_1.hexToUint8(this.tokenID));
    };
    /**
     * Returns the base TokenRequest JSON
     * @returns {TokenRequestJSON} JSON request
     */
    TokenRequest.prototype.toJSON = function () {
        var obj = _super.prototype.toJSON.call(this);
        obj.token_id = this.tokenID;
        obj.token_account = Utils_1.accountFromHexKey(this.tokenID);
        return obj;
    };
    return TokenRequest;
}(Request_1.default));
exports.default = TokenRequest;
//# sourceMappingURL=TokenRequest.js.map