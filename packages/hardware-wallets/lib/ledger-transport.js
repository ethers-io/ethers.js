"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var hw_transport_node_hid_1 = __importDefault(require("@ledgerhq/hw-transport-node-hid"));
exports.transports = {
    "hid": hw_transport_node_hid_1.default,
    "default": hw_transport_node_hid_1.default
};
