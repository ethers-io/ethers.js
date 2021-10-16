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
const local_1 = require("../local");
const log_1 = require("../log");
const path_1 = require("../path");
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        const progress = (0, log_1.getProgressBar)(log_1.colorify.bold("Updating package.json hashes"));
        // Updating all tarball hashes now that versions have been updated
        for (let i = 0; i < path_1.dirnames.length; i++) {
            progress(i / path_1.dirnames.length);
            const dirname = path_1.dirnames[i];
            //const gitHead = await getGitTag(resolve("packages", dirname));
            const tarballHash = (0, local_1.computeTarballHash)(dirname);
            (0, local_1.updateJson)((0, path_1.getPackageJsonPath)(dirname), { tarballHash }, true);
        }
        progress(1);
    });
})().catch((error) => {
    console.log(error);
    process.exit(1);
});
;
