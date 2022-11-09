import { CBC, pkcs7Strip } from "aes-js";
import { getAddress } from "../address/index.js";
import { pbkdf2 } from "../crypto/index.js";
import { id } from "../hash/index.js";
import { getBytes, assertArgument } from "../utils/index.js";
import { getPassword, looseArrayify, spelunk } from "./utils.js";
export function isCrowdsaleJson(json) {
    try {
        const data = JSON.parse(json);
        if (data.encseed) {
            return true;
        }
    }
    catch (error) { }
    return false;
}
// See: https://github.com/ethereum/pyethsaletool
export function decryptCrowdsaleJson(json, _password) {
    const data = JSON.parse(json);
    const password = getPassword(_password);
    // Ethereum Address
    const address = getAddress(spelunk(data, "ethaddr:string!"));
    // Encrypted Seed
    const encseed = looseArrayify(spelunk(data, "encseed:string!"));
    assertArgument(encseed && (encseed.length % 16) === 0, "invalid encseed", "json", json);
    const key = getBytes(pbkdf2(password, password, 2000, 32, "sha256")).slice(0, 16);
    const iv = encseed.slice(0, 16);
    const encryptedSeed = encseed.slice(16);
    // Decrypt the seed
    const aesCbc = new CBC(key, iv);
    const seed = pkcs7Strip(getBytes(aesCbc.decrypt(encryptedSeed)));
    // This wallet format is weird... Convert the binary encoded hex to a string.
    let seedHex = "";
    for (let i = 0; i < seed.length; i++) {
        seedHex += String.fromCharCode(seed[i]);
    }
    return { address, privateKey: id(seedHex) };
}
//# sourceMappingURL=json-crowdsale.js.map