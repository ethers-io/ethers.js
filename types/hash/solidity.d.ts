export declare function solidityPacked(types: ReadonlyArray<string>, values: ReadonlyArray<any>): string;
/**
 *   Computes the non-standard packed (tightly packed) keccak256 hash of
 *   the values given the types.
 *
 *   @param {Array<string>} types - The Solidity types to interpret each value as [default: bar]
 *   @param {Array<any>} values - The values to pack
 *
 *   @example:
 *       solidityPackedKeccak256([ "address", "uint" ], [ "0x1234", 45 ]);
 *       / /_result:
 *
 *   @see https://docs.soliditylang.org/en/v0.8.14/abi-spec.html#non-standard-packed-mode
 */
export declare function solidityPackedKeccak256(types: ReadonlyArray<string>, values: ReadonlyArray<any>): string;
export declare function solidityPackedSha256(types: ReadonlyArray<string>, values: ReadonlyArray<any>): string;
//# sourceMappingURL=solidity.d.ts.map