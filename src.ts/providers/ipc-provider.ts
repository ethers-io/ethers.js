
import net from 'net';

import { JsonRpcProvider } from './json-rpc-provider';
import { Network } from './networks';

import * as errors from '../utils/errors';

export class IpcProvider extends JsonRpcProvider {
    readonly path: string;
    constructor(path: string, network?: Network | string) {
        if (path == null) {
            errors.throwError('missing path', errors.MISSING_ARGUMENT, { arg: 'path' });
        }

        super('ipc://' + path, network);
        errors.checkNew(this, IpcProvider);

        this.path = path;
    }

    // @TODO: Create a connection to the IPC path and use filters instead of polling for block

    send(method: string, params: any): Promise<any> {
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

        return new Promise((resolve, reject) => {
            var stream = net.connect(this.path);
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
    }
}
