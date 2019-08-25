"use strict";
//let web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8549'));
//import { compile as _compile } from "solc";
import { solc } from "@ethersproject/cli";
import { randomHexString, randomNumber } from "..";
import { BN, keccak256, toChecksumAddress } from "ethereumjs-util";
function hasPrefix(str, prefix) {
    return (str.substring(0, prefix.length) === prefix);
}
function repeat(str, count) {
    let result = "";
    for (let i = 0; i < count; i++) {
        result += str;
    }
    return result;
}
function indent(tabs) {
    let result = '';
    while (result.length < 4 * tabs) {
        result += "    ";
    }
    return result;
}
function getStructName(base) {
    return "Struct" + keccak256(base).slice(0, 4).toString("hex");
}
class Code {
    constructor() {
        this.depth = 0;
        this.lines = [];
    }
    get code() {
        return this.lines.join("\n"); //.replace(/ +\n/g, "\n").replace(/(\}\n\n+)/g, "}\n");
    }
    comment(line) {
        this.add("");
        this.add("/" + "/ " + line);
    }
    add(line) {
        let open = (line.trim().substring(line.trim().length - 1) === "{");
        let close = line.trim()[0] === "}";
        if (close) {
            this.depth--;
        }
        this.lines.push(indent(this.depth) + line);
        //if (close) { this.lines.push(""); }
        if (open) {
            this.depth++;
        }
    }
}
let chars = [];
function addChars(start, length) {
    for (let i = start; i < start + length; i++) {
        chars.push(String.fromCharCode(i));
    }
}
addChars(48, 10);
addChars(65, 26);
// Returns the functions required to generate code for a specific parameter type and value
function getGenCode(testData) {
    let type = testData.type;
    let value = (testData.value != null) ? testData.value : "__crash__";
    let isArray = type.match(/^(.*)(\[[0-9]*\])$/);
    if (isArray) {
        let base = isArray[1];
        let suffix = isArray[2];
        let isDynamic = (isArray[2] === "[]");
        return {
            assign: (name, code) => {
                if (isDynamic) {
                    //let child = getGenCode({ type: base });
                    //let decl = child.decl(name).split(" ");
                    let struct = base;
                    if (type.substring(0, 5) === "tuple") {
                        struct = getStructName(base);
                    }
                    code.add(name + " = new " + struct + "[](" + String(value.length) + ");");
                }
                value.forEach((value, index) => {
                    console.log("SSS", base, value);
                    let child = getGenCode({ type: base, value: value });
                    child.assign(name + "[" + String(index) + "]", code);
                });
            },
            decl: (name) => {
                let child = getGenCode({ type: isArray[1] });
                // Inject the array suffix to the type and add memory location
                //   - uint256 p0       => uint256[] memory p0
                //   - bytes memory p0  => bytes[] memory p0
                let result = child.decl(name).split(" ");
                result[0] = result[0] + suffix;
                if (result[1] !== "memory") {
                    result.splice(1, 0, "memory");
                }
                return result.join(" ");
            },
            structs: (code) => {
                let child = getGenCode({ type: isArray[1] });
                child.structs(code);
            }
        };
    }
    let isTuple = type.match(/^tuple\((.*)\)$/);
    if (isTuple) {
        let children = [];
        // Split up the child types
        let accum = "";
        let balance = 0;
        let types = isTuple[1];
        for (let i = 0; i < types.length; i++) {
            let c = types[i];
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
                    children.push(accum);
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
            children.push(accum);
        }
        return {
            assign: (name, code) => {
                children.forEach((child, index) => {
                    console.log("TT", child, value[index]);
                    getGenCode({
                        type: child,
                        value: value[index]
                    }).assign(name + ".m" + String(index), code);
                });
            },
            decl: (name) => {
                return (getStructName(type) + " memory " + name);
            },
            structs: (code) => {
                // Include any dependency Structs first
                children.forEach((child) => {
                    getGenCode({ type: child }).structs(code);
                });
                // Add this struct
                code.add("struct " + getStructName(type) + " {");
                children.forEach((child, index) => {
                    let decl = getGenCode({
                        type: child
                    }).decl("m" + String(index)).replace(" memory ", " ");
                    code.add(decl + ";");
                });
                code.add("}");
            }
        };
    }
    let isFixedBytes = type.match(/^bytes([0-9]+)$/);
    let isNumber = type.match(/^(u?)int([0-9]*)$/);
    let isFixedNumber = type.match(/^(u?)fixed(([0-9]+)x([0-9]+))?$/);
    if (type === "address" || type === "bool" || isNumber || isFixedNumber || isFixedBytes) {
        return {
            assign: (name, code) => {
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
            decl: (name) => {
                return (type + " " + name);
            },
            structs: (code) => { }
        };
    }
    if (type === "string") {
        return {
            assign: (name, code) => {
                code.add(name + " = " + JSON.stringify(value) + ";");
            },
            decl: (name) => {
                return ("string memory " + name);
            },
            structs: (code) => { }
        };
    }
    if (type === "bytes") {
        let valueBytes = Buffer.from(value.substring(2), "hex");
        return {
            assign: (name, code) => {
                code.add("{");
                code.add("bytes memory temp = new bytes(" + valueBytes.length + ");");
                code.add(name + " = temp;");
                code.add("assembly {");
                // Store the length
                code.add("mstore(temp, " + valueBytes.length + ")");
                // Store each byte
                for (let i = 0; i < valueBytes.length; i++) {
                    code.add("mstore8(add(temp, " + (32 + i) + "), " + valueBytes[i] + ")");
                }
                code.add("}");
                code.add("}");
            },
            decl: (name) => {
                return ("bytes memory " + name);
            },
            structs: (code) => { }
        };
    }
    throw new Error("Could not produce GenCode: " + type);
    return null;
}
// Generates a random type and value for the type
function generateTest(seed) {
    let basetype = randomNumber(seed + "-type", 0, 10);
    switch (basetype) {
        // Address
        case 0:
            return (seed) => {
                let value = toChecksumAddress(randomHexString(seed + "-value", 20));
                return {
                    type: "address",
                    value: value
                };
            };
        // Boolean
        case 1:
            return (seed) => {
                let value = (randomNumber(seed + "-value", 0, 2) ? true : false);
                return {
                    type: "bool",
                    value: value
                };
            };
        // Number
        case 2: {
            let signed = randomNumber(seed + "-signed", 0, 2);
            let width = randomNumber(seed + "-width", 0, 33) * 8;
            let type = (signed ? "" : "u") + "int";
            // Allow base int and uint
            if (width) {
                type += String(width);
            }
            else {
                width = 256;
            }
            return (seed) => {
                let hex = randomHexString(seed + "-value", width / 8).substring(2);
                if (signed) {
                    // Sign bit set (we don't bother with 2's compliment
                    let msb = parseInt(hex[0], 16);
                    if (msb >= 8) {
                        hex = "-" + String(msb & 0x7) + hex.substring(1);
                    }
                }
                let value = (new BN(hex, 16)).toString();
                return {
                    type: type,
                    value: value
                };
            };
        }
        // Fixed
        case 3: {
            // Fixed Point values are not supported yet
            return generateTest(seed + "-next");
            let signed = randomNumber(seed + "-signed", 0, 2);
            let width = randomNumber(seed + "-width", 0, 33) * 8;
            let decimals = 0;
            let maxDecimals = (new BN(repeat("7f", ((width === 0) ? 32 : (width / 8))), 16)).toString().length - 1;
            let attempt = 0;
            while (true) {
                decimals = randomNumber(seed + "-decimals" + String(attempt), 0, 80);
                if (decimals < maxDecimals) {
                    break;
                }
                attempt++;
            }
            let type = (signed ? "" : "u") + "fixed";
            // Allow base int and uint
            if (width) {
                type += String(width) + "x" + String(decimals);
            }
            else {
                width = 128;
                decimals = 18;
            }
            return (seed) => {
                let hex = randomHexString(seed + "-value", width / 8).substring(2);
                // Use the top bit to indicate negative values
                let negative = false;
                if (signed) {
                    // Sign bit set (we don't bother with 2's compliment
                    let msb = parseInt(hex[0], 16);
                    if (msb >= 8) {
                        hex = String(msb & 0x7) + hex.substring(1);
                        negative = true;
                    }
                }
                // Zero-pad the value so we get at least 1 whole digit
                let dec = (new BN(hex, 16)).toString();
                while (dec.length < decimals + 1) {
                    dec = "0" + dec;
                }
                // Split the decimals with the decimal point
                let split = dec.length - decimals;
                let value = dec.substring(0, split) + "." + dec.substring(split);
                if (negative) {
                    value = "-" + value;
                }
                // Prevent ending in a decimal (e.g. "45."
                if (value.substring(value.length - 1) === ".") {
                    value = value.substring(0, value.length - 1);
                }
                return {
                    type: type,
                    value: value
                };
            };
        }
        // BytesXX
        case 4: {
            let length = randomNumber(seed + "-length", 1, 33);
            let type = "bytes" + String(length);
            return (seed) => {
                let value = randomHexString(seed + "-value", length);
                return {
                    type: type,
                    value: value
                };
            };
        }
        // String
        case 5:
            return (seed) => {
                let length = randomNumber(seed + "-length", 0, 36);
                let value = "";
                while (value.length < length) {
                    value += chars[randomNumber(seed + "-value" + String(value.length), 0, chars.length)];
                }
                return {
                    type: "string",
                    value: value
                };
            };
        // Bytes
        case 6:
            return (seed) => {
                let length = randomNumber(seed + "-length", 0, 12); // @TODO: increase this
                let value = randomHexString(seed + "-value", length);
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
            let dynamic = (basetype === 8);
            let subType = generateTest(seed + "-subtype");
            let length = randomNumber(seed + "-length", 1, 3);
            let suffix = "[" + ((!dynamic) ? length : "") + "]";
            let type = subType("-index0").type + suffix;
            return (seed) => {
                if (dynamic) {
                    length = randomNumber(seed + "-length", 0, 3);
                }
                let children = [];
                for (let i = 0; i < length; i++) {
                    children.push(subType(seed + "-index" + String(i)));
                }
                return {
                    type: type,
                    value: children.map((data) => data.value)
                };
            };
        }
        // Tuple
        case 9: {
            let count = randomNumber(seed + "-count", 1, 8);
            let subTypes = [];
            for (let i = 0; i < count; i++) {
                let cSeed = seed + "-subtype" + String(i);
                subTypes.push(generateTest(cSeed));
            }
            let type = "tuple(" + subTypes.map(s => s("-index0").type).join(",") + ")";
            let struct = "Struct" + randomHexString(seed + "-name", 4).substring(2);
            return (seed) => {
                let children = [];
                subTypes.forEach((subType) => {
                    children.push(subType(seed + "-value"));
                });
                return {
                    type: type,
                    struct: struct,
                    value: children.map(c => c.value),
                };
            };
        }
    }
    throw new Error("bad things");
    return null;
}
// Returns true iff the types are able to be non-standard pack encoded
function checkPack(types) {
    for (let i = 0; i < types.length; i++) {
        let type = types[i];
        if (hasPrefix(type, "tuple")) {
            return false;
        }
        if (hasPrefix(type, "bytes[")) {
            return false;
        }
        if (hasPrefix(type, "string[")) {
            return false;
        }
        let firstDynamic = type.indexOf("[]");
        if (firstDynamic >= 0 && firstDynamic != type.length - 2) {
            return false;
        }
    }
    return true;
}
// Generates a Solidity source files with the parameter types and values
function generateSolidity(params) {
    let plist = [];
    for (let i = 0; i < params.length; i++) {
        plist.push("p" + String(i));
    }
    let genCodes = params.map(p => getGenCode(p));
    let code = new Code();
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
    genCodes.forEach((genCode) => {
        genCode.structs(code);
    });
    ///////////////////
    // test function
    code.add("function test() public pure returns (" + genCodes.map((g, i) => (g.decl("p" + String(i)))).join(", ") + ") {");
    genCodes.forEach((genCode, index) => {
        genCode.assign("p" + index, code);
    });
    code.add("}");
    ///////////////////
    // encode
    code.add("function encode() public pure returns (bytes memory data){");
    code.comment("Declare all parameters");
    genCodes.forEach((genCode, index) => {
        code.add(genCode.decl("p" + index) + ";");
    });
    code.comment("Assign all parameters");
    genCodes.forEach((genCode, index) => {
        genCode.assign("p" + index, code);
    });
    code.add("");
    code.add("return abi.encode(" + params.map((p, i) => ("p" + i)).join(", ") + ");");
    code.add("}");
    ///////////////////
    // encodePacked
    if (checkPack(params.map(p => p.type))) {
        code.add("function encodePacked() public pure returns (bytes memory data){");
        code.comment("Declare all parameters");
        genCodes.forEach((genCode, index) => {
            code.add(genCode.decl("p" + index) + ";");
        });
        code.comment("Assign all parameters");
        genCodes.forEach((genCode, index) => {
            genCode.assign("p" + index, code);
        });
        code.add("");
        code.add("return abi.encodePacked(" + params.map((p, i) => ("p" + i)).join(", ") + ");");
        code.add("}");
    }
    ///////////////////
    // Footer
    code.add("}");
    return code.code;
}
for (let i = 0; i < 100; i++) {
    let params = [];
    console.log(i, randomNumber(String(i) + "-length", 1, 6));
    let length = randomNumber(String(i) + "-length", 1, 6);
    for (let j = 0; j < length; j++) {
        params.push(generateTest(String(i) + String(j) + "-type")(String(i) + String(j) + "-test"));
    }
    let solidity = generateSolidity(params);
    console.log(solidity);
    console.log(i);
    let bytecode = solc.compile(solidity)[0].bytecode;
    //console.log(params.map(p => p.type).join(", "));
    //console.log(bytecode);
    let testcase = {
        //solidity: solidity,
        bytecode: bytecode,
        types: params.map(p => p.type),
        value: params.map(p => p.value),
    };
    console.log(testcase);
}
