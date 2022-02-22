import { Bytes } from "@ethersproject/bytes";
import { ExternallyOwnedAccount } from "@hethers/abstract-signer";
import { getJsonWalletAddress, isKeystoreWallet } from "./inspect";
import { decrypt as decryptKeystore, decryptSync as decryptKeystoreSync, encrypt as encryptKeystore, EncryptOptions, ProgressCallback } from "./keystore";
declare function decryptJsonWallet(json: string, password: Bytes | string, progressCallback?: ProgressCallback): Promise<ExternallyOwnedAccount>;
declare function decryptJsonWalletSync(json: string, password: Bytes | string): ExternallyOwnedAccount;
export { decryptKeystore, decryptKeystoreSync, encryptKeystore, isKeystoreWallet, getJsonWalletAddress, decryptJsonWallet, decryptJsonWalletSync, ProgressCallback, EncryptOptions, };
//# sourceMappingURL=index.d.ts.map