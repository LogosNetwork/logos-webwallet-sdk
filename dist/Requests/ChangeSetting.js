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
var ChangeSetting = /** @class */ (function (_super) {
    __extends(ChangeSetting, _super);
    function ChangeSetting(options) {
        if (options === void 0) { options = {
            setting: null,
            value: null
        }; }
        var _this = this;
        options.type = {
            text: 'change_setting',
            value: 4
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
        /**
         * Value you wish to set the setting to
         * @type {boolean}
         * @private
         */
        if (options.value !== undefined) {
            _this._value = options.value.toString() === 'true';
        }
        else {
            _this._value = null;
        }
        return _this;
    }
    Object.defineProperty(ChangeSetting.prototype, "value", {
        /**
         * Return the value of the changed setting
         * @type {boolean}
         */
        get: function () {
            return this._value;
        },
        set: function (val) {
            this._value = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChangeSetting.prototype, "setting", {
        /**
         * Returns the string of the setting
         * @type {Setting}
         */
        get: function () {
            return this._setting;
        },
        set: function (val) {
            this._setting = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChangeSetting.prototype, "hash", {
        /**
         * Returns calculated hash or Builds the request and calculates the hash
         *
         * @throws An exception if missing parameters or invalid parameters
         * @type {string}
         * @readonly
         */
        get: function () {
            if (!this.setting)
                throw new Error('Settings is not set.');
            if (this.value === null)
                throw new Error('Value is not set.');
            return _super.prototype.requestHash.call(this)
                .update(Utils_1.hexToUint8(Utils_1.decToHex(Settings[this.setting], 1)))
                .update(Utils_1.hexToUint8(Utils_1.decToHex((+this.value), 1)))
                .digest('hex');
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns the request JSON ready for broadcast to the Logos Network
     * @returns {ChangeSettingJSON} JSON request
     */
    ChangeSetting.prototype.toJSON = function () {
        var obj = _super.prototype.toJSON.call(this);
        obj.setting = this.setting;
        obj.value = this.value;
        return obj;
    };
    return ChangeSetting;
}(TokenRequest_1.default));
exports.default = ChangeSetting;
//# sourceMappingURL=ChangeSetting.js.map