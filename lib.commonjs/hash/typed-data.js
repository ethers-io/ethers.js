"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypedDataEncoder = void 0;
//import { TypedDataDomain, TypedDataField } from "@ethersproject/providerabstract-signer";
const index_js_1 = require("../address/index.js");
const index_js_2 = require("../crypto/index.js");
const index_js_3 = require("../utils/index.js");
const id_js_1 = require("./id.js");
const logger_js_1 = require("../utils/logger.js");
const padding = new Uint8Array(32);
padding.fill(0);
const BN__1 = BigInt(-1);
const BN_0 = BigInt(0);
const BN_1 = BigInt(1);
const BN_MAX_UINT256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
;
;
function hexPadRight(value) {
    const bytes = logger_js_1.logger.getBytes(value);
    const padOffset = bytes.length % 32;
    if (padOffset) {
        return (0, index_js_3.concat)([bytes, padding.slice(padOffset)]);
    }
    return (0, index_js_3.hexlify)(bytes);
}
const hexTrue = (0, index_js_3.toHex)(BN_1, 32);
const hexFalse = (0, index_js_3.toHex)(BN_0, 32);
const domainFieldTypes = {
    name: "string",
    version: "string",
    chainId: "uint256",
    verifyingContract: "address",
    salt: "bytes32"
};
const domainFieldNames = [
    "name", "version", "chainId", "verifyingContract", "salt"
];
function checkString(key) {
    return function (value) {
        if (typeof (value) !== "string") {
            logger_js_1.logger.throwArgumentError(`invalid domain value for ${JSON.stringify(key)}`, `domain.${key}`, value);
        }
        return value;
    };
}
const domainChecks = {
    name: checkString("name"),
    version: checkString("version"),
    chainId: function (value) {
        return logger_js_1.logger.getBigInt(value, "domain.chainId");
    },
    verifyingContract: function (value) {
        try {
            return (0, index_js_1.getAddress)(value).toLowerCase();
        }
        catch (error) { }
        return logger_js_1.logger.throwArgumentError(`invalid domain value "verifyingContract"`, "domain.verifyingContract", value);
    },
    salt: function (value) {
        const bytes = logger_js_1.logger.getBytes(value, "domain.salt");
        if (bytes.length !== 32) {
            logger_js_1.logger.throwArgumentError(`invalid domain value "salt"`, "domain.salt", value);
        }
        return (0, index_js_3.hexlify)(bytes);
    }
};
function getBaseEncoder(type) {
    // intXX and uintXX
    {
        const match = type.match(/^(u?)int(\d*)$/);
        if (match) {
            const signed = (match[1] === "");
            const width = parseInt(match[2] || "256");
            if (width % 8 !== 0 || width > 256 || (match[2] && match[2] !== String(width))) {
                logger_js_1.logger.throwArgumentError("invalid numeric width", "type", type);
            }
            const boundsUpper = (0, index_js_3.mask)(BN_MAX_UINT256, signed ? (width - 1) : width);
            const boundsLower = signed ? ((boundsUpper + BN_1) * BN__1) : BN_0;
            return function (_value) {
                const value = logger_js_1.logger.getBigInt(_value, "value");
                if (value < boundsLower || value > boundsUpper) {
                    logger_js_1.logger.throwArgumentError(`value out-of-bounds for ${type}`, "value", value);
                }
                return (0, index_js_3.toHex)((0, index_js_3.toTwos)(value, 256), 32);
            };
        }
    }
    // bytesXX
    {
        const match = type.match(/^bytes(\d+)$/);
        if (match) {
            const width = parseInt(match[1]);
            if (width === 0 || width > 32 || match[1] !== String(width)) {
                logger_js_1.logger.throwArgumentError("invalid bytes width", "type", type);
            }
            return function (value) {
                const bytes = logger_js_1.logger.getBytes(value);
                if (bytes.length !== width) {
                    logger_js_1.logger.throwArgumentError(`invalid length for ${type}`, "value", value);
                }
                return hexPadRight(value);
            };
        }
    }
    switch (type) {
        case "address": return function (value) {
            return (0, index_js_3.zeroPadValue)((0, index_js_1.getAddress)(value), 32);
        };
        case "bool": return function (value) {
            return ((!value) ? hexFalse : hexTrue);
        };
        case "bytes": return function (value) {
            return (0, index_js_2.keccak256)(value);
        };
        case "string": return function (value) {
            return (0, id_js_1.id)(value);
        };
    }
    return null;
}
function encodeType(name, fields) {
    return `${name}(${fields.map(({ name, type }) => (type + " " + name)).join(",")})`;
}
class TypedDataEncoder {
    primaryType;
    #types;
    get types() {
        return JSON.parse(this.#types);
    }
    #fullTypes;
    #encoderCache;
    constructor(types) {
        this.#types = JSON.stringify(types);
        this.#fullTypes = new Map();
        this.#encoderCache = new Map();
        // Link struct types to their direct child structs
        const links = new Map();
        // Link structs to structs which contain them as a child
        const parents = new Map();
        // Link all subtypes within a given struct
        const subtypes = new Map();
        Object.keys(types).forEach((type) => {
            links.set(type, new Set());
            parents.set(type, []);
            subtypes.set(type, new Set());
        });
        for (const name in types) {
            const uniqueNames = new Set();
            for (const field of types[name]) {
                // Check each field has a unique name
                if (uniqueNames.has(field.name)) {
                    logger_js_1.logger.throwArgumentError(`duplicate variable name ${JSON.stringify(field.name)} in ${JSON.stringify(name)}`, "types", types);
                }
                uniqueNames.add(field.name);
                // Get the base type (drop any array specifiers)
                const baseType = (field.type.match(/^([^\x5b]*)(\x5b|$)/))[1] || null;
                if (baseType === name) {
                    logger_js_1.logger.throwArgumentError(`circular type reference to ${JSON.stringify(baseType)}`, "types", types);
                }
                // Is this a base encoding type?
                const encoder = getBaseEncoder(baseType);
                if (encoder) {
                    continue;
                }
                if (!parents.has(baseType)) {
                    logger_js_1.logger.throwArgumentError(`unknown type ${JSON.stringify(baseType)}`, "types", types);
                }
                // Add linkage
                parents.get(baseType).push(name);
                links.get(name).add(baseType);
            }
        }
        // Deduce the primary type
        const primaryTypes = Array.from(parents.keys()).filter((n) => (parents.get(n).length === 0));
        if (primaryTypes.length === 0) {
            logger_js_1.logger.throwArgumentError("missing primary type", "types", types);
        }
        else if (primaryTypes.length > 1) {
            logger_js_1.logger.throwArgumentError(`ambiguous primary types or unused types: ${primaryTypes.map((t) => (JSON.stringify(t))).join(", ")}`, "types", types);
        }
        (0, index_js_3.defineProperties)(this, { primaryType: primaryTypes[0] });
        // Check for circular type references
        function checkCircular(type, found) {
            if (found.has(type)) {
                logger_js_1.logger.throwArgumentError(`circular type reference to ${JSON.stringify(type)}`, "types", types);
            }
            found.add(type);
            for (const child of links.get(type)) {
                if (!parents.has(child)) {
                    continue;
                }
                // Recursively check children
                checkCircular(child, found);
                // Mark all ancestors as having this decendant
                for (const subtype of found) {
                    subtypes.get(subtype).add(child);
                }
            }
            found.delete(type);
        }
        checkCircular(this.primaryType, new Set());
        // Compute each fully describe type
        for (const [name, set] of subtypes) {
            const st = Array.from(set);
            st.sort();
            this.#fullTypes.set(name, encodeType(name, types[name]) + st.map((t) => encodeType(t, types[t])).join(""));
        }
    }
    getEncoder(type) {
        let encoder = this.#encoderCache.get(type);
        if (!encoder) {
            encoder = this.#getEncoder(type);
            this.#encoderCache.set(type, encoder);
        }
        return encoder;
    }
    #getEncoder(type) {
        // Basic encoder type (address, bool, uint256, etc)
        {
            const encoder = getBaseEncoder(type);
            if (encoder) {
                return encoder;
            }
        }
        // Array
        const match = type.match(/^(.*)(\x5b(\d*)\x5d)$/);
        if (match) {
            const subtype = match[1];
            const subEncoder = this.getEncoder(subtype);
            const length = parseInt(match[3]);
            return (value) => {
                if (length >= 0 && value.length !== length) {
                    logger_js_1.logger.throwArgumentError("array length mismatch; expected length ${ arrayLength }", "value", value);
                }
                let result = value.map(subEncoder);
                if (this.#fullTypes.has(subtype)) {
                    result = result.map(index_js_2.keccak256);
                }
                return (0, index_js_2.keccak256)((0, index_js_3.concat)(result));
            };
        }
        // Struct
        const fields = this.types[type];
        if (fields) {
            const encodedType = (0, id_js_1.id)(this.#fullTypes.get(type));
            return (value) => {
                const values = fields.map(({ name, type }) => {
                    const result = this.getEncoder(type)(value[name]);
                    if (this.#fullTypes.has(type)) {
                        return (0, index_js_2.keccak256)(result);
                    }
                    return result;
                });
                values.unshift(encodedType);
                return (0, index_js_3.concat)(values);
            };
        }
        return logger_js_1.logger.throwArgumentError(`unknown type: ${type}`, "type", type);
    }
    encodeType(name) {
        const result = this.#fullTypes.get(name);
        if (!result) {
            return logger_js_1.logger.throwArgumentError(`unknown type: ${JSON.stringify(name)}`, "name", name);
        }
        return result;
    }
    encodeData(type, value) {
        return this.getEncoder(type)(value);
    }
    hashStruct(name, value) {
        return (0, index_js_2.keccak256)(this.encodeData(name, value));
    }
    encode(value) {
        return this.encodeData(this.primaryType, value);
    }
    hash(value) {
        return this.hashStruct(this.primaryType, value);
    }
    _visit(type, value, callback) {
        // Basic encoder type (address, bool, uint256, etc)
        {
            const encoder = getBaseEncoder(type);
            if (encoder) {
                return callback(type, value);
            }
        }
        // Array
        const match = type.match(/^(.*)(\x5b(\d*)\x5d)$/);
        if (match) {
            const subtype = match[1];
            const length = parseInt(match[3]);
            if (length >= 0 && value.length !== length) {
                logger_js_1.logger.throwArgumentError("array length mismatch; expected length ${ arrayLength }", "value", value);
            }
            return value.map((v) => this._visit(subtype, v, callback));
        }
        // Struct
        const fields = this.types[type];
        if (fields) {
            return fields.reduce((accum, { name, type }) => {
                accum[name] = this._visit(type, value[name], callback);
                return accum;
            }, {});
        }
        return logger_js_1.logger.throwArgumentError(`unknown type: ${type}`, "type", type);
    }
    visit(value, callback) {
        return this._visit(this.primaryType, value, callback);
    }
    static from(types) {
        return new TypedDataEncoder(types);
    }
    static getPrimaryType(types) {
        return TypedDataEncoder.from(types).primaryType;
    }
    static hashStruct(name, types, value) {
        return TypedDataEncoder.from(types).hashStruct(name, value);
    }
    static hashDomain(domain) {
        const domainFields = [];
        for (const name in domain) {
            const type = domainFieldTypes[name];
            if (!type) {
                logger_js_1.logger.throwArgumentError(`invalid typed-data domain key: ${JSON.stringify(name)}`, "domain", domain);
            }
            domainFields.push({ name, type });
        }
        domainFields.sort((a, b) => {
            return domainFieldNames.indexOf(a.name) - domainFieldNames.indexOf(b.name);
        });
        return TypedDataEncoder.hashStruct("EIP712Domain", { EIP712Domain: domainFields }, domain);
    }
    static encode(domain, types, value) {
        return (0, index_js_3.concat)([
            "0x1901",
            TypedDataEncoder.hashDomain(domain),
            TypedDataEncoder.from(types).hash(value)
        ]);
    }
    static hash(domain, types, value) {
        return (0, index_js_2.keccak256)(TypedDataEncoder.encode(domain, types, value));
    }
    // Replaces all address types with ENS names with their looked up address
    static async resolveNames(domain, types, value, resolveName) {
        // Make a copy to isolate it from the object passed in
        domain = Object.assign({}, domain);
        // Look up all ENS names
        const ensCache = {};
        // Do we need to look up the domain's verifyingContract?
        if (domain.verifyingContract && !(0, index_js_3.isHexString)(domain.verifyingContract, 20)) {
            ensCache[domain.verifyingContract] = "0x";
        }
        // We are going to use the encoder to visit all the base values
        const encoder = TypedDataEncoder.from(types);
        // Get a list of all the addresses
        encoder.visit(value, (type, value) => {
            if (type === "address" && !(0, index_js_3.isHexString)(value, 20)) {
                ensCache[value] = "0x";
            }
            return value;
        });
        // Lookup each name
        for (const name in ensCache) {
            ensCache[name] = await resolveName(name);
        }
        // Replace the domain verifyingContract if needed
        if (domain.verifyingContract && ensCache[domain.verifyingContract]) {
            domain.verifyingContract = ensCache[domain.verifyingContract];
        }
        // Replace all ENS names with their address
        value = encoder.visit(value, (type, value) => {
            if (type === "address" && ensCache[value]) {
                return ensCache[value];
            }
            return value;
        });
        return { domain, value };
    }
    static getPayload(domain, types, value) {
        // Validate the domain fields
        TypedDataEncoder.hashDomain(domain);
        // Derive the EIP712Domain Struct reference type
        const domainValues = {};
        const domainTypes = [];
        domainFieldNames.forEach((name) => {
            const value = domain[name];
            if (value == null) {
                return;
            }
            domainValues[name] = domainChecks[name](value);
            domainTypes.push({ name, type: domainFieldTypes[name] });
        });
        const encoder = TypedDataEncoder.from(types);
        const typesWithDomain = Object.assign({}, types);
        if (typesWithDomain.EIP712Domain) {
            logger_js_1.logger.throwArgumentError("types must not contain EIP712Domain type", "types.EIP712Domain", types);
        }
        else {
            typesWithDomain.EIP712Domain = domainTypes;
        }
        // Validate the data structures and types
        encoder.encode(value);
        return {
            types: typesWithDomain,
            domain: domainValues,
            primaryType: encoder.primaryType,
            message: encoder.visit(value, (type, value) => {
                // bytes
                if (type.match(/^bytes(\d*)/)) {
                    return (0, index_js_3.hexlify)(logger_js_1.logger.getBytes(value));
                }
                // uint or int
                if (type.match(/^u?int/)) {
                    return logger_js_1.logger.getBigInt(value).toString();
                }
                switch (type) {
                    case "address":
                        return value.toLowerCase();
                    case "bool":
                        return !!value;
                    case "string":
                        if (typeof (value) !== "string") {
                            logger_js_1.logger.throwArgumentError(`invalid string`, "value", value);
                        }
                        return value;
                }
                return logger_js_1.logger.throwArgumentError("unsupported type", "type", type);
            })
        };
    }
}
exports.TypedDataEncoder = TypedDataEncoder;
//# sourceMappingURL=typed-data.js.map