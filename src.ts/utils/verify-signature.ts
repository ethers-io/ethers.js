import { Contract } from "../contract/index.js";
import { TypedDataEncoder, hashMessage, TypedDataDomain, TypedDataField } from "../hash/index.js";
import { recoverAddress } from "../transaction/index.js";
import { JsonRpcProvider } from "../providers/provider-jsonrpc.js";

import type { SignatureLike } from "../crypto/index.js";
import type { BytesLike } from "./index.js";

export async function isMessageSignatureCorrect (provider: JsonRpcProvider, signer: string, message: BytesLike, signature: SignatureLike) {
    const finalDigest = hashMessage(message);
    return isFinalDigestSignatureCorrect(provider, signer, finalDigest, signature);
}

export async function isTypedDataSignatureCorrect (provider: JsonRpcProvider, signer: string, domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, typedDataMessage: Record<string, any>, signature: SignatureLike): Promise<boolean> {
    const finalDigest = TypedDataEncoder.hash(domain, types, typedDataMessage);
    return isFinalDigestSignatureCorrect(provider, signer, finalDigest, signature);
}

export async function isFinalDigestSignatureCorrect (provider: JsonRpcProvider, signer: string, finalDigest: BytesLike, signature: SignatureLike): Promise<boolean> {
    // First try: Getting code from deployed smart contract to call 1271 isValidSignature
    const code = await provider.getCode(signer);
    if (code && code !== '0x') {
        const contract = new Contract(signer, ["function isValidSignature(bytes32 hash, bytes signature) view returns (bytes4)"], provider);
        return (await contract.isValidSignature(finalDigest, signature)) === "0x1626ba7e";
    }

    // 2nd try: elliptic curve signature (EOA)
    const recoveredAddr = recoverAddress(finalDigest, signature);
    if (recoveredAddr && (recoveredAddr.toLowerCase() === signer.toLowerCase())) { return true; }

    return false;
}
