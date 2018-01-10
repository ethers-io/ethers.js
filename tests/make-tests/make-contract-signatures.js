'use strict';

var utils = require('../utils');

var compile = (function() {
    var soljson = require('../soljson-4.19.js');
    var _compile = soljson.cwrap("compileJSONCallback", "string", ["string", "number", "number"]);

    function compile(source) {
        return JSON.parse(_compile(JSON.stringify({sources: { "demo.sol": source }}), 0));
    }
    compile.version = JSON.parse(compile('contract Foo { }').contracts['demo.sol:Foo'].metadata).compiler.version
    return compile;
})();

var tests = utils.loadTests('contract-interface-abi2');

var output = [];

tests.forEach(function(test) {
    var source = test.source;
    var ret = source.match(/returns([^{]*){/);
    var testSig = 'function testSig' + ret[1] + ' { }';
    source = source.substring(0, source.length - 2) + '    ' + testSig + '\n}\n';
    var code = compile(source);
    if (!code.contracts['demo.sol:Test']) {
        console.log(test.name, testSig, code.errors);
        return;
    }
    var funcHashes = code.contracts['demo.sol:Test'].functionHashes;
    var funcHash = null;
    for (var key in funcHashes) {
        if (key === 'test()') { continue; }
        if (funcHash) { throw new Error('should not happen'); }
        funcHash = key;
    }
    console.log(test.name, funcHash, funcHashes[funcHash]);
    output.push({
        name: test.name,
        signature: funcHash,
        sigHash: '0x' + funcHashes[funcHash],
        abi: code.contracts['demo.sol:Test'].interface
    });
});

utils.saveTests('contract-signatures', output);
