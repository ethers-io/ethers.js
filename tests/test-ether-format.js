'use strict';

var bigNumberify = require('../utils/bignumber.js').bigNumberify;
var ethersUnits = require('../utils/units.js');

// @TODO: Add testcases where format receives hexidecimal string

module.exports = function(test) {
    function checkFormat(wei, targetEther, options) {
        var ether = ethersUnits.formatEther(wei, options);
        //console.log(wei, targetEther, options, ether);
        test.equal(ether, targetEther, 'Failed to match formatted ether');
        ether = ether.replace(/,/g, '');
        test.ok(ethersUnits.parseEther(ether).eq(wei), 'Failed to convert back to wei');
    }

    function checkParse(ether, targetWei) {
        //console.log(ether, targetWei, Wallet.parseEther(ether));
        test.ok(targetWei.eq(ethersUnits.parseEther(ether)), 'Failed to match target wei');
    }

    checkParse('123.012345678901234567', bigNumberify('123012345678901234567'));

    checkParse('1.0', bigNumberify('1000000000000000000'));
    checkParse('1', bigNumberify('1000000000000000000'));
    checkParse('1.00', bigNumberify('1000000000000000000'));
    checkParse('01.0', bigNumberify('1000000000000000000'));

    checkParse('-1.0', bigNumberify('-1000000000000000000'));

    checkParse('0.1', bigNumberify('100000000000000000'));
    checkParse('.1', bigNumberify('100000000000000000'));
    checkParse('0.10', bigNumberify('100000000000000000'));
    checkParse('.100', bigNumberify('100000000000000000'));
    checkParse('00.100', bigNumberify('100000000000000000'));

    checkParse('-0.1', bigNumberify('-100000000000000000'));


    checkFormat(bigNumberify('10000000000000000'), '0.01');
    checkFormat(bigNumberify('1000000000000000000'), '1.0');
    checkFormat(bigNumberify('1230000000000000000'), '1.23');
    checkFormat(bigNumberify('-1230000000000000000'), '-1.23');

    checkFormat(bigNumberify('1000000000000000000'), '1.000000000000000000', {pad: true});
    checkFormat(bigNumberify('123000000000000000000'), '123.000000000000000000', {pad: true});
    checkFormat(bigNumberify('1230000000000000000'), '1.230000000000000000', {pad: true});

    checkFormat(bigNumberify('-1230000000000000000'), '-1.230000000000000000', {pad: true});

    checkFormat(bigNumberify('1234567890000000000000000'), '1,234,567.89', {pad: false, commify: true});
    checkFormat(bigNumberify('1234567890000000000000000'), '1,234,567.890000000000000000', {pad: true, commify: true});
    checkFormat(bigNumberify('-1234567890000000000000000'), '-1,234,567.89', {pad: false, commify: true});


    test.done();
}

module.exports.testSelf = module.exports;

