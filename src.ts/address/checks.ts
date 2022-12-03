import { assert, assertArgument } from "../utils/index.js";

import { getAddress } from "./address.js";

import type { Addressable, AddressLike, NameResolver } from "./index.js";


/**
 *  Returns true if %%value%% is an object which implements the
 *  [[Addressable]] interface.
 */
export function isAddressable(value: any): value is Addressable {
    return (value && typeof(value.getAddress) === "function");
}

/**
 *  Returns true if %%value%% is a valid address.
 */
export function isAddress(value: any): boolean {
    try {
        getAddress(value);
        return true;
    } catch (error) { }
    return false;
}

async function checkAddress(target: any, promise: Promise<null | string>): Promise<string> {
    const result = await promise;
    if (result == null || result === "0x0000000000000000000000000000000000000000") {
        assert(typeof(target) !== "string", "unconfigured name", "UNCONFIGURED_NAME", { value: target });
        assertArgument(false, "invalid AddressLike value; did not resolve to a value address", "target", target);
    }
    return getAddress(result);
}

/**
 *  Resolves to an address for the %%target%%, which may be any
 *  supported address type, an [[Addressable]] or a Promise which
 *  resolves to an address.
 *
 *  If an ENS name is provided, but that name has not been correctly
 *  configured a [[UnconfiguredNameError]] is thrown.
 */
export function resolveAddress(target: AddressLike, resolver?: null | NameResolver): string | Promise<string> {

    if (typeof(target) === "string") {
        if (target.match(/^0x[0-9a-f]{40}$/i)) { return getAddress(target); }

        assert(resolver != null, "ENS resolution requires a provider",
            "UNSUPPORTED_OPERATION", { operation: "resolveName" });

        return checkAddress(target, resolver.resolveName(target));

    } else if (isAddressable(target)) {
        return checkAddress(target, target.getAddress());

    } else if (typeof(target.then) === "function") {
        return checkAddress(target, target);
    }

    assertArgument(false, "unsupported addressable value", "target", target);
}
