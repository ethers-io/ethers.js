'use strict';

var fs = require('fs');
var path = require('path');

var utils = require('../utils.js');

function prefixAddress(address) {
    if (address.substring(0, 2) !== '0x') {
        address = '0x' + address;
    }
    return address.toLowerCase();
}


var Output = [];

/*
Output.push({
    type: 'brainwallet',
    address: '0xbed9d2E41BdD066f702C4bDB86eB3A3740101acC',
    password: 'password',
    privateKey: '',
    username: 'ricmoo',
});
*/

var privateKeys = {
    '0x0b88d4b324ec24c8c078551e6e5075547157e5b6': '0xd4375d2a931db84ea8825b69a3128913597744d9236cacec675cc18e1bda4446',
    '0x2e326fa404fc3661de4f4361776ed9bbabdc26e3': '0xcf367fc32bf789b3339c6664af4a12263e9db0e0eb70f247da1d1165e150c487',
    '0x00a329c0648769a73afac7f9381e08fb43dbea72': '0x4d5db4107d237df6a3d58ee5f70ae63d73d7658d4026f2eefd2f204c81682cb7',
    '0x4a9cf99357f5789251a8d7fad5b86d0f31eeb938': '0xa016182717223d01f776149ec0b4a217d0e9930cad263f205427c6d3cd5560e7',
    '0x88a5c2d9919e46f883eb62f7b8dd9d0cc45bc290': '0xf03e581353c794928373fb0893bc731aefc4c4e234e643f3a46998b03cd4d7c5',
    '0x17c5185167401ed00cf5f5b2fc97d9bbfdb7d025': '0x4242424242424242424242424242424242424242424242424242424242424242',
    '0x012363d61bdc53d0290a0f25e9c89f8257550fb8': '0x4c94faa2c558a998d10ee8b2b9b8eb1fbcb8a6ac5fd085c6f95535604fc1bffb',
    '0x15db397ed5f682acb22b0afc6c8de4cdfbda7cbc': '0xcdf3c34a2ea0ff181f462856168f5851e68c37b583eb158403e43aeab4964fee'
}

var mnemonics = {
    '0x15db397ed5f682acb22b0afc6c8de4cdfbda7cbc': 'debris glass rich exotic window other film slow expose flight either wealth',
    '0x012363d61bdc53d0290a0f25e9c89f8257550fb8': 'service basket parent alcohol fault similar survey twelve hockey cloud walk panel'
};

var walletPath = path.join(__dirname, 'test-wallets');
fs.readdirSync(walletPath).forEach(function(filename) {
    var data = require(path.join(walletPath, filename));

    var name = filename.substring(0, filename.length - 5).split('-')[1];

    // The password is the last segment of the filename
    var password = filename.substring(0, filename.length - 5).split('-');
    password = password[password.length - 1];

    if (data.ethaddr) {
        Output.push({
            type: 'crowdsale',
            address: prefixAddress(data.ethaddr),
            json: JSON.stringify(data),
            name: name,
            password: password,
            privateKey: privateKeys[prefixAddress(data.ethaddr)],
        });

    } else {
        Output.push({
            type: 'secret-storage',
            address: prefixAddress(data.address),
            json: JSON.stringify(data),
            mnemonic: mnemonics[prefixAddress(data.address)] || '',
            name: name,
            password: password,
            privateKey: privateKeys[prefixAddress(data.address)],
        });
    }
});

utils.saveTests('wallets', Output);
