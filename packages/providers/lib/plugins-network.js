import { defineProperties } from "@ethersproject/properties";
import { logger } from "./logger.js";
const EnsAddress = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
export class NetworkPlugin {
    constructor(name) {
        defineProperties(this, { name });
    }
    clone() {
        return new NetworkPlugin(this.name);
    }
    validate(network) {
        return this;
    }
}
export class GasCostPlugin extends NetworkPlugin {
    constructor(effectiveBlock = 0, costs) {
        super(`org.ethers.plugins.gas-cost#${(effectiveBlock || 0)}`);
        const props = { effectiveBlock };
        function set(name, nullish) {
            let value = (costs || {})[name];
            if (value == null) {
                value = nullish;
            }
            if (typeof (value) !== "number") {
                logger.throwArgumentError(`invalud value for ${name}`, "costs", costs);
            }
            props[name] = value;
        }
        set("txBase", 21000);
        set("txCreate", 32000);
        set("txDataZero", 4);
        set("txDataNonzero", 16);
        set("txAccessListStorageKey", 1900);
        set("txAccessListAddress", 2400);
        defineProperties(this, props);
    }
    clone() {
        return new GasCostPlugin(this.effectiveBlock, this);
    }
}
// Networks shoudl use this plugin to specify the contract address
// and network necessary to resolve ENS names.
export class EnsPlugin extends NetworkPlugin {
    constructor(address, targetNetwork) {
        super("org.ethers.plugins.ens");
        defineProperties(this, {
            address: (address || EnsAddress),
            targetNetwork: ((targetNetwork == null) ? 1 : targetNetwork)
        });
    }
    clone() {
        return new EnsPlugin(this.address, this.targetNetwork);
    }
    validate(network) {
        network.formatter.address(this.address);
        return this;
    }
}
export class MaxPriorityFeePlugin extends NetworkPlugin {
    constructor(priorityFee) {
        super("org.ethers.plugins.max-priority-fee");
        defineProperties(this, {
            priorityFee: logger.getBigInt(priorityFee)
        });
    }
    async getPriorityFee(provider) {
        return this.priorityFee;
    }
    clone() {
        return new MaxPriorityFeePlugin(this.priorityFee);
    }
}
//# sourceMappingURL=plugins-network.js.map