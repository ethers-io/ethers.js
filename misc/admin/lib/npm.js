"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.publishAll = exports.getPublishOptions = exports._publish = exports.getPackage = void 0;
const libnpmpublish_1 = require("libnpmpublish");
const semver_1 = __importDefault(require("semver"));
const geturl_1 = require("./geturl");
const local = __importStar(require("./local"));
const log_1 = require("./log");
const depgraph_1 = require("./depgraph");
const path_1 = require("./path");
const git_1 = require("./git");
const utils_1 = require("./utils");
const config_1 = require("./config");
const cache = {};
function getPackageInfo(name) {
    return __awaiter(this, void 0, void 0, function* () {
        // Convert dirname to package if needed
        name = local.getPackage(name).name;
        if (!cache[name]) {
            try {
                const result = yield (0, geturl_1.getUrl)("https:/\/registry.npmjs.org/" + name);
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
        if (infos == null || infos.error) {
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
function _publish(path, manifest, options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, libnpmpublish_1.publish)(path, manifest, options);
        }
        catch (error) {
            // We need an OTP
            if (error.code === "EOTP") {
                const otp = yield (0, log_1.getPrompt)(log_1.colorify.bold("Enter OTP: "));
                options.otp = otp.replace(" ", "");
                // Retry with the new OTP
                return yield _publish(path, manifest, options);
            }
            throw error;
        }
    });
}
exports._publish = _publish;
function getPublishOptions() {
    return __awaiter(this, void 0, void 0, function* () {
        const dirnames = (0, depgraph_1.getOrdered)();
        // @TODO: Fail if there are any untracked files or unchecked in files
        const publishPackages = {};
        const progressUpdate = (0, log_1.getProgressBar)(log_1.colorify.bold("Finding updated packages..."));
        for (let i = 0; i < dirnames.length; i++) {
            progressUpdate(i / dirnames.length);
            let dirname = dirnames[i];
            let info = local.getPackage(dirname);
            let npmInfo;
            try {
                npmInfo = yield getPackage(dirname);
                // No change in version, no need to publish
                if (npmInfo && info.version === npmInfo.version) {
                    // continue;
                }
                if (dirname === "testcases" || dirname === "tests") {
                    continue;
                }
            }
            catch (err) {
                console.error(err);
            }
            // Get the latest commit this package was modified at
            const path = (0, path_1.resolve)("packages", dirname);
            const gitHead = yield (0, git_1.getGitTag)(path);
            if (gitHead == null) {
                throw new Error("hmmm...");
            }
            publishPackages[dirname] = {
                name: info.name,
                gitHead: gitHead,
                oldVersion: (npmInfo && npmInfo.version ? npmInfo.version : "NEW"),
                newVersion: info.version
            };
        }
        progressUpdate(1);
        console.log(log_1.colorify.bold(`Found ${Object.keys(publishPackages).length} updated pacakges...`));
        Object.keys(publishPackages).forEach((dirname) => {
            const info = publishPackages[dirname];
            console.log(`  ${log_1.colorify.blue(info.name)} ${(0, utils_1.repeat)(" ", 50 - info.name.length - info.oldVersion.length)} ${info.oldVersion} ${log_1.colorify.bold("=>")} ${log_1.colorify.green(info.newVersion)}`);
        });
        const publishNames = Object.keys(publishPackages);
        publishNames.sort((a, b) => (dirnames.indexOf(a) - dirnames.indexOf(b)));
        return { publishNames, publishPackages };
    });
}
exports.getPublishOptions = getPublishOptions;
const USER_AGENT = "hethers-dist@0.0.1";
const TAG = "latest";
function publishAll(mode = 'manual') {
    return __awaiter(this, void 0, void 0, function* () {
        const { publishNames, publishPackages } = yield getPublishOptions();
        // Load the token from the encrypted store
        const options = {
            access: "public",
            npmVersion: USER_AGENT,
            tag: TAG
        };
        if (mode === 'manual') {
            try {
                const token = (yield config_1.config.get("npm-token")).trim().split("=");
                options[token[0]] = token[1];
            }
            catch (error) {
                switch (error.message) {
                    case "wrong password":
                        console.log(log_1.colorify.bold("Wrong password"));
                        break;
                    case "cancelled":
                        break;
                    default:
                        console.log(error);
                }
                console.log(log_1.colorify.red("Aborting."));
                return;
            }
        }
        else {
            options['token'] = process.env['NPM_TOKEN'];
        }
        console.log(log_1.colorify.bold("Publishing:"));
        for (let i = 0; i < publishNames.length; i++) {
            const dirname = publishNames[i];
            const path = (0, path_1.resolve)("packages", dirname);
            const pathJson = (0, path_1.resolve)("packages", dirname, "package.json");
            const { gitHead, name, newVersion } = publishPackages[dirname];
            console.log(`  ${log_1.colorify.blue(name)} @ ${log_1.colorify.green(newVersion)}`);
            local.updateJson(pathJson, { gitHead: gitHead }, true);
            const info = (0, utils_1.loadJson)(pathJson);
            yield _publish(path, info, options);
            local.updateJson(pathJson, { gitHead: undefined }, true);
        }
    });
}
exports.publishAll = publishAll;
