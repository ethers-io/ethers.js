import { getAddress } from "./address.js";
import { logger } from "./logger.js";
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
// Resolves an Ethereum address, ENS name or Addressable object,
// throwing if the result is null; an explicit null returns null
//export async function resolveAddress(target?: null, resolver?: null | NameResolver): Promise<null>;
//export async function resolveAddress(target: string | Addressable, resolver?: null | NameResolver): Promise<string>;
//export async function resolveAddress(target: null | undefined | string | Addressable, resolver?: null | NameResolver) {
export async function resolveAddress(target, resolver) {
    //if (target == null) { return null; }
    if (typeof (target) === "string") {
        if (target.match(/^0x[0-9a-f]{40}$/i)) {
            return getAddress(target);
        }
        if (resolver == null) {
            return logger.throwError("ENS resolution requires a provider", "UNSUPPORTED_OPERATION", {
                operation: "resolveName",
            });
        }
        const result = await resolver.resolveName(target);
        if (result == null || result === "0x0000000000000000000000000000000000000000") {
            return logger.throwError("unconfigured name", "UNCONFIGURED_NAME", { value: target });
        }
        return getAddress(result);
    }
    else if (isAddressable(target)) {
        const result = await target.getAddress();
        if (result == null) {
            logger.throwArgumentError("addressable resolved to null", "target", target);
        }
        return getAddress(result);
    }
    return logger.throwArgumentError("unsupported addressable value", "target", target);
}
//# sourceMappingURL=checks.js.map