import { Coder, Reader, Writer } from "./abstract-coder";
export declare class AddressCoder extends Coder {
    constructor(localName: string);
    encode(writer: Writer, value: string): number;
    decode(reader: Reader): any;
}
