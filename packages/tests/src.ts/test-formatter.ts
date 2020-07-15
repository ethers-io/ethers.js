'use strict';

import assert from 'assert';

import { Formatter } from "../../../packages/providers/lib/formatter"; //"../../providers/lib/formatter"; //  "@ethersproject/providers";

const receipts: Array<any> = [
    {
        blockHash: "0x36b4af7f0538559e581c8588f16477df0f676439ea67fe8d7a2ae4abb20e2566",
        blockNumber: 0x3c92b5,
        contractAddress: null,
        cumulativeGasUsed: 0x1cca2e,
        from: "0x18C6045651826824FEBBD39d8560584078d1b247",
        gasUsed:0x14bb7,
        logs: [
            {
                address: "0x314159265dD8dbb310642f98f50C066173C1259b",
                blockHash: "0x36b4af7f0538559e581c8588f16477df0f676439ea67fe8d7a2ae4abb20e2566",
                blockNumber: 0x3c92b5,
                data: "0x00000000000000000000000018c6045651826824febbd39d8560584078d1b247",
                logIndex: 0x1a,
                topics: [
                    "0xce0457fe73731f824cc272376169235128c118b49d344817417c6d108d155e82",
                    "0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae",
                    "0xf0106919d12469348e14ad6a051d0656227e1aba2fefed41737fdf78421b20e1"
                ],
                transactionHash: "0xc6fcb7d00d536e659a4559d2de29afa9e364094438fef3e72ba80728ce1cb616",
                transactionIndex: 0x39,
            },
            {
                address: "0x6090A6e47849629b7245Dfa1Ca21D94cd15878Ef",
                blockHash: "0x36b4af7f0538559e581c8588f16477df0f676439ea67fe8d7a2ae4abb20e2566",
                blockNumber: 0x3c92b5,
                data: "0x000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000000000595a32ce",
                logIndex: 0x1b,
                topics: [
                    "0x0f0c27adfd84b60b6f456b0e87cdccb1e5fb9603991588d87fa99f5b6b61e670",
                    "0xf0106919d12469348e14ad6a051d0656227e1aba2fefed41737fdf78421b20e1",
                    "0x00000000000000000000000018c6045651826824febbd39d8560584078d1b247"
                ],
                transactionHash: "0xc6fcb7d00d536e659a4559d2de29afa9e364094438fef3e72ba80728ce1cb616",
                transactionIndex: 0x39,
            }
        ],
        logsBloom: "0x00000000000000040000000000100000010000000000000040000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000200000010000000004000000000000000000000000000000000002000000000000000000000000400000000020000000000000000000000000000000000000004000000000000000000000000000000000000000000000000801000000000000000000000020000000000040000000040000000000000000002000000004000000000000000000000000000000000000000000000010000000000000000000000000000000000200000000000000000",
        root: "0x9b550a9a640ce50331b64504ef87aaa7e2aaf97344acb6ff111f879b319d2590",
        status: null,
        to: "0x6090A6e47849629b7245Dfa1Ca21D94cd15878Ef",
        transactionHash: "0xc6fcb7d00d536e659a4559d2de29afa9e364094438fef3e72ba80728ce1cb616",
        transactionIndex: 0x39
    },
    // Byzantium block
    {
        byzantium: true,
        blockHash: "0x34e5a6cfbdbb84f7625df1de69d218ade4da72f4a2558064a156674e72e976c9",
        blockNumber: 0x444f76,
        contractAddress: null,
        cumulativeGasUsed: 0x15bfe7,
        from: "0x18C6045651826824FEBBD39d8560584078d1b247",
        gasUsed: 0x1b968,
        logs: [
            {
                address: "0xb90E64082D00437e65A76d4c8187596BC213480a",
                blockHash: "0x34e5a6cfbdbb84f7625df1de69d218ade4da72f4a2558064a156674e72e976c9",
                blockNumber: 0x444f76,
                data: "0x",
                logIndex: 0x10,
                topics: [
                    "0x748d071d1992ee1bfe7a39058114d0a50d5798fe8eb3a9bfb4687f024629a2ce",
                    "0x5574aa58f7191ccab6de6cf75fe2ea0484f010b852fdd8c6b7ae151d6c2f4b83"
                ],
                transactionHash: "0x7f1c6a58dc880438236d0b0a4ae166e9e9a038dbea8ec074149bd8b176332cac",
                transactionIndex: 0x1e,
            }
        ],
        logsBloom: "0x00000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000200000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000800000000000000000800000000000000000000000000000000000000",
        status:1,
        to: "0xb90E64082D00437e65A76d4c8187596BC213480a",
        transactionHash: "0x7f1c6a58dc880438236d0b0a4ae166e9e9a038dbea8ec074149bd8b176332cac",
        transactionIndex: 0x1e
    }
];

describe('Transaction Receipt Validation', () => {
    let formatter: Formatter;

    before(() => {
        formatter = new Formatter();
    });

    receipts.forEach((receipt) => {
        it('validates a receipt', () => {
            const validReceipt = {
                ...receipt,
            };
            let result;
            assert.doesNotThrow(() => {
                result = formatter.receipt(validReceipt);
            }, 'does not throw an error');
            assert.ok(result, 'a value is returned');
        });

        it('validates a receipt with modified correct field - root', () => {
            const validReceipt = {
                ...receipt,
                root: '0x01',
            };
            let result;
            assert.doesNotThrow(() => {
                result = formatter.receipt(validReceipt);
            }, 'does not throw an error');
            assert.ok(result, 'a value is returned');
        });

        it('validates a receipt with incorrect field - root', () => {
            const invalidReceipt = {
                ...receipt,
                root: 1234,
            };
            let result;
            assert.throws(() => {
                result = formatter.receipt(invalidReceipt);
            }, {
                reason: 'invalid hex',
                checkKey: 'root',
                checkValue: 1234,
            }, 'throws an error with appropriate reason, checkKey, and checkValue');
            assert.ok(!result, 'a value is not returned');
        });

        it('validates a receipt with incorrect field - transactionHash', () => {
            const invalidReceipt = {
                ...receipt,
                transactionHash: '0x01',
            };
            let result;
            assert.throws(() => {
                result = formatter.receipt(invalidReceipt);
            }, {
                reason: 'invalid hash',
                checkKey: 'transactionHash',
                checkValue: '0x01',
            }, 'throws an error with appropriate reason, checkKey, and checkValue');
            assert.ok(!result, 'a value is not returned');
        });
    });
});
