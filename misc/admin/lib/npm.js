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
exports.publish = exports.getPackage = void 0;
const libnpmpublish_1 = require("libnpmpublish");
const semver_1 = __importDefault(require("semver"));
const geturl_1 = require("./geturl");
const local_1 = require("./local");
const log_1 = require("./log");
const cache = {};
function getPackageInfo(name) {
    return __awaiter(this, void 0, void 0, function* () {
        // Convert dirname to package if needed
        name = local_1.getPackage(name).name;
        if (!cache[name]) {
            try {
                const result = yield geturl_1.getUrl("http:/" + "/registry.npmjs.org/" + name);
                cache[name] = JSON.parse(Buffer.from(result.body).toString("utf8"));
            }
            catch (error) {
                if (error.status === 404) {
                    return null;
                }
                throw error;
            }
        }
        return cache[name] || null;
    });
}
function getPackage(name, version) {
    return __awaiter(this, void 0, void 0, function* () {
        const infos = yield getPackageInfo(name);
        if (infos == null) {
            return null;
        }
        if (version == null) {
            const versions = Object.keys(infos.versions);
            versions.sort(semver_1.default.compare);
            version = versions.pop();
        }
        const info = infos.versions[version];
        return {
            dependencies: (info.dependencies || {}),
            devDependencies: (info.devDependencies || {}),
            gitHead: info.gitHead,
            location: "remote",
            name: info.name,
            tarballHash: info.tarballHash,
            version: info.version,
            _ethers_nobuild: !!info._ethers_nobuild,
        };
    });
}
exports.getPackage = getPackage;
function publish(path, manifest, options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield libnpmpublish_1.publish(path, manifest, options);
        }
        catch (error) {
            // We need an OTP
            if (error.code === "EOTP") {
                const otp = yield log_1.getPrompt(log_1.colorify.bold("Enter OTP: "));
                options.otp = otp.replace(" ", "");
                // Retry with the new OTP
                return yield publish(path, manifest, options);
            }
            throw error;
        }
    });
}
exports.publish = publish;
