
var fs = require('fs');
var path = require('path');

var utils = require('ethers-utils');

function randomBytes(seed, lower, upper) {
    if (!upper) { upper = lower; }

    if (upper === 0 && upper === lower) { return new Uint8Array(0); }

    seed = utils.toUtf8Bytes(seed);

    var result = utils.arrayify(utils.keccak256(seed));
    while (result.length < upper) {
        result = utils.concat([result, utils.keccak256(utils.concat([seed, result]))]);
    }

    var top = utils.arrayify(utils.keccak256(result));
    var percent = ((top[0] << 16) | (top[1] << 8) | top[2]) / 0x00ffffff;

    return result.slice(0, lower + parseInt((upper - lower) * percent));
}

function randomHexString(seed, lower, upper) {
    return utils.hexlify(randomBytes(seed, lower, upper));
}

function randomNumber(seed, lower, upper) {
    var top = randomBytes(seed, 3);
    var percent = ((top[0] << 16) | (top[1] << 8) | top[2]) / 0x00ffffff;
    return lower + parseInt((upper - lower) * percent);
}

function saveTestcase(testcaseName, json) {
    var data = JSON.stringify(json, undefined, ' ');
    var filename = path.join(__dirname, '../tests/', testcaseName + '.json');
    fs.writeFileSync(filename, data);

    console.log('Save testcase: ' + filename);
}

module.exports = {
    randomBytes: randomBytes,
    randomHexString: randomHexString,
    randomNumber: randomNumber,

    arrayify: utils.arrayify,
    hexlify: utils.hexlify,

    saveTestcase: saveTestcase,
};
