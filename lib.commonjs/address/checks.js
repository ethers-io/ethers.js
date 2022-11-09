"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveAddress = exports.isAddress = exports.isAddressable = void 0;
const index_js_1 = require("../utils/index.js");
const address_js_1 = require("./address.js");
function isAddressable(value) {
    return (value && typeof (value.getAddress) === "function");
}
exports.isAddressable = isAddressable;
function isAddress(value) {
    try {
        (0, address_js_1.getAddress)(value);
        return true;
    }
    catch (error) { }
    return false;
}
exports.isAddress = isAddress;
async function checkAddress(target, promise) {
    const result = await promise;
    if (result == null || result === "0x0000000000000000000000000000000000000000") {
        (0, index_js_1.assert)(typeof (target) !== "string", "unconfigured name", "UNCONFIGURED_NAME", { value: target });
        (0, index_js_1.assertArgument)(false, "invalid AddressLike value; did not resolve to a value address", "target", target);
    }
    return (0, address_js_1.getAddress)(result);
}
// Resolves an Ethereum address, ENS name or Addressable object,
// throwing if the result is null.
function resolveAddress(target, resolver) {
    if (typeof (target) === "string") {
        if (target.match(/^0x[0-9a-f]{40}$/i)) {
            return (0, address_js_1.getAddress)(target);
        }
        (0, index_js_1.assert)(resolver != null, "ENS resolution requires a provider", "UNSUPPORTED_OPERATION", { operation: "resolveName" });
        return checkAddress(target, resolver.resolveName(target));
    }
    else if (isAddressable(target)) {
        return checkAddress(target, target.getAddress());
    }
    else if (typeof (target.then) === "function") {
        return checkAddress(target, target);
    }
    (0, index_js_1.assertArgument)(false, "unsupported addressable value", "target", target);
}
exports.resolveAddress = resolveAddress;
//# sourceMappingURL=checks.js.map