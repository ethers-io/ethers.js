"use strict";

const fs = require("fs");
const os = require("os");
const resolve = require("path").resolve;

const AES = require("aes-js");
const scrypt = require("scrypt-js");

const { prompt } = require("../packages/cli");
const randomBytes = require("../packages/random").randomBytes;
const computeHmac = require("../packages/sha2").computeHmac;

const colorify = require("./log").colorify;

function getScrypt(message, password, salt) {
    let progressBar = prompt.getProgressBar(message);
    return scrypt.scrypt(Buffer.from(password), Buffer.from(salt), (1 << 17), 8, 1, 64, progressBar);
}

function Config(filename) {
    this.salt = null;
    this.dkey = null;
    this.values = { };
    this.canary = "";
    this.filename = filename;
}

Config.prototype.load = async function() {
    if (this.dkey) { return; }

    let data = null;
    if (fs.existsSync(this.filename)) {
        data = JSON.parse(fs.readFileSync(this.filename));
    } else {
        data = {
            salt: Buffer.from(randomBytes(32)).toString("hex")
        };
    }

    this.canary = data.canary || "";

    this.salt = data.salt;

    const password = await prompt.getPassword(colorify("Password (config-store): ", "bold"));

    this.dkey = await getScrypt(colorify("Unlocking config", "bold"), password, this.salt);

    if (data.ciphertext) {
        const ciphertext = Buffer.from(data.ciphertext, "base64");
        const iv = Buffer.from(data.iv, "base64");
        const aes = new AES.ModeOfOperation.ctr(this.dkey.slice(0, 32), new AES.Counter(iv));
        const plaintext = aes.decrypt(ciphertext);
        const hmac = computeHmac("sha512", this.dkey.slice(32, 64), plaintext);
        if (hmac !== data.hmac) {
            throw new Error("wrong password");
        }

        this.values = JSON.parse(Buffer.from(plaintext).toString());
    }
};

Config.prototype.keys = async function() {
    await this.load();
    return Object.keys(this.values);
}

Config.prototype.save = function() {
    this.values._junk = Buffer.from(randomBytes(16 + parseInt(Math.random() * 48))).toString("base64")

    const plaintext = Buffer.from(JSON.stringify(this.values));

    const iv = Buffer.from(randomBytes(16));
    const hmac = computeHmac("sha512", this.dkey.slice(32, 64), plaintext);

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

Config.prototype.get = async function(key) {
    await this.load();
    return this.values[key];
};

Config.prototype.set = async function(key, value) {
    await this.load();
    this.values[key] = value;
    this.save();
};

Config.prototype.lock = function() {
    this.salt = this.dkey = null;
}

const config = new Config(resolve(os.homedir(), ".ethers-dist"));

module.exports = {
    get: function(key) {
        return config.get(key);
    },
    set: function(key, value) {
        config.set(key, value);
    },
    keys: function() {
        return config.keys();
    },
    lock: function() {
        config.lock();
    }
}
