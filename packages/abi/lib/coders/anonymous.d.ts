import { Coder } from "./abstract-coder.js";
import type { Reader, Writer } from "./abstract-coder.js";
export declare class AnonymousCoder extends Coder {
    private coder;
    constructor(coder: Coder);
    defaultValue(): any;
    encode(writer: Writer, value: any): number;
    decode(reader: Reader): any;
}
//# sourceMappingURL=anonymous.d.ts.map