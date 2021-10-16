"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const crypto_1 = require("crypto");
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = require("path");
const aes_js_1 = __importDefault(require("aes-js"));
const scrypt_js_1 = __importDefault(require("scrypt-js"));
const log_1 = require("./log");
function getRandomBytes(length) {
    const result = new Uint8Array(length);
    result.set((0, crypto_1.randomBytes)(length));
    return result;
}
function computeHmac(key, data) {
    return "0x" + (0, crypto_1.createHmac)("sha512", key).update(data).digest("hex");
}
function getScrypt(message, password, salt) {
    return __awaiter(this, void 0, void 0, function* () {
        const progress = (0, log_1.getProgressBar)(message);
        return yield scrypt_js_1.default.scrypt(Buffer.from(password), Buffer.from(salt), (1 << 17), 8, 1, 64, progress);
    });
}
class Config {
    constructor(filename) {
        this.salt = null;
        this.dkey = null;
        this.values = {};
        this.canary = "";
        this.filename = filename;
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.dkey) {
                return;
            }
            let data = null;
            if (fs_1.default.existsSync(this.filename)) {
                data = JSON.parse(fs_1.default.readFileSync(this.filename).toString());
            }
            else {
                data = {
                    salt: Buffer.from(getRandomBytes(32)).toString("hex")
                };
            }
            this.canary = data.canary || "";
            this.salt = data.salt;
            const password = yield (0, log_1.getPassword)(log_1.colorify.bold("Password (config-store): "));
            this.dkey = yield getScrypt(log_1.colorify.bold("Unlocking config"), password, this.salt);
            if (data.ciphertext) {
                const ciphertext = Buffer.from(data.ciphertext, "base64");
                const iv = Buffer.from(data.iv, "base64");
                const aes = new aes_js_1.default.ModeOfOperation.ctr(this.dkey.slice(0, 32), new aes_js_1.default.Counter(iv));
                const plaintext = aes.decrypt(ciphertext);
                const hmac = computeHmac(this.dkey.slice(32, 64), plaintext);
                if (hmac !== data.hmac) {
                    console.log(log_1.colorify.red("Incorrect password."));
                    throw new Error("wrong password");
                }
                this.values = JSON.parse(Buffer.from(plaintext).toString());
            }
        });
    }
    keys() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.load();
            return Object.keys(this.values);
        });
    }
    save() {
        this.values._junk = Buffer.from(getRandomBytes(16 + Math.floor(Math.random() * 48))).toString("base64");
        const plaintext = Buffer.from(JSON.stringify(this.values));
        const iv = Buffer.from(getRandomBytes(16));
        const hmac = computeHmac(this.dkey.slice(32, 64), plaintext);
        const aes = new aes_js_1.default.ModeOfOperation.ctr(this.dkey.slice(0, 32), new aes_js_1.default.Counter(iv));
        const ciphertext = Buffer.from(aes.encrypt(plaintext));
        const data = {
            ciphertext: ciphertext.toString("base64"),
            iv: iv.toString("base64"),
            salt: this.salt,
            hmac: hmac,
            canary: this.canary
        };
        fs_1.default.writeFileSync(this.filename, JSON.stringify(data, null, 2));
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.load();
            return this.values[key];
        });
    }
    set(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.load();
            this.values[key] = value;
            this.save();
        });
    }
    lock() {
        this.salt = this.dkey = null;
    }
}
const _config = new Config((0, path_1.resolve)(os_1.default.homedir(), ".ethers-dist"));
exports.config = {
    get: function (key) {
        return _config.get(key);
    },
    set: function (key, value) {
        _config.set(key, value);
    },
    keys: function () {
        return _config.keys();
    },
    lock: function () {
        _config.lock();
    }
};
