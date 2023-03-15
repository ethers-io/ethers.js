
import { TypedDataDomain, TypedDataField } from "../hash/index.js";
import { JsonRpcProvider } from "../providers/provider-jsonrpc";

import type { SignatureLike } from "../crypto/index.js";
import type { BytesLike } from "./index.js";


export declare function isMessageSignatureCorrect(signerAddress: string, message: BytesLike, signature: SignatureLike): Promise<boolean>;
export declare function isTypedDataSignatureCorrect(signerSigner: string, domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, typedDataMessage: Record<string, any>, signature: SignatureLike): Promise<boolean>;
export declare function isFinalDigestSignatureCorrect(signerAddress: string, finalDigest: BytesLike, signature: SignatureLike): Promise<boolean>;
