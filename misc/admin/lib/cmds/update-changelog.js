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
const changelog_1 = require("../changelog");
const log_1 = require("../log");
const path_1 = require("../path");
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(log_1.colorify.bold("Updating CHANGELOG.md..."));
        fs_1.default.writeFileSync((0, path_1.resolve)("CHANGELOG.md"), yield (0, changelog_1.generate)());
    });
})();
