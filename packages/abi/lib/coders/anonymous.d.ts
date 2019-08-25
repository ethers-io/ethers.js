import { Coder, Reader, Writer } from "./abstract-coder";
export declare class AnonymousCoder extends Coder {
    private coder;
    constructor(coder: Coder);
    encode(writer: Writer, value: any): number;
    decode(reader: Reader): any;
}
