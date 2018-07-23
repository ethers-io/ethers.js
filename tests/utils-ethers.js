var assert = require('assert');

function getEthers(filename) {
    let ethers = require('../index');
    console.log('Loaded local ethers: ' + filename);
    assert.equal(ethers.platform, 'node', 'platform: ' + ethers.platform + ' != "node"');
    return ethers;
}

module.exports = getEthers;
