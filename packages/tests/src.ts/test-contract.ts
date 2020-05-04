'use strict';

import assert from "assert";

import { ethers } from "ethers";

import contractData from "./test-contract.json";

//const provider = new ethers.providers.InfuraProvider('rinkeby');
const provider = ethers.getDefaultProvider("rinkeby");

const TIMEOUT_PERIOD = 120000;

const contract = (function() {
    return new ethers.Contract(contractData.contractAddress, contractData.interface, provider);
})();

function equals(name: string, actual: any, expected: any): void {
    if (Array.isArray(expected)) {
        assert.equal(actual.length, expected.length, 'array length mismatch - '  + name);
        expected.forEach(function(expected, index) {
            equals(name + ':' + index, actual[index], expected);
        });
        return;
    }

    if (typeof(actual) === 'object') {
        if (expected.indexed) {
            assert.ok(ethers.Contract.isIndexed(actual), 'index property has index - ' + name);
            if (expected.hash) {
                assert.equal(actual.hash, expected.hash, 'index property with known hash matches - ' + name);
            }
            return;
        }

        if (actual.eq) {
            assert.ok(actual.eq(expected), 'numeric value matches - ' + name);
        }
    }

    assert.equal(actual, expected, 'value matches - ' + name);
}

async function TestContractEvents() {
    const data = await ethers.utils.fetchJson('https://api.ethers.io/api/v1/?action=triggerTest&address=' + contract.address);

    console.log('  *** Triggered Transaction Hash: ' + data.hash);

    contract.on("error", (error) => {
        console.log(error);
        assert(false);
        contract.removeAllListeners();
    });

    function waitForEvent(eventName: string, expected: Array<any>): Promise<void> {
        return new Promise(function(resolve, reject) {
            let done = false;
            contract.on(eventName, function() {
                if (done) { return; }
                done = true;

                let args = Array.prototype.slice.call(arguments);
                let event = args[args.length - 1];
                event.removeListener();
                equals(event.event, args.slice(0, args.length - 1), expected);
                resolve();
            });

            const timer = setTimeout(() => {
                if (done) { return; }
                done = true;

                contract.removeAllListeners();
                reject(new Error("timeout"));
            }, TIMEOUT_PERIOD);
            if (timer.unref) { timer.unref(); }
        });
    }

    return new Promise(function(resolve, reject) {
        let p0 = '0x06B5955A67D827CDF91823E3bB8F069e6c89c1D6';
        let p0_1 = '0x06b5955A67d827CdF91823e3Bb8F069e6C89C1d7';
        let p1 = 0x42;
        let p1_1 = 0x43;

        return Promise.all([
            waitForEvent('Test', [ p0, p1 ]),
            waitForEvent('TestP0', [ p0, p1 ]),
            waitForEvent('TestP0P1', [ p0, p1 ]),
            waitForEvent('TestIndexedString', [ { indexed: true, hash: '0x7c5ea36004851c764c44143b1dcb59679b11c9a68e5f41497f6cf3d480715331' }, p1 ]),
            waitForEvent('TestV2', [ { indexed: true }, [ p0, p1 ] ]),
            waitForEvent('TestV2Nested', [ { indexed: true }, [ p0_1, p1_1, [ p0, p1 ] ] ]),
        ]).then(function(result) {
            resolve();
        });
    });
}

describe('Test Contract Objects', function() {

    it('parses events', function() {
        this.timeout(TIMEOUT_PERIOD);
        return TestContractEvents();
    });

    it('ABIv2 parameters and return types work', function() {
        this.timeout(TIMEOUT_PERIOD);
        let p0 = '0x06B5955A67D827CDF91823E3bB8F069e6c89c1D6';
        let p0_0f = '0x06B5955a67d827cDF91823e3bB8F069E6c89c1e5';
        let p0_f0 = '0x06b5955a67D827CDF91823e3Bb8F069E6C89c2C6';
        let p1 = 0x42;
        let p1_0f = 0x42 + 0x0f;
        let p1_f0 = 0x42 + 0xf0;

        let expectedPosStruct: any = [ p0_f0, p1_f0, [ p0_0f, p1_0f ] ];

        let seq = Promise.resolve();
        [
            [ p0, p1, [ p0, p1 ] ],
            { p0: p0, p1: p1, child: [ p0, p1 ] },
            [ p0, p1, { p0: p0, p1: p1 } ],
            { p0: p0, p1: p1, child: { p0: p0, p1: p1 } }
        ].forEach(function(struct) {
            seq = seq.then(function() {
                return contract.testV2(struct).then((result: any) => {
                    equals('position input', result, expectedPosStruct);
                    equals('keyword input p0', result.p0, expectedPosStruct[0]);
                    equals('keyword input p1', result.p1, expectedPosStruct[1]);
                    equals('keyword input child.p0', result.child.p0, expectedPosStruct[2][0]);
                    equals('keyword input child.p1', result.child.p1, expectedPosStruct[2][1]);
                });
            });
        });

        return seq;
    });

    it('collapses single argument solidity methods', function() {
        this.timeout(TIMEOUT_PERIOD);
        return contract.testSingleResult(4).then((result: any) => {
            assert.equal(result, 5, 'single value returned');
        });
    });

    it('does not collapses multi argument solidity methods', function() {
        this.timeout(TIMEOUT_PERIOD);
        return contract.testMultiResult(6).then((result: any) => {
            assert.equal(result[0], 7, 'multi value [0] returned');
            assert.equal(result[1], 8, 'multi value [1] returned');
            assert.equal(result.r0, 7, 'multi value [r0] returned');
            assert.equal(result.r1, 8, 'multi value [r1] returned');
        });
    });
});
