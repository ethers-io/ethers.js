import { defineProperties } from "../utils/properties.js";
import { throwArgumentError } from "../utils/index.js";
const EnsAddress = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
export class NetworkPlugin {
    name;
    constructor(name) {
        defineProperties(this, { name });
    }
    clone() {
        return new NetworkPlugin(this.name);
    }
}
export class GasCostPlugin extends NetworkPlugin {
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
                throwArgumentError(`invalud value for ${name}`, "costs", costs);
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
    // The ENS contract address
    address;
    // The network ID that the ENS contract lives on
    targetNetwork;
    constructor(address, targetNetwork) {
        super("org.ethers.network-plugins.ens");
        defineProperties(this, {
            address: (address || EnsAddress),
            targetNetwork: ((targetNetwork == null) ? 1 : targetNetwork)
        });
    }
    clone() {
        return new EnsPlugin(this.address, this.targetNetwork);
    }
}
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
export class FeeDataNetworkPlugin extends NetworkPlugin {
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
export class CustomBlockNetworkPlugin extends NetworkPlugin {
    #blockFunc;
    #blockWithTxsFunc;
    constructor(blockFunc, blockWithTxsFunc) {
        super("org.ethers.network-plugins.custom-block");
        this.#blockFunc = blockFunc;
        this.#blockWithTxsFunc = blockWithTxsFunc;
    }
    async getBlock(provider, block) {
        return await this.#blockFunc(provider, block);
    }
    async getBlockWithTransactions(provider, block) {
        return await this.#blockWithTxsFunc(provider, block);
    }
    clone() {
        return new CustomBlockNetworkPlugin(this.#blockFunc, this.#blockWithTxsFunc);
    }
}
//# sourceMappingURL=plugins-network.js.map