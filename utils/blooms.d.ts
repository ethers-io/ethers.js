/**
 * Returns true if the bloom is a valid bloom
 * @param bloom The bloom
 */
export declare function isBloom(bloom: string): boolean;
/**
 * Returns true if the hex value is part of the given bloom
 * note: false positives are possible.
 * @param bloom encoded bloom
 * @param value The value
 */
export declare function isHexInBloom(bloom: string, value: string | Uint8Array): boolean;
/**
 * Returns true if ethereum users address is part of the given bloom.
 * note: false positives are possible.
 * @param bloom encoded bloom
 * @param address the address to test
 */
export declare function isUserEthereumAddressInBloom(bloom: string, ethereumAddress: string): boolean;
/**
 * Returns true if contract address is part of the given bloom.
 * note: false positives are possible.
 * @param bloom encoded bloom
 * @param contractAddress the contract address to test
 */
export declare function isContractAddressInBloom(bloom: string, contractAddress: string): boolean;
