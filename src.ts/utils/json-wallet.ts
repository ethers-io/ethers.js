
import { getAddress } from './address';

export function isCrowdsaleWallet(json: string): boolean {
    try {
        var data = JSON.parse(json);
    } catch (error) { return false; }

    return (data.encseed && data.ethaddr);
}

export function isSecretStorageWallet(json: string): boolean {
    try {
        var data = JSON.parse(json);
    } catch (error) { return false; }

    if (!data.version || parseInt(data.version) !== data.version || parseInt(data.version) !== 3) {
        return false;
    }

    // @TODO: Put more checks to make sure it has kdf, iv and all that good stuff
    return true;
}

//export function isJsonWallet(json: string): boolean {
//    return (isSecretStorageWallet(json) || isCrowdsaleWallet(json));
//}

export function getJsonWalletAddress(json: string): string {
    if (isCrowdsaleWallet(json)) {
        try {
            return getAddress(JSON.parse(json).ethaddr);
        } catch (error) { return null; }
    }

    if (isSecretStorageWallet(json)) {
        try {
            return getAddress(JSON.parse(json).address);
        } catch (error) { return null; }
    }

    return null;
}

