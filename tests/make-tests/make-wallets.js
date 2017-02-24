'use strict';

var fs = require('fs');
var path = require('path');

var utils = require('./utils.js');

function prefixAddress(address) {
    if (address.substring(0, 2) !== '0x') {
        address = '0x' + address;
    }
    return address;
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

var walletPath = path.join(__dirname, 'test-wallets');
fs.readdirSync(walletPath).forEach(function(filename) {
    var data = require(path.join(walletPath, filename));

    // The password is the last segment of the filename
    var password = filename.substring(0, filename.length - 5).split('-');
    password = password[password.length - 1];

    if (password === 'life') { password = 'foobar42'; }

    if (data.ethaddr) {
        Output.push({
            type: 'crowdsale',
            address: prefixAddress(data.ethaddr),
            json: JSON.stringify(data),
            password: password,
            privateKey: '',
        });

    } else {
        Output.push({
            type: 'secret-storage',
            address: prefixAddress(data.address),
            json: JSON.stringify(data),
            password: password,
            privateKey: '',
        });
    }
});

utils.saveTestcase('wallets', Output);
