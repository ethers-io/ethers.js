import {
	Account,
	AccountLike,
	getAccountFromAddress,
	getAddress,
	getAddressFromAccount
} from "@hethers/address";
import { Provider, TransactionRequest, TransactionResponse } from "@hethers/abstract-provider";
import {
	ExternallyOwnedAccount,
	Signer,
	TypedDataDomain,
	TypedDataField,
	TypedDataSigner
} from "@hethers/abstract-signer";
import {
	arrayify,
	Bytes,
	BytesLike,
	concat,
	hexDataSlice, hexlify,
	isHexString,
	joinSignature,
	SignatureLike
} from "@ethersproject/bytes";
import { hashMessage } from "@ethersproject/hash";
import { defaultPath, entropyToMnemonic, HDNode, Mnemonic } from "@hethers/hdnode";
import { keccak256 } from "@ethersproject/keccak256";
import { defineReadOnly } from "@ethersproject/properties";
import { randomBytes } from "@ethersproject/random";
import { SigningKey, recoverPublicKey } from "@ethersproject/signing-key";
import {
	decryptJsonWallet,
	decryptJsonWalletSync,
	encryptKeystore,
	ProgressCallback
} from "@hethers/json-wallets";
import { computeAlias, serializeHederaTransaction } from "@hethers/transactions";
import { Wordlist } from "@ethersproject/wordlists";

import { Logger } from "@hethers/logger";
import { version } from "./_version";
import {
	PrivateKey as HederaPrivKey, PublicKey as HederaPubKey
} from "@hashgraph/sdk";

const logger = new Logger(version);

function isAccount(value: any): value is ExternallyOwnedAccount {
	return value != null && isHexString(value.privateKey, 32);
}

function hasMnemonic(value: any): value is { mnemonic: Mnemonic } {
	const mnemonic = value.mnemonic;
	return (mnemonic && mnemonic.phrase);
}

function hasAlias(value: any): value is ExternallyOwnedAccount {
	return isAccount(value) && value.alias != null;
}

export class Wallet extends Signer implements ExternallyOwnedAccount, TypedDataSigner {

	// EVM Address format
	readonly address?: string;
	// Hedera Account format
	readonly account?: Account;
	// Hedera alias
	readonly alias?: string;
	readonly provider: Provider;

	// Wrapping the _signingKey and _mnemonic in a getter function prevents
	// leaking the private key in console.log; still, be careful! :)
	readonly _signingKey: () => SigningKey;
	readonly _mnemonic: () => Mnemonic;

	constructor(identity: BytesLike | ExternallyOwnedAccount | SigningKey, provider?: Provider) {
		logger.checkNew(new.target, Wallet);
		super();

		if (isAccount(identity) && !SigningKey.isSigningKey(identity)) {
			const signingKey = new SigningKey(identity.privateKey);
			defineReadOnly(this, "_signingKey", () => signingKey);

			if (identity.address || identity.account) {
				defineReadOnly(this, "address", identity.address ? getAddress(identity.address) : getAddressFromAccount(identity.account));
				defineReadOnly(this, "account", identity.account ? identity.account : getAccountFromAddress(identity.address));
			}

			if (hasAlias(identity)) {
				defineReadOnly(this, "alias", identity.alias);
				if (this.alias !== computeAlias(signingKey.privateKey)) {
					logger.throwArgumentError("privateKey/alias mismatch", "privateKey", "[REDACTED]");
				}
			}

			if (hasMnemonic(identity)) {
				const srcMnemonic = identity.mnemonic;
				defineReadOnly(this, "_mnemonic", () => (
					{
						phrase: srcMnemonic.phrase,
						path: srcMnemonic.path || defaultPath,
						locale: srcMnemonic.locale || "en"
					}
				));
				const mnemonic = this.mnemonic;
				const node = HDNode.fromMnemonic(mnemonic.phrase, null, mnemonic.locale).derivePath(mnemonic.path);
				if (node.privateKey !== this._signingKey().privateKey) {
					logger.throwArgumentError("mnemonic/privateKey mismatch", "privateKey", "[REDACTED]");
				}
			} else {
				defineReadOnly(this, "_mnemonic", (): Mnemonic => null);
			}
		} else {
			if (SigningKey.isSigningKey(identity)) {
				/* istanbul ignore if */
				if (identity.curve !== "secp256k1") {
					logger.throwArgumentError("unsupported curve; must be secp256k1", "privateKey", "[REDACTED]");
				}
				defineReadOnly(this, "_signingKey", () => (<SigningKey>identity));
			} else {
				// A lot of common tools do not prefix private keys with a 0x (see: #1166)
				if (typeof (identity) === "string") {
					if (identity.match(/^[0-9a-f]*$/i) && identity.length === 64) {
						identity = "0x" + identity;
					}
				}

				const signingKey = new SigningKey(identity);
				defineReadOnly(this, "_signingKey", () => signingKey);
			}

			defineReadOnly(this, "_mnemonic", (): Mnemonic => null);
			defineReadOnly(this, "alias", computeAlias(this._signingKey().privateKey));
		}
		/* istanbul ignore if */
		if (provider && !Provider.isProvider(provider)) {
			logger.throwArgumentError("invalid provider", "provider", provider);
		}

		defineReadOnly(this, "provider", provider || null);
	}

