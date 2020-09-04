"use strict";

import { Logger } from "@ethersproject/logger";
import { version } from "../_version";
const logger = new Logger(version);

import { Coder, Reader, Result, Writer } from "./abstract-coder";
import { AnonymousCoder } from "./anonymous";

export function pack(writer: Writer, coders: ReadonlyArray<Coder>, values: Array<any> | { [ name: string ]: any }): number {
    let arrayValues: Array<any> = null;

    if (Array.isArray(values)) {
       arrayValues = values;

    } else if (values && typeof(values) === "object") {
        let unique: { [ name: string ]: boolean } = { };

        arrayValues = coders.map((coder) => {
            const name = coder.localName;
            if (!name) {
                logger.throwError("cannot encode object for signature with missing names", Logger.errors.INVALID_ARGUMENT, {
                    argument: "values",
                    coder: coder,
                    value: values
                });
            }

            if (unique[name]) {
                logger.throwError("cannot encode object for signature with duplicate names", Logger.errors.INVALID_ARGUMENT, {
                    argument: "values",
                    coder: coder,
                    value: values
                });
            }

            unique[name] = true;

            return values[name];
        });

    } else {
        logger.throwArgumentError("invalid tuple value", "tuple", values);
    }

    if (coders.length !== arrayValues.length) {
        logger.throwArgumentError("types/value length mismatch", "tuple", values);
    }

    let staticWriter = new Writer(writer.wordSize);
    let dynamicWriter = new Writer(writer.wordSize);

    let updateFuncs: Array<(baseOffset: number) => void> = [];
    coders.forEach((coder, index) => {
        let value = arrayValues[index];

        if (coder.dynamic) {
            // Get current dynamic offset (for the future pointer)
            let dynamicOffset = dynamicWriter.length;

            // Encode the dynamic value into the dynamicWriter
            coder.encode(dynamicWriter, value);

            // Prepare to populate the correct offset once we are done
            let updateFunc = staticWriter.writeUpdatableValue();
            updateFuncs.push((baseOffset: number) => {
                updateFunc(baseOffset + dynamicOffset);
            });

        } else {
            coder.encode(staticWriter, value);
        }
    });

    // Backfill all the dynamic offsets, now that we know the static length
    updateFuncs.forEach((func) => { func(staticWriter.length); });

    let length = writer.writeBytes(staticWriter.data);
    length += writer.writeBytes(dynamicWriter.data);
    return length;
}

export function unpack(reader: Reader, coders: Array<Coder>): Result {
    let values: any = [];

    // A reader anchored to this base
    let baseReader = reader.subReader(0);

    // The amount of dynamic data read; to consume later to synchronize
    let dynamicLength = 0;

    coders.forEach((coder) => {
        let value: any = null;

        if (coder.dynamic) {
            let offset = reader.readValue();
            let offsetReader = baseReader.subReader(offset.toNumber());
            try {
                value = coder.decode(offsetReader);
            } catch (error) {
                // Cannot recover from this
                if (error.code === Logger.errors.BUFFER_OVERRUN) { throw error; }
                value = error;
                value.baseType = coder.name;
                value.name = coder.localName;
                value.type = coder.type;
            }
            dynamicLength += offsetReader.consumed;

        } else {
            try {
                value = coder.decode(reader);
            } catch (error) {
                // Cannot recover from this
                if (error.code === Logger.errors.BUFFER_OVERRUN) { throw error; }
                value = error;
                value.baseType = coder.name;
                value.name = coder.localName;
                value.type = coder.type;
            }
        }

        if (value != undefined) {
            values.push(value);
        }
    });

// @TODO: get rid of this an see if it still works?
    // Consume the dynamic components in the main reader
    reader.readBytes(dynamicLength);

    // We only output named properties for uniquely named coders
    const uniqueNames = coders.reduce((accum, coder) => {
        const name = coder.localName;
        if (name) {
            if (!accum[name]) { accum[name] = 0; }
            accum[name]++;
        }
        return accum;
    }, <{ [ name: string ]: number }>{ });

    // Add any named parameters (i.e. tuples)
    coders.forEach((coder: Coder, index: number) => {
        let name = coder.localName;
        if (!name || uniqueNames[name] !== 1) { return; }

        if (name === "length") { name = "_length"; }

        if (values[name] != null) { return; }

        const value = values[index];

        if (value instanceof Error) {
            Object.defineProperty(values, name, {
                get: () => { throw value; }
            });
        } else {
            values[name] = value;
        }
    });

    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if (value instanceof Error) {
            Object.defineProperty(values, i, {
                get: () => { throw value; }
            });
        }
    }

    return Object.freeze(values);
}


export class ArrayCoder extends Coder {
    readonly coder: Coder;
    readonly length: number;

    constructor(coder: Coder, length: number, localName: string) {
        const type = (coder.type + "[" + (length >= 0 ? length: "") + "]");
        const dynamic = (length === -1 || coder.dynamic);
        super("array", type, localName, dynamic);

        this.coder = coder;
        this.length = length;
    }

    encode(writer: Writer, value: Array<any>): number {
        if (!Array.isArray(value)) {
            this._throwError("expected array value", value);
        }

        let count = this.length;

        if (count === -1) {
            count = value.length;
            writer.writeValue(value.length);
        }

        logger.checkArgumentCount(value.length, count, "coder array" + (this.localName? (" "+ this.localName): ""));

        let coders = [];
        for (let i = 0; i < value.length; i++) { coders.push(this.coder); }

        return pack(writer, coders, value);
    }

    decode(reader: Reader): any {
        let count = this.length;
        if (count === -1) {
            count = reader.readValue().toNumber();
        }

        let coders = [];
        for (let i = 0; i < count; i++) { coders.push(new AnonymousCoder(this.coder)); }

        return reader.coerce(this.name, unpack(reader, coders));
    }
}
