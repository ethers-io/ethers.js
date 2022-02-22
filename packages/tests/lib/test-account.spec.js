'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = __importDefault(require("assert"));
var hethers_1 = require("hethers");
var testcases_1 = require("@hethers/testcases");
describe('Private key generation & Alias population', function () {
    var tests = (0, testcases_1.loadTests)('accounts');
    tests.forEach(function (test) {
        if (!test.privateKey) {
            return;
        }
        it(('correctly converts private key - ' + test.name), function () {
            var wallet = new hethers_1.hethers.Wallet(test.privateKey);
            assert_1.default.strictEqual(wallet.alias, test.alias, 'correctly computes privateKey - ' + test.privateKey);
        });
    });
});
describe('Account & Address population', function () {
    var tests = (0, testcases_1.loadTests)('accounts');
    tests.forEach(function (test) {
        if (!(test.address && test.account && test.privateKey)) {
            return;
        }
        it(('correctly populates account/address - ' + test.name), function () {
            var wallet = new hethers_1.hethers.Wallet({ privateKey: test.privateKey, address: test.address });
            assert_1.default.strictEqual(wallet.address.toLowerCase(), test.address.toLowerCase(), "correctly populates address - " + test.address);
            assert_1.default.deepStrictEqual(wallet.account, hethers_1.hethers.utils.parseAccount(test.account), "correctly populates account - " + test.account);
        });
    });
});
describe('Checksum and ICAP address generation', function () {
    var tests = (0, testcases_1.loadTests)('accounts');
    tests.forEach(function (test) {
        it(('correctly transforms address - ' + test.name), function () {
            assert_1.default.strictEqual(hethers_1.hethers.utils.getAddress(test.address), test.checksumAddress, 'correctly computes checksum address from address');
            assert_1.default.strictEqual(hethers_1.hethers.utils.getIcapAddress(test.address), test.icapAddress, 'correctly computes ICAP address from address');
            assert_1.default.strictEqual(hethers_1.hethers.utils.getAddress(test.checksumAddress), test.checksumAddress, 'correctly computes checksum address from checksum address');
            assert_1.default.strictEqual(hethers_1.hethers.utils.getIcapAddress(test.checksumAddress), test.icapAddress, 'correctly computes ICAP address from checksum address');
            assert_1.default.strictEqual(hethers_1.hethers.utils.getAddress(test.icapAddress), test.checksumAddress, 'correctly computes checksum address from icap address');
            assert_1.default.strictEqual(hethers_1.hethers.utils.getIcapAddress(test.icapAddress), test.icapAddress, 'correctly computes ICAP address from icap address');
        });
    });
});
//# sourceMappingURL=test-account.spec.js.map