"use strict";

import { id } from "./id";
import { dnsEncode, isValidName, namehash } from "./namehash";
import { hashMessage, messagePrefix } from "./message";

import { ens_normalize as ensNormalize } from "./ens-normalize/lib";

import { TypedDataEncoder as _TypedDataEncoder } from "./typed-data";

export {
    id,

    dnsEncode,
    namehash,
    isValidName,

    ensNormalize,

    messagePrefix,
    hashMessage,

    _TypedDataEncoder,
}
