"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ED = exports.EC = void 0;
var elliptic_1 = __importDefault(require("elliptic"));
var EC = elliptic_1.default.ec;
exports.EC = EC;
var ED = elliptic_1.default.eddsa;
exports.ED = ED;
//# sourceMappingURL=elliptic.js.map