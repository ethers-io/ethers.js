var elliptic = require('elliptic');

var utils = require('./utils.js');

var secp256k1 = new (elliptic.ec)('secp256k1');


function getChecksumAddress(address) {
    if (typeof(address) !== 'string' || !address.match(/^0x[0-9A-Fa-f]{40}$/)) {
        throw new Error('invalid address');
    }

    address = address.substring(2).toLowerCase();
    var hashed = utils.sha3(address);

    address = address.split('');
    for (var i = 0; i < 40; i += 2) {
        if ((hashed[i >> 1] >> 4) >= 8) {
            address[i] = address[i].toUpperCase();
        }
        if ((hashed[i >> 1] & 0x0f) >= 8) {
            address[i + 1] = address[i + 1].toUpperCase();
        }
    }

    return '0x' + address.join('');
}

function getAddress(address) {
    var result = null;

    if (typeof(address) !== 'string') { throw new Error('invalid address'); }

    if (address.match(/^(0x)?[0-9a-fA-F]{40}$/)) {

        // Missing the 0x prefix
        if (address.substring(0, 2) !== '0x') { address = '0x' + address; }

        result = getChecksumAddress(address);

        // It is a checksummed address with a bad checksum
        if (address.match(/([A-F].*[a-f])|([a-f].*[A-F])/) && result !== address) {
            throw new Error('invalid address checksum');
        }

    // Maybe ICAP? (we only support direct mode)
    } else if (address.match(/^XE[0-9]{2}[0-9A-Za-z]{30,31}$/)) {

        // It is an ICAP address with a bad checksum
        if (address.substring(2, 4) !== ibanChecksum(address)) {
            throw new Error('invalid address icap checksum');
        }

        result = (new utils.BN(address.substring(4), 36)).toString(16);
        while (result.length < 40) { result = '0' + result; }
        result = getChecksumAddress('0x' + result);

    } else {
        throw new Error('invalid address');
    }

    return result;
}

// See: https://en.wikipedia.org/wiki/International_Bank_Account_Number
var ibanChecksum = (function() {

    // Create lookup table
    var ibanLookup = {};
    for (var i = 0; i < 10; i++) { ibanLookup[String(i)] = String(i); }
    for (var i = 0; i < 26; i++) { ibanLookup[String.fromCharCode(65 + i)] = String(10 + i); }

    // How many decimal digits can we process? (for 64-bit float, this is 15)
    var safeDigits = Math.floor(Math.log10(Number.MAX_SAFE_INTEGER));

    return function(address) {
        address = address.toUpperCase();
        address = address.substring(4) + address.substring(0, 2) + '00';

        var expanded = address.split('');
        for (var i = 0; i < expanded.length; i++) {
            expanded[i] = ibanLookup[expanded[i]];
        }
        expanded = expanded.join('');

        // Javascript can handle integers safely up to 15 (decimal) digits
        while (expanded.length >= safeDigits){
            var block = expanded.substring(0, safeDigits);
            expanded = parseInt(block, 10) % 97 + expanded.substring(block.length);
        }

        checksum = String(98 - (parseInt(expanded, 10) % 97));
        while (checksum.length < 2) { checksum = '0' + checksum; }

        return checksum;
    };
})();


function SigningKey(privateKey) {
    if (!(this instanceof SigningKey)) { throw new Error('missing new'); }

    if (utils.isHexString(privateKey, 32)) {
        privateKey = utils.hexOrBuffer(privateKey);
    } else if (!Buffer.isBuffer(privateKey) || privateKey.length !== 32) {
        throw new Error('invalid private key');
    }
    utils.defineProperty(this, 'privateKey', '0x' + privateKey.toString('hex'))

    var keyPair = secp256k1.keyFromPrivate(privateKey);
    var publicKey = (new Buffer(keyPair.getPublic(false, 'hex'), 'hex')).slice(1);

    var address = getAddress(utils.sha3(publicKey).slice(12).toString('hex'));
    utils.defineProperty(this, 'address', address)

    utils.defineProperty(this, 'signDigest', function(digest) {
        return keyPair.sign(digest, {canonical: true});
    });
}

utils.defineProperty(SigningKey, 'getAddress', getAddress);

utils.defineProperty(SigningKey, 'getIcapAddress', function(address) {
    address = getAddress(address).substring(2);
    var base36 = (new utils.BN(address, 16)).toString(36).toUpperCase();
    while (base36.length < 30) { base36 = '0' + base36; }
    return 'XE' + ibanChecksum('XE00' + base36) + base36;
});


module.exports = SigningKey;
