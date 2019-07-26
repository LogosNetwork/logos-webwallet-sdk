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
var UpdateIssuerInfo = /** @class */ (function (_super) {
    __extends(UpdateIssuerInfo, _super);
    function UpdateIssuerInfo(options) {
        if (options === void 0) { options = {
            issuerInfo: '',
            new_info: ''
        }; }
        var _this = this;
        options.type = {
            text: 'update_issuer_info',
            value: 9
        };
        _this = _super.call(this, options) || this;
        /**
         * Issuer Info of the token
         * @type {TokenSettings}
         * @private
         */
        if (options.issuerInfo !== undefined) {
            _this._issuerInfo = options.issuerInfo;
        }
        else if (options.new_info) {
            _this._issuerInfo = options.new_info;
        }
        else {
            _this._issuerInfo = '';
        }
        return _this;
    }
    Object.defineProperty(UpdateIssuerInfo.prototype, "issuerInfo", {
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
    Object.defineProperty(UpdateIssuerInfo.prototype, "hash", {
        /**
         * Returns calculated hash or Builds the request and calculates the hash
         *
         * @throws An exception if missing parameters or invalid parameters
         * @type {string}
         * @readonly
         */
        get: function () {
            if (this.issuerInfo === null)
                throw new Error('IssuerInfo is not set.');
            if (Utils_1.byteCount(this.issuerInfo) > 512)
                throw new Error('Issuer Info - Invalid Size. Max Size 512 Bytes');
            return _super.prototype.requestHash.call(this)
                .update(Utils_1.hexToUint8(Utils_1.stringToHex(this.issuerInfo)))
                .digest('hex');
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns the request JSON ready for broadcast to the Logos Network
     * @param {boolean} pretty - if true it will format the JSON (note you can't broadcast pretty json)
     * @returns {UpdateIssuerInfoJSON} JSON request
     */
    UpdateIssuerInfo.prototype.toJSON = function () {
        var obj = _super.prototype.toJSON.call(this);
        obj.new_info = this.issuerInfo;
        return obj;
    };
    return UpdateIssuerInfo;
}(TokenRequest_1.default));
exports.default = UpdateIssuerInfo;
//# sourceMappingURL=UpdateIssuerInfo.js.map