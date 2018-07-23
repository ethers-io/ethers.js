var assert = require('assert');

function getEthers(filename) {
    var ethers = global.ethers
    if (!ethers) { return undefined; }
    console.log('Using global ethers; ' + filename);
    assert.equal(ethers.platform, 'browser', 'platform: ' + ethers.platform + ' != "browser"');
    return ethers;
}

module.exports = getEthers;
