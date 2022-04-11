var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _TypedDataEncoder_instances, _TypedDataEncoder_types, _TypedDataEncoder_fullTypes, _TypedDataEncoder_encoderCache, _TypedDataEncoder_getEncoder;
//import { TypedDataDomain, TypedDataField } from "@ethersproject/providerabstract-signer";
import { getAddress } from "@ethersproject/address";
import { arrayify, concat, hexlify, zeroPadLeft, isHexString } from "@ethersproject/bytes";
import { keccak256 } from "@ethersproject/crypto";
import { defineProperties } from "@ethersproject/properties";
import { mask, toHex, toTwos } from "@ethersproject/math";
import { id } from "./id.js";
import { logger } from "./logger.js";
const padding = new Uint8Array(32);
padding.fill(0);
const BN__1 = BigInt(-1);
const BN_0 = BigInt(0);
const BN_1 = BigInt(1);
const BN_MAX_UINT256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
;
;
function hexPadRight(value) {
    const bytes = arrayify(value);
    const padOffset = bytes.length % 32;
    if (padOffset) {
        return concat([bytes, padding.slice(padOffset)]);
    }
    return hexlify(bytes);
}
const hexTrue = toHex(BN_1, 32);
const hexFalse = toHex(BN_0, 32);
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
            logger.throwArgumentError(`invalid domain value for ${JSON.stringify(key)}`, `domain.${key}`, value);
        }
        return value;
    };
}
const domainChecks = {
    name: checkString("name"),
    version: checkString("version"),
    chainId: function (value) {
        return logger.getBigInt(value, "domain.chainId");
    },
    verifyingContract: function (value) {
        try {
            return getAddress(value).toLowerCase();
        }
        catch (error) { }
        return logger.throwArgumentError(`invalid domain value "verifyingContract"`, "domain.verifyingContract", value);
    },
    salt: function (value) {
        const bytes = logger.getBytes(value, "domain.salt");
        if (bytes.length !== 32) {
            logger.throwArgumentError(`invalid domain value "salt"`, "domain.salt", value);
        }
        return hexlify(bytes);
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
                logger.throwArgumentError("invalid numeric width", "type", type);
            }
            const boundsUpper = mask(BN_MAX_UINT256, signed ? (width - 1) : width);
            const boundsLower = signed ? ((boundsUpper + BN_1) * BN__1) : BN_0;
            return function (_value) {
                const value = logger.getBigInt(_value, "value");
                if (value < boundsLower || value > boundsUpper) {
                    logger.throwArgumentError(`value out-of-bounds for ${type}`, "value", value);
                }
                return toHex(toTwos(value, 256), 32);
            };
        }
    }
    // bytesXX
    {
        const match = type.match(/^bytes(\d+)$/);
        if (match) {
            const width = parseInt(match[1]);
            if (width === 0 || width > 32 || match[1] !== String(width)) {
                logger.throwArgumentError("invalid bytes width", "type", type);
            }
            return function (value) {
                const bytes = arrayify(value);
                if (bytes.length !== width) {
                    logger.throwArgumentError(`invalid length for ${type}`, "value", value);
                }
                return hexPadRight(value);
            };
        }
    }
    switch (type) {
        case "address": return function (value) {
            return zeroPadLeft(getAddress(value), 32);
        };
        case "bool": return function (value) {
            return ((!value) ? hexFalse : hexTrue);
        };
        case "bytes": return function (value) {
            return keccak256(value);
        };
        case "string": return function (value) {
            return id(value);
        };
    }
    return null;
}
function encodeType(name, fields) {
    return `${name}(${fields.map(({ name, type }) => (type + " " + name)).join(",")})`;
}
export class TypedDataEncoder {
    constructor(types) {
        _TypedDataEncoder_instances.add(this);
        _TypedDataEncoder_types.set(this, void 0);
        _TypedDataEncoder_fullTypes.set(this, void 0);
        _TypedDataEncoder_encoderCache.set(this, void 0);
        __classPrivateFieldSet(this, _TypedDataEncoder_types, JSON.stringify(types), "f");
        __classPrivateFieldSet(this, _TypedDataEncoder_fullTypes, new Map(), "f");
        __classPrivateFieldSet(this, _TypedDataEncoder_encoderCache, new Map(), "f");
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
                    logger.throwArgumentError(`duplicate variable name ${JSON.stringify(field.name)} in ${JSON.stringify(name)}`, "types", types);
                }
                uniqueNames.add(field.name);
                // Get the base type (drop any array specifiers)
                const baseType = (field.type.match(/^([^\x5b]*)(\x5b|$)/))[1] || null;
                if (baseType === name) {
                    logger.throwArgumentError(`circular type reference to ${JSON.stringify(baseType)}`, "types", types);
                }
                // Is this a base encoding type?
                const encoder = getBaseEncoder(baseType);
                if (encoder) {
                    continue;
                }
                if (!parents.has(baseType)) {
                    logger.throwArgumentError(`unknown type ${JSON.stringify(baseType)}`, "types", types);
                }
                // Add linkage
                parents.get(baseType).push(name);
                links.get(name).add(baseType);
            }
        }
        // Deduce the primary type
        const primaryTypes = Array.from(parents.keys()).filter((n) => (parents.get(n).length === 0));
        if (primaryTypes.length === 0) {
            logger.throwArgumentError("missing primary type", "types", types);
        }
        else if (primaryTypes.length > 1) {
            logger.throwArgumentError(`ambiguous primary types or unused types: ${primaryTypes.map((t) => (JSON.stringify(t))).join(", ")}`, "types", types);
        }
        defineProperties(this, { primaryType: primaryTypes[0] });
        // Check for circular type references
        function checkCircular(type, found) {
            if (found.has(type)) {
                logger.throwArgumentError(`circular type reference to ${JSON.stringify(type)}`, "types", types);
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
            __classPrivateFieldGet(this, _TypedDataEncoder_fullTypes, "f").set(name, encodeType(name, types[name]) + st.map((t) => encodeType(t, types[t])).join(""));
        }
    }
    get types() {
        return JSON.parse(__classPrivateFieldGet(this, _TypedDataEncoder_types, "f"));
    }
    getEncoder(type) {
        let encoder = __classPrivateFieldGet(this, _TypedDataEncoder_encoderCache, "f").get(type);
        if (!encoder) {
            encoder = __classPrivateFieldGet(this, _TypedDataEncoder_instances, "m", _TypedDataEncoder_getEncoder).call(this, type);
            __classPrivateFieldGet(this, _TypedDataEncoder_encoderCache, "f").set(type, encoder);
        }
        return encoder;
    }
    encodeType(name) {
        const result = __classPrivateFieldGet(this, _TypedDataEncoder_fullTypes, "f").get(name);
        if (!result) {
            return logger.throwArgumentError(`unknown type: ${JSON.stringify(name)}`, "name", name);
        }
        return result;
    }
    encodeData(type, value) {
        return this.getEncoder(type)(value);
    }
    hashStruct(name, value) {
        return keccak256(this.encodeData(name, value));
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
                logger.throwArgumentError("array length mismatch; expected length ${ arrayLength }", "value", value);
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
        return logger.throwArgumentError(`unknown type: ${type}`, "type", type);
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
                logger.throwArgumentError(`invalid typed-data domain key: ${JSON.stringify(name)}`, "domain", domain);
            }
            domainFields.push({ name, type });
        }
        domainFields.sort((a, b) => {
            return domainFieldNames.indexOf(a.name) - domainFieldNames.indexOf(b.name);
        });
        return TypedDataEncoder.hashStruct("EIP712Domain", { EIP712Domain: domainFields }, domain);
    }
    static encode(domain, types, value) {
        return concat([
            "0x1901",
            TypedDataEncoder.hashDomain(domain),
            TypedDataEncoder.from(types).hash(value)
        ]);
    }
    static hash(domain, types, value) {
        return keccak256(TypedDataEncoder.encode(domain, types, value));
    }
    // Replaces all address types with ENS names with their looked up address
    static async resolveNames(domain, types, value, resolveName) {
        // Make a copy to isolate it from the object passed in
        domain = Object.assign({}, domain);
        // Look up all ENS names
        const ensCache = {};
        // Do we need to look up the domain's verifyingContract?
        if (domain.verifyingContract && !isHexString(domain.verifyingContract, 20)) {
            ensCache[domain.verifyingContract] = "0x";
        }
        // We are going to use the encoder to visit all the base values
        const encoder = TypedDataEncoder.from(types);
        // Get a list of all the addresses
        encoder.visit(value, (type, value) => {
            if (type === "address" && !isHexString(value, 20)) {
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
            logger.throwArgumentError("types must not contain EIP712Domain type", "types.EIP712Domain", types);
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
                    return hexlify(logger.getBytes(value));
                }
                // uint or int
                if (type.match(/^u?int/)) {
                    return logger.getBigInt(value).toString();
                }
                switch (type) {
                    case "address":
                        return value.toLowerCase();
                    case "bool":
                        return !!value;
                    case "string":
                        if (typeof (value) !== "string") {
                            logger.throwArgumentError(`invalid string`, "value", value);
                        }
                        return value;
                }
                return logger.throwArgumentError("unsupported type", "type", type);
            })
        };
    }
}
_TypedDataEncoder_types = new WeakMap(), _TypedDataEncoder_fullTypes = new WeakMap(), _TypedDataEncoder_encoderCache = new WeakMap(), _TypedDataEncoder_instances = new WeakSet(), _TypedDataEncoder_getEncoder = function _TypedDataEncoder_getEncoder(type) {
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
                logger.throwArgumentError("array length mismatch; expected length ${ arrayLength }", "value", value);
            }
            let result = value.map(subEncoder);
            if (__classPrivateFieldGet(this, _TypedDataEncoder_fullTypes, "f").has(subtype)) {
                result = result.map(keccak256);
            }
            return keccak256(concat(result));
        };
    }
    // Struct
    const fields = this.types[type];
    if (fields) {
        const encodedType = id(__classPrivateFieldGet(this, _TypedDataEncoder_fullTypes, "f").get(type));
        return (value) => {
            const values = fields.map(({ name, type }) => {
                const result = this.getEncoder(type)(value[name]);
                if (__classPrivateFieldGet(this, _TypedDataEncoder_fullTypes, "f").has(type)) {
                    return keccak256(result);
                }
                return result;
            });
            values.unshift(encodedType);
            return concat(values);
        };
    }
    return logger.throwArgumentError(`unknown type: ${type}`, "type", type);
};
//# sourceMappingURL=typed-data.js.map