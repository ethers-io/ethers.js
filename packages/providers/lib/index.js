"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Formatter = exports.composeHederaTimestamp = exports.getNetwork = exports.getDefaultProvider = exports.HederaProvider = exports.DefaultHederaProvider = exports.BaseProvider = exports.Provider = void 0;
var abstract_provider_1 = require("@hethers/abstract-provider");
Object.defineProperty(exports, "Provider", { enumerable: true, get: function () { return abstract_provider_1.Provider; } });
var networks_1 = require("@hethers/networks");
Object.defineProperty(exports, "getNetwork", { enumerable: true, get: function () { return networks_1.getNetwork; } });
var base_provider_1 = require("./base-provider");
Object.defineProperty(exports, "BaseProvider", { enumerable: true, get: function () { return base_provider_1.BaseProvider; } });
var default_hedera_provider_1 = require("./default-hedera-provider");
Object.defineProperty(exports, "DefaultHederaProvider", { enumerable: true, get: function () { return default_hedera_provider_1.DefaultHederaProvider; } });
var formatter_1 = require("./formatter");
Object.defineProperty(exports, "Formatter", { enumerable: true, get: function () { return formatter_1.Formatter; } });
var logger_1 = require("@hethers/logger");
var _version_1 = require("./_version");
var hedera_provider_1 = __importDefault(require("./hedera-provider"));
exports.HederaProvider = hedera_provider_1.default;
var logger = new logger_1.Logger(_version_1.version);
////////////////////////
// Helper Functions
function getDefaultProvider(network, options) {
    if (network == null) {
        network = "mainnet";
    }
    // If passed a URL, figure out the right type of provider based on the scheme
    if (typeof (network) === "string") {
        // Handle http and ws (and their secure variants)
        var match = network.match(/^(ws|http)s?:/i);
        if (match) {
            logger.throwArgumentError("unsupported URL scheme", "network", network);
        }
    }
    var n = (0, networks_1.getNetwork)(network);
    if (!n || !n._defaultProvider) {
        logger.throwError("unsupported getDefaultProvider network", logger_1.Logger.errors.NETWORK_ERROR, {
            operation: "getDefaultProvider",
            network: network
        });
    }
    return n._defaultProvider({
        HederaProvider: hedera_provider_1.default,
        DefaultHederaProvider: default_hedera_provider_1.DefaultHederaProvider,
    }, options);
}
exports.getDefaultProvider = getDefaultProvider;
/**
 * Always composes a hedera timestamp from the given string/numeric input.
 * May lose precision - JavaScript's floating point loss
 *
 * @param timestamp - the timestamp to be formatted
 */
function composeHederaTimestamp(timestamp) {
    if (typeof timestamp === "number") {
        var tsCopy = timestamp.toString();
        var seconds = tsCopy.slice(0, 10);
        if (seconds.length < 10) {
            for (var i = seconds.length; i < 10; i++) {
                seconds += "0";
            }
        }
        var nanosTemp = tsCopy.slice(seconds.length);
        if (nanosTemp.length < 9) {
            for (var i = nanosTemp.length; i < 9; i++) {
                nanosTemp += "0";
            }
        }
        return seconds + "." + nanosTemp;
    }
    else if (typeof timestamp === "string") {
        if (timestamp.includes(".")) {
            // already formatted
            var split = timestamp.split(".");
            if (split[0].length === 10 && split[1].length === 9) {
                return timestamp;
            }
            // floating point number - we lose precision
            return composeHederaTimestamp(parseInt(timestamp.split('.')[0]));
        }
        else {
            return composeHederaTimestamp(parseInt(timestamp));
        }
    }
    else {
        // not a string, neither a number
        return logger.throwArgumentError('invalid timestamp', logger_1.Logger.errors.INVALID_ARGUMENT, { timestamp: timestamp });
    }
}
exports.composeHederaTimestamp = composeHederaTimestamp;
//# sourceMappingURL=index.js.map