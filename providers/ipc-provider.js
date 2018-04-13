'use strict';

var net = require('net');

var JsonRpcProvider = require('./json-rpc-provider');

var defineProperty = require('../utils/properties').defineProperty;
var errors = require('../utils/errors');

function IpcProvider(path, network) {
    errors.checkNew(this, IpcProvider);

    if (path == null) {
        errors.throwError('missing path', errors.MISSING_ARGUMENT, { arg: 'path' });
    }
    if (network == null) { network = 'homestead'; }

    JsonRpcProvider.call(this, 'ipc://' + path, network);

    defineProperty(this, 'path', path);
}
JsonRpcProvider.inherits(IpcProvider);

// @TODO: Create a connection to the IPC path and use filters instead of polling for block

defineProperty(IpcProvider.prototype, 'send', function(method, params) {
    // This method is very simple right now. We create a new socket
    // connection each time, which may be slower, but the main
    // advantage we are aiming for now is security. This simplifies
    // multiplexing requests (since we do not need to multiplex).

    var payload = JSON.stringify({
        method: method,
        params: params,
        id: 42,
        jsonrpc: "2.0"
    });

    var self = this;
    return new Promise(function(resolve, reject) {
        var stream = net.connect(self.path);
        stream.on('data', function(data) {
            try {
                resolve(JSON.parse(data.toString('utf8')).result);
                // @TODO: Better pull apart the error
                stream.destroy();
            } catch (error) {
                reject(error);
                stream.destroy();
            }
        });

        stream.on('end', function() {
            stream.destroy();
        });

        stream.on('error', function(error) {
            reject(error);
            stream.destroy();
        });
        stream.write(payload);
        stream.end();
    });
});

module.exports = IpcProvider;
