import type { BigNumberish, BytesLike } from "../utils/index.js";
/**
 *  Returns the address that would result from a ``CREATE`` for %%tx%%.
 *
 *  This can be used to compute the address a contract will be
 *  deployed to by an EOA when sending a deployment transaction (i.e.
 *  when the ``to`` address is ``null``).
 *
 *  This can also be used to compute the address a contract will be
 *  deployed to by a contract, by using the contract's address as the
 *  ``to`` and the contract's nonce.
 */
export declare function getCreateAddress(tx: {
    from: string;
    nonce: BigNumberish;
}): string;
/**
 *  Returns the address that would result from a ``CREATE2`` operation
 *  with the given %%from%%, %%salt%% and %%initCodeHash%%.
 *
 *  To compute the %%initCodeHash%% from a contract's init code, use
 *  the [[keccak256]] function.
 */
export declare function getCreate2Address(_from: string, _salt: BytesLike, _initCodeHash: BytesLike): string;
//# sourceMappingURL=contract-address.d.ts.map