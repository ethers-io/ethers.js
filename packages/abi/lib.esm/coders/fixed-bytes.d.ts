import { BytesLike } from "@ethersproject/bytes";
import { Coder, Reader, Writer } from "./abstract-coder";
export declare class FixedBytesCoder extends Coder {
    readonly size: number;
    constructor(size: number, localName: string);
    encode(writer: Writer, value: BytesLike): number;
    decode(reader: Reader): any;
}
