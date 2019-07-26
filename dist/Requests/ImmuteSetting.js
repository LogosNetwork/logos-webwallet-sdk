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
var Settings = {
    issuance: 0,
    revoke: 2,
    freeze: 4,
    adjust_fee: 6,
    whitelist: 8
};
var ImmuteSetting = /** @class */ (function (_super) {
    __extends(ImmuteSetting, _super);
    function ImmuteSetting(options) {
        if (options === void 0) { options = {
            setting: null
        }; }
        var _this = this;
        options.type = {
            text: 'immute_setting',
            value: 5
        };
        _this = _super.call(this, options) || this;
        /**
         * Setting you wish to change about the token
         * @type {string}
         * @private
         */
        if (options.setting !== undefined) {
            _this._setting = options.setting;
        }
        else {
            _this._setting = null;
        }
        return _this;
    }
    Object.defineProperty(ImmuteSetting.prototype, "setting", {
        /**
         * Returns the string of the setting
         * @type {Setting}
         */
        get: function () {
            return this._setting;
        },
        set: function (val) {
            if (typeof Settings[val.toLowerCase()] !== 'number')
                throw new Error('Invalid setting option');
            this._setting = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ImmuteSetting.prototype, "hash", {
        /**
         * Returns calculated hash or Builds the request and calculates the hash
         *
         * @throws An exception if missing parameters or invalid parameters
         * @type {string}
         * @readonly
         */
        get: function () {
            if (!this.setting)
                throw new Error('setting is not set.');
            if (typeof Settings[this.setting] !== 'number')
                throw new Error('Invalid setting option');
            return _super.prototype.requestHash.call(this)
                .update(Utils_1.hexToUint8(Utils_1.decToHex(Settings[this.setting], 1)))
                .digest('hex');
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns the request JSON ready for broadcast to the Logos Network
     * @returns {ImmuteSettingJSON} JSON request
     */
    ImmuteSetting.prototype.toJSON = function () {
        var obj = _super.prototype.toJSON.call(this);
        obj.setting = this.setting;
        return obj;
    };
    return ImmuteSetting;
}(TokenRequest_1.default));
exports.default = ImmuteSetting;
//# sourceMappingURL=ImmuteSetting.js.map