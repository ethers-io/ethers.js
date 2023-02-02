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
    constructor(effectiveBlock, costs) {
        if (effectiveBlock == null) {
            effectiveBlock = 0;
        }
        super(`org.ethers.network.plugins.GasCost#${(effectiveBlock || 0)}`);
        const props = { effectiveBlock };
        function set(name, nullish) {
            let value = (costs || {})[name];
            if (value == null) {
                value = nullish;
            }
            (0, index_js_1.assertArgument)(typeof (value) === "number", `invalud value for ${name}`, "costs", costs);
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
        super("org.ethers.plugins.network.Ens");
        (0, properties_js_1.defineProperties)(this, {
            address: (address || EnsAddress),
            targetNetwork: ((targetNetwork == null) ? 1 : targetNetwork)
        });
    }
    clone() {
        return new EnsPlugin(this.address, this.targetNetwork);
    }
}
exports.EnsPlugin = EnsPlugin;
class FeeDataNetworkPlugin extends NetworkPlugin {
    #feeDataFunc;
    get feeDataFunc() {
        return this.#feeDataFunc;
    }
    constructor(feeDataFunc) {
        super("org.ethers.plugins.network.FeeData");
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
/*
export class CustomBlockNetworkPlugin extends NetworkPlugin {
    readonly #blockFunc: (provider: Provider, block: BlockParams<string>) => Block<string>;
    readonly #blockWithTxsFunc: (provider: Provider, block: BlockParams<TransactionResponseParams>) => Block<TransactionResponse>;

    constructor(blockFunc: (provider: Provider, block: BlockParams<string>) => Block<string>, blockWithTxsFunc: (provider: Provider, block: BlockParams<TransactionResponseParams>) => Block<TransactionResponse>) {
        super("org.ethers.network-plugins.custom-block");
        this.#blockFunc = blockFunc;
        this.#blockWithTxsFunc = blockWithTxsFunc;
    }

    async getBlock(provider: Provider, block: BlockParams<string>): Promise<Block<string>> {
        return await this.#blockFunc(provider, block);
    }

    async getBlockions(provider: Provider, block: BlockParams<TransactionResponseParams>): Promise<Block<TransactionResponse>> {
        return await this.#blockWithTxsFunc(provider, block);
    }

    clone(): CustomBlockNetworkPlugin {
        return new CustomBlockNetworkPlugin(this.#blockFunc, this.#blockWithTxsFunc);
    }
}
*/
//# sourceMappingURL=plugins-network.js.map