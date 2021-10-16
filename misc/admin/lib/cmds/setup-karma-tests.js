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
const path_1 = require("../path");
const utils_1 = require("../utils");
function copy(src, dst, transform) {
    let data = fs_1.default.readFileSync((0, path_1.resolve)(src));
    if (transform) {
        data = Buffer.from(transform(data.toString()));
    }
    fs_1.default.writeFileSync(dst, data);
}
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, utils_1.mkdir)((0, path_1.resolve)("output/karma"));
        copy((0, path_1.resolve)("packages/ethers/dist/ethers.esm.js"), (0, path_1.resolve)("output/karma/ethers.esm.js"));
        copy((0, path_1.resolve)("packages/tests/dist/tests.esm.js"), (0, path_1.resolve)("output/karma/tests.esm.js"), (data) => {
            return data.replace(/^(import [^;]* from ')(ethers)(';)/, (all, prefix, id, suffix) => {
                return prefix + "./ethers.esm.js" + suffix;
            });
        });
        copy((0, path_1.resolve)("packages/ethers/dist/ethers.umd.js"), (0, path_1.resolve)("output/karma/ethers.umd.js"));
        copy((0, path_1.resolve)("packages/tests/dist/tests.umd.js"), (0, path_1.resolve)("output/karma/tests.umd.js"));
    });
})();
