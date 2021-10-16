"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
const fs_1 = __importDefault(require("fs"));
const semver_1 = __importDefault(require("semver"));
const path_1 = require("../path");
const local = __importStar(require("../local"));
const log_1 = require("../log");
const npm = __importStar(require("../npm"));
const utils_1 = require("../utils");
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        const common = (0, utils_1.loadJson)((0, path_1.resolve)("package.json")).common;
        const progress = (0, log_1.getProgressBar)(log_1.colorify.bold("Bumping package.json versions"));
        const latestVersions = {};
        let updated = false;
        const output = [];
        // For each package, detect diff between tarball and remote
        for (let i = 0; i < path_1.dirnames.length; i++) {
            progress(i / path_1.dirnames.length);
            const dirname = path_1.dirnames[i];
            const packageJsonPath = (0, path_1.getPackageJsonPath)(dirname);
            // Set the common elements to the package.json
            local.updateJson(packageJsonPath, common, true);
            const pLocal = local.getPackage(dirname);
            const pNpm = yield npm.getPackage(dirname);
            const tarballHash = local.computeTarballHash(dirname);
            let version = pNpm.version;
            if (tarballHash !== pNpm.tarballHash) {
                if (semver_1.default.gt(pLocal.version, version)) {
                    // Already have a more recent version locally
                    version = pLocal.version;
                }
                else {
                    // Bump the patch version from NPM
                    version = semver_1.default.inc(version, "patch");
                }
                output.push([
                    "  ",
                    log_1.colorify.blue(pLocal.name),
                    (0, utils_1.repeat)(" ", 47 - pLocal.name.length - pNpm.version.length),
                    pNpm.version,
                    log_1.colorify.bold(" => "),
                    log_1.colorify.green(version)
                ].join(""));
                local.updateJson(packageJsonPath, { gitHead: undefined, tarballHash, version }, true);
                updated = true;
            }
            latestVersions[pLocal.name] = version;
            // Write out the _version.ts
            if (!pLocal._ethers_nobuild) {
                const code = "export const version = " + JSON.stringify(dirname + "/" + version) + ";\n";
                fs_1.default.writeFileSync((0, path_1.resolve)((0, path_1.getPackagePath)(dirname), "src.ts/_version.ts"), code);
            }
        }
        progress(1);
        if (updated) {
            const filename = (0, path_1.resolve)("packages/ethers/package.json");
            const info = (0, utils_1.loadJson)(filename);
            Object.keys(info.dependencies).forEach((name) => {
                const version = latestVersions[name];
                if (name == null) {
                    return;
                }
                info.dependencies[name] = version;
            });
            (0, utils_1.saveJson)(filename, info);
        }
        output.forEach((line) => { console.log(line); });
    });
})().then((result) => {
    // Something above causes this script to hang, so let's exit manually
    setTimeout(() => {
        process.exit(0);
    }, 1000);
}, (error) => {
    console.log(`Error running ${process.argv[0]}: ${error.message}`);
    process.exit(1);
});
