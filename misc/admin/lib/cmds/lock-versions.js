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
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("../path");
const local_1 = require("../local");
const utils_1 = require("../utils");
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        const versions = path_1.dirnames.reduce((accum, dirname) => {
            const pkg = (0, local_1.getPackage)(dirname);
            accum[pkg.name] = pkg.version;
            return accum;
        }, ({}));
        path_1.dirnames.forEach((dirname) => {
            // Skip ethers; it's versions are locked during update-versions
            if (dirname === "ethers") {
                return;
            }
            console.log(dirname);
            const path = (0, path_1.resolve)("packages", dirname, "package.json");
            const json = (0, utils_1.loadJson)(path);
            for (const name in (json.dependencies || {})) {
                const version = json.dependencies[name];
                const target = (versions[name] ? ("^" + versions[name]) : version);
                if (version !== target) {
                    console.log("  ", name, version, "=>", target);
                }
                json.dependencies[name] = target;
            }
            (0, utils_1.saveJson)(path, json, true);
        });
    });
})();
