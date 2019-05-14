let { defaultAbiCoder } = require(".");

console.log(defaultAbiCoder);
console.log(defaultAbiCoder.encode([ "uint256", "bytes" ], [ 42, "0x1234" ]));
