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
const path_2 = require("../path");
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
    const dir = path_1.dirname(path);
    fs_1.default.mkdirSync(dir, { recursive: true });
    fs_1.default.symlinkSync(existing, path);
}
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        const nodeModulesBase = path_1.resolve(path_2.dirs.root, ".package_node_modules");
        // Make a symlink in the ROOT/node_mpdules to each package in this repo
        path_2.packages.forEach((name) => {
            // e.g. /node_modules/@ethersproject/abi => /packages/abi
            link(path_2.getPackagePath(name), path_1.resolve(path_2.dirs.root, "node_modules", name));
            // e.g. /packages/abi/node_modules => /.package_node_modules/abi/
            const nodeModules = path_1.resolve(nodeModulesBase, path_2.getDirname(name));
            fs_1.default.mkdirSync(nodeModules, { recursive: true });
            link(nodeModules, path_1.resolve(path_2.getPackagePath(name), "node_modules"));
        });
        path_2.packages.forEach((name) => {
            const nodeModules = path_1.resolve(nodeModulesBase, path_2.getDirname(name));
            const deps = path_2.getDependencies(name);
            Object.keys(deps).forEach((name) => {
                link(path_1.resolve(path_2.dirs.root, "node_modules", name), path_1.resolve(nodeModules, name));
            });
        });
    });
})();
