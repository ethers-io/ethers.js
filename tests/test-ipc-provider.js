'use strict';

var assert = require('assert');
var net = require('net');
var os = require('os');
var path = require('path');
var {IpcProvider} = require('../providers/ipc-provider');

const sleep = (ms) => new Promise(res => setTimeout(res, ms, ms));

describe('IpcProvider', () => {
    describe('.send', () => {
        var srv
        var ipcFilename = path.basename(__filename) + '.ipc'
        var ipcPath = path.join(os.tmpdir(), ipcFilename);

        beforeEach(() => srv = net.createServer({allowHalfOpen: true}));
        afterEach(done => srv.listening ? srv.close(done) : done());

        describe('when receives response in chunks', () => {
            it('concatenates them before parsing it as JSON', done => {
                srv.on('connection', socket => {
                    socket.on('data', _data => "throw away");
                    socket.on('end', async () => {
                        const [chunk1, chunk2] = [
                            '{ "result"',
                            ': {"success": true} }'
                        ];
                        socket.write(chunk1);
                        await sleep(1); // Ensure delivery of chunk1
                        socket.write(chunk2);
                        socket.end();
                    });
                });
                srv.on('error', done);
                srv.listen(ipcPath, () => {
                    var ipcProvider = new IpcProvider(ipcPath);
                    ipcProvider.send('<method>', ['<p1>', '<p2>'])
                        .then(response => {
                            assert.deepStrictEqual(response, {success: true});
                            done();
                        })
                        .catch(done);
                });
            });
        });

        describe('when receives invalid JSON', () => {
            it('prints the raw response', done => {
                const invalidResponse = "{<invalid JSON>}"
                srv.on('connection', socket => {
                    socket.on('data', _data => "throw away");
                    socket.on('end', () => {
                        socket.write(invalidResponse);
                        socket.end();
                    });
                });
                srv.on('error', done);
                srv.listen(ipcPath, () => {
                    var ipcProvider = new IpcProvider(ipcPath);
                    ipcProvider.send('<method>', ['<p1>', '<p2>'])
                        .then(response =>
                            assert.fail('Unexpected response:\n' + response))
                        .catch(error => {
                            assert.strictEqual(error.message,
                                'Unexpected token < in JSON at position 1:\n'
                                + invalidResponse)
                            done()
                        });
                });
            });
        })
    });
});
