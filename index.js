var aes = require('aes-js');
var elliptic = require('elliptic');
var pbkdf2 = require('pbkdf2');
var rlp = require('rlp');
var scrypt = require('scrypt-js');
var uuid = require('uuid');

var BN = require('./node_modules/elliptic/node_modules/bn.js/lib/bn.js');

var sha3 = require('./lib/sha3.js');

var secp256k1 = new (require('elliptic').ec)('secp256k1');


function stripZeros(buffer) {
    var i = 0;
    for (i = 0; i < buffer.length; i++) {
        if (buffer[i] !== 0) { break; }
    }
    return (i > 0) ? buffer.slice(i): buffer;
}

function bnToBuffer(bn) {
    var hex = bn.toString(16);
    if (hex.length % 2) { hex = '0' + hex; }
    return stripZeros(new Buffer(hex, 'hex'));
}

function hexOrBuffer(value, name) {
    if (!Buffer.isBuffer(value)) {
        if (typeof(value) !== 'string' || !value.match(/^0x[0-9A-Fa-f]*$/)) {
            var error = new Error(name ? ('invalid ' + name) : 'invalid hex or buffer');
            error.reason = 'invalid hex string';
            error.value = value;
            throw error;
        }

        value = value.substring(2);
        if (value.length % 2) { value = '0' + value; }
        value = new Buffer(value, 'hex');
    }

    return value;
}

function rlpEncodeLength(length) {
}

function rlpArray(items) {
    
    var output = new Buffer(0);
    for (var i = 0; i < items.length; i++) {
    }
    
}

function defineProperty(object, name, value) {
    Object.defineProperty(object, name, {
        enumerable: true,
        value: value
    });
}

var utils = {};
defineProperty(utils, 'defineProperty', defineProperty);

defineProperty(utils, 'aes', aes);
defineProperty(utils, 'BN', BN);
defineProperty(utils, 'Buffer', Buffer);
defineProperty(utils, 'scrypt', scrypt);
defineProperty(utils, 'sha3', sha3);

function getChecksumAddress(address) {
    if (typeof(address) !== 'string' || !address.match(/^0x[0-9A-Fa-f]{40}$/)) {
        throw new Error('invalid address');
    }

    address = address.substring(2).toLowerCase();
    var hash = sha3(address);

    address = address.split('');
    for (var i = 0; i < 40; i += 2) {
        if ((hash[i >> 1] >> 4) >= 8) {
            address[i] = address[i].toUpperCase();
        }
        if ((hash[i >> 1] & 0x0f) >= 8) {
            address[i + 1] = address[i + 1].toUpperCase();
        }
    }

    return '0x' + address.join('');
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

defineProperty(utils, 'getAddress', function(address) {
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

        result = (new BN(address.substring(4), 36)).toString(16);
        while (result.length < 40) { result = '0' + result; }
        result = getChecksumAddress('0x' + result);

    } else {
        throw new Error('invalid address');
    }

    return result;
});

defineProperty(utils, 'getIcapAddress', function(address) {
    address = utils.getAddress(address).substring(2);
    var base36 = (new BN(address, 16)).toString(36).toUpperCase();
    while (base36.length < 30) { base36 = '0' + base36; }
    return 'XE' + ibanChecksum('XE00' + base36) + base36;
});

// http://ethereum.stackexchange.com/questions/760/how-is-the-address-of-an-ethereum-contract-computed
defineProperty(utils, 'getContractAddress', function(transaction) {
    return '0x' + utils.sha3(rlp.encode([
        hexOrBuffer(transaction.from, 'from'),
        hexOrBuffer(transaction.nonce, 'nonce')
    ])).slice(12).toString('hex');
});

var transactionFields = [
    {name: 'nonce',    maxLength: 32, },
    {name: 'gasPrice', maxLength: 32, },
    {name: 'gasLimit', maxLength: 32, },
    {name: 'to',          length: 20, },
    {name: 'value',    maxLength: 32, },
    {name: 'data'},
];


function Wallet(privateKey) {
    if (!(this instanceof Wallet)) { throw new Error('missing new'); }

    if (typeof(privateKey) === 'string' && privateKey.match(/^0x[0-9A-Fa-f]{64}$/)) {
        privateKey = new Buffer(privateKey.substring(2), 'hex');
    } else if (!Buffer.isBuffer(privateKey) || privateKey.length !== 32) {
        throw new Error('invalid private key');
    }

    var keyPair = secp256k1.keyFromPrivate(privateKey);

    var publicKey = (new Buffer(keyPair.getPublic(false, 'hex'), 'hex')).slice(1);
    defineProperty(this, 'address', '0x' + sha3(publicKey).slice(12).toString('hex'));

    defineProperty(this, 'sign', function(transaction) {
        var raw = [];
        transactionFields.forEach(function(fieldInfo) {
            var value = transaction[fieldInfo.name] || (new Buffer(0));
            value = hexOrBuffer(value, fieldInfo.name);

            // Fixed-width field
            if (fieldInfo.length && value.length !== fieldInfo.length) {
                var error = new Error('invalid ' + fieldInfo.name);
                error.reason = 'wrong length';
                error.value = value;
                throw error;
            }

            // Variable-width (with a maximum)
            if (fieldInfo.maxLength) {
                value = stripZeros(value);
                if (value.length > fieldInfo.maxLength) {
                    var error = new Error('invalid ' + fieldInfo.name);
                    error.reason = 'too long';
                    error.value = value;
                    throw error;
                }
            }

            raw.push(value);
        });

        var digest = utils.sha3(rlp.encode(raw));

        var signature = keyPair.sign(digest, {canonical: true});
        var s = signature.s;
        var v = signature.recoveryParam;

        raw.push(new Buffer([27 + v]));
        raw.push(bnToBuffer(signature.r));
        raw.push(bnToBuffer(s));

        return ('0x' + rlp.encode(raw).toString('hex'));
    });
}

defineProperty(Wallet, 'utils', utils);

module.exports = Wallet;
