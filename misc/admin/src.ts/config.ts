import { createHmac, randomBytes } from "crypto";
import fs from "fs";
import os from "os";
import { resolve } from "path";

import AES from "aes-js";
import scrypt from "scrypt-js";

import { colorify, getPassword, getProgressBar } from "./log";

function getRandomBytes(length: number): Uint8Array {
    const result = new Uint8Array(length);
    result.set(randomBytes(length));
    return result;
}

function computeHmac(key: Uint8Array, data: Uint8Array): string {
    return "0x" + createHmac("sha512", key, ).update(data).digest("hex");
}

async function getScrypt(message: string, password: string, salt: Uint8Array): Promise<Uint8Array> {
    const progress = getProgressBar(message);
    return await scrypt.scrypt(Buffer.from(password), Buffer.from(salt), (1 << 17), 8, 1, 64, progress);
}

class Config {
    private salt: Uint8Array;
    private dkey: Uint8Array;
    private values: Record<string, string>;
    private canary: string;
    private filename: string;

    constructor(filename: string) {
        this.salt = null;
        this.dkey = null;
        this.values = { };
        this.canary = "";
        this.filename = filename;
    }

    async load(): Promise<void> {
        if (this.dkey) { return; }

        let data: any = null;
        if (fs.existsSync(this.filename)) {
            data = JSON.parse(fs.readFileSync(this.filename).toString());
        } else {
            data = {
                salt: Buffer.from(getRandomBytes(32)).toString("hex")
            };
        }

        this.canary = data.canary || "";

        this.salt = data.salt;

        const password = await getPassword(colorify.bold("Password (config-store): "));

        this.dkey = await getScrypt(colorify.bold("Unlocking config"), password, this.salt);

        if (data.ciphertext) {
            const ciphertext = Buffer.from(data.ciphertext, "base64");
            const iv = Buffer.from(data.iv, "base64");
            const aes = new AES.ModeOfOperation.ctr(this.dkey.slice(0, 32), new AES.Counter(iv));
            const plaintext = aes.decrypt(ciphertext);
            const hmac = computeHmac(this.dkey.slice(32, 64), plaintext);
            if (hmac !== data.hmac) {
                console.log(colorify.red("Incorrect password."));
                throw new Error("wrong password");
            }

            this.values = JSON.parse(Buffer.from(plaintext).toString());
        }
    }

    async keys(): Promise<Array<string>> {
        await this.load();
        return Object.keys(this.values);
    }

    save(): void {
        this.values._junk = Buffer.from(getRandomBytes(16 + Math.floor(Math.random() * 48))).toString("base64")

        const plaintext = Buffer.from(JSON.stringify(this.values));

        const iv = Buffer.from(getRandomBytes(16));
        const hmac = computeHmac(this.dkey.slice(32, 64), plaintext);

        const aes = new AES.ModeOfOperation.ctr(this.dkey.slice(0, 32), new AES.Counter(iv));
        const ciphertext = Buffer.from(aes.encrypt(plaintext));

        const data = {
            ciphertext: ciphertext.toString("base64"),
            iv: iv.toString("base64"),
            salt: this.salt,
            hmac: hmac,
            canary: this.canary
        };

        fs.writeFileSync(this.filename, JSON.stringify(data, null, 2));
    }

    async get(key: string): Promise<string> {
        await this.load();
        return this.values[key];
    }

    async set(key: string, value: string): Promise<void> {
        await this.load();
        this.values[key] = value;
        this.save();
    }

    lock(): void {
        this.salt = this.dkey = null;
    }
}

const _config = new Config(resolve(os.homedir(), ".ethers-dist"));

export const config = {
    get: function(key: string) {
        return _config.get(key);
    },
    set: function(key: string, value: string) {
        _config.set(key, value);
    },
    keys: function() {
        return _config.keys();
    },
    lock: function() {
        _config.lock();
    }
};