	get mnemonic(): Mnemonic {
		return this._mnemonic();
	}

	get privateKey(): string {
		return this._signingKey().privateKey;
	}

	get publicKey(): string {
		return this._signingKey().publicKey;
	}

	getAddress(): Promise<string> {
		return Promise.resolve(this.address);
	}

	getAccount(): Promise<Account> {
		return Promise.resolve(this.account);
	}

	getAlias(): Promise<string> {
		return Promise.resolve(this.alias);
	}

	connect(provider: Provider): Wallet {
		return new Wallet(this, provider);
	}

	connectAccount(accountLike: AccountLike): Wallet {
		const eoa = {
			privateKey: this._signingKey().privateKey,
			address: getAddressFromAccount(accountLike),
			alias: this.alias,
			mnemonic: this._mnemonic()
		};
		return new Wallet(eoa, this.provider);
	}

	signTransaction(transaction: TransactionRequest): Promise<string> {
		this._checkAddress('signTransaction');
		let tx = this.checkTransaction(transaction);
		return this.populateTransaction(tx).then(async readyTx => {
			const pubKey = HederaPubKey.fromString(this._signingKey().compressedPublicKey);
			const tx = serializeHederaTransaction(readyTx, pubKey);
			const privKey = HederaPrivKey.fromStringECDSA(this._signingKey().privateKey);
			const signed = await tx.sign(privKey);
			return hexlify(signed.toBytes());
		});
	}

	async signMessage(message: Bytes | string): Promise<string> {
		return joinSignature(this._signingKey().signDigest(hashMessage(message)));
	}

	async _signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string> {
		return logger.throwError("_signTypedData not supported", Logger.errors.UNSUPPORTED_OPERATION, {
			operation: '_signTypedData'
		});
	}

	encrypt(password: Bytes | string, options?: any, progressCallback?: ProgressCallback): Promise<string> {
		if (typeof (options) === "function" && !progressCallback) {
			progressCallback = options;
			options = {};
		}

		if (progressCallback && typeof (progressCallback) !== "function") {
			throw new Error("invalid callback");
		}

		if (!options) {
			options = {};
		}

		return encryptKeystore(this, password, options, progressCallback);
	}

	/**
	 * Performs a contract local call (ContractCallQuery) against the given contract in the provider's network.
	 * In the future, this method should automatically perform getCost and apply the results for gasLimit/txFee.
	 * TODO: utilize getCost when implemented
	 *
	 * @param txRequest - the call request to be submitted
	 */

	/**
	 *  Static methods to create Wallet instances.
	 */
	static createRandom(options?: any): Wallet {
		let entropy: Uint8Array = randomBytes(16);

		if (!options) {
			options = {};
		}

		if (options.extraEntropy) {
			entropy = arrayify(hexDataSlice(keccak256(concat([ entropy, options.extraEntropy ])), 0, 16));
		}

		const mnemonic = entropyToMnemonic(entropy, options.locale);
		return Wallet.fromMnemonic(mnemonic, options.path, options.locale);
	}

	async createAccount(pubKey: BytesLike, initialBalance?: BigInt): Promise<TransactionResponse> {
		if (!initialBalance) initialBalance = BigInt(0);
		const signed = await this.signTransaction({
			customData: {
				publicKey: pubKey,
				initialBalance
			}
		});

		return this.provider.sendTransaction(signed);
	};

	static fromEncryptedJson(json: string, password: Bytes | string, progressCallback?: ProgressCallback): Promise<Wallet> {
		return decryptJsonWallet(json, password, progressCallback).then((account) => {
			return new Wallet(account);
		});
	}

	static fromEncryptedJsonSync(json: string, password: Bytes | string): Wallet {
		return new Wallet(decryptJsonWalletSync(json, password));
	}

	static fromMnemonic(mnemonic: string, path?: string, wordlist?: Wordlist): Wallet {
		if (!path) {
			path = defaultPath;
		}
		return new Wallet(HDNode.fromMnemonic(mnemonic, null, wordlist).derivePath(path));
	}

	_checkAddress(operation?: string): void {
		if (!this.address) { logger.throwError("missing address", Logger.errors.UNSUPPORTED_OPERATION, {
			operation: (operation || "_checkAddress") });
		}
	}
}

export function verifyMessage(message: Bytes | string, signature: SignatureLike): string {
	return recoverPublicKey(arrayify(hashMessage(message)), signature);
}

export function verifyTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>, signature: SignatureLike): string {
	return logger.throwError("verifyTypedData not supported", Logger.errors.UNSUPPORTED_OPERATION, {
		operation: 'verifyTypedData'
	});
}
