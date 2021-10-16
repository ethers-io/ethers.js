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
const log_1 = require("../log");
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        const dependencies = (0, local_1.getDependencies)(null, (name) => {
            return !(0, path_1.isEthers)(name);
        });
        console.log(log_1.colorify.bold(`Hoisting ${Object.keys(dependencies).length} dependencies into root package...`));
        (0, local_1.updateJson)(path_1.dirs.rootPackageJsonPath, { dependencies });
    });
})().catch((error) => {
    console.log(`Error running ${process.argv[0]}: ${error.message}`);
    process.exit(1);
});
