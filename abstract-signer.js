"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var properties_1 = require("./utils/properties");
var Signer = /** @class */ (function () {
    function Signer() {
        properties_1.setType(this, 'Signer');
    }
    Signer.isSigner = function (value) {
        return properties_1.isType(value, 'Signer');
    };
    return Signer;
}());
exports.Signer = Signer;
//defineReadOnly(Signer, 'inherits', inheritable(Signer));
