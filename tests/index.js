'use strict';

var reporter = require('nodeunit').reporters.default;

/*
module.exports = {};

['contract-iterface', 'hdnode', 'utils', 'wallet'].forEach(function(runName) {
    var runs = require('./run-' + runName + '.js');
    for (var testcaseName in runs) {
        module.exports[testcaseName] = runs[testcaseName];
    }
});
*/

reporter.run([
    'run-contract-interface.js',
    'run-hdnode.js',
    'run-utils.js',
    'run-wallet.js',
]);
