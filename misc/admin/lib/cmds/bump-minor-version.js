"use strict";
//import fs from "fs";
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
const semver_1 = __importDefault(require("semver"));
const local = __importStar(require("../local"));
const npm = __importStar(require("../npm"));
const path_1 = require("../path");
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        const pNpm = yield npm.getPackage("ethers");
        const newVersion = semver_1.default.inc(pNpm.version, "minor");
        for (let i = 0; i < path_1.dirnames.length; i++) {
            const dirname = path_1.dirnames[i];
            const pLocal = local.getPackage(dirname);
            const deps = Object.keys(pLocal.dependencies).reduce((accum, name) => {
                let version = pLocal.dependencies[name];
                const prefix = name.split("/")[0];
                if (dirname === "ethers") {
                    if (prefix === "@ethersproject") {
                        if (!version.match(/^[0-9]+\.[0-9]+\.[0-9]+$/)) {
                            throw new Error(`bad version for bumping: ${dirname}:${name}:${version}`);
                        }
                        version = newVersion;
                    }
                }
                else {
                    if (prefix === "ethers" || prefix === "@ethersproject") {
                        if (version.substring(0, 1) !== "^") {
                            throw new Error(`bad version for bumping: ${dirname}:${name}:${version}`);
                        }
                        version = "^" + newVersion;
                    }
                }
                accum[name] = version;
                return accum;
            }, {});
            const packageJsonPath = (0, path_1.getPackageJsonPath)(dirname);
            local.updateJson(packageJsonPath, {
                dependencies: deps,
                version: newVersion
            }, true);
        }
    });
})();
