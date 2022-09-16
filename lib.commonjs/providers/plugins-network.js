"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeeDataNetworkPlugin = exports.EnsPlugin = exports.GasCostPlugin = exports.NetworkPlugin = void 0;
const properties_js_1 = require("../utils/properties.js");
const index_js_1 = require("../utils/index.js");
const EnsAddress = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
class NetworkPlugin {
    name;
    constructor(name) {
        (0, properties_js_1.defineProperties)(this, { name });
    }
    clone() {
        return new NetworkPlugin(this.name);
    }
    validate(network) {
        return this;
    }
}
exports.NetworkPlugin = NetworkPlugin;
class GasCostPlugin extends NetworkPlugin {
    effectiveBlock;
    txBase;
    txCreate;
    txDataZero;
    txDataNonzero;
    txAccessListStorageKey;
    txAccessListAddress;
    constructor(effectiveBlock = 0, costs) {
        super(`org.ethers.network-plugins.gas-cost#${(effectiveBlock || 0)}`);
        const props = { effectiveBlock };
        function set(name, nullish) {
            let value = (costs || {})[name];
            if (value == null) {
                value = nullish;
            }
            if (typeof (value) !== "number") {
                (0, index_js_1.throwArgumentError)(`invalud value for ${name}`, "costs", costs);
            }
            props[name] = value;
        }
        set("txBase", 21000);
        set("txCreate", 32000);
        set("txDataZero", 4);
        set("txDataNonzero", 16);
        set("txAccessListStorageKey", 1900);
        set("txAccessListAddress", 2400);
        (0, properties_js_1.defineProperties)(this, props);
    }
    clone() {
        return new GasCostPlugin(this.effectiveBlock, this);
    }
}
exports.GasCostPlugin = GasCostPlugin;
// Networks shoudl use this plugin to specify the contract address
// and network necessary to resolve ENS names.
class EnsPlugin extends NetworkPlugin {
    // The ENS contract address
    address;
    // The network ID that the ENS contract lives on
    targetNetwork;
    constructor(address, targetNetwork) {
        super("org.ethers.network-plugins.ens");
        (0, properties_js_1.defineProperties)(this, {
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
exports.EnsPlugin = EnsPlugin;
/*
export class MaxPriorityFeePlugin extends NetworkPlugin {
    readonly priorityFee!: bigint;

    constructor(priorityFee: BigNumberish) {
        super("org.ethers.plugins.max-priority-fee");
        defineProperties<MaxPriorityFeePlugin>(this, {
            priorityFee: logger.getBigInt(priorityFee)
        });
    }

    async getPriorityFee(provider: Provider): Promise<bigint> {
        return this.priorityFee;
    }

    clone(): MaxPriorityFeePlugin {
        return new MaxPriorityFeePlugin(this.priorityFee);
    }
}
*/
class FeeDataNetworkPlugin extends NetworkPlugin {
    #feeDataFunc;
    get feeDataFunc() { return this.#feeDataFunc; }
    constructor(feeDataFunc) {
        super("org.ethers.network-plugins.fee-data");
        this.#feeDataFunc = feeDataFunc;
    }
    async getFeeData(provider) {
        return await this.#feeDataFunc(provider);
    }
    clone() {
        return new FeeDataNetworkPlugin(this.#feeDataFunc);
    }
}
exports.FeeDataNetworkPlugin = FeeDataNetworkPlugin;
//# sourceMappingURL=plugins-network.js.map