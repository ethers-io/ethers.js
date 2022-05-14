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
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const local_1 = require("../local");
const log_1 = require("../log");
const path_2 = require("../path");
const utils_1 = require("../utils");
function link(existing, path) {
    try {
        const current = fs_1.default.readlinkSync(path);
        // Alerady linked
        if (current === existing) {
            return;
        }
        fs_1.default.unlinkSync(path);
    }
    catch (error) {
        if (error.code !== "ENOENT") {
            throw error;
        }
    }
    // Link
    const dir = (0, path_1.dirname)(path);
    (0, utils_1.mkdir)(dir);
    fs_1.default.symlinkSync(existing, path, "junction");
}
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(log_1.colorify.bold(`Linking ${path_2.packages.length} package node_modules rat nests...`));
        const nodeModulesBase = (0, path_1.resolve)(path_2.dirs.root, ".package_node_modules");
        // Make a symlink in the ROOT/node_modules to each package in this repo
        path_2.packages.forEach((name) => {
            // e.g. /node_modules/@ethersproject/abi => /packages/abi
            link((0, path_2.getPackagePath)(name), (0, path_1.resolve)(path_2.dirs.root, "node_modules", name));
            // e.g. /packages/abi/node_modules => /.package_node_modules/abi/
            const nodeModules = (0, path_1.resolve)(nodeModulesBase, (0, path_2.getDirname)(name));
            (0, utils_1.mkdir)(nodeModules);
            link(nodeModules, (0, path_1.resolve)((0, path_2.getPackagePath)(name), "node_modules"));
        });
        path_2.packages.forEach((name) => {
            const nodeModules = (0, path_1.resolve)(nodeModulesBase, (0, path_2.getDirname)(name));
            const deps = (0, local_1.getDependencies)(name);
            Object.keys(deps).forEach((name) => {
                link((0, path_1.resolve)(path_2.dirs.root, "node_modules", name), (0, path_1.resolve)(nodeModules, name));
            });
        });
    });
})().catch((error) => {
    console.log(`Error running ${process.argv[0]}: ${error.message}`);
    process.exit(1);
});
;
