'use strict';
var Wallet = require('../index.js');

var BN = Wallet.utils.BN;

module.exports = function(test) {
    function checkFormat(wei, targetEther, options) {
        var ether = Wallet.formatEther(wei, options);
        //console.log(wei, targetEther, options, ether);
        test.equal(ether, targetEther, 'Failed to match formatted ether');
        ether = ether.replace(/,/g, '');
        test.ok(Wallet.parseEther(ether).eq(wei), 'Failed to convert back to wei');
    }

    function checkParse(ether, targetWei) {
        //console.log(ether, targetWei, Wallet.parseEther(ether));
        test.ok(targetWei.eq(Wallet.parseEther(ether)), 'Failed to match target wei');
    }

    checkParse('123.012345678901234567', new BN('123012345678901234567'));

    checkParse('1.0', new BN('1000000000000000000'));
    checkParse('1', new BN('1000000000000000000'));
    checkParse('1.00', new BN('1000000000000000000'));
    checkParse('01.0', new BN('1000000000000000000'));

    checkParse('-1.0', new BN('-1000000000000000000'));

    checkParse('0.1', new BN('100000000000000000'));
    checkParse('.1', new BN('100000000000000000'));
    checkParse('0.10', new BN('100000000000000000'));
    checkParse('.100', new BN('100000000000000000'));
    checkParse('00.100', new BN('100000000000000000'));

    checkParse('-0.1', new BN('-100000000000000000'));


    checkFormat(new BN('10000000000000000'), '0.01');
    checkFormat(new BN('1000000000000000000'), '1.0');
    checkFormat(new BN('1230000000000000000'), '1.23');
    checkFormat(new BN('-1230000000000000000'), '-1.23');

    checkFormat(new BN('1000000000000000000'), '1.000000000000000000', {pad: true});
    checkFormat(new BN('123000000000000000000'), '123.000000000000000000', {pad: true});
    checkFormat(new BN('1230000000000000000'), '1.230000000000000000', {pad: true});

    checkFormat(new BN('-1230000000000000000'), '-1.230000000000000000', {pad: true});

    checkFormat(new BN('1234567890000000000000000'), '1,234,567.89', {pad: false, commify: true});
    checkFormat(new BN('1234567890000000000000000'), '1,234,567.890000000000000000', {pad: true, commify: true});
    checkFormat(new BN('-1234567890000000000000000'), '-1,234,567.89', {pad: false, commify: true});


    test.done();
}
