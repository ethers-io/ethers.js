"use strict";
///////////////////////////////
// Bytes
Object.defineProperty(exports, "__esModule", { value: true });
function setType(object, type) {
    Object.defineProperty(object, '_ethersType', { configurable: false, value: type, writable: false });
}
function isType(object, type) {
    return (object._ethersType === type);
}
///////////////////////////////
// BigNumber
var BigNumber = /** @class */ (function () {
    function BigNumber() {
        setType(this, 'BigNumber');
    }
    BigNumber.isBigNumber = function (value) {
        return isType(value, 'BigNumber');
    };
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
        setType(this, 'Indexed');
    }
    Indexed.isIndexed = function (value) {
        return isType(value, 'Indexed');
    };
    return Indexed;
}());
exports.Indexed = Indexed;
var MinimalProvider = /** @class */ (function () {
    function MinimalProvider() {
        setType(this, 'Provider');
    }
    MinimalProvider.isProvider = function (value) {
        return isType(value, 'Provider');
    };
    return MinimalProvider;
}());
exports.MinimalProvider = MinimalProvider;
var Signer = /** @class */ (function () {
    function Signer() {
        setType(this, 'Signer');
    }
    Signer.isSigner = function (value) {
        return isType(value, 'Signer');
    };
    return Signer;
}());
exports.Signer = Signer;
///////////////////////////////
// HDNode
var HDNode = /** @class */ (function () {
    function HDNode() {
        setType(this, 'HDNode');
    }
    HDNode.isHDNode = function (value) {
        return isType(value, 'HDNode');
    };
    return HDNode;
}());
exports.HDNode = HDNode;
