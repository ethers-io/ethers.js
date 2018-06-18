/*
import { Arrayish, concat } from './bytes';
export function hashMessage(message: Arrayish | string): string {
    var payload = concat([
        toUtf8Bytes('\x19Ethereum Signed Message:\n'),
        toUtf8Bytes(String(message.length)),
        ((typeof(message) === 'string') ? toUtf8Bytes(message): message)
    ]);
    return keccak256(payload);
}

export verifyMessage(message: Arrayish | string, signature: string): string {
    signature = hexlify(signature);
    if (signature.length != 132) { throw new Error('invalid signature'); }
    var digest = Wallet.hashMessage(message);

    var recoveryParam = parseInt(signature.substring(130), 16);
    if (recoveryParam >= 27) { recoveryParam -= 27; }
    if (recoveryParam < 0) { throw new Error('invalid signature'); }

    return recoverAddress(
        digest,
        {
            r: signature.substring(0, 66),
            s: '0x' + signature.substring(66, 130),
            recoveryParam: recoveryParam
        }
    );
}

*/
