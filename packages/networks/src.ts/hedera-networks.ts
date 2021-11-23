import {AccountID} from "../../proto";

function propsWithAccountNum(num:number) : {shardNum:number, realmNum:number, accountNum:number} {
    return {
        shardNum: 0,
        realmNum: 0,
        accountNum: num
    }
}

export class Network {
    /**
     * @param {string} name
     * @returns {{[key: string]: (string | AccountID)}}
     */
    fromName(name: string) {
        switch (name) {
            case "mainnet":
                return Network.MAINNET;

            case "testnet":
                return Network.TESTNET;

            case "previewnet":
                return Network.PREVIEWNET;

            default:
                throw new Error(`unknown network name: ${name}`);
        }
    }

    private static readonly MAINNET = {
        "35.237.200.180:50211": new AccountID(propsWithAccountNum(3)),
        "35.186.191.247:50211": new AccountID(propsWithAccountNum(4)),
        "35.192.2.25:50211":    new AccountID(propsWithAccountNum(5)),
        "35.199.161.108:50211": new AccountID(propsWithAccountNum(6)),
        "35.203.82.240:50211":  new AccountID(propsWithAccountNum(7)),
        "35.236.5.219:50211":   new AccountID(propsWithAccountNum(8)),
        "35.197.192.225:50211": new AccountID(propsWithAccountNum(9)),
        "35.242.233.154:50211": new AccountID(propsWithAccountNum(10)),
        "35.240.118.96:50211":  new AccountID(propsWithAccountNum(11)),
        "35.204.86.32:50211":   new AccountID(propsWithAccountNum(12)),
        "35.234.132.107:50211": new AccountID(propsWithAccountNum(13)),
        "35.236.2.27:50211":    new AccountID(propsWithAccountNum(14)),
        "35.228.11.53:50211":   new AccountID(propsWithAccountNum(15)),
        "34.91.181.183:50211":  new AccountID(propsWithAccountNum(16)),
        "34.86.212.247:50211":  new AccountID(propsWithAccountNum(17)),
        "172.105.247.67:50211": new AccountID(propsWithAccountNum(18)),
        "34.89.87.138:50211":   new AccountID(propsWithAccountNum(19)),
        "34.82.78.255:50211":   new AccountID(propsWithAccountNum(20)),
    }

    private static readonly TESTNET = {
        "0.testnet.hedera.com:50211": new AccountID(propsWithAccountNum(3)),
        "1.testnet.hedera.com:50211": new AccountID(propsWithAccountNum(4)),
        "2.testnet.hedera.com:50211": new AccountID(propsWithAccountNum(5)),
        "3.testnet.hedera.com:50211": new AccountID(propsWithAccountNum(6)),
        "4.testnet.hedera.com:50211": new AccountID(propsWithAccountNum(7)),
    }

    private static readonly PREVIEWNET = {
        "0.previewnet.hedera.com:50211": new AccountID(propsWithAccountNum(3)),
        "1.previewnet.hedera.com:50211": new AccountID(propsWithAccountNum(4)),
        "2.previewnet.hedera.com:50211": new AccountID(propsWithAccountNum(5)),
        "3.previewnet.hedera.com:50211": new AccountID(propsWithAccountNum(6)),
        "4.previewnet.hedera.com:50211": new AccountID(propsWithAccountNum(7)),
    }
}

export class MirrorNetwork {
    /**
     * @param {string} name
     * @returns {string[]}
     */
    fromName(name: string) {
        switch (name) {
            case "mainnet":
                return MirrorNetwork.MAINNET;

            case "testnet":
                return MirrorNetwork.TESTNET;

            case "previewnet":
                return MirrorNetwork.PREVIEWNET;

            default:
                throw new Error(`unknown network name: ${name}`);
        }
    }

    private static readonly MAINNET: string[] = [
        "hcs.mainnet.mirrornode.hedera.com:5600"
    ];

    private static readonly TESTNET: string[] = [
        "hcs.testnet.mirrornode.hedera.com:5600"
    ];

    private static readonly PREVIEWNET: string[] = [
        "hcs.previewnet.mirrornode.hedera.com:5600"
    ];

}
