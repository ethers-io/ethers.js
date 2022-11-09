import { assert, assertArgument } from "../utils/index.js";
import { getAddress } from "./address.js";
export function isAddressable(value) {
    return (value && typeof (value.getAddress) === "function");
}
export function isAddress(value) {
    try {
        getAddress(value);
        return true;
    }
    catch (error) { }
    return false;
}
async function checkAddress(target, promise) {
    const result = await promise;
    if (result == null || result === "0x0000000000000000000000000000000000000000") {
        assert(typeof (target) !== "string", "unconfigured name", "UNCONFIGURED_NAME", { value: target });
        assertArgument(false, "invalid AddressLike value; did not resolve to a value address", "target", target);
    }
    return getAddress(result);
}
// Resolves an Ethereum address, ENS name or Addressable object,
// throwing if the result is null.
export function resolveAddress(target, resolver) {
    if (typeof (target) === "string") {
        if (target.match(/^0x[0-9a-f]{40}$/i)) {
            return getAddress(target);
        }
        assert(resolver != null, "ENS resolution requires a provider", "UNSUPPORTED_OPERATION", { operation: "resolveName" });
        return checkAddress(target, resolver.resolveName(target));
    }
    else if (isAddressable(target)) {
        return checkAddress(target, target.getAddress());
    }
    else if (typeof (target.then) === "function") {
        return checkAddress(target, target);
    }
    assertArgument(false, "unsupported addressable value", "target", target);
}
//# sourceMappingURL=checks.js.map