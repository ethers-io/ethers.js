import assert from "assert";

import { formatLog, formatReceiptLog } from "../providers/format.js";
import { Log } from "../providers/provider.js";

describe("Test Log Formatting", function() {
    describe("formatLog with blockTimestamp", function() {
        it("should parse blockTimestamp from hex string", function() {
            const logData = {
                address: '0x1234567890123456789012345678901234567890',
                blockHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
                blockNumber: '0x10',
                blockTimestamp: '0x65a1b2c3',
                data: '0xabcd',
                logIndex: '0x5',
                removed: false,
                topics: ['0x2222222222222222222222222222222222222222222222222222222222222222'],
                transactionHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
                transactionIndex: '0x1'
            };

            const formatted = formatLog(logData);

            assert.strictEqual(formatted.blockTimestamp, 1705095875, "blockTimestamp should be parsed to number");
            assert.strictEqual(formatted.blockNumber, 16, "blockNumber should be parsed");
            assert.strictEqual(formatted.transactionIndex, 1, "transactionIndex should be parsed");
        });

        it("should handle missing blockTimestamp gracefully", function() {
            const logData = {
                address: '0x1234567890123456789012345678901234567890',
                blockHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
                blockNumber: '0x10',
                data: '0xabcd',
                logIndex: '0x5',
                removed: false,
                topics: ['0x2222222222222222222222222222222222222222222222222222222222222222'],
                transactionHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
                transactionIndex: '0x1'
            };

            const formatted = formatLog(logData);

            assert.strictEqual(formatted.blockTimestamp, undefined, "blockTimestamp should be undefined when not provided");
            assert.strictEqual(formatted.blockNumber, 16, "blockNumber should still be parsed");
        });

        it("should handle null blockTimestamp", function() {
            const logData = {
                address: '0x1234567890123456789012345678901234567890',
                blockHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
                blockNumber: '0x10',
                blockTimestamp: null,
                data: '0xabcd',
                logIndex: '0x5',
                removed: false,
                topics: ['0x2222222222222222222222222222222222222222222222222222222222222222'],
                transactionHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
                transactionIndex: '0x1'
            };

            const formatted = formatLog(logData);

            assert.strictEqual(formatted.blockTimestamp, undefined, "blockTimestamp should be undefined when null");
        });

        it("should parse blockTimestamp 0x0", function() {
            const logData = {
                address: '0x1234567890123456789012345678901234567890',
                blockHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
                blockNumber: '0x10',
                blockTimestamp: '0x0',
                data: '0xabcd',
                logIndex: '0x5',
                removed: false,
                topics: ['0x2222222222222222222222222222222222222222222222222222222222222222'],
                transactionHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
                transactionIndex: '0x1'
            };

            const formatted = formatLog(logData);

            assert.strictEqual(formatted.blockTimestamp, 0, "blockTimestamp should be 0 for 0x0");
        });
    });

    describe("formatReceiptLog with blockTimestamp", function() {
        it("should parse blockTimestamp from hex string", function() {
            const logData = {
                address: '0x1234567890123456789012345678901234567890',
                blockHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
                blockNumber: '0x10',
                blockTimestamp: '0x65a1b2c3',
                data: '0xabcd',
                logIndex: '0x5',
                removed: false,
                topics: ['0x2222222222222222222222222222222222222222222222222222222222222222'],
                transactionHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
                transactionIndex: '0x1'
            };

            const formatted = formatReceiptLog(logData);

            assert.strictEqual(formatted.blockTimestamp, 1705095875, "blockTimestamp should be parsed to number");
            assert.strictEqual(formatted.blockNumber, 16, "blockNumber should be parsed");
            assert.strictEqual(formatted.transactionIndex, 1, "transactionIndex should be parsed");
        });

        it("should handle missing blockTimestamp gracefully", function() {
            const logData = {
                address: '0x1234567890123456789012345678901234567890',
                blockHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
                blockNumber: '0x10',
                data: '0xabcd',
                logIndex: '0x5',
                removed: false,
                topics: ['0x2222222222222222222222222222222222222222222222222222222222222222'],
                transactionHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
                transactionIndex: '0x1'
            };

            const formatted = formatReceiptLog(logData);

            assert.strictEqual(formatted.blockTimestamp, undefined, "blockTimestamp should be undefined when not provided");
        });
    });

    describe("Log class with blockTimestamp", function() {
        const mockProvider: any = {
            getBlock: () => Promise.resolve(null),
            getTransaction: () => Promise.resolve(null),
            getTransactionReceipt: () => Promise.resolve(null)
        };

        it("should store blockTimestamp in Log instance", function() {
            const logParams = {
                address: '0x1234567890123456789012345678901234567890',
                blockHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
                blockNumber: 16,
                blockTimestamp: 1705095875,
                data: '0xabcd',
                index: 5,
                removed: false,
                topics: ['0x2222222222222222222222222222222222222222222222222222222222222222'],
                transactionHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
                transactionIndex: 1
            };

            const log = new Log(logParams, mockProvider);

            assert.strictEqual(log.blockTimestamp, 1705095875, "Log instance should have blockTimestamp");
            assert.strictEqual(log.blockNumber, 16, "Log instance should have blockNumber");
            assert.strictEqual(log.address, '0x1234567890123456789012345678901234567890', "Log instance should have address");
        });

        it("should handle undefined blockTimestamp in Log instance", function() {
            const logParams = {
                address: '0x1234567890123456789012345678901234567890',
                blockHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
                blockNumber: 16,
                data: '0xabcd',
                index: 5,
                removed: false,
                topics: ['0x2222222222222222222222222222222222222222222222222222222222222222'],
                transactionHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
                transactionIndex: 1
            };

            const log = new Log(logParams, mockProvider);

            assert.strictEqual(log.blockTimestamp, undefined, "Log instance should have undefined blockTimestamp");
        });

        it("should include blockTimestamp in toJSON output", function() {
            const logParams = {
                address: '0x1234567890123456789012345678901234567890',
                blockHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
                blockNumber: 16,
                blockTimestamp: 1705095875,
                data: '0xabcd',
                index: 5,
                removed: false,
                topics: ['0x2222222222222222222222222222222222222222222222222222222222222222'],
                transactionHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
                transactionIndex: 1
            };

            const log = new Log(logParams, mockProvider);
            const json = log.toJSON();

            assert.strictEqual(json._type, "log", "JSON should have _type");
            assert.strictEqual(json.blockTimestamp, 1705095875, "JSON should include blockTimestamp");
            assert.strictEqual(json.blockNumber, 16, "JSON should include blockNumber");
            assert.strictEqual(json.address, '0x1234567890123456789012345678901234567890', "JSON should include address");
        });

        it("should exclude undefined blockTimestamp from toJSON output", function() {
            const logParams = {
                address: '0x1234567890123456789012345678901234567890',
                blockHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
                blockNumber: 16,
                data: '0xabcd',
                index: 5,
                removed: false,
                topics: ['0x2222222222222222222222222222222222222222222222222222222222222222'],
                transactionHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
                transactionIndex: 1
            };

            const log = new Log(logParams, mockProvider);
            const json = log.toJSON();

            assert.strictEqual(json._type, "log", "JSON should have _type");
            assert.ok(!("blockTimestamp" in json), "blockTimestamp key should not be present in JSON when undefined");
        });
    });

    describe("Integration: formatLog -> Log class", function() {
        const mockProvider: any = {
            getBlock: () => Promise.resolve(null),
            getTransaction: () => Promise.resolve(null),
            getTransactionReceipt: () => Promise.resolve(null)
        };

        it("should preserve blockTimestamp through formatting and Log creation", function() {
            const rawLogData = {
                address: '0x1234567890123456789012345678901234567890',
                blockHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
                blockNumber: '0x10',
                blockTimestamp: '0x65a1b2c3',
                data: '0xabcd',
                logIndex: '0x5',
                removed: false,
                topics: ['0x2222222222222222222222222222222222222222222222222222222222222222'],
                transactionHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
                transactionIndex: '0x1'
            };

            const formatted = formatLog(rawLogData);
            const log = new Log(formatted, mockProvider);

            assert.strictEqual(log.blockTimestamp, 1705095875, "blockTimestamp should be preserved through formatting and Log creation");
            assert.strictEqual(log.toJSON().blockTimestamp, 1705095875, "blockTimestamp should be in JSON output");
        });

        it("should handle missing blockTimestamp through full pipeline", function() {
            const rawLogData = {
                address: '0x1234567890123456789012345678901234567890',
                blockHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
                blockNumber: '0x10',
                data: '0xabcd',
                logIndex: '0x5',
                removed: false,
                topics: ['0x2222222222222222222222222222222222222222222222222222222222222222'],
                transactionHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
                transactionIndex: '0x1'
            };

            const formatted = formatLog(rawLogData);
            const log = new Log(formatted, mockProvider);

            assert.strictEqual(log.blockTimestamp, undefined, "blockTimestamp should be undefined through full pipeline");
            assert.strictEqual(log.blockNumber, 16, "blockNumber should still work");
        });
    });
});