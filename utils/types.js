"use strict";
///////////////////////////////
// Bytes
Object.defineProperty(exports, "__esModule", { value: true });
///////////////////////////////
// BigNumber
var BigNumber = /** @class */ (function () {
    function BigNumber() {
    }
    return BigNumber;
}());
exports.BigNumber = BigNumber;
;
;
;
///////////////////////////////
// Interface
var Indexed = /** @class */ (function () {
    function Indexed() {
    }
    return Indexed;
}());
exports.Indexed = Indexed;
/**
 *  Provider
 *
 *  Note: We use an abstract class so we can use instanceof to determine if an
 *        object is a Provider.
 */
var MinimalProvider = /** @class */ (function () {
    function MinimalProvider() {
    }
    return MinimalProvider;
}());
exports.MinimalProvider = MinimalProvider;
/**
 *  Signer
 *
 *  Note: We use an abstract class so we can use instanceof to determine if an
 *        object is a Signer.
 */
var Signer = /** @class */ (function () {
    function Signer() {
    }
    return Signer;
}());
exports.Signer = Signer;
///////////////////////////////
// HDNode
var HDNode = /** @class */ (function () {
    function HDNode() {
    }
    return HDNode;
}());
exports.HDNode = HDNode;
