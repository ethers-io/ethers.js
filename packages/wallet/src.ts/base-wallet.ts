import { getAddress, resolveAddress } from "@ethersproject/address";
import { hashMessage, TypedDataEncoder } from "@ethersproject/hash";
import { defineProperties, resolveProperties } from "@ethersproject/properties";
import { AbstractSigner } from "@ethersproject/providers";
import { computeAddress, Transaction } from "@ethersproject/transaction";

import { logger } from "./logger.js";

import type { TypedDataDomain, TypedDataField } from "@ethersproject/hash";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { SigningKey } from "@ethersproject/signing-key";
import type { TransactionLike } from "@ethersproject/transaction";


export class BaseWallet extends AbstractSigner {
    readonly address!: string;

    readonly #signingKey: SigningKey;

    constructor(privateKey: SigningKey, provider?: null | Provider) {
        super(provider);
        this.#signingKey = privateKey;

        const address = computeAddress(this.signingKey.publicKey);
        defineProperties<BaseWallet>(this, { address });
    }

    // Store these in getters to reduce visibility in console.log
    get signingKey(): SigningKey { return this.#signingKey; }
    get privateKey(): string { return this.signingKey.privateKey; }

    async getAddress(): Promise<string> { return this.address; }

    connect(provider: null | Provider): BaseWallet {
        return new BaseWallet(this.#signingKey, provider);
    }

    async signTransaction(_tx: TransactionRequest): Promise<string> {
        // Replace any Addressable or ENS name with an address
        const tx = <TransactionLike<string>>Object.assign({ }, _tx, await resolveProperties({
            to: (_tx.to ? resolveAddress(_tx.to, this.provider): undefined),
            from: (_tx.from ? resolveAddress(_tx.from, this.provider): undefined)
        }));

        if (tx.from != null) {
            if (getAddress(tx.from) !== this.address) {
                logger.throwArgumentError("transaction from address mismatch", "tx.from", _tx.from);
            }
            delete tx.from;
        }

        // Build the transaction
        const btx = Transaction.from(tx);
        btx.signature = this.signingKey.sign(btx.unsignedHash);

        return btx.serialized;
    }

    async signMessage(message: string | Uint8Array): Promise<string> {
        return this.signingKey.sign(hashMessage(message)).serialized;
    }

    async signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string> {

        // Populate any ENS names
        const populated = await TypedDataEncoder.resolveNames(domain, types, value, async (name: string) => {
            if (this.provider == null) {
                return logger.throwError("cannot resolve ENS names without a provider", "UNSUPPORTED_OPERATION", {
                    operation: "resolveName",
                    info: { name }
                });
            }

            const address = await this.provider.resolveName(name);
            if (address == null) {
                return logger.throwError("unconfigured ENS name", "UNCONFIGURED_NAME", {
                    value: name
                });
            }

            return address;
        });

        return this.signingKey.sign(TypedDataEncoder.hash(populated.domain, types, populated.value)).serialized;
    }
}
