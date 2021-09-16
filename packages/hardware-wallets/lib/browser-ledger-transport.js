"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transports = void 0;
var hw_transport_webusb_1 = __importDefault(require("@ledgerhq/hw-transport-webusb"));
exports.transports = {
    "webusb": hw_transport_webusb_1.default,
    "default": hw_transport_webusb_1.default
};
//# sourceMappingURL=browser-ledger-transport.js.map