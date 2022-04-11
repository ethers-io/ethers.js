import type { BigNumberish, BytesLike } from "@ethersproject/logger";
export declare function getCreateAddress(tx: {
    from: string;
    nonce: BigNumberish;
}): string;
export declare function getCreate2Address(_from: string, _salt: BytesLike, _initCodeHash: BytesLike): string;
//# sourceMappingURL=contract-address.d.ts.map