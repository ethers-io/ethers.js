var defineProperty = require('./properties.js').defineProperty;

function Ethers() { }

function defineEthersValues(values) {

    // This is modified in the Gruntfile.js
    if ("__STAND_ALONE_FALSE__" !== ("__STAND_ALONE_" + "TRUE__")) {
        return;
    }

    if (global.ethers == null) {
        defineProperty(global, 'ethers', new Ethers());
    }

    for (var key in values) {
        if (global.ethers[key] == null) {
            defineProperty(global.ethers, key, values[key]);
        }
    }
}

module.exports = defineEthersValues;
