"use strict";
import { getAddress } from "@ethersproject/address";
import { hexZeroPad } from "@ethersproject/bytes";
import { Coder } from "./abstract-coder";
export class AddressCoder extends Coder {
    constructor(localName) {
        super("address", "address", localName, false);
    }
    encode(writer, value) {
        try {
            getAddress(value);
        }
        catch (error) {
            this._throwError(error.message, value);
        }
        return writer.writeValue(value);
    }
    decode(reader) {
        return getAddress(hexZeroPad(reader.readValue().toHexString(), 20));
    }
}
//# sourceMappingURL=address.js.map