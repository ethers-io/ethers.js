import { AbstractTest } from "./test";

export interface AbiType {
    name: string;
    type: string;

    struct?: string;
    components?: Array<AbiType>;

    create(): any;
}

export abstract class AbstractAbiTest<T = any> extends AbstractTest<T> {
    _nextNames: Record<string, number>;

    constructor(name: string) {
        super(name);
        this._nextNames = { };
    }

    nextName(prefix?: string): string {
        if (prefix == null) { prefix = "p"; }
        if (!this._nextNames[prefix]) { this._nextNames[prefix] = 1; }
        return prefix + (this._nextNames[prefix]++);
    }

    randomType(dynamicOrType?: boolean | string): AbiType {
        if (dynamicOrType == null) { dynamicOrType = true; }

        let type: number | string = null;
        let dynamic = true;
        if (typeof(dynamicOrType) === "boolean") {
            dynamic = dynamicOrType;
            type = this.randomInteger(0, dynamic ? 8: 6);
        } else {
            type = dynamicOrType;
        }

        const name = this.nextName();

        switch (type) {

            // Static

            // address
            case 0: case "address":
                return { name, type: "address", create: () => {
                    return this.randomAddress();
                } };

            // bool
            case 1: case "bool":
                return { name, type: "bool", create: () => {
                    return this.randomChoice([ false, true ]);
                } };

            // intXX and uintXX
            case 2: case "number": {
                const signed = this.randomChoice([ false, true ]);
                const width = this.randomInteger(1, 33);
                return { name, type: `${ signed ? "": "u" }int${ width * 8 }`, create: () => {
                    const bytes = this.randomBytes(width);
                    let value = BigInt("0x" + bytes.toString("hex"));
                    if (signed && (bytes[0] & 0x80)) {
                        bytes[0] &= ~0x80;
                        value = -BigInt("0x" + bytes.toString("hex"));
                    }
                    return value.toString();
                } };
            }

            // bytesXX
            case 3: case "bytesX": {
                const width = this.randomInteger(1, 33);
                return { name, type: `bytes${ width }`, create: () => {
                    return this.randomHexString(width);
                } };
            }

            // Static or dynamic nested types

            // Array
            case 4: case "array": {
                const baseType = this.randomType(dynamic);

                let length = this.randomInteger(0, 4);
                if (length == 0) { length = null; }
                const lengthString = ((length == null) ? "": String(length))

                let struct = undefined;
                let components = undefined;
                if (baseType.struct) {
                    struct = `${ baseType.struct }[${ lengthString }]`;
                    components = baseType.components;
                }

                return { name, components, struct, type: `${ baseType.type }[${ lengthString }]`, create: () => {
                    let l = length;
                    if (l == null) { l = this.randomInteger(0, 4); }

                    const result = [ ];
                    for (let i = 0; i < l; i++) {
                        result.push(baseType.create());
                    }
                    return result;
                } };
            }

            // Tuple
            case 5: case "tuple": {
                const components: Array<AbiType> = [ ];
                const length = this.randomInteger(1, 5);
                for (let i = 0; i < length; i++) {
                    components.push(this.randomType(dynamic));
                }
                const struct = this.nextName("Struct");
                const type = `tuple(${ components.map(c => c.type).join(",") })`
                return { name, struct, type, components, create: () => {
                    const result: Record<string, any> = { };
                    components.forEach((type) => {
                        result[type.name] = type.create();
                    });
                    return result;
                } };
            }

            // Dynamic

            // string
            case 6: case "string":
                return { name, type: "string", create: () => {
                    return this.randomString(0, 64);
                } };

            // bytes
            case 7: case "bytes":
                return { name, type: "bytes", create: () => {
                    return this.randomHexString(0, 64);
                } };
        }

        throw new Error("should not be reached");
    }
}
