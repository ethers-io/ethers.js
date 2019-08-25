"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//let web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8549'));
//import { compile as _compile } from "solc";
var cli_1 = require("@ethersproject/cli");
var __1 = require("..");
var ethereumjs_util_1 = require("ethereumjs-util");
function hasPrefix(str, prefix) {
    return (str.substring(0, prefix.length) === prefix);
}
function repeat(str, count) {
    var result = "";
    for (var i = 0; i < count; i++) {
        result += str;
    }
    return result;
}
function indent(tabs) {
    var result = '';
    while (result.length < 4 * tabs) {
        result += "    ";
    }
    return result;
}
function getStructName(base) {
    return "Struct" + ethereumjs_util_1.keccak256(base).slice(0, 4).toString("hex");
}
var Code = /** @class */ (function () {
    function Code() {
        this.depth = 0;
        this.lines = [];
    }
    Object.defineProperty(Code.prototype, "code", {
        get: function () {
            return this.lines.join("\n"); //.replace(/ +\n/g, "\n").replace(/(\}\n\n+)/g, "}\n");
        },
        enumerable: true,
        configurable: true
    });
    Code.prototype.comment = function (line) {
        this.add("");
        this.add("/" + "/ " + line);
    };
    Code.prototype.add = function (line) {
        var open = (line.trim().substring(line.trim().length - 1) === "{");
        var close = line.trim()[0] === "}";
        if (close) {
            this.depth--;
        }
        this.lines.push(indent(this.depth) + line);
        //if (close) { this.lines.push(""); }
        if (open) {
            this.depth++;
        }
    };
    return Code;
}());
var chars = [];
function addChars(start, length) {
    for (var i = start; i < start + length; i++) {
        chars.push(String.fromCharCode(i));
    }
}
addChars(48, 10);
addChars(65, 26);
// Returns the functions required to generate code for a specific parameter type and value
function getGenCode(testData) {
    var type = testData.type;
    var value = (testData.value != null) ? testData.value : "__crash__";
    var isArray = type.match(/^(.*)(\[[0-9]*\])$/);
    if (isArray) {
        var base_1 = isArray[1];
        var suffix_1 = isArray[2];
        var isDynamic_1 = (isArray[2] === "[]");
        return {
            assign: function (name, code) {
                if (isDynamic_1) {
                    //let child = getGenCode({ type: base });
                    //let decl = child.decl(name).split(" ");
                    var struct = base_1;
                    if (type.substring(0, 5) === "tuple") {
                        struct = getStructName(base_1);
                    }
                    code.add(name + " = new " + struct + "[](" + String(value.length) + ");");
                }
                value.forEach(function (value, index) {
                    console.log("SSS", base_1, value);
                    var child = getGenCode({ type: base_1, value: value });
                    child.assign(name + "[" + String(index) + "]", code);
                });
            },
            decl: function (name) {
                var child = getGenCode({ type: isArray[1] });
                // Inject the array suffix to the type and add memory location
                //   - uint256 p0       => uint256[] memory p0
                //   - bytes memory p0  => bytes[] memory p0
                var result = child.decl(name).split(" ");
                result[0] = result[0] + suffix_1;
                if (result[1] !== "memory") {
                    result.splice(1, 0, "memory");
                }
                return result.join(" ");
            },
            structs: function (code) {
                var child = getGenCode({ type: isArray[1] });
                child.structs(code);
            }
        };
    }
    var isTuple = type.match(/^tuple\((.*)\)$/);
    if (isTuple) {
        var children_1 = [];
        // Split up the child types
        var accum = "";
        var balance = 0;
        var types = isTuple[1];
        for (var i = 0; i < types.length; i++) {
            var c = types[i];
            if (c === "(") {
                balance++;
                accum += c;
            }
            else if (c === ")") {
                balance--;
                accum += c;
            }
            else if (c === ",") {
                if (balance === 0) {
                    children_1.push(accum);
                    accum = "";
                }
                else {
                    accum += c;
                }
            }
            else {
                accum += c;
            }
        }
        if (accum) {
            children_1.push(accum);
        }
        return {
            assign: function (name, code) {
                children_1.forEach(function (child, index) {
                    console.log("TT", child, value[index]);
                    getGenCode({
                        type: child,
                        value: value[index]
                    }).assign(name + ".m" + String(index), code);
                });
            },
            decl: function (name) {
                return (getStructName(type) + " memory " + name);
            },
            structs: function (code) {
                // Include any dependency Structs first
                children_1.forEach(function (child) {
                    getGenCode({ type: child }).structs(code);
                });
                // Add this struct
                code.add("struct " + getStructName(type) + " {");
                children_1.forEach(function (child, index) {
                    var decl = getGenCode({
                        type: child
                    }).decl("m" + String(index)).replace(" memory ", " ");
                    code.add(decl + ";");
                });
                code.add("}");
            }
        };
    }
    var isFixedBytes = type.match(/^bytes([0-9]+)$/);
    var isNumber = type.match(/^(u?)int([0-9]*)$/);
    var isFixedNumber = type.match(/^(u?)fixed(([0-9]+)x([0-9]+))?$/);
    if (type === "address" || type === "bool" || isNumber || isFixedNumber || isFixedBytes) {
        return {
            assign: function (name, code) {
                if (type === "boolean") {
                    code.add(name + " = " + (value ? "true" : "false") + ";");
                }
                else if (isFixedBytes) {
                    code.add(name + " = hex\"" + value.substring(2) + "\";");
                }
                else {
                    code.add(name + " = " + value + ";");
                }
            },
            decl: function (name) {
                return (type + " " + name);
            },
            structs: function (code) { }
        };
    }
    if (type === "string") {
        return {
            assign: function (name, code) {
                code.add(name + " = " + JSON.stringify(value) + ";");
            },
            decl: function (name) {
                return ("string memory " + name);
            },
            structs: function (code) { }
        };
    }
    if (type === "bytes") {
        var valueBytes_1 = Buffer.from(value.substring(2), "hex");
        return {
            assign: function (name, code) {
                code.add("{");
                code.add("bytes memory temp = new bytes(" + valueBytes_1.length + ");");
                code.add(name + " = temp;");
                code.add("assembly {");
                // Store the length
                code.add("mstore(temp, " + valueBytes_1.length + ")");
                // Store each byte
                for (var i = 0; i < valueBytes_1.length; i++) {
                    code.add("mstore8(add(temp, " + (32 + i) + "), " + valueBytes_1[i] + ")");
                }
                code.add("}");
                code.add("}");
            },
            decl: function (name) {
                return ("bytes memory " + name);
            },
            structs: function (code) { }
        };
    }
    throw new Error("Could not produce GenCode: " + type);
    return null;
}
// Generates a random type and value for the type
function generateTest(seed) {
    var basetype = __1.randomNumber(seed + "-type", 0, 10);
    switch (basetype) {
        // Address
        case 0:
            return function (seed) {
                var value = ethereumjs_util_1.toChecksumAddress(__1.randomHexString(seed + "-value", 20));
                return {
                    type: "address",
                    value: value
                };
            };
        // Boolean
        case 1:
            return function (seed) {
                var value = (__1.randomNumber(seed + "-value", 0, 2) ? true : false);
                return {
                    type: "bool",
                    value: value
                };
            };
        // Number
        case 2: {
            var signed_1 = __1.randomNumber(seed + "-signed", 0, 2);
            var width_1 = __1.randomNumber(seed + "-width", 0, 33) * 8;
            var type_1 = (signed_1 ? "" : "u") + "int";
            // Allow base int and uint
            if (width_1) {
                type_1 += String(width_1);
            }
            else {
                width_1 = 256;
            }
            return function (seed) {
                var hex = __1.randomHexString(seed + "-value", width_1 / 8).substring(2);
                if (signed_1) {
                    // Sign bit set (we don't bother with 2's compliment
                    var msb = parseInt(hex[0], 16);
                    if (msb >= 8) {
                        hex = "-" + String(msb & 0x7) + hex.substring(1);
                    }
                }
                var value = (new ethereumjs_util_1.BN(hex, 16)).toString();
                return {
                    type: type_1,
                    value: value
                };
            };
        }
        // Fixed
        case 3: {
            // Fixed Point values are not supported yet
            return generateTest(seed + "-next");
            var signed_2 = __1.randomNumber(seed + "-signed", 0, 2);
            var width_2 = __1.randomNumber(seed + "-width", 0, 33) * 8;
            var decimals_1 = 0;
            var maxDecimals = (new ethereumjs_util_1.BN(repeat("7f", ((width_2 === 0) ? 32 : (width_2 / 8))), 16)).toString().length - 1;
            var attempt = 0;
            while (true) {
                decimals_1 = __1.randomNumber(seed + "-decimals" + String(attempt), 0, 80);
                if (decimals_1 < maxDecimals) {
                    break;
                }
                attempt++;
            }
            var type_2 = (signed_2 ? "" : "u") + "fixed";
            // Allow base int and uint
            if (width_2) {
                type_2 += String(width_2) + "x" + String(decimals_1);
            }
            else {
                width_2 = 128;
                decimals_1 = 18;
            }
            return function (seed) {
                var hex = __1.randomHexString(seed + "-value", width_2 / 8).substring(2);
                // Use the top bit to indicate negative values
                var negative = false;
                if (signed_2) {
                    // Sign bit set (we don't bother with 2's compliment
                    var msb = parseInt(hex[0], 16);
                    if (msb >= 8) {
                        hex = String(msb & 0x7) + hex.substring(1);
                        negative = true;
                    }
                }
                // Zero-pad the value so we get at least 1 whole digit
                var dec = (new ethereumjs_util_1.BN(hex, 16)).toString();
                while (dec.length < decimals_1 + 1) {
                    dec = "0" + dec;
                }
                // Split the decimals with the decimal point
                var split = dec.length - decimals_1;
                var value = dec.substring(0, split) + "." + dec.substring(split);
                if (negative) {
                    value = "-" + value;
                }
                // Prevent ending in a decimal (e.g. "45."
                if (value.substring(value.length - 1) === ".") {
                    value = value.substring(0, value.length - 1);
                }
                return {
                    type: type_2,
                    value: value
                };
            };
        }
        // BytesXX
        case 4: {
            var length_1 = __1.randomNumber(seed + "-length", 1, 33);
            var type_3 = "bytes" + String(length_1);
            return function (seed) {
                var value = __1.randomHexString(seed + "-value", length_1);
                return {
                    type: type_3,
                    value: value
                };
            };
        }
        // String
        case 5:
            return function (seed) {
                var length = __1.randomNumber(seed + "-length", 0, 36);
                var value = "";
                while (value.length < length) {
                    value += chars[__1.randomNumber(seed + "-value" + String(value.length), 0, chars.length)];
                }
                return {
                    type: "string",
                    value: value
                };
            };
        // Bytes
        case 6:
            return function (seed) {
                var length = __1.randomNumber(seed + "-length", 0, 12); // @TODO: increase this
                var value = __1.randomHexString(seed + "-value", length);
                //let valueBytes = Buffer.from(value.substring(2), "hex");
                return {
                    type: "bytes",
                    value: value
                };
            };
        // Fixed-Length Array (e.g. address[4])
        case 7:
        // Falls-through
        // Dynamic-Length Array (e.g. address[])
        case 8: {
            var dynamic_1 = (basetype === 8);
            var subType_1 = generateTest(seed + "-subtype");
            var length_2 = __1.randomNumber(seed + "-length", 1, 3);
            var suffix = "[" + ((!dynamic_1) ? length_2 : "") + "]";
            var type_4 = subType_1("-index0").type + suffix;
            return function (seed) {
                if (dynamic_1) {
                    length_2 = __1.randomNumber(seed + "-length", 0, 3);
                }
                var children = [];
                for (var i = 0; i < length_2; i++) {
                    children.push(subType_1(seed + "-index" + String(i)));
                }
                return {
                    type: type_4,
                    value: children.map(function (data) { return data.value; })
                };
            };
        }
        // Tuple
        case 9: {
            var count = __1.randomNumber(seed + "-count", 1, 8);
            var subTypes_1 = [];
            for (var i = 0; i < count; i++) {
                var cSeed = seed + "-subtype" + String(i);
                subTypes_1.push(generateTest(cSeed));
            }
            var type_5 = "tuple(" + subTypes_1.map(function (s) { return s("-index0").type; }).join(",") + ")";
            var struct_1 = "Struct" + __1.randomHexString(seed + "-name", 4).substring(2);
            return function (seed) {
                var children = [];
                subTypes_1.forEach(function (subType) {
                    children.push(subType(seed + "-value"));
                });
                return {
                    type: type_5,
                    struct: struct_1,
                    value: children.map(function (c) { return c.value; }),
                };
            };
        }
    }
    throw new Error("bad things");
    return null;
}
// Returns true iff the types are able to be non-standard pack encoded
function checkPack(types) {
    for (var i = 0; i < types.length; i++) {
        var type = types[i];
        if (hasPrefix(type, "tuple")) {
            return false;
        }
        if (hasPrefix(type, "bytes[")) {
            return false;
        }
        if (hasPrefix(type, "string[")) {
            return false;
        }
        var firstDynamic = type.indexOf("[]");
        if (firstDynamic >= 0 && firstDynamic != type.length - 2) {
            return false;
        }
    }
    return true;
}
// Generates a Solidity source files with the parameter types and values
function generateSolidity(params) {
    var plist = [];
    for (var i = 0; i < params.length; i++) {
        plist.push("p" + String(i));
    }
    var genCodes = params.map(function (p) { return getGenCode(p); });
    var code = new Code();
    ///////////////////
    // Pragma
    code.add("pragma experimental ABIEncoderV2;");
    code.add("pragma solidity ^0.5.5;");
    code.add("");
    ///////////////////
    // Header
    code.add("contract Test {");
    ///////////////////
    // Structs
    genCodes.forEach(function (genCode) {
        genCode.structs(code);
    });
    ///////////////////
    // test function
    code.add("function test() public pure returns (" + genCodes.map(function (g, i) { return (g.decl("p" + String(i))); }).join(", ") + ") {");
    genCodes.forEach(function (genCode, index) {
        genCode.assign("p" + index, code);
    });
    code.add("}");
    ///////////////////
    // encode
    code.add("function encode() public pure returns (bytes memory data){");
    code.comment("Declare all parameters");
    genCodes.forEach(function (genCode, index) {
        code.add(genCode.decl("p" + index) + ";");
    });
    code.comment("Assign all parameters");
    genCodes.forEach(function (genCode, index) {
        genCode.assign("p" + index, code);
    });
    code.add("");
    code.add("return abi.encode(" + params.map(function (p, i) { return ("p" + i); }).join(", ") + ");");
    code.add("}");
    ///////////////////
    // encodePacked
    if (checkPack(params.map(function (p) { return p.type; }))) {
        code.add("function encodePacked() public pure returns (bytes memory data){");
        code.comment("Declare all parameters");
        genCodes.forEach(function (genCode, index) {
            code.add(genCode.decl("p" + index) + ";");
        });
        code.comment("Assign all parameters");
        genCodes.forEach(function (genCode, index) {
            genCode.assign("p" + index, code);
        });
        code.add("");
        code.add("return abi.encodePacked(" + params.map(function (p, i) { return ("p" + i); }).join(", ") + ");");
        code.add("}");
    }
    ///////////////////
    // Footer
    code.add("}");
    return code.code;
}
for (var i = 0; i < 100; i++) {
    var params = [];
    console.log(i, __1.randomNumber(String(i) + "-length", 1, 6));
    var length_3 = __1.randomNumber(String(i) + "-length", 1, 6);
    for (var j = 0; j < length_3; j++) {
        params.push(generateTest(String(i) + String(j) + "-type")(String(i) + String(j) + "-test"));
    }
    var solidity = generateSolidity(params);
    console.log(solidity);
    console.log(i);
    var bytecode = cli_1.solc.compile(solidity)[0].bytecode;
    //console.log(params.map(p => p.type).join(", "));
    //console.log(bytecode);
    var testcase = {
        //solidity: solidity,
        bytecode: bytecode,
        types: params.map(function (p) { return p.type; }),
        value: params.map(function (p) { return p.value; }),
    };
    console.log(testcase);
}
