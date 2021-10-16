'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = __importDefault(require("assert"));
var path_1 = require("path");
var fs_1 = __importDefault(require("fs"));
var cli_1 = require("@ethersproject/cli");
describe('Test solc', function () {
    it('compiles contracts with imported library', function () {
        this.timeout(1200000);
        var filename = (0, path_1.resolve)(__dirname, '../contracts/test-solc/consumer.sol');
        var source = fs_1.default.readFileSync(filename).toString();
        try {
            var code = cli_1.solc.compile(source, { filename: filename, optimize: true })
                .filter((function (contract) { return contract.name === 'Consumer'; }))[0];
            var bytecode = code.bytecode, iface = code.interface;
            (0, assert_1.default)(bytecode.length > 2, 'The bytecode should should have a length');
            (0, assert_1.default)(bytecode.startsWith('0x'), 'The bytecode should start with 0x');
            (0, assert_1.default)(iface.functions['f()'], 'The interface should have function f()');
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    });
});
//# sourceMappingURL=skip-test-solc.js.map