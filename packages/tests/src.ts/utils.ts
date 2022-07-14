/* istanbul ignore file */

'use strict';

import { hethers } from "@hashgraph/hethers";

function randomBytes(seed: string, lower: number, upper?: number): Uint8Array {
    if (!upper) { upper = lower; }

    if (upper === 0 && upper === lower) { return new Uint8Array(0); }

    let result = hethers.utils.arrayify(hethers.utils.keccak256(hethers.utils.toUtf8Bytes(seed)));
    while (result.length < upper) {
        result = hethers.utils.concat([result, hethers.utils.keccak256(hethers.utils.concat([seed, result]))]);
    }

    let top = hethers.utils.arrayify(hethers.utils.keccak256(result));
    let percent = ((top[0] << 16) | (top[1] << 8) | top[2]) / 0x01000000;

    return result.slice(0, lower + Math.floor((upper - lower) * percent));
}

function randomHexString(seed: string, lower: number, upper?: number): string {
    return hethers.utils.hexlify(randomBytes(seed, lower, upper));
}

function randomNumber(seed: string, lower: number, upper: number): number {
    let top = randomBytes(seed, 3);
    let percent = ((top[0] << 16) | (top[1] << 8) | top[2]) / 0x01000000;
    return lower + Math.floor((upper - lower) * percent);
}

function equals(a: any, b: any): boolean {

    // Array (treat recursively)
    if (Array.isArray(a)) {
        if (!Array.isArray(b) || a.length !== b.length) { return false; }
        for (let i = 0; i < a.length; i++) {
            if (!equals(a[i], b[i])) { return false; }
        }
        return true;
    }

    // BigNumber
    if (a.eq) {
        if (!b.eq || !a.eq(b)) { return false; }
        return true;
    }

    // Uint8Array
    if (a.buffer) {
        if (!b.buffer || a.length !== b.length) { return false; }
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) { return false; }
        }

        return true;
    }

    // Something else
    return a === b;
}


const getAccounts = () => {
    return {
        local: {
            ecdsa: [
                { account: '0.0.1002', privateKey: '0x7f109a9e3b0d8ecfba9cc23a3614433ce0fa7ddcc80f2a8f10b222179a5a80d6', isED25519Type: false },
                { account: '0.0.1003', privateKey: '0x6ec1f2e7d126a74a1d2ff9e1c5d90b92378c725e506651ff8bb8616a5c724628', isED25519Type: false },
                { account: '0.0.1004', privateKey: '0xb4d7f7e82f61d81c95985771b8abf518f9328d019c36849d4214b5f995d13814', isED25519Type: false },
                { account: '0.0.1005', privateKey: '0x941536648ac10d5734973e94df413c17809d6cc5e24cd11e947e685acfbd12ae', isED25519Type: false },
                { account: '0.0.1006', privateKey: '0x5829cf333ef66b6bdd34950f096cb24e06ef041c5f63e577b4f3362309125863', isED25519Type: false },
                { account: '0.0.1007', privateKey: '0x8fc4bffe2b40b2b7db7fd937736c4575a0925511d7a0a2dfc3274e8c17b41d20', isED25519Type: false },
                { account: '0.0.1008', privateKey: '0xb6c10e2baaeba1fa4a8b73644db4f28f4bf0912cceb6e8959f73bb423c33bd84', isED25519Type: false },
                { account: '0.0.1009', privateKey: '0xfe8875acb38f684b2025d5472445b8e4745705a9e7adc9b0485a05df790df700', isED25519Type: false },
                { account: '0.0.1010', privateKey: '0xbdc6e0a69f2921a78e9af930111334a41d3fab44653c8de0775572c526feea2d', isED25519Type: false },
                { account: '0.0.1011', privateKey: '0x3e215c3d2a59626a669ed04ec1700f36c05c9b216e592f58bbfd3d8aa6ea25f9', isED25519Type: false },
            ].reverse(), // sometimes first 2-3 account ids are different so reverse the order
            ecdsaAlias: [
                { account: '0.0.1012', address: '0x67D8d32E9Bf1a9968a5ff53B87d777Aa8EBBEe69', privateKey: '0x105d050185ccb907fba04dd92d8de9e32c18305e097ab41dadda21489a211524', isED25519Type: false },
                { account: '0.0.1013', address: '0x05FbA803Be258049A27B820088bab1cAD2058871', privateKey: '0x2e1d968b041d84dd120a5860cee60cd83f9374ef527ca86996317ada3d0d03e7', isED25519Type: false },
                { account: '0.0.1014', address: '0x927E41Ff8307835A1C081e0d7fD250625F2D4D0E', privateKey: '0x45a5a7108a18dd5013cf2d5857a28144beadc9c70b3bdbd914e38df4e804b8d8', isED25519Type: false },
                { account: '0.0.1015', address: '0xc37f417fA09933335240FCA72DD257BFBdE9C275', privateKey: '0x6e9d61a325be3f6675cf8b7676c70e4a004d2308e3e182370a41f5653d52c6bd', isED25519Type: false },
                { account: '0.0.1016', address: '0xD927017F5a6a7A92458b81468Dc71FCE6115B325', privateKey: '0x0b58b1bd44469ac9f813b5aeaf6213ddaea26720f0b2f133d08b6f234130a64f', isED25519Type: false },
                { account: '0.0.1017', address: '0x5C41A21F14cFe9808cBEc1d91b55Ba75ed327Eb6', privateKey: '0x95eac372e0f0df3b43740fa780e62458b2d2cc32d6a440877f1cc2a9ad0c35cc', isED25519Type: false },
                { account: '0.0.1018', address: '0xcdaD5844f865F379beA057fb435AEfeF38361B68', privateKey: '0x6c6e6727b40c8d4b616ab0d26af357af09337299f09c66704146e14236972106', isED25519Type: false },
                { account: '0.0.1019', address: '0x6e5D3858f53FC66727188690946631bDE0466B1A', privateKey: '0x5072e7aa1b03f531b4731a32a021f6a5d20d5ddc4e55acbb71ae202fc6f3a26d', isED25519Type: false },
                { account: '0.0.1020', address: '0x29cbb51A44fd332c14180b4D471FBBc6654b1657', privateKey: '0x60fe891f13824a2c1da20fb6a14e28fa353421191069ba6b6d09dd6c29b90eff', isED25519Type: false },
                { account: '0.0.1021', address: '0x17b2B8c63Fa35402088640e426c6709A254c7fFb', privateKey: '0xeae4e00ece872dd14fb6dc7a04f390563c7d69d16326f2a703ec8e0934060cc7', isED25519Type: false },
            ].reverse(),
            ed25519: [
                { account: '0.0.1022', privateKey: '0xa608e2130a0a3cb34f86e757303c862bee353d9ab77ba4387ec084f881d420d4', isED25519Type: true },
                { account: '0.0.1023', privateKey: '0xbbd0894de0b4ecfa862e963825c5448d2d17f807a16869526bff29185747acdb', isED25519Type: true },
                { account: '0.0.1024', privateKey: '0x8fd50f886a2e7ed499e7686efd1436b50aa9b64b26e4ecc4e58ca26e6257b67d', isED25519Type: true },
                { account: '0.0.1025', privateKey: '0x62c966ebd9dcc0fc16a553b2ef5b72d1dca05cdf5a181027e761171e9e947420', isED25519Type: true },
                { account: '0.0.1026', privateKey: '0x805c9f422fd9a768fdd8c68f4fe0c3d4a93af714ed147ab6aed5f0ee8e9ee165', isED25519Type: true },
                { account: '0.0.1027', privateKey: '0xabfdb8bf0b46c0da5da8d764316f27f185af32357689f7e19cb9ec3e0f590775', isED25519Type: true },
                { account: '0.0.1028', privateKey: '0xec299c9f17bb8bdd5f3a21f1c2bffb3ac86c22e84c325e92139813639c9c3507', isED25519Type: true },
                { account: '0.0.1029', privateKey: '0xcb833706d1df537f59c418a00e36159f67ce3760ce6bf661f11f6da2b11c2c5a', isED25519Type: true },
                { account: '0.0.1030', privateKey: '0x9b6adacefbbecff03e4359098d084a3af8039ce7f29d95ed28c7ebdb83740c83', isED25519Type: true },
                { account: '0.0.1031', privateKey: '0x9a07bbdbb62e24686d2a4259dc88e38438e2c7a1ba167b147ad30ac540b0a3cd', isED25519Type: true },
            ].reverse()
        },
        testnet: {
            ecdsa: [
                { account: '0.0.29562194', privateKey: '0x3b6cd41ded6986add931390d5d3efa0bb2b311a8415cfe66716cac0234de035d', isED25519Type: false }
            ],
            ed25519: [
                {
                    account: "0.0.34100425",
                    alias: "0.0.QsxEYZU82YPvQqrZ8DAfOktZjmbcfjaPwVATlsaJCCM=",
                    privateKey: "06bd0453347618988f1e1c60bd3e57892a4b8603969827d65b1a87d13b463d70",
                    isED25519Type: true
                },
                {
                    account: "0.0.19041642",
                    privateKey: "302e020100300506032b6570042204207ef3437273a5146e4e504a6e22c5caedf07cb0821f01bc05d18e8e716f77f66c",
                    isED25519Type: true
                }
            ]
        }
    };
}
const getProviders = () => {
    return {
        local: [hethers.providers.getDefaultProvider('local')],
        testnet: [hethers.providers.getDefaultProvider('testnet')],
    }
}
const getWallets = () => {
    const accounts = getAccounts();
    const providers = getProviders();
    return {
        local: {
            ecdsa: accounts.local.ecdsa.map((eoa: any) => new hethers.Wallet(eoa, providers.local[0])),
            ed25519: accounts.local.ed25519.map((eoa: any) => new hethers.Wallet(eoa, providers.local[0])),
        },
        testnet: {
            ecdsa: accounts.testnet.ecdsa.map((eoa: any) => new hethers.Wallet(eoa, providers.testnet[0])),
            ed25519: accounts.testnet.ed25519.map((eoa: any) => new hethers.Wallet(eoa, providers.testnet[0]))
        }
    }
}

export {
    randomBytes,
    randomHexString,
    randomNumber,
    equals,
    getAccounts,
    getProviders,
    getWallets
}


// const wallet = new hethers.Wallet({
//     account: '0.0.2',
//     privateKey: '302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137',
//     isED25519Type: true
// } as any);
// const provider = hethers.providers.getDefaultProvider('local');
// const newAccount = hethers.Wallet.createRandom({ isED25519Type: true });
// const newAccountPublicKey = newAccount._signingKey().compressedPublicKey;
// const clientAccountId = (await wallet.createAccount(newAccountPublicKey)).customData.accountId;
// const newWallet = newAccount.connect(provider).connectAccount(clientAccountId.toString());

// const tx1 = await wallet.sendTransaction({
//     to: newWallet.account,
//     value: 1000000000,
// });
// await tx1.wait();


// console.log(newWallet.privateKey, newWallet.account)