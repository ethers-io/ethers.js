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

function getConfigFilename() {
    return resolve(os.homedir(), ".ethers-dist");
}

function getScrypt(message, password, salt) {
    let progressBar = prompt.getProgressBar(message);
    return new Promise((resolve, reject) => {
        scrypt(Buffer.from(password), Buffer.from(salt), (1 << 17), 8, 1, 64, (error, progress, key) => {
            if (error) { return reject(error); }
            progressBar(progress);
            if (key) { resolve(key); }
        });
    });
}

async function loadConfig(dkey) {
    let config = { };

    let filename = getConfigFilename();
    if (fs.existsSync(filename)) {
        let data = JSON.parse(fs.readFileSync(filename));
        let ciphertext = Buffer.from(data.ciphertext, "base64");
        let iv = Buffer.from(data.iv, "base64");
        let aes = new AES.ModeOfOperation.ctr(dkey.slice(0, 32), new AES.Counter(iv));
        let plaintext = aes.decrypt(ciphertext);
        let hmac = computeHmac("sha512", dkey.slice(32, 64), plaintext);
        if (hmac !== data.hmac) {
            throw new Error("wrong password");
        }
        config = JSON.parse(Buffer.from(plaintext).toString());
    }

    return config;
}

async function getConfig(key) {
    let password = await prompt.getPassword(colorify("Password (seesion-store): ", "bold"));
    let dkey = await getScrypt(colorify("Decrypting", "bold"), password, key);

    let config = await loadConfig(dkey);
    return config[key];
}

async function setConfig(key, value) {
    let password = await prompt.getPassword(colorify("Password (seesion-store): ", "bold"));
    let dkey = await getScrypt("Encrypting", password, key);

    let config = await loadConfig(dkey);
    config[key] = value;
    config._junk = Buffer.from(randomBytes(16 + parseInt(Math.random() * 48))).toString("base64")

    let plaintext = Buffer.from(JSON.stringify(config));

    let iv = Buffer.from(randomBytes(16));
    let hmac = computeHmac("sha512", dkey.slice(32, 64), plaintext);

    let aes = new AES.ModeOfOperation.ctr(dkey.slice(0, 32), new AES.Counter(iv));
    let ciphertext = Buffer.from(aes.encrypt(plaintext));

    let data = {
        ciphertext: ciphertext.toString("base64"),
        iv: iv.toString("base64"),
        hmac: hmac
    };

    fs.writeFileSync(getConfigFilename(), JSON.stringify(data, null, 2));
}

module.exports = {
    get: getConfig,
    set: setConfig
}
