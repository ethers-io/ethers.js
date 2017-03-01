'use strict';

var reporter = require('nodeunit').reporters.default;

reporter.run([
    'run-contract-interface.js',
    'run-hdnode.js',
    'run-providers.js',
    'run-utils.js',
    'run-wallet.js',
]);
