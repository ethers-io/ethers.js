'use strict';

var Contract = require('./contract.js');
var Interface = require('./interface.js');

module.exports = {
    Constract: Contract,
    Interface: Interface,
}

require('ethers-utils/standalone.js')(module.exports);

