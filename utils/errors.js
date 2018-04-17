'use strict';

var defineProperty = require('./properties').defineProperty;

var codes = { };

[
    // Unknown Error
    'UNKNOWN_ERROR',

    // Not implemented
    'NOT_IMPLEMENTED',

    // Missing new operator to an object
    //  - name: The name of the class
    'MISSING_NEW',


    // Call exception
    'CALL_EXCEPTION',


    // Response from a server was invalid
    //   - response: The body of the response
    //'BAD_RESPONSE',


    // Invalid argument (e.g. type) to a function:
    //   - arg: The argument name that was invalid
    //   - value: The value of the argument
    //   - type: The type of the argument
    //   - expected: What was expected
    'INVALID_ARGUMENT',

    // Missing argument to a function:
    //   - arg: The argument name that is required
    //   - count: The number of arguments received
    //   - expectedCount: The number of arguments expected
    'MISSING_ARGUMENT',

    // Too many arguments
    //   - count: The number of arguments received
    //   - expectedCount: The number of arguments expected
    'UNEXPECTED_ARGUMENT',


    // Unsupported operation
    //   - operation
    'UNSUPPORTED_OPERATION',


].forEach(function(code) {
    defineProperty(codes, code, code);
});


defineProperty(codes, 'throwError', function(message, code, params) {
    if (!code) { code = codes.UNKNOWN_ERROR; }
    if (!params) { params = {}; }

    var messageDetails = [];
    Object.keys(params).forEach(function(key) {
        try {
            messageDetails.push(key + '=' + JSON.stringify(params[key]));
        } catch (error) {
            messageDetails.push(key + '=' + JSON.stringify(params[key].toString()));
        }
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
