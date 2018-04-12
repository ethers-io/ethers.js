'use strict';

var defineProperty = require('./properties').defineProperty;

var codes = { };

[
    // Unknown Error
    'UNKNOWN_ERROR',

    // Missing new operator to an object
    //  - name: The name of the class
    'MISSING_NEW',

    // Invalid argument to a function:
    //   - arg: The argument name that was invalid
    'INVALID_ARGUMENT'

].forEach(function(code) {
    defineProperty(codes, code, code);
});


defineProperty(codes, 'throwError', function(message, code, params) {
    if (!code) { code = codes.UNKNOWN_ERROR; }
    if (!params) { params = {}; }

    var messageDetails = [];
    Object.keys(params).forEach(function(key) {
        messageDetails.push(key + '=' + JSON.stringify(params[key]));
    });
    var reason = message;
    if (messageDetails.length) {
        message += ' (' + messageDetails.join(', ') + ')';
    }

    var error = new Error(message);
    error.reason = reason;
    error.code = code

    Object.keys(params).forEach(function(key) {
        error[key] = params[key];
    });

    throw error;
});

defineProperty(codes, 'checkNew', function(self, kind) {
    if (!(self instanceof kind)) {
        codes.throwError('missing new', codes.MISSING_NEW, { name: kind.name });
    }
});

module.exports = codes;
