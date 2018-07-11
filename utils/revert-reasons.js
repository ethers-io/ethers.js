var AbiCoder = require('./abi-coder.js').defaultCoder;

var utils = (function() {
    var convert = require('./convert.js');

    return {
        arrayify: convert.arrayify,
        hexlify: convert.hexlify,
    };
})();

function getRevertReasonFromData(data){
    data = utils.arrayify(data);

    if (data && utils.hexlify(data.slice(0, 4)) === '0x08c379a0') {
        var result = AbiCoder.coderTuple(AbiCoder.coerceFunc, [
            AbiCoder.getParamCoder(AbiCoder.coerceFunc, 'string', undefined),
        ]).decode(data.slice(4), 0);
        
        return result.value[0];
    }
}

module.exports = getRevertReasonFromData;