import { TypedDataDomain, TypedDataField } from "@ethersproject/abstract-signer";
import { getAddress } from "@ethersproject/address";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { arrayify, BytesLike, concat, hexConcat, hexZeroPad } from "@ethersproject/bytes";
import { keccak256 } from "@ethersproject/keccak256";
import { deepCopy, defineReadOnly } from "@ethersproject/properties";

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);

import { id } from "./id";

const padding = new Uint8Array(32);
padding.fill(0);

const NegativeOne: BigNumber = BigNumber.from(-1);
const Zero: BigNumber = BigNumber.from(0);
const One: BigNumber = BigNumber.from(1);
const MaxUint256: BigNumber = BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");

function hexPadRight(value: BytesLike) {
    const bytes = arrayify(value);
    return hexConcat([ bytes, padding.slice(bytes.length % 32) ]);
}

const hexTrue = hexZeroPad(One.toHexString(), 32);
const hexFalse = hexZeroPad(Zero.toHexString(), 32);

const domainFieldTypes: Record<string, string> = {
    name: "string",
    version: "string",
    chainId: "uint256",
    verifyingContract: "address",
    salt: "bytes32"
};

function getBaseEncoder(type: string): (value: any) => string {
    // intXX and uintXX
    {
        const match = type.match(/^(u?)int(\d+)$/);
        if (match) {
            const width = parseInt(match[2]);
            if (width % 8 !== 0 || width > 256 || match[2] !== String(width)) {
                logger.throwArgumentError("invalid numeric width", "type", type);
            }
            const signed = (match[1] === "");

            return function(value: BigNumberish) {
                let v = BigNumber.from(value);

                if (signed) {
                    let bounds = MaxUint256.mask(width - 1);
                    if (v.gt(bounds) || v.lt(bounds.add(One).mul(NegativeOne))) {
                        logger.throwArgumentError(`value out-of-bounds for ${ type }`, "value", value);
                    }
                } else if (v.lt(Zero) || v.gt(MaxUint256.mask(width))) {
                    logger.throwArgumentError(`value out-of-bounds for ${ type }`, "value", value);
                }

                v = v.toTwos(256);

                return hexZeroPad(v.toHexString(), 32);
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
            return function(value: BytesLike) {
                const bytes = arrayify(value);
                if (bytes.length !== width) {
                    logger.throwArgumentError(`invalid length for ${ type }`, "value", value);
                }
                return hexPadRight(value);
            };
        }
    }

    switch (type) {
        case "address": return function(value: string) {
            return hexZeroPad(getAddress(value), 32);
        };
        case "bool": return function(value: boolean) {
            return ((!value) ? hexFalse: hexTrue);
        };
        case "bytes": return function(value: BytesLike) {
            return keccak256(value);
        };
        case "string": return function(value: string) {
            return id(value);
        };
    }

    return null;
}

function encodeType(name: string, fields: Array<TypedDataField>): string {
    return `${ name }(${ fields.map((f) => (f.type + " " + f.name)).join(",") })`;
}

export class TypedDataEncoder {
    readonly primaryType: string;
    readonly types: Record<string, Array<TypedDataField>>;

    readonly _encoderCache: Record<string, (value: any) => string>;
    readonly _types: Record<string, string>;

    constructor(types: Record<string, Array<TypedDataField>>) {
        defineReadOnly(this, "types", Object.freeze(deepCopy(types)));

        defineReadOnly(this, "_encoderCache", { });
        defineReadOnly(this, "_types", { });

        // Link struct types to their direct child structs
        const links: Record<string, Record<string, boolean>> = { };

        // Link structs to structs which contain them as a child
        const parents: Record<string, Array<string>> = { };

        // Link all subtypes within a given struct
        const subtypes: Record<string, Record<string, boolean>> = { };

        Object.keys(types).forEach((type) => {
            links[type] = { };
            parents[type] = [ ];
            subtypes[type] = { }
        });

        for (const name in types) {

            const uniqueNames: Record<string, boolean> = { };

            types[name].forEach((field) => {

                // Check each field has a unique name
                if (uniqueNames[field.name]) {
                    logger.throwArgumentError(`duplicate variable name ${ JSON.stringify(field.name) } in ${ JSON.stringify(name) }`, "types", types);
                }
                uniqueNames[field.name] = true;

                // Get the base type (drop any array specifiers)
                const baseType = field.type.match(/^([^\x5b]*)(\x5b|$)/)[1];
                if (baseType === name) {
                    logger.throwArgumentError(`circular type reference to ${ JSON.stringify(baseType) }`, "types", types);
                }

                // Is this a base encoding type?
                const encoder = getBaseEncoder(baseType);
                if (encoder) { return ;}

                if (!parents[baseType]) {
                    logger.throwArgumentError(`unknown type ${ JSON.stringify(baseType) }`, "types", types);
                }

                // Add linkage
                parents[baseType].push(name);
                links[name][baseType] = true;
            });
        }

        // Deduce the primary type
        const primaryTypes = Object.keys(parents).filter((n) => (parents[n].length === 0));

        if (primaryTypes.length === 0) {
            logger.throwArgumentError("missing primary type", "types", types);
        } else if (primaryTypes.length > 1) {
            logger.throwArgumentError(`ambiguous primary types or unused types: ${ primaryTypes.map((t) => (JSON.stringify(t))).join(", ") }`, "types", types);
        }

        defineReadOnly(this, "primaryType", primaryTypes[0]);

        // Check for circular type references
        function checkCircular(type: string, found: Record<string, boolean>) {
            if (found[type]) {
                logger.throwArgumentError(`circular type reference to ${ JSON.stringify(type) }`, "types", types);
            }

            found[type] = true;

            Object.keys(links[type]).forEach((child) => {
                if (!parents[child]) { return; }

                // Recursively check children
                checkCircular(child, found);

                // Mark all ancestors as having this decendant
                Object.keys(found).forEach((subtype) => {
                    subtypes[subtype][child] = true;
                });
            });

            delete found[type];
        }
        checkCircular(this.primaryType, { });

        // Compute each fully describe type
        for (const name in subtypes) {
            const st = Object.keys(subtypes[name]);
            st.sort();
            this._types[name] = encodeType(name, types[name]) + st.map((t) => encodeType(t, types[t])).join("");
        }
    }

    getEncoder(type: string): (value: any) => string {
        let encoder = this._encoderCache[type];
        if (!encoder) {
            encoder = this._encoderCache[type] = this._getEncoder(type);
        }
        return encoder;
    }

    _getEncoder(type: string): (value: any) => string {
        const match = type.match(/^([^\x5b]*)(\x5b(\d*)\x5d)?$/);
        if (!match) { logger.throwArgumentError(`unknown type: ${ type }`, "type", type); }

        const baseType = match[1];

        let baseEncoder = getBaseEncoder(baseType);

        // A struct type
        if (baseEncoder == null) {
            const fields = this.types[baseType];
            if (!fields) { logger.throwArgumentError(`unknown type: ${ type }`, "type", type); }

            const encodedType = id(this._types[baseType]);
            baseEncoder = (value: Record<string, any>) => {
                const values = fields.map((f) => {
                    const result = this.getEncoder(f.type)(value[f.name]);
                    if (this._types[f.type]) { return keccak256(result); }
                    return result;
                });
                values.unshift(encodedType);
                return hexConcat(values);
            }
        }

        // An array type
        if (match[2]) {
            const length = (match[3] ? parseInt(match[3]): -1);
            return (value: Array<any>) => {
                if (length >= 0 && value.length !== length) {
                    logger.throwArgumentError("array length mismatch; expected length ${ arrayLength }", "value", value);
                }

                let result = value.map(baseEncoder);
                if (this._types[baseType]) {
                    result = result.map(keccak256);
                }
                return keccak256(hexConcat(result));
            };
        }

        return baseEncoder;
    }

    encodeType(name: string): string {
        const result = this._types[name];
        if (!result) {
            logger.throwArgumentError(`unknown type: ${ JSON.stringify(name) }`, "name", name);
        }
        return result;
    }

    encodeData(type: string, value: any): string {
        return this.getEncoder(type)(value);
    }

    hashStruct(name: string, value: Record<string, any>): string {
        return keccak256(this.encodeData(name, value));
    }

    encode(value: Record<string, any>): string {
        return this.encodeData(this.primaryType, value);
    }

    hash(value: Record<string, any>): string {
        return this.hashStruct(this.primaryType, value);
    }

    static from(types: Record<string, Array<TypedDataField>>): TypedDataEncoder {
        return new TypedDataEncoder(types);
    }

    static getPrimaryType(types: Record<string, Array<TypedDataField>>): string {
        return TypedDataEncoder.from(types).primaryType;
    }

    static hashStruct(name: string, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): string {
        return TypedDataEncoder.from(types).hashStruct(name, value);
    }

    static hashTypedDataDomain(domain: TypedDataDomain): string {
        const domainFields: Array<TypedDataField> = [ ];
        for (const name in domain) {
            const type = domainFieldTypes[name];
            if (!type) {
                logger.throwArgumentError(`invalid typed-data domain key: ${ JSON.stringify(name) }`, "domain", domain);
            }
            domainFields.push({ name, type });
        }
        return TypedDataEncoder.hashStruct("EIP712Domain", { EIP712Domain: domainFields }, domain);
    }

    static hashTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): string {
        return keccak256(concat([
            "0x1901",
            TypedDataEncoder.hashTypedDataDomain(domain),
            TypedDataEncoder.from(types).hash(value)
        ]));
    }
}

