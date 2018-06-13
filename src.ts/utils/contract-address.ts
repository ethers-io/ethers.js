'use strict';

import { getAddress } from './address';
import { BigNumber } from './bignumber';
import { Arrayish, stripZeros, hexlify } from './convert';
import { keccak256 } from './keccak256';
import { encode } from './rlp';

// http://ethereum.stackexchange.com/questions/760/how-is-the-address-of-an-ethereum-contract-computed
export function getContractAddress(transaction: { from: string, nonce: Arrayish | BigNumber | number }) {
    if (!transaction.from) { throw new Error('missing from address'); }
    var nonce = transaction.nonce;

    return getAddress('0x' + keccak256(encode([
        getAddress(transaction.from),
        stripZeros(hexlify(nonce))
    ])).substring(26));
}
