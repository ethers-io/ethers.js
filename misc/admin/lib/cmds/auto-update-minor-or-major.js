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
const github_1 = require("../github");
const bump_version_type_1 = require("./bump-version-type");
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        let latestRelease = yield (0, github_1.getLatestRelease)('auto');
        if (latestRelease && latestRelease.prerelease) {
            let name = latestRelease.name.toLowerCase();
            if (name.includes('minor')) {
                yield (0, bump_version_type_1.bumpVersions)('minor');
            }
            else if (name.includes('major')) {
                yield (0, bump_version_type_1.bumpVersions)('major');
            }
        }
    });
})();
