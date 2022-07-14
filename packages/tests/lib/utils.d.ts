import { hethers } from "@hashgraph/hethers";
declare function randomBytes(seed: string, lower: number, upper?: number): Uint8Array;
declare function randomHexString(seed: string, lower: number, upper?: number): string;
declare function randomNumber(seed: string, lower: number, upper: number): number;
declare function equals(a: any, b: any): boolean;
declare const getAccounts: () => {
    local: {
        ecdsa: {
            account: string;
            privateKey: string;
            isED25519Type: boolean;
        }[];
        ecdsaAlias: {
            account: string;
            address: string;
            privateKey: string;
            isED25519Type: boolean;
        }[];
        ed25519: {
            account: string;
            privateKey: string;
            isED25519Type: boolean;
        }[];
    };
    testnet: {
        ecdsa: {
            account: string;
            privateKey: string;
            isED25519Type: boolean;
        }[];
        ed25519: ({
            account: string;
            alias: string;
            privateKey: string;
            isED25519Type: boolean;
        } | {
            account: string;
            privateKey: string;
            isED25519Type: boolean;
            alias?: undefined;
        })[];
    };
};
declare const getProviders: () => {
    local: hethers.providers.BaseProvider[];
    testnet: hethers.providers.BaseProvider[];
};
declare const getWallets: () => {
    local: {
        ecdsa: hethers.Wallet[];
        ed25519: hethers.Wallet[];
    };
    testnet: {
        ecdsa: hethers.Wallet[];
        ed25519: hethers.Wallet[];
    };
};
export { randomBytes, randomHexString, randomNumber, equals, getAccounts, getProviders, getWallets };
//# sourceMappingURL=utils.d.ts.map