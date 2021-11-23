import * as $protobuf from "protobufjs";
/** Namespace proto. */
export namespace proto {

    /** Properties of a TokenUnitBalance. */
    interface ITokenUnitBalance {

        /** A unique token id */
        tokenId?: (proto.ITokenID|null);

        /**
         * Number of transferable units of the identified token. For token of type FUNGIBLE_COMMON -
         * balance in the smallest denomination. For token of type NON_FUNGIBLE_UNIQUE - the number of
         * NFTs held by the account
         */
        balance?: (Long|null);
    }

    /** Represents a TokenUnitBalance. */
    class TokenUnitBalance implements ITokenUnitBalance {

        /**
         * Constructs a new TokenUnitBalance.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITokenUnitBalance);

        /** A unique token id */
        public tokenId?: (proto.ITokenID|null);

        /**
         * Number of transferable units of the identified token. For token of type FUNGIBLE_COMMON -
         * balance in the smallest denomination. For token of type NON_FUNGIBLE_UNIQUE - the number of
         * NFTs held by the account
         */
        public balance: Long;

        /**
         * Creates a new TokenUnitBalance instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TokenUnitBalance instance
         */
        public static create(properties?: proto.ITokenUnitBalance): proto.TokenUnitBalance;

        /**
         * Encodes the specified TokenUnitBalance message. Does not implicitly {@link proto.TokenUnitBalance.verify|verify} messages.
         * @param m TokenUnitBalance message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITokenUnitBalance, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TokenUnitBalance message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TokenUnitBalance
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TokenUnitBalance;
    }

    /** Properties of a SingleAccountBalances. */
    interface ISingleAccountBalances {

        /** The account */
        accountID?: (proto.IAccountID|null);

        /** The account's hbar balance */
        hbarBalance?: (Long|null);

        /** The list of the account's token balances */
        tokenUnitBalances?: (proto.ITokenUnitBalance[]|null);
    }

    /** Includes all currency balances (both hbar and token) of a single account in the ledger. */
    class SingleAccountBalances implements ISingleAccountBalances {

        /**
         * Constructs a new SingleAccountBalances.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ISingleAccountBalances);

        /** The account */
        public accountID?: (proto.IAccountID|null);

        /** The account's hbar balance */
        public hbarBalance: Long;

        /** The list of the account's token balances */
        public tokenUnitBalances: proto.ITokenUnitBalance[];

        /**
         * Creates a new SingleAccountBalances instance using the specified properties.
         * @param [properties] Properties to set
         * @returns SingleAccountBalances instance
         */
        public static create(properties?: proto.ISingleAccountBalances): proto.SingleAccountBalances;

        /**
         * Encodes the specified SingleAccountBalances message. Does not implicitly {@link proto.SingleAccountBalances.verify|verify} messages.
         * @param m SingleAccountBalances message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ISingleAccountBalances, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SingleAccountBalances message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns SingleAccountBalances
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.SingleAccountBalances;
    }

    /** Properties of an AllAccountBalances. */
    interface IAllAccountBalances {

        /** An instant in consensus time */
        consensusTimestamp?: (proto.ITimestamp|null);

        /**
         * The list of account balances for all accounts, after handling all transactions with consensus
         * timestamp up to and including the above instant
         */
        allAccounts?: (proto.ISingleAccountBalances[]|null);
    }

    /** Includes all currency balances (both hbar and token) of all accounts in the ledger. */
    class AllAccountBalances implements IAllAccountBalances {

        /**
         * Constructs a new AllAccountBalances.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IAllAccountBalances);

        /** An instant in consensus time */
        public consensusTimestamp?: (proto.ITimestamp|null);

        /**
         * The list of account balances for all accounts, after handling all transactions with consensus
         * timestamp up to and including the above instant
         */
        public allAccounts: proto.ISingleAccountBalances[];

        /**
         * Creates a new AllAccountBalances instance using the specified properties.
         * @param [properties] Properties to set
         * @returns AllAccountBalances instance
         */
        public static create(properties?: proto.IAllAccountBalances): proto.AllAccountBalances;

        /**
         * Encodes the specified AllAccountBalances message. Does not implicitly {@link proto.AllAccountBalances.verify|verify} messages.
         * @param m AllAccountBalances message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IAllAccountBalances, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an AllAccountBalances message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns AllAccountBalances
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.AllAccountBalances;
    }

    /** Properties of a ShardID. */
    interface IShardID {

        /** the shard number (nonnegative) */
        shardNum?: (Long|null);
    }

    /**
     * Each shard has a nonnegative shard number. Each realm within a given shard has a nonnegative
     * realm number (that number might be reused in other shards). And each account, file, and smart
     * contract instance within a given realm has a nonnegative number (which might be reused in other
     * realms).  Every account, file, and smart contract instance is within exactly one realm. So a
     * FileID is a triplet of numbers, like 0.1.2 for entity number 2 within realm 1  within shard 0.
     * Each realm maintains a single counter for assigning numbers,  so if there is a file with ID
     * 0.1.2, then there won't be an account or smart  contract instance with ID 0.1.2.
     *
     * Everything is partitioned into realms so that each Solidity smart contract can  access everything
     * in just a single realm, locking all those entities while it's  running, but other smart contracts
     * could potentially run in other realms in  parallel. So realms allow Solidity to be parallelized
     * somewhat, even though the  language itself assumes everything is serial.
     */
    class ShardID implements IShardID {

        /**
         * Constructs a new ShardID.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IShardID);

        /** the shard number (nonnegative) */
        public shardNum: Long;

        /**
         * Creates a new ShardID instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ShardID instance
         */
        public static create(properties?: proto.IShardID): proto.ShardID;

        /**
         * Encodes the specified ShardID message. Does not implicitly {@link proto.ShardID.verify|verify} messages.
         * @param m ShardID message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IShardID, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ShardID message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ShardID
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ShardID;
    }

    /** Properties of a RealmID. */
    interface IRealmID {

        /** The shard number (nonnegative) */
        shardNum?: (Long|null);

        /** The realm number (nonnegative) */
        realmNum?: (Long|null);
    }

    /**
     * The ID for a realm. Within a given shard, every realm has a unique ID. Each account, file, and
     * contract instance belongs to exactly one realm.
     */
    class RealmID implements IRealmID {

        /**
         * Constructs a new RealmID.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IRealmID);

        /** The shard number (nonnegative) */
        public shardNum: Long;

        /** The realm number (nonnegative) */
        public realmNum: Long;

        /**
         * Creates a new RealmID instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RealmID instance
         */
        public static create(properties?: proto.IRealmID): proto.RealmID;

        /**
         * Encodes the specified RealmID message. Does not implicitly {@link proto.RealmID.verify|verify} messages.
         * @param m RealmID message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IRealmID, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RealmID message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns RealmID
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.RealmID;
    }

    /** Properties of an AccountID. */
    interface IAccountID {

        /** The shard number (nonnegative) */
        shardNum?: (Long|null);

        /** The realm number (nonnegative) */
        realmNum?: (Long|null);

        /** A nonnegative account number unique within its realm */
        accountNum?: (Long|null);
    }

    /** The ID for an a cryptocurrency account */
    class AccountID implements IAccountID {

        /**
         * Constructs a new AccountID.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IAccountID);

        /** The shard number (nonnegative) */
        public shardNum: Long;

        /** The realm number (nonnegative) */
        public realmNum: Long;

        /** A nonnegative account number unique within its realm */
        public accountNum: Long;

        /**
         * Creates a new AccountID instance using the specified properties.
         * @param [properties] Properties to set
         * @returns AccountID instance
         */
        public static create(properties?: proto.IAccountID): proto.AccountID;

        /**
         * Encodes the specified AccountID message. Does not implicitly {@link proto.AccountID.verify|verify} messages.
         * @param m AccountID message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IAccountID, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an AccountID message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns AccountID
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.AccountID;
    }

    /** Properties of a FileID. */
    interface IFileID {

        /** The shard number (nonnegative) */
        shardNum?: (Long|null);

        /** The realm number (nonnegative) */
        realmNum?: (Long|null);

        /** A nonnegative File number unique within its realm */
        fileNum?: (Long|null);
    }

    /** The ID for a file */
    class FileID implements IFileID {

        /**
         * Constructs a new FileID.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IFileID);

        /** The shard number (nonnegative) */
        public shardNum: Long;

        /** The realm number (nonnegative) */
        public realmNum: Long;

        /** A nonnegative File number unique within its realm */
        public fileNum: Long;

        /**
         * Creates a new FileID instance using the specified properties.
         * @param [properties] Properties to set
         * @returns FileID instance
         */
        public static create(properties?: proto.IFileID): proto.FileID;

        /**
         * Encodes the specified FileID message. Does not implicitly {@link proto.FileID.verify|verify} messages.
         * @param m FileID message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IFileID, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a FileID message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns FileID
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.FileID;
    }

    /** Properties of a ContractID. */
    interface IContractID {

        /** The shard number (nonnegative) */
        shardNum?: (Long|null);

        /** The realm number (nonnegative) */
        realmNum?: (Long|null);

        /** A nonnegative number unique within its realm */
        contractNum?: (Long|null);
    }

    /** The ID for a smart contract instance */
    class ContractID implements IContractID {

        /**
         * Constructs a new ContractID.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IContractID);

        /** The shard number (nonnegative) */
        public shardNum: Long;

        /** The realm number (nonnegative) */
        public realmNum: Long;

        /** A nonnegative number unique within its realm */
        public contractNum: Long;

        /**
         * Creates a new ContractID instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ContractID instance
         */
        public static create(properties?: proto.IContractID): proto.ContractID;

        /**
         * Encodes the specified ContractID message. Does not implicitly {@link proto.ContractID.verify|verify} messages.
         * @param m ContractID message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IContractID, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ContractID message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ContractID
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ContractID;
    }

    /** Properties of a TransactionID. */
    interface ITransactionID {

        /** The transaction is invalid if consensusTimestamp < transactionID.transactionStartValid */
        transactionValidStart?: (proto.ITimestamp|null);

        /** The Account ID that paid for this transaction */
        accountID?: (proto.IAccountID|null);

        /** Whether the Transaction is of type Scheduled or no */
        scheduled?: (boolean|null);
    }

    /**
     * The ID for a transaction. This is used for retrieving receipts and records for a transaction, for
     * appending to a file right after creating it, for instantiating a smart contract with bytecode in
     * a file just created, and internally by the network for detecting when duplicate transactions are
     * submitted. A user might get a transaction processed faster by submitting it to N nodes, each with
     * a different node account, but all with the same TransactionID. Then, the transaction will take
     * effect when the first of all those nodes submits the transaction and it reaches consensus. The
     * other transactions will not take effect. So this could make the transaction take effect faster,
     * if any given node might be slow. However, the full transaction fee is charged for each
     * transaction, so the total fee is N times as much if the transaction is sent to N nodes.
     *
     * Applicable to Scheduled Transactions:
     * - The ID of a Scheduled Transaction has transactionValidStart and accountIDs inherited from the
     * ScheduleCreate transaction that created it. That is to say that they are equal
     * - The scheduled property is true for Scheduled Transactions
     * - transactionValidStart, accountID and scheduled properties should be omitted
     */
    class TransactionID implements ITransactionID {

        /**
         * Constructs a new TransactionID.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITransactionID);

        /** The transaction is invalid if consensusTimestamp < transactionID.transactionStartValid */
        public transactionValidStart?: (proto.ITimestamp|null);

        /** The Account ID that paid for this transaction */
        public accountID?: (proto.IAccountID|null);

        /** Whether the Transaction is of type Scheduled or no */
        public scheduled: boolean;

        /**
         * Creates a new TransactionID instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TransactionID instance
         */
        public static create(properties?: proto.ITransactionID): proto.TransactionID;

        /**
         * Encodes the specified TransactionID message. Does not implicitly {@link proto.TransactionID.verify|verify} messages.
         * @param m TransactionID message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITransactionID, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TransactionID message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TransactionID
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TransactionID;
    }

    /** Properties of an AccountAmount. */
    interface IAccountAmount {

        /** The Account ID that sends/receives cryptocurrency or tokens */
        accountID?: (proto.IAccountID|null);

        /**
         * The amount of tinybars (for Crypto transfers) or in the lowest
         * denomination (for Token transfers) that the account sends(negative) or
         * receives(positive)
         */
        amount?: (Long|null);
    }

    /** An account, and the amount that it sends or receives during a cryptocurrency or token transfer. */
    class AccountAmount implements IAccountAmount {

        /**
         * Constructs a new AccountAmount.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IAccountAmount);

        /** The Account ID that sends/receives cryptocurrency or tokens */
        public accountID?: (proto.IAccountID|null);

        /**
         * The amount of tinybars (for Crypto transfers) or in the lowest
         * denomination (for Token transfers) that the account sends(negative) or
         * receives(positive)
         */
        public amount: Long;

        /**
         * Creates a new AccountAmount instance using the specified properties.
         * @param [properties] Properties to set
         * @returns AccountAmount instance
         */
        public static create(properties?: proto.IAccountAmount): proto.AccountAmount;

        /**
         * Encodes the specified AccountAmount message. Does not implicitly {@link proto.AccountAmount.verify|verify} messages.
         * @param m AccountAmount message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IAccountAmount, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an AccountAmount message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns AccountAmount
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.AccountAmount;
    }

    /** Properties of a TransferList. */
    interface ITransferList {

        /**
         * Multiple list of AccountAmount pairs, each of which has an account and
         * an amount to transfer into it (positive) or out of it (negative)
         */
        accountAmounts?: (proto.IAccountAmount[]|null);
    }

    /** A list of accounts and amounts to transfer out of each account (negative) or into it (positive). */
    class TransferList implements ITransferList {

        /**
         * Constructs a new TransferList.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITransferList);

        /**
         * Multiple list of AccountAmount pairs, each of which has an account and
         * an amount to transfer into it (positive) or out of it (negative)
         */
        public accountAmounts: proto.IAccountAmount[];

        /**
         * Creates a new TransferList instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TransferList instance
         */
        public static create(properties?: proto.ITransferList): proto.TransferList;

        /**
         * Encodes the specified TransferList message. Does not implicitly {@link proto.TransferList.verify|verify} messages.
         * @param m TransferList message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITransferList, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TransferList message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TransferList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TransferList;
    }

    /** Properties of a NftTransfer. */
    interface INftTransfer {

        /** The accountID of the sender */
        senderAccountID?: (proto.IAccountID|null);

        /** The accountID of the receiver */
        receiverAccountID?: (proto.IAccountID|null);

        /** The serial number of the NFT */
        serialNumber?: (Long|null);
    }

    /**
     * A sender account, a receiver account, and the serial number of an NFT of a Token with
     * NON_FUNGIBLE_UNIQUE type. When minting NFTs the sender will be the default AccountID instance
     * (0.0.0) and when burning NFTs, the receiver will be the default AccountID instance.
     */
    class NftTransfer implements INftTransfer {

        /**
         * Constructs a new NftTransfer.
         * @param [p] Properties to set
         */
        constructor(p?: proto.INftTransfer);

        /** The accountID of the sender */
        public senderAccountID?: (proto.IAccountID|null);

        /** The accountID of the receiver */
        public receiverAccountID?: (proto.IAccountID|null);

        /** The serial number of the NFT */
        public serialNumber: Long;

        /**
         * Creates a new NftTransfer instance using the specified properties.
         * @param [properties] Properties to set
         * @returns NftTransfer instance
         */
        public static create(properties?: proto.INftTransfer): proto.NftTransfer;

        /**
         * Encodes the specified NftTransfer message. Does not implicitly {@link proto.NftTransfer.verify|verify} messages.
         * @param m NftTransfer message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.INftTransfer, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a NftTransfer message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns NftTransfer
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.NftTransfer;
    }

    /** Properties of a TokenTransferList. */
    interface ITokenTransferList {

        /** The ID of the token */
        token?: (proto.ITokenID|null);

        /**
         * Applicable to tokens of type FUNGIBLE_COMMON. Multiple list of AccountAmounts, each of which
         * has an account and amount
         */
        transfers?: (proto.IAccountAmount[]|null);

        /**
         * Applicable to tokens of type NON_FUNGIBLE_UNIQUE. Multiple list of NftTransfers, each of
         * which has a sender and receiver account, including the serial number of the NFT
         */
        nftTransfers?: (proto.INftTransfer[]|null);
    }

    /**
     * A list of token IDs and amounts representing the transferred out (negative) or into (positive)
     * amounts, represented in the lowest denomination of the token
     */
    class TokenTransferList implements ITokenTransferList {

        /**
         * Constructs a new TokenTransferList.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITokenTransferList);

        /** The ID of the token */
        public token?: (proto.ITokenID|null);

        /**
         * Applicable to tokens of type FUNGIBLE_COMMON. Multiple list of AccountAmounts, each of which
         * has an account and amount
         */
        public transfers: proto.IAccountAmount[];

        /**
         * Applicable to tokens of type NON_FUNGIBLE_UNIQUE. Multiple list of NftTransfers, each of
         * which has a sender and receiver account, including the serial number of the NFT
         */
        public nftTransfers: proto.INftTransfer[];

        /**
         * Creates a new TokenTransferList instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TokenTransferList instance
         */
        public static create(properties?: proto.ITokenTransferList): proto.TokenTransferList;

        /**
         * Encodes the specified TokenTransferList message. Does not implicitly {@link proto.TokenTransferList.verify|verify} messages.
         * @param m TokenTransferList message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITokenTransferList, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TokenTransferList message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TokenTransferList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TokenTransferList;
    }

    /** Properties of a Fraction. */
    interface IFraction {

        /** The rational's numerator */
        numerator?: (Long|null);

        /** The rational's denominator; a zero value will result in FRACTION_DIVIDES_BY_ZERO */
        denominator?: (Long|null);
    }

    /** A rational number, used to set the amount of a value transfer to collect as a custom fee */
    class Fraction implements IFraction {

        /**
         * Constructs a new Fraction.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IFraction);

        /** The rational's numerator */
        public numerator: Long;

        /** The rational's denominator; a zero value will result in FRACTION_DIVIDES_BY_ZERO */
        public denominator: Long;

        /**
         * Creates a new Fraction instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Fraction instance
         */
        public static create(properties?: proto.IFraction): proto.Fraction;

        /**
         * Encodes the specified Fraction message. Does not implicitly {@link proto.Fraction.verify|verify} messages.
         * @param m Fraction message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IFraction, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Fraction message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Fraction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.Fraction;
    }

    /** Properties of a TopicID. */
    interface ITopicID {

        /** The shard number (nonnegative) */
        shardNum?: (Long|null);

        /** The realm number (nonnegative) */
        realmNum?: (Long|null);

        /** Unique topic identifier within a realm (nonnegative). */
        topicNum?: (Long|null);
    }

    /** Unique identifier for a topic (used by the consensus service) */
    class TopicID implements ITopicID {

        /**
         * Constructs a new TopicID.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITopicID);

        /** The shard number (nonnegative) */
        public shardNum: Long;

        /** The realm number (nonnegative) */
        public realmNum: Long;

        /** Unique topic identifier within a realm (nonnegative). */
        public topicNum: Long;

        /**
         * Creates a new TopicID instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TopicID instance
         */
        public static create(properties?: proto.ITopicID): proto.TopicID;

        /**
         * Encodes the specified TopicID message. Does not implicitly {@link proto.TopicID.verify|verify} messages.
         * @param m TopicID message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITopicID, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TopicID message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TopicID
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TopicID;
    }

    /** Properties of a TokenID. */
    interface ITokenID {

        /** A nonnegative shard number */
        shardNum?: (Long|null);

        /** A nonnegative realm number */
        realmNum?: (Long|null);

        /** A nonnegative token number */
        tokenNum?: (Long|null);
    }

    /** Unique identifier for a token */
    class TokenID implements ITokenID {

        /**
         * Constructs a new TokenID.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITokenID);

        /** A nonnegative shard number */
        public shardNum: Long;

        /** A nonnegative realm number */
        public realmNum: Long;

        /** A nonnegative token number */
        public tokenNum: Long;

        /**
         * Creates a new TokenID instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TokenID instance
         */
        public static create(properties?: proto.ITokenID): proto.TokenID;

        /**
         * Encodes the specified TokenID message. Does not implicitly {@link proto.TokenID.verify|verify} messages.
         * @param m TokenID message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITokenID, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TokenID message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TokenID
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TokenID;
    }

    /** Properties of a ScheduleID. */
    interface IScheduleID {

        /** A nonnegative shard number */
        shardNum?: (Long|null);

        /** A nonnegative realm number */
        realmNum?: (Long|null);

        /** A nonnegative schedule number */
        scheduleNum?: (Long|null);
    }

    /** Unique identifier for a Schedule */
    class ScheduleID implements IScheduleID {

        /**
         * Constructs a new ScheduleID.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IScheduleID);

        /** A nonnegative shard number */
        public shardNum: Long;

        /** A nonnegative realm number */
        public realmNum: Long;

        /** A nonnegative schedule number */
        public scheduleNum: Long;

        /**
         * Creates a new ScheduleID instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ScheduleID instance
         */
        public static create(properties?: proto.IScheduleID): proto.ScheduleID;

        /**
         * Encodes the specified ScheduleID message. Does not implicitly {@link proto.ScheduleID.verify|verify} messages.
         * @param m ScheduleID message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IScheduleID, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ScheduleID message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ScheduleID
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ScheduleID;
    }

    /**
     * Possible Token Types (IWA Compatibility).
     * Apart from fungible and non-fungible, Tokens can have either a common or unique representation.
     * This distinction might seem subtle, but it is important when considering how tokens can be traced
     * and if they can have isolated and unique properties.
     */
    enum TokenType {
        FUNGIBLE_COMMON = 0,
        NON_FUNGIBLE_UNIQUE = 1
    }

    /**
     * Allows a set of resource prices to be scoped to a certain type of a HAPI operation.
     *
     * For example, the resource prices for a TokenMint operation are different between minting fungible
     * and non-fungible tokens. This enum allows us to "mark" a set of prices as applying to one or the
     * other.
     *
     * Similarly, the resource prices for a basic TokenCreate without a custom fee schedule yield a
     * total price of $1. The resource prices for a TokenCreate with a custom fee schedule are different
     * and yield a total base price of $2.
     */
    enum SubType {
        DEFAULT = 0,
        TOKEN_FUNGIBLE_COMMON = 1,
        TOKEN_NON_FUNGIBLE_UNIQUE = 2,
        TOKEN_FUNGIBLE_COMMON_WITH_CUSTOM_FEES = 3,
        TOKEN_NON_FUNGIBLE_UNIQUE_WITH_CUSTOM_FEES = 4
    }

    /**
     * Possible Token Supply Types (IWA Compatibility).
     * Indicates how many tokens can have during its lifetime.
     */
    enum TokenSupplyType {
        INFINITE = 0,
        FINITE = 1
    }

    /**
     * Possible Freeze statuses returned on TokenGetInfoQuery or CryptoGetInfoResponse in
     * TokenRelationship
     */
    enum TokenFreezeStatus {
        FreezeNotApplicable = 0,
        Frozen = 1,
        Unfrozen = 2
    }

    /** Possible KYC statuses returned on TokenGetInfoQuery or CryptoGetInfoResponse in TokenRelationship */
    enum TokenKycStatus {
        KycNotApplicable = 0,
        Granted = 1,
        Revoked = 2
    }

    /** Possible Pause statuses returned on TokenGetInfoQuery */
    enum TokenPauseStatus {
        PauseNotApplicable = 0,
        Paused = 1,
        Unpaused = 2
    }

    /** Properties of a Key. */
    interface IKey {

        /** smart contract instance that is authorized as if it had signed with a key */
        contractID?: (proto.IContractID|null);

        /** ed25519 public key bytes */
        ed25519?: (Uint8Array|null);

        /** RSA-3072 public key bytes */
        RSA_3072?: (Uint8Array|null);

        /** ECDSA with the p-384 curve public key bytes */
        ECDSA_384?: (Uint8Array|null);

        /**
         * a threshold N followed by a list of M keys, any N of which are required to form a valid
         * signature
         */
        thresholdKey?: (proto.IThresholdKey|null);

        /** A list of Keys of the Key type. */
        keyList?: (proto.IKeyList|null);
    }

    /**
     * A Key can be a public key from one of the three supported systems (ed25519, RSA-3072,  ECDSA with
     * p384). Or, it can be the ID of a smart contract instance, which is authorized to act as if it had
     * a key. If an account has an ed25519 key associated with it, then the corresponding private key
     * must sign any transaction to transfer cryptocurrency out of it. And similarly for RSA and ECDSA.
     *
     * A Key can be a smart contract ID, which means that smart contract is to authorize operations as
     * if it had signed with a key that it owned. The smart contract doesn't actually have a key, and
     * doesn't actually sign a transaction. But it's as if a virtual transaction were created, and the
     * smart contract signed it with a private key.
     *
     * A Key can be a "threshold key", which means a list of M keys, any N of which must sign in order
     * for the threshold signature to be considered valid. The keys within a threshold signature may
     * themselves be threshold signatures, to allow complex signature requirements.
     *
     * A Key can be a "key list" where all keys in the list must sign unless specified otherwise in the
     * documentation for a specific transaction type (e.g.  FileDeleteTransactionBody).  Their use is
     * dependent on context. For example, a Hedera file is created with a list of keys, where all of
     * them must sign a transaction to create or modify the file, but only one of them is needed to sign
     * a transaction to delete the file. So it's a single list that sometimes acts as a 1-of-M threshold
     * key, and sometimes acts as an M-of-M threshold key.  A key list is always an M-of-M, unless
     * specified otherwise in documentation. A key list can have nested key lists or threshold keys.
     * Nested key lists are always M-of-M. A key list can have repeated Ed25519 public keys, but all
     * repeated keys are only required to sign once.
     *
     * A Key can contain a ThresholdKey or KeyList, which in turn contain a Key, so this mutual
     * recursion would allow nesting arbitrarily deep. A ThresholdKey which contains a list of primitive
     * keys (e.g., ed25519) has 3 levels: ThresholdKey -> KeyList -> Key. A KeyList which contains
     * several primitive keys (e.g., ed25519) has 2 levels: KeyList -> Key. A Key with 2 levels of
     * nested ThresholdKeys has 7 levels: Key -> ThresholdKey -> KeyList -> Key -> ThresholdKey ->
     * KeyList -> Key.
     *
     * Each Key should not have more than 46 levels, which implies 15 levels of nested ThresholdKeys.
     * Only ed25519 primitive keys are currently supported.
     */
    class Key implements IKey {

        /**
         * Constructs a new Key.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IKey);

        /** smart contract instance that is authorized as if it had signed with a key */
        public contractID?: (proto.IContractID|null);

        /** ed25519 public key bytes */
        public ed25519?: (Uint8Array|null);

        /** RSA-3072 public key bytes */
        public RSA_3072?: (Uint8Array|null);

        /** ECDSA with the p-384 curve public key bytes */
        public ECDSA_384?: (Uint8Array|null);

        /**
         * a threshold N followed by a list of M keys, any N of which are required to form a valid
         * signature
         */
        public thresholdKey?: (proto.IThresholdKey|null);

        /** A list of Keys of the Key type. */
        public keyList?: (proto.IKeyList|null);

        /** Key key. */
        public key?: ("contractID"|"ed25519"|"RSA_3072"|"ECDSA_384"|"thresholdKey"|"keyList");

        /**
         * Creates a new Key instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Key instance
         */
        public static create(properties?: proto.IKey): proto.Key;

        /**
         * Encodes the specified Key message. Does not implicitly {@link proto.Key.verify|verify} messages.
         * @param m Key message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IKey, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Key message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Key
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.Key;
    }

    /** Properties of a ThresholdKey. */
    interface IThresholdKey {

        /** A valid signature set must have at least this many signatures */
        threshold?: (number|null);

        /** List of all the keys that can sign */
        keys?: (proto.IKeyList|null);
    }

    /**
     * A set of public keys that are used together to form a threshold signature.  If the threshold is N
     * and there are M keys, then this is an N of M threshold signature. If an account is associated
     * with ThresholdKeys, then a transaction to move cryptocurrency out of it must be signed by a list
     * of M signatures, where at most M-N of them are blank, and the other at least N of them are valid
     * signatures corresponding to at least N of the public keys listed here.
     */
    class ThresholdKey implements IThresholdKey {

        /**
         * Constructs a new ThresholdKey.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IThresholdKey);

        /** A valid signature set must have at least this many signatures */
        public threshold: number;

        /** List of all the keys that can sign */
        public keys?: (proto.IKeyList|null);

        /**
         * Creates a new ThresholdKey instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ThresholdKey instance
         */
        public static create(properties?: proto.IThresholdKey): proto.ThresholdKey;

        /**
         * Encodes the specified ThresholdKey message. Does not implicitly {@link proto.ThresholdKey.verify|verify} messages.
         * @param m ThresholdKey message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IThresholdKey, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ThresholdKey message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ThresholdKey
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ThresholdKey;
    }

    /** Properties of a KeyList. */
    interface IKeyList {

        /** list of keys */
        keys?: (proto.IKey[]|null);
    }

    /**
     * A list of keys that requires all keys (M-of-M) to sign unless otherwise specified in
     * documentation. A KeyList may contain repeated keys, but all repeated keys are only required to
     * sign once.
     */
    class KeyList implements IKeyList {

        /**
         * Constructs a new KeyList.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IKeyList);

        /** list of keys */
        public keys: proto.IKey[];

        /**
         * Creates a new KeyList instance using the specified properties.
         * @param [properties] Properties to set
         * @returns KeyList instance
         */
        public static create(properties?: proto.IKeyList): proto.KeyList;

        /**
         * Encodes the specified KeyList message. Does not implicitly {@link proto.KeyList.verify|verify} messages.
         * @param m KeyList message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IKeyList, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a KeyList message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns KeyList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.KeyList;
    }

    /** Properties of a Signature. */
    interface ISignature {

        /** smart contract virtual signature (always length zero) */
        contract?: (Uint8Array|null);

        /** ed25519 signature bytes */
        ed25519?: (Uint8Array|null);

        /** RSA-3072 signature bytes */
        RSA_3072?: (Uint8Array|null);

        /** ECDSA p-384 signature bytes */
        ECDSA_384?: (Uint8Array|null);

        /**
         * A list of signatures for a single N-of-M threshold Key. This must be a list of exactly M
         * signatures, at least N of which are non-null.
         */
        thresholdSignature?: (proto.IThresholdSignature|null);

        /** A list of M signatures, each corresponding to a Key in a KeyList of the same length. */
        signatureList?: (proto.ISignatureList|null);
    }

    /**
     * A Signature corresponding to a Key. It is a sequence of bytes holding a public key signature from
     * one of the three supported systems (ed25519, RSA-3072,  ECDSA with p384). Or, it can be a list of
     * signatures corresponding to a single threshold key. Or, it can be the ID of a smart contract
     * instance, which is authorized to act as if it had a key. If an account has an ed25519 key
     * associated with it, then the corresponding private key must sign any transaction to transfer
     * cryptocurrency out of it.  If it has a smart contract ID associated with it, then that smart
     * contract is allowed to transfer cryptocurrency out of it. The smart contract doesn't actually
     * have a key, and  doesn't actually sign a transaction. But it's as if a virtual transaction were
     * created, and the smart contract signed it with a private key. A key can also be a "threshold
     * key", which means a list of M keys, any N of which must sign in order for the threshold signature
     * to be considered valid. The keys within a threshold signature may themselves be threshold
     * signatures, to allow complex signature requirements (this nesting is not supported in the
     * currently, but will be supported in a future version of API). If a Signature message is missing
     * the "signature" field, then this is considered to be a null signature. That is useful in cases
     * such as threshold signatures, where some of the signatures can be null.  The definition of Key
     * uses mutual recursion, so it allows nesting that is arbitrarily deep. But the current API only
     * accepts Key messages up to 3 levels deep, such as a list of threshold keys, each of which is a
     * list of primitive keys. Therefore, the matching Signature will have the same limitation. This
     * restriction may be relaxed in future versions of the API, to allow deeper nesting.
     *
     * This message is deprecated and succeeded by SignaturePair and SignatureMap messages.
     */
    class Signature implements ISignature {

        /**
         * Constructs a new Signature.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ISignature);

        /** smart contract virtual signature (always length zero) */
        public contract?: (Uint8Array|null);

        /** ed25519 signature bytes */
        public ed25519?: (Uint8Array|null);

        /** RSA-3072 signature bytes */
        public RSA_3072?: (Uint8Array|null);

        /** ECDSA p-384 signature bytes */
        public ECDSA_384?: (Uint8Array|null);

        /**
         * A list of signatures for a single N-of-M threshold Key. This must be a list of exactly M
         * signatures, at least N of which are non-null.
         */
        public thresholdSignature?: (proto.IThresholdSignature|null);

        /** A list of M signatures, each corresponding to a Key in a KeyList of the same length. */
        public signatureList?: (proto.ISignatureList|null);

        /** Signature signature. */
        public signature?: ("contract"|"ed25519"|"RSA_3072"|"ECDSA_384"|"thresholdSignature"|"signatureList");

        /**
         * Creates a new Signature instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Signature instance
         */
        public static create(properties?: proto.ISignature): proto.Signature;

        /**
         * Encodes the specified Signature message. Does not implicitly {@link proto.Signature.verify|verify} messages.
         * @param m Signature message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ISignature, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Signature message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Signature
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.Signature;
    }

    /** Properties of a ThresholdSignature. */
    interface IThresholdSignature {

        /**
         * for an N-of-M threshold key, this is a list of M signatures, at least N of which must be
         * non-null
         */
        sigs?: (proto.ISignatureList|null);
    }

    /**
     * A signature corresponding to a ThresholdKey. For an N-of-M threshold key, this is a list of M
     * signatures, at least N of which must be non-null.  This message is deprecated and succeeded by
     * SignaturePair and SignatureMap messages.
     */
    class ThresholdSignature implements IThresholdSignature {

        /**
         * Constructs a new ThresholdSignature.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IThresholdSignature);

        /**
         * for an N-of-M threshold key, this is a list of M signatures, at least N of which must be
         * non-null
         */
        public sigs?: (proto.ISignatureList|null);

        /**
         * Creates a new ThresholdSignature instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ThresholdSignature instance
         */
        public static create(properties?: proto.IThresholdSignature): proto.ThresholdSignature;

        /**
         * Encodes the specified ThresholdSignature message. Does not implicitly {@link proto.ThresholdSignature.verify|verify} messages.
         * @param m ThresholdSignature message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IThresholdSignature, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ThresholdSignature message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ThresholdSignature
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ThresholdSignature;
    }

    /** Properties of a SignatureList. */
    interface ISignatureList {

        /** each signature corresponds to a Key in the KeyList */
        sigs?: (proto.ISignature[]|null);
    }

    /**
     * The signatures corresponding to a KeyList of the same length.  This message is deprecated and
     * succeeded by SignaturePair and SignatureMap messages.
     */
    class SignatureList implements ISignatureList {

        /**
         * Constructs a new SignatureList.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ISignatureList);

        /** each signature corresponds to a Key in the KeyList */
        public sigs: proto.ISignature[];

        /**
         * Creates a new SignatureList instance using the specified properties.
         * @param [properties] Properties to set
         * @returns SignatureList instance
         */
        public static create(properties?: proto.ISignatureList): proto.SignatureList;

        /**
         * Encodes the specified SignatureList message. Does not implicitly {@link proto.SignatureList.verify|verify} messages.
         * @param m SignatureList message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ISignatureList, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SignatureList message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns SignatureList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.SignatureList;
    }

    /** Properties of a SignaturePair. */
    interface ISignaturePair {

        /** First few bytes of the public key */
        pubKeyPrefix?: (Uint8Array|null);

        /** smart contract virtual signature (always length zero) */
        contract?: (Uint8Array|null);

        /** ed25519 signature */
        ed25519?: (Uint8Array|null);

        /** RSA-3072 signature */
        RSA_3072?: (Uint8Array|null);

        /** ECDSA p-384 signature */
        ECDSA_384?: (Uint8Array|null);
    }

    /**
     * The client may use any number of bytes from 0 to the whole length of the public key for
     * pubKeyPrefix.  If 0 bytes is used, then it is assumed that only one public key is used to sign.
     * Only ed25519 keys and hence signatures are currently supported.
     */
    class SignaturePair implements ISignaturePair {

        /**
         * Constructs a new SignaturePair.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ISignaturePair);

        /** First few bytes of the public key */
        public pubKeyPrefix: Uint8Array;

        /** smart contract virtual signature (always length zero) */
        public contract?: (Uint8Array|null);

        /** ed25519 signature */
        public ed25519?: (Uint8Array|null);

        /** RSA-3072 signature */
        public RSA_3072?: (Uint8Array|null);

        /** ECDSA p-384 signature */
        public ECDSA_384?: (Uint8Array|null);

        /** SignaturePair signature. */
        public signature?: ("contract"|"ed25519"|"RSA_3072"|"ECDSA_384");

        /**
         * Creates a new SignaturePair instance using the specified properties.
         * @param [properties] Properties to set
         * @returns SignaturePair instance
         */
        public static create(properties?: proto.ISignaturePair): proto.SignaturePair;

        /**
         * Encodes the specified SignaturePair message. Does not implicitly {@link proto.SignaturePair.verify|verify} messages.
         * @param m SignaturePair message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ISignaturePair, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SignaturePair message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns SignaturePair
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.SignaturePair;
    }

    /** Properties of a SignatureMap. */
    interface ISignatureMap {

        /** Each signature pair corresponds to a unique Key required to sign the transaction. */
        sigPair?: (proto.ISignaturePair[]|null);
    }

    /**
     * A set of signatures corresponding to every unique public key used to sign a given transaction. If
     * one public key matches more than one prefixes on the signature map, the transaction containing
     * the map will fail immediately with the response code KEY_PREFIX_MISMATCH.
     */
    class SignatureMap implements ISignatureMap {

        /**
         * Constructs a new SignatureMap.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ISignatureMap);

        /** Each signature pair corresponds to a unique Key required to sign the transaction. */
        public sigPair: proto.ISignaturePair[];

        /**
         * Creates a new SignatureMap instance using the specified properties.
         * @param [properties] Properties to set
         * @returns SignatureMap instance
         */
        public static create(properties?: proto.ISignatureMap): proto.SignatureMap;

        /**
         * Encodes the specified SignatureMap message. Does not implicitly {@link proto.SignatureMap.verify|verify} messages.
         * @param m SignatureMap message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ISignatureMap, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SignatureMap message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns SignatureMap
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.SignatureMap;
    }

    /** The transactions and queries supported by Hedera Hashgraph. */
    enum HederaFunctionality {
        NONE = 0,
        CryptoTransfer = 1,
        CryptoUpdate = 2,
        CryptoDelete = 3,
        CryptoAddLiveHash = 4,
        CryptoDeleteLiveHash = 5,
        ContractCall = 6,
        ContractCreate = 7,
        ContractUpdate = 8,
        FileCreate = 9,
        FileAppend = 10,
        FileUpdate = 11,
        FileDelete = 12,
        CryptoGetAccountBalance = 13,
        CryptoGetAccountRecords = 14,
        CryptoGetInfo = 15,
        ContractCallLocal = 16,
        ContractGetInfo = 17,
        ContractGetBytecode = 18,
        GetBySolidityID = 19,
        GetByKey = 20,
        CryptoGetLiveHash = 21,
        CryptoGetStakers = 22,
        FileGetContents = 23,
        FileGetInfo = 24,
        TransactionGetRecord = 25,
        ContractGetRecords = 26,
        CryptoCreate = 27,
        SystemDelete = 28,
        SystemUndelete = 29,
        ContractDelete = 30,
        Freeze = 31,
        CreateTransactionRecord = 32,
        CryptoAccountAutoRenew = 33,
        ContractAutoRenew = 34,
        GetVersionInfo = 35,
        TransactionGetReceipt = 36,
        ConsensusCreateTopic = 50,
        ConsensusUpdateTopic = 51,
        ConsensusDeleteTopic = 52,
        ConsensusGetTopicInfo = 53,
        ConsensusSubmitMessage = 54,
        UncheckedSubmit = 55,
        TokenCreate = 56,
        TokenGetInfo = 58,
        TokenFreezeAccount = 59,
        TokenUnfreezeAccount = 60,
        TokenGrantKycToAccount = 61,
        TokenRevokeKycFromAccount = 62,
        TokenDelete = 63,
        TokenUpdate = 64,
        TokenMint = 65,
        TokenBurn = 66,
        TokenAccountWipe = 67,
        TokenAssociateToAccount = 68,
        TokenDissociateFromAccount = 69,
        ScheduleCreate = 70,
        ScheduleDelete = 71,
        ScheduleSign = 72,
        ScheduleGetInfo = 73,
        TokenGetAccountNftInfos = 74,
        TokenGetNftInfo = 75,
        TokenGetNftInfos = 76,
        TokenFeeScheduleUpdate = 77,
        TokenPause = 79,
        TokenUnpause = 80
    }

    /** Properties of a FeeComponents. */
    interface IFeeComponents {

        /** A minimum, the calculated fee must be greater than this value */
        min?: (Long|null);

        /** A maximum, the calculated fee must be less than this value */
        max?: (Long|null);

        /** A constant contribution to the fee */
        constant?: (Long|null);

        /** The price of bandwidth consumed by a transaction, measured in bytes */
        bpt?: (Long|null);

        /** The price per signature verification for a transaction */
        vpt?: (Long|null);

        /** The price of RAM consumed by a transaction, measured in byte-hours */
        rbh?: (Long|null);

        /** The price of storage consumed by a transaction, measured in byte-hours */
        sbh?: (Long|null);

        /** The price of computation for a smart contract transaction, measured in gas */
        gas?: (Long|null);

        /** The price per hbar transferred for a transfer */
        tv?: (Long|null);

        /** The price of bandwidth for data retrieved from memory for a response, measured in bytes */
        bpr?: (Long|null);

        /** The price of bandwidth for data retrieved from disk for a response, measured in bytes */
        sbpr?: (Long|null);
    }

    /**
     * A set of prices the nodes use in determining transaction and query fees, and constants involved
     * in fee calculations.  Nodes multiply the amount of resources consumed by a transaction or query
     * by the corresponding price to calculate the appropriate fee. Units are one-thousandth of a
     * tinyCent.
     */
    class FeeComponents implements IFeeComponents {

        /**
         * Constructs a new FeeComponents.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IFeeComponents);

        /** A minimum, the calculated fee must be greater than this value */
        public min: Long;

        /** A maximum, the calculated fee must be less than this value */
        public max: Long;

        /** A constant contribution to the fee */
        public constant: Long;

        /** The price of bandwidth consumed by a transaction, measured in bytes */
        public bpt: Long;

        /** The price per signature verification for a transaction */
        public vpt: Long;

        /** The price of RAM consumed by a transaction, measured in byte-hours */
        public rbh: Long;

        /** The price of storage consumed by a transaction, measured in byte-hours */
        public sbh: Long;

        /** The price of computation for a smart contract transaction, measured in gas */
        public gas: Long;

        /** The price per hbar transferred for a transfer */
        public tv: Long;

        /** The price of bandwidth for data retrieved from memory for a response, measured in bytes */
        public bpr: Long;

        /** The price of bandwidth for data retrieved from disk for a response, measured in bytes */
        public sbpr: Long;

        /**
         * Creates a new FeeComponents instance using the specified properties.
         * @param [properties] Properties to set
         * @returns FeeComponents instance
         */
        public static create(properties?: proto.IFeeComponents): proto.FeeComponents;

        /**
         * Encodes the specified FeeComponents message. Does not implicitly {@link proto.FeeComponents.verify|verify} messages.
         * @param m FeeComponents message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IFeeComponents, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a FeeComponents message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns FeeComponents
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.FeeComponents;
    }

    /** Properties of a TransactionFeeSchedule. */
    interface ITransactionFeeSchedule {

        /** A particular transaction or query */
        hederaFunctionality?: (proto.HederaFunctionality|null);

        /** Resource price coefficients */
        feeData?: (proto.IFeeData|null);

        /** Resource price coefficients. Supports subtype price definition. */
        fees?: (proto.IFeeData[]|null);
    }

    /** The fees for a specific transaction or query based on the fee data. */
    class TransactionFeeSchedule implements ITransactionFeeSchedule {

        /**
         * Constructs a new TransactionFeeSchedule.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITransactionFeeSchedule);

        /** A particular transaction or query */
        public hederaFunctionality: proto.HederaFunctionality;

        /** Resource price coefficients */
        public feeData?: (proto.IFeeData|null);

        /** Resource price coefficients. Supports subtype price definition. */
        public fees: proto.IFeeData[];

        /**
         * Creates a new TransactionFeeSchedule instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TransactionFeeSchedule instance
         */
        public static create(properties?: proto.ITransactionFeeSchedule): proto.TransactionFeeSchedule;

        /**
         * Encodes the specified TransactionFeeSchedule message. Does not implicitly {@link proto.TransactionFeeSchedule.verify|verify} messages.
         * @param m TransactionFeeSchedule message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITransactionFeeSchedule, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TransactionFeeSchedule message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TransactionFeeSchedule
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TransactionFeeSchedule;
    }

    /** Properties of a FeeData. */
    interface IFeeData {

        /** Fee paid to the submitting node */
        nodedata?: (proto.IFeeComponents|null);

        /** Fee paid to the network for processing a transaction into consensus */
        networkdata?: (proto.IFeeComponents|null);

        /**
         * Fee paid to the network for providing the service associated with the
         * transaction; for instance, storing a file
         */
        servicedata?: (proto.IFeeComponents|null);

        /**
         * SubType distinguishing between different types of FeeData, correlating
         * to the same HederaFunctionality
         */
        subType?: (proto.SubType|null);
    }

    /**
     * The total fee charged for a transaction. It is composed of three components – a node fee that
     * compensates the specific node that submitted the transaction, a network fee that compensates the
     * network for assigning the transaction a consensus timestamp, and a service fee that compensates
     * the network for the ongoing maintenance of the consequences of the transaction.
     */
    class FeeData implements IFeeData {

        /**
         * Constructs a new FeeData.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IFeeData);

        /** Fee paid to the submitting node */
        public nodedata?: (proto.IFeeComponents|null);

        /** Fee paid to the network for processing a transaction into consensus */
        public networkdata?: (proto.IFeeComponents|null);

        /**
         * Fee paid to the network for providing the service associated with the
         * transaction; for instance, storing a file
         */
        public servicedata?: (proto.IFeeComponents|null);

        /**
         * SubType distinguishing between different types of FeeData, correlating
         * to the same HederaFunctionality
         */
        public subType: proto.SubType;

        /**
         * Creates a new FeeData instance using the specified properties.
         * @param [properties] Properties to set
         * @returns FeeData instance
         */
        public static create(properties?: proto.IFeeData): proto.FeeData;

        /**
         * Encodes the specified FeeData message. Does not implicitly {@link proto.FeeData.verify|verify} messages.
         * @param m FeeData message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IFeeData, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a FeeData message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns FeeData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.FeeData;
    }

    /** Properties of a FeeSchedule. */
    interface IFeeSchedule {

        /** List of price coefficients for network resources */
        transactionFeeSchedule?: (proto.ITransactionFeeSchedule[]|null);

        /** FeeSchedule expiry time */
        expiryTime?: (proto.ITimestampSeconds|null);
    }

    /**
     * A list of resource prices fee for different transactions and queries and the time period at which
     * this fee schedule will expire. Nodes use the prices to determine the fees for all transactions
     * based on how much of those resources each transaction uses.
     */
    class FeeSchedule implements IFeeSchedule {

        /**
         * Constructs a new FeeSchedule.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IFeeSchedule);

        /** List of price coefficients for network resources */
        public transactionFeeSchedule: proto.ITransactionFeeSchedule[];

        /** FeeSchedule expiry time */
        public expiryTime?: (proto.ITimestampSeconds|null);

        /**
         * Creates a new FeeSchedule instance using the specified properties.
         * @param [properties] Properties to set
         * @returns FeeSchedule instance
         */
        public static create(properties?: proto.IFeeSchedule): proto.FeeSchedule;

        /**
         * Encodes the specified FeeSchedule message. Does not implicitly {@link proto.FeeSchedule.verify|verify} messages.
         * @param m FeeSchedule message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IFeeSchedule, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a FeeSchedule message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns FeeSchedule
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.FeeSchedule;
    }

    /** Properties of a CurrentAndNextFeeSchedule. */
    interface ICurrentAndNextFeeSchedule {

        /** Contains current Fee Schedule */
        currentFeeSchedule?: (proto.IFeeSchedule|null);

        /** Contains next Fee Schedule */
        nextFeeSchedule?: (proto.IFeeSchedule|null);
    }

    /** This contains two Fee Schedules with expiry timestamp. */
    class CurrentAndNextFeeSchedule implements ICurrentAndNextFeeSchedule {

        /**
         * Constructs a new CurrentAndNextFeeSchedule.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ICurrentAndNextFeeSchedule);

        /** Contains current Fee Schedule */
        public currentFeeSchedule?: (proto.IFeeSchedule|null);

        /** Contains next Fee Schedule */
        public nextFeeSchedule?: (proto.IFeeSchedule|null);

        /**
         * Creates a new CurrentAndNextFeeSchedule instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CurrentAndNextFeeSchedule instance
         */
        public static create(properties?: proto.ICurrentAndNextFeeSchedule): proto.CurrentAndNextFeeSchedule;

        /**
         * Encodes the specified CurrentAndNextFeeSchedule message. Does not implicitly {@link proto.CurrentAndNextFeeSchedule.verify|verify} messages.
         * @param m CurrentAndNextFeeSchedule message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ICurrentAndNextFeeSchedule, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CurrentAndNextFeeSchedule message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns CurrentAndNextFeeSchedule
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.CurrentAndNextFeeSchedule;
    }

    /** Properties of a ServiceEndpoint. */
    interface IServiceEndpoint {

        /**
         * The 32-bit IPv4 address of the node encoded in left to right order (e.g.  127.0.0.1 has 127
         * as its first byte)
         */
        ipAddressV4?: (Uint8Array|null);

        /** The port of the node */
        port?: (number|null);
    }

    /**
     * Contains the IP address and the port representing a service endpoint of a Node in a network. Used
     * to reach the Hedera API and submit transactions to the network.
     */
    class ServiceEndpoint implements IServiceEndpoint {

        /**
         * Constructs a new ServiceEndpoint.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IServiceEndpoint);

        /**
         * The 32-bit IPv4 address of the node encoded in left to right order (e.g.  127.0.0.1 has 127
         * as its first byte)
         */
        public ipAddressV4: Uint8Array;

        /** The port of the node */
        public port: number;

        /**
         * Creates a new ServiceEndpoint instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ServiceEndpoint instance
         */
        public static create(properties?: proto.IServiceEndpoint): proto.ServiceEndpoint;

        /**
         * Encodes the specified ServiceEndpoint message. Does not implicitly {@link proto.ServiceEndpoint.verify|verify} messages.
         * @param m ServiceEndpoint message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IServiceEndpoint, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ServiceEndpoint message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ServiceEndpoint
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ServiceEndpoint;
    }

    /** Properties of a NodeAddress. */
    interface INodeAddress {

        /**
         * The IP address of the Node with separator & octets encoded in UTF-8.  Usage is deprecated,
         * ServiceEndpoint is preferred to retrieve a node's list of IP addresses and ports
         */
        ipAddress?: (Uint8Array|null);

        /**
         * The port number of the grpc server for the node.  Usage is deprecated, ServiceEndpoint is
         * preferred to retrieve a node's list of IP addresses and ports
         */
        portno?: (number|null);

        /** Usage is deprecated, nodeAccountId is preferred to retrieve a node's account ID */
        memo?: (Uint8Array|null);

        /**
         * The node's X509 RSA public key used to sign stream files (e.g., record stream
         * files). Precisely, this field is a string of hexadecimal characters which,
         * translated to binary, are the public key's DER encoding.
         */
        RSA_PubKey?: (string|null);

        /** # A non-sequential identifier for the node */
        nodeId?: (Long|null);

        /** # The account to be paid for queries and transactions sent to this node */
        nodeAccountId?: (proto.IAccountID|null);

        /**
         * # Hash of the node's TLS certificate. Precisely, this field is a string of
         * hexadecimal characters which, translated to binary, are the SHA-384 hash of
         * the UTF-8 NFKD encoding of the node's TLS cert in PEM format. Its value can be
         * used to verify the node's certificate it presents during TLS negotiations.
         */
        nodeCertHash?: (Uint8Array|null);

        /** # A node's service IP addresses and ports */
        serviceEndpoint?: (proto.IServiceEndpoint[]|null);

        /** A description of the node, with UTF-8 encoding up to 100 bytes */
        description?: (string|null);

        /** The amount of tinybars staked to the node */
        stake?: (Long|null);
    }

    /**
     * The data about a node, including its service endpoints and the Hedera account to be paid for
     * services provided by the node (that is, queries answered and transactions submitted.)
     *
     * If the <tt>serviceEndpoint</tt> list is not set, or empty, then the endpoint given by the
     * (deprecated) <tt>ipAddress</tt> and <tt>portno</tt> fields should be used.
     *
     * All fields are populated in the 0.0.102 address book file while only fields that start with # are
     * populated in the 0.0.101 address book file.
     */
    class NodeAddress implements INodeAddress {

        /**
         * Constructs a new NodeAddress.
         * @param [p] Properties to set
         */
        constructor(p?: proto.INodeAddress);

        /**
         * The IP address of the Node with separator & octets encoded in UTF-8.  Usage is deprecated,
         * ServiceEndpoint is preferred to retrieve a node's list of IP addresses and ports
         */
        public ipAddress: Uint8Array;

        /**
         * The port number of the grpc server for the node.  Usage is deprecated, ServiceEndpoint is
         * preferred to retrieve a node's list of IP addresses and ports
         */
        public portno: number;

        /** Usage is deprecated, nodeAccountId is preferred to retrieve a node's account ID */
        public memo: Uint8Array;

        /**
         * The node's X509 RSA public key used to sign stream files (e.g., record stream
         * files). Precisely, this field is a string of hexadecimal characters which,
         * translated to binary, are the public key's DER encoding.
         */
        public RSA_PubKey: string;

        /** # A non-sequential identifier for the node */
        public nodeId: Long;

        /** # The account to be paid for queries and transactions sent to this node */
        public nodeAccountId?: (proto.IAccountID|null);

        /**
         * # Hash of the node's TLS certificate. Precisely, this field is a string of
         * hexadecimal characters which, translated to binary, are the SHA-384 hash of
         * the UTF-8 NFKD encoding of the node's TLS cert in PEM format. Its value can be
         * used to verify the node's certificate it presents during TLS negotiations.
         */
        public nodeCertHash: Uint8Array;

        /** # A node's service IP addresses and ports */
        public serviceEndpoint: proto.IServiceEndpoint[];

        /** A description of the node, with UTF-8 encoding up to 100 bytes */
        public description: string;

        /** The amount of tinybars staked to the node */
        public stake: Long;

        /**
         * Creates a new NodeAddress instance using the specified properties.
         * @param [properties] Properties to set
         * @returns NodeAddress instance
         */
        public static create(properties?: proto.INodeAddress): proto.NodeAddress;

        /**
         * Encodes the specified NodeAddress message. Does not implicitly {@link proto.NodeAddress.verify|verify} messages.
         * @param m NodeAddress message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.INodeAddress, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a NodeAddress message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns NodeAddress
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.NodeAddress;
    }

    /** Properties of a NodeAddressBook. */
    interface INodeAddressBook {

        /** Metadata of all nodes in the network */
        nodeAddress?: (proto.INodeAddress[]|null);
    }

    /**
     * A list of nodes and their metadata that contains all details of the nodes for the network.  Used
     * to parse the contents of system files <tt>0.0.101</tt> and <tt>0.0.102</tt>.
     */
    class NodeAddressBook implements INodeAddressBook {

        /**
         * Constructs a new NodeAddressBook.
         * @param [p] Properties to set
         */
        constructor(p?: proto.INodeAddressBook);

        /** Metadata of all nodes in the network */
        public nodeAddress: proto.INodeAddress[];

        /**
         * Creates a new NodeAddressBook instance using the specified properties.
         * @param [properties] Properties to set
         * @returns NodeAddressBook instance
         */
        public static create(properties?: proto.INodeAddressBook): proto.NodeAddressBook;

        /**
         * Encodes the specified NodeAddressBook message. Does not implicitly {@link proto.NodeAddressBook.verify|verify} messages.
         * @param m NodeAddressBook message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.INodeAddressBook, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a NodeAddressBook message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns NodeAddressBook
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.NodeAddressBook;
    }

    /** Properties of a SemanticVersion. */
    interface ISemanticVersion {

        /** Increases with incompatible API changes */
        major?: (number|null);

        /** Increases with backwards-compatible new functionality */
        minor?: (number|null);

        /** Increases with backwards-compatible bug fixes */
        patch?: (number|null);

        /**
         * A pre-release version MAY be denoted by appending a hyphen and a series of dot separated
         * identifiers (https://semver.org/#spec-item-9); so given a semver 0.14.0-alpha.1+21AF26D3,
         * this field would contain 'alpha.1'
         */
        pre?: (string|null);

        /**
         * Build metadata MAY be denoted by appending a plus sign and a series of dot separated
         * identifiers immediately following the patch or pre-release version
         * (https://semver.org/#spec-item-10); so given a semver 0.14.0-alpha.1+21AF26D3, this field
         * would contain '21AF26D3'
         */
        build?: (string|null);
    }

    /**
     * Hedera follows semantic versioning (https://semver.org/) for both the HAPI protobufs and the
     * Services software.  This type allows the <tt>getVersionInfo</tt> query in the
     * <tt>NetworkService</tt> to return the deployed versions of both protobufs and software on the
     * node answering the query.
     */
    class SemanticVersion implements ISemanticVersion {

        /**
         * Constructs a new SemanticVersion.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ISemanticVersion);

        /** Increases with incompatible API changes */
        public major: number;

        /** Increases with backwards-compatible new functionality */
        public minor: number;

        /** Increases with backwards-compatible bug fixes */
        public patch: number;

        /**
         * A pre-release version MAY be denoted by appending a hyphen and a series of dot separated
         * identifiers (https://semver.org/#spec-item-9); so given a semver 0.14.0-alpha.1+21AF26D3,
         * this field would contain 'alpha.1'
         */
        public pre: string;

        /**
         * Build metadata MAY be denoted by appending a plus sign and a series of dot separated
         * identifiers immediately following the patch or pre-release version
         * (https://semver.org/#spec-item-10); so given a semver 0.14.0-alpha.1+21AF26D3, this field
         * would contain '21AF26D3'
         */
        public build: string;

        /**
         * Creates a new SemanticVersion instance using the specified properties.
         * @param [properties] Properties to set
         * @returns SemanticVersion instance
         */
        public static create(properties?: proto.ISemanticVersion): proto.SemanticVersion;

        /**
         * Encodes the specified SemanticVersion message. Does not implicitly {@link proto.SemanticVersion.verify|verify} messages.
         * @param m SemanticVersion message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ISemanticVersion, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SemanticVersion message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns SemanticVersion
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.SemanticVersion;
    }

    /** Properties of a Setting. */
    interface ISetting {

        /** name of the property */
        name?: (string|null);

        /** value of the property */
        value?: (string|null);

        /** any data associated with property */
        data?: (Uint8Array|null);
    }

    /** UNDOCUMENTED */
    class Setting implements ISetting {

        /**
         * Constructs a new Setting.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ISetting);

        /** name of the property */
        public name: string;

        /** value of the property */
        public value: string;

        /** any data associated with property */
        public data: Uint8Array;

        /**
         * Creates a new Setting instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Setting instance
         */
        public static create(properties?: proto.ISetting): proto.Setting;

        /**
         * Encodes the specified Setting message. Does not implicitly {@link proto.Setting.verify|verify} messages.
         * @param m Setting message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ISetting, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Setting message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Setting
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.Setting;
    }

    /** Properties of a ServicesConfigurationList. */
    interface IServicesConfigurationList {

        /** list of name value pairs of the application properties */
        nameValue?: (proto.ISetting[]|null);
    }

    /** UNDOCUMENTED */
    class ServicesConfigurationList implements IServicesConfigurationList {

        /**
         * Constructs a new ServicesConfigurationList.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IServicesConfigurationList);

        /** list of name value pairs of the application properties */
        public nameValue: proto.ISetting[];

        /**
         * Creates a new ServicesConfigurationList instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ServicesConfigurationList instance
         */
        public static create(properties?: proto.IServicesConfigurationList): proto.ServicesConfigurationList;

        /**
         * Encodes the specified ServicesConfigurationList message. Does not implicitly {@link proto.ServicesConfigurationList.verify|verify} messages.
         * @param m ServicesConfigurationList message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IServicesConfigurationList, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ServicesConfigurationList message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ServicesConfigurationList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ServicesConfigurationList;
    }

    /** Properties of a TokenRelationship. */
    interface ITokenRelationship {

        /** The ID of the token */
        tokenId?: (proto.ITokenID|null);

        /** The Symbol of the token */
        symbol?: (string|null);

        /**
         * For token of type FUNGIBLE_COMMON - the balance that the Account holds in the smallest
         * denomination. For token of type NON_FUNGIBLE_UNIQUE - the number of NFTs held by the account
         */
        balance?: (Long|null);

        /**
         * The KYC status of the account (KycNotApplicable, Granted or Revoked). If the token does not
         * have KYC key, KycNotApplicable is returned
         */
        kycStatus?: (proto.TokenKycStatus|null);

        /**
         * The Freeze status of the account (FreezeNotApplicable, Frozen or Unfrozen). If the token does
         * not have Freeze key, FreezeNotApplicable is returned
         */
        freezeStatus?: (proto.TokenFreezeStatus|null);

        /** Tokens divide into <tt>10<sup>decimals</sup></tt> pieces */
        decimals?: (number|null);

        /**
         * Specifies if the relationship is created implicitly. False : explicitly associated, True :
         * implicitly associated.
         */
        automaticAssociation?: (boolean|null);
    }

    /** Token's information related to the given Account */
    class TokenRelationship implements ITokenRelationship {

        /**
         * Constructs a new TokenRelationship.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITokenRelationship);

        /** The ID of the token */
        public tokenId?: (proto.ITokenID|null);

        /** The Symbol of the token */
        public symbol: string;

        /**
         * For token of type FUNGIBLE_COMMON - the balance that the Account holds in the smallest
         * denomination. For token of type NON_FUNGIBLE_UNIQUE - the number of NFTs held by the account
         */
        public balance: Long;

        /**
         * The KYC status of the account (KycNotApplicable, Granted or Revoked). If the token does not
         * have KYC key, KycNotApplicable is returned
         */
        public kycStatus: proto.TokenKycStatus;

        /**
         * The Freeze status of the account (FreezeNotApplicable, Frozen or Unfrozen). If the token does
         * not have Freeze key, FreezeNotApplicable is returned
         */
        public freezeStatus: proto.TokenFreezeStatus;

        /** Tokens divide into <tt>10<sup>decimals</sup></tt> pieces */
        public decimals: number;

        /**
         * Specifies if the relationship is created implicitly. False : explicitly associated, True :
         * implicitly associated.
         */
        public automaticAssociation: boolean;

        /**
         * Creates a new TokenRelationship instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TokenRelationship instance
         */
        public static create(properties?: proto.ITokenRelationship): proto.TokenRelationship;

        /**
         * Encodes the specified TokenRelationship message. Does not implicitly {@link proto.TokenRelationship.verify|verify} messages.
         * @param m TokenRelationship message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITokenRelationship, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TokenRelationship message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TokenRelationship
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TokenRelationship;
    }

    /** Properties of a TokenBalance. */
    interface ITokenBalance {

        /** A unique token id */
        tokenId?: (proto.ITokenID|null);

        /**
         * Number of transferable units of the identified token. For token of type FUNGIBLE_COMMON -
         * balance in the smallest denomination. For token of type NON_FUNGIBLE_UNIQUE - the number of
         * NFTs held by the account
         */
        balance?: (Long|null);

        /** Tokens divide into <tt>10<sup>decimals</sup></tt> pieces */
        decimals?: (number|null);
    }

    /**
     * A number of <i>transferable units</i> of a certain token.
     *
     * The transferable unit of a token is its smallest denomination, as given by the token's
     * <tt>decimals</tt> property---each minted token contains <tt>10<sup>decimals</sup></tt>
     * transferable units. For example, we could think of the cent as the transferable unit of the US
     * dollar (<tt>decimals=2</tt>); and the tinybar as the transferable unit of hbar
     * (<tt>decimals=8</tt>).
     *
     * Transferable units are not directly comparable across different tokens.
     */
    class TokenBalance implements ITokenBalance {

        /**
         * Constructs a new TokenBalance.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITokenBalance);

        /** A unique token id */
        public tokenId?: (proto.ITokenID|null);

        /**
         * Number of transferable units of the identified token. For token of type FUNGIBLE_COMMON -
         * balance in the smallest denomination. For token of type NON_FUNGIBLE_UNIQUE - the number of
         * NFTs held by the account
         */
        public balance: Long;

        /** Tokens divide into <tt>10<sup>decimals</sup></tt> pieces */
        public decimals: number;

        /**
         * Creates a new TokenBalance instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TokenBalance instance
         */
        public static create(properties?: proto.ITokenBalance): proto.TokenBalance;

        /**
         * Encodes the specified TokenBalance message. Does not implicitly {@link proto.TokenBalance.verify|verify} messages.
         * @param m TokenBalance message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITokenBalance, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TokenBalance message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TokenBalance
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TokenBalance;
    }

    /** Properties of a TokenBalances. */
    interface ITokenBalances {

        /** TokenBalances tokenBalances */
        tokenBalances?: (proto.ITokenBalance[]|null);
    }

    /** A sequence of token balances */
    class TokenBalances implements ITokenBalances {

        /**
         * Constructs a new TokenBalances.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITokenBalances);

        /** TokenBalances tokenBalances. */
        public tokenBalances: proto.ITokenBalance[];

        /**
         * Creates a new TokenBalances instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TokenBalances instance
         */
        public static create(properties?: proto.ITokenBalances): proto.TokenBalances;

        /**
         * Encodes the specified TokenBalances message. Does not implicitly {@link proto.TokenBalances.verify|verify} messages.
         * @param m TokenBalances message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITokenBalances, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TokenBalances message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TokenBalances
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TokenBalances;
    }

    /** Properties of a TokenAssociation. */
    interface ITokenAssociation {

        /** TokenAssociation tokenId */
        tokenId?: (proto.ITokenID|null);

        /** TokenAssociation accountId */
        accountId?: (proto.IAccountID|null);
    }

    /** Represents a TokenAssociation. */
    class TokenAssociation implements ITokenAssociation {

        /**
         * Constructs a new TokenAssociation.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITokenAssociation);

        /** TokenAssociation tokenId. */
        public tokenId?: (proto.ITokenID|null);

        /** TokenAssociation accountId. */
        public accountId?: (proto.IAccountID|null);

        /**
         * Creates a new TokenAssociation instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TokenAssociation instance
         */
        public static create(properties?: proto.ITokenAssociation): proto.TokenAssociation;

        /**
         * Encodes the specified TokenAssociation message. Does not implicitly {@link proto.TokenAssociation.verify|verify} messages.
         * @param m TokenAssociation message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITokenAssociation, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TokenAssociation message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TokenAssociation
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TokenAssociation;
    }

    /** Properties of a Timestamp. */
    interface ITimestamp {

        /** Number of complete seconds since the start of the epoch */
        seconds?: (Long|null);

        /** Number of nanoseconds since the start of the last second */
        nanos?: (number|null);
    }

    /**
     * An exact date and time. This is the same data structure as the protobuf Timestamp.proto (see the
     * comments in https://github.com/google/protobuf/blob/master/src/google/protobuf/timestamp.proto)
     */
    class Timestamp implements ITimestamp {

        /**
         * Constructs a new Timestamp.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITimestamp);

        /** Number of complete seconds since the start of the epoch */
        public seconds: Long;

        /** Number of nanoseconds since the start of the last second */
        public nanos: number;

        /**
         * Creates a new Timestamp instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Timestamp instance
         */
        public static create(properties?: proto.ITimestamp): proto.Timestamp;

        /**
         * Encodes the specified Timestamp message. Does not implicitly {@link proto.Timestamp.verify|verify} messages.
         * @param m Timestamp message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITimestamp, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Timestamp message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Timestamp
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.Timestamp;
    }

    /** Properties of a TimestampSeconds. */
    interface ITimestampSeconds {

        /** Number of complete seconds since the start of the epoch */
        seconds?: (Long|null);
    }

    /** An exact date and time,  with a resolution of one second (no nanoseconds). */
    class TimestampSeconds implements ITimestampSeconds {

        /**
         * Constructs a new TimestampSeconds.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITimestampSeconds);

        /** Number of complete seconds since the start of the epoch */
        public seconds: Long;

        /**
         * Creates a new TimestampSeconds instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TimestampSeconds instance
         */
        public static create(properties?: proto.ITimestampSeconds): proto.TimestampSeconds;

        /**
         * Encodes the specified TimestampSeconds message. Does not implicitly {@link proto.TimestampSeconds.verify|verify} messages.
         * @param m TimestampSeconds message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITimestampSeconds, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TimestampSeconds message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TimestampSeconds
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TimestampSeconds;
    }

    /** Properties of a ConsensusCreateTopicTransactionBody. */
    interface IConsensusCreateTopicTransactionBody {

        /** Short publicly visible memo about the topic. No guarantee of uniqueness. */
        memo?: (string|null);

        /**
         * Access control for updateTopic/deleteTopic.
         * Anyone can increase the topic's expirationTime via ConsensusService.updateTopic(), regardless of the adminKey.
         * If no adminKey is specified, updateTopic may only be used to extend the topic's expirationTime, and deleteTopic
         * is disallowed.
         */
        adminKey?: (proto.IKey|null);

        /**
         * Access control for submitMessage.
         * If unspecified, no access control is performed on ConsensusService.submitMessage (all submissions are allowed).
         */
        submitKey?: (proto.IKey|null);

        /**
         * The initial lifetime of the topic and the amount of time to attempt to extend the topic's lifetime by
         * automatically at the topic's expirationTime, if the autoRenewAccount is configured (once autoRenew functionality
         * is supported by HAPI).
         * Limited to MIN_AUTORENEW_PERIOD and MAX_AUTORENEW_PERIOD value by server-side configuration.
         * Required.
         */
        autoRenewPeriod?: (proto.IDuration|null);

        /**
         * Optional account to be used at the topic's expirationTime to extend the life of the topic (once autoRenew
         * functionality is supported by HAPI).
         * The topic lifetime will be extended up to a maximum of the autoRenewPeriod or however long the topic
         * can be extended using all funds on the account (whichever is the smaller duration/amount and if any extension
         * is possible with the account's funds).
         * If specified, there must be an adminKey and the autoRenewAccount must sign this transaction.
         */
        autoRenewAccount?: (proto.IAccountID|null);
    }

    /** See [ConsensusService.createTopic()](#proto.ConsensusService) */
    class ConsensusCreateTopicTransactionBody implements IConsensusCreateTopicTransactionBody {

        /**
         * Constructs a new ConsensusCreateTopicTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IConsensusCreateTopicTransactionBody);

        /** Short publicly visible memo about the topic. No guarantee of uniqueness. */
        public memo: string;

        /**
         * Access control for updateTopic/deleteTopic.
         * Anyone can increase the topic's expirationTime via ConsensusService.updateTopic(), regardless of the adminKey.
         * If no adminKey is specified, updateTopic may only be used to extend the topic's expirationTime, and deleteTopic
         * is disallowed.
         */
        public adminKey?: (proto.IKey|null);

        /**
         * Access control for submitMessage.
         * If unspecified, no access control is performed on ConsensusService.submitMessage (all submissions are allowed).
         */
        public submitKey?: (proto.IKey|null);

        /**
         * The initial lifetime of the topic and the amount of time to attempt to extend the topic's lifetime by
         * automatically at the topic's expirationTime, if the autoRenewAccount is configured (once autoRenew functionality
         * is supported by HAPI).
         * Limited to MIN_AUTORENEW_PERIOD and MAX_AUTORENEW_PERIOD value by server-side configuration.
         * Required.
         */
        public autoRenewPeriod?: (proto.IDuration|null);

        /**
         * Optional account to be used at the topic's expirationTime to extend the life of the topic (once autoRenew
         * functionality is supported by HAPI).
         * The topic lifetime will be extended up to a maximum of the autoRenewPeriod or however long the topic
         * can be extended using all funds on the account (whichever is the smaller duration/amount and if any extension
         * is possible with the account's funds).
         * If specified, there must be an adminKey and the autoRenewAccount must sign this transaction.
         */
        public autoRenewAccount?: (proto.IAccountID|null);

        /**
         * Creates a new ConsensusCreateTopicTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ConsensusCreateTopicTransactionBody instance
         */
        public static create(properties?: proto.IConsensusCreateTopicTransactionBody): proto.ConsensusCreateTopicTransactionBody;

        /**
         * Encodes the specified ConsensusCreateTopicTransactionBody message. Does not implicitly {@link proto.ConsensusCreateTopicTransactionBody.verify|verify} messages.
         * @param m ConsensusCreateTopicTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IConsensusCreateTopicTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ConsensusCreateTopicTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ConsensusCreateTopicTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ConsensusCreateTopicTransactionBody;
    }

    /** Properties of a Duration. */
    interface IDuration {

        /** The number of seconds */
        seconds?: (Long|null);
    }

    /** A length of time in seconds. */
    class Duration implements IDuration {

        /**
         * Constructs a new Duration.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IDuration);

        /** The number of seconds */
        public seconds: Long;

        /**
         * Creates a new Duration instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Duration instance
         */
        public static create(properties?: proto.IDuration): proto.Duration;

        /**
         * Encodes the specified Duration message. Does not implicitly {@link proto.Duration.verify|verify} messages.
         * @param m Duration message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IDuration, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Duration message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Duration
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.Duration;
    }

    /** Properties of a ConsensusDeleteTopicTransactionBody. */
    interface IConsensusDeleteTopicTransactionBody {

        /** Topic identifier */
        topicID?: (proto.ITopicID|null);
    }

    /** See [ConsensusService.deleteTopic()](#proto.ConsensusService) */
    class ConsensusDeleteTopicTransactionBody implements IConsensusDeleteTopicTransactionBody {

        /**
         * Constructs a new ConsensusDeleteTopicTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IConsensusDeleteTopicTransactionBody);

        /** Topic identifier */
        public topicID?: (proto.ITopicID|null);

        /**
         * Creates a new ConsensusDeleteTopicTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ConsensusDeleteTopicTransactionBody instance
         */
        public static create(properties?: proto.IConsensusDeleteTopicTransactionBody): proto.ConsensusDeleteTopicTransactionBody;

        /**
         * Encodes the specified ConsensusDeleteTopicTransactionBody message. Does not implicitly {@link proto.ConsensusDeleteTopicTransactionBody.verify|verify} messages.
         * @param m ConsensusDeleteTopicTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IConsensusDeleteTopicTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ConsensusDeleteTopicTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ConsensusDeleteTopicTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ConsensusDeleteTopicTransactionBody;
    }

    /** Properties of a ConsensusGetTopicInfoQuery. */
    interface IConsensusGetTopicInfoQuery {

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of response is requested
         * (cost, state proof, both, or neither).
         */
        header?: (proto.IQueryHeader|null);

        /** The Topic for which information is being requested */
        topicID?: (proto.ITopicID|null);
    }

    /** See [ConsensusService.getTopicInfo()](#proto.ConsensusService) */
    class ConsensusGetTopicInfoQuery implements IConsensusGetTopicInfoQuery {

        /**
         * Constructs a new ConsensusGetTopicInfoQuery.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IConsensusGetTopicInfoQuery);

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of response is requested
         * (cost, state proof, both, or neither).
         */
        public header?: (proto.IQueryHeader|null);

        /** The Topic for which information is being requested */
        public topicID?: (proto.ITopicID|null);

        /**
         * Creates a new ConsensusGetTopicInfoQuery instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ConsensusGetTopicInfoQuery instance
         */
        public static create(properties?: proto.IConsensusGetTopicInfoQuery): proto.ConsensusGetTopicInfoQuery;

        /**
         * Encodes the specified ConsensusGetTopicInfoQuery message. Does not implicitly {@link proto.ConsensusGetTopicInfoQuery.verify|verify} messages.
         * @param m ConsensusGetTopicInfoQuery message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IConsensusGetTopicInfoQuery, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ConsensusGetTopicInfoQuery message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ConsensusGetTopicInfoQuery
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ConsensusGetTopicInfoQuery;
    }

    /** Properties of a ConsensusGetTopicInfoResponse. */
    interface IConsensusGetTopicInfoResponse {

        /** Standard response from node to client, including the requested fields: cost, or state proof, or both, or neither. */
        header?: (proto.IResponseHeader|null);

        /** Topic identifier. */
        topicID?: (proto.ITopicID|null);

        /** Current state of the topic */
        topicInfo?: (proto.IConsensusTopicInfo|null);
    }

    /** Retrieve the parameters of and state of a consensus topic. */
    class ConsensusGetTopicInfoResponse implements IConsensusGetTopicInfoResponse {

        /**
         * Constructs a new ConsensusGetTopicInfoResponse.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IConsensusGetTopicInfoResponse);

        /** Standard response from node to client, including the requested fields: cost, or state proof, or both, or neither. */
        public header?: (proto.IResponseHeader|null);

        /** Topic identifier. */
        public topicID?: (proto.ITopicID|null);

        /** Current state of the topic */
        public topicInfo?: (proto.IConsensusTopicInfo|null);

        /**
         * Creates a new ConsensusGetTopicInfoResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ConsensusGetTopicInfoResponse instance
         */
        public static create(properties?: proto.IConsensusGetTopicInfoResponse): proto.ConsensusGetTopicInfoResponse;

        /**
         * Encodes the specified ConsensusGetTopicInfoResponse message. Does not implicitly {@link proto.ConsensusGetTopicInfoResponse.verify|verify} messages.
         * @param m ConsensusGetTopicInfoResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IConsensusGetTopicInfoResponse, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ConsensusGetTopicInfoResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ConsensusGetTopicInfoResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ConsensusGetTopicInfoResponse;
    }

    /**
     * The client uses the ResponseType to indicate that it desires the node send just the answer, or
     * both the answer and a state proof. It can also ask for just the cost and not the answer itself
     * (allowing it to tailor the payment transaction accordingly). If the payment in the query fails
     * the precheck, then the response may have some fields blank. The state proof is only available for
     * some types of information. It is available for a Record, but not a receipt. It is available for
     * the information in each kind of *GetInfo request.
     */
    enum ResponseType {
        ANSWER_ONLY = 0,
        ANSWER_STATE_PROOF = 1,
        COST_ANSWER = 2,
        COST_ANSWER_STATE_PROOF = 3
    }

    /** Properties of a QueryHeader. */
    interface IQueryHeader {

        /** A signed CryptoTransferTransaction to pay the node a fee for handling this query */
        payment?: (proto.ITransaction|null);

        /** The requested response, asking for cost, state proof, both, or neither */
        responseType?: (proto.ResponseType|null);
    }

    /**
     * Each query from the client to the node will contain the QueryHeader, which gives the requested
     * response type, and includes a payment transaction that will compensate the node for responding to
     * the query. The payment can be blank if the query is free.
     */
    class QueryHeader implements IQueryHeader {

        /**
         * Constructs a new QueryHeader.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IQueryHeader);

        /** A signed CryptoTransferTransaction to pay the node a fee for handling this query */
        public payment?: (proto.ITransaction|null);

        /** The requested response, asking for cost, state proof, both, or neither */
        public responseType: proto.ResponseType;

        /**
         * Creates a new QueryHeader instance using the specified properties.
         * @param [properties] Properties to set
         * @returns QueryHeader instance
         */
        public static create(properties?: proto.IQueryHeader): proto.QueryHeader;

        /**
         * Encodes the specified QueryHeader message. Does not implicitly {@link proto.QueryHeader.verify|verify} messages.
         * @param m QueryHeader message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IQueryHeader, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a QueryHeader message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns QueryHeader
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.QueryHeader;
    }

    /** Properties of a Transaction. */
    interface ITransaction {

        /** the body of the transaction, which needs to be signed */
        body?: (proto.ITransactionBody|null);

        /**
         * The signatures on the body, to authorize the transaction; deprecated and to be succeeded by
         * SignatureMap field
         */
        sigs?: (proto.ISignatureList|null);

        /** The signatures on the body with the new format, to authorize the transaction */
        sigMap?: (proto.ISignatureMap|null);

        /** TransactionBody serialized into bytes, which needs to be signed */
        bodyBytes?: (Uint8Array|null);

        /** SignedTransaction serialized into bytes */
        signedTransactionBytes?: (Uint8Array|null);
    }

    /**
     * A single signed transaction, including all its signatures. The SignatureList will have a
     * Signature for each Key in the transaction, either explicit or implicit, in the order that they
     * appear in the transaction. For example, a CryptoTransfer will first have a Signature
     * corresponding to the Key for the paying account, followed by a Signature corresponding to the Key
     * for each account that is sending or receiving cryptocurrency in the transfer. Each Transaction
     * should not have more than 50 levels.
     * The SignatureList field is deprecated and succeeded by SignatureMap.
     */
    class Transaction implements ITransaction {

        /**
         * Constructs a new Transaction.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITransaction);

        /** the body of the transaction, which needs to be signed */
        public body?: (proto.ITransactionBody|null);

        /**
         * The signatures on the body, to authorize the transaction; deprecated and to be succeeded by
         * SignatureMap field
         */
        public sigs?: (proto.ISignatureList|null);

        /** The signatures on the body with the new format, to authorize the transaction */
        public sigMap?: (proto.ISignatureMap|null);

        /** TransactionBody serialized into bytes, which needs to be signed */
        public bodyBytes: Uint8Array;

        /** SignedTransaction serialized into bytes */
        public signedTransactionBytes: Uint8Array;

        /**
         * Creates a new Transaction instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Transaction instance
         */
        public static create(properties?: proto.ITransaction): proto.Transaction;

        /**
         * Encodes the specified Transaction message. Does not implicitly {@link proto.Transaction.verify|verify} messages.
         * @param m Transaction message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITransaction, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Transaction message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Transaction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.Transaction;
    }

    /** Properties of a TransactionBody. */
    interface ITransactionBody {

        /**
         * The ID for this transaction, which includes the payer's account (the account paying the
         * transaction fee). If two transactions have the same transactionID, they won't both have an
         * effect
         */
        transactionID?: (proto.ITransactionID|null);

        /** The account of the node that submits the client's transaction to the network */
        nodeAccountID?: (proto.IAccountID|null);

        /** The maximum transaction fee the client is willing to pay */
        transactionFee?: (Long|null);

        /**
         * The transaction is invalid if consensusTimestamp > transactionID.transactionValidStart +
         * transactionValidDuration
         */
        transactionValidDuration?: (proto.IDuration|null);

        /**
         * Should a record of this transaction be generated? (A receipt is always generated, but the
         * record is optional)
         */
        generateRecord?: (boolean|null);

        /** Any notes or descriptions that should be put into the record (max length 100) */
        memo?: (string|null);

        /** Calls a function of a contract instance */
        contractCall?: (proto.IContractCallTransactionBody|null);

        /** Creates a contract instance */
        contractCreateInstance?: (proto.IContractCreateTransactionBody|null);

        /** Updates a contract */
        contractUpdateInstance?: (proto.IContractUpdateTransactionBody|null);

        /** Delete contract and transfer remaining balance into specified account */
        contractDeleteInstance?: (proto.IContractDeleteTransactionBody|null);

        /** Attach a new livehash to an account */
        cryptoAddLiveHash?: (proto.ICryptoAddLiveHashTransactionBody|null);

        /** Create a new cryptocurrency account */
        cryptoCreateAccount?: (proto.ICryptoCreateTransactionBody|null);

        /** Delete a cryptocurrency account (mark as deleted, and transfer hbars out) */
        cryptoDelete?: (proto.ICryptoDeleteTransactionBody|null);

        /** Remove a livehash from an account */
        cryptoDeleteLiveHash?: (proto.ICryptoDeleteLiveHashTransactionBody|null);

        /** Transfer amount between accounts */
        cryptoTransfer?: (proto.ICryptoTransferTransactionBody|null);

        /** Modify information such as the expiration date for an account */
        cryptoUpdateAccount?: (proto.ICryptoUpdateTransactionBody|null);

        /** Add bytes to the end of the contents of a file */
        fileAppend?: (proto.IFileAppendTransactionBody|null);

        /** Create a new file */
        fileCreate?: (proto.IFileCreateTransactionBody|null);

        /** Delete a file (remove contents and mark as deleted until it expires) */
        fileDelete?: (proto.IFileDeleteTransactionBody|null);

        /** Modify information such as the expiration date for a file */
        fileUpdate?: (proto.IFileUpdateTransactionBody|null);

        /** Hedera administrative deletion of a file or smart contract */
        systemDelete?: (proto.ISystemDeleteTransactionBody|null);

        /** To undelete an entity deleted by SystemDelete */
        systemUndelete?: (proto.ISystemUndeleteTransactionBody|null);

        /** Freeze the nodes */
        freeze?: (proto.IFreezeTransactionBody|null);

        /** Creates a topic */
        consensusCreateTopic?: (proto.IConsensusCreateTopicTransactionBody|null);

        /** Updates a topic */
        consensusUpdateTopic?: (proto.IConsensusUpdateTopicTransactionBody|null);

        /** Deletes a topic */
        consensusDeleteTopic?: (proto.IConsensusDeleteTopicTransactionBody|null);

        /** Submits message to a topic */
        consensusSubmitMessage?: (proto.IConsensusSubmitMessageTransactionBody|null);

        /** UNDOCUMENTED */
        uncheckedSubmit?: (proto.IUncheckedSubmitBody|null);

        /** Creates a token instance */
        tokenCreation?: (proto.ITokenCreateTransactionBody|null);

        /** Freezes account not to be able to transact with a token */
        tokenFreeze?: (proto.ITokenFreezeAccountTransactionBody|null);

        /** Unfreezes account for a token */
        tokenUnfreeze?: (proto.ITokenUnfreezeAccountTransactionBody|null);

        /** Grants KYC to an account for a token */
        tokenGrantKyc?: (proto.ITokenGrantKycTransactionBody|null);

        /** Revokes KYC of an account for a token */
        tokenRevokeKyc?: (proto.ITokenRevokeKycTransactionBody|null);

        /** Deletes a token instance */
        tokenDeletion?: (proto.ITokenDeleteTransactionBody|null);

        /** Updates a token instance */
        tokenUpdate?: (proto.ITokenUpdateTransactionBody|null);

        /** Mints new tokens to a token's treasury account */
        tokenMint?: (proto.ITokenMintTransactionBody|null);

        /** Burns tokens from a token's treasury account */
        tokenBurn?: (proto.ITokenBurnTransactionBody|null);

        /** Wipes amount of tokens from an account */
        tokenWipe?: (proto.ITokenWipeAccountTransactionBody|null);

        /** Associate tokens to an account */
        tokenAssociate?: (proto.ITokenAssociateTransactionBody|null);

        /** Dissociate tokens from an account */
        tokenDissociate?: (proto.ITokenDissociateTransactionBody|null);

        /** Creates a schedule in the network's action queue */
        scheduleCreate?: (proto.IScheduleCreateTransactionBody|null);

        /** Deletes a schedule from the network's action queue */
        scheduleDelete?: (proto.IScheduleDeleteTransactionBody|null);

        /** Adds one or more Ed25519 keys to the affirmed signers of a scheduled transaction */
        scheduleSign?: (proto.IScheduleSignTransactionBody|null);

        /** Updates a token's custom fee schedule */
        tokenFeeScheduleUpdate?: (proto.ITokenFeeScheduleUpdateTransactionBody|null);

        /** Pauses the Token */
        tokenPause?: (proto.ITokenPauseTransactionBody|null);

        /** Unpauses the Token */
        tokenUnpause?: (proto.ITokenUnpauseTransactionBody|null);
    }

    /** A single transaction. All transaction types are possible here. */
    class TransactionBody implements ITransactionBody {

        /**
         * Constructs a new TransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITransactionBody);

        /**
         * The ID for this transaction, which includes the payer's account (the account paying the
         * transaction fee). If two transactions have the same transactionID, they won't both have an
         * effect
         */
        public transactionID?: (proto.ITransactionID|null);

        /** The account of the node that submits the client's transaction to the network */
        public nodeAccountID?: (proto.IAccountID|null);

        /** The maximum transaction fee the client is willing to pay */
        public transactionFee: Long;

        /**
         * The transaction is invalid if consensusTimestamp > transactionID.transactionValidStart +
         * transactionValidDuration
         */
        public transactionValidDuration?: (proto.IDuration|null);

        /**
         * Should a record of this transaction be generated? (A receipt is always generated, but the
         * record is optional)
         */
        public generateRecord: boolean;

        /** Any notes or descriptions that should be put into the record (max length 100) */
        public memo: string;

        /** Calls a function of a contract instance */
        public contractCall?: (proto.IContractCallTransactionBody|null);

        /** Creates a contract instance */
        public contractCreateInstance?: (proto.IContractCreateTransactionBody|null);

        /** Updates a contract */
        public contractUpdateInstance?: (proto.IContractUpdateTransactionBody|null);

        /** Delete contract and transfer remaining balance into specified account */
        public contractDeleteInstance?: (proto.IContractDeleteTransactionBody|null);

        /** Attach a new livehash to an account */
        public cryptoAddLiveHash?: (proto.ICryptoAddLiveHashTransactionBody|null);

        /** Create a new cryptocurrency account */
        public cryptoCreateAccount?: (proto.ICryptoCreateTransactionBody|null);

        /** Delete a cryptocurrency account (mark as deleted, and transfer hbars out) */
        public cryptoDelete?: (proto.ICryptoDeleteTransactionBody|null);

        /** Remove a livehash from an account */
        public cryptoDeleteLiveHash?: (proto.ICryptoDeleteLiveHashTransactionBody|null);

        /** Transfer amount between accounts */
        public cryptoTransfer?: (proto.ICryptoTransferTransactionBody|null);

        /** Modify information such as the expiration date for an account */
        public cryptoUpdateAccount?: (proto.ICryptoUpdateTransactionBody|null);

        /** Add bytes to the end of the contents of a file */
        public fileAppend?: (proto.IFileAppendTransactionBody|null);

        /** Create a new file */
        public fileCreate?: (proto.IFileCreateTransactionBody|null);

        /** Delete a file (remove contents and mark as deleted until it expires) */
        public fileDelete?: (proto.IFileDeleteTransactionBody|null);

        /** Modify information such as the expiration date for a file */
        public fileUpdate?: (proto.IFileUpdateTransactionBody|null);

        /** Hedera administrative deletion of a file or smart contract */
        public systemDelete?: (proto.ISystemDeleteTransactionBody|null);

        /** To undelete an entity deleted by SystemDelete */
        public systemUndelete?: (proto.ISystemUndeleteTransactionBody|null);

        /** Freeze the nodes */
        public freeze?: (proto.IFreezeTransactionBody|null);

        /** Creates a topic */
        public consensusCreateTopic?: (proto.IConsensusCreateTopicTransactionBody|null);

        /** Updates a topic */
        public consensusUpdateTopic?: (proto.IConsensusUpdateTopicTransactionBody|null);

        /** Deletes a topic */
        public consensusDeleteTopic?: (proto.IConsensusDeleteTopicTransactionBody|null);

        /** Submits message to a topic */
        public consensusSubmitMessage?: (proto.IConsensusSubmitMessageTransactionBody|null);

        /** UNDOCUMENTED */
        public uncheckedSubmit?: (proto.IUncheckedSubmitBody|null);

        /** Creates a token instance */
        public tokenCreation?: (proto.ITokenCreateTransactionBody|null);

        /** Freezes account not to be able to transact with a token */
        public tokenFreeze?: (proto.ITokenFreezeAccountTransactionBody|null);

        /** Unfreezes account for a token */
        public tokenUnfreeze?: (proto.ITokenUnfreezeAccountTransactionBody|null);

        /** Grants KYC to an account for a token */
        public tokenGrantKyc?: (proto.ITokenGrantKycTransactionBody|null);

        /** Revokes KYC of an account for a token */
        public tokenRevokeKyc?: (proto.ITokenRevokeKycTransactionBody|null);

        /** Deletes a token instance */
        public tokenDeletion?: (proto.ITokenDeleteTransactionBody|null);

        /** Updates a token instance */
        public tokenUpdate?: (proto.ITokenUpdateTransactionBody|null);

        /** Mints new tokens to a token's treasury account */
        public tokenMint?: (proto.ITokenMintTransactionBody|null);

        /** Burns tokens from a token's treasury account */
        public tokenBurn?: (proto.ITokenBurnTransactionBody|null);

        /** Wipes amount of tokens from an account */
        public tokenWipe?: (proto.ITokenWipeAccountTransactionBody|null);

        /** Associate tokens to an account */
        public tokenAssociate?: (proto.ITokenAssociateTransactionBody|null);

        /** Dissociate tokens from an account */
        public tokenDissociate?: (proto.ITokenDissociateTransactionBody|null);

        /** Creates a schedule in the network's action queue */
        public scheduleCreate?: (proto.IScheduleCreateTransactionBody|null);

        /** Deletes a schedule from the network's action queue */
        public scheduleDelete?: (proto.IScheduleDeleteTransactionBody|null);

        /** Adds one or more Ed25519 keys to the affirmed signers of a scheduled transaction */
        public scheduleSign?: (proto.IScheduleSignTransactionBody|null);

        /** Updates a token's custom fee schedule */
        public tokenFeeScheduleUpdate?: (proto.ITokenFeeScheduleUpdateTransactionBody|null);

        /** Pauses the Token */
        public tokenPause?: (proto.ITokenPauseTransactionBody|null);

        /** Unpauses the Token */
        public tokenUnpause?: (proto.ITokenUnpauseTransactionBody|null);

        /** TransactionBody data. */
        public data?: ("contractCall"|"contractCreateInstance"|"contractUpdateInstance"|"contractDeleteInstance"|"cryptoAddLiveHash"|"cryptoCreateAccount"|"cryptoDelete"|"cryptoDeleteLiveHash"|"cryptoTransfer"|"cryptoUpdateAccount"|"fileAppend"|"fileCreate"|"fileDelete"|"fileUpdate"|"systemDelete"|"systemUndelete"|"freeze"|"consensusCreateTopic"|"consensusUpdateTopic"|"consensusDeleteTopic"|"consensusSubmitMessage"|"uncheckedSubmit"|"tokenCreation"|"tokenFreeze"|"tokenUnfreeze"|"tokenGrantKyc"|"tokenRevokeKyc"|"tokenDeletion"|"tokenUpdate"|"tokenMint"|"tokenBurn"|"tokenWipe"|"tokenAssociate"|"tokenDissociate"|"scheduleCreate"|"scheduleDelete"|"scheduleSign"|"tokenFeeScheduleUpdate"|"tokenPause"|"tokenUnpause");

        /**
         * Creates a new TransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TransactionBody instance
         */
        public static create(properties?: proto.ITransactionBody): proto.TransactionBody;

        /**
         * Encodes the specified TransactionBody message. Does not implicitly {@link proto.TransactionBody.verify|verify} messages.
         * @param m TransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TransactionBody;
    }

    /** Properties of a SystemDeleteTransactionBody. */
    interface ISystemDeleteTransactionBody {

        /** The file ID of the file to delete, in the format used in transactions */
        fileID?: (proto.IFileID|null);

        /** The contract ID instance to delete, in the format used in transactions */
        contractID?: (proto.IContractID|null);

        /** The timestamp in seconds at which the "deleted" file should truly be permanently deleted */
        expirationTime?: (proto.ITimestampSeconds|null);
    }

    /**
     * Delete a file or smart contract - can only be done with a Hedera administrative multisignature.
     * When it is deleted, it immediately disappears from the system as seen by the user, but is still
     * stored internally until the expiration time, at which time it is truly and permanently deleted.
     * Until that time, it can be undeleted by the Hedera administrative multisignature. When a smart
     * contract is deleted, the cryptocurrency account within it continues to exist, and is not affected
     * by the expiration time here.
     */
    class SystemDeleteTransactionBody implements ISystemDeleteTransactionBody {

        /**
         * Constructs a new SystemDeleteTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ISystemDeleteTransactionBody);

        /** The file ID of the file to delete, in the format used in transactions */
        public fileID?: (proto.IFileID|null);

        /** The contract ID instance to delete, in the format used in transactions */
        public contractID?: (proto.IContractID|null);

        /** The timestamp in seconds at which the "deleted" file should truly be permanently deleted */
        public expirationTime?: (proto.ITimestampSeconds|null);

        /** SystemDeleteTransactionBody id. */
        public id?: ("fileID"|"contractID");

        /**
         * Creates a new SystemDeleteTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns SystemDeleteTransactionBody instance
         */
        public static create(properties?: proto.ISystemDeleteTransactionBody): proto.SystemDeleteTransactionBody;

        /**
         * Encodes the specified SystemDeleteTransactionBody message. Does not implicitly {@link proto.SystemDeleteTransactionBody.verify|verify} messages.
         * @param m SystemDeleteTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ISystemDeleteTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SystemDeleteTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns SystemDeleteTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.SystemDeleteTransactionBody;
    }

    /** Properties of a SystemUndeleteTransactionBody. */
    interface ISystemUndeleteTransactionBody {

        /** The file ID to undelete, in the format used in transactions */
        fileID?: (proto.IFileID|null);

        /** The contract ID instance to undelete, in the format used in transactions */
        contractID?: (proto.IContractID|null);
    }

    /**
     * Undelete a file or smart contract that was deleted by SystemDelete; requires a Hedera
     * administrative multisignature.
     */
    class SystemUndeleteTransactionBody implements ISystemUndeleteTransactionBody {

        /**
         * Constructs a new SystemUndeleteTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ISystemUndeleteTransactionBody);

        /** The file ID to undelete, in the format used in transactions */
        public fileID?: (proto.IFileID|null);

        /** The contract ID instance to undelete, in the format used in transactions */
        public contractID?: (proto.IContractID|null);

        /** SystemUndeleteTransactionBody id. */
        public id?: ("fileID"|"contractID");

        /**
         * Creates a new SystemUndeleteTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns SystemUndeleteTransactionBody instance
         */
        public static create(properties?: proto.ISystemUndeleteTransactionBody): proto.SystemUndeleteTransactionBody;

        /**
         * Encodes the specified SystemUndeleteTransactionBody message. Does not implicitly {@link proto.SystemUndeleteTransactionBody.verify|verify} messages.
         * @param m SystemUndeleteTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ISystemUndeleteTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SystemUndeleteTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns SystemUndeleteTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.SystemUndeleteTransactionBody;
    }

    /** Properties of a FreezeTransactionBody. */
    interface IFreezeTransactionBody {

        /**
         * !! DEPRECATED and REJECTED by nodes
         * The start hour (in UTC time), a value between 0 and 23
         */
        startHour?: (number|null);

        /**
         * !! DEPRECATED and REJECTED by nodes
         * The start minute (in UTC time), a value between 0 and 59
         */
        startMin?: (number|null);

        /**
         * !! DEPRECATED and REJECTED by nodes
         * The end hour (in UTC time), a value between 0 and 23
         */
        endHour?: (number|null);

        /**
         * !! DEPRECATED and REJECTED by nodes
         * The end minute (in UTC time), a value between 0 and 59
         */
        endMin?: (number|null);

        /**
         * If set, the file whose contents should be used for a network software update during the
         * maintenance window.
         */
        updateFile?: (proto.IFileID|null);

        /** If set, the expected hash of the contents of the update file (used to verify the update). */
        fileHash?: (Uint8Array|null);

        /** The consensus time at which the maintenance window should begin. */
        startTime?: (proto.ITimestamp|null);

        /** The type of network freeze or upgrade operation to perform. */
        freezeType?: (proto.FreezeType|null);
    }

    /**
     * At consensus, sets the consensus time at which the platform should stop creating events and
     * accepting transactions, and enter a maintenance window.
     */
    class FreezeTransactionBody implements IFreezeTransactionBody {

        /**
         * Constructs a new FreezeTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IFreezeTransactionBody);

        /**
         * !! DEPRECATED and REJECTED by nodes
         * The start hour (in UTC time), a value between 0 and 23
         */
        public startHour: number;

        /**
         * !! DEPRECATED and REJECTED by nodes
         * The start minute (in UTC time), a value between 0 and 59
         */
        public startMin: number;

        /**
         * !! DEPRECATED and REJECTED by nodes
         * The end hour (in UTC time), a value between 0 and 23
         */
        public endHour: number;

        /**
         * !! DEPRECATED and REJECTED by nodes
         * The end minute (in UTC time), a value between 0 and 59
         */
        public endMin: number;

        /**
         * If set, the file whose contents should be used for a network software update during the
         * maintenance window.
         */
        public updateFile?: (proto.IFileID|null);

        /** If set, the expected hash of the contents of the update file (used to verify the update). */
        public fileHash: Uint8Array;

        /** The consensus time at which the maintenance window should begin. */
        public startTime?: (proto.ITimestamp|null);

        /** The type of network freeze or upgrade operation to perform. */
        public freezeType: proto.FreezeType;

        /**
         * Creates a new FreezeTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns FreezeTransactionBody instance
         */
        public static create(properties?: proto.IFreezeTransactionBody): proto.FreezeTransactionBody;

        /**
         * Encodes the specified FreezeTransactionBody message. Does not implicitly {@link proto.FreezeTransactionBody.verify|verify} messages.
         * @param m FreezeTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IFreezeTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a FreezeTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns FreezeTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.FreezeTransactionBody;
    }

    /** Properties of a ContractCallTransactionBody. */
    interface IContractCallTransactionBody {

        /** the contract instance to call, in the format used in transactions */
        contractID?: (proto.IContractID|null);

        /** the maximum amount of gas to use for the call */
        gas?: (Long|null);

        /** number of tinybars sent (the function must be payable if this is nonzero) */
        amount?: (Long|null);

        /** which function to call, and the parameters to pass to the function */
        functionParameters?: (Uint8Array|null);
    }

    /**
     * Call a function of the given smart contract instance, giving it functionParameters as its inputs.
     * The call can use at maximum the given amount of gas – the paying account will not be charged for
     * any unspent gas.
     *
     * If this function results in data being stored, an amount of gas is calculated that reflects this
     * storage burden.
     *
     * The amount of gas used, as well as other attributes of the transaction, e.g. size, number of
     * signatures to be verified, determine the fee for the transaction – which is charged to the paying
     * account.
     */
    class ContractCallTransactionBody implements IContractCallTransactionBody {

        /**
         * Constructs a new ContractCallTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IContractCallTransactionBody);

        /** the contract instance to call, in the format used in transactions */
        public contractID?: (proto.IContractID|null);

        /** the maximum amount of gas to use for the call */
        public gas: Long;

        /** number of tinybars sent (the function must be payable if this is nonzero) */
        public amount: Long;

        /** which function to call, and the parameters to pass to the function */
        public functionParameters: Uint8Array;

        /**
         * Creates a new ContractCallTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ContractCallTransactionBody instance
         */
        public static create(properties?: proto.IContractCallTransactionBody): proto.ContractCallTransactionBody;

        /**
         * Encodes the specified ContractCallTransactionBody message. Does not implicitly {@link proto.ContractCallTransactionBody.verify|verify} messages.
         * @param m ContractCallTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IContractCallTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ContractCallTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ContractCallTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ContractCallTransactionBody;
    }

    /** Properties of a ContractCreateTransactionBody. */
    interface IContractCreateTransactionBody {

        /**
         * the file containing the smart contract byte code. A copy will be made and held by the
         * contract instance, and have the same expiration time as the instance. The file is referenced
         * one of two ways:
         */
        fileID?: (proto.IFileID|null);

        /**
         * the state of the instance and its fields can be modified arbitrarily if this key signs a
         * transaction to modify it. If this is null, then such modifications are not possible, and
         * there is no administrator that can override the normal operation of this smart contract
         * instance. Note that if it is created with no admin keys, then there is no administrator to
         * authorize changing the admin keys, so there can never be any admin keys for that instance.
         */
        adminKey?: (proto.IKey|null);

        /** gas to run the constructor */
        gas?: (Long|null);

        /**
         * initial number of tinybars to put into the cryptocurrency account associated with and owned
         * by the smart contract
         */
        initialBalance?: (Long|null);

        /**
         * ID of the account to which this account is proxy staked. If proxyAccountID is null, or is an
         * invalid account, or is an account that isn't a node, then this account is automatically proxy
         * staked to a node chosen by the network, but without earning payments. If the proxyAccountID
         * account refuses to accept proxy staking , or if it is not currently running a node, then it
         * will behave as if  proxyAccountID was null.
         */
        proxyAccountID?: (proto.IAccountID|null);

        /** the instance will charge its account every this many seconds to renew for this long */
        autoRenewPeriod?: (proto.IDuration|null);

        /** parameters to pass to the constructor */
        constructorParameters?: (Uint8Array|null);

        /** shard in which to create this */
        shardID?: (proto.IShardID|null);

        /** realm in which to create this (leave this null to create a new realm) */
        realmID?: (proto.IRealmID|null);

        /** if realmID is null, then this the admin key for the new realm that will be created */
        newRealmAdminKey?: (proto.IKey|null);

        /** the memo that was submitted as part of the contract (max 100 bytes) */
        memo?: (string|null);
    }

    /**
     * Start a new smart contract instance. After the instance is created, the ContractID for it is in
     * the receipt, and can be retrieved by the Record or with a GetByKey query. The instance will run
     * the bytecode stored in a previously created file, referenced either by FileID or by the
     * transaction ID of the transaction that created the file
     *
     *
     * The constructor will be executed using the given amount of gas, and any unspent gas will be
     * refunded to the paying account. Constructor inputs come from the given constructorParameters.
     * - The instance will exist for autoRenewPeriod seconds. When that is reached, it will renew
     * itself for another autoRenewPeriod seconds by charging its associated cryptocurrency account
     * (which it creates here). If it has insufficient cryptocurrency to extend that long, it will
     * extend as long as it can. If its balance is zero, the instance will be deleted.
     *
     * - A smart contract instance normally enforces rules, so "the code is law". For example, an
     * ERC-20 contract prevents a transfer from being undone without a signature by the recipient of
     * the transfer. This is always enforced if the contract instance was created with the adminKeys
     * being null. But for some uses, it might be desirable to create something like an ERC-20
     * contract that has a specific group of trusted individuals who can act as a "supreme court"
     * with the ability to override the normal operation, when a sufficient number of them agree to
     * do so. If adminKeys is not null, then they can sign a transaction that can change the state of
     * the smart contract in arbitrary ways, such as to reverse a transaction that violates some
     * standard of behavior that is not covered by the code itself. The admin keys can also be used
     * to change the autoRenewPeriod, and change the adminKeys field itself. The API currently does
     * not implement this ability. But it does allow the adminKeys field to be set and queried, and
     * will in the future implement such admin abilities for any instance that has a non-null
     * adminKeys.
     *
     * - If this constructor stores information, it is charged gas to store it. There is a fee in hbars
     * to maintain that storage until the expiration time, and that fee is added as part of the
     * transaction fee.
     *
     * - An entity (account, file, or smart contract instance) must be created in a particular realm.
     * If the realmID is left null, then a new realm will be created with the given admin key. If a
     * new realm has a null adminKey, then anyone can create/modify/delete entities in that realm.
     * But if an admin key is given, then any transaction to create/modify/delete an entity in that
     * realm must be signed by that key, though anyone can still call functions on smart contract
     * instances that exist in that realm. A realm ceases to exist when everything within it has
     * expired and no longer exists.
     *
     * - The current API ignores shardID, realmID, and newRealmAdminKey, and creates everything in
     * shard 0 and realm 0, with a null key. Future versions of the API will support multiple realms
     * and multiple shards.
     *
     * - The optional memo field can contain a string whose length is up to 100 bytes. That is the size
     * after Unicode NFD then UTF-8 conversion. This field can be used to describe the smart contract.
     * It could also be used for other purposes. One recommended purpose is to hold a hexadecimal
     * string that is the SHA-384 hash of a PDF file containing a human-readable legal contract. Then,
     * if the admin keys are the public keys of human arbitrators, they can use that legal document to
     * guide their decisions during a binding arbitration tribunal, convened to consider any changes
     * to the smart contract in the future. The memo field can only be changed using the admin keys.
     * If there are no admin keys, then it cannot be changed after the smart contract is created.
     */
    class ContractCreateTransactionBody implements IContractCreateTransactionBody {

        /**
         * Constructs a new ContractCreateTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IContractCreateTransactionBody);

        /**
         * the file containing the smart contract byte code. A copy will be made and held by the
         * contract instance, and have the same expiration time as the instance. The file is referenced
         * one of two ways:
         */
        public fileID?: (proto.IFileID|null);

        /**
         * the state of the instance and its fields can be modified arbitrarily if this key signs a
         * transaction to modify it. If this is null, then such modifications are not possible, and
         * there is no administrator that can override the normal operation of this smart contract
         * instance. Note that if it is created with no admin keys, then there is no administrator to
         * authorize changing the admin keys, so there can never be any admin keys for that instance.
         */
        public adminKey?: (proto.IKey|null);

        /** gas to run the constructor */
        public gas: Long;

        /**
         * initial number of tinybars to put into the cryptocurrency account associated with and owned
         * by the smart contract
         */
        public initialBalance: Long;

        /**
         * ID of the account to which this account is proxy staked. If proxyAccountID is null, or is an
         * invalid account, or is an account that isn't a node, then this account is automatically proxy
         * staked to a node chosen by the network, but without earning payments. If the proxyAccountID
         * account refuses to accept proxy staking , or if it is not currently running a node, then it
         * will behave as if  proxyAccountID was null.
         */
        public proxyAccountID?: (proto.IAccountID|null);

        /** the instance will charge its account every this many seconds to renew for this long */
        public autoRenewPeriod?: (proto.IDuration|null);

        /** parameters to pass to the constructor */
        public constructorParameters: Uint8Array;

        /** shard in which to create this */
        public shardID?: (proto.IShardID|null);

        /** realm in which to create this (leave this null to create a new realm) */
        public realmID?: (proto.IRealmID|null);

        /** if realmID is null, then this the admin key for the new realm that will be created */
        public newRealmAdminKey?: (proto.IKey|null);

        /** the memo that was submitted as part of the contract (max 100 bytes) */
        public memo: string;

        /**
         * Creates a new ContractCreateTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ContractCreateTransactionBody instance
         */
        public static create(properties?: proto.IContractCreateTransactionBody): proto.ContractCreateTransactionBody;

        /**
         * Encodes the specified ContractCreateTransactionBody message. Does not implicitly {@link proto.ContractCreateTransactionBody.verify|verify} messages.
         * @param m ContractCreateTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IContractCreateTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ContractCreateTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ContractCreateTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ContractCreateTransactionBody;
    }

    /** Properties of a ContractUpdateTransactionBody. */
    interface IContractUpdateTransactionBody {

        /** The id of the contract to be updated */
        contractID?: (proto.IContractID|null);

        /**
         * The new expiry of the contract, no earlier than the current expiry (resolves to
         * EXPIRATION_REDUCTION_NOT_ALLOWED otherwise)
         */
        expirationTime?: (proto.ITimestamp|null);

        /** The new key to control updates to the contract */
        adminKey?: (proto.IKey|null);

        /** (NOT YET IMPLEMENTED) The new id of the account to which the contract is proxy staked */
        proxyAccountID?: (proto.IAccountID|null);

        /**
         * (NOT YET IMPLEMENTED) The new interval at which the contract will pay to extend its expiry
         * (by the same interval)
         */
        autoRenewPeriod?: (proto.IDuration|null);

        /**
         * [Deprecated] The new id of the file asserted to contain the bytecode of the Solidity transaction that
         * created this contract
         */
        fileID?: (proto.IFileID|null);

        /**
         * [Deprecated] If set with a non-zero length, the new memo to be associated with the account
         * (UTF-8 encoding max 100 bytes)
         */
        memo?: (string|null);

        /** If set, the new memo to be associated with the account (UTF-8 encoding max 100 bytes) */
        memoWrapper?: (google.protobuf.IStringValue|null);
    }

    /**
     * At consensus, updates the fields of a smart contract to the given values.
     *
     * If no value is given for a field, that field is left unchanged on the contract. For an immutable
     * smart contract (that is, a contract created without an adminKey), only the expirationTime may be
     * updated; setting any other field in this case will cause the transaction status to resolve to
     * MODIFYING_IMMUTABLE_CONTRACT.
     *
     * --- Signing Requirements ---
     * 1. Whether or not a contract has an admin Key, its expiry can be extended with only the
     * transaction payer's signature.
     * 2. Updating any other field of a mutable contract requires the admin key's signature.
     * 3. If the update transaction includes a new admin key, this new key must also sign <b>unless</b>
     * it is exactly an empty <tt>KeyList</tt>. This special sentinel key removes the existing admin
     * key and causes the contract to become immutable. (Other <tt>Key</tt> structures without a
     * constituent <tt>Ed25519</tt> key will be rejected with <tt>INVALID_ADMIN_KEY</tt>.)
     */
    class ContractUpdateTransactionBody implements IContractUpdateTransactionBody {

        /**
         * Constructs a new ContractUpdateTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IContractUpdateTransactionBody);

        /** The id of the contract to be updated */
        public contractID?: (proto.IContractID|null);

        /**
         * The new expiry of the contract, no earlier than the current expiry (resolves to
         * EXPIRATION_REDUCTION_NOT_ALLOWED otherwise)
         */
        public expirationTime?: (proto.ITimestamp|null);

        /** The new key to control updates to the contract */
        public adminKey?: (proto.IKey|null);

        /** (NOT YET IMPLEMENTED) The new id of the account to which the contract is proxy staked */
        public proxyAccountID?: (proto.IAccountID|null);

        /**
         * (NOT YET IMPLEMENTED) The new interval at which the contract will pay to extend its expiry
         * (by the same interval)
         */
        public autoRenewPeriod?: (proto.IDuration|null);

        /**
         * [Deprecated] The new id of the file asserted to contain the bytecode of the Solidity transaction that
         * created this contract
         */
        public fileID?: (proto.IFileID|null);

        /**
         * [Deprecated] If set with a non-zero length, the new memo to be associated with the account
         * (UTF-8 encoding max 100 bytes)
         */
        public memo?: (string|null);

        /** If set, the new memo to be associated with the account (UTF-8 encoding max 100 bytes) */
        public memoWrapper?: (google.protobuf.IStringValue|null);

        /** The new contract memo, assumed to be Unicode encoded with UTF-8 (at most 100 bytes) */
        public memoField?: ("memo"|"memoWrapper");

        /**
         * Creates a new ContractUpdateTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ContractUpdateTransactionBody instance
         */
        public static create(properties?: proto.IContractUpdateTransactionBody): proto.ContractUpdateTransactionBody;

        /**
         * Encodes the specified ContractUpdateTransactionBody message. Does not implicitly {@link proto.ContractUpdateTransactionBody.verify|verify} messages.
         * @param m ContractUpdateTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IContractUpdateTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ContractUpdateTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ContractUpdateTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ContractUpdateTransactionBody;
    }

    /** Properties of a LiveHash. */
    interface ILiveHash {

        /** The account to which the livehash is attached */
        accountId?: (proto.IAccountID|null);

        /** The SHA-384 hash of a credential or certificate */
        hash?: (Uint8Array|null);

        /** A list of keys (primitive or threshold), all of which must sign to attach the livehash to an account, and any one of which can later delete it. */
        keys?: (proto.IKeyList|null);

        /** The duration for which the livehash will remain valid */
        duration?: (proto.IDuration|null);
    }

    /**
     * A hash---presumably of some kind of credential or certificate---along with a list of keys, each
     * of which may be either a primitive or a threshold key.
     */
    class LiveHash implements ILiveHash {

        /**
         * Constructs a new LiveHash.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ILiveHash);

        /** The account to which the livehash is attached */
        public accountId?: (proto.IAccountID|null);

        /** The SHA-384 hash of a credential or certificate */
        public hash: Uint8Array;

        /** A list of keys (primitive or threshold), all of which must sign to attach the livehash to an account, and any one of which can later delete it. */
        public keys?: (proto.IKeyList|null);

        /** The duration for which the livehash will remain valid */
        public duration?: (proto.IDuration|null);

        /**
         * Creates a new LiveHash instance using the specified properties.
         * @param [properties] Properties to set
         * @returns LiveHash instance
         */
        public static create(properties?: proto.ILiveHash): proto.LiveHash;

        /**
         * Encodes the specified LiveHash message. Does not implicitly {@link proto.LiveHash.verify|verify} messages.
         * @param m LiveHash message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ILiveHash, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a LiveHash message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns LiveHash
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.LiveHash;
    }

    /** Properties of a CryptoAddLiveHashTransactionBody. */
    interface ICryptoAddLiveHashTransactionBody {

        /** A hash of some credential or certificate, along with the keys of the entities that asserted it validity */
        liveHash?: (proto.ILiveHash|null);
    }

    /**
     * At consensus, attaches the given livehash to the given account.  The hash can be deleted by the
     * key controlling the account, or by any of the keys associated to the livehash.  Hence livehashes
     * provide a revocation service for their implied credentials; for example, when an authority grants
     * a credential to the account, the account owner will cosign with the authority (or authorities) to
     * attach a hash of the credential to the account---hence proving the grant. If the credential is
     * revoked, then any of the authorities may delete it (or the account owner). In this way, the
     * livehash mechanism acts as a revocation service.  An account cannot have two identical livehashes
     * associated. To modify the list of keys in a livehash, the livehash should first be deleted, then
     * recreated with a new list of keys.
     */
    class CryptoAddLiveHashTransactionBody implements ICryptoAddLiveHashTransactionBody {

        /**
         * Constructs a new CryptoAddLiveHashTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ICryptoAddLiveHashTransactionBody);

        /** A hash of some credential or certificate, along with the keys of the entities that asserted it validity */
        public liveHash?: (proto.ILiveHash|null);

        /**
         * Creates a new CryptoAddLiveHashTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CryptoAddLiveHashTransactionBody instance
         */
        public static create(properties?: proto.ICryptoAddLiveHashTransactionBody): proto.CryptoAddLiveHashTransactionBody;

        /**
         * Encodes the specified CryptoAddLiveHashTransactionBody message. Does not implicitly {@link proto.CryptoAddLiveHashTransactionBody.verify|verify} messages.
         * @param m CryptoAddLiveHashTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ICryptoAddLiveHashTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CryptoAddLiveHashTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns CryptoAddLiveHashTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.CryptoAddLiveHashTransactionBody;
    }

    /** Properties of a CryptoCreateTransactionBody. */
    interface ICryptoCreateTransactionBody {

        /**
         * The key that must sign each transfer out of the account. If receiverSigRequired is true, then
         * it must also sign any transfer into the account.
         */
        key?: (proto.IKey|null);

        /** The initial number of tinybars to put into the account */
        initialBalance?: (Long|null);

        /**
         * ID of the account to which this account is proxy staked. If proxyAccountID is null, or is an
         * invalid account, or is an account that isn't a node, then this account is automatically proxy
         * staked to a node chosen by the network, but without earning payments. If the proxyAccountID
         * account refuses to accept proxy staking , or if it is not currently running a node, then it
         * will behave as if proxyAccountID was null.
         */
        proxyAccountID?: (proto.IAccountID|null);

        /**
         * [Deprecated]. The threshold amount (in tinybars) for which an account record is created for
         * any send/withdraw transaction
         */
        sendRecordThreshold?: (Long|null);

        /**
         * [Deprecated]. The threshold amount (in tinybars) for which an account record is created for
         * any receive/deposit transaction
         */
        receiveRecordThreshold?: (Long|null);

        /**
         * If true, this account's key must sign any transaction depositing into this account (in
         * addition to all withdrawals)
         */
        receiverSigRequired?: (boolean|null);

        /**
         * The account is charged to extend its expiration date every this many seconds. If it doesn't
         * have enough balance, it extends as long as possible. If it is empty when it expires, then it
         * is deleted.
         */
        autoRenewPeriod?: (proto.IDuration|null);

        /** The shard in which this account is created */
        shardID?: (proto.IShardID|null);

        /** The realm in which this account is created (leave this null to create a new realm) */
        realmID?: (proto.IRealmID|null);

        /** If realmID is null, then this the admin key for the new realm that will be created */
        newRealmAdminKey?: (proto.IKey|null);

        /** The memo associated with the account (UTF-8 encoding max 100 bytes) */
        memo?: (string|null);

        /**
         * The maximum number of tokens that an Account can be implicitly associated with. Defaults to 0
         * and up to a maximum value of 1000.
         */
        maxAutomaticTokenAssociations?: (number|null);
    }

    /** Represents a CryptoCreateTransactionBody. */
    class CryptoCreateTransactionBody implements ICryptoCreateTransactionBody {

        /**
         * Constructs a new CryptoCreateTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ICryptoCreateTransactionBody);

        /**
         * The key that must sign each transfer out of the account. If receiverSigRequired is true, then
         * it must also sign any transfer into the account.
         */
        public key?: (proto.IKey|null);

        /** The initial number of tinybars to put into the account */
        public initialBalance: Long;

        /**
         * ID of the account to which this account is proxy staked. If proxyAccountID is null, or is an
         * invalid account, or is an account that isn't a node, then this account is automatically proxy
         * staked to a node chosen by the network, but without earning payments. If the proxyAccountID
         * account refuses to accept proxy staking , or if it is not currently running a node, then it
         * will behave as if proxyAccountID was null.
         */
        public proxyAccountID?: (proto.IAccountID|null);

        /**
         * [Deprecated]. The threshold amount (in tinybars) for which an account record is created for
         * any send/withdraw transaction
         */
        public sendRecordThreshold: Long;

        /**
         * [Deprecated]. The threshold amount (in tinybars) for which an account record is created for
         * any receive/deposit transaction
         */
        public receiveRecordThreshold: Long;

        /**
         * If true, this account's key must sign any transaction depositing into this account (in
         * addition to all withdrawals)
         */
        public receiverSigRequired: boolean;

        /**
         * The account is charged to extend its expiration date every this many seconds. If it doesn't
         * have enough balance, it extends as long as possible. If it is empty when it expires, then it
         * is deleted.
         */
        public autoRenewPeriod?: (proto.IDuration|null);

        /** The shard in which this account is created */
        public shardID?: (proto.IShardID|null);

        /** The realm in which this account is created (leave this null to create a new realm) */
        public realmID?: (proto.IRealmID|null);

        /** If realmID is null, then this the admin key for the new realm that will be created */
        public newRealmAdminKey?: (proto.IKey|null);

        /** The memo associated with the account (UTF-8 encoding max 100 bytes) */
        public memo: string;

        /**
         * The maximum number of tokens that an Account can be implicitly associated with. Defaults to 0
         * and up to a maximum value of 1000.
         */
        public maxAutomaticTokenAssociations: number;

        /**
         * Creates a new CryptoCreateTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CryptoCreateTransactionBody instance
         */
        public static create(properties?: proto.ICryptoCreateTransactionBody): proto.CryptoCreateTransactionBody;

        /**
         * Encodes the specified CryptoCreateTransactionBody message. Does not implicitly {@link proto.CryptoCreateTransactionBody.verify|verify} messages.
         * @param m CryptoCreateTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ICryptoCreateTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CryptoCreateTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns CryptoCreateTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.CryptoCreateTransactionBody;
    }

    /** Properties of a CryptoDeleteTransactionBody. */
    interface ICryptoDeleteTransactionBody {

        /** The account ID which will receive all remaining hbars */
        transferAccountID?: (proto.IAccountID|null);

        /** The account ID which should be deleted */
        deleteAccountID?: (proto.IAccountID|null);
    }

    /**
     * Mark an account as deleted, moving all its current hbars to another account. It will remain in
     * the ledger, marked as deleted, until it expires. Transfers into it a deleted account fail. But a
     * deleted account can still have its expiration extended in the normal way.
     */
    class CryptoDeleteTransactionBody implements ICryptoDeleteTransactionBody {

        /**
         * Constructs a new CryptoDeleteTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ICryptoDeleteTransactionBody);

        /** The account ID which will receive all remaining hbars */
        public transferAccountID?: (proto.IAccountID|null);

        /** The account ID which should be deleted */
        public deleteAccountID?: (proto.IAccountID|null);

        /**
         * Creates a new CryptoDeleteTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CryptoDeleteTransactionBody instance
         */
        public static create(properties?: proto.ICryptoDeleteTransactionBody): proto.CryptoDeleteTransactionBody;

        /**
         * Encodes the specified CryptoDeleteTransactionBody message. Does not implicitly {@link proto.CryptoDeleteTransactionBody.verify|verify} messages.
         * @param m CryptoDeleteTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ICryptoDeleteTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CryptoDeleteTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns CryptoDeleteTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.CryptoDeleteTransactionBody;
    }

    /** Properties of a CryptoDeleteLiveHashTransactionBody. */
    interface ICryptoDeleteLiveHashTransactionBody {

        /** The account owning the livehash */
        accountOfLiveHash?: (proto.IAccountID|null);

        /** The SHA-384 livehash to delete from the account */
        liveHashToDelete?: (Uint8Array|null);
    }

    /**
     * At consensus, deletes a livehash associated to the given account. The transaction must be signed
     * by either the key of the owning account, or at least one of the keys associated to the livehash.
     */
    class CryptoDeleteLiveHashTransactionBody implements ICryptoDeleteLiveHashTransactionBody {

        /**
         * Constructs a new CryptoDeleteLiveHashTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ICryptoDeleteLiveHashTransactionBody);

        /** The account owning the livehash */
        public accountOfLiveHash?: (proto.IAccountID|null);

        /** The SHA-384 livehash to delete from the account */
        public liveHashToDelete: Uint8Array;

        /**
         * Creates a new CryptoDeleteLiveHashTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CryptoDeleteLiveHashTransactionBody instance
         */
        public static create(properties?: proto.ICryptoDeleteLiveHashTransactionBody): proto.CryptoDeleteLiveHashTransactionBody;

        /**
         * Encodes the specified CryptoDeleteLiveHashTransactionBody message. Does not implicitly {@link proto.CryptoDeleteLiveHashTransactionBody.verify|verify} messages.
         * @param m CryptoDeleteLiveHashTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ICryptoDeleteLiveHashTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CryptoDeleteLiveHashTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns CryptoDeleteLiveHashTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.CryptoDeleteLiveHashTransactionBody;
    }

    /** Properties of a CryptoTransferTransactionBody. */
    interface ICryptoTransferTransactionBody {

        /** The desired hbar balance adjustments */
        transfers?: (proto.ITransferList|null);

        /**
         * The desired token unit balance adjustments; if any custom fees are assessed, the ledger will
         * try to deduct them from the payer of this CryptoTransfer, resolving the transaction to
         * INSUFFICIENT_PAYER_BALANCE_FOR_CUSTOM_FEE if this is not possible
         */
        tokenTransfers?: (proto.ITokenTransferList[]|null);
    }

    /**
     * Transfers cryptocurrency among two or more accounts by making the desired adjustments to their
     * balances. Each transfer list can specify up to 10 adjustments. Each negative amount is withdrawn
     * from the corresponding account (a sender), and each positive one is added to the corresponding
     * account (a receiver). The amounts list must sum to zero. Each amount is a number of tinybars
     * (there are 100,000,000 tinybars in one hbar).  If any sender account fails to have sufficient
     * hbars, then the entire transaction fails, and none of those transfers occur, though the
     * transaction fee is still charged. This transaction must be signed by the keys for all the sending
     * accounts, and for any receiving accounts that have receiverSigRequired == true. The signatures
     * are in the same order as the accounts, skipping those accounts that don't need a signature.
     */
    class CryptoTransferTransactionBody implements ICryptoTransferTransactionBody {

        /**
         * Constructs a new CryptoTransferTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ICryptoTransferTransactionBody);

        /** The desired hbar balance adjustments */
        public transfers?: (proto.ITransferList|null);

        /**
         * The desired token unit balance adjustments; if any custom fees are assessed, the ledger will
         * try to deduct them from the payer of this CryptoTransfer, resolving the transaction to
         * INSUFFICIENT_PAYER_BALANCE_FOR_CUSTOM_FEE if this is not possible
         */
        public tokenTransfers: proto.ITokenTransferList[];

        /**
         * Creates a new CryptoTransferTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CryptoTransferTransactionBody instance
         */
        public static create(properties?: proto.ICryptoTransferTransactionBody): proto.CryptoTransferTransactionBody;

        /**
         * Encodes the specified CryptoTransferTransactionBody message. Does not implicitly {@link proto.CryptoTransferTransactionBody.verify|verify} messages.
         * @param m CryptoTransferTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ICryptoTransferTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CryptoTransferTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns CryptoTransferTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.CryptoTransferTransactionBody;
    }

    /** Properties of a CryptoUpdateTransactionBody. */
    interface ICryptoUpdateTransactionBody {

        /** The account ID which is being updated in this transaction */
        accountIDToUpdate?: (proto.IAccountID|null);

        /** The new key */
        key?: (proto.IKey|null);

        /**
         * ID of the account to which this account is proxy staked. If proxyAccountID is null, or is an
         * invalid account, or is an account that isn't a node, then this account is automatically proxy
         * staked to a node chosen by the network, but without earning payments. If the proxyAccountID
         * account refuses to accept proxy staking , or if it is not currently running a node, then it
         * will behave as if proxyAccountID was null.
         */
        proxyAccountID?: (proto.IAccountID|null);

        /**
         * [Deprecated]. Payments earned from proxy staking are shared between the node and this
         * account, with proxyFraction / 10000 going to this account
         */
        proxyFraction?: (number|null);

        /**
         * [Deprecated]. The new threshold amount (in tinybars) for which an account record is
         * created for any send/withdraw transaction
         */
        sendRecordThreshold?: (Long|null);

        /**
         * [Deprecated]. The new threshold amount (in tinybars) for which an account record is
         * created for any send/withdraw transaction
         */
        sendRecordThresholdWrapper?: (google.protobuf.IUInt64Value|null);

        /**
         * [Deprecated]. The new threshold amount (in tinybars) for which an account record is
         * created for any receive/deposit transaction.
         */
        receiveRecordThreshold?: (Long|null);

        /**
         * [Deprecated]. The new threshold amount (in tinybars) for which an account record is
         * created for any receive/deposit transaction.
         */
        receiveRecordThresholdWrapper?: (google.protobuf.IUInt64Value|null);

        /**
         * The duration in which it will automatically extend the expiration period. If it doesn't have
         * enough balance, it extends as long as possible. If it is empty when it expires, then it is
         * deleted.
         */
        autoRenewPeriod?: (proto.IDuration|null);

        /** The new expiration time to extend to (ignored if equal to or before the current one) */
        expirationTime?: (proto.ITimestamp|null);

        /**
         * [Deprecated] Do NOT use this field to set a false value because the server cannot
         * distinguish from the default value. Use receiverSigRequiredWrapper field for this
         * purpose.
         */
        receiverSigRequired?: (boolean|null);

        /**
         * If true, this account's key must sign any transaction depositing into this account (in
         * addition to all withdrawals)
         */
        receiverSigRequiredWrapper?: (google.protobuf.IBoolValue|null);

        /** If set, the new memo to be associated with the account (UTF-8 encoding max 100 bytes) */
        memo?: (google.protobuf.IStringValue|null);

        /**
         * The maximum number of tokens that an Account can be implicitly associated with. Up to a 1000
         * including implicit and explicit associations.
         */
        maxAutomaticTokenAssociations?: (google.protobuf.IUInt32Value|null);
    }

    /**
     * Change properties for the given account. Any null field is ignored (left unchanged). This
     * transaction must be signed by the existing key for this account. If the transaction is changing
     * the key field, then the transaction must be signed by both the old key (from before the change)
     * and the new key. The old key must sign for security. The new key must sign as a safeguard to
     * avoid accidentally changing to an invalid key, and then having no way to recover.
     */
    class CryptoUpdateTransactionBody implements ICryptoUpdateTransactionBody {

        /**
         * Constructs a new CryptoUpdateTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ICryptoUpdateTransactionBody);

        /** The account ID which is being updated in this transaction */
        public accountIDToUpdate?: (proto.IAccountID|null);

        /** The new key */
        public key?: (proto.IKey|null);

        /**
         * ID of the account to which this account is proxy staked. If proxyAccountID is null, or is an
         * invalid account, or is an account that isn't a node, then this account is automatically proxy
         * staked to a node chosen by the network, but without earning payments. If the proxyAccountID
         * account refuses to accept proxy staking , or if it is not currently running a node, then it
         * will behave as if proxyAccountID was null.
         */
        public proxyAccountID?: (proto.IAccountID|null);

        /**
         * [Deprecated]. Payments earned from proxy staking are shared between the node and this
         * account, with proxyFraction / 10000 going to this account
         */
        public proxyFraction: number;

        /**
         * [Deprecated]. The new threshold amount (in tinybars) for which an account record is
         * created for any send/withdraw transaction
         */
        public sendRecordThreshold?: (Long|null);

        /**
         * [Deprecated]. The new threshold amount (in tinybars) for which an account record is
         * created for any send/withdraw transaction
         */
        public sendRecordThresholdWrapper?: (google.protobuf.IUInt64Value|null);

        /**
         * [Deprecated]. The new threshold amount (in tinybars) for which an account record is
         * created for any receive/deposit transaction.
         */
        public receiveRecordThreshold?: (Long|null);

        /**
         * [Deprecated]. The new threshold amount (in tinybars) for which an account record is
         * created for any receive/deposit transaction.
         */
        public receiveRecordThresholdWrapper?: (google.protobuf.IUInt64Value|null);

        /**
         * The duration in which it will automatically extend the expiration period. If it doesn't have
         * enough balance, it extends as long as possible. If it is empty when it expires, then it is
         * deleted.
         */
        public autoRenewPeriod?: (proto.IDuration|null);

        /** The new expiration time to extend to (ignored if equal to or before the current one) */
        public expirationTime?: (proto.ITimestamp|null);

        /**
         * [Deprecated] Do NOT use this field to set a false value because the server cannot
         * distinguish from the default value. Use receiverSigRequiredWrapper field for this
         * purpose.
         */
        public receiverSigRequired?: (boolean|null);

        /**
         * If true, this account's key must sign any transaction depositing into this account (in
         * addition to all withdrawals)
         */
        public receiverSigRequiredWrapper?: (google.protobuf.IBoolValue|null);

        /** If set, the new memo to be associated with the account (UTF-8 encoding max 100 bytes) */
        public memo?: (google.protobuf.IStringValue|null);

        /**
         * The maximum number of tokens that an Account can be implicitly associated with. Up to a 1000
         * including implicit and explicit associations.
         */
        public maxAutomaticTokenAssociations?: (google.protobuf.IUInt32Value|null);

        /** CryptoUpdateTransactionBody sendRecordThresholdField. */
        public sendRecordThresholdField?: ("sendRecordThreshold"|"sendRecordThresholdWrapper");

        /** CryptoUpdateTransactionBody receiveRecordThresholdField. */
        public receiveRecordThresholdField?: ("receiveRecordThreshold"|"receiveRecordThresholdWrapper");

        /** CryptoUpdateTransactionBody receiverSigRequiredField. */
        public receiverSigRequiredField?: ("receiverSigRequired"|"receiverSigRequiredWrapper");

        /**
         * Creates a new CryptoUpdateTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CryptoUpdateTransactionBody instance
         */
        public static create(properties?: proto.ICryptoUpdateTransactionBody): proto.CryptoUpdateTransactionBody;

        /**
         * Encodes the specified CryptoUpdateTransactionBody message. Does not implicitly {@link proto.CryptoUpdateTransactionBody.verify|verify} messages.
         * @param m CryptoUpdateTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ICryptoUpdateTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CryptoUpdateTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns CryptoUpdateTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.CryptoUpdateTransactionBody;
    }

    /** Properties of a FileAppendTransactionBody. */
    interface IFileAppendTransactionBody {

        /** The file to which the bytes will be appended */
        fileID?: (proto.IFileID|null);

        /** The bytes that will be appended to the end of the specified file */
        contents?: (Uint8Array|null);
    }

    /**
     * Append the given contents to the end of the specified file. If a file is too big to create with a
     * single FileCreateTransaction, then it can be created with the first part of its contents, and
     * then appended as many times as necessary to create the entire file. This transaction must be
     * signed by all initial M-of-M KeyList keys. If keys contains additional KeyList or ThresholdKey
     * then M-of-M secondary KeyList or ThresholdKey signing requirements must be meet.
     */
    class FileAppendTransactionBody implements IFileAppendTransactionBody {

        /**
         * Constructs a new FileAppendTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IFileAppendTransactionBody);

        /** The file to which the bytes will be appended */
        public fileID?: (proto.IFileID|null);

        /** The bytes that will be appended to the end of the specified file */
        public contents: Uint8Array;

        /**
         * Creates a new FileAppendTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns FileAppendTransactionBody instance
         */
        public static create(properties?: proto.IFileAppendTransactionBody): proto.FileAppendTransactionBody;

        /**
         * Encodes the specified FileAppendTransactionBody message. Does not implicitly {@link proto.FileAppendTransactionBody.verify|verify} messages.
         * @param m FileAppendTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IFileAppendTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a FileAppendTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns FileAppendTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.FileAppendTransactionBody;
    }

    /** Properties of a FileCreateTransactionBody. */
    interface IFileCreateTransactionBody {

        /**
         * The time at which this file should expire (unless FileUpdateTransaction is used before then
         * to extend its life)
         */
        expirationTime?: (proto.ITimestamp|null);

        /**
         * All keys at the top level of a key list must sign to create or modify the file. Any one of
         * the keys at the top level key list can sign to delete the file.
         */
        keys?: (proto.IKeyList|null);

        /** The bytes that are the contents of the file */
        contents?: (Uint8Array|null);

        /** Shard in which this file is created */
        shardID?: (proto.IShardID|null);

        /** The Realm in which to the file is created (leave this null to create a new realm) */
        realmID?: (proto.IRealmID|null);

        /** If realmID is null, then this the admin key for the new realm that will be created */
        newRealmAdminKey?: (proto.IKey|null);

        /** The memo associated with the file (UTF-8 encoding max 100 bytes) */
        memo?: (string|null);
    }

    /**
     * Create a new file, containing the given contents.
     * After the file is created, the FileID for it can be found in the receipt, or record, or retrieved
     * with a GetByKey query.
     *
     * The file contains the specified contents (possibly empty). The file will automatically disappear
     * at the expirationTime, unless its expiration is extended by another transaction before that time.
     * If the file is deleted, then its contents will become empty and it will be marked as deleted
     * until it expires, and then it will cease to exist.
     *
     * The keys field is a list of keys. All keys within the top-level key list must sign (M-M) to
     * create or modify a file. However, to delete the file, only one key (1-M) is required to sign from
     * the top-level key list.  Each of those "keys" may itself be threshold key containing other keys
     * (including other threshold keys). In other words, the behavior is an AND for create/modify, OR
     * for delete. This is useful for acting as a revocation server. If it is desired to have the
     * behavior be AND for all 3 operations (or OR for all 3), then the list should have only a single
     * Key, which is a threshold key, with N=1 for OR, N=M for AND.
     *
     * If a file is created without ANY keys in the keys field, the file is immutable and ONLY the
     * expirationTime of the file can be changed with a FileUpdate transaction. The file contents or its
     * keys cannot be changed.
     *
     * An entity (account, file, or smart contract instance) must be created in a particular realm. If
     * the realmID is left null, then a new realm will be created with the given admin key. If a new
     * realm has a null adminKey, then anyone can create/modify/delete entities in that realm. But if an
     * admin key is given, then any transaction to create/modify/delete an entity in that realm must be
     * signed by that key, though anyone can still call functions on smart contract instances that exist
     * in that realm. A realm ceases to exist when everything within it has expired and no longer
     * exists.
     *
     * The current API ignores shardID, realmID, and newRealmAdminKey, and creates everything in shard 0
     * and realm 0, with a null key. Future versions of the API will support multiple realms and
     * multiple shards.
     */
    class FileCreateTransactionBody implements IFileCreateTransactionBody {

        /**
         * Constructs a new FileCreateTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IFileCreateTransactionBody);

        /**
         * The time at which this file should expire (unless FileUpdateTransaction is used before then
         * to extend its life)
         */
        public expirationTime?: (proto.ITimestamp|null);

        /**
         * All keys at the top level of a key list must sign to create or modify the file. Any one of
         * the keys at the top level key list can sign to delete the file.
         */
        public keys?: (proto.IKeyList|null);

        /** The bytes that are the contents of the file */
        public contents: Uint8Array;

        /** Shard in which this file is created */
        public shardID?: (proto.IShardID|null);

        /** The Realm in which to the file is created (leave this null to create a new realm) */
        public realmID?: (proto.IRealmID|null);

        /** If realmID is null, then this the admin key for the new realm that will be created */
        public newRealmAdminKey?: (proto.IKey|null);

        /** The memo associated with the file (UTF-8 encoding max 100 bytes) */
        public memo: string;

        /**
         * Creates a new FileCreateTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns FileCreateTransactionBody instance
         */
        public static create(properties?: proto.IFileCreateTransactionBody): proto.FileCreateTransactionBody;

        /**
         * Encodes the specified FileCreateTransactionBody message. Does not implicitly {@link proto.FileCreateTransactionBody.verify|verify} messages.
         * @param m FileCreateTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IFileCreateTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a FileCreateTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns FileCreateTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.FileCreateTransactionBody;
    }

    /** Properties of a FileDeleteTransactionBody. */
    interface IFileDeleteTransactionBody {

        /** The file to delete. It will be marked as deleted until it expires. Then it will disappear. */
        fileID?: (proto.IFileID|null);
    }

    /**
     * Delete the given file. After deletion, it will be marked as deleted and will have no contents.
     * But information about it will continue to exist until it expires. A list of keys was given when
     * the file was created. All the top level keys on that list must sign transactions to create or
     * modify the file, but any single one of the top level keys can be used to delete the file. This
     * transaction must be signed by 1-of-M KeyList keys. If keys contains additional KeyList or
     * ThresholdKey then 1-of-M secondary KeyList or ThresholdKey signing requirements must be meet.
     */
    class FileDeleteTransactionBody implements IFileDeleteTransactionBody {

        /**
         * Constructs a new FileDeleteTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IFileDeleteTransactionBody);

        /** The file to delete. It will be marked as deleted until it expires. Then it will disappear. */
        public fileID?: (proto.IFileID|null);

        /**
         * Creates a new FileDeleteTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns FileDeleteTransactionBody instance
         */
        public static create(properties?: proto.IFileDeleteTransactionBody): proto.FileDeleteTransactionBody;

        /**
         * Encodes the specified FileDeleteTransactionBody message. Does not implicitly {@link proto.FileDeleteTransactionBody.verify|verify} messages.
         * @param m FileDeleteTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IFileDeleteTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a FileDeleteTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns FileDeleteTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.FileDeleteTransactionBody;
    }

    /** Properties of a FileUpdateTransactionBody. */
    interface IFileUpdateTransactionBody {

        /** The ID of the file to update */
        fileID?: (proto.IFileID|null);

        /** The new expiry time (ignored if not later than the current expiry) */
        expirationTime?: (proto.ITimestamp|null);

        /** The new list of keys that can modify or delete the file */
        keys?: (proto.IKeyList|null);

        /** The new contents that should overwrite the file's current contents */
        contents?: (Uint8Array|null);

        /** If set, the new memo to be associated with the file (UTF-8 encoding max 100 bytes) */
        memo?: (google.protobuf.IStringValue|null);
    }

    /**
     * Modify the metadata and/or contents of a file. If a field is not set in the transaction body, the
     * corresponding file attribute will be unchanged. This transaction must be signed by all the keys
     * in the top level of a key list (M-of-M) of the file being updated. If the keys themselves are
     * being updated, then the transaction must also be signed by all the new keys. If the keys contain
     * additional KeyList or ThresholdKey then M-of-M secondary KeyList or ThresholdKey signing
     * requirements must be meet
     */
    class FileUpdateTransactionBody implements IFileUpdateTransactionBody {

        /**
         * Constructs a new FileUpdateTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IFileUpdateTransactionBody);

        /** The ID of the file to update */
        public fileID?: (proto.IFileID|null);

        /** The new expiry time (ignored if not later than the current expiry) */
        public expirationTime?: (proto.ITimestamp|null);

        /** The new list of keys that can modify or delete the file */
        public keys?: (proto.IKeyList|null);

        /** The new contents that should overwrite the file's current contents */
        public contents: Uint8Array;

        /** If set, the new memo to be associated with the file (UTF-8 encoding max 100 bytes) */
        public memo?: (google.protobuf.IStringValue|null);

        /**
         * Creates a new FileUpdateTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns FileUpdateTransactionBody instance
         */
        public static create(properties?: proto.IFileUpdateTransactionBody): proto.FileUpdateTransactionBody;

        /**
         * Encodes the specified FileUpdateTransactionBody message. Does not implicitly {@link proto.FileUpdateTransactionBody.verify|verify} messages.
         * @param m FileUpdateTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IFileUpdateTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a FileUpdateTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns FileUpdateTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.FileUpdateTransactionBody;
    }

    /** Properties of a ContractDeleteTransactionBody. */
    interface IContractDeleteTransactionBody {

        /** The id of the contract to be deleted */
        contractID?: (proto.IContractID|null);

        /** The id of an account to receive any remaining hBars from the deleted contract */
        transferAccountID?: (proto.IAccountID|null);

        /** The id of a contract to receive any remaining hBars from the deleted contract */
        transferContractID?: (proto.IContractID|null);
    }

    /**
     * At consensus, marks a contract as deleted and transfers its remaining hBars, if any, to a
     * designated receiver. After a contract is deleted, it can no longer be called.
     *
     * If the target contract is immutable (that is, was created without an admin key), then this
     * transaction resolves to MODIFYING_IMMUTABLE_CONTRACT.
     *
     * --- Signing Requirements ---
     * 1. The admin key of the target contract must sign.
     * 2. If the transfer account or contract has receiverSigRequired, its associated key must also sign
     */
    class ContractDeleteTransactionBody implements IContractDeleteTransactionBody {

        /**
         * Constructs a new ContractDeleteTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IContractDeleteTransactionBody);

        /** The id of the contract to be deleted */
        public contractID?: (proto.IContractID|null);

        /** The id of an account to receive any remaining hBars from the deleted contract */
        public transferAccountID?: (proto.IAccountID|null);

        /** The id of a contract to receive any remaining hBars from the deleted contract */
        public transferContractID?: (proto.IContractID|null);

        /** ContractDeleteTransactionBody obtainers. */
        public obtainers?: ("transferAccountID"|"transferContractID");

        /**
         * Creates a new ContractDeleteTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ContractDeleteTransactionBody instance
         */
        public static create(properties?: proto.IContractDeleteTransactionBody): proto.ContractDeleteTransactionBody;

        /**
         * Encodes the specified ContractDeleteTransactionBody message. Does not implicitly {@link proto.ContractDeleteTransactionBody.verify|verify} messages.
         * @param m ContractDeleteTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IContractDeleteTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ContractDeleteTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ContractDeleteTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ContractDeleteTransactionBody;
    }

    /** Properties of a ConsensusUpdateTopicTransactionBody. */
    interface IConsensusUpdateTopicTransactionBody {

        /** UNDOCUMENTED */
        topicID?: (proto.ITopicID|null);

        /** If set, the new memo to be associated with the topic (UTF-8 encoding max 100 bytes) */
        memo?: (google.protobuf.IStringValue|null);

        /**
         * Effective consensus timestamp at (and after) which all consensus transactions and queries will fail.
         * The expirationTime may be no longer than MAX_AUTORENEW_PERIOD (8000001 seconds) from the consensus timestamp of
         * this transaction.
         * On topics with no adminKey, extending the expirationTime is the only updateTopic option allowed on the topic.
         * If unspecified, no change.
         */
        expirationTime?: (proto.ITimestamp|null);

        /**
         * Access control for update/delete of the topic.
         * If unspecified, no change.
         * If empty keyList - the adminKey is cleared.
         */
        adminKey?: (proto.IKey|null);

        /**
         * Access control for ConsensusService.submitMessage.
         * If unspecified, no change.
         * If empty keyList - the submitKey is cleared.
         */
        submitKey?: (proto.IKey|null);

        /** ConsensusUpdateTopicTransactionBody autoRenewPeriod */
        autoRenewPeriod?: (proto.IDuration|null);

        /**
         * Optional account to be used at the topic's expirationTime to extend the life of the topic.
         * Once autoRenew functionality is supported by HAPI, the topic lifetime will be extended up to a maximum of the
         * autoRenewPeriod or however long the topic can be extended using all funds on the account (whichever is the
         * smaller duration/amount).
         * If specified as the default value (0.0.0), the autoRenewAccount will be removed.
         * If unspecified, no change.
         */
        autoRenewAccount?: (proto.IAccountID|null);
    }

    /**
     * All fields left null will not be updated.
     * See [ConsensusService.updateTopic()](#proto.ConsensusService)
     */
    class ConsensusUpdateTopicTransactionBody implements IConsensusUpdateTopicTransactionBody {

        /**
         * Constructs a new ConsensusUpdateTopicTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IConsensusUpdateTopicTransactionBody);

        /** UNDOCUMENTED */
        public topicID?: (proto.ITopicID|null);

        /** If set, the new memo to be associated with the topic (UTF-8 encoding max 100 bytes) */
        public memo?: (google.protobuf.IStringValue|null);

        /**
         * Effective consensus timestamp at (and after) which all consensus transactions and queries will fail.
         * The expirationTime may be no longer than MAX_AUTORENEW_PERIOD (8000001 seconds) from the consensus timestamp of
         * this transaction.
         * On topics with no adminKey, extending the expirationTime is the only updateTopic option allowed on the topic.
         * If unspecified, no change.
         */
        public expirationTime?: (proto.ITimestamp|null);

        /**
         * Access control for update/delete of the topic.
         * If unspecified, no change.
         * If empty keyList - the adminKey is cleared.
         */
        public adminKey?: (proto.IKey|null);

        /**
         * Access control for ConsensusService.submitMessage.
         * If unspecified, no change.
         * If empty keyList - the submitKey is cleared.
         */
        public submitKey?: (proto.IKey|null);

        /** ConsensusUpdateTopicTransactionBody autoRenewPeriod. */
        public autoRenewPeriod?: (proto.IDuration|null);

        /**
         * Optional account to be used at the topic's expirationTime to extend the life of the topic.
         * Once autoRenew functionality is supported by HAPI, the topic lifetime will be extended up to a maximum of the
         * autoRenewPeriod or however long the topic can be extended using all funds on the account (whichever is the
         * smaller duration/amount).
         * If specified as the default value (0.0.0), the autoRenewAccount will be removed.
         * If unspecified, no change.
         */
        public autoRenewAccount?: (proto.IAccountID|null);

        /**
         * Creates a new ConsensusUpdateTopicTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ConsensusUpdateTopicTransactionBody instance
         */
        public static create(properties?: proto.IConsensusUpdateTopicTransactionBody): proto.ConsensusUpdateTopicTransactionBody;

        /**
         * Encodes the specified ConsensusUpdateTopicTransactionBody message. Does not implicitly {@link proto.ConsensusUpdateTopicTransactionBody.verify|verify} messages.
         * @param m ConsensusUpdateTopicTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IConsensusUpdateTopicTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ConsensusUpdateTopicTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ConsensusUpdateTopicTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ConsensusUpdateTopicTransactionBody;
    }

    /** Properties of a ConsensusMessageChunkInfo. */
    interface IConsensusMessageChunkInfo {

        /** TransactionID of the first chunk, gets copied to every subsequent chunk in a fragmented message. */
        initialTransactionID?: (proto.ITransactionID|null);

        /** The total number of chunks in the message. */
        total?: (number|null);

        /** The sequence number (from 1 to total) of the current chunk in the message. */
        number?: (number|null);
    }

    /** UNDOCUMENTED */
    class ConsensusMessageChunkInfo implements IConsensusMessageChunkInfo {

        /**
         * Constructs a new ConsensusMessageChunkInfo.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IConsensusMessageChunkInfo);

        /** TransactionID of the first chunk, gets copied to every subsequent chunk in a fragmented message. */
        public initialTransactionID?: (proto.ITransactionID|null);

        /** The total number of chunks in the message. */
        public total: number;

        /** The sequence number (from 1 to total) of the current chunk in the message. */
        public number: number;

        /**
         * Creates a new ConsensusMessageChunkInfo instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ConsensusMessageChunkInfo instance
         */
        public static create(properties?: proto.IConsensusMessageChunkInfo): proto.ConsensusMessageChunkInfo;

        /**
         * Encodes the specified ConsensusMessageChunkInfo message. Does not implicitly {@link proto.ConsensusMessageChunkInfo.verify|verify} messages.
         * @param m ConsensusMessageChunkInfo message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IConsensusMessageChunkInfo, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ConsensusMessageChunkInfo message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ConsensusMessageChunkInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ConsensusMessageChunkInfo;
    }

    /** Properties of a ConsensusSubmitMessageTransactionBody. */
    interface IConsensusSubmitMessageTransactionBody {

        /** Topic to submit message to. */
        topicID?: (proto.ITopicID|null);

        /** Message to be submitted. Max size of the Transaction (including signatures) is 6KiB. */
        message?: (Uint8Array|null);

        /** Optional information of the current chunk in a fragmented message. */
        chunkInfo?: (proto.IConsensusMessageChunkInfo|null);
    }

    /** UNDOCUMENTED */
    class ConsensusSubmitMessageTransactionBody implements IConsensusSubmitMessageTransactionBody {

        /**
         * Constructs a new ConsensusSubmitMessageTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IConsensusSubmitMessageTransactionBody);

        /** Topic to submit message to. */
        public topicID?: (proto.ITopicID|null);

        /** Message to be submitted. Max size of the Transaction (including signatures) is 6KiB. */
        public message: Uint8Array;

        /** Optional information of the current chunk in a fragmented message. */
        public chunkInfo?: (proto.IConsensusMessageChunkInfo|null);

        /**
         * Creates a new ConsensusSubmitMessageTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ConsensusSubmitMessageTransactionBody instance
         */
        public static create(properties?: proto.IConsensusSubmitMessageTransactionBody): proto.ConsensusSubmitMessageTransactionBody;

        /**
         * Encodes the specified ConsensusSubmitMessageTransactionBody message. Does not implicitly {@link proto.ConsensusSubmitMessageTransactionBody.verify|verify} messages.
         * @param m ConsensusSubmitMessageTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IConsensusSubmitMessageTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ConsensusSubmitMessageTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ConsensusSubmitMessageTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ConsensusSubmitMessageTransactionBody;
    }

    /** Properties of an UncheckedSubmitBody. */
    interface IUncheckedSubmitBody {

        /** The serialized bytes of the Transaction to be submitted without prechecks */
        transactionBytes?: (Uint8Array|null);
    }

    /**
     * Submit an arbitrary (serialized) Transaction to the network without prechecks. Requires superuser
     * privileges.
     */
    class UncheckedSubmitBody implements IUncheckedSubmitBody {

        /**
         * Constructs a new UncheckedSubmitBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IUncheckedSubmitBody);

        /** The serialized bytes of the Transaction to be submitted without prechecks */
        public transactionBytes: Uint8Array;

        /**
         * Creates a new UncheckedSubmitBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UncheckedSubmitBody instance
         */
        public static create(properties?: proto.IUncheckedSubmitBody): proto.UncheckedSubmitBody;

        /**
         * Encodes the specified UncheckedSubmitBody message. Does not implicitly {@link proto.UncheckedSubmitBody.verify|verify} messages.
         * @param m UncheckedSubmitBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IUncheckedSubmitBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an UncheckedSubmitBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns UncheckedSubmitBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.UncheckedSubmitBody;
    }

    /** Properties of a TokenCreateTransactionBody. */
    interface ITokenCreateTransactionBody {

        /**
         * The publicly visible name of the token, limited to a UTF-8 encoding of
         * length <tt>tokens.maxSymbolUtf8Bytes</tt>.
         */
        name?: (string|null);

        /**
         * The publicly visible token symbol, limited to a UTF-8 encoding of length
         * <tt>tokens.maxTokenNameUtf8Bytes</tt>.
         */
        symbol?: (string|null);

        /**
         * For tokens of type FUNGIBLE_COMMON - the number of decimal places a
         * token is divisible by. For tokens of type NON_FUNGIBLE_UNIQUE - value
         * must be 0
         */
        decimals?: (number|null);

        /**
         * Specifies the initial supply of tokens to be put in circulation. The
         * initial supply is sent to the Treasury Account. The supply is in the
         * lowest denomination possible. In the case for NON_FUNGIBLE_UNIQUE Type
         * the value must be 0
         */
        initialSupply?: (Long|null);

        /**
         * The account which will act as a treasury for the token. This account
         * will receive the specified initial supply or the newly minted NFTs in
         * the case for NON_FUNGIBLE_UNIQUE Type
         */
        treasury?: (proto.IAccountID|null);

        /**
         * The key which can perform update/delete operations on the token. If empty, the token can be
         * perceived as immutable (not being able to be updated/deleted)
         */
        adminKey?: (proto.IKey|null);

        /**
         * The key which can grant or revoke KYC of an account for the token's transactions. If empty,
         * KYC is not required, and KYC grant or revoke operations are not possible.
         */
        kycKey?: (proto.IKey|null);

        /**
         * The key which can sign to freeze or unfreeze an account for token transactions. If empty,
         * freezing is not possible
         */
        freezeKey?: (proto.IKey|null);

        /** The key which can wipe the token balance of an account. If empty, wipe is not possible */
        wipeKey?: (proto.IKey|null);

        /**
         * The key which can change the supply of a token. The key is used to sign Token Mint/Burn
         * operations
         */
        supplyKey?: (proto.IKey|null);

        /**
         * The default Freeze status (frozen or unfrozen) of Hedera accounts relative to this token. If
         * true, an account must be unfrozen before it can receive the token
         */
        freezeDefault?: (boolean|null);

        /**
         * The epoch second at which the token should expire; if an auto-renew account and period are
         * specified, this is coerced to the current epoch second plus the autoRenewPeriod
         */
        expiry?: (proto.ITimestamp|null);

        /**
         * An account which will be automatically charged to renew the token's expiration, at
         * autoRenewPeriod interval
         */
        autoRenewAccount?: (proto.IAccountID|null);

        /** The interval at which the auto-renew account will be charged to extend the token's expiry */
        autoRenewPeriod?: (proto.IDuration|null);

        /** The memo associated with the token (UTF-8 encoding max 100 bytes) */
        memo?: (string|null);

        /** IWA compatibility. Specifies the token type. Defaults to FUNGIBLE_COMMON */
        tokenType?: (proto.TokenType|null);

        /** IWA compatibility. Specified the token supply type. Defaults to INFINITE */
        supplyType?: (proto.TokenSupplyType|null);

        /**
         * IWA Compatibility. Depends on TokenSupplyType. For tokens of type FUNGIBLE_COMMON - the
         * maximum number of tokens that can be in circulation. For tokens of type NON_FUNGIBLE_UNIQUE -
         * the maximum number of NFTs (serial numbers) that can be minted. This field can never be
         * changed!
         */
        maxSupply?: (Long|null);

        /**
         * The key which can change the token's custom fee schedule; must sign a TokenFeeScheduleUpdate
         * transaction
         */
        feeScheduleKey?: (proto.IKey|null);

        /** The custom fees to be assessed during a CryptoTransfer that transfers units of this token */
        customFees?: (proto.ICustomFee[]|null);

        /**
         * The Key which can pause and unpause the Token.
         * If Empty the token pause status defaults to PauseNotApplicable, otherwise Unpaused.
         */
        pauseKey?: (proto.IKey|null);
    }

    /**
     * Create a new token. After the token is created, the Token ID for it is in the receipt.
     * The specified Treasury Account is receiving the initial supply of tokens as-well as the tokens
     * from the Token Mint operation once executed. The balance of the treasury account is decreased
     * when the Token Burn operation is executed.
     *
     * The <tt>initialSupply</tt> is the initial supply of the smallest parts of a token (like a
     * tinybar, not an hbar). These are the smallest units of the token which may be transferred.
     *
     * The supply can change over time. If the total supply at some moment is <i>S</i> parts of tokens,
     * and the token is using <i>D</i> decimals, then <i>S</i> must be less than or equal to
     * 2<sup>63</sup>-1, which is 9,223,372,036,854,775,807. The number of whole tokens (not parts) will
     * be <i>S / 10<sup>D</sup></i>.
     *
     * If decimals is 8 or 11, then the number of whole tokens can be at most a few billions or
     * millions, respectively. For example, it could match Bitcoin (21 million whole tokens with 8
     * decimals) or hbars (50 billion whole tokens with 8 decimals). It could even match Bitcoin with
     * milli-satoshis (21 million whole tokens with 11 decimals).
     *
     * Note that a created token is <i>immutable</i> if the <tt>adminKey</tt> is omitted. No property of
     * an immutable token can ever change, with the sole exception of its expiry. Anyone can pay to
     * extend the expiry time of an immutable token.
     *
     * A token can be either <i>FUNGIBLE_COMMON</i> or <i>NON_FUNGIBLE_UNIQUE</i>, based on its
     * <i>TokenType</i>. If it has been omitted, <i>FUNGIBLE_COMMON</i> type is used.
     *
     * A token can have either <i>INFINITE</i> or <i>FINITE</i> supply type, based on its
     * <i>TokenType</i>. If it has been omitted, <i>INFINITE</i> type is used.
     *
     * If a <i>FUNGIBLE</i> TokenType is used, <i>initialSupply</i> should explicitly be set to a
     * non-negative. If not, the transaction will resolve to INVALID_TOKEN_INITIAL_SUPPLY.
     *
     * If a <i>NON_FUNGIBLE_UNIQUE</i> TokenType is used, <i>initialSupply</i> should explicitly be set
     * to 0. If not, the transaction will resolve to INVALID_TOKEN_INITIAL_SUPPLY.
     *
     * If an <i>INFINITE</i> TokenSupplyType is used, <i>maxSupply</i> should explicitly be set to 0. If
     * it is not 0, the transaction will resolve to INVALID_TOKEN_MAX_SUPPLY.
     *
     * If a <i>FINITE</i> TokenSupplyType is used, <i>maxSupply</i> should be explicitly set to a
     * non-negative value. If it is not, the transaction will resolve to INVALID_TOKEN_MAX_SUPPLY.
     */
    class TokenCreateTransactionBody implements ITokenCreateTransactionBody {

        /**
         * Constructs a new TokenCreateTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITokenCreateTransactionBody);

        /**
         * The publicly visible name of the token, limited to a UTF-8 encoding of
         * length <tt>tokens.maxSymbolUtf8Bytes</tt>.
         */
        public name: string;

        /**
         * The publicly visible token symbol, limited to a UTF-8 encoding of length
         * <tt>tokens.maxTokenNameUtf8Bytes</tt>.
         */
        public symbol: string;

        /**
         * For tokens of type FUNGIBLE_COMMON - the number of decimal places a
         * token is divisible by. For tokens of type NON_FUNGIBLE_UNIQUE - value
         * must be 0
         */
        public decimals: number;

        /**
         * Specifies the initial supply of tokens to be put in circulation. The
         * initial supply is sent to the Treasury Account. The supply is in the
         * lowest denomination possible. In the case for NON_FUNGIBLE_UNIQUE Type
         * the value must be 0
         */
        public initialSupply: Long;

        /**
         * The account which will act as a treasury for the token. This account
         * will receive the specified initial supply or the newly minted NFTs in
         * the case for NON_FUNGIBLE_UNIQUE Type
         */
        public treasury?: (proto.IAccountID|null);

        /**
         * The key which can perform update/delete operations on the token. If empty, the token can be
         * perceived as immutable (not being able to be updated/deleted)
         */
        public adminKey?: (proto.IKey|null);

        /**
         * The key which can grant or revoke KYC of an account for the token's transactions. If empty,
         * KYC is not required, and KYC grant or revoke operations are not possible.
         */
        public kycKey?: (proto.IKey|null);

        /**
         * The key which can sign to freeze or unfreeze an account for token transactions. If empty,
         * freezing is not possible
         */
        public freezeKey?: (proto.IKey|null);

        /** The key which can wipe the token balance of an account. If empty, wipe is not possible */
        public wipeKey?: (proto.IKey|null);

        /**
         * The key which can change the supply of a token. The key is used to sign Token Mint/Burn
         * operations
         */
        public supplyKey?: (proto.IKey|null);

        /**
         * The default Freeze status (frozen or unfrozen) of Hedera accounts relative to this token. If
         * true, an account must be unfrozen before it can receive the token
         */
        public freezeDefault: boolean;

        /**
         * The epoch second at which the token should expire; if an auto-renew account and period are
         * specified, this is coerced to the current epoch second plus the autoRenewPeriod
         */
        public expiry?: (proto.ITimestamp|null);

        /**
         * An account which will be automatically charged to renew the token's expiration, at
         * autoRenewPeriod interval
         */
        public autoRenewAccount?: (proto.IAccountID|null);

        /** The interval at which the auto-renew account will be charged to extend the token's expiry */
        public autoRenewPeriod?: (proto.IDuration|null);

        /** The memo associated with the token (UTF-8 encoding max 100 bytes) */
        public memo: string;

        /** IWA compatibility. Specifies the token type. Defaults to FUNGIBLE_COMMON */
        public tokenType: proto.TokenType;

        /** IWA compatibility. Specified the token supply type. Defaults to INFINITE */
        public supplyType: proto.TokenSupplyType;

        /**
         * IWA Compatibility. Depends on TokenSupplyType. For tokens of type FUNGIBLE_COMMON - the
         * maximum number of tokens that can be in circulation. For tokens of type NON_FUNGIBLE_UNIQUE -
         * the maximum number of NFTs (serial numbers) that can be minted. This field can never be
         * changed!
         */
        public maxSupply: Long;

        /**
         * The key which can change the token's custom fee schedule; must sign a TokenFeeScheduleUpdate
         * transaction
         */
        public feeScheduleKey?: (proto.IKey|null);

        /** The custom fees to be assessed during a CryptoTransfer that transfers units of this token */
        public customFees: proto.ICustomFee[];

        /**
         * The Key which can pause and unpause the Token.
         * If Empty the token pause status defaults to PauseNotApplicable, otherwise Unpaused.
         */
        public pauseKey?: (proto.IKey|null);

        /**
         * Creates a new TokenCreateTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TokenCreateTransactionBody instance
         */
        public static create(properties?: proto.ITokenCreateTransactionBody): proto.TokenCreateTransactionBody;

        /**
         * Encodes the specified TokenCreateTransactionBody message. Does not implicitly {@link proto.TokenCreateTransactionBody.verify|verify} messages.
         * @param m TokenCreateTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITokenCreateTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TokenCreateTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TokenCreateTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TokenCreateTransactionBody;
    }

    /** Properties of a FractionalFee. */
    interface IFractionalFee {

        /** The fraction of the transferred units to assess as a fee */
        fractionalAmount?: (proto.IFraction|null);

        /** The minimum amount to assess */
        minimumAmount?: (Long|null);

        /** The maximum amount to assess (zero implies no maximum) */
        maximumAmount?: (Long|null);

        /**
         * If true, assesses the fee to the sender, so the receiver gets the full amount from the token
         * transfer list, and the sender is charged an additional fee; if false, the receiver does NOT get
         * the full amount, but only what is left over after paying the fractional fee
         */
        netOfTransfers?: (boolean|null);
    }

    /**
     * A fraction of the transferred units of a token to assess as a fee. The amount assessed will never
     * be less than the given minimum_amount, and never greater than the given maximum_amount.  The
     * denomination is always units of the token to which this fractional fee is attached.
     */
    class FractionalFee implements IFractionalFee {

        /**
         * Constructs a new FractionalFee.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IFractionalFee);

        /** The fraction of the transferred units to assess as a fee */
        public fractionalAmount?: (proto.IFraction|null);

        /** The minimum amount to assess */
        public minimumAmount: Long;

        /** The maximum amount to assess (zero implies no maximum) */
        public maximumAmount: Long;

        /**
         * If true, assesses the fee to the sender, so the receiver gets the full amount from the token
         * transfer list, and the sender is charged an additional fee; if false, the receiver does NOT get
         * the full amount, but only what is left over after paying the fractional fee
         */
        public netOfTransfers: boolean;

        /**
         * Creates a new FractionalFee instance using the specified properties.
         * @param [properties] Properties to set
         * @returns FractionalFee instance
         */
        public static create(properties?: proto.IFractionalFee): proto.FractionalFee;

        /**
         * Encodes the specified FractionalFee message. Does not implicitly {@link proto.FractionalFee.verify|verify} messages.
         * @param m FractionalFee message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IFractionalFee, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a FractionalFee message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns FractionalFee
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.FractionalFee;
    }

    /** Properties of a FixedFee. */
    interface IFixedFee {

        /** The number of units to assess as a fee */
        amount?: (Long|null);

        /**
         * The denomination of the fee; taken as hbar if left unset and, in a TokenCreate, taken as the id
         * of the newly created token if set to the sentinel value of 0.0.0
         */
        denominatingTokenId?: (proto.ITokenID|null);
    }

    /**
     * A fixed number of units (hbar or token) to assess as a fee during a CryptoTransfer that transfers
     * units of the token to which this fixed fee is attached.
     */
    class FixedFee implements IFixedFee {

        /**
         * Constructs a new FixedFee.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IFixedFee);

        /** The number of units to assess as a fee */
        public amount: Long;

        /**
         * The denomination of the fee; taken as hbar if left unset and, in a TokenCreate, taken as the id
         * of the newly created token if set to the sentinel value of 0.0.0
         */
        public denominatingTokenId?: (proto.ITokenID|null);

        /**
         * Creates a new FixedFee instance using the specified properties.
         * @param [properties] Properties to set
         * @returns FixedFee instance
         */
        public static create(properties?: proto.IFixedFee): proto.FixedFee;

        /**
         * Encodes the specified FixedFee message. Does not implicitly {@link proto.FixedFee.verify|verify} messages.
         * @param m FixedFee message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IFixedFee, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a FixedFee message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns FixedFee
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.FixedFee;
    }

    /** Properties of a RoyaltyFee. */
    interface IRoyaltyFee {

        /** The fraction of fungible value exchanged for an NFT to collect as royalty */
        exchangeValueFraction?: (proto.IFraction|null);

        /**
         * If present, the fixed fee to assess to the NFT receiver when no fungible value is exchanged
         * with the sender
         */
        fallbackFee?: (proto.IFixedFee|null);
    }

    /**
     * A fee to assess during a CryptoTransfer that changes ownership of an NFT. Defines the fraction of
     * the fungible value exchanged for an NFT that the ledger should collect as a royalty. ("Fungible
     * value" includes both ℏ and units of fungible HTS tokens.) When the NFT sender does not receive
     * any fungible value, the ledger will assess the fallback fee, if present, to the new NFT owner.
     * Royalty fees can only be added to tokens of type type NON_FUNGIBLE_UNIQUE.
     */
    class RoyaltyFee implements IRoyaltyFee {

        /**
         * Constructs a new RoyaltyFee.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IRoyaltyFee);

        /** The fraction of fungible value exchanged for an NFT to collect as royalty */
        public exchangeValueFraction?: (proto.IFraction|null);

        /**
         * If present, the fixed fee to assess to the NFT receiver when no fungible value is exchanged
         * with the sender
         */
        public fallbackFee?: (proto.IFixedFee|null);

        /**
         * Creates a new RoyaltyFee instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RoyaltyFee instance
         */
        public static create(properties?: proto.IRoyaltyFee): proto.RoyaltyFee;

        /**
         * Encodes the specified RoyaltyFee message. Does not implicitly {@link proto.RoyaltyFee.verify|verify} messages.
         * @param m RoyaltyFee message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IRoyaltyFee, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RoyaltyFee message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns RoyaltyFee
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.RoyaltyFee;
    }

    /** Properties of a CustomFee. */
    interface ICustomFee {

        /** Fixed fee to be charged */
        fixedFee?: (proto.IFixedFee|null);

        /** Fractional fee to be charged */
        fractionalFee?: (proto.IFractionalFee|null);

        /** Royalty fee to be charged */
        royaltyFee?: (proto.IRoyaltyFee|null);

        /** The account to receive the custom fee */
        feeCollectorAccountId?: (proto.IAccountID|null);
    }

    /**
     * A transfer fee to assess during a CryptoTransfer that transfers units of the token to which the
     * fee is attached. A custom fee may be either fixed or fractional, and must specify a fee collector
     * account to receive the assessed fees. Only positive fees may be assessed.
     */
    class CustomFee implements ICustomFee {

        /**
         * Constructs a new CustomFee.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ICustomFee);

        /** Fixed fee to be charged */
        public fixedFee?: (proto.IFixedFee|null);

        /** Fractional fee to be charged */
        public fractionalFee?: (proto.IFractionalFee|null);

        /** Royalty fee to be charged */
        public royaltyFee?: (proto.IRoyaltyFee|null);

        /** The account to receive the custom fee */
        public feeCollectorAccountId?: (proto.IAccountID|null);

        /** CustomFee fee. */
        public fee?: ("fixedFee"|"fractionalFee"|"royaltyFee");

        /**
         * Creates a new CustomFee instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CustomFee instance
         */
        public static create(properties?: proto.ICustomFee): proto.CustomFee;

        /**
         * Encodes the specified CustomFee message. Does not implicitly {@link proto.CustomFee.verify|verify} messages.
         * @param m CustomFee message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ICustomFee, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CustomFee message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns CustomFee
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.CustomFee;
    }

    /** Properties of an AssessedCustomFee. */
    interface IAssessedCustomFee {

        /** The number of units assessed for the fee */
        amount?: (Long|null);

        /** The denomination of the fee; taken as hbar if left unset */
        tokenId?: (proto.ITokenID|null);

        /** The account to receive the assessed fee */
        feeCollectorAccountId?: (proto.IAccountID|null);

        /** The account(s) whose final balances would have been higher in the absence of this assessed fee */
        effectivePayerAccountId?: (proto.IAccountID[]|null);
    }

    /** A custom transfer fee that was assessed during handling of a CryptoTransfer. */
    class AssessedCustomFee implements IAssessedCustomFee {

        /**
         * Constructs a new AssessedCustomFee.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IAssessedCustomFee);

        /** The number of units assessed for the fee */
        public amount: Long;

        /** The denomination of the fee; taken as hbar if left unset */
        public tokenId?: (proto.ITokenID|null);

        /** The account to receive the assessed fee */
        public feeCollectorAccountId?: (proto.IAccountID|null);

        /** The account(s) whose final balances would have been higher in the absence of this assessed fee */
        public effectivePayerAccountId: proto.IAccountID[];

        /**
         * Creates a new AssessedCustomFee instance using the specified properties.
         * @param [properties] Properties to set
         * @returns AssessedCustomFee instance
         */
        public static create(properties?: proto.IAssessedCustomFee): proto.AssessedCustomFee;

        /**
         * Encodes the specified AssessedCustomFee message. Does not implicitly {@link proto.AssessedCustomFee.verify|verify} messages.
         * @param m AssessedCustomFee message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IAssessedCustomFee, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an AssessedCustomFee message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns AssessedCustomFee
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.AssessedCustomFee;
    }

    /** Properties of a TokenFreezeAccountTransactionBody. */
    interface ITokenFreezeAccountTransactionBody {

        /**
         * The token for which this account will be frozen. If token does not exist, transaction results
         * in INVALID_TOKEN_ID
         */
        token?: (proto.ITokenID|null);

        /** The account to be frozen */
        account?: (proto.IAccountID|null);
    }

    /**
     * Freezes transfers of the specified token for the account. Must be signed by the Token's freezeKey.
     * If the provided account is not found, the transaction will resolve to INVALID_ACCOUNT_ID.
     * If the provided account has been deleted, the transaction will resolve to ACCOUNT_DELETED.
     * If the provided token is not found, the transaction will resolve to INVALID_TOKEN_ID.
     * If the provided token has been deleted, the transaction will resolve to TOKEN_WAS_DELETED.
     * If an Association between the provided token and account is not found, the transaction will
     * resolve to TOKEN_NOT_ASSOCIATED_TO_ACCOUNT.
     * If no Freeze Key is defined, the transaction will resolve to TOKEN_HAS_NO_FREEZE_KEY.
     * Once executed the Account is marked as Frozen and will not be able to receive or send tokens
     * unless unfrozen. The operation is idempotent.
     */
    class TokenFreezeAccountTransactionBody implements ITokenFreezeAccountTransactionBody {

        /**
         * Constructs a new TokenFreezeAccountTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITokenFreezeAccountTransactionBody);

        /**
         * The token for which this account will be frozen. If token does not exist, transaction results
         * in INVALID_TOKEN_ID
         */
        public token?: (proto.ITokenID|null);

        /** The account to be frozen */
        public account?: (proto.IAccountID|null);

        /**
         * Creates a new TokenFreezeAccountTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TokenFreezeAccountTransactionBody instance
         */
        public static create(properties?: proto.ITokenFreezeAccountTransactionBody): proto.TokenFreezeAccountTransactionBody;

        /**
         * Encodes the specified TokenFreezeAccountTransactionBody message. Does not implicitly {@link proto.TokenFreezeAccountTransactionBody.verify|verify} messages.
         * @param m TokenFreezeAccountTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITokenFreezeAccountTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TokenFreezeAccountTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TokenFreezeAccountTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TokenFreezeAccountTransactionBody;
    }

    /** Properties of a TokenUnfreezeAccountTransactionBody. */
    interface ITokenUnfreezeAccountTransactionBody {

        /**
         * The token for which this account will be unfrozen. If token does not exist, transaction
         * results in INVALID_TOKEN_ID
         */
        token?: (proto.ITokenID|null);

        /** The account to be unfrozen */
        account?: (proto.IAccountID|null);
    }

    /**
     * Unfreezes transfers of the specified token for the account. Must be signed by the Token's
     * freezeKey.
     * If the provided account is not found, the transaction will resolve to INVALID_ACCOUNT_ID.
     * If the provided account has been deleted, the transaction will resolve to ACCOUNT_DELETED.
     * If the provided token is not found, the transaction will resolve to INVALID_TOKEN_ID.
     * If the provided token has been deleted, the transaction will resolve to TOKEN_WAS_DELETED.
     * If an Association between the provided token and account is not found, the transaction will
     * resolve to TOKEN_NOT_ASSOCIATED_TO_ACCOUNT.
     * If no Freeze Key is defined, the transaction will resolve to TOKEN_HAS_NO_FREEZE_KEY.
     * Once executed the Account is marked as Unfrozen and will be able to receive or send tokens. The
     * operation is idempotent.
     */
    class TokenUnfreezeAccountTransactionBody implements ITokenUnfreezeAccountTransactionBody {

        /**
         * Constructs a new TokenUnfreezeAccountTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITokenUnfreezeAccountTransactionBody);

        /**
         * The token for which this account will be unfrozen. If token does not exist, transaction
         * results in INVALID_TOKEN_ID
         */
        public token?: (proto.ITokenID|null);

        /** The account to be unfrozen */
        public account?: (proto.IAccountID|null);

        /**
         * Creates a new TokenUnfreezeAccountTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TokenUnfreezeAccountTransactionBody instance
         */
        public static create(properties?: proto.ITokenUnfreezeAccountTransactionBody): proto.TokenUnfreezeAccountTransactionBody;

        /**
         * Encodes the specified TokenUnfreezeAccountTransactionBody message. Does not implicitly {@link proto.TokenUnfreezeAccountTransactionBody.verify|verify} messages.
         * @param m TokenUnfreezeAccountTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITokenUnfreezeAccountTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TokenUnfreezeAccountTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TokenUnfreezeAccountTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TokenUnfreezeAccountTransactionBody;
    }

    /** Properties of a TokenGrantKycTransactionBody. */
    interface ITokenGrantKycTransactionBody {

        /**
         * The token for which this account will be granted KYC. If token does not exist, transaction
         * results in INVALID_TOKEN_ID
         */
        token?: (proto.ITokenID|null);

        /** The account to be KYCed */
        account?: (proto.IAccountID|null);
    }

    /**
     * Grants KYC to the account for the given token. Must be signed by the Token's kycKey.
     * If the provided account is not found, the transaction will resolve to INVALID_ACCOUNT_ID.
     * If the provided account has been deleted, the transaction will resolve to ACCOUNT_DELETED.
     * If the provided token is not found, the transaction will resolve to INVALID_TOKEN_ID.
     * If the provided token has been deleted, the transaction will resolve to TOKEN_WAS_DELETED.
     * If an Association between the provided token and account is not found, the transaction will
     * resolve to TOKEN_NOT_ASSOCIATED_TO_ACCOUNT.
     * If no KYC Key is defined, the transaction will resolve to TOKEN_HAS_NO_KYC_KEY.
     * Once executed the Account is marked as KYC Granted.
     */
    class TokenGrantKycTransactionBody implements ITokenGrantKycTransactionBody {

        /**
         * Constructs a new TokenGrantKycTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITokenGrantKycTransactionBody);

        /**
         * The token for which this account will be granted KYC. If token does not exist, transaction
         * results in INVALID_TOKEN_ID
         */
        public token?: (proto.ITokenID|null);

        /** The account to be KYCed */
        public account?: (proto.IAccountID|null);

        /**
         * Creates a new TokenGrantKycTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TokenGrantKycTransactionBody instance
         */
        public static create(properties?: proto.ITokenGrantKycTransactionBody): proto.TokenGrantKycTransactionBody;

        /**
         * Encodes the specified TokenGrantKycTransactionBody message. Does not implicitly {@link proto.TokenGrantKycTransactionBody.verify|verify} messages.
         * @param m TokenGrantKycTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITokenGrantKycTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TokenGrantKycTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TokenGrantKycTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TokenGrantKycTransactionBody;
    }

    /** Properties of a TokenRevokeKycTransactionBody. */
    interface ITokenRevokeKycTransactionBody {

        /**
         * The token for which this account will get his KYC revoked. If token does not exist,
         * transaction results in INVALID_TOKEN_ID
         */
        token?: (proto.ITokenID|null);

        /** The account to be KYC Revoked */
        account?: (proto.IAccountID|null);
    }

    /**
     * Revokes KYC to the account for the given token. Must be signed by the Token's kycKey.
     * If the provided account is not found, the transaction will resolve to INVALID_ACCOUNT_ID.
     * If the provided account has been deleted, the transaction will resolve to ACCOUNT_DELETED.
     * If the provided token is not found, the transaction will resolve to INVALID_TOKEN_ID.
     * If the provided token has been deleted, the transaction will resolve to TOKEN_WAS_DELETED.
     * If an Association between the provided token and account is not found, the transaction will
     * resolve to TOKEN_NOT_ASSOCIATED_TO_ACCOUNT.
     * If no KYC Key is defined, the transaction will resolve to TOKEN_HAS_NO_KYC_KEY.
     * Once executed the Account is marked as KYC Revoked
     */
    class TokenRevokeKycTransactionBody implements ITokenRevokeKycTransactionBody {

        /**
         * Constructs a new TokenRevokeKycTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITokenRevokeKycTransactionBody);

        /**
         * The token for which this account will get his KYC revoked. If token does not exist,
         * transaction results in INVALID_TOKEN_ID
         */
        public token?: (proto.ITokenID|null);

        /** The account to be KYC Revoked */
        public account?: (proto.IAccountID|null);

        /**
         * Creates a new TokenRevokeKycTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TokenRevokeKycTransactionBody instance
         */
        public static create(properties?: proto.ITokenRevokeKycTransactionBody): proto.TokenRevokeKycTransactionBody;

        /**
         * Encodes the specified TokenRevokeKycTransactionBody message. Does not implicitly {@link proto.TokenRevokeKycTransactionBody.verify|verify} messages.
         * @param m TokenRevokeKycTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITokenRevokeKycTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TokenRevokeKycTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TokenRevokeKycTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TokenRevokeKycTransactionBody;
    }

    /** Properties of a TokenDeleteTransactionBody. */
    interface ITokenDeleteTransactionBody {

        /**
         * The token to be deleted. If invalid token is specified, transaction will
         * result in INVALID_TOKEN_ID
         */
        token?: (proto.ITokenID|null);
    }

    /**
     * Marks a token as deleted, though it will remain in the ledger.
     * The operation must be signed by the specified Admin Key of the Token. If
     * admin key is not set, Transaction will result in TOKEN_IS_IMMUTABlE.
     * Once deleted update, mint, burn, wipe, freeze, unfreeze, grant kyc, revoke
     * kyc and token transfer transactions will resolve to TOKEN_WAS_DELETED.
     */
    class TokenDeleteTransactionBody implements ITokenDeleteTransactionBody {

        /**
         * Constructs a new TokenDeleteTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITokenDeleteTransactionBody);

        /**
         * The token to be deleted. If invalid token is specified, transaction will
         * result in INVALID_TOKEN_ID
         */
        public token?: (proto.ITokenID|null);

        /**
         * Creates a new TokenDeleteTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TokenDeleteTransactionBody instance
         */
        public static create(properties?: proto.ITokenDeleteTransactionBody): proto.TokenDeleteTransactionBody;

        /**
         * Encodes the specified TokenDeleteTransactionBody message. Does not implicitly {@link proto.TokenDeleteTransactionBody.verify|verify} messages.
         * @param m TokenDeleteTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITokenDeleteTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TokenDeleteTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TokenDeleteTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TokenDeleteTransactionBody;
    }

    /** Properties of a TokenUpdateTransactionBody. */
    interface ITokenUpdateTransactionBody {

        /** The Token to be updated */
        token?: (proto.ITokenID|null);

        /**
         * The new publicly visible Token symbol, limited to a UTF-8 encoding of length
         * <tt>tokens.maxTokenNameUtf8Bytes</tt>.
         */
        symbol?: (string|null);

        /**
         * The new publicly visible name of the Token, limited to a UTF-8 encoding of length
         * <tt>tokens.maxSymbolUtf8Bytes</tt>.
         */
        name?: (string|null);

        /**
         * The new Treasury account of the Token. If the provided treasury account is not existing or
         * deleted, the response will be INVALID_TREASURY_ACCOUNT_FOR_TOKEN. If successful, the Token
         * balance held in the previous Treasury Account is transferred to the new one.
         */
        treasury?: (proto.IAccountID|null);

        /**
         * The new admin key of the Token. If Token is immutable, transaction will resolve to
         * TOKEN_IS_IMMUTABlE.
         */
        adminKey?: (proto.IKey|null);

        /**
         * The new KYC key of the Token. If Token does not have currently a KYC key, transaction will
         * resolve to TOKEN_HAS_NO_KYC_KEY.
         */
        kycKey?: (proto.IKey|null);

        /**
         * The new Freeze key of the Token. If the Token does not have currently a Freeze key,
         * transaction will resolve to TOKEN_HAS_NO_FREEZE_KEY.
         */
        freezeKey?: (proto.IKey|null);

        /**
         * The new Wipe key of the Token. If the Token does not have currently a Wipe key, transaction
         * will resolve to TOKEN_HAS_NO_WIPE_KEY.
         */
        wipeKey?: (proto.IKey|null);

        /**
         * The new Supply key of the Token. If the Token does not have currently a Supply key,
         * transaction will resolve to TOKEN_HAS_NO_SUPPLY_KEY.
         */
        supplyKey?: (proto.IKey|null);

        /**
         * The new account which will be automatically charged to renew the token's expiration, at
         * autoRenewPeriod interval.
         */
        autoRenewAccount?: (proto.IAccountID|null);

        /**
         * The new interval at which the auto-renew account will be charged to extend the token's
         * expiry.
         */
        autoRenewPeriod?: (proto.IDuration|null);

        /**
         * The new expiry time of the token. Expiry can be updated even if admin key is not set. If the
         * provided expiry is earlier than the current token expiry, transaction wil resolve to
         * INVALID_EXPIRATION_TIME
         */
        expiry?: (proto.ITimestamp|null);

        /** If set, the new memo to be associated with the token (UTF-8 encoding max 100 bytes) */
        memo?: (google.protobuf.IStringValue|null);

        /**
         * If set, the new key to use to update the token's custom fee schedule; if the token does not
         * currently have this key, transaction will resolve to TOKEN_HAS_NO_FEE_SCHEDULE_KEY
         */
        feeScheduleKey?: (proto.IKey|null);

        /**
         * The Key which can pause and unpause the Token. If the Token does not currently have a pause key,
         * transaction will resolve to TOKEN_HAS_NO_PAUSE_KEY
         */
        pauseKey?: (proto.IKey|null);
    }

    /**
     * At consensus, updates an already created token to the given values.
     *
     * If no value is given for a field, that field is left unchanged. For an immutable tokens (that is,
     * a token without an admin key), only the expiry may be updated. Setting any other field in that
     * case will cause the transaction status to resolve to TOKEN_IS_IMMUTABLE.
     *
     * --- Signing Requirements ---
     * 1. Whether or not a token has an admin key, its expiry can be extended with only the transaction
     * payer's signature.
     * 2. Updating any other field of a mutable token requires the admin key's signature.
     * 3. If a new admin key is set, this new key must sign <b>unless</b> it is exactly an empty
     * <tt>KeyList</tt>. This special sentinel key removes the existing admin key and causes the
     * token to become immutable. (Other <tt>Key</tt> structures without a constituent
     * <tt>Ed25519</tt> key will be rejected with <tt>INVALID_ADMIN_KEY</tt>.)
     * 4. If a new treasury is set, the new treasury account's key must sign the transaction.
     *
     * --- Nft Requirements ---
     * 1. If a non fungible token has a positive treasury balance, the operation will abort with
     * CURRENT_TREASURY_STILL_OWNS_NFTS.
     */
    class TokenUpdateTransactionBody implements ITokenUpdateTransactionBody {

        /**
         * Constructs a new TokenUpdateTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITokenUpdateTransactionBody);

        /** The Token to be updated */
        public token?: (proto.ITokenID|null);

        /**
         * The new publicly visible Token symbol, limited to a UTF-8 encoding of length
         * <tt>tokens.maxTokenNameUtf8Bytes</tt>.
         */
        public symbol: string;

        /**
         * The new publicly visible name of the Token, limited to a UTF-8 encoding of length
         * <tt>tokens.maxSymbolUtf8Bytes</tt>.
         */
        public name: string;

        /**
         * The new Treasury account of the Token. If the provided treasury account is not existing or
         * deleted, the response will be INVALID_TREASURY_ACCOUNT_FOR_TOKEN. If successful, the Token
         * balance held in the previous Treasury Account is transferred to the new one.
         */
        public treasury?: (proto.IAccountID|null);

        /**
         * The new admin key of the Token. If Token is immutable, transaction will resolve to
         * TOKEN_IS_IMMUTABlE.
         */
        public adminKey?: (proto.IKey|null);

        /**
         * The new KYC key of the Token. If Token does not have currently a KYC key, transaction will
         * resolve to TOKEN_HAS_NO_KYC_KEY.
         */
        public kycKey?: (proto.IKey|null);

        /**
         * The new Freeze key of the Token. If the Token does not have currently a Freeze key,
         * transaction will resolve to TOKEN_HAS_NO_FREEZE_KEY.
         */
        public freezeKey?: (proto.IKey|null);

        /**
         * The new Wipe key of the Token. If the Token does not have currently a Wipe key, transaction
         * will resolve to TOKEN_HAS_NO_WIPE_KEY.
         */
        public wipeKey?: (proto.IKey|null);

        /**
         * The new Supply key of the Token. If the Token does not have currently a Supply key,
         * transaction will resolve to TOKEN_HAS_NO_SUPPLY_KEY.
         */
        public supplyKey?: (proto.IKey|null);

        /**
         * The new account which will be automatically charged to renew the token's expiration, at
         * autoRenewPeriod interval.
         */
        public autoRenewAccount?: (proto.IAccountID|null);

        /**
         * The new interval at which the auto-renew account will be charged to extend the token's
         * expiry.
         */
        public autoRenewPeriod?: (proto.IDuration|null);

        /**
         * The new expiry time of the token. Expiry can be updated even if admin key is not set. If the
         * provided expiry is earlier than the current token expiry, transaction wil resolve to
         * INVALID_EXPIRATION_TIME
         */
        public expiry?: (proto.ITimestamp|null);

        /** If set, the new memo to be associated with the token (UTF-8 encoding max 100 bytes) */
        public memo?: (google.protobuf.IStringValue|null);

        /**
         * If set, the new key to use to update the token's custom fee schedule; if the token does not
         * currently have this key, transaction will resolve to TOKEN_HAS_NO_FEE_SCHEDULE_KEY
         */
        public feeScheduleKey?: (proto.IKey|null);

        /**
         * The Key which can pause and unpause the Token. If the Token does not currently have a pause key,
         * transaction will resolve to TOKEN_HAS_NO_PAUSE_KEY
         */
        public pauseKey?: (proto.IKey|null);

        /**
         * Creates a new TokenUpdateTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TokenUpdateTransactionBody instance
         */
        public static create(properties?: proto.ITokenUpdateTransactionBody): proto.TokenUpdateTransactionBody;

        /**
         * Encodes the specified TokenUpdateTransactionBody message. Does not implicitly {@link proto.TokenUpdateTransactionBody.verify|verify} messages.
         * @param m TokenUpdateTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITokenUpdateTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TokenUpdateTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TokenUpdateTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TokenUpdateTransactionBody;
    }

    /** Properties of a TokenMintTransactionBody. */
    interface ITokenMintTransactionBody {

        /**
         * The token for which to mint tokens. If token does not exist, transaction results in
         * INVALID_TOKEN_ID
         */
        token?: (proto.ITokenID|null);

        /**
         * Applicable to tokens of type FUNGIBLE_COMMON. The amount to mint to the Treasury Account.
         * Amount must be a positive non-zero number represented in the lowest denomination of the
         * token. The new supply must be lower than 2^63.
         */
        amount?: (Long|null);

        /**
         * Applicable to tokens of type NON_FUNGIBLE_UNIQUE. A list of metadata that are being created.
         * Maximum allowed size of each metadata is 100 bytes
         */
        metadata?: (Uint8Array[]|null);
    }

    /**
     * Mints tokens to the Token's treasury Account. If no Supply Key is defined, the transaction will
     * resolve to TOKEN_HAS_NO_SUPPLY_KEY.
     * The operation increases the Total Supply of the Token. The maximum total supply a token can have
     * is 2^63-1.
     * The amount provided must be in the lowest denomination possible. Example:
     * Token A has 2 decimals. In order to mint 100 tokens, one must provide amount of 10000. In order
     * to mint 100.55 tokens, one must provide amount of 10055.
     * If both amount and metadata list get filled, a INVALID_TRANSACTION_BODY response code will be
     * returned.
     * If the metadata list contains metadata which is too large, a METADATA_TOO_LONG response code will
     * be returned.
     * If neither the amount nor the metadata list get filled, a INVALID_TOKEN_MINT_AMOUNT response code
     * will be returned.
     * If the metadata list count is greater than the batch size limit global dynamic property, a
     * BATCH_SIZE_LIMIT_EXCEEDED response code will be returned.
     */
    class TokenMintTransactionBody implements ITokenMintTransactionBody {

        /**
         * Constructs a new TokenMintTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITokenMintTransactionBody);

        /**
         * The token for which to mint tokens. If token does not exist, transaction results in
         * INVALID_TOKEN_ID
         */
        public token?: (proto.ITokenID|null);

        /**
         * Applicable to tokens of type FUNGIBLE_COMMON. The amount to mint to the Treasury Account.
         * Amount must be a positive non-zero number represented in the lowest denomination of the
         * token. The new supply must be lower than 2^63.
         */
        public amount: Long;

        /**
         * Applicable to tokens of type NON_FUNGIBLE_UNIQUE. A list of metadata that are being created.
         * Maximum allowed size of each metadata is 100 bytes
         */
        public metadata: Uint8Array[];

        /**
         * Creates a new TokenMintTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TokenMintTransactionBody instance
         */
        public static create(properties?: proto.ITokenMintTransactionBody): proto.TokenMintTransactionBody;

        /**
         * Encodes the specified TokenMintTransactionBody message. Does not implicitly {@link proto.TokenMintTransactionBody.verify|verify} messages.
         * @param m TokenMintTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITokenMintTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TokenMintTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TokenMintTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TokenMintTransactionBody;
    }

    /** Properties of a TokenBurnTransactionBody. */
    interface ITokenBurnTransactionBody {

        /**
         * The token for which to burn tokens. If token does not exist, transaction results in
         * INVALID_TOKEN_ID
         */
        token?: (proto.ITokenID|null);

        /**
         * Applicable to tokens of type FUNGIBLE_COMMON. The amount to burn from the Treasury Account.
         * Amount must be a positive non-zero number, not bigger than the token balance of the treasury
         * account (0; balance], represented in the lowest denomination.
         */
        amount?: (Long|null);

        /** Applicable to tokens of type NON_FUNGIBLE_UNIQUE. The list of serial numbers to be burned. */
        serialNumbers?: (Long[]|null);
    }

    /**
     * Burns tokens from the Token's treasury Account. If no Supply Key is defined, the transaction will
     * resolve to TOKEN_HAS_NO_SUPPLY_KEY.
     * The operation decreases the Total Supply of the Token. Total supply cannot go below zero.
     * The amount provided must be in the lowest denomination possible. Example:
     * Token A has 2 decimals. In order to burn 100 tokens, one must provide amount of 10000. In order
     * to burn 100.55 tokens, one must provide amount of 10055.
     * For non fungible tokens the transaction body accepts serialNumbers list of integers as a parameter.
     *
     * If neither the amount nor the serialNumbers get filled, a INVALID_TOKEN_BURN_AMOUNT response code
     * will be returned.
     * If both amount and serialNumbers get filled, a INVALID_TRANSACTION_BODY response code will be
     * returned.
     * If the serialNumbers' list count is greater than the batch size limit global dynamic property, a
     * BATCH_SIZE_LIMIT_EXCEEDED response code will be returned.
     * If the serialNumbers list contains a non-positive integer as a serial number, a INVALID_NFT_ID
     * response code will be returned.
     */
    class TokenBurnTransactionBody implements ITokenBurnTransactionBody {

        /**
         * Constructs a new TokenBurnTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITokenBurnTransactionBody);

        /**
         * The token for which to burn tokens. If token does not exist, transaction results in
         * INVALID_TOKEN_ID
         */
        public token?: (proto.ITokenID|null);

        /**
         * Applicable to tokens of type FUNGIBLE_COMMON. The amount to burn from the Treasury Account.
         * Amount must be a positive non-zero number, not bigger than the token balance of the treasury
         * account (0; balance], represented in the lowest denomination.
         */
        public amount: Long;

        /** Applicable to tokens of type NON_FUNGIBLE_UNIQUE. The list of serial numbers to be burned. */
        public serialNumbers: Long[];

        /**
         * Creates a new TokenBurnTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TokenBurnTransactionBody instance
         */
        public static create(properties?: proto.ITokenBurnTransactionBody): proto.TokenBurnTransactionBody;

        /**
         * Encodes the specified TokenBurnTransactionBody message. Does not implicitly {@link proto.TokenBurnTransactionBody.verify|verify} messages.
         * @param m TokenBurnTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITokenBurnTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TokenBurnTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TokenBurnTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TokenBurnTransactionBody;
    }

    /** Properties of a TokenWipeAccountTransactionBody. */
    interface ITokenWipeAccountTransactionBody {

        /**
         * The token for which the account will be wiped. If token does not exist, transaction results
         * in INVALID_TOKEN_ID
         */
        token?: (proto.ITokenID|null);

        /** The account to be wiped */
        account?: (proto.IAccountID|null);

        /**
         * Applicable to tokens of type FUNGIBLE_COMMON. The amount of tokens to wipe from the specified
         * account. Amount must be a positive non-zero number in the lowest denomination possible, not
         * bigger than the token balance of the account (0; balance]
         */
        amount?: (Long|null);

        /** Applicable to tokens of type NON_FUNGIBLE_UNIQUE. The list of serial numbers to be wiped. */
        serialNumbers?: (Long[]|null);
    }

    /**
     * Wipes the provided amount of tokens from the specified Account. Must be signed by the Token's
     * Wipe key.
     * If the provided account is not found, the transaction will resolve to INVALID_ACCOUNT_ID.
     * If the provided account has been deleted, the transaction will resolve to ACCOUNT_DELETED.
     * If the provided token is not found, the transaction will resolve to INVALID_TOKEN_ID.
     * If the provided token has been deleted, the transaction will resolve to TOKEN_WAS_DELETED.
     * If an Association between the provided token and account is not found, the transaction will
     * resolve to TOKEN_NOT_ASSOCIATED_TO_ACCOUNT.
     * If Wipe Key is not present in the Token, transaction results in TOKEN_HAS_NO_WIPE_KEY.
     * If the provided account is the Token's Treasury Account, transaction results in
     * CANNOT_WIPE_TOKEN_TREASURY_ACCOUNT
     * On success, tokens are removed from the account and the total supply of the token is decreased by
     * the wiped amount.
     *
     * If both amount and serialNumbers get filled, a INVALID_TRANSACTION_BODY response code will be
     * returned.
     * If neither the amount nor the serialNumbers get filled, a INVALID_WIPING_AMOUNT response code
     * will be returned.
     * If the serialNumbers list contains a non-positive integer as a serial number, a INVALID_NFT_ID
     * response code will be returned.
     * If the serialNumbers' list count is greater than the batch size limit global dynamic property, a
     * BATCH_SIZE_LIMIT_EXCEEDED response code will be returned.
     *
     * The amount provided is in the lowest denomination possible. Example:
     * Token A has 2 decimals. In order to wipe 100 tokens from account, one must provide amount of
     * 10000. In order to wipe 100.55 tokens, one must provide amount of 10055.
     */
    class TokenWipeAccountTransactionBody implements ITokenWipeAccountTransactionBody {

        /**
         * Constructs a new TokenWipeAccountTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITokenWipeAccountTransactionBody);

        /**
         * The token for which the account will be wiped. If token does not exist, transaction results
         * in INVALID_TOKEN_ID
         */
        public token?: (proto.ITokenID|null);

        /** The account to be wiped */
        public account?: (proto.IAccountID|null);

        /**
         * Applicable to tokens of type FUNGIBLE_COMMON. The amount of tokens to wipe from the specified
         * account. Amount must be a positive non-zero number in the lowest denomination possible, not
         * bigger than the token balance of the account (0; balance]
         */
        public amount: Long;

        /** Applicable to tokens of type NON_FUNGIBLE_UNIQUE. The list of serial numbers to be wiped. */
        public serialNumbers: Long[];

        /**
         * Creates a new TokenWipeAccountTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TokenWipeAccountTransactionBody instance
         */
        public static create(properties?: proto.ITokenWipeAccountTransactionBody): proto.TokenWipeAccountTransactionBody;

        /**
         * Encodes the specified TokenWipeAccountTransactionBody message. Does not implicitly {@link proto.TokenWipeAccountTransactionBody.verify|verify} messages.
         * @param m TokenWipeAccountTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITokenWipeAccountTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TokenWipeAccountTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TokenWipeAccountTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TokenWipeAccountTransactionBody;
    }

    /** Properties of a TokenAssociateTransactionBody. */
    interface ITokenAssociateTransactionBody {

        /** The account to be associated with the provided tokens */
        account?: (proto.IAccountID|null);

        /**
         * The tokens to be associated with the provided account. In the case of NON_FUNGIBLE_UNIQUE
         * Type, once an account is associated, it can hold any number of NFTs (serial numbers) of that
         * token type
         */
        tokens?: (proto.ITokenID[]|null);
    }

    /**
     * Associates the provided account with the provided tokens. Must be signed by the provided
     * Account's key.
     * If the provided account is not found, the transaction will resolve to INVALID_ACCOUNT_ID.
     * If the provided account has been deleted, the transaction will resolve to ACCOUNT_DELETED.
     * If any of the provided tokens is not found, the transaction will resolve to INVALID_TOKEN_REF.
     * If any of the provided tokens has been deleted, the transaction will resolve to TOKEN_WAS_DELETED.
     * If an association between the provided account and any of the tokens already exists, the
     * transaction will resolve to TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT.
     * If the provided account's associations count exceed the constraint of maximum token associations
     * per account, the transaction will resolve to TOKENS_PER_ACCOUNT_LIMIT_EXCEEDED.
     * On success, associations between the provided account and tokens are made and the account is
     * ready to interact with the tokens.
     */
    class TokenAssociateTransactionBody implements ITokenAssociateTransactionBody {

        /**
         * Constructs a new TokenAssociateTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITokenAssociateTransactionBody);

        /** The account to be associated with the provided tokens */
        public account?: (proto.IAccountID|null);

        /**
         * The tokens to be associated with the provided account. In the case of NON_FUNGIBLE_UNIQUE
         * Type, once an account is associated, it can hold any number of NFTs (serial numbers) of that
         * token type
         */
        public tokens: proto.ITokenID[];

        /**
         * Creates a new TokenAssociateTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TokenAssociateTransactionBody instance
         */
        public static create(properties?: proto.ITokenAssociateTransactionBody): proto.TokenAssociateTransactionBody;

        /**
         * Encodes the specified TokenAssociateTransactionBody message. Does not implicitly {@link proto.TokenAssociateTransactionBody.verify|verify} messages.
         * @param m TokenAssociateTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITokenAssociateTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TokenAssociateTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TokenAssociateTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TokenAssociateTransactionBody;
    }

    /** Properties of a TokenDissociateTransactionBody. */
    interface ITokenDissociateTransactionBody {

        /** The account to be dissociated with the provided tokens */
        account?: (proto.IAccountID|null);

        /** The tokens to be dissociated with the provided account */
        tokens?: (proto.ITokenID[]|null);
    }

    /**
     * Dissociates the provided account with the provided tokens. Must be signed by the provided
     * Account's key.
     * If the provided account is not found, the transaction will resolve to INVALID_ACCOUNT_ID.
     * If the provided account has been deleted, the transaction will resolve to ACCOUNT_DELETED.
     * If any of the provided tokens is not found, the transaction will resolve to INVALID_TOKEN_REF.
     * If any of the provided tokens has been deleted, the transaction will resolve to TOKEN_WAS_DELETED.
     * If an association between the provided account and any of the tokens does not exist, the
     * transaction will resolve to TOKEN_NOT_ASSOCIATED_TO_ACCOUNT.
     * If a token has not been deleted and has not expired, and the user has a nonzero balance, the
     * transaction will resolve to TRANSACTION_REQUIRES_ZERO_TOKEN_BALANCES.
     * If a <b>fungible token</b> has expired, the user can disassociate even if their token balance is
     * not zero.
     * If a <b>non fungible token</b> has expired, the user can <b>not</b> disassociate if their token
     * balance is not zero. The transaction will resolve to TRANSACTION_REQUIRED_ZERO_TOKEN_BALANCES.
     * On success, associations between the provided account and tokens are removed.
     */
    class TokenDissociateTransactionBody implements ITokenDissociateTransactionBody {

        /**
         * Constructs a new TokenDissociateTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITokenDissociateTransactionBody);

        /** The account to be dissociated with the provided tokens */
        public account?: (proto.IAccountID|null);

        /** The tokens to be dissociated with the provided account */
        public tokens: proto.ITokenID[];

        /**
         * Creates a new TokenDissociateTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TokenDissociateTransactionBody instance
         */
        public static create(properties?: proto.ITokenDissociateTransactionBody): proto.TokenDissociateTransactionBody;

        /**
         * Encodes the specified TokenDissociateTransactionBody message. Does not implicitly {@link proto.TokenDissociateTransactionBody.verify|verify} messages.
         * @param m TokenDissociateTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITokenDissociateTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TokenDissociateTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TokenDissociateTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TokenDissociateTransactionBody;
    }

    /** Properties of a TokenFeeScheduleUpdateTransactionBody. */
    interface ITokenFeeScheduleUpdateTransactionBody {

        /** The token whose fee schedule is to be updated */
        tokenId?: (proto.ITokenID|null);

        /** The new custom fees to be assessed during a CryptoTransfer that transfers units of this token */
        customFees?: (proto.ICustomFee[]|null);
    }

    /**
     * At consensus, updates a token type's fee schedule to the given list of custom fees.
     *
     * If the target token type has no fee_schedule_key, resolves to TOKEN_HAS_NO_FEE_SCHEDULE_KEY.
     * Otherwise this transaction must be signed to the fee_schedule_key, or the transaction will
     * resolve to INVALID_SIGNATURE.
     *
     * If the custom_fees list is empty, clears the fee schedule or resolves to
     * CUSTOM_SCHEDULE_ALREADY_HAS_NO_FEES if the fee schedule was already empty.
     */
    class TokenFeeScheduleUpdateTransactionBody implements ITokenFeeScheduleUpdateTransactionBody {

        /**
         * Constructs a new TokenFeeScheduleUpdateTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITokenFeeScheduleUpdateTransactionBody);

        /** The token whose fee schedule is to be updated */
        public tokenId?: (proto.ITokenID|null);

        /** The new custom fees to be assessed during a CryptoTransfer that transfers units of this token */
        public customFees: proto.ICustomFee[];

        /**
         * Creates a new TokenFeeScheduleUpdateTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TokenFeeScheduleUpdateTransactionBody instance
         */
        public static create(properties?: proto.ITokenFeeScheduleUpdateTransactionBody): proto.TokenFeeScheduleUpdateTransactionBody;

        /**
         * Encodes the specified TokenFeeScheduleUpdateTransactionBody message. Does not implicitly {@link proto.TokenFeeScheduleUpdateTransactionBody.verify|verify} messages.
         * @param m TokenFeeScheduleUpdateTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITokenFeeScheduleUpdateTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TokenFeeScheduleUpdateTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TokenFeeScheduleUpdateTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TokenFeeScheduleUpdateTransactionBody;
    }

    /** Properties of a TokenPauseTransactionBody. */
    interface ITokenPauseTransactionBody {

        /** The token to be paused. */
        token?: (proto.ITokenID|null);
    }

    /**
     * Pauses the Token from being involved in any kind of Transaction until it is unpaused.
     * Must be signed with the Token's pause key.
     * If the provided token is not found, the transaction will resolve to INVALID_TOKEN_ID.
     * If the provided token has been deleted, the transaction will resolve to TOKEN_WAS_DELETED.
     * If no Pause Key is defined, the transaction will resolve to TOKEN_HAS_NO_PAUSE_KEY.
     * Once executed the Token is marked as paused and will be not able to be a part of any transaction.
     * The operation is idempotent - becomes a no-op if the Token is already Paused.
     */
    class TokenPauseTransactionBody implements ITokenPauseTransactionBody {

        /**
         * Constructs a new TokenPauseTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITokenPauseTransactionBody);

        /** The token to be paused. */
        public token?: (proto.ITokenID|null);

        /**
         * Creates a new TokenPauseTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TokenPauseTransactionBody instance
         */
        public static create(properties?: proto.ITokenPauseTransactionBody): proto.TokenPauseTransactionBody;

        /**
         * Encodes the specified TokenPauseTransactionBody message. Does not implicitly {@link proto.TokenPauseTransactionBody.verify|verify} messages.
         * @param m TokenPauseTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITokenPauseTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TokenPauseTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TokenPauseTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TokenPauseTransactionBody;
    }

    /** Properties of a TokenUnpauseTransactionBody. */
    interface ITokenUnpauseTransactionBody {

        /** The token to be unpaused. */
        token?: (proto.ITokenID|null);
    }

    /**
     * Unpauses the Token. Must be signed with the Token's pause key.
     * If the provided token is not found, the transaction will resolve to INVALID_TOKEN_ID.
     * If the provided token has been deleted, the transaction will resolve to TOKEN_WAS_DELETED.
     * If no Pause Key is defined, the transaction will resolve to TOKEN_HAS_NO_PAUSE_KEY.
     * Once executed the Token is marked as Unpaused and can be used in Transactions.
     * The operation is idempotent - becomes a no-op if the Token is already unpaused.
     */
    class TokenUnpauseTransactionBody implements ITokenUnpauseTransactionBody {

        /**
         * Constructs a new TokenUnpauseTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITokenUnpauseTransactionBody);

        /** The token to be unpaused. */
        public token?: (proto.ITokenID|null);

        /**
         * Creates a new TokenUnpauseTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TokenUnpauseTransactionBody instance
         */
        public static create(properties?: proto.ITokenUnpauseTransactionBody): proto.TokenUnpauseTransactionBody;

        /**
         * Encodes the specified TokenUnpauseTransactionBody message. Does not implicitly {@link proto.TokenUnpauseTransactionBody.verify|verify} messages.
         * @param m TokenUnpauseTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITokenUnpauseTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TokenUnpauseTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TokenUnpauseTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TokenUnpauseTransactionBody;
    }

    /** Properties of a ScheduleCreateTransactionBody. */
    interface IScheduleCreateTransactionBody {

        /** The scheduled transaction */
        scheduledTransactionBody?: (proto.ISchedulableTransactionBody|null);

        /**
         * An optional memo with a UTF-8 encoding of no more than 100 bytes which does not contain the
         * zero byte
         */
        memo?: (string|null);

        /** An optional Hedera key which can be used to sign a ScheduleDelete and remove the schedule */
        adminKey?: (proto.IKey|null);

        /**
         * An optional id of the account to be charged the service fee for the scheduled transaction at
         * the consensus time that it executes (if ever); defaults to the ScheduleCreate payer if not
         * given
         */
        payerAccountID?: (proto.IAccountID|null);
    }

    /**
     * Create a new <i>schedule entity</i> (or simply, <i>schedule</i>) in the network's action queue.
     * Upon <tt>SUCCESS</tt>, the receipt contains the `ScheduleID` of the created schedule. A schedule
     * entity includes a <tt>scheduledTransactionBody</tt> to be executed when the schedule has
     * collected enough signing Ed25519 keys to satisfy the scheduled transaction's signing
     * requirements. Upon `SUCCESS`, the receipt also includes the <tt>scheduledTransactionID</tt> to
     * use to query for the record of the scheduled transaction's execution (if it occurs).
     *
     * The expiration time of a schedule is always 30 minutes; it remains in state and can be queried
     * using <tt>GetScheduleInfo</tt> until expiration, no matter if the scheduled transaction has
     * executed or marked deleted.
     *
     * If the <tt>adminKey</tt> field is omitted, the resulting schedule is immutable. If the
     * <tt>adminKey</tt> is set, the <tt>ScheduleDelete</tt> transaction can be used to mark it as
     * deleted. The creator may also specify an optional <tt>memo</tt> whose UTF-8 encoding is at most
     * 100 bytes and does not include the zero byte is also supported.
     *
     * When a scheduled transaction whose schedule has collected enough signing keys is executed, the
     * network only charges its payer the service fee, and not the node and network fees. If the
     * optional <tt>payerAccountID</tt> is set, the network charges this account. Otherwise it charges
     * the payer of the originating <tt>ScheduleCreate</tt>.
     *
     * Two <tt>ScheduleCreate</tt> transactions are <i>identical</i> if they are equal in all their
     * fields other than <tt>payerAccountID</tt>.  (Here "equal" should be understood in the sense of
     * gRPC object equality in the network software runtime. In particular, a gRPC object with <a
     * href="https://developers.google.com/protocol-buffers/docs/proto3#unknowns">unknown fields</a> is
     * not equal to a gRPC object without unknown fields, even if they agree on all known fields.)
     *
     * A <tt>ScheduleCreate</tt> transaction that attempts to re-create an identical schedule already in
     * state will receive a receipt with status <tt>IDENTICAL_SCHEDULE_ALREADY_CREATED</tt>; the receipt
     * will include the <tt>ScheduleID</tt> of the extant schedule, which may be used in a subsequent
     * <tt>ScheduleSign</tt> transaction. (The receipt will also include the <tt>TransactionID</tt> to
     * use in querying for the receipt or record of the scheduled transaction.)
     *
     * Other notable response codes include, <tt>INVALID_ACCOUNT_ID</tt>,
     * <tt>UNSCHEDULABLE_TRANSACTION</tt>, <tt>UNRESOLVABLE_REQUIRED_SIGNERS</tt>,
     * <tt>INVALID_SIGNATURE</tt>. For more information please see the section of this documentation on
     * the <tt>ResponseCode</tt> enum.
     */
    class ScheduleCreateTransactionBody implements IScheduleCreateTransactionBody {

        /**
         * Constructs a new ScheduleCreateTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IScheduleCreateTransactionBody);

        /** The scheduled transaction */
        public scheduledTransactionBody?: (proto.ISchedulableTransactionBody|null);

        /**
         * An optional memo with a UTF-8 encoding of no more than 100 bytes which does not contain the
         * zero byte
         */
        public memo: string;

        /** An optional Hedera key which can be used to sign a ScheduleDelete and remove the schedule */
        public adminKey?: (proto.IKey|null);

        /**
         * An optional id of the account to be charged the service fee for the scheduled transaction at
         * the consensus time that it executes (if ever); defaults to the ScheduleCreate payer if not
         * given
         */
        public payerAccountID?: (proto.IAccountID|null);

        /**
         * Creates a new ScheduleCreateTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ScheduleCreateTransactionBody instance
         */
        public static create(properties?: proto.IScheduleCreateTransactionBody): proto.ScheduleCreateTransactionBody;

        /**
         * Encodes the specified ScheduleCreateTransactionBody message. Does not implicitly {@link proto.ScheduleCreateTransactionBody.verify|verify} messages.
         * @param m ScheduleCreateTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IScheduleCreateTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ScheduleCreateTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ScheduleCreateTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ScheduleCreateTransactionBody;
    }

    /** Properties of a SchedulableTransactionBody. */
    interface ISchedulableTransactionBody {

        /** The maximum transaction fee the client is willing to pay */
        transactionFee?: (Long|null);

        /**
         * A memo to include the execution record; the UTF-8 encoding may be up to 100 bytes and must not
         * include the zero byte
         */
        memo?: (string|null);

        /** Calls a function of a contract instance */
        contractCall?: (proto.IContractCallTransactionBody|null);

        /** Creates a contract instance */
        contractCreateInstance?: (proto.IContractCreateTransactionBody|null);

        /** Updates a contract */
        contractUpdateInstance?: (proto.IContractUpdateTransactionBody|null);

        /** Delete contract and transfer remaining balance into specified account */
        contractDeleteInstance?: (proto.IContractDeleteTransactionBody|null);

        /** Create a new cryptocurrency account */
        cryptoCreateAccount?: (proto.ICryptoCreateTransactionBody|null);

        /** Delete a cryptocurrency account (mark as deleted, and transfer hbars out) */
        cryptoDelete?: (proto.ICryptoDeleteTransactionBody|null);

        /** Transfer amount between accounts */
        cryptoTransfer?: (proto.ICryptoTransferTransactionBody|null);

        /** Modify information such as the expiration date for an account */
        cryptoUpdateAccount?: (proto.ICryptoUpdateTransactionBody|null);

        /** Add bytes to the end of the contents of a file */
        fileAppend?: (proto.IFileAppendTransactionBody|null);

        /** Create a new file */
        fileCreate?: (proto.IFileCreateTransactionBody|null);

        /** Delete a file (remove contents and mark as deleted until it expires) */
        fileDelete?: (proto.IFileDeleteTransactionBody|null);

        /** Modify information such as the expiration date for a file */
        fileUpdate?: (proto.IFileUpdateTransactionBody|null);

        /** Hedera administrative deletion of a file or smart contract */
        systemDelete?: (proto.ISystemDeleteTransactionBody|null);

        /** To undelete an entity deleted by SystemDelete */
        systemUndelete?: (proto.ISystemUndeleteTransactionBody|null);

        /** Freeze the nodes */
        freeze?: (proto.IFreezeTransactionBody|null);

        /** Creates a topic */
        consensusCreateTopic?: (proto.IConsensusCreateTopicTransactionBody|null);

        /** Updates a topic */
        consensusUpdateTopic?: (proto.IConsensusUpdateTopicTransactionBody|null);

        /** Deletes a topic */
        consensusDeleteTopic?: (proto.IConsensusDeleteTopicTransactionBody|null);

        /** Submits message to a topic */
        consensusSubmitMessage?: (proto.IConsensusSubmitMessageTransactionBody|null);

        /** Creates a token instance */
        tokenCreation?: (proto.ITokenCreateTransactionBody|null);

        /** Freezes account not to be able to transact with a token */
        tokenFreeze?: (proto.ITokenFreezeAccountTransactionBody|null);

        /** Unfreezes account for a token */
        tokenUnfreeze?: (proto.ITokenUnfreezeAccountTransactionBody|null);

        /** Grants KYC to an account for a token */
        tokenGrantKyc?: (proto.ITokenGrantKycTransactionBody|null);

        /** Revokes KYC of an account for a token */
        tokenRevokeKyc?: (proto.ITokenRevokeKycTransactionBody|null);

        /** Deletes a token instance */
        tokenDeletion?: (proto.ITokenDeleteTransactionBody|null);

        /** Updates a token instance */
        tokenUpdate?: (proto.ITokenUpdateTransactionBody|null);

        /** Mints new tokens to a token's treasury account */
        tokenMint?: (proto.ITokenMintTransactionBody|null);

        /** Burns tokens from a token's treasury account */
        tokenBurn?: (proto.ITokenBurnTransactionBody|null);

        /** Wipes amount of tokens from an account */
        tokenWipe?: (proto.ITokenWipeAccountTransactionBody|null);

        /** Associate tokens to an account */
        tokenAssociate?: (proto.ITokenAssociateTransactionBody|null);

        /** Dissociate tokens from an account */
        tokenDissociate?: (proto.ITokenDissociateTransactionBody|null);

        /** Marks a schedule in the network's action queue as deleted, preventing it from executing */
        scheduleDelete?: (proto.IScheduleDeleteTransactionBody|null);

        /** Pauses the Token */
        tokenPause?: (proto.ITokenPauseTransactionBody|null);

        /** Unpauses the Token */
        tokenUnpause?: (proto.ITokenUnpauseTransactionBody|null);
    }

    /**
     * A schedulable transaction. Note that the global/dynamic system property
     * <tt>scheduling.whitelist</tt> controls which transaction types may be scheduled.  In Hedera
     * Services 0.13.0, it will include only <tt>CryptoTransfer</tt> and <tt>ConsensusSubmitMessage</tt>
     * functions.
     */
    class SchedulableTransactionBody implements ISchedulableTransactionBody {

        /**
         * Constructs a new SchedulableTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ISchedulableTransactionBody);

        /** The maximum transaction fee the client is willing to pay */
        public transactionFee: Long;

        /**
         * A memo to include the execution record; the UTF-8 encoding may be up to 100 bytes and must not
         * include the zero byte
         */
        public memo: string;

        /** Calls a function of a contract instance */
        public contractCall?: (proto.IContractCallTransactionBody|null);

        /** Creates a contract instance */
        public contractCreateInstance?: (proto.IContractCreateTransactionBody|null);

        /** Updates a contract */
        public contractUpdateInstance?: (proto.IContractUpdateTransactionBody|null);

        /** Delete contract and transfer remaining balance into specified account */
        public contractDeleteInstance?: (proto.IContractDeleteTransactionBody|null);

        /** Create a new cryptocurrency account */
        public cryptoCreateAccount?: (proto.ICryptoCreateTransactionBody|null);

        /** Delete a cryptocurrency account (mark as deleted, and transfer hbars out) */
        public cryptoDelete?: (proto.ICryptoDeleteTransactionBody|null);

        /** Transfer amount between accounts */
        public cryptoTransfer?: (proto.ICryptoTransferTransactionBody|null);

        /** Modify information such as the expiration date for an account */
        public cryptoUpdateAccount?: (proto.ICryptoUpdateTransactionBody|null);

        /** Add bytes to the end of the contents of a file */
        public fileAppend?: (proto.IFileAppendTransactionBody|null);

        /** Create a new file */
        public fileCreate?: (proto.IFileCreateTransactionBody|null);

        /** Delete a file (remove contents and mark as deleted until it expires) */
        public fileDelete?: (proto.IFileDeleteTransactionBody|null);

        /** Modify information such as the expiration date for a file */
        public fileUpdate?: (proto.IFileUpdateTransactionBody|null);

        /** Hedera administrative deletion of a file or smart contract */
        public systemDelete?: (proto.ISystemDeleteTransactionBody|null);

        /** To undelete an entity deleted by SystemDelete */
        public systemUndelete?: (proto.ISystemUndeleteTransactionBody|null);

        /** Freeze the nodes */
        public freeze?: (proto.IFreezeTransactionBody|null);

        /** Creates a topic */
        public consensusCreateTopic?: (proto.IConsensusCreateTopicTransactionBody|null);

        /** Updates a topic */
        public consensusUpdateTopic?: (proto.IConsensusUpdateTopicTransactionBody|null);

        /** Deletes a topic */
        public consensusDeleteTopic?: (proto.IConsensusDeleteTopicTransactionBody|null);

        /** Submits message to a topic */
        public consensusSubmitMessage?: (proto.IConsensusSubmitMessageTransactionBody|null);

        /** Creates a token instance */
        public tokenCreation?: (proto.ITokenCreateTransactionBody|null);

        /** Freezes account not to be able to transact with a token */
        public tokenFreeze?: (proto.ITokenFreezeAccountTransactionBody|null);

        /** Unfreezes account for a token */
        public tokenUnfreeze?: (proto.ITokenUnfreezeAccountTransactionBody|null);

        /** Grants KYC to an account for a token */
        public tokenGrantKyc?: (proto.ITokenGrantKycTransactionBody|null);

        /** Revokes KYC of an account for a token */
        public tokenRevokeKyc?: (proto.ITokenRevokeKycTransactionBody|null);

        /** Deletes a token instance */
        public tokenDeletion?: (proto.ITokenDeleteTransactionBody|null);

        /** Updates a token instance */
        public tokenUpdate?: (proto.ITokenUpdateTransactionBody|null);

        /** Mints new tokens to a token's treasury account */
        public tokenMint?: (proto.ITokenMintTransactionBody|null);

        /** Burns tokens from a token's treasury account */
        public tokenBurn?: (proto.ITokenBurnTransactionBody|null);

        /** Wipes amount of tokens from an account */
        public tokenWipe?: (proto.ITokenWipeAccountTransactionBody|null);

        /** Associate tokens to an account */
        public tokenAssociate?: (proto.ITokenAssociateTransactionBody|null);

        /** Dissociate tokens from an account */
        public tokenDissociate?: (proto.ITokenDissociateTransactionBody|null);

        /** Marks a schedule in the network's action queue as deleted, preventing it from executing */
        public scheduleDelete?: (proto.IScheduleDeleteTransactionBody|null);

        /** Pauses the Token */
        public tokenPause?: (proto.ITokenPauseTransactionBody|null);

        /** Unpauses the Token */
        public tokenUnpause?: (proto.ITokenUnpauseTransactionBody|null);

        /** SchedulableTransactionBody data. */
        public data?: ("contractCall"|"contractCreateInstance"|"contractUpdateInstance"|"contractDeleteInstance"|"cryptoCreateAccount"|"cryptoDelete"|"cryptoTransfer"|"cryptoUpdateAccount"|"fileAppend"|"fileCreate"|"fileDelete"|"fileUpdate"|"systemDelete"|"systemUndelete"|"freeze"|"consensusCreateTopic"|"consensusUpdateTopic"|"consensusDeleteTopic"|"consensusSubmitMessage"|"tokenCreation"|"tokenFreeze"|"tokenUnfreeze"|"tokenGrantKyc"|"tokenRevokeKyc"|"tokenDeletion"|"tokenUpdate"|"tokenMint"|"tokenBurn"|"tokenWipe"|"tokenAssociate"|"tokenDissociate"|"scheduleDelete"|"tokenPause"|"tokenUnpause");

        /**
         * Creates a new SchedulableTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns SchedulableTransactionBody instance
         */
        public static create(properties?: proto.ISchedulableTransactionBody): proto.SchedulableTransactionBody;

        /**
         * Encodes the specified SchedulableTransactionBody message. Does not implicitly {@link proto.SchedulableTransactionBody.verify|verify} messages.
         * @param m SchedulableTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ISchedulableTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SchedulableTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns SchedulableTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.SchedulableTransactionBody;
    }

    /** Properties of a ScheduleDeleteTransactionBody. */
    interface IScheduleDeleteTransactionBody {

        /** The ID of the Scheduled Entity */
        scheduleID?: (proto.IScheduleID|null);
    }

    /**
     * Marks a schedule in the network's action queue as deleted. Must be signed by the admin key of the
     * target schedule.  A deleted schedule cannot receive any additional signing keys, nor will it be
     * executed.
     *
     * Other notable response codes include, <tt>INVALID_SCHEDULE_ID</tt>,
     * <tt>SCHEDULE_WAS_DELETED</tt>, <tt>SCHEDULE_WAS_EXECUTED</tt>, <tt>SCHEDULE_IS_IMMUTABLE</tt>.
     * For more information please see the section of this documentation on the <tt>ResponseCode</tt>
     * enum.
     */
    class ScheduleDeleteTransactionBody implements IScheduleDeleteTransactionBody {

        /**
         * Constructs a new ScheduleDeleteTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IScheduleDeleteTransactionBody);

        /** The ID of the Scheduled Entity */
        public scheduleID?: (proto.IScheduleID|null);

        /**
         * Creates a new ScheduleDeleteTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ScheduleDeleteTransactionBody instance
         */
        public static create(properties?: proto.IScheduleDeleteTransactionBody): proto.ScheduleDeleteTransactionBody;

        /**
         * Encodes the specified ScheduleDeleteTransactionBody message. Does not implicitly {@link proto.ScheduleDeleteTransactionBody.verify|verify} messages.
         * @param m ScheduleDeleteTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IScheduleDeleteTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ScheduleDeleteTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ScheduleDeleteTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ScheduleDeleteTransactionBody;
    }

    /** Properties of a ScheduleSignTransactionBody. */
    interface IScheduleSignTransactionBody {

        /** The id of the schedule to add signing keys to */
        scheduleID?: (proto.IScheduleID|null);
    }

    /**
     * Adds zero or more signing keys to a schedule. If the resulting set of signing keys satisfy the
     * scheduled transaction's signing requirements, it will be executed immediately after the
     * triggering <tt>ScheduleSign</tt>.
     *
     * Upon <tt>SUCCESS</tt>, the receipt includes the <tt>scheduledTransactionID</tt> to use to query
     * for the record of the scheduled transaction's execution (if it occurs).
     *
     * Other notable response codes include <tt>INVALID_SCHEDULE_ID</tt>, <tt>SCHEDULE_WAS_DELETD</tt>,
     * <tt>INVALID_ACCOUNT_ID</tt>, <tt>UNRESOLVABLE_REQUIRED_SIGNERS</tt>,
     * <tt>SOME_SIGNATURES_WERE_INVALID</tt>, and <tt>NO_NEW_VALID_SIGNATURES</tt>. For more information
     * please see the section of this documentation on the <tt>ResponseCode</tt> enum.
     */
    class ScheduleSignTransactionBody implements IScheduleSignTransactionBody {

        /**
         * Constructs a new ScheduleSignTransactionBody.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IScheduleSignTransactionBody);

        /** The id of the schedule to add signing keys to */
        public scheduleID?: (proto.IScheduleID|null);

        /**
         * Creates a new ScheduleSignTransactionBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ScheduleSignTransactionBody instance
         */
        public static create(properties?: proto.IScheduleSignTransactionBody): proto.ScheduleSignTransactionBody;

        /**
         * Encodes the specified ScheduleSignTransactionBody message. Does not implicitly {@link proto.ScheduleSignTransactionBody.verify|verify} messages.
         * @param m ScheduleSignTransactionBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IScheduleSignTransactionBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ScheduleSignTransactionBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ScheduleSignTransactionBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ScheduleSignTransactionBody;
    }

    /** Properties of a ResponseHeader. */
    interface IResponseHeader {

        /** Result of fee transaction precheck, saying it passed, or why it failed */
        nodeTransactionPrecheckCode?: (proto.ResponseCodeEnum|null);

        /** The requested response is repeated back here, for convenience */
        responseType?: (proto.ResponseType|null);

        /**
         * The fee that would be charged to get the requested information (if a cost was requested).
         * Note: This cost only includes the query fee and does not include the transfer fee(which is
         * required to execute the transfer transaction to debit the payer account and credit the node
         * account with query fee)
         */
        cost?: (Long|null);

        /** The state proof for this information (if a state proof was requested, and is available) */
        stateProof?: (Uint8Array|null);
    }

    /**
     * Every query receives a response containing the QueryResponseHeader. Either or both of the cost
     * and stateProof fields may be blank, if the responseType didn't ask for the cost or stateProof.
     */
    class ResponseHeader implements IResponseHeader {

        /**
         * Constructs a new ResponseHeader.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IResponseHeader);

        /** Result of fee transaction precheck, saying it passed, or why it failed */
        public nodeTransactionPrecheckCode: proto.ResponseCodeEnum;

        /** The requested response is repeated back here, for convenience */
        public responseType: proto.ResponseType;

        /**
         * The fee that would be charged to get the requested information (if a cost was requested).
         * Note: This cost only includes the query fee and does not include the transfer fee(which is
         * required to execute the transfer transaction to debit the payer account and credit the node
         * account with query fee)
         */
        public cost: Long;

        /** The state proof for this information (if a state proof was requested, and is available) */
        public stateProof: Uint8Array;

        /**
         * Creates a new ResponseHeader instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ResponseHeader instance
         */
        public static create(properties?: proto.IResponseHeader): proto.ResponseHeader;

        /**
         * Encodes the specified ResponseHeader message. Does not implicitly {@link proto.ResponseHeader.verify|verify} messages.
         * @param m ResponseHeader message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IResponseHeader, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ResponseHeader message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ResponseHeader
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ResponseHeader;
    }

    /** Properties of a TransactionResponse. */
    interface ITransactionResponse {

        /** The response code that indicates the current status of the transaction. */
        nodeTransactionPrecheckCode?: (proto.ResponseCodeEnum|null);

        /**
         * If the response code was INSUFFICIENT_TX_FEE, the actual transaction fee that would be
         * required to execute the transaction.
         */
        cost?: (Long|null);
    }

    /**
     * When the client sends the node a transaction of any kind, the node replies with this, which
     * simply says that the transaction passed the precheck (so the node will submit it to the network)
     * or it failed (so it won't). If the fee offered was insufficient, this will also contain the
     * amount of the required fee. To learn the consensus result, the client should later obtain a
     * receipt (free), or can buy a more detailed record (not free).
     */
    class TransactionResponse implements ITransactionResponse {

        /**
         * Constructs a new TransactionResponse.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITransactionResponse);

        /** * The response code that indicates the current status of the transaction. */
        public nodeTransactionPrecheckCode: proto.ResponseCodeEnum;

        /**
         * If the response code was INSUFFICIENT_TX_FEE, the actual transaction fee that would be
         * required to execute the transaction.
         */
        public cost: Long;

        /**
         * Creates a new TransactionResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TransactionResponse instance
         */
        public static create(properties?: proto.ITransactionResponse): proto.TransactionResponse;

        /**
         * Encodes the specified TransactionResponse message. Does not implicitly {@link proto.TransactionResponse.verify|verify} messages.
         * @param m TransactionResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITransactionResponse, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TransactionResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TransactionResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TransactionResponse;
    }

    /** UNDOCUMENTED */
    enum ResponseCodeEnum {
        OK = 0,
        INVALID_TRANSACTION = 1,
        PAYER_ACCOUNT_NOT_FOUND = 2,
        INVALID_NODE_ACCOUNT = 3,
        TRANSACTION_EXPIRED = 4,
        INVALID_TRANSACTION_START = 5,
        INVALID_TRANSACTION_DURATION = 6,
        INVALID_SIGNATURE = 7,
        MEMO_TOO_LONG = 8,
        INSUFFICIENT_TX_FEE = 9,
        INSUFFICIENT_PAYER_BALANCE = 10,
        DUPLICATE_TRANSACTION = 11,
        BUSY = 12,
        NOT_SUPPORTED = 13,
        INVALID_FILE_ID = 14,
        INVALID_ACCOUNT_ID = 15,
        INVALID_CONTRACT_ID = 16,
        INVALID_TRANSACTION_ID = 17,
        RECEIPT_NOT_FOUND = 18,
        RECORD_NOT_FOUND = 19,
        INVALID_SOLIDITY_ID = 20,
        UNKNOWN = 21,
        SUCCESS = 22,
        FAIL_INVALID = 23,
        FAIL_FEE = 24,
        FAIL_BALANCE = 25,
        KEY_REQUIRED = 26,
        BAD_ENCODING = 27,
        INSUFFICIENT_ACCOUNT_BALANCE = 28,
        INVALID_SOLIDITY_ADDRESS = 29,
        INSUFFICIENT_GAS = 30,
        CONTRACT_SIZE_LIMIT_EXCEEDED = 31,
        LOCAL_CALL_MODIFICATION_EXCEPTION = 32,
        CONTRACT_REVERT_EXECUTED = 33,
        CONTRACT_EXECUTION_EXCEPTION = 34,
        INVALID_RECEIVING_NODE_ACCOUNT = 35,
        MISSING_QUERY_HEADER = 36,
        ACCOUNT_UPDATE_FAILED = 37,
        INVALID_KEY_ENCODING = 38,
        NULL_SOLIDITY_ADDRESS = 39,
        CONTRACT_UPDATE_FAILED = 40,
        INVALID_QUERY_HEADER = 41,
        INVALID_FEE_SUBMITTED = 42,
        INVALID_PAYER_SIGNATURE = 43,
        KEY_NOT_PROVIDED = 44,
        INVALID_EXPIRATION_TIME = 45,
        NO_WACL_KEY = 46,
        FILE_CONTENT_EMPTY = 47,
        INVALID_ACCOUNT_AMOUNTS = 48,
        EMPTY_TRANSACTION_BODY = 49,
        INVALID_TRANSACTION_BODY = 50,
        INVALID_SIGNATURE_TYPE_MISMATCHING_KEY = 51,
        INVALID_SIGNATURE_COUNT_MISMATCHING_KEY = 52,
        EMPTY_LIVE_HASH_BODY = 53,
        EMPTY_LIVE_HASH = 54,
        EMPTY_LIVE_HASH_KEYS = 55,
        INVALID_LIVE_HASH_SIZE = 56,
        EMPTY_QUERY_BODY = 57,
        EMPTY_LIVE_HASH_QUERY = 58,
        LIVE_HASH_NOT_FOUND = 59,
        ACCOUNT_ID_DOES_NOT_EXIST = 60,
        LIVE_HASH_ALREADY_EXISTS = 61,
        INVALID_FILE_WACL = 62,
        SERIALIZATION_FAILED = 63,
        TRANSACTION_OVERSIZE = 64,
        TRANSACTION_TOO_MANY_LAYERS = 65,
        CONTRACT_DELETED = 66,
        PLATFORM_NOT_ACTIVE = 67,
        KEY_PREFIX_MISMATCH = 68,
        PLATFORM_TRANSACTION_NOT_CREATED = 69,
        INVALID_RENEWAL_PERIOD = 70,
        INVALID_PAYER_ACCOUNT_ID = 71,
        ACCOUNT_DELETED = 72,
        FILE_DELETED = 73,
        ACCOUNT_REPEATED_IN_ACCOUNT_AMOUNTS = 74,
        SETTING_NEGATIVE_ACCOUNT_BALANCE = 75,
        OBTAINER_REQUIRED = 76,
        OBTAINER_SAME_CONTRACT_ID = 77,
        OBTAINER_DOES_NOT_EXIST = 78,
        MODIFYING_IMMUTABLE_CONTRACT = 79,
        FILE_SYSTEM_EXCEPTION = 80,
        AUTORENEW_DURATION_NOT_IN_RANGE = 81,
        ERROR_DECODING_BYTESTRING = 82,
        CONTRACT_FILE_EMPTY = 83,
        CONTRACT_BYTECODE_EMPTY = 84,
        INVALID_INITIAL_BALANCE = 85,
        INVALID_RECEIVE_RECORD_THRESHOLD = 86,
        INVALID_SEND_RECORD_THRESHOLD = 87,
        ACCOUNT_IS_NOT_GENESIS_ACCOUNT = 88,
        PAYER_ACCOUNT_UNAUTHORIZED = 89,
        INVALID_FREEZE_TRANSACTION_BODY = 90,
        FREEZE_TRANSACTION_BODY_NOT_FOUND = 91,
        TRANSFER_LIST_SIZE_LIMIT_EXCEEDED = 92,
        RESULT_SIZE_LIMIT_EXCEEDED = 93,
        NOT_SPECIAL_ACCOUNT = 94,
        CONTRACT_NEGATIVE_GAS = 95,
        CONTRACT_NEGATIVE_VALUE = 96,
        INVALID_FEE_FILE = 97,
        INVALID_EXCHANGE_RATE_FILE = 98,
        INSUFFICIENT_LOCAL_CALL_GAS = 99,
        ENTITY_NOT_ALLOWED_TO_DELETE = 100,
        AUTHORIZATION_FAILED = 101,
        FILE_UPLOADED_PROTO_INVALID = 102,
        FILE_UPLOADED_PROTO_NOT_SAVED_TO_DISK = 103,
        FEE_SCHEDULE_FILE_PART_UPLOADED = 104,
        EXCHANGE_RATE_CHANGE_LIMIT_EXCEEDED = 105,
        MAX_CONTRACT_STORAGE_EXCEEDED = 106,
        TRANSFER_ACCOUNT_SAME_AS_DELETE_ACCOUNT = 107,
        TOTAL_LEDGER_BALANCE_INVALID = 108,
        EXPIRATION_REDUCTION_NOT_ALLOWED = 110,
        MAX_GAS_LIMIT_EXCEEDED = 111,
        MAX_FILE_SIZE_EXCEEDED = 112,
        RECEIVER_SIG_REQUIRED = 113,
        INVALID_TOPIC_ID = 150,
        INVALID_ADMIN_KEY = 155,
        INVALID_SUBMIT_KEY = 156,
        UNAUTHORIZED = 157,
        INVALID_TOPIC_MESSAGE = 158,
        INVALID_AUTORENEW_ACCOUNT = 159,
        AUTORENEW_ACCOUNT_NOT_ALLOWED = 160,
        TOPIC_EXPIRED = 162,
        INVALID_CHUNK_NUMBER = 163,
        INVALID_CHUNK_TRANSACTION_ID = 164,
        ACCOUNT_FROZEN_FOR_TOKEN = 165,
        TOKENS_PER_ACCOUNT_LIMIT_EXCEEDED = 166,
        INVALID_TOKEN_ID = 167,
        INVALID_TOKEN_DECIMALS = 168,
        INVALID_TOKEN_INITIAL_SUPPLY = 169,
        INVALID_TREASURY_ACCOUNT_FOR_TOKEN = 170,
        INVALID_TOKEN_SYMBOL = 171,
        TOKEN_HAS_NO_FREEZE_KEY = 172,
        TRANSFERS_NOT_ZERO_SUM_FOR_TOKEN = 173,
        MISSING_TOKEN_SYMBOL = 174,
        TOKEN_SYMBOL_TOO_LONG = 175,
        ACCOUNT_KYC_NOT_GRANTED_FOR_TOKEN = 176,
        TOKEN_HAS_NO_KYC_KEY = 177,
        INSUFFICIENT_TOKEN_BALANCE = 178,
        TOKEN_WAS_DELETED = 179,
        TOKEN_HAS_NO_SUPPLY_KEY = 180,
        TOKEN_HAS_NO_WIPE_KEY = 181,
        INVALID_TOKEN_MINT_AMOUNT = 182,
        INVALID_TOKEN_BURN_AMOUNT = 183,
        TOKEN_NOT_ASSOCIATED_TO_ACCOUNT = 184,
        CANNOT_WIPE_TOKEN_TREASURY_ACCOUNT = 185,
        INVALID_KYC_KEY = 186,
        INVALID_WIPE_KEY = 187,
        INVALID_FREEZE_KEY = 188,
        INVALID_SUPPLY_KEY = 189,
        MISSING_TOKEN_NAME = 190,
        TOKEN_NAME_TOO_LONG = 191,
        INVALID_WIPING_AMOUNT = 192,
        TOKEN_IS_IMMUTABLE = 193,
        TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT = 194,
        TRANSACTION_REQUIRES_ZERO_TOKEN_BALANCES = 195,
        ACCOUNT_IS_TREASURY = 196,
        TOKEN_ID_REPEATED_IN_TOKEN_LIST = 197,
        TOKEN_TRANSFER_LIST_SIZE_LIMIT_EXCEEDED = 198,
        EMPTY_TOKEN_TRANSFER_BODY = 199,
        EMPTY_TOKEN_TRANSFER_ACCOUNT_AMOUNTS = 200,
        INVALID_SCHEDULE_ID = 201,
        SCHEDULE_IS_IMMUTABLE = 202,
        INVALID_SCHEDULE_PAYER_ID = 203,
        INVALID_SCHEDULE_ACCOUNT_ID = 204,
        NO_NEW_VALID_SIGNATURES = 205,
        UNRESOLVABLE_REQUIRED_SIGNERS = 206,
        SCHEDULED_TRANSACTION_NOT_IN_WHITELIST = 207,
        SOME_SIGNATURES_WERE_INVALID = 208,
        TRANSACTION_ID_FIELD_NOT_ALLOWED = 209,
        IDENTICAL_SCHEDULE_ALREADY_CREATED = 210,
        INVALID_ZERO_BYTE_IN_STRING = 211,
        SCHEDULE_ALREADY_DELETED = 212,
        SCHEDULE_ALREADY_EXECUTED = 213,
        MESSAGE_SIZE_TOO_LARGE = 214,
        OPERATION_REPEATED_IN_BUCKET_GROUPS = 215,
        BUCKET_CAPACITY_OVERFLOW = 216,
        NODE_CAPACITY_NOT_SUFFICIENT_FOR_OPERATION = 217,
        BUCKET_HAS_NO_THROTTLE_GROUPS = 218,
        THROTTLE_GROUP_HAS_ZERO_OPS_PER_SEC = 219,
        SUCCESS_BUT_MISSING_EXPECTED_OPERATION = 220,
        UNPARSEABLE_THROTTLE_DEFINITIONS = 221,
        INVALID_THROTTLE_DEFINITIONS = 222,
        ACCOUNT_EXPIRED_AND_PENDING_REMOVAL = 223,
        INVALID_TOKEN_MAX_SUPPLY = 224,
        INVALID_TOKEN_NFT_SERIAL_NUMBER = 225,
        INVALID_NFT_ID = 226,
        METADATA_TOO_LONG = 227,
        BATCH_SIZE_LIMIT_EXCEEDED = 228,
        INVALID_QUERY_RANGE = 229,
        FRACTION_DIVIDES_BY_ZERO = 230,
        INSUFFICIENT_PAYER_BALANCE_FOR_CUSTOM_FEE = 231,
        CUSTOM_FEES_LIST_TOO_LONG = 232,
        INVALID_CUSTOM_FEE_COLLECTOR = 233,
        INVALID_TOKEN_ID_IN_CUSTOM_FEES = 234,
        TOKEN_NOT_ASSOCIATED_TO_FEE_COLLECTOR = 235,
        TOKEN_MAX_SUPPLY_REACHED = 236,
        SENDER_DOES_NOT_OWN_NFT_SERIAL_NO = 237,
        CUSTOM_FEE_NOT_FULLY_SPECIFIED = 238,
        CUSTOM_FEE_MUST_BE_POSITIVE = 239,
        TOKEN_HAS_NO_FEE_SCHEDULE_KEY = 240,
        CUSTOM_FEE_OUTSIDE_NUMERIC_RANGE = 241,
        ROYALTY_FRACTION_CANNOT_EXCEED_ONE = 242,
        FRACTIONAL_FEE_MAX_AMOUNT_LESS_THAN_MIN_AMOUNT = 243,
        CUSTOM_SCHEDULE_ALREADY_HAS_NO_FEES = 244,
        CUSTOM_FEE_DENOMINATION_MUST_BE_FUNGIBLE_COMMON = 245,
        CUSTOM_FRACTIONAL_FEE_ONLY_ALLOWED_FOR_FUNGIBLE_COMMON = 246,
        INVALID_CUSTOM_FEE_SCHEDULE_KEY = 247,
        INVALID_TOKEN_MINT_METADATA = 248,
        INVALID_TOKEN_BURN_METADATA = 249,
        CURRENT_TREASURY_STILL_OWNS_NFTS = 250,
        ACCOUNT_STILL_OWNS_NFTS = 251,
        TREASURY_MUST_OWN_BURNED_NFT = 252,
        ACCOUNT_DOES_NOT_OWN_WIPED_NFT = 253,
        ACCOUNT_AMOUNT_TRANSFERS_ONLY_ALLOWED_FOR_FUNGIBLE_COMMON = 254,
        MAX_NFTS_IN_PRICE_REGIME_HAVE_BEEN_MINTED = 255,
        PAYER_ACCOUNT_DELETED = 256,
        CUSTOM_FEE_CHARGING_EXCEEDED_MAX_RECURSION_DEPTH = 257,
        CUSTOM_FEE_CHARGING_EXCEEDED_MAX_ACCOUNT_AMOUNTS = 258,
        INSUFFICIENT_SENDER_ACCOUNT_BALANCE_FOR_CUSTOM_FEE = 259,
        SERIAL_NUMBER_LIMIT_REACHED = 260,
        CUSTOM_ROYALTY_FEE_ONLY_ALLOWED_FOR_NON_FUNGIBLE_UNIQUE = 261,
        NO_REMAINING_AUTOMATIC_ASSOCIATIONS = 262,
        EXISTING_AUTOMATIC_ASSOCIATIONS_EXCEED_GIVEN_LIMIT = 263,
        REQUESTED_NUM_AUTOMATIC_ASSOCIATIONS_EXCEEDS_ASSOCIATION_LIMIT = 264,
        TOKEN_IS_PAUSED = 265,
        TOKEN_HAS_NO_PAUSE_KEY = 266,
        INVALID_PAUSE_KEY = 267,
        FREEZE_UPDATE_FILE_DOES_NOT_EXIST = 268,
        FREEZE_UPDATE_FILE_HASH_DOES_NOT_MATCH = 269,
        NO_UPGRADE_HAS_BEEN_PREPARED = 270,
        NO_FREEZE_IS_SCHEDULED = 271,
        UPDATE_FILE_HASH_CHANGED_SINCE_PREPARE_UPGRADE = 272,
        FREEZE_START_TIME_MUST_BE_FUTURE = 273,
        PREPARED_UPDATE_FILE_IS_IMMUTABLE = 274,
        FREEZE_ALREADY_SCHEDULED = 275,
        FREEZE_UPGRADE_IN_PROGRESS = 276,
        UPDATE_FILE_ID_DOES_NOT_MATCH_PREPARED = 277,
        UPDATE_FILE_HASH_DOES_NOT_MATCH_PREPARED = 278
    }

    /** Properties of a ConsensusTopicInfo. */
    interface IConsensusTopicInfo {

        /** The memo associated with the topic (UTF-8 encoding max 100 bytes) */
        memo?: (string|null);

        /**
         * When a topic is created, its running hash is initialized to 48 bytes of binary zeros.
         * For each submitted message, the topic's running hash is then updated to the output
         * of a particular SHA-384 digest whose input data include the previous running hash.
         *
         * See the TransactionReceipt.proto documentation for an exact description of the
         * data included in the SHA-384 digest used for the update.
         */
        runningHash?: (Uint8Array|null);

        /** Sequence number (starting at 1 for the first submitMessage) of messages on the topic. */
        sequenceNumber?: (Long|null);

        /**
         * Effective consensus timestamp at (and after) which submitMessage calls will no longer succeed on the topic
         * and the topic will expire and after AUTORENEW_GRACE_PERIOD be automatically deleted.
         */
        expirationTime?: (proto.ITimestamp|null);

        /** Access control for update/delete of the topic. Null if there is no key. */
        adminKey?: (proto.IKey|null);

        /** Access control for ConsensusService.submitMessage. Null if there is no key. */
        submitKey?: (proto.IKey|null);

        /**
         * If an auto-renew account is specified, when the topic expires, its lifetime will be extended
         * by up to this duration (depending on the solvency of the auto-renew account). If the
         * auto-renew account has no funds at all, the topic will be deleted instead.
         */
        autoRenewPeriod?: (proto.IDuration|null);

        /** The account, if any, to charge for automatic renewal of the topic's lifetime upon expiry. */
        autoRenewAccount?: (proto.IAccountID|null);
    }

    /** Current state of a topic. */
    class ConsensusTopicInfo implements IConsensusTopicInfo {

        /**
         * Constructs a new ConsensusTopicInfo.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IConsensusTopicInfo);

        /** The memo associated with the topic (UTF-8 encoding max 100 bytes) */
        public memo: string;

        /**
         * When a topic is created, its running hash is initialized to 48 bytes of binary zeros.
         * For each submitted message, the topic's running hash is then updated to the output
         * of a particular SHA-384 digest whose input data include the previous running hash.
         *
         * See the TransactionReceipt.proto documentation for an exact description of the
         * data included in the SHA-384 digest used for the update.
         */
        public runningHash: Uint8Array;

        /** Sequence number (starting at 1 for the first submitMessage) of messages on the topic. */
        public sequenceNumber: Long;

        /**
         * Effective consensus timestamp at (and after) which submitMessage calls will no longer succeed on the topic
         * and the topic will expire and after AUTORENEW_GRACE_PERIOD be automatically deleted.
         */
        public expirationTime?: (proto.ITimestamp|null);

        /** Access control for update/delete of the topic. Null if there is no key. */
        public adminKey?: (proto.IKey|null);

        /** Access control for ConsensusService.submitMessage. Null if there is no key. */
        public submitKey?: (proto.IKey|null);

        /**
         * If an auto-renew account is specified, when the topic expires, its lifetime will be extended
         * by up to this duration (depending on the solvency of the auto-renew account). If the
         * auto-renew account has no funds at all, the topic will be deleted instead.
         */
        public autoRenewPeriod?: (proto.IDuration|null);

        /** The account, if any, to charge for automatic renewal of the topic's lifetime upon expiry. */
        public autoRenewAccount?: (proto.IAccountID|null);

        /**
         * Creates a new ConsensusTopicInfo instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ConsensusTopicInfo instance
         */
        public static create(properties?: proto.IConsensusTopicInfo): proto.ConsensusTopicInfo;

        /**
         * Encodes the specified ConsensusTopicInfo message. Does not implicitly {@link proto.ConsensusTopicInfo.verify|verify} messages.
         * @param m ConsensusTopicInfo message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IConsensusTopicInfo, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ConsensusTopicInfo message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ConsensusTopicInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ConsensusTopicInfo;
    }

    /**
     * The Consensus Service provides the ability for Hedera Hashgraph to provide aBFT consensus as to
     * the order and validity of messages submitted to a *topic*, as well as a *consensus timestamp* for
     * those messages.
     *
     * Automatic renewal can be configured via an autoRenewAccount.
     * Any time an autoRenewAccount is added to a topic, that createTopic/updateTopic transaction must
     * be signed by the autoRenewAccount.
     *
     * The autoRenewPeriod on an account must currently be set a value in createTopic between
     * MIN_AUTORENEW_PERIOD (6999999 seconds) and MAX_AUTORENEW_PERIOD (8000001 seconds). During
     * creation this sets the initial expirationTime of the topic (see more below).
     *
     * If no adminKey is on a topic, there may not be an autoRenewAccount on the topic, deleteTopic is
     * not allowed, and the only change allowed via an updateTopic is to extend the expirationTime.
     *
     * If an adminKey is on a topic, every updateTopic and deleteTopic transaction must be signed by the
     * adminKey, except for updateTopics which only extend the topic's expirationTime (no adminKey
     * authorization required).
     *
     * If an updateTopic modifies the adminKey of a topic, the transaction signatures on the updateTopic
     * must fulfill both the pre-update and post-update adminKey signature requirements.
     *
     * Mirrornet ConsensusService may be used to subscribe to changes on the topic, including changes to
     * the topic definition and the consensus ordering and timestamp of submitted messages.
     *
     * Until autoRenew functionality is supported by HAPI, the topic will not expire, the
     * autoRenewAccount will not be charged, and the topic will not automatically be deleted.
     *
     * Once autoRenew functionality is supported by HAPI:
     *
     * 1. Once the expirationTime is encountered, if an autoRenewAccount is configured on the topic, the
     * account will be charged automatically at the expirationTime, to extend the expirationTime of the
     * topic up to the topic's autoRenewPeriod (or as much extension as the account's balance will
     * supply).
     *
     * 2. If the topic expires and is not automatically renewed, the topic will enter the EXPIRED state.
     * All transactions on the topic will fail with TOPIC_EXPIRED, except an updateTopic() call that
     * modifies only the expirationTime.  getTopicInfo() will succeed. This state will be available for
     * a AUTORENEW_GRACE_PERIOD grace period (7 days).
     *
     * 3. After the grace period, if the topic's expirationTime is not extended, the topic will be
     * automatically deleted and no transactions or queries on the topic will succeed after that point.
     */
    class ConsensusService extends $protobuf.rpc.Service {

        /**
         * Constructs a new ConsensusService service.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         */
        constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

        /**
         * Creates new ConsensusService service using the specified rpc implementation.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         * @returns RPC service. Useful where requests and/or responses are streamed.
         */
        public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): ConsensusService;

        /**
         * Create a topic to be used for consensus.
         * If an autoRenewAccount is specified, that account must also sign this transaction.
         * If an adminKey is specified, the adminKey must sign the transaction.
         * On success, the resulting TransactionReceipt contains the newly created TopicId.
         * Request is [ConsensusCreateTopicTransactionBody](#proto.ConsensusCreateTopicTransactionBody)
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public createTopic(request: proto.ITransaction, callback: proto.ConsensusService.createTopicCallback): void;

        /**
         * Create a topic to be used for consensus.
         * If an autoRenewAccount is specified, that account must also sign this transaction.
         * If an adminKey is specified, the adminKey must sign the transaction.
         * On success, the resulting TransactionReceipt contains the newly created TopicId.
         * Request is [ConsensusCreateTopicTransactionBody](#proto.ConsensusCreateTopicTransactionBody)
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public createTopic(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * Update a topic.
         * If there is no adminKey, the only authorized update (available to anyone) is to extend the expirationTime.
         * Otherwise transaction must be signed by the adminKey.
         * If an adminKey is updated, the transaction must be signed by the pre-update adminKey and post-update adminKey.
         * If a new autoRenewAccount is specified (not just being removed), that account must also sign the transaction.
         * Request is [ConsensusUpdateTopicTransactionBody](#proto.ConsensusUpdateTopicTransactionBody)
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public updateTopic(request: proto.ITransaction, callback: proto.ConsensusService.updateTopicCallback): void;

        /**
         * Update a topic.
         * If there is no adminKey, the only authorized update (available to anyone) is to extend the expirationTime.
         * Otherwise transaction must be signed by the adminKey.
         * If an adminKey is updated, the transaction must be signed by the pre-update adminKey and post-update adminKey.
         * If a new autoRenewAccount is specified (not just being removed), that account must also sign the transaction.
         * Request is [ConsensusUpdateTopicTransactionBody](#proto.ConsensusUpdateTopicTransactionBody)
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public updateTopic(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * Delete a topic. No more transactions or queries on the topic (via HAPI) will succeed.
         * If an adminKey is set, this transaction must be signed by that key.
         * If there is no adminKey, this transaction will fail UNAUTHORIZED.
         * Request is [ConsensusDeleteTopicTransactionBody](#proto.ConsensusDeleteTopicTransactionBody)
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public deleteTopic(request: proto.ITransaction, callback: proto.ConsensusService.deleteTopicCallback): void;

        /**
         * Delete a topic. No more transactions or queries on the topic (via HAPI) will succeed.
         * If an adminKey is set, this transaction must be signed by that key.
         * If there is no adminKey, this transaction will fail UNAUTHORIZED.
         * Request is [ConsensusDeleteTopicTransactionBody](#proto.ConsensusDeleteTopicTransactionBody)
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public deleteTopic(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * Retrieve the latest state of a topic. This method is unrestricted and allowed on any topic by any payer account.
         * Deleted accounts will not be returned.
         * Request is [ConsensusGetTopicInfoQuery](#proto.ConsensusGetTopicInfoQuery)
         * Response is [ConsensusGetTopicInfoResponse](#proto.ConsensusGetTopicInfoResponse)
         * @param request Query message or plain object
         * @param callback Node-style callback called with the error, if any, and Response
         */
        public getTopicInfo(request: proto.IQuery, callback: proto.ConsensusService.getTopicInfoCallback): void;

        /**
         * Retrieve the latest state of a topic. This method is unrestricted and allowed on any topic by any payer account.
         * Deleted accounts will not be returned.
         * Request is [ConsensusGetTopicInfoQuery](#proto.ConsensusGetTopicInfoQuery)
         * Response is [ConsensusGetTopicInfoResponse](#proto.ConsensusGetTopicInfoResponse)
         * @param request Query message or plain object
         * @returns Promise
         */
        public getTopicInfo(request: proto.IQuery): Promise<proto.Response>;

        /**
         * Submit a message for consensus.
         * Valid and authorized messages on valid topics will be ordered by the consensus service, gossipped to the
         * mirror net, and published (in order) to all subscribers (from the mirror net) on this topic.
         * The submitKey (if any) must sign this transaction.
         * On success, the resulting TransactionReceipt contains the topic's updated topicSequenceNumber and
         * topicRunningHash.
         * Request is [ConsensusSubmitMessageTransactionBody](#proto.ConsensusSubmitMessageTransactionBody)
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public submitMessage(request: proto.ITransaction, callback: proto.ConsensusService.submitMessageCallback): void;

        /**
         * Submit a message for consensus.
         * Valid and authorized messages on valid topics will be ordered by the consensus service, gossipped to the
         * mirror net, and published (in order) to all subscribers (from the mirror net) on this topic.
         * The submitKey (if any) must sign this transaction.
         * On success, the resulting TransactionReceipt contains the topic's updated topicSequenceNumber and
         * topicRunningHash.
         * Request is [ConsensusSubmitMessageTransactionBody](#proto.ConsensusSubmitMessageTransactionBody)
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public submitMessage(request: proto.ITransaction): Promise<proto.TransactionResponse>;
    }

    namespace ConsensusService {

        /**
         * Callback as used by {@link proto.ConsensusService#createTopic}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type createTopicCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.ConsensusService#updateTopic}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type updateTopicCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.ConsensusService#deleteTopic}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type deleteTopicCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.ConsensusService#getTopicInfo}.
         * @param error Error, if any
         * @param [response] Response
         */
        type getTopicInfoCallback = (error: (Error|null), response?: proto.Response) => void;

        /**
         * Callback as used by {@link proto.ConsensusService#submitMessage}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type submitMessageCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;
    }

    /** Properties of a Query. */
    interface IQuery {

        /** Get all entities associated with a given key */
        getByKey?: (proto.IGetByKeyQuery|null);

        /** Get the IDs in the format used in transactions, given the format used in Solidity */
        getBySolidityID?: (proto.IGetBySolidityIDQuery|null);

        /** Call a function of a smart contract instance */
        contractCallLocal?: (proto.IContractCallLocalQuery|null);

        /** Get information about a smart contract instance */
        contractGetInfo?: (proto.IContractGetInfoQuery|null);

        /** Get bytecode used by a smart contract instance */
        contractGetBytecode?: (proto.IContractGetBytecodeQuery|null);

        /** Get Records of the contract instance */
        ContractGetRecords?: (proto.IContractGetRecordsQuery|null);

        /** Get the current balance in a cryptocurrency account */
        cryptogetAccountBalance?: (proto.ICryptoGetAccountBalanceQuery|null);

        /** Get all the records that currently exist for transactions involving an account */
        cryptoGetAccountRecords?: (proto.ICryptoGetAccountRecordsQuery|null);

        /** Get all information about an account */
        cryptoGetInfo?: (proto.ICryptoGetInfoQuery|null);

        /** Get a single livehash from a single account, if present */
        cryptoGetLiveHash?: (proto.ICryptoGetLiveHashQuery|null);

        /**
         * Get all the accounts that proxy stake to a given account, and how much they proxy stake
         * (not yet implemented in the current API)
         */
        cryptoGetProxyStakers?: (proto.ICryptoGetStakersQuery|null);

        /** Get the contents of a file (the bytes stored in it) */
        fileGetContents?: (proto.IFileGetContentsQuery|null);

        /** Get information about a file, such as its expiration date */
        fileGetInfo?: (proto.IFileGetInfoQuery|null);

        /** Get a receipt for a transaction (lasts 180 seconds) */
        transactionGetReceipt?: (proto.ITransactionGetReceiptQuery|null);

        /** Get a record for a transaction */
        transactionGetRecord?: (proto.ITransactionGetRecordQuery|null);

        /** Get a record for a transaction (lasts 180 seconds) */
        transactionGetFastRecord?: (proto.ITransactionGetFastRecordQuery|null);

        /** Get the parameters of and state of a consensus topic. */
        consensusGetTopicInfo?: (proto.IConsensusGetTopicInfoQuery|null);

        /**
         * Get the versions of the HAPI protobuf and Hedera Services software deployed on the
         * responding node.
         */
        networkGetVersionInfo?: (proto.INetworkGetVersionInfoQuery|null);

        /** Get all information about a token */
        tokenGetInfo?: (proto.ITokenGetInfoQuery|null);

        /** Get all information about a scheduled entity */
        scheduleGetInfo?: (proto.IScheduleGetInfoQuery|null);

        /** Get a list of NFTs associated with the account */
        tokenGetAccountNftInfos?: (proto.ITokenGetAccountNftInfosQuery|null);

        /** Get all information about a NFT */
        tokenGetNftInfo?: (proto.ITokenGetNftInfoQuery|null);

        /** Get a list of NFTs for the token */
        tokenGetNftInfos?: (proto.ITokenGetNftInfosQuery|null);
    }

    /**
     * A single query, which is sent from the client to a node. This includes all possible queries. Each
     * Query should not have more than 50 levels.
     */
    class Query implements IQuery {

        /**
         * Constructs a new Query.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IQuery);

        /** Get all entities associated with a given key */
        public getByKey?: (proto.IGetByKeyQuery|null);

        /** Get the IDs in the format used in transactions, given the format used in Solidity */
        public getBySolidityID?: (proto.IGetBySolidityIDQuery|null);

        /** Call a function of a smart contract instance */
        public contractCallLocal?: (proto.IContractCallLocalQuery|null);

        /** Get information about a smart contract instance */
        public contractGetInfo?: (proto.IContractGetInfoQuery|null);

        /** Get bytecode used by a smart contract instance */
        public contractGetBytecode?: (proto.IContractGetBytecodeQuery|null);

        /** Get Records of the contract instance */
        public ContractGetRecords?: (proto.IContractGetRecordsQuery|null);

        /** Get the current balance in a cryptocurrency account */
        public cryptogetAccountBalance?: (proto.ICryptoGetAccountBalanceQuery|null);

        /** Get all the records that currently exist for transactions involving an account */
        public cryptoGetAccountRecords?: (proto.ICryptoGetAccountRecordsQuery|null);

        /** Get all information about an account */
        public cryptoGetInfo?: (proto.ICryptoGetInfoQuery|null);

        /** Get a single livehash from a single account, if present */
        public cryptoGetLiveHash?: (proto.ICryptoGetLiveHashQuery|null);

        /**
         * Get all the accounts that proxy stake to a given account, and how much they proxy stake
         * (not yet implemented in the current API)
         */
        public cryptoGetProxyStakers?: (proto.ICryptoGetStakersQuery|null);

        /** Get the contents of a file (the bytes stored in it) */
        public fileGetContents?: (proto.IFileGetContentsQuery|null);

        /** Get information about a file, such as its expiration date */
        public fileGetInfo?: (proto.IFileGetInfoQuery|null);

        /** Get a receipt for a transaction (lasts 180 seconds) */
        public transactionGetReceipt?: (proto.ITransactionGetReceiptQuery|null);

        /** Get a record for a transaction */
        public transactionGetRecord?: (proto.ITransactionGetRecordQuery|null);

        /** Get a record for a transaction (lasts 180 seconds) */
        public transactionGetFastRecord?: (proto.ITransactionGetFastRecordQuery|null);

        /** Get the parameters of and state of a consensus topic. */
        public consensusGetTopicInfo?: (proto.IConsensusGetTopicInfoQuery|null);

        /**
         * Get the versions of the HAPI protobuf and Hedera Services software deployed on the
         * responding node.
         */
        public networkGetVersionInfo?: (proto.INetworkGetVersionInfoQuery|null);

        /** Get all information about a token */
        public tokenGetInfo?: (proto.ITokenGetInfoQuery|null);

        /** Get all information about a scheduled entity */
        public scheduleGetInfo?: (proto.IScheduleGetInfoQuery|null);

        /** Get a list of NFTs associated with the account */
        public tokenGetAccountNftInfos?: (proto.ITokenGetAccountNftInfosQuery|null);

        /** Get all information about a NFT */
        public tokenGetNftInfo?: (proto.ITokenGetNftInfoQuery|null);

        /** Get a list of NFTs for the token */
        public tokenGetNftInfos?: (proto.ITokenGetNftInfosQuery|null);

        /** Query query. */
        public query?: ("getByKey"|"getBySolidityID"|"contractCallLocal"|"contractGetInfo"|"contractGetBytecode"|"ContractGetRecords"|"cryptogetAccountBalance"|"cryptoGetAccountRecords"|"cryptoGetInfo"|"cryptoGetLiveHash"|"cryptoGetProxyStakers"|"fileGetContents"|"fileGetInfo"|"transactionGetReceipt"|"transactionGetRecord"|"transactionGetFastRecord"|"consensusGetTopicInfo"|"networkGetVersionInfo"|"tokenGetInfo"|"scheduleGetInfo"|"tokenGetAccountNftInfos"|"tokenGetNftInfo"|"tokenGetNftInfos");

        /**
         * Creates a new Query instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Query instance
         */
        public static create(properties?: proto.IQuery): proto.Query;

        /**
         * Encodes the specified Query message. Does not implicitly {@link proto.Query.verify|verify} messages.
         * @param m Query message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IQuery, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Query message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Query
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.Query;
    }

    /** Properties of a GetByKeyQuery. */
    interface IGetByKeyQuery {

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        header?: (proto.IQueryHeader|null);

        /** The key to search for. It must not contain a contractID nor a ThresholdSignature. */
        key?: (proto.IKey|null);
    }

    /**
     * Get all accounts, claims, files, and smart contract instances whose associated keys include the
     * given Key. The given Key must not be a contractID or a ThresholdKey. This is not yet implemented
     * in the API, but will be in the future.
     */
    class GetByKeyQuery implements IGetByKeyQuery {

        /**
         * Constructs a new GetByKeyQuery.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IGetByKeyQuery);

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        public header?: (proto.IQueryHeader|null);

        /** The key to search for. It must not contain a contractID nor a ThresholdSignature. */
        public key?: (proto.IKey|null);

        /**
         * Creates a new GetByKeyQuery instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetByKeyQuery instance
         */
        public static create(properties?: proto.IGetByKeyQuery): proto.GetByKeyQuery;

        /**
         * Encodes the specified GetByKeyQuery message. Does not implicitly {@link proto.GetByKeyQuery.verify|verify} messages.
         * @param m GetByKeyQuery message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IGetByKeyQuery, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetByKeyQuery message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns GetByKeyQuery
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.GetByKeyQuery;
    }

    /** Properties of an EntityID. */
    interface IEntityID {

        /** The Account ID for the cryptocurrency account */
        accountID?: (proto.IAccountID|null);

        /** A uniquely identifying livehash of an acount */
        liveHash?: (proto.ILiveHash|null);

        /** The file ID of the file */
        fileID?: (proto.IFileID|null);

        /** The smart contract ID that identifies instance */
        contractID?: (proto.IContractID|null);
    }

    /** the ID for a single entity (account, livehash, file, or smart contract instance) */
    class EntityID implements IEntityID {

        /**
         * Constructs a new EntityID.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IEntityID);

        /** The Account ID for the cryptocurrency account */
        public accountID?: (proto.IAccountID|null);

        /** A uniquely identifying livehash of an acount */
        public liveHash?: (proto.ILiveHash|null);

        /** The file ID of the file */
        public fileID?: (proto.IFileID|null);

        /** The smart contract ID that identifies instance */
        public contractID?: (proto.IContractID|null);

        /** EntityID entity. */
        public entity?: ("accountID"|"liveHash"|"fileID"|"contractID");

        /**
         * Creates a new EntityID instance using the specified properties.
         * @param [properties] Properties to set
         * @returns EntityID instance
         */
        public static create(properties?: proto.IEntityID): proto.EntityID;

        /**
         * Encodes the specified EntityID message. Does not implicitly {@link proto.EntityID.verify|verify} messages.
         * @param m EntityID message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IEntityID, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an EntityID message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns EntityID
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.EntityID;
    }

    /** Properties of a GetByKeyResponse. */
    interface IGetByKeyResponse {

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither
         */
        header?: (proto.IResponseHeader|null);

        /** The list of entities that include this public key in their associated Key list */
        entities?: (proto.IEntityID[]|null);
    }

    /** Response when the client sends the node GetByKeyQuery */
    class GetByKeyResponse implements IGetByKeyResponse {

        /**
         * Constructs a new GetByKeyResponse.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IGetByKeyResponse);

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither
         */
        public header?: (proto.IResponseHeader|null);

        /** The list of entities that include this public key in their associated Key list */
        public entities: proto.IEntityID[];

        /**
         * Creates a new GetByKeyResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetByKeyResponse instance
         */
        public static create(properties?: proto.IGetByKeyResponse): proto.GetByKeyResponse;

        /**
         * Encodes the specified GetByKeyResponse message. Does not implicitly {@link proto.GetByKeyResponse.verify|verify} messages.
         * @param m GetByKeyResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IGetByKeyResponse, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetByKeyResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns GetByKeyResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.GetByKeyResponse;
    }

    /** Properties of a GetBySolidityIDQuery. */
    interface IGetBySolidityIDQuery {

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        header?: (proto.IQueryHeader|null);

        /** The ID in the format used by Solidity */
        solidityID?: (string|null);
    }

    /**
     * Get the IDs in the format used by transactions, given the ID in the format used by Solidity. If
     * the Solidity ID is for a smart contract instance, then both the ContractID and associated
     * AccountID will be returned.
     */
    class GetBySolidityIDQuery implements IGetBySolidityIDQuery {

        /**
         * Constructs a new GetBySolidityIDQuery.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IGetBySolidityIDQuery);

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        public header?: (proto.IQueryHeader|null);

        /** The ID in the format used by Solidity */
        public solidityID: string;

        /**
         * Creates a new GetBySolidityIDQuery instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetBySolidityIDQuery instance
         */
        public static create(properties?: proto.IGetBySolidityIDQuery): proto.GetBySolidityIDQuery;

        /**
         * Encodes the specified GetBySolidityIDQuery message. Does not implicitly {@link proto.GetBySolidityIDQuery.verify|verify} messages.
         * @param m GetBySolidityIDQuery message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IGetBySolidityIDQuery, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetBySolidityIDQuery message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns GetBySolidityIDQuery
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.GetBySolidityIDQuery;
    }

    /** Properties of a GetBySolidityIDResponse. */
    interface IGetBySolidityIDResponse {

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither
         */
        header?: (proto.IResponseHeader|null);

        /** The Account ID for the cryptocurrency account */
        accountID?: (proto.IAccountID|null);

        /** The file Id for the file */
        fileID?: (proto.IFileID|null);

        /**
         * A smart contract ID for the instance (if this is included, then the associated accountID will
         * also be included)
         */
        contractID?: (proto.IContractID|null);
    }

    /** Response when the client sends the node GetBySolidityIDQuery */
    class GetBySolidityIDResponse implements IGetBySolidityIDResponse {

        /**
         * Constructs a new GetBySolidityIDResponse.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IGetBySolidityIDResponse);

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither
         */
        public header?: (proto.IResponseHeader|null);

        /** The Account ID for the cryptocurrency account */
        public accountID?: (proto.IAccountID|null);

        /** The file Id for the file */
        public fileID?: (proto.IFileID|null);

        /**
         * A smart contract ID for the instance (if this is included, then the associated accountID will
         * also be included)
         */
        public contractID?: (proto.IContractID|null);

        /**
         * Creates a new GetBySolidityIDResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetBySolidityIDResponse instance
         */
        public static create(properties?: proto.IGetBySolidityIDResponse): proto.GetBySolidityIDResponse;

        /**
         * Encodes the specified GetBySolidityIDResponse message. Does not implicitly {@link proto.GetBySolidityIDResponse.verify|verify} messages.
         * @param m GetBySolidityIDResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IGetBySolidityIDResponse, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetBySolidityIDResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns GetBySolidityIDResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.GetBySolidityIDResponse;
    }

    /** Properties of a ContractLoginfo. */
    interface IContractLoginfo {

        /** address of a contract that emitted the event */
        contractID?: (proto.IContractID|null);

        /** bloom filter for a particular log */
        bloom?: (Uint8Array|null);

        /** topics of a particular event */
        topic?: (Uint8Array[]|null);

        /** event data */
        data?: (Uint8Array|null);
    }

    /**
     * The log information for an event returned by a smart contract function call. One function call
     * may return several such events.
     */
    class ContractLoginfo implements IContractLoginfo {

        /**
         * Constructs a new ContractLoginfo.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IContractLoginfo);

        /** address of a contract that emitted the event */
        public contractID?: (proto.IContractID|null);

        /** bloom filter for a particular log */
        public bloom: Uint8Array;

        /** topics of a particular event */
        public topic: Uint8Array[];

        /** event data */
        public data: Uint8Array;

        /**
         * Creates a new ContractLoginfo instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ContractLoginfo instance
         */
        public static create(properties?: proto.IContractLoginfo): proto.ContractLoginfo;

        /**
         * Encodes the specified ContractLoginfo message. Does not implicitly {@link proto.ContractLoginfo.verify|verify} messages.
         * @param m ContractLoginfo message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IContractLoginfo, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ContractLoginfo message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ContractLoginfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ContractLoginfo;
    }

    /** Properties of a ContractFunctionResult. */
    interface IContractFunctionResult {

        /** the smart contract instance whose function was called */
        contractID?: (proto.IContractID|null);

        /** the result returned by the function */
        contractCallResult?: (Uint8Array|null);

        /** message In case there was an error during smart contract execution */
        errorMessage?: (string|null);

        /** bloom filter for record */
        bloom?: (Uint8Array|null);

        /** units of gas used to execute contract */
        gasUsed?: (Long|null);

        /** the log info for events returned by the function */
        logInfo?: (proto.IContractLoginfo[]|null);

        /** the list of smart contracts that were created by the function call */
        createdContractIDs?: (proto.IContractID[]|null);
    }

    /**
     * The result returned by a call to a smart contract function. This is part of the response to a
     * ContractCallLocal query, and is in the record for a ContractCall or ContractCreateInstance
     * transaction. The ContractCreateInstance transaction record has the results of the call to the
     * constructor.
     */
    class ContractFunctionResult implements IContractFunctionResult {

        /**
         * Constructs a new ContractFunctionResult.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IContractFunctionResult);

        /** the smart contract instance whose function was called */
        public contractID?: (proto.IContractID|null);

        /** the result returned by the function */
        public contractCallResult: Uint8Array;

        /** message In case there was an error during smart contract execution */
        public errorMessage: string;

        /** bloom filter for record */
        public bloom: Uint8Array;

        /** units of gas used to execute contract */
        public gasUsed: Long;

        /** the log info for events returned by the function */
        public logInfo: proto.IContractLoginfo[];

        /** the list of smart contracts that were created by the function call */
        public createdContractIDs: proto.IContractID[];

        /**
         * Creates a new ContractFunctionResult instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ContractFunctionResult instance
         */
        public static create(properties?: proto.IContractFunctionResult): proto.ContractFunctionResult;

        /**
         * Encodes the specified ContractFunctionResult message. Does not implicitly {@link proto.ContractFunctionResult.verify|verify} messages.
         * @param m ContractFunctionResult message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IContractFunctionResult, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ContractFunctionResult message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ContractFunctionResult
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ContractFunctionResult;
    }

    /** Properties of a ContractCallLocalQuery. */
    interface IContractCallLocalQuery {

        /** standard info sent from client to node, including the signed payment, and what kind of response is requested (cost, state proof, both, or neither). The payment must cover the fees and all of the gas offered. */
        header?: (proto.IQueryHeader|null);

        /** the contract instance to call, in the format used in transactions */
        contractID?: (proto.IContractID|null);

        /** The amount of gas to use for the call; all of the gas offered will be used and charged a corresponding fee */
        gas?: (Long|null);

        /** which function to call, and the parameters to pass to the function */
        functionParameters?: (Uint8Array|null);

        /** [Deprecated] max number of bytes that the result might include. The run will fail if it would have returned more than this number of bytes. */
        maxResultSize?: (Long|null);
    }

    /**
     * Call a function of the given smart contract instance, giving it functionParameters as its inputs.
     * This is performed locally on the particular node that the client is communicating with.
     * It cannot change the state of the contract instance (and so, cannot spend anything from the instance's cryptocurrency account).
     * It will not have a consensus timestamp. It cannot generate a record or a receipt. The response will contain the output
     * returned by the function call.  This is useful for calling getter functions, which purely read the state and don't change it.
     * It is faster and cheaper than a normal call, because it is purely local to a single  node.
     *
     * Unlike a ContractCall transaction, the node will consume the entire amount of provided gas in determining
     * the fee for this query.
     */
    class ContractCallLocalQuery implements IContractCallLocalQuery {

        /**
         * Constructs a new ContractCallLocalQuery.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IContractCallLocalQuery);

        /** standard info sent from client to node, including the signed payment, and what kind of response is requested (cost, state proof, both, or neither). The payment must cover the fees and all of the gas offered. */
        public header?: (proto.IQueryHeader|null);

        /** the contract instance to call, in the format used in transactions */
        public contractID?: (proto.IContractID|null);

        /** The amount of gas to use for the call; all of the gas offered will be used and charged a corresponding fee */
        public gas: Long;

        /** which function to call, and the parameters to pass to the function */
        public functionParameters: Uint8Array;

        /** [Deprecated] max number of bytes that the result might include. The run will fail if it would have returned more than this number of bytes. */
        public maxResultSize: Long;

        /**
         * Creates a new ContractCallLocalQuery instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ContractCallLocalQuery instance
         */
        public static create(properties?: proto.IContractCallLocalQuery): proto.ContractCallLocalQuery;

        /**
         * Encodes the specified ContractCallLocalQuery message. Does not implicitly {@link proto.ContractCallLocalQuery.verify|verify} messages.
         * @param m ContractCallLocalQuery message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IContractCallLocalQuery, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ContractCallLocalQuery message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ContractCallLocalQuery
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ContractCallLocalQuery;
    }

    /** Properties of a ContractCallLocalResponse. */
    interface IContractCallLocalResponse {

        /** standard response from node to client, including the requested fields: cost, or state proof, or both, or neither */
        header?: (proto.IResponseHeader|null);

        /** the value returned by the function (if it completed and didn't fail) */
        functionResult?: (proto.IContractFunctionResult|null);
    }

    /** Response when the client sends the node ContractCallLocalQuery */
    class ContractCallLocalResponse implements IContractCallLocalResponse {

        /**
         * Constructs a new ContractCallLocalResponse.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IContractCallLocalResponse);

        /** standard response from node to client, including the requested fields: cost, or state proof, or both, or neither */
        public header?: (proto.IResponseHeader|null);

        /** the value returned by the function (if it completed and didn't fail) */
        public functionResult?: (proto.IContractFunctionResult|null);

        /**
         * Creates a new ContractCallLocalResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ContractCallLocalResponse instance
         */
        public static create(properties?: proto.IContractCallLocalResponse): proto.ContractCallLocalResponse;

        /**
         * Encodes the specified ContractCallLocalResponse message. Does not implicitly {@link proto.ContractCallLocalResponse.verify|verify} messages.
         * @param m ContractCallLocalResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IContractCallLocalResponse, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ContractCallLocalResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ContractCallLocalResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ContractCallLocalResponse;
    }

    /** Properties of a ContractGetInfoQuery. */
    interface IContractGetInfoQuery {

        /**
         * standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        header?: (proto.IQueryHeader|null);

        /** the contract for which information is requested */
        contractID?: (proto.IContractID|null);
    }

    /**
     * Get information about a smart contract instance. This includes the account that it uses, the file
     * containing its bytecode, and the time when it will expire.
     */
    class ContractGetInfoQuery implements IContractGetInfoQuery {

        /**
         * Constructs a new ContractGetInfoQuery.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IContractGetInfoQuery);

        /**
         * standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        public header?: (proto.IQueryHeader|null);

        /** the contract for which information is requested */
        public contractID?: (proto.IContractID|null);

        /**
         * Creates a new ContractGetInfoQuery instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ContractGetInfoQuery instance
         */
        public static create(properties?: proto.IContractGetInfoQuery): proto.ContractGetInfoQuery;

        /**
         * Encodes the specified ContractGetInfoQuery message. Does not implicitly {@link proto.ContractGetInfoQuery.verify|verify} messages.
         * @param m ContractGetInfoQuery message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IContractGetInfoQuery, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ContractGetInfoQuery message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ContractGetInfoQuery
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ContractGetInfoQuery;
    }

    /** Properties of a ContractGetInfoResponse. */
    interface IContractGetInfoResponse {

        /**
         * standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither
         */
        header?: (proto.IResponseHeader|null);

        /** the information about this contract instance (a state proof can be generated for this) */
        contractInfo?: (proto.ContractGetInfoResponse.IContractInfo|null);
    }

    /** Response when the client sends the node ContractGetInfoQuery */
    class ContractGetInfoResponse implements IContractGetInfoResponse {

        /**
         * Constructs a new ContractGetInfoResponse.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IContractGetInfoResponse);

        /**
         * standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither
         */
        public header?: (proto.IResponseHeader|null);

        /** the information about this contract instance (a state proof can be generated for this) */
        public contractInfo?: (proto.ContractGetInfoResponse.IContractInfo|null);

        /**
         * Creates a new ContractGetInfoResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ContractGetInfoResponse instance
         */
        public static create(properties?: proto.IContractGetInfoResponse): proto.ContractGetInfoResponse;

        /**
         * Encodes the specified ContractGetInfoResponse message. Does not implicitly {@link proto.ContractGetInfoResponse.verify|verify} messages.
         * @param m ContractGetInfoResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IContractGetInfoResponse, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ContractGetInfoResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ContractGetInfoResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ContractGetInfoResponse;
    }

    namespace ContractGetInfoResponse {

        /** Properties of a ContractInfo. */
        interface IContractInfo {

            /** ID of the contract instance, in the format used in transactions */
            contractID?: (proto.IContractID|null);

            /**
             * ID of the cryptocurrency account owned by the contract instance, in the format used in
             * transactions
             */
            accountID?: (proto.IAccountID|null);

            /**
             * ID of both the contract instance and the cryptocurrency account owned by the contract
             * instance, in the format used by Solidity
             */
            contractAccountID?: (string|null);

            /**
             * the state of the instance and its fields can be modified arbitrarily if this key signs a
             * transaction to modify it. If this is null, then such modifications are not possible, and
             * there is no administrator that can override the normal operation of this smart contract
             * instance. Note that if it is created with no admin keys, then there is no administrator
             * to authorize changing the admin keys, so there can never be any admin keys for that
             * instance.
             */
            adminKey?: (proto.IKey|null);

            /** the current time at which this contract instance (and its account) is set to expire */
            expirationTime?: (proto.ITimestamp|null);

            /**
             * the expiration time will extend every this many seconds. If there are insufficient funds,
             * then it extends as long as possible. If the account is empty when it expires, then it is
             * deleted.
             */
            autoRenewPeriod?: (proto.IDuration|null);

            /**
             * number of bytes of storage being used by this instance (which affects the cost to extend
             * the expiration time)
             */
            storage?: (Long|null);

            /** the memo associated with the contract (max 100 bytes) */
            memo?: (string|null);

            /** The current balance, in tinybars */
            balance?: (Long|null);

            /** Whether the contract has been deleted */
            deleted?: (boolean|null);

            /** The tokens associated to the contract */
            tokenRelationships?: (proto.ITokenRelationship[]|null);
        }

        /** Represents a ContractInfo. */
        class ContractInfo implements IContractInfo {

            /**
             * Constructs a new ContractInfo.
             * @param [p] Properties to set
             */
            constructor(p?: proto.ContractGetInfoResponse.IContractInfo);

            /** ID of the contract instance, in the format used in transactions */
            public contractID?: (proto.IContractID|null);

            /**
             * ID of the cryptocurrency account owned by the contract instance, in the format used in
             * transactions
             */
            public accountID?: (proto.IAccountID|null);

            /**
             * ID of both the contract instance and the cryptocurrency account owned by the contract
             * instance, in the format used by Solidity
             */
            public contractAccountID: string;

            /**
             * the state of the instance and its fields can be modified arbitrarily if this key signs a
             * transaction to modify it. If this is null, then such modifications are not possible, and
             * there is no administrator that can override the normal operation of this smart contract
             * instance. Note that if it is created with no admin keys, then there is no administrator
             * to authorize changing the admin keys, so there can never be any admin keys for that
             * instance.
             */
            public adminKey?: (proto.IKey|null);

            /** the current time at which this contract instance (and its account) is set to expire */
            public expirationTime?: (proto.ITimestamp|null);

            /**
             * the expiration time will extend every this many seconds. If there are insufficient funds,
             * then it extends as long as possible. If the account is empty when it expires, then it is
             * deleted.
             */
            public autoRenewPeriod?: (proto.IDuration|null);

            /**
             * number of bytes of storage being used by this instance (which affects the cost to extend
             * the expiration time)
             */
            public storage: Long;

            /** the memo associated with the contract (max 100 bytes) */
            public memo: string;

            /** The current balance, in tinybars */
            public balance: Long;

            /** Whether the contract has been deleted */
            public deleted: boolean;

            /** The tokens associated to the contract */
            public tokenRelationships: proto.ITokenRelationship[];

            /**
             * Creates a new ContractInfo instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ContractInfo instance
             */
            public static create(properties?: proto.ContractGetInfoResponse.IContractInfo): proto.ContractGetInfoResponse.ContractInfo;

            /**
             * Encodes the specified ContractInfo message. Does not implicitly {@link proto.ContractGetInfoResponse.ContractInfo.verify|verify} messages.
             * @param m ContractInfo message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: proto.ContractGetInfoResponse.IContractInfo, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ContractInfo message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns ContractInfo
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ContractGetInfoResponse.ContractInfo;
        }
    }

    /** Properties of a ContractGetBytecodeQuery. */
    interface IContractGetBytecodeQuery {

        /**
         * standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        header?: (proto.IQueryHeader|null);

        /** the contract for which information is requested */
        contractID?: (proto.IContractID|null);
    }

    /** Get the bytecode for a smart contract instance */
    class ContractGetBytecodeQuery implements IContractGetBytecodeQuery {

        /**
         * Constructs a new ContractGetBytecodeQuery.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IContractGetBytecodeQuery);

        /**
         * standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        public header?: (proto.IQueryHeader|null);

        /** the contract for which information is requested */
        public contractID?: (proto.IContractID|null);

        /**
         * Creates a new ContractGetBytecodeQuery instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ContractGetBytecodeQuery instance
         */
        public static create(properties?: proto.IContractGetBytecodeQuery): proto.ContractGetBytecodeQuery;

        /**
         * Encodes the specified ContractGetBytecodeQuery message. Does not implicitly {@link proto.ContractGetBytecodeQuery.verify|verify} messages.
         * @param m ContractGetBytecodeQuery message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IContractGetBytecodeQuery, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ContractGetBytecodeQuery message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ContractGetBytecodeQuery
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ContractGetBytecodeQuery;
    }

    /** Properties of a ContractGetBytecodeResponse. */
    interface IContractGetBytecodeResponse {

        /**
         * standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither
         */
        header?: (proto.IResponseHeader|null);

        /** the bytecode */
        bytecode?: (Uint8Array|null);
    }

    /** Response when the client sends the node ContractGetBytecodeQuery */
    class ContractGetBytecodeResponse implements IContractGetBytecodeResponse {

        /**
         * Constructs a new ContractGetBytecodeResponse.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IContractGetBytecodeResponse);

        /**
         * standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither
         */
        public header?: (proto.IResponseHeader|null);

        /** the bytecode */
        public bytecode: Uint8Array;

        /**
         * Creates a new ContractGetBytecodeResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ContractGetBytecodeResponse instance
         */
        public static create(properties?: proto.IContractGetBytecodeResponse): proto.ContractGetBytecodeResponse;

        /**
         * Encodes the specified ContractGetBytecodeResponse message. Does not implicitly {@link proto.ContractGetBytecodeResponse.verify|verify} messages.
         * @param m ContractGetBytecodeResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IContractGetBytecodeResponse, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ContractGetBytecodeResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ContractGetBytecodeResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ContractGetBytecodeResponse;
    }

    /** Properties of a ContractGetRecordsQuery. */
    interface IContractGetRecordsQuery {

        /** Standard info sent from client to node, including the signed payment, and what kind of response is requested (cost, state proof, both, or neither). */
        header?: (proto.IQueryHeader|null);

        /** The smart contract instance for which the records should be retrieved */
        contractID?: (proto.IContractID|null);
    }

    /** Before v0.9.0, requested records of all transactions against the given contract in the last 25 hours. */
    class ContractGetRecordsQuery implements IContractGetRecordsQuery {

        /**
         * Constructs a new ContractGetRecordsQuery.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IContractGetRecordsQuery);

        /** Standard info sent from client to node, including the signed payment, and what kind of response is requested (cost, state proof, both, or neither). */
        public header?: (proto.IQueryHeader|null);

        /** The smart contract instance for which the records should be retrieved */
        public contractID?: (proto.IContractID|null);

        /**
         * Creates a new ContractGetRecordsQuery instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ContractGetRecordsQuery instance
         */
        public static create(properties?: proto.IContractGetRecordsQuery): proto.ContractGetRecordsQuery;

        /**
         * Encodes the specified ContractGetRecordsQuery message. Does not implicitly {@link proto.ContractGetRecordsQuery.verify|verify} messages.
         * @param m ContractGetRecordsQuery message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IContractGetRecordsQuery, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ContractGetRecordsQuery message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ContractGetRecordsQuery
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ContractGetRecordsQuery;
    }

    /** Properties of a ContractGetRecordsResponse. */
    interface IContractGetRecordsResponse {

        /** Standard response from node to client, including the requested fields: cost, or state proof, or both, or neither */
        header?: (proto.IResponseHeader|null);

        /** The smart contract instance that this record is for */
        contractID?: (proto.IContractID|null);

        /** List of records, each with contractCreateResult or contractCallResult as its body */
        records?: (proto.ITransactionRecord[]|null);
    }

    /** Before v0.9.0, returned records of all transactions against the given contract in the last 25 hours. */
    class ContractGetRecordsResponse implements IContractGetRecordsResponse {

        /**
         * Constructs a new ContractGetRecordsResponse.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IContractGetRecordsResponse);

        /** Standard response from node to client, including the requested fields: cost, or state proof, or both, or neither */
        public header?: (proto.IResponseHeader|null);

        /** The smart contract instance that this record is for */
        public contractID?: (proto.IContractID|null);

        /** List of records, each with contractCreateResult or contractCallResult as its body */
        public records: proto.ITransactionRecord[];

        /**
         * Creates a new ContractGetRecordsResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ContractGetRecordsResponse instance
         */
        public static create(properties?: proto.IContractGetRecordsResponse): proto.ContractGetRecordsResponse;

        /**
         * Encodes the specified ContractGetRecordsResponse message. Does not implicitly {@link proto.ContractGetRecordsResponse.verify|verify} messages.
         * @param m ContractGetRecordsResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IContractGetRecordsResponse, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ContractGetRecordsResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ContractGetRecordsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ContractGetRecordsResponse;
    }

    /** Properties of a TransactionRecord. */
    interface ITransactionRecord {

        /**
         * The status (reach consensus, or failed, or is unknown) and the ID of any new
         * account/file/instance created.
         */
        receipt?: (proto.ITransactionReceipt|null);

        /**
         * The hash of the Transaction that executed (not the hash of any Transaction that failed for
         * having a duplicate TransactionID)
         */
        transactionHash?: (Uint8Array|null);

        /** The consensus timestamp (or null if didn't reach consensus yet) */
        consensusTimestamp?: (proto.ITimestamp|null);

        /** The ID of the transaction this record represents */
        transactionID?: (proto.ITransactionID|null);

        /** The memo that was submitted as part of the transaction (max 100 bytes) */
        memo?: (string|null);

        /**
         * The actual transaction fee charged, not the original transactionFee value from
         * TransactionBody
         */
        transactionFee?: (Long|null);

        /**
         * Record of the value returned by the smart contract function (if it completed and didn't
         * fail) from ContractCallTransaction
         */
        contractCallResult?: (proto.IContractFunctionResult|null);

        /**
         * Record of the value returned by the smart contract constructor (if it completed and
         * didn't fail) from ContractCreateTransaction
         */
        contractCreateResult?: (proto.IContractFunctionResult|null);

        /**
         * All hbar transfers as a result of this transaction, such as fees, or transfers performed by
         * the transaction, or by a smart contract it calls, or by the creation of threshold records
         * that it triggers.
         */
        transferList?: (proto.ITransferList|null);

        /** All Token transfers as a result of this transaction */
        tokenTransferLists?: (proto.ITokenTransferList[]|null);

        /** Reference to the scheduled transaction ID that this transaction record represent */
        scheduleRef?: (proto.IScheduleID|null);

        /**
         * All custom fees that were assessed during a CryptoTransfer, and must be paid if the
         * transaction status resolved to SUCCESS
         */
        assessedCustomFees?: (proto.IAssessedCustomFee[]|null);

        /** All token associations implicitly created while handling this transaction */
        automaticTokenAssociations?: (proto.ITokenAssociation[]|null);
    }

    /** Response when the client sends the node TransactionGetRecordResponse */
    class TransactionRecord implements ITransactionRecord {

        /**
         * Constructs a new TransactionRecord.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITransactionRecord);

        /**
         * The status (reach consensus, or failed, or is unknown) and the ID of any new
         * account/file/instance created.
         */
        public receipt?: (proto.ITransactionReceipt|null);

        /**
         * The hash of the Transaction that executed (not the hash of any Transaction that failed for
         * having a duplicate TransactionID)
         */
        public transactionHash: Uint8Array;

        /** The consensus timestamp (or null if didn't reach consensus yet) */
        public consensusTimestamp?: (proto.ITimestamp|null);

        /** The ID of the transaction this record represents */
        public transactionID?: (proto.ITransactionID|null);

        /** The memo that was submitted as part of the transaction (max 100 bytes) */
        public memo: string;

        /**
         * The actual transaction fee charged, not the original transactionFee value from
         * TransactionBody
         */
        public transactionFee: Long;

        /**
         * Record of the value returned by the smart contract function (if it completed and didn't
         * fail) from ContractCallTransaction
         */
        public contractCallResult?: (proto.IContractFunctionResult|null);

        /**
         * Record of the value returned by the smart contract constructor (if it completed and
         * didn't fail) from ContractCreateTransaction
         */
        public contractCreateResult?: (proto.IContractFunctionResult|null);

        /**
         * All hbar transfers as a result of this transaction, such as fees, or transfers performed by
         * the transaction, or by a smart contract it calls, or by the creation of threshold records
         * that it triggers.
         */
        public transferList?: (proto.ITransferList|null);

        /** All Token transfers as a result of this transaction */
        public tokenTransferLists: proto.ITokenTransferList[];

        /** Reference to the scheduled transaction ID that this transaction record represent */
        public scheduleRef?: (proto.IScheduleID|null);

        /**
         * All custom fees that were assessed during a CryptoTransfer, and must be paid if the
         * transaction status resolved to SUCCESS
         */
        public assessedCustomFees: proto.IAssessedCustomFee[];

        /** All token associations implicitly created while handling this transaction */
        public automaticTokenAssociations: proto.ITokenAssociation[];

        /** TransactionRecord body. */
        public body?: ("contractCallResult"|"contractCreateResult");

        /**
         * Creates a new TransactionRecord instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TransactionRecord instance
         */
        public static create(properties?: proto.ITransactionRecord): proto.TransactionRecord;

        /**
         * Encodes the specified TransactionRecord message. Does not implicitly {@link proto.TransactionRecord.verify|verify} messages.
         * @param m TransactionRecord message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITransactionRecord, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TransactionRecord message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TransactionRecord
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TransactionRecord;
    }

    /** Properties of a TransactionReceipt. */
    interface ITransactionReceipt {

        /**
         * The consensus status of the transaction; is UNKNOWN if consensus has not been reached, or if
         * the associated transaction did not have a valid payer signature
         */
        status?: (proto.ResponseCodeEnum|null);

        /** In the receipt of a CryptoCreate, the id of the newly created account */
        accountID?: (proto.IAccountID|null);

        /** In the receipt of a FileCreate, the id of the newly created file */
        fileID?: (proto.IFileID|null);

        /** In the receipt of a ContractCreate, the id of the newly created contract */
        contractID?: (proto.IContractID|null);

        /** The exchange rates in effect when the transaction reached consensus */
        exchangeRate?: (proto.IExchangeRateSet|null);

        /** In the receipt of a ConsensusCreateTopic, the id of the newly created topic. */
        topicID?: (proto.ITopicID|null);

        /**
         * In the receipt of a ConsensusSubmitMessage, the new sequence number of the topic that
         * received the message
         */
        topicSequenceNumber?: (Long|null);

        /**
         * In the receipt of a ConsensusSubmitMessage, the new running hash of the topic that received
         * the message.  This 48-byte field is the output of a particular SHA-384 digest whose input
         * data are determined by the value of the topicRunningHashVersion below. The bytes of each
         * uint64 or uint32 are to be in Big-Endian format.
         *
         * IF the topicRunningHashVersion is '0' or '1', then the input data to the SHA-384 digest are,
         * in order:
         * ---
         * 1. The previous running hash of the topic (48 bytes)
         * 2. The topic's shard (8 bytes)
         * 3. The topic's realm (8 bytes)
         * 4. The topic's number (8 bytes)
         * 5. The number of seconds since the epoch before the ConsensusSubmitMessage reached
         * consensus (8 bytes)
         * 6. The number of nanoseconds since 5. before the ConsensusSubmitMessage reached
         * consensus (4 bytes)
         * 7. The topicSequenceNumber from above (8 bytes)
         * 8. The message bytes from the ConsensusSubmitMessage (variable).
         *
         * IF the topicRunningHashVersion is '2', then the input data to the SHA-384 digest are, in
         * order:
         * ---
         * 1. The previous running hash of the topic (48 bytes)
         * 2. The topicRunningHashVersion below (8 bytes)
         * 3. The topic's shard (8 bytes)
         * 4. The topic's realm (8 bytes)
         * 5. The topic's number (8 bytes)
         * 6. The number of seconds since the epoch before the ConsensusSubmitMessage reached
         * consensus (8 bytes)
         * 7. The number of nanoseconds since 6. before the ConsensusSubmitMessage reached
         * consensus (4 bytes)
         * 8. The topicSequenceNumber from above (8 bytes)
         * 9. The output of the SHA-384 digest of the message bytes from the
         * consensusSubmitMessage (48 bytes)
         *
         * Otherwise, IF the topicRunningHashVersion is '3', then the input data to the SHA-384 digest
         * are, in order:
         * ---
         * 1. The previous running hash of the topic (48 bytes)
         * 2. The topicRunningHashVersion below (8 bytes)
         * 3. The payer account's shard (8 bytes)
         * 4. The payer account's realm (8 bytes)
         * 5. The payer account's number (8 bytes)
         * 6. The topic's shard (8 bytes)
         * 7. The topic's realm (8 bytes)
         * 8. The topic's number (8 bytes)
         * 9. The number of seconds since the epoch before the ConsensusSubmitMessage reached
         * consensus (8 bytes)
         * 10. The number of nanoseconds since 9. before the ConsensusSubmitMessage reached
         * consensus (4 bytes)
         * 11. The topicSequenceNumber from above (8 bytes)
         * 12. The output of the SHA-384 digest of the message bytes from the
         * consensusSubmitMessage (48 bytes)
         */
        topicRunningHash?: (Uint8Array|null);

        /**
         * In the receipt of a ConsensusSubmitMessage, the version of the SHA-384 digest used to update
         * the running hash.
         */
        topicRunningHashVersion?: (Long|null);

        /** In the receipt of a CreateToken, the id of the newly created token */
        tokenID?: (proto.ITokenID|null);

        /**
         * In the receipt of TokenMint, TokenWipe, TokenBurn, For fungible tokens - the current total
         * supply of this token. For non fungible tokens - the total number of NFTs issued for a given
         * tokenID
         */
        newTotalSupply?: (Long|null);

        /** In the receipt of a ScheduleCreate, the id of the newly created Scheduled Entity */
        scheduleID?: (proto.IScheduleID|null);

        /**
         * In the receipt of a ScheduleCreate or ScheduleSign that resolves to SUCCESS, the
         * TransactionID that should be used to query for the receipt or record of the relevant
         * scheduled transaction
         */
        scheduledTransactionID?: (proto.ITransactionID|null);

        /**
         * In the receipt of a TokenMint for tokens of type NON_FUNGIBLE_UNIQUE, the serial numbers of
         * the newly created NFTs
         */
        serialNumbers?: (Long[]|null);
    }

    /**
     * The summary of a transaction's result so far. If the transaction has not reached consensus, this
     * result will be necessarily incomplete.
     */
    class TransactionReceipt implements ITransactionReceipt {

        /**
         * Constructs a new TransactionReceipt.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITransactionReceipt);

        /**
         * The consensus status of the transaction; is UNKNOWN if consensus has not been reached, or if
         * the associated transaction did not have a valid payer signature
         */
        public status: proto.ResponseCodeEnum;

        /** In the receipt of a CryptoCreate, the id of the newly created account */
        public accountID?: (proto.IAccountID|null);

        /** In the receipt of a FileCreate, the id of the newly created file */
        public fileID?: (proto.IFileID|null);

        /** In the receipt of a ContractCreate, the id of the newly created contract */
        public contractID?: (proto.IContractID|null);

        /** The exchange rates in effect when the transaction reached consensus */
        public exchangeRate?: (proto.IExchangeRateSet|null);

        /** In the receipt of a ConsensusCreateTopic, the id of the newly created topic. */
        public topicID?: (proto.ITopicID|null);

        /**
         * In the receipt of a ConsensusSubmitMessage, the new sequence number of the topic that
         * received the message
         */
        public topicSequenceNumber: Long;

        /**
         * In the receipt of a ConsensusSubmitMessage, the new running hash of the topic that received
         * the message.  This 48-byte field is the output of a particular SHA-384 digest whose input
         * data are determined by the value of the topicRunningHashVersion below. The bytes of each
         * uint64 or uint32 are to be in Big-Endian format.
         *
         * IF the topicRunningHashVersion is '0' or '1', then the input data to the SHA-384 digest are,
         * in order:
         * ---
         * 1. The previous running hash of the topic (48 bytes)
         * 2. The topic's shard (8 bytes)
         * 3. The topic's realm (8 bytes)
         * 4. The topic's number (8 bytes)
         * 5. The number of seconds since the epoch before the ConsensusSubmitMessage reached
         * consensus (8 bytes)
         * 6. The number of nanoseconds since 5. before the ConsensusSubmitMessage reached
         * consensus (4 bytes)
         * 7. The topicSequenceNumber from above (8 bytes)
         * 8. The message bytes from the ConsensusSubmitMessage (variable).
         *
         * IF the topicRunningHashVersion is '2', then the input data to the SHA-384 digest are, in
         * order:
         * ---
         * 1. The previous running hash of the topic (48 bytes)
         * 2. The topicRunningHashVersion below (8 bytes)
         * 3. The topic's shard (8 bytes)
         * 4. The topic's realm (8 bytes)
         * 5. The topic's number (8 bytes)
         * 6. The number of seconds since the epoch before the ConsensusSubmitMessage reached
         * consensus (8 bytes)
         * 7. The number of nanoseconds since 6. before the ConsensusSubmitMessage reached
         * consensus (4 bytes)
         * 8. The topicSequenceNumber from above (8 bytes)
         * 9. The output of the SHA-384 digest of the message bytes from the
         * consensusSubmitMessage (48 bytes)
         *
         * Otherwise, IF the topicRunningHashVersion is '3', then the input data to the SHA-384 digest
         * are, in order:
         * ---
         * 1. The previous running hash of the topic (48 bytes)
         * 2. The topicRunningHashVersion below (8 bytes)
         * 3. The payer account's shard (8 bytes)
         * 4. The payer account's realm (8 bytes)
         * 5. The payer account's number (8 bytes)
         * 6. The topic's shard (8 bytes)
         * 7. The topic's realm (8 bytes)
         * 8. The topic's number (8 bytes)
         * 9. The number of seconds since the epoch before the ConsensusSubmitMessage reached
         * consensus (8 bytes)
         * 10. The number of nanoseconds since 9. before the ConsensusSubmitMessage reached
         * consensus (4 bytes)
         * 11. The topicSequenceNumber from above (8 bytes)
         * 12. The output of the SHA-384 digest of the message bytes from the
         * consensusSubmitMessage (48 bytes)
         */
        public topicRunningHash: Uint8Array;

        /**
         * In the receipt of a ConsensusSubmitMessage, the version of the SHA-384 digest used to update
         * the running hash.
         */
        public topicRunningHashVersion: Long;

        /** In the receipt of a CreateToken, the id of the newly created token */
        public tokenID?: (proto.ITokenID|null);

        /**
         * In the receipt of TokenMint, TokenWipe, TokenBurn, For fungible tokens - the current total
         * supply of this token. For non fungible tokens - the total number of NFTs issued for a given
         * tokenID
         */
        public newTotalSupply: Long;

        /** In the receipt of a ScheduleCreate, the id of the newly created Scheduled Entity */
        public scheduleID?: (proto.IScheduleID|null);

        /**
         * In the receipt of a ScheduleCreate or ScheduleSign that resolves to SUCCESS, the
         * TransactionID that should be used to query for the receipt or record of the relevant
         * scheduled transaction
         */
        public scheduledTransactionID?: (proto.ITransactionID|null);

        /**
         * In the receipt of a TokenMint for tokens of type NON_FUNGIBLE_UNIQUE, the serial numbers of
         * the newly created NFTs
         */
        public serialNumbers: Long[];

        /**
         * Creates a new TransactionReceipt instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TransactionReceipt instance
         */
        public static create(properties?: proto.ITransactionReceipt): proto.TransactionReceipt;

        /**
         * Encodes the specified TransactionReceipt message. Does not implicitly {@link proto.TransactionReceipt.verify|verify} messages.
         * @param m TransactionReceipt message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITransactionReceipt, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TransactionReceipt message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TransactionReceipt
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TransactionReceipt;
    }

    /** Properties of an ExchangeRate. */
    interface IExchangeRate {

        /** Denominator in calculation of exchange rate between hbar and cents */
        hbarEquiv?: (number|null);

        /** Numerator in calculation of exchange rate between hbar and cents */
        centEquiv?: (number|null);

        /** Expiration time in seconds for this exchange rate */
        expirationTime?: (proto.ITimestampSeconds|null);
    }

    /**
     * An exchange rate between hbar and cents (USD) and the time at which the exchange rate will
     * expire, and be superseded by a new exchange rate.
     */
    class ExchangeRate implements IExchangeRate {

        /**
         * Constructs a new ExchangeRate.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IExchangeRate);

        /** Denominator in calculation of exchange rate between hbar and cents */
        public hbarEquiv: number;

        /** Numerator in calculation of exchange rate between hbar and cents */
        public centEquiv: number;

        /** Expiration time in seconds for this exchange rate */
        public expirationTime?: (proto.ITimestampSeconds|null);

        /**
         * Creates a new ExchangeRate instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ExchangeRate instance
         */
        public static create(properties?: proto.IExchangeRate): proto.ExchangeRate;

        /**
         * Encodes the specified ExchangeRate message. Does not implicitly {@link proto.ExchangeRate.verify|verify} messages.
         * @param m ExchangeRate message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IExchangeRate, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an ExchangeRate message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ExchangeRate
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ExchangeRate;
    }

    /** Properties of an ExchangeRateSet. */
    interface IExchangeRateSet {

        /** Current exchange rate */
        currentRate?: (proto.IExchangeRate|null);

        /** Next exchange rate which will take effect when current rate expires */
        nextRate?: (proto.IExchangeRate|null);
    }

    /** Two sets of exchange rates */
    class ExchangeRateSet implements IExchangeRateSet {

        /**
         * Constructs a new ExchangeRateSet.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IExchangeRateSet);

        /** Current exchange rate */
        public currentRate?: (proto.IExchangeRate|null);

        /** Next exchange rate which will take effect when current rate expires */
        public nextRate?: (proto.IExchangeRate|null);

        /**
         * Creates a new ExchangeRateSet instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ExchangeRateSet instance
         */
        public static create(properties?: proto.IExchangeRateSet): proto.ExchangeRateSet;

        /**
         * Encodes the specified ExchangeRateSet message. Does not implicitly {@link proto.ExchangeRateSet.verify|verify} messages.
         * @param m ExchangeRateSet message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IExchangeRateSet, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an ExchangeRateSet message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ExchangeRateSet
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ExchangeRateSet;
    }

    /** Properties of a CryptoGetAccountBalanceQuery. */
    interface ICryptoGetAccountBalanceQuery {

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        header?: (proto.IQueryHeader|null);

        /** The account ID for which information is requested */
        accountID?: (proto.IAccountID|null);

        /** The account ID for which information is requested */
        contractID?: (proto.IContractID|null);
    }

    /**
     * Get the balance of a cryptocurrency account. This returns only the balance, so it is a smaller
     * reply than CryptoGetInfo, which returns the balance plus additional information.
     */
    class CryptoGetAccountBalanceQuery implements ICryptoGetAccountBalanceQuery {

        /**
         * Constructs a new CryptoGetAccountBalanceQuery.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ICryptoGetAccountBalanceQuery);

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        public header?: (proto.IQueryHeader|null);

        /** * The account ID for which information is requested */
        public accountID?: (proto.IAccountID|null);

        /** * The account ID for which information is requested */
        public contractID?: (proto.IContractID|null);

        /** CryptoGetAccountBalanceQuery balanceSource. */
        public balanceSource?: ("accountID"|"contractID");

        /**
         * Creates a new CryptoGetAccountBalanceQuery instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CryptoGetAccountBalanceQuery instance
         */
        public static create(properties?: proto.ICryptoGetAccountBalanceQuery): proto.CryptoGetAccountBalanceQuery;

        /**
         * Encodes the specified CryptoGetAccountBalanceQuery message. Does not implicitly {@link proto.CryptoGetAccountBalanceQuery.verify|verify} messages.
         * @param m CryptoGetAccountBalanceQuery message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ICryptoGetAccountBalanceQuery, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CryptoGetAccountBalanceQuery message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns CryptoGetAccountBalanceQuery
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.CryptoGetAccountBalanceQuery;
    }

    /** Properties of a CryptoGetAccountBalanceResponse. */
    interface ICryptoGetAccountBalanceResponse {

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither.
         */
        header?: (proto.IResponseHeader|null);

        /**
         * The account ID that is being described (this is useful with state proofs, for proving to a
         * third party)
         */
        accountID?: (proto.IAccountID|null);

        /** The current balance, in tinybars. */
        balance?: (Long|null);

        /** The token balances possessed by the target account. */
        tokenBalances?: (proto.ITokenBalance[]|null);
    }

    /** Response when the client sends the node CryptoGetAccountBalanceQuery */
    class CryptoGetAccountBalanceResponse implements ICryptoGetAccountBalanceResponse {

        /**
         * Constructs a new CryptoGetAccountBalanceResponse.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ICryptoGetAccountBalanceResponse);

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither.
         */
        public header?: (proto.IResponseHeader|null);

        /**
         * The account ID that is being described (this is useful with state proofs, for proving to a
         * third party)
         */
        public accountID?: (proto.IAccountID|null);

        /** The current balance, in tinybars. */
        public balance: Long;

        /** The token balances possessed by the target account. */
        public tokenBalances: proto.ITokenBalance[];

        /**
         * Creates a new CryptoGetAccountBalanceResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CryptoGetAccountBalanceResponse instance
         */
        public static create(properties?: proto.ICryptoGetAccountBalanceResponse): proto.CryptoGetAccountBalanceResponse;

        /**
         * Encodes the specified CryptoGetAccountBalanceResponse message. Does not implicitly {@link proto.CryptoGetAccountBalanceResponse.verify|verify} messages.
         * @param m CryptoGetAccountBalanceResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ICryptoGetAccountBalanceResponse, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CryptoGetAccountBalanceResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns CryptoGetAccountBalanceResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.CryptoGetAccountBalanceResponse;
    }

    /** Properties of a CryptoGetAccountRecordsQuery. */
    interface ICryptoGetAccountRecordsQuery {

        /** Standard info sent from client to node, including the signed payment, and what kind of response is requested (cost, state proof, both, or neither). */
        header?: (proto.IQueryHeader|null);

        /** The account ID for which the records should be retrieved */
        accountID?: (proto.IAccountID|null);
    }

    /** Requests records of all transactions for which the given account was the effective payer in the last 3 minutes of consensus time and <tt>ledger.keepRecordsInState=true</tt> was true during <tt>handleTransaction</tt>. */
    class CryptoGetAccountRecordsQuery implements ICryptoGetAccountRecordsQuery {

        /**
         * Constructs a new CryptoGetAccountRecordsQuery.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ICryptoGetAccountRecordsQuery);

        /** Standard info sent from client to node, including the signed payment, and what kind of response is requested (cost, state proof, both, or neither). */
        public header?: (proto.IQueryHeader|null);

        /** The account ID for which the records should be retrieved */
        public accountID?: (proto.IAccountID|null);

        /**
         * Creates a new CryptoGetAccountRecordsQuery instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CryptoGetAccountRecordsQuery instance
         */
        public static create(properties?: proto.ICryptoGetAccountRecordsQuery): proto.CryptoGetAccountRecordsQuery;

        /**
         * Encodes the specified CryptoGetAccountRecordsQuery message. Does not implicitly {@link proto.CryptoGetAccountRecordsQuery.verify|verify} messages.
         * @param m CryptoGetAccountRecordsQuery message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ICryptoGetAccountRecordsQuery, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CryptoGetAccountRecordsQuery message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns CryptoGetAccountRecordsQuery
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.CryptoGetAccountRecordsQuery;
    }

    /** Properties of a CryptoGetAccountRecordsResponse. */
    interface ICryptoGetAccountRecordsResponse {

        /** Standard response from node to client, including the requested fields: cost, or state proof, or both, or neither */
        header?: (proto.IResponseHeader|null);

        /** The account that this record is for */
        accountID?: (proto.IAccountID|null);

        /** List of records */
        records?: (proto.ITransactionRecord[]|null);
    }

    /** Returns records of all transactions for which the given account was the effective payer in the last 3 minutes of consensus time and <tt>ledger.keepRecordsInState=true</tt> was true during <tt>handleTransaction</tt>. */
    class CryptoGetAccountRecordsResponse implements ICryptoGetAccountRecordsResponse {

        /**
         * Constructs a new CryptoGetAccountRecordsResponse.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ICryptoGetAccountRecordsResponse);

        /** Standard response from node to client, including the requested fields: cost, or state proof, or both, or neither */
        public header?: (proto.IResponseHeader|null);

        /** The account that this record is for */
        public accountID?: (proto.IAccountID|null);

        /** List of records */
        public records: proto.ITransactionRecord[];

        /**
         * Creates a new CryptoGetAccountRecordsResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CryptoGetAccountRecordsResponse instance
         */
        public static create(properties?: proto.ICryptoGetAccountRecordsResponse): proto.CryptoGetAccountRecordsResponse;

        /**
         * Encodes the specified CryptoGetAccountRecordsResponse message. Does not implicitly {@link proto.CryptoGetAccountRecordsResponse.verify|verify} messages.
         * @param m CryptoGetAccountRecordsResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ICryptoGetAccountRecordsResponse, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CryptoGetAccountRecordsResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns CryptoGetAccountRecordsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.CryptoGetAccountRecordsResponse;
    }

    /** Properties of a CryptoGetInfoQuery. */
    interface ICryptoGetInfoQuery {

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        header?: (proto.IQueryHeader|null);

        /** The account ID for which information is requested */
        accountID?: (proto.IAccountID|null);
    }

    /**
     * Get all the information about an account, including the balance. This does not get the list of
     * account records.
     */
    class CryptoGetInfoQuery implements ICryptoGetInfoQuery {

        /**
         * Constructs a new CryptoGetInfoQuery.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ICryptoGetInfoQuery);

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        public header?: (proto.IQueryHeader|null);

        /** The account ID for which information is requested */
        public accountID?: (proto.IAccountID|null);

        /**
         * Creates a new CryptoGetInfoQuery instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CryptoGetInfoQuery instance
         */
        public static create(properties?: proto.ICryptoGetInfoQuery): proto.CryptoGetInfoQuery;

        /**
         * Encodes the specified CryptoGetInfoQuery message. Does not implicitly {@link proto.CryptoGetInfoQuery.verify|verify} messages.
         * @param m CryptoGetInfoQuery message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ICryptoGetInfoQuery, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CryptoGetInfoQuery message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns CryptoGetInfoQuery
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.CryptoGetInfoQuery;
    }

    /** Properties of a CryptoGetInfoResponse. */
    interface ICryptoGetInfoResponse {

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither
         */
        header?: (proto.IResponseHeader|null);

        /** Info about the account (a state proof can be generated for this) */
        accountInfo?: (proto.CryptoGetInfoResponse.IAccountInfo|null);
    }

    /** Response when the client sends the node CryptoGetInfoQuery */
    class CryptoGetInfoResponse implements ICryptoGetInfoResponse {

        /**
         * Constructs a new CryptoGetInfoResponse.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ICryptoGetInfoResponse);

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither
         */
        public header?: (proto.IResponseHeader|null);

        /** Info about the account (a state proof can be generated for this) */
        public accountInfo?: (proto.CryptoGetInfoResponse.IAccountInfo|null);

        /**
         * Creates a new CryptoGetInfoResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CryptoGetInfoResponse instance
         */
        public static create(properties?: proto.ICryptoGetInfoResponse): proto.CryptoGetInfoResponse;

        /**
         * Encodes the specified CryptoGetInfoResponse message. Does not implicitly {@link proto.CryptoGetInfoResponse.verify|verify} messages.
         * @param m CryptoGetInfoResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ICryptoGetInfoResponse, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CryptoGetInfoResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns CryptoGetInfoResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.CryptoGetInfoResponse;
    }

    namespace CryptoGetInfoResponse {

        /** Properties of an AccountInfo. */
        interface IAccountInfo {

            /** The account ID for which this information applies */
            accountID?: (proto.IAccountID|null);

            /**
             * The Contract Account ID comprising of both the contract instance and the cryptocurrency
             * account owned by the contract instance, in the format used by Solidity
             */
            contractAccountID?: (string|null);

            /**
             * If true, then this account has been deleted, it will disappear when it expires, and all
             * transactions for it will fail except the transaction to extend its expiration date
             */
            deleted?: (boolean|null);

            /**
             * The Account ID of the account to which this is proxy staked. If proxyAccountID is null,
             * or is an invalid account, or is an account that isn't a node, then this account is
             * automatically proxy staked to a node chosen by the network, but without earning payments.
             * If the proxyAccountID account refuses to accept proxy staking , or if it is not currently
             * running a node, then it will behave as if proxyAccountID was null.
             */
            proxyAccountID?: (proto.IAccountID|null);

            /** The total number of tinybars proxy staked to this account */
            proxyReceived?: (Long|null);

            /**
             * The key for the account, which must sign in order to transfer out, or to modify the
             * account in any way other than extending its expiration date.
             */
            key?: (proto.IKey|null);

            /** The current balance of account in tinybars */
            balance?: (Long|null);

            /**
             * [Deprecated]. The threshold amount, in tinybars, at which a record is created of any
             * transaction that decreases the balance of this account by more than the threshold
             */
            generateSendRecordThreshold?: (Long|null);

            /**
             * [Deprecated]. The threshold amount, in tinybars, at which a record is created of any
             * transaction that increases the balance of this account by more than the threshold
             */
            generateReceiveRecordThreshold?: (Long|null);

            /** If true, no transaction can transfer to this account unless signed by this account's key */
            receiverSigRequired?: (boolean|null);

            /** The TimeStamp time at which this account is set to expire */
            expirationTime?: (proto.ITimestamp|null);

            /**
             * The duration for expiration time will extend every this many seconds. If there are
             * insufficient funds, then it extends as long as possible. If it is empty when it expires,
             * then it is deleted.
             */
            autoRenewPeriod?: (proto.IDuration|null);

            /**
             * All of the livehashes attached to the account (each of which is a hash along with the
             * keys that authorized it and can delete it)
             */
            liveHashes?: (proto.ILiveHash[]|null);

            /** All tokens related to this account */
            tokenRelationships?: (proto.ITokenRelationship[]|null);

            /** The memo associated with the account */
            memo?: (string|null);

            /** The number of NFTs owned by this account */
            ownedNfts?: (Long|null);

            /** The maximum number of tokens that an Account can be implicitly associated with. */
            maxAutomaticTokenAssociations?: (number|null);
        }

        /** Represents an AccountInfo. */
        class AccountInfo implements IAccountInfo {

            /**
             * Constructs a new AccountInfo.
             * @param [p] Properties to set
             */
            constructor(p?: proto.CryptoGetInfoResponse.IAccountInfo);

            /** The account ID for which this information applies */
            public accountID?: (proto.IAccountID|null);

            /**
             * The Contract Account ID comprising of both the contract instance and the cryptocurrency
             * account owned by the contract instance, in the format used by Solidity
             */
            public contractAccountID: string;

            /**
             * If true, then this account has been deleted, it will disappear when it expires, and all
             * transactions for it will fail except the transaction to extend its expiration date
             */
            public deleted: boolean;

            /**
             * The Account ID of the account to which this is proxy staked. If proxyAccountID is null,
             * or is an invalid account, or is an account that isn't a node, then this account is
             * automatically proxy staked to a node chosen by the network, but without earning payments.
             * If the proxyAccountID account refuses to accept proxy staking , or if it is not currently
             * running a node, then it will behave as if proxyAccountID was null.
             */
            public proxyAccountID?: (proto.IAccountID|null);

            /** The total number of tinybars proxy staked to this account */
            public proxyReceived: Long;

            /**
             * The key for the account, which must sign in order to transfer out, or to modify the
             * account in any way other than extending its expiration date.
             */
            public key?: (proto.IKey|null);

            /** The current balance of account in tinybars */
            public balance: Long;

            /**
             * [Deprecated]. The threshold amount, in tinybars, at which a record is created of any
             * transaction that decreases the balance of this account by more than the threshold
             */
            public generateSendRecordThreshold: Long;

            /**
             * [Deprecated]. The threshold amount, in tinybars, at which a record is created of any
             * transaction that increases the balance of this account by more than the threshold
             */
            public generateReceiveRecordThreshold: Long;

            /** If true, no transaction can transfer to this account unless signed by this account's key */
            public receiverSigRequired: boolean;

            /** The TimeStamp time at which this account is set to expire */
            public expirationTime?: (proto.ITimestamp|null);

            /**
             * The duration for expiration time will extend every this many seconds. If there are
             * insufficient funds, then it extends as long as possible. If it is empty when it expires,
             * then it is deleted.
             */
            public autoRenewPeriod?: (proto.IDuration|null);

            /**
             * All of the livehashes attached to the account (each of which is a hash along with the
             * keys that authorized it and can delete it)
             */
            public liveHashes: proto.ILiveHash[];

            /** All tokens related to this account */
            public tokenRelationships: proto.ITokenRelationship[];

            /** The memo associated with the account */
            public memo: string;

            /** The number of NFTs owned by this account */
            public ownedNfts: Long;

            /** The maximum number of tokens that an Account can be implicitly associated with. */
            public maxAutomaticTokenAssociations: number;

            /**
             * Creates a new AccountInfo instance using the specified properties.
             * @param [properties] Properties to set
             * @returns AccountInfo instance
             */
            public static create(properties?: proto.CryptoGetInfoResponse.IAccountInfo): proto.CryptoGetInfoResponse.AccountInfo;

            /**
             * Encodes the specified AccountInfo message. Does not implicitly {@link proto.CryptoGetInfoResponse.AccountInfo.verify|verify} messages.
             * @param m AccountInfo message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: proto.CryptoGetInfoResponse.IAccountInfo, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an AccountInfo message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns AccountInfo
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.CryptoGetInfoResponse.AccountInfo;
        }
    }

    /** Properties of a CryptoGetLiveHashQuery. */
    interface ICryptoGetLiveHashQuery {

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        header?: (proto.IQueryHeader|null);

        /** The account to which the livehash is associated */
        accountID?: (proto.IAccountID|null);

        /** The SHA-384 data in the livehash */
        hash?: (Uint8Array|null);
    }

    /** Requests a livehash associated to an account. */
    class CryptoGetLiveHashQuery implements ICryptoGetLiveHashQuery {

        /**
         * Constructs a new CryptoGetLiveHashQuery.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ICryptoGetLiveHashQuery);

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        public header?: (proto.IQueryHeader|null);

        /** The account to which the livehash is associated */
        public accountID?: (proto.IAccountID|null);

        /** The SHA-384 data in the livehash */
        public hash: Uint8Array;

        /**
         * Creates a new CryptoGetLiveHashQuery instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CryptoGetLiveHashQuery instance
         */
        public static create(properties?: proto.ICryptoGetLiveHashQuery): proto.CryptoGetLiveHashQuery;

        /**
         * Encodes the specified CryptoGetLiveHashQuery message. Does not implicitly {@link proto.CryptoGetLiveHashQuery.verify|verify} messages.
         * @param m CryptoGetLiveHashQuery message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ICryptoGetLiveHashQuery, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CryptoGetLiveHashQuery message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns CryptoGetLiveHashQuery
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.CryptoGetLiveHashQuery;
    }

    /** Properties of a CryptoGetLiveHashResponse. */
    interface ICryptoGetLiveHashResponse {

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither
         */
        header?: (proto.IResponseHeader|null);

        /** The livehash, if present */
        liveHash?: (proto.ILiveHash|null);
    }

    /**
     * Returns the full livehash associated to an account, if it is present. Note that the only way to
     * obtain a state proof exhibiting the absence of a livehash from an account is to retrieve a state
     * proof of the entire account with its list of livehashes.
     */
    class CryptoGetLiveHashResponse implements ICryptoGetLiveHashResponse {

        /**
         * Constructs a new CryptoGetLiveHashResponse.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ICryptoGetLiveHashResponse);

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither
         */
        public header?: (proto.IResponseHeader|null);

        /** The livehash, if present */
        public liveHash?: (proto.ILiveHash|null);

        /**
         * Creates a new CryptoGetLiveHashResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CryptoGetLiveHashResponse instance
         */
        public static create(properties?: proto.ICryptoGetLiveHashResponse): proto.CryptoGetLiveHashResponse;

        /**
         * Encodes the specified CryptoGetLiveHashResponse message. Does not implicitly {@link proto.CryptoGetLiveHashResponse.verify|verify} messages.
         * @param m CryptoGetLiveHashResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ICryptoGetLiveHashResponse, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CryptoGetLiveHashResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns CryptoGetLiveHashResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.CryptoGetLiveHashResponse;
    }

    /** Properties of a CryptoGetStakersQuery. */
    interface ICryptoGetStakersQuery {

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        header?: (proto.IQueryHeader|null);

        /** The Account ID for which the records should be retrieved */
        accountID?: (proto.IAccountID|null);
    }

    /**
     * Get all the accounts that are proxy staking to this account. For each of them, give the amount
     * currently staked. This is not yet implemented, but will be in a future version of the API.
     */
    class CryptoGetStakersQuery implements ICryptoGetStakersQuery {

        /**
         * Constructs a new CryptoGetStakersQuery.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ICryptoGetStakersQuery);

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        public header?: (proto.IQueryHeader|null);

        /** The Account ID for which the records should be retrieved */
        public accountID?: (proto.IAccountID|null);

        /**
         * Creates a new CryptoGetStakersQuery instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CryptoGetStakersQuery instance
         */
        public static create(properties?: proto.ICryptoGetStakersQuery): proto.CryptoGetStakersQuery;

        /**
         * Encodes the specified CryptoGetStakersQuery message. Does not implicitly {@link proto.CryptoGetStakersQuery.verify|verify} messages.
         * @param m CryptoGetStakersQuery message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ICryptoGetStakersQuery, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CryptoGetStakersQuery message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns CryptoGetStakersQuery
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.CryptoGetStakersQuery;
    }

    /** Properties of a ProxyStaker. */
    interface IProxyStaker {

        /** The Account ID that is proxy staking */
        accountID?: (proto.IAccountID|null);

        /** The number of hbars that are currently proxy staked */
        amount?: (Long|null);
    }

    /** information about a single account that is proxy staking */
    class ProxyStaker implements IProxyStaker {

        /**
         * Constructs a new ProxyStaker.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IProxyStaker);

        /** The Account ID that is proxy staking */
        public accountID?: (proto.IAccountID|null);

        /** The number of hbars that are currently proxy staked */
        public amount: Long;

        /**
         * Creates a new ProxyStaker instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ProxyStaker instance
         */
        public static create(properties?: proto.IProxyStaker): proto.ProxyStaker;

        /**
         * Encodes the specified ProxyStaker message. Does not implicitly {@link proto.ProxyStaker.verify|verify} messages.
         * @param m ProxyStaker message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IProxyStaker, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ProxyStaker message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ProxyStaker
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ProxyStaker;
    }

    /** Properties of an AllProxyStakers. */
    interface IAllProxyStakers {

        /** The Account ID that is being proxy staked to */
        accountID?: (proto.IAccountID|null);

        /** Each of the proxy staking accounts, and the amount they are proxy staking */
        proxyStaker?: (proto.IProxyStaker[]|null);
    }

    /** all of the accounts proxy staking to a given account, and the amounts proxy staked */
    class AllProxyStakers implements IAllProxyStakers {

        /**
         * Constructs a new AllProxyStakers.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IAllProxyStakers);

        /** The Account ID that is being proxy staked to */
        public accountID?: (proto.IAccountID|null);

        /** Each of the proxy staking accounts, and the amount they are proxy staking */
        public proxyStaker: proto.IProxyStaker[];

        /**
         * Creates a new AllProxyStakers instance using the specified properties.
         * @param [properties] Properties to set
         * @returns AllProxyStakers instance
         */
        public static create(properties?: proto.IAllProxyStakers): proto.AllProxyStakers;

        /**
         * Encodes the specified AllProxyStakers message. Does not implicitly {@link proto.AllProxyStakers.verify|verify} messages.
         * @param m AllProxyStakers message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IAllProxyStakers, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an AllProxyStakers message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns AllProxyStakers
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.AllProxyStakers;
    }

    /** Properties of a CryptoGetStakersResponse. */
    interface ICryptoGetStakersResponse {

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither
         */
        header?: (proto.IResponseHeader|null);

        /**
         * List of accounts proxy staking to this account, and the amount each is currently proxy
         * staking
         */
        stakers?: (proto.IAllProxyStakers|null);
    }

    /** Response when the client sends the node CryptoGetStakersQuery */
    class CryptoGetStakersResponse implements ICryptoGetStakersResponse {

        /**
         * Constructs a new CryptoGetStakersResponse.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ICryptoGetStakersResponse);

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither
         */
        public header?: (proto.IResponseHeader|null);

        /**
         * List of accounts proxy staking to this account, and the amount each is currently proxy
         * staking
         */
        public stakers?: (proto.IAllProxyStakers|null);

        /**
         * Creates a new CryptoGetStakersResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CryptoGetStakersResponse instance
         */
        public static create(properties?: proto.ICryptoGetStakersResponse): proto.CryptoGetStakersResponse;

        /**
         * Encodes the specified CryptoGetStakersResponse message. Does not implicitly {@link proto.CryptoGetStakersResponse.verify|verify} messages.
         * @param m CryptoGetStakersResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ICryptoGetStakersResponse, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CryptoGetStakersResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns CryptoGetStakersResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.CryptoGetStakersResponse;
    }

    /** Properties of a FileGetContentsQuery. */
    interface IFileGetContentsQuery {

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        header?: (proto.IQueryHeader|null);

        /** The file ID of the file whose contents are requested */
        fileID?: (proto.IFileID|null);
    }

    /** Get the contents of a file. The content field is empty (no bytes) if the file is empty. */
    class FileGetContentsQuery implements IFileGetContentsQuery {

        /**
         * Constructs a new FileGetContentsQuery.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IFileGetContentsQuery);

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        public header?: (proto.IQueryHeader|null);

        /** The file ID of the file whose contents are requested */
        public fileID?: (proto.IFileID|null);

        /**
         * Creates a new FileGetContentsQuery instance using the specified properties.
         * @param [properties] Properties to set
         * @returns FileGetContentsQuery instance
         */
        public static create(properties?: proto.IFileGetContentsQuery): proto.FileGetContentsQuery;

        /**
         * Encodes the specified FileGetContentsQuery message. Does not implicitly {@link proto.FileGetContentsQuery.verify|verify} messages.
         * @param m FileGetContentsQuery message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IFileGetContentsQuery, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a FileGetContentsQuery message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns FileGetContentsQuery
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.FileGetContentsQuery;
    }

    /** Properties of a FileGetContentsResponse. */
    interface IFileGetContentsResponse {

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither
         */
        header?: (proto.IResponseHeader|null);

        /** the file ID and contents (a state proof can be generated for this) */
        fileContents?: (proto.FileGetContentsResponse.IFileContents|null);
    }

    /** Response when the client sends the node FileGetContentsQuery */
    class FileGetContentsResponse implements IFileGetContentsResponse {

        /**
         * Constructs a new FileGetContentsResponse.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IFileGetContentsResponse);

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither
         */
        public header?: (proto.IResponseHeader|null);

        /** the file ID and contents (a state proof can be generated for this) */
        public fileContents?: (proto.FileGetContentsResponse.IFileContents|null);

        /**
         * Creates a new FileGetContentsResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns FileGetContentsResponse instance
         */
        public static create(properties?: proto.IFileGetContentsResponse): proto.FileGetContentsResponse;

        /**
         * Encodes the specified FileGetContentsResponse message. Does not implicitly {@link proto.FileGetContentsResponse.verify|verify} messages.
         * @param m FileGetContentsResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IFileGetContentsResponse, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a FileGetContentsResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns FileGetContentsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.FileGetContentsResponse;
    }

    namespace FileGetContentsResponse {

        /** Properties of a FileContents. */
        interface IFileContents {

            /** The file ID of the file whose contents are being returned */
            fileID?: (proto.IFileID|null);

            /** The bytes contained in the file */
            contents?: (Uint8Array|null);
        }

        /** Represents a FileContents. */
        class FileContents implements IFileContents {

            /**
             * Constructs a new FileContents.
             * @param [p] Properties to set
             */
            constructor(p?: proto.FileGetContentsResponse.IFileContents);

            /** The file ID of the file whose contents are being returned */
            public fileID?: (proto.IFileID|null);

            /** The bytes contained in the file */
            public contents: Uint8Array;

            /**
             * Creates a new FileContents instance using the specified properties.
             * @param [properties] Properties to set
             * @returns FileContents instance
             */
            public static create(properties?: proto.FileGetContentsResponse.IFileContents): proto.FileGetContentsResponse.FileContents;

            /**
             * Encodes the specified FileContents message. Does not implicitly {@link proto.FileGetContentsResponse.FileContents.verify|verify} messages.
             * @param m FileContents message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: proto.FileGetContentsResponse.IFileContents, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a FileContents message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns FileContents
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.FileGetContentsResponse.FileContents;
        }
    }

    /** Properties of a FileGetInfoQuery. */
    interface IFileGetInfoQuery {

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        header?: (proto.IQueryHeader|null);

        /** The file ID of the file for which information is requested */
        fileID?: (proto.IFileID|null);
    }

    /**
     * Get all of the information about a file, except for its contents. When a file expires, it no
     * longer exists, and there will be no info about it, and the fileInfo field will be blank. If a
     * transaction or smart contract deletes the file, but it has not yet expired, then the fileInfo
     * field will be non-empty, the deleted field will be true, its size will be 0, and its contents
     * will be empty.
     */
    class FileGetInfoQuery implements IFileGetInfoQuery {

        /**
         * Constructs a new FileGetInfoQuery.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IFileGetInfoQuery);

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        public header?: (proto.IQueryHeader|null);

        /** The file ID of the file for which information is requested */
        public fileID?: (proto.IFileID|null);

        /**
         * Creates a new FileGetInfoQuery instance using the specified properties.
         * @param [properties] Properties to set
         * @returns FileGetInfoQuery instance
         */
        public static create(properties?: proto.IFileGetInfoQuery): proto.FileGetInfoQuery;

        /**
         * Encodes the specified FileGetInfoQuery message. Does not implicitly {@link proto.FileGetInfoQuery.verify|verify} messages.
         * @param m FileGetInfoQuery message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IFileGetInfoQuery, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a FileGetInfoQuery message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns FileGetInfoQuery
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.FileGetInfoQuery;
    }

    /** Properties of a FileGetInfoResponse. */
    interface IFileGetInfoResponse {

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither
         */
        header?: (proto.IResponseHeader|null);

        /** The information about the file */
        fileInfo?: (proto.FileGetInfoResponse.IFileInfo|null);
    }

    /** Response when the client sends the node FileGetInfoQuery */
    class FileGetInfoResponse implements IFileGetInfoResponse {

        /**
         * Constructs a new FileGetInfoResponse.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IFileGetInfoResponse);

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither
         */
        public header?: (proto.IResponseHeader|null);

        /** The information about the file */
        public fileInfo?: (proto.FileGetInfoResponse.IFileInfo|null);

        /**
         * Creates a new FileGetInfoResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns FileGetInfoResponse instance
         */
        public static create(properties?: proto.IFileGetInfoResponse): proto.FileGetInfoResponse;

        /**
         * Encodes the specified FileGetInfoResponse message. Does not implicitly {@link proto.FileGetInfoResponse.verify|verify} messages.
         * @param m FileGetInfoResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IFileGetInfoResponse, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a FileGetInfoResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns FileGetInfoResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.FileGetInfoResponse;
    }

    namespace FileGetInfoResponse {

        /** Properties of a FileInfo. */
        interface IFileInfo {

            /** The file ID of the file for which information is requested */
            fileID?: (proto.IFileID|null);

            /** Number of bytes in contents */
            size?: (Long|null);

            /** The current time at which this account is set to expire */
            expirationTime?: (proto.ITimestamp|null);

            /** True if deleted but not yet expired */
            deleted?: (boolean|null);

            /** One of these keys must sign in order to modify or delete the file */
            keys?: (proto.IKeyList|null);

            /** The memo associated with the file */
            memo?: (string|null);
        }

        /** Represents a FileInfo. */
        class FileInfo implements IFileInfo {

            /**
             * Constructs a new FileInfo.
             * @param [p] Properties to set
             */
            constructor(p?: proto.FileGetInfoResponse.IFileInfo);

            /** The file ID of the file for which information is requested */
            public fileID?: (proto.IFileID|null);

            /** Number of bytes in contents */
            public size: Long;

            /** The current time at which this account is set to expire */
            public expirationTime?: (proto.ITimestamp|null);

            /** True if deleted but not yet expired */
            public deleted: boolean;

            /** One of these keys must sign in order to modify or delete the file */
            public keys?: (proto.IKeyList|null);

            /** The memo associated with the file */
            public memo: string;

            /**
             * Creates a new FileInfo instance using the specified properties.
             * @param [properties] Properties to set
             * @returns FileInfo instance
             */
            public static create(properties?: proto.FileGetInfoResponse.IFileInfo): proto.FileGetInfoResponse.FileInfo;

            /**
             * Encodes the specified FileInfo message. Does not implicitly {@link proto.FileGetInfoResponse.FileInfo.verify|verify} messages.
             * @param m FileInfo message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: proto.FileGetInfoResponse.IFileInfo, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a FileInfo message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns FileInfo
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.FileGetInfoResponse.FileInfo;
        }
    }

    /** Properties of a TransactionGetReceiptQuery. */
    interface ITransactionGetReceiptQuery {

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        header?: (proto.IQueryHeader|null);

        /** The ID of the transaction for which the receipt is requested. */
        transactionID?: (proto.ITransactionID|null);

        /**
         * Whether receipts of processing duplicate transactions should be returned along with the
         * receipt of processing the first consensus transaction with the given id whose status was
         * neither <tt>INVALID_NODE_ACCOUNT</tt> nor <tt>INVALID_PAYER_SIGNATURE</tt>; <b>or</b>, if no
         * such receipt exists, the receipt of processing the first transaction to reach consensus with
         * the given transaction id..
         */
        includeDuplicates?: (boolean|null);
    }

    /**
     * Get the receipt of a transaction, given its transaction ID. Once a transaction reaches consensus,
     * then information about whether it succeeded or failed will be available until the end of the
     * receipt period.  Before and after the receipt period, and for a transaction that was never
     * submitted, the receipt is unknown.  This query is free (the payment field is left empty). No
     * State proof is available for this response
     */
    class TransactionGetReceiptQuery implements ITransactionGetReceiptQuery {

        /**
         * Constructs a new TransactionGetReceiptQuery.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITransactionGetReceiptQuery);

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        public header?: (proto.IQueryHeader|null);

        /** The ID of the transaction for which the receipt is requested. */
        public transactionID?: (proto.ITransactionID|null);

        /**
         * Whether receipts of processing duplicate transactions should be returned along with the
         * receipt of processing the first consensus transaction with the given id whose status was
         * neither <tt>INVALID_NODE_ACCOUNT</tt> nor <tt>INVALID_PAYER_SIGNATURE</tt>; <b>or</b>, if no
         * such receipt exists, the receipt of processing the first transaction to reach consensus with
         * the given transaction id..
         */
        public includeDuplicates: boolean;

        /**
         * Creates a new TransactionGetReceiptQuery instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TransactionGetReceiptQuery instance
         */
        public static create(properties?: proto.ITransactionGetReceiptQuery): proto.TransactionGetReceiptQuery;

        /**
         * Encodes the specified TransactionGetReceiptQuery message. Does not implicitly {@link proto.TransactionGetReceiptQuery.verify|verify} messages.
         * @param m TransactionGetReceiptQuery message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITransactionGetReceiptQuery, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TransactionGetReceiptQuery message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TransactionGetReceiptQuery
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TransactionGetReceiptQuery;
    }

    /** Properties of a TransactionGetReceiptResponse. */
    interface ITransactionGetReceiptResponse {

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither
         */
        header?: (proto.IResponseHeader|null);

        /**
         * Either the receipt of processing the first consensus transaction with the given id whose
         * status was neither <tt>INVALID_NODE_ACCOUNT</tt> nor <tt>INVALID_PAYER_SIGNATURE</tt>;
         * <b>or</b>, if no such receipt exists, the receipt of processing the first transaction to
         * reach consensus with the given transaction id.
         */
        receipt?: (proto.ITransactionReceipt|null);

        /**
         * The receipts of processing all consensus transaction with the same id as the distinguished
         * receipt above, in chronological order.
         */
        duplicateTransactionReceipts?: (proto.ITransactionReceipt[]|null);
    }

    /**
     * Response when the client sends the node TransactionGetReceiptQuery. If it created a new entity
     * (account, file, or smart contract instance) then one of the three ID fields will be filled in
     * with the ID of the new entity. Sometimes a single transaction will create more than one new
     * entity, such as when a new contract instance is created, and this also creates the new account
     * that it owned by that instance. No State proof is available for this response
     */
    class TransactionGetReceiptResponse implements ITransactionGetReceiptResponse {

        /**
         * Constructs a new TransactionGetReceiptResponse.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITransactionGetReceiptResponse);

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither
         */
        public header?: (proto.IResponseHeader|null);

        /**
         * Either the receipt of processing the first consensus transaction with the given id whose
         * status was neither <tt>INVALID_NODE_ACCOUNT</tt> nor <tt>INVALID_PAYER_SIGNATURE</tt>;
         * <b>or</b>, if no such receipt exists, the receipt of processing the first transaction to
         * reach consensus with the given transaction id.
         */
        public receipt?: (proto.ITransactionReceipt|null);

        /**
         * The receipts of processing all consensus transaction with the same id as the distinguished
         * receipt above, in chronological order.
         */
        public duplicateTransactionReceipts: proto.ITransactionReceipt[];

        /**
         * Creates a new TransactionGetReceiptResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TransactionGetReceiptResponse instance
         */
        public static create(properties?: proto.ITransactionGetReceiptResponse): proto.TransactionGetReceiptResponse;

        /**
         * Encodes the specified TransactionGetReceiptResponse message. Does not implicitly {@link proto.TransactionGetReceiptResponse.verify|verify} messages.
         * @param m TransactionGetReceiptResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITransactionGetReceiptResponse, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TransactionGetReceiptResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TransactionGetReceiptResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TransactionGetReceiptResponse;
    }

    /** Properties of a TransactionGetRecordQuery. */
    interface ITransactionGetRecordQuery {

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        header?: (proto.IQueryHeader|null);

        /** The ID of the transaction for which the record is requested. */
        transactionID?: (proto.ITransactionID|null);

        /**
         * Whether records of processing duplicate transactions should be returned along with the record
         * of processing the first consensus transaction with the given id whose status was neither
         * <tt>INVALID_NODE_ACCOUNT</tt> nor <tt>INVALID_PAYER_SIGNATURE</tt>; <b>or</b>, if no such
         * record exists, the record of processing the first transaction to reach consensus with the
         * given transaction id..
         */
        includeDuplicates?: (boolean|null);
    }

    /**
     * Get the record for a transaction. If the transaction requested a record, then the record lasts
     * for one hour, and a state proof is available for it. If the transaction created an account, file,
     * or smart contract instance, then the record will contain the ID for what it created. If the
     * transaction called a smart contract function, then the record contains the result of that call.
     * If the transaction was a cryptocurrency transfer, then the record includes the TransferList which
     * gives the details of that transfer. If the transaction didn't return anything that should be in
     * the record, then the results field will be set to nothing.
     */
    class TransactionGetRecordQuery implements ITransactionGetRecordQuery {

        /**
         * Constructs a new TransactionGetRecordQuery.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITransactionGetRecordQuery);

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        public header?: (proto.IQueryHeader|null);

        /** The ID of the transaction for which the record is requested. */
        public transactionID?: (proto.ITransactionID|null);

        /**
         * Whether records of processing duplicate transactions should be returned along with the record
         * of processing the first consensus transaction with the given id whose status was neither
         * <tt>INVALID_NODE_ACCOUNT</tt> nor <tt>INVALID_PAYER_SIGNATURE</tt>; <b>or</b>, if no such
         * record exists, the record of processing the first transaction to reach consensus with the
         * given transaction id..
         */
        public includeDuplicates: boolean;

        /**
         * Creates a new TransactionGetRecordQuery instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TransactionGetRecordQuery instance
         */
        public static create(properties?: proto.ITransactionGetRecordQuery): proto.TransactionGetRecordQuery;

        /**
         * Encodes the specified TransactionGetRecordQuery message. Does not implicitly {@link proto.TransactionGetRecordQuery.verify|verify} messages.
         * @param m TransactionGetRecordQuery message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITransactionGetRecordQuery, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TransactionGetRecordQuery message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TransactionGetRecordQuery
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TransactionGetRecordQuery;
    }

    /** Properties of a TransactionGetRecordResponse. */
    interface ITransactionGetRecordResponse {

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither.
         */
        header?: (proto.IResponseHeader|null);

        /**
         * Either the record of processing the first consensus transaction with the given id whose
         * status was neither <tt>INVALID_NODE_ACCOUNT</tt> nor <tt>INVALID_PAYER_SIGNATURE</tt>;
         * <b>or</b>, if no such record exists, the record of processing the first transaction to reach
         * consensus with the given transaction id.
         */
        transactionRecord?: (proto.ITransactionRecord|null);

        /**
         * The records of processing all consensus transaction with the same id as the distinguished
         * record above, in chronological order.
         */
        duplicateTransactionRecords?: (proto.ITransactionRecord[]|null);
    }

    /** Response when the client sends the node TransactionGetRecordQuery */
    class TransactionGetRecordResponse implements ITransactionGetRecordResponse {

        /**
         * Constructs a new TransactionGetRecordResponse.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITransactionGetRecordResponse);

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither.
         */
        public header?: (proto.IResponseHeader|null);

        /**
         * Either the record of processing the first consensus transaction with the given id whose
         * status was neither <tt>INVALID_NODE_ACCOUNT</tt> nor <tt>INVALID_PAYER_SIGNATURE</tt>;
         * <b>or</b>, if no such record exists, the record of processing the first transaction to reach
         * consensus with the given transaction id.
         */
        public transactionRecord?: (proto.ITransactionRecord|null);

        /**
         * The records of processing all consensus transaction with the same id as the distinguished
         * record above, in chronological order.
         */
        public duplicateTransactionRecords: proto.ITransactionRecord[];

        /**
         * Creates a new TransactionGetRecordResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TransactionGetRecordResponse instance
         */
        public static create(properties?: proto.ITransactionGetRecordResponse): proto.TransactionGetRecordResponse;

        /**
         * Encodes the specified TransactionGetRecordResponse message. Does not implicitly {@link proto.TransactionGetRecordResponse.verify|verify} messages.
         * @param m TransactionGetRecordResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITransactionGetRecordResponse, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TransactionGetRecordResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TransactionGetRecordResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TransactionGetRecordResponse;
    }

    /** Properties of a TransactionGetFastRecordQuery. */
    interface ITransactionGetFastRecordQuery {

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        header?: (proto.IQueryHeader|null);

        /** The ID of the transaction for which the record is requested. */
        transactionID?: (proto.ITransactionID|null);
    }

    /**
     * Get the tx record of a transaction, given its transaction ID. Once a transaction reaches
     * consensus, then information about whether it succeeded or failed will be available until the end
     * of the receipt period.  Before and after the receipt period, and for a transaction that was never
     * submitted, the receipt is unknown.  This query is free (the payment field is left empty).
     */
    class TransactionGetFastRecordQuery implements ITransactionGetFastRecordQuery {

        /**
         * Constructs a new TransactionGetFastRecordQuery.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITransactionGetFastRecordQuery);

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        public header?: (proto.IQueryHeader|null);

        /** The ID of the transaction for which the record is requested. */
        public transactionID?: (proto.ITransactionID|null);

        /**
         * Creates a new TransactionGetFastRecordQuery instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TransactionGetFastRecordQuery instance
         */
        public static create(properties?: proto.ITransactionGetFastRecordQuery): proto.TransactionGetFastRecordQuery;

        /**
         * Encodes the specified TransactionGetFastRecordQuery message. Does not implicitly {@link proto.TransactionGetFastRecordQuery.verify|verify} messages.
         * @param m TransactionGetFastRecordQuery message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITransactionGetFastRecordQuery, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TransactionGetFastRecordQuery message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TransactionGetFastRecordQuery
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TransactionGetFastRecordQuery;
    }

    /** Properties of a TransactionGetFastRecordResponse. */
    interface ITransactionGetFastRecordResponse {

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither
         */
        header?: (proto.IResponseHeader|null);

        /** The requested transaction records */
        transactionRecord?: (proto.ITransactionRecord|null);
    }

    /**
     * Response when the client sends the node TransactionGetFastRecordQuery. If it created a new entity
     * (account, file, or smart contract instance) then one of the three ID fields will be filled in
     * with the ID of the new entity. Sometimes a single transaction will create more than one new
     * entity, such as when a new contract instance is created, and this also creates the new account
     * that it owned by that instance.
     */
    class TransactionGetFastRecordResponse implements ITransactionGetFastRecordResponse {

        /**
         * Constructs a new TransactionGetFastRecordResponse.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITransactionGetFastRecordResponse);

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither
         */
        public header?: (proto.IResponseHeader|null);

        /** The requested transaction records */
        public transactionRecord?: (proto.ITransactionRecord|null);

        /**
         * Creates a new TransactionGetFastRecordResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TransactionGetFastRecordResponse instance
         */
        public static create(properties?: proto.ITransactionGetFastRecordResponse): proto.TransactionGetFastRecordResponse;

        /**
         * Encodes the specified TransactionGetFastRecordResponse message. Does not implicitly {@link proto.TransactionGetFastRecordResponse.verify|verify} messages.
         * @param m TransactionGetFastRecordResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITransactionGetFastRecordResponse, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TransactionGetFastRecordResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TransactionGetFastRecordResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TransactionGetFastRecordResponse;
    }

    /** Properties of a NetworkGetVersionInfoQuery. */
    interface INetworkGetVersionInfoQuery {

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        header?: (proto.IQueryHeader|null);
    }

    /** Get the deployed versions of Hedera Services and the HAPI proto in semantic version format */
    class NetworkGetVersionInfoQuery implements INetworkGetVersionInfoQuery {

        /**
         * Constructs a new NetworkGetVersionInfoQuery.
         * @param [p] Properties to set
         */
        constructor(p?: proto.INetworkGetVersionInfoQuery);

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        public header?: (proto.IQueryHeader|null);

        /**
         * Creates a new NetworkGetVersionInfoQuery instance using the specified properties.
         * @param [properties] Properties to set
         * @returns NetworkGetVersionInfoQuery instance
         */
        public static create(properties?: proto.INetworkGetVersionInfoQuery): proto.NetworkGetVersionInfoQuery;

        /**
         * Encodes the specified NetworkGetVersionInfoQuery message. Does not implicitly {@link proto.NetworkGetVersionInfoQuery.verify|verify} messages.
         * @param m NetworkGetVersionInfoQuery message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.INetworkGetVersionInfoQuery, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a NetworkGetVersionInfoQuery message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns NetworkGetVersionInfoQuery
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.NetworkGetVersionInfoQuery;
    }

    /** Properties of a NetworkGetVersionInfoResponse. */
    interface INetworkGetVersionInfoResponse {

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither
         */
        header?: (proto.IResponseHeader|null);

        /** The Hedera API (HAPI) protobuf version recognized by the responding node. */
        hapiProtoVersion?: (proto.ISemanticVersion|null);

        /** The version of the Hedera Services software deployed on the responding node. */
        hederaServicesVersion?: (proto.ISemanticVersion|null);
    }

    /** Response when the client sends the node NetworkGetVersionInfoQuery */
    class NetworkGetVersionInfoResponse implements INetworkGetVersionInfoResponse {

        /**
         * Constructs a new NetworkGetVersionInfoResponse.
         * @param [p] Properties to set
         */
        constructor(p?: proto.INetworkGetVersionInfoResponse);

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither
         */
        public header?: (proto.IResponseHeader|null);

        /** The Hedera API (HAPI) protobuf version recognized by the responding node. */
        public hapiProtoVersion?: (proto.ISemanticVersion|null);

        /** The version of the Hedera Services software deployed on the responding node. */
        public hederaServicesVersion?: (proto.ISemanticVersion|null);

        /**
         * Creates a new NetworkGetVersionInfoResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns NetworkGetVersionInfoResponse instance
         */
        public static create(properties?: proto.INetworkGetVersionInfoResponse): proto.NetworkGetVersionInfoResponse;

        /**
         * Encodes the specified NetworkGetVersionInfoResponse message. Does not implicitly {@link proto.NetworkGetVersionInfoResponse.verify|verify} messages.
         * @param m NetworkGetVersionInfoResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.INetworkGetVersionInfoResponse, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a NetworkGetVersionInfoResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns NetworkGetVersionInfoResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.NetworkGetVersionInfoResponse;
    }

    /** Properties of a TokenGetInfoQuery. */
    interface ITokenGetInfoQuery {

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither)
         */
        header?: (proto.IQueryHeader|null);

        /**
         * The token for which information is requested. If invalid token is provided, INVALID_TOKEN_ID
         * response is returned.
         */
        token?: (proto.ITokenID|null);
    }

    /** Gets information about Token instance */
    class TokenGetInfoQuery implements ITokenGetInfoQuery {

        /**
         * Constructs a new TokenGetInfoQuery.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITokenGetInfoQuery);

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither)
         */
        public header?: (proto.IQueryHeader|null);

        /**
         * The token for which information is requested. If invalid token is provided, INVALID_TOKEN_ID
         * response is returned.
         */
        public token?: (proto.ITokenID|null);

        /**
         * Creates a new TokenGetInfoQuery instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TokenGetInfoQuery instance
         */
        public static create(properties?: proto.ITokenGetInfoQuery): proto.TokenGetInfoQuery;

        /**
         * Encodes the specified TokenGetInfoQuery message. Does not implicitly {@link proto.TokenGetInfoQuery.verify|verify} messages.
         * @param m TokenGetInfoQuery message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITokenGetInfoQuery, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TokenGetInfoQuery message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TokenGetInfoQuery
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TokenGetInfoQuery;
    }

    /** Properties of a TokenInfo. */
    interface ITokenInfo {

        /** ID of the token instance */
        tokenId?: (proto.ITokenID|null);

        /** The name of the token. It is a string of ASCII only characters */
        name?: (string|null);

        /** The symbol of the token. It is a UTF-8 capitalized alphabetical string */
        symbol?: (string|null);

        /**
         * The number of decimal places a token is divisible by. Always 0 for tokens of type
         * NON_FUNGIBLE_UNIQUE
         */
        decimals?: (number|null);

        /**
         * For tokens of type FUNGIBLE_COMMON - the total supply of tokens that are currently in
         * circulation. For tokens of type NON_FUNGIBLE_UNIQUE - the number of NFTs created of this
         * token instance
         */
        totalSupply?: (Long|null);

        /** The ID of the account which is set as Treasury */
        treasury?: (proto.IAccountID|null);

        /**
         * The key which can perform update/delete operations on the token. If empty, the token can be
         * perceived as immutable (not being able to be updated/deleted)
         */
        adminKey?: (proto.IKey|null);

        /**
         * The key which can grant or revoke KYC of an account for the token's transactions. If empty,
         * KYC is not required, and KYC grant or revoke operations are not possible.
         */
        kycKey?: (proto.IKey|null);

        /**
         * The key which can freeze or unfreeze an account for token transactions. If empty, freezing is
         * not possible
         */
        freezeKey?: (proto.IKey|null);

        /** The key which can wipe token balance of an account. If empty, wipe is not possible */
        wipeKey?: (proto.IKey|null);

        /**
         * The key which can change the supply of a token. The key is used to sign Token Mint/Burn
         * operations
         */
        supplyKey?: (proto.IKey|null);

        /**
         * The default Freeze status (not applicable, frozen or unfrozen) of Hedera accounts relative to
         * this token. FreezeNotApplicable is returned if Token Freeze Key is empty. Frozen is returned
         * if Token Freeze Key is set and defaultFreeze is set to true. Unfrozen is returned if Token
         * Freeze Key is set and defaultFreeze is set to false
         */
        defaultFreezeStatus?: (proto.TokenFreezeStatus|null);

        /**
         * The default KYC status (KycNotApplicable or Revoked) of Hedera accounts relative to this
         * token. KycNotApplicable is returned if KYC key is not set, otherwise Revoked
         */
        defaultKycStatus?: (proto.TokenKycStatus|null);

        /** Specifies whether the token was deleted or not */
        deleted?: (boolean|null);

        /**
         * An account which will be automatically charged to renew the token's expiration, at
         * autoRenewPeriod interval
         */
        autoRenewAccount?: (proto.IAccountID|null);

        /** The interval at which the auto-renew account will be charged to extend the token's expiry */
        autoRenewPeriod?: (proto.IDuration|null);

        /** The epoch second at which the token will expire */
        expiry?: (proto.ITimestamp|null);

        /** The memo associated with the token */
        memo?: (string|null);

        /** The token type */
        tokenType?: (proto.TokenType|null);

        /** The token supply type */
        supplyType?: (proto.TokenSupplyType|null);

        /**
         * For tokens of type FUNGIBLE_COMMON - The Maximum number of fungible tokens that can be in
         * circulation. For tokens of type NON_FUNGIBLE_UNIQUE - the maximum number of NFTs (serial
         * numbers) that can be in circulation
         */
        maxSupply?: (Long|null);

        /**
         * The key which can change the custom fee schedule of the token; if not set, the fee schedule
         * is immutable
         */
        feeScheduleKey?: (proto.IKey|null);

        /** The custom fees to be assessed during a CryptoTransfer that transfers units of this token */
        customFees?: (proto.ICustomFee[]|null);

        /** The Key which can pause and unpause the Token. */
        pauseKey?: (proto.IKey|null);

        /** Specifies whether the token is paused or not. PauseNotApplicable is returned if pauseKey is not set. */
        pauseStatus?: (proto.TokenPauseStatus|null);
    }

    /** The metadata about a Token instance */
    class TokenInfo implements ITokenInfo {

        /**
         * Constructs a new TokenInfo.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITokenInfo);

        /** ID of the token instance */
        public tokenId?: (proto.ITokenID|null);

        /** The name of the token. It is a string of ASCII only characters */
        public name: string;

        /** The symbol of the token. It is a UTF-8 capitalized alphabetical string */
        public symbol: string;

        /**
         * The number of decimal places a token is divisible by. Always 0 for tokens of type
         * NON_FUNGIBLE_UNIQUE
         */
        public decimals: number;

        /**
         * For tokens of type FUNGIBLE_COMMON - the total supply of tokens that are currently in
         * circulation. For tokens of type NON_FUNGIBLE_UNIQUE - the number of NFTs created of this
         * token instance
         */
        public totalSupply: Long;

        /** The ID of the account which is set as Treasury */
        public treasury?: (proto.IAccountID|null);

        /**
         * The key which can perform update/delete operations on the token. If empty, the token can be
         * perceived as immutable (not being able to be updated/deleted)
         */
        public adminKey?: (proto.IKey|null);

        /**
         * The key which can grant or revoke KYC of an account for the token's transactions. If empty,
         * KYC is not required, and KYC grant or revoke operations are not possible.
         */
        public kycKey?: (proto.IKey|null);

        /**
         * The key which can freeze or unfreeze an account for token transactions. If empty, freezing is
         * not possible
         */
        public freezeKey?: (proto.IKey|null);

        /** The key which can wipe token balance of an account. If empty, wipe is not possible */
        public wipeKey?: (proto.IKey|null);

        /**
         * The key which can change the supply of a token. The key is used to sign Token Mint/Burn
         * operations
         */
        public supplyKey?: (proto.IKey|null);

        /**
         * The default Freeze status (not applicable, frozen or unfrozen) of Hedera accounts relative to
         * this token. FreezeNotApplicable is returned if Token Freeze Key is empty. Frozen is returned
         * if Token Freeze Key is set and defaultFreeze is set to true. Unfrozen is returned if Token
         * Freeze Key is set and defaultFreeze is set to false
         */
        public defaultFreezeStatus: proto.TokenFreezeStatus;

        /**
         * The default KYC status (KycNotApplicable or Revoked) of Hedera accounts relative to this
         * token. KycNotApplicable is returned if KYC key is not set, otherwise Revoked
         */
        public defaultKycStatus: proto.TokenKycStatus;

        /** Specifies whether the token was deleted or not */
        public deleted: boolean;

        /**
         * An account which will be automatically charged to renew the token's expiration, at
         * autoRenewPeriod interval
         */
        public autoRenewAccount?: (proto.IAccountID|null);

        /** The interval at which the auto-renew account will be charged to extend the token's expiry */
        public autoRenewPeriod?: (proto.IDuration|null);

        /** The epoch second at which the token will expire */
        public expiry?: (proto.ITimestamp|null);

        /** The memo associated with the token */
        public memo: string;

        /** The token type */
        public tokenType: proto.TokenType;

        /** The token supply type */
        public supplyType: proto.TokenSupplyType;

        /**
         * For tokens of type FUNGIBLE_COMMON - The Maximum number of fungible tokens that can be in
         * circulation. For tokens of type NON_FUNGIBLE_UNIQUE - the maximum number of NFTs (serial
         * numbers) that can be in circulation
         */
        public maxSupply: Long;

        /**
         * The key which can change the custom fee schedule of the token; if not set, the fee schedule
         * is immutable
         */
        public feeScheduleKey?: (proto.IKey|null);

        /** The custom fees to be assessed during a CryptoTransfer that transfers units of this token */
        public customFees: proto.ICustomFee[];

        /** The Key which can pause and unpause the Token. */
        public pauseKey?: (proto.IKey|null);

        /** Specifies whether the token is paused or not. PauseNotApplicable is returned if pauseKey is not set. */
        public pauseStatus: proto.TokenPauseStatus;

        /**
         * Creates a new TokenInfo instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TokenInfo instance
         */
        public static create(properties?: proto.ITokenInfo): proto.TokenInfo;

        /**
         * Encodes the specified TokenInfo message. Does not implicitly {@link proto.TokenInfo.verify|verify} messages.
         * @param m TokenInfo message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITokenInfo, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TokenInfo message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TokenInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TokenInfo;
    }

    /** Properties of a TokenGetInfoResponse. */
    interface ITokenGetInfoResponse {

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither
         */
        header?: (proto.IResponseHeader|null);

        /** The information requested about this token instance */
        tokenInfo?: (proto.ITokenInfo|null);
    }

    /** Response when the client sends the node TokenGetInfoQuery */
    class TokenGetInfoResponse implements ITokenGetInfoResponse {

        /**
         * Constructs a new TokenGetInfoResponse.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITokenGetInfoResponse);

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither
         */
        public header?: (proto.IResponseHeader|null);

        /** The information requested about this token instance */
        public tokenInfo?: (proto.ITokenInfo|null);

        /**
         * Creates a new TokenGetInfoResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TokenGetInfoResponse instance
         */
        public static create(properties?: proto.ITokenGetInfoResponse): proto.TokenGetInfoResponse;

        /**
         * Encodes the specified TokenGetInfoResponse message. Does not implicitly {@link proto.TokenGetInfoResponse.verify|verify} messages.
         * @param m TokenGetInfoResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITokenGetInfoResponse, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TokenGetInfoResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TokenGetInfoResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TokenGetInfoResponse;
    }

    /** Properties of a ScheduleGetInfoQuery. */
    interface IScheduleGetInfoQuery {

        /**
         * standard info sent from client to node including the signed payment, and what kind of response
         * is requested (cost, state proof, both, or neither).
         */
        header?: (proto.IQueryHeader|null);

        /** The id of the schedule to interrogate */
        scheduleID?: (proto.IScheduleID|null);
    }

    /**
     * Gets information about a schedule in the network's action queue.
     *
     * Responds with <tt>INVALID_SCHEDULE_ID</tt> if the requested schedule doesn't exist.
     */
    class ScheduleGetInfoQuery implements IScheduleGetInfoQuery {

        /**
         * Constructs a new ScheduleGetInfoQuery.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IScheduleGetInfoQuery);

        /**
         * standard info sent from client to node including the signed payment, and what kind of response
         * is requested (cost, state proof, both, or neither).
         */
        public header?: (proto.IQueryHeader|null);

        /** The id of the schedule to interrogate */
        public scheduleID?: (proto.IScheduleID|null);

        /**
         * Creates a new ScheduleGetInfoQuery instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ScheduleGetInfoQuery instance
         */
        public static create(properties?: proto.IScheduleGetInfoQuery): proto.ScheduleGetInfoQuery;

        /**
         * Encodes the specified ScheduleGetInfoQuery message. Does not implicitly {@link proto.ScheduleGetInfoQuery.verify|verify} messages.
         * @param m ScheduleGetInfoQuery message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IScheduleGetInfoQuery, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ScheduleGetInfoQuery message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ScheduleGetInfoQuery
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ScheduleGetInfoQuery;
    }

    /** Properties of a ScheduleInfo. */
    interface IScheduleInfo {

        /** The id of the schedule */
        scheduleID?: (proto.IScheduleID|null);

        /** If the schedule has been deleted, the consensus time when this occurred */
        deletionTime?: (proto.ITimestamp|null);

        /** If the schedule has been executed, the consensus time when this occurred */
        executionTime?: (proto.ITimestamp|null);

        /** The time at which the schedule will expire */
        expirationTime?: (proto.ITimestamp|null);

        /** The scheduled transaction */
        scheduledTransactionBody?: (proto.ISchedulableTransactionBody|null);

        /** The publicly visible memo of the schedule */
        memo?: (string|null);

        /** The key used to delete the schedule from state */
        adminKey?: (proto.IKey|null);

        /** The Ed25519 keys the network deems to have signed the scheduled transaction */
        signers?: (proto.IKeyList|null);

        /** The id of the account that created the schedule */
        creatorAccountID?: (proto.IAccountID|null);

        /** The id of the account responsible for the service fee of the scheduled transaction */
        payerAccountID?: (proto.IAccountID|null);

        /**
         * The transaction id that will be used in the record of the scheduled transaction (if it
         * executes)
         */
        scheduledTransactionID?: (proto.ITransactionID|null);
    }

    /** Information summarizing schedule state */
    class ScheduleInfo implements IScheduleInfo {

        /**
         * Constructs a new ScheduleInfo.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IScheduleInfo);

        /** The id of the schedule */
        public scheduleID?: (proto.IScheduleID|null);

        /** If the schedule has been deleted, the consensus time when this occurred */
        public deletionTime?: (proto.ITimestamp|null);

        /** If the schedule has been executed, the consensus time when this occurred */
        public executionTime?: (proto.ITimestamp|null);

        /** The time at which the schedule will expire */
        public expirationTime?: (proto.ITimestamp|null);

        /** The scheduled transaction */
        public scheduledTransactionBody?: (proto.ISchedulableTransactionBody|null);

        /** The publicly visible memo of the schedule */
        public memo: string;

        /** The key used to delete the schedule from state */
        public adminKey?: (proto.IKey|null);

        /** The Ed25519 keys the network deems to have signed the scheduled transaction */
        public signers?: (proto.IKeyList|null);

        /** The id of the account that created the schedule */
        public creatorAccountID?: (proto.IAccountID|null);

        /** The id of the account responsible for the service fee of the scheduled transaction */
        public payerAccountID?: (proto.IAccountID|null);

        /**
         * The transaction id that will be used in the record of the scheduled transaction (if it
         * executes)
         */
        public scheduledTransactionID?: (proto.ITransactionID|null);

        /** ScheduleInfo data. */
        public data?: ("deletionTime"|"executionTime");

        /**
         * Creates a new ScheduleInfo instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ScheduleInfo instance
         */
        public static create(properties?: proto.IScheduleInfo): proto.ScheduleInfo;

        /**
         * Encodes the specified ScheduleInfo message. Does not implicitly {@link proto.ScheduleInfo.verify|verify} messages.
         * @param m ScheduleInfo message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IScheduleInfo, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ScheduleInfo message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ScheduleInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ScheduleInfo;
    }

    /** Properties of a ScheduleGetInfoResponse. */
    interface IScheduleGetInfoResponse {

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof, or
         * both, or neither
         */
        header?: (proto.IResponseHeader|null);

        /** The information requested about this schedule instance */
        scheduleInfo?: (proto.IScheduleInfo|null);
    }

    /** Response wrapper for the <tt>ScheduleInfo</tt> */
    class ScheduleGetInfoResponse implements IScheduleGetInfoResponse {

        /**
         * Constructs a new ScheduleGetInfoResponse.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IScheduleGetInfoResponse);

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof, or
         * both, or neither
         */
        public header?: (proto.IResponseHeader|null);

        /** The information requested about this schedule instance */
        public scheduleInfo?: (proto.IScheduleInfo|null);

        /**
         * Creates a new ScheduleGetInfoResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ScheduleGetInfoResponse instance
         */
        public static create(properties?: proto.IScheduleGetInfoResponse): proto.ScheduleGetInfoResponse;

        /**
         * Encodes the specified ScheduleGetInfoResponse message. Does not implicitly {@link proto.ScheduleGetInfoResponse.verify|verify} messages.
         * @param m ScheduleGetInfoResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IScheduleGetInfoResponse, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ScheduleGetInfoResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ScheduleGetInfoResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ScheduleGetInfoResponse;
    }

    /** Properties of a TokenGetAccountNftInfosQuery. */
    interface ITokenGetAccountNftInfosQuery {

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        header?: (proto.IQueryHeader|null);

        /** The Account for which information is requested */
        accountID?: (proto.IAccountID|null);

        /**
         * Specifies the start index (inclusive) of the range of NFTs to query for. Value must be in the
         * range [0; ownedNFTs-1]
         */
        start?: (Long|null);

        /**
         * Specifies the end index (exclusive) of the range of NFTs to query for. Value must be in the
         * range (start; ownedNFTs]
         */
        end?: (Long|null);
    }

    /**
     * Applicable only to tokens of type NON_FUNGIBLE_UNIQUE. Gets info on NFTs N through M owned by the
     * specified accountId.
     * Example: If Account A owns 5 NFTs (might be of different Token Entity), having start=0 and end=5
     * will return all of the NFTs
     *
     * INVALID_QUERY_RANGE response code will be returned if:
     * 1) Start > End
     * 2) Start and End indices are non-positive
     * 3) Start and End indices are out of boundaries for the retrieved nft list
     * 4) The range between Start and End is bigger than the global dynamic property for maximum query
     * range
     *
     * NOT_SUPPORTED response code will be returned if the queried token is of type FUNGIBLE_COMMON
     *
     * INVALID_ACCOUNT_ID response code will be returned if the queried account does not exist
     *
     * ACCOUNT_DELETED response code will be returned if the queried account has been deleted
     */
    class TokenGetAccountNftInfosQuery implements ITokenGetAccountNftInfosQuery {

        /**
         * Constructs a new TokenGetAccountNftInfosQuery.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITokenGetAccountNftInfosQuery);

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        public header?: (proto.IQueryHeader|null);

        /** The Account for which information is requested */
        public accountID?: (proto.IAccountID|null);

        /**
         * Specifies the start index (inclusive) of the range of NFTs to query for. Value must be in the
         * range [0; ownedNFTs-1]
         */
        public start: Long;

        /**
         * Specifies the end index (exclusive) of the range of NFTs to query for. Value must be in the
         * range (start; ownedNFTs]
         */
        public end: Long;

        /**
         * Creates a new TokenGetAccountNftInfosQuery instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TokenGetAccountNftInfosQuery instance
         */
        public static create(properties?: proto.ITokenGetAccountNftInfosQuery): proto.TokenGetAccountNftInfosQuery;

        /**
         * Encodes the specified TokenGetAccountNftInfosQuery message. Does not implicitly {@link proto.TokenGetAccountNftInfosQuery.verify|verify} messages.
         * @param m TokenGetAccountNftInfosQuery message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITokenGetAccountNftInfosQuery, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TokenGetAccountNftInfosQuery message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TokenGetAccountNftInfosQuery
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TokenGetAccountNftInfosQuery;
    }

    /** Properties of a TokenGetAccountNftInfosResponse. */
    interface ITokenGetAccountNftInfosResponse {

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither
         */
        header?: (proto.IResponseHeader|null);

        /** List of NFTs associated to the account */
        nfts?: (proto.ITokenNftInfo[]|null);
    }

    /** UNDOCUMENTED */
    class TokenGetAccountNftInfosResponse implements ITokenGetAccountNftInfosResponse {

        /**
         * Constructs a new TokenGetAccountNftInfosResponse.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITokenGetAccountNftInfosResponse);

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither
         */
        public header?: (proto.IResponseHeader|null);

        /** List of NFTs associated to the account */
        public nfts: proto.ITokenNftInfo[];

        /**
         * Creates a new TokenGetAccountNftInfosResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TokenGetAccountNftInfosResponse instance
         */
        public static create(properties?: proto.ITokenGetAccountNftInfosResponse): proto.TokenGetAccountNftInfosResponse;

        /**
         * Encodes the specified TokenGetAccountNftInfosResponse message. Does not implicitly {@link proto.TokenGetAccountNftInfosResponse.verify|verify} messages.
         * @param m TokenGetAccountNftInfosResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITokenGetAccountNftInfosResponse, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TokenGetAccountNftInfosResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TokenGetAccountNftInfosResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TokenGetAccountNftInfosResponse;
    }

    /** Properties of a NftID. */
    interface INftID {

        /** The (non-fungible) token of which this NFT is an instance */
        tokenID?: (proto.ITokenID|null);

        /** The unique identifier of this instance */
        serialNumber?: (Long|null);
    }

    /** Represents an NFT on the Ledger */
    class NftID implements INftID {

        /**
         * Constructs a new NftID.
         * @param [p] Properties to set
         */
        constructor(p?: proto.INftID);

        /** The (non-fungible) token of which this NFT is an instance */
        public tokenID?: (proto.ITokenID|null);

        /** The unique identifier of this instance */
        public serialNumber: Long;

        /**
         * Creates a new NftID instance using the specified properties.
         * @param [properties] Properties to set
         * @returns NftID instance
         */
        public static create(properties?: proto.INftID): proto.NftID;

        /**
         * Encodes the specified NftID message. Does not implicitly {@link proto.NftID.verify|verify} messages.
         * @param m NftID message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.INftID, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a NftID message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns NftID
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.NftID;
    }

    /** Properties of a TokenGetNftInfoQuery. */
    interface ITokenGetNftInfoQuery {

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        header?: (proto.IQueryHeader|null);

        /** The ID of the NFT */
        nftID?: (proto.INftID|null);
    }

    /**
     * Applicable only to tokens of type NON_FUNGIBLE_UNIQUE. Gets info on a NFT for a given TokenID (of
     * type NON_FUNGIBLE_UNIQUE) and serial number
     */
    class TokenGetNftInfoQuery implements ITokenGetNftInfoQuery {

        /**
         * Constructs a new TokenGetNftInfoQuery.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITokenGetNftInfoQuery);

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        public header?: (proto.IQueryHeader|null);

        /** The ID of the NFT */
        public nftID?: (proto.INftID|null);

        /**
         * Creates a new TokenGetNftInfoQuery instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TokenGetNftInfoQuery instance
         */
        public static create(properties?: proto.ITokenGetNftInfoQuery): proto.TokenGetNftInfoQuery;

        /**
         * Encodes the specified TokenGetNftInfoQuery message. Does not implicitly {@link proto.TokenGetNftInfoQuery.verify|verify} messages.
         * @param m TokenGetNftInfoQuery message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITokenGetNftInfoQuery, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TokenGetNftInfoQuery message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TokenGetNftInfoQuery
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TokenGetNftInfoQuery;
    }

    /** Properties of a TokenNftInfo. */
    interface ITokenNftInfo {

        /** The ID of the NFT */
        nftID?: (proto.INftID|null);

        /** The current owner of the NFT */
        accountID?: (proto.IAccountID|null);

        /** The effective consensus timestamp at which the NFT was minted */
        creationTime?: (proto.ITimestamp|null);

        /** Represents the unique metadata of the NFT */
        metadata?: (Uint8Array|null);
    }

    /** UNDOCUMENTED */
    class TokenNftInfo implements ITokenNftInfo {

        /**
         * Constructs a new TokenNftInfo.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITokenNftInfo);

        /** The ID of the NFT */
        public nftID?: (proto.INftID|null);

        /** The current owner of the NFT */
        public accountID?: (proto.IAccountID|null);

        /** The effective consensus timestamp at which the NFT was minted */
        public creationTime?: (proto.ITimestamp|null);

        /** Represents the unique metadata of the NFT */
        public metadata: Uint8Array;

        /**
         * Creates a new TokenNftInfo instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TokenNftInfo instance
         */
        public static create(properties?: proto.ITokenNftInfo): proto.TokenNftInfo;

        /**
         * Encodes the specified TokenNftInfo message. Does not implicitly {@link proto.TokenNftInfo.verify|verify} messages.
         * @param m TokenNftInfo message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITokenNftInfo, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TokenNftInfo message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TokenNftInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TokenNftInfo;
    }

    /** Properties of a TokenGetNftInfoResponse. */
    interface ITokenGetNftInfoResponse {

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither
         */
        header?: (proto.IResponseHeader|null);

        /** The information about this NFT */
        nft?: (proto.ITokenNftInfo|null);
    }

    /** UNDOCUMENTED */
    class TokenGetNftInfoResponse implements ITokenGetNftInfoResponse {

        /**
         * Constructs a new TokenGetNftInfoResponse.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITokenGetNftInfoResponse);

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither
         */
        public header?: (proto.IResponseHeader|null);

        /** The information about this NFT */
        public nft?: (proto.ITokenNftInfo|null);

        /**
         * Creates a new TokenGetNftInfoResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TokenGetNftInfoResponse instance
         */
        public static create(properties?: proto.ITokenGetNftInfoResponse): proto.TokenGetNftInfoResponse;

        /**
         * Encodes the specified TokenGetNftInfoResponse message. Does not implicitly {@link proto.TokenGetNftInfoResponse.verify|verify} messages.
         * @param m TokenGetNftInfoResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITokenGetNftInfoResponse, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TokenGetNftInfoResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TokenGetNftInfoResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TokenGetNftInfoResponse;
    }

    /** Properties of a TokenGetNftInfosQuery. */
    interface ITokenGetNftInfosQuery {

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        header?: (proto.IQueryHeader|null);

        /** The ID of the token for which information is requested */
        tokenID?: (proto.ITokenID|null);

        /**
         * Specifies the start index (inclusive) of the range of NFTs to query for. Value must be in the
         * range [0; ownedNFTs-1]
         */
        start?: (Long|null);

        /**
         * Specifies the end index (exclusive) of the range of NFTs to query for. Value must be in the
         * range (start; ownedNFTs]
         */
        end?: (Long|null);
    }

    /**
     * Applicable only to tokens of type NON_FUNGIBLE_UNIQUE. Gets info on NFTs N through M on the list
     * of NFTs associated with a given NON_FUNGIBLE_UNIQUE Token.
     * Example: If there are 10 NFTs issued, having start=0 and end=5 will query for the first 5 NFTs.
     * Querying +all 10 NFTs will require start=0 and end=10
     *
     * INVALID_QUERY_RANGE response code will be returned if:
     * 1) Start > End
     * 2) Start and End indices are non-positive
     * 3) Start and End indices are out of boundaries for the retrieved nft list
     * 4) The range between Start and End is bigger than the global dynamic property for maximum query
     * range
     *
     * NOT_SUPPORTED response code will be returned if the queried token is of type FUNGIBLE_COMMON
     *
     * INVALID_TOKEN_ID response code will be returned if the queried token does not exist
     */
    class TokenGetNftInfosQuery implements ITokenGetNftInfosQuery {

        /**
         * Constructs a new TokenGetNftInfosQuery.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITokenGetNftInfosQuery);

        /**
         * Standard info sent from client to node, including the signed payment, and what kind of
         * response is requested (cost, state proof, both, or neither).
         */
        public header?: (proto.IQueryHeader|null);

        /** The ID of the token for which information is requested */
        public tokenID?: (proto.ITokenID|null);

        /**
         * Specifies the start index (inclusive) of the range of NFTs to query for. Value must be in the
         * range [0; ownedNFTs-1]
         */
        public start: Long;

        /**
         * Specifies the end index (exclusive) of the range of NFTs to query for. Value must be in the
         * range (start; ownedNFTs]
         */
        public end: Long;

        /**
         * Creates a new TokenGetNftInfosQuery instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TokenGetNftInfosQuery instance
         */
        public static create(properties?: proto.ITokenGetNftInfosQuery): proto.TokenGetNftInfosQuery;

        /**
         * Encodes the specified TokenGetNftInfosQuery message. Does not implicitly {@link proto.TokenGetNftInfosQuery.verify|verify} messages.
         * @param m TokenGetNftInfosQuery message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITokenGetNftInfosQuery, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TokenGetNftInfosQuery message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TokenGetNftInfosQuery
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TokenGetNftInfosQuery;
    }

    /** Properties of a TokenGetNftInfosResponse. */
    interface ITokenGetNftInfosResponse {

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither
         */
        header?: (proto.IResponseHeader|null);

        /** The Token with type NON_FUNGIBLE that this record is for */
        tokenID?: (proto.ITokenID|null);

        /** List of NFTs associated to the specified token */
        nfts?: (proto.ITokenNftInfo[]|null);
    }

    /** Represents a TokenGetNftInfosResponse. */
    class TokenGetNftInfosResponse implements ITokenGetNftInfosResponse {

        /**
         * Constructs a new TokenGetNftInfosResponse.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITokenGetNftInfosResponse);

        /**
         * Standard response from node to client, including the requested fields: cost, or state proof,
         * or both, or neither
         */
        public header?: (proto.IResponseHeader|null);

        /** The Token with type NON_FUNGIBLE that this record is for */
        public tokenID?: (proto.ITokenID|null);

        /** List of NFTs associated to the specified token */
        public nfts: proto.ITokenNftInfo[];

        /**
         * Creates a new TokenGetNftInfosResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TokenGetNftInfosResponse instance
         */
        public static create(properties?: proto.ITokenGetNftInfosResponse): proto.TokenGetNftInfosResponse;

        /**
         * Encodes the specified TokenGetNftInfosResponse message. Does not implicitly {@link proto.TokenGetNftInfosResponse.verify|verify} messages.
         * @param m TokenGetNftInfosResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITokenGetNftInfosResponse, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TokenGetNftInfosResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TokenGetNftInfosResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TokenGetNftInfosResponse;
    }

    /** Properties of a Response. */
    interface IResponse {

        /** Get all entities associated with a given key */
        getByKey?: (proto.IGetByKeyResponse|null);

        /** Get the IDs in the format used in transactions, given the format used in Solidity */
        getBySolidityID?: (proto.IGetBySolidityIDResponse|null);

        /** Response to call a function of a smart contract instance */
        contractCallLocal?: (proto.IContractCallLocalResponse|null);

        /** Get the bytecode for a smart contract instance */
        contractGetBytecodeResponse?: (proto.IContractGetBytecodeResponse|null);

        /** Get information about a smart contract instance */
        contractGetInfo?: (proto.IContractGetInfoResponse|null);

        /** Get all existing records for a smart contract instance */
        contractGetRecordsResponse?: (proto.IContractGetRecordsResponse|null);

        /** Get the current balance in a cryptocurrency account */
        cryptogetAccountBalance?: (proto.ICryptoGetAccountBalanceResponse|null);

        /** Get all the records that currently exist for transactions involving an account */
        cryptoGetAccountRecords?: (proto.ICryptoGetAccountRecordsResponse|null);

        /** Get all information about an account */
        cryptoGetInfo?: (proto.ICryptoGetInfoResponse|null);

        /** Contains a livehash associated to an account */
        cryptoGetLiveHash?: (proto.ICryptoGetLiveHashResponse|null);

        /** Get all the accounts that proxy stake to a given account, and how much they proxy stake */
        cryptoGetProxyStakers?: (proto.ICryptoGetStakersResponse|null);

        /** Get the contents of a file (the bytes stored in it) */
        fileGetContents?: (proto.IFileGetContentsResponse|null);

        /** Get information about a file, such as its expiration date */
        fileGetInfo?: (proto.IFileGetInfoResponse|null);

        /** Get a receipt for a transaction */
        transactionGetReceipt?: (proto.ITransactionGetReceiptResponse|null);

        /** Get a record for a transaction */
        transactionGetRecord?: (proto.ITransactionGetRecordResponse|null);

        /** Get a record for a transaction (lasts 180 seconds) */
        transactionGetFastRecord?: (proto.ITransactionGetFastRecordResponse|null);

        /** Parameters of and state of a consensus topic.. */
        consensusGetTopicInfo?: (proto.IConsensusGetTopicInfoResponse|null);

        /** Semantic versions of Hedera Services and HAPI proto */
        networkGetVersionInfo?: (proto.INetworkGetVersionInfoResponse|null);

        /** Get all information about a token */
        tokenGetInfo?: (proto.ITokenGetInfoResponse|null);

        /** Get all information about a schedule entity */
        scheduleGetInfo?: (proto.IScheduleGetInfoResponse|null);

        /** A list of the NFTs associated with the account */
        tokenGetAccountNftInfos?: (proto.ITokenGetAccountNftInfosResponse|null);

        /** All information about an NFT */
        tokenGetNftInfo?: (proto.ITokenGetNftInfoResponse|null);

        /** A list of the NFTs for the token */
        tokenGetNftInfos?: (proto.ITokenGetNftInfosResponse|null);
    }

    /**
     * A single response, which is returned from the node to the client, after the client sent the node
     * a query. This includes all responses.
     */
    class Response implements IResponse {

        /**
         * Constructs a new Response.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IResponse);

        /** Get all entities associated with a given key */
        public getByKey?: (proto.IGetByKeyResponse|null);

        /** Get the IDs in the format used in transactions, given the format used in Solidity */
        public getBySolidityID?: (proto.IGetBySolidityIDResponse|null);

        /** Response to call a function of a smart contract instance */
        public contractCallLocal?: (proto.IContractCallLocalResponse|null);

        /** Get the bytecode for a smart contract instance */
        public contractGetBytecodeResponse?: (proto.IContractGetBytecodeResponse|null);

        /** Get information about a smart contract instance */
        public contractGetInfo?: (proto.IContractGetInfoResponse|null);

        /** Get all existing records for a smart contract instance */
        public contractGetRecordsResponse?: (proto.IContractGetRecordsResponse|null);

        /** Get the current balance in a cryptocurrency account */
        public cryptogetAccountBalance?: (proto.ICryptoGetAccountBalanceResponse|null);

        /** Get all the records that currently exist for transactions involving an account */
        public cryptoGetAccountRecords?: (proto.ICryptoGetAccountRecordsResponse|null);

        /** Get all information about an account */
        public cryptoGetInfo?: (proto.ICryptoGetInfoResponse|null);

        /** Contains a livehash associated to an account */
        public cryptoGetLiveHash?: (proto.ICryptoGetLiveHashResponse|null);

        /** Get all the accounts that proxy stake to a given account, and how much they proxy stake */
        public cryptoGetProxyStakers?: (proto.ICryptoGetStakersResponse|null);

        /** Get the contents of a file (the bytes stored in it) */
        public fileGetContents?: (proto.IFileGetContentsResponse|null);

        /** Get information about a file, such as its expiration date */
        public fileGetInfo?: (proto.IFileGetInfoResponse|null);

        /** Get a receipt for a transaction */
        public transactionGetReceipt?: (proto.ITransactionGetReceiptResponse|null);

        /** Get a record for a transaction */
        public transactionGetRecord?: (proto.ITransactionGetRecordResponse|null);

        /** Get a record for a transaction (lasts 180 seconds) */
        public transactionGetFastRecord?: (proto.ITransactionGetFastRecordResponse|null);

        /** Parameters of and state of a consensus topic.. */
        public consensusGetTopicInfo?: (proto.IConsensusGetTopicInfoResponse|null);

        /** Semantic versions of Hedera Services and HAPI proto */
        public networkGetVersionInfo?: (proto.INetworkGetVersionInfoResponse|null);

        /** Get all information about a token */
        public tokenGetInfo?: (proto.ITokenGetInfoResponse|null);

        /** Get all information about a schedule entity */
        public scheduleGetInfo?: (proto.IScheduleGetInfoResponse|null);

        /** A list of the NFTs associated with the account */
        public tokenGetAccountNftInfos?: (proto.ITokenGetAccountNftInfosResponse|null);

        /** All information about an NFT */
        public tokenGetNftInfo?: (proto.ITokenGetNftInfoResponse|null);

        /** A list of the NFTs for the token */
        public tokenGetNftInfos?: (proto.ITokenGetNftInfosResponse|null);

        /** Response response. */
        public response?: ("getByKey"|"getBySolidityID"|"contractCallLocal"|"contractGetBytecodeResponse"|"contractGetInfo"|"contractGetRecordsResponse"|"cryptogetAccountBalance"|"cryptoGetAccountRecords"|"cryptoGetInfo"|"cryptoGetLiveHash"|"cryptoGetProxyStakers"|"fileGetContents"|"fileGetInfo"|"transactionGetReceipt"|"transactionGetRecord"|"transactionGetFastRecord"|"consensusGetTopicInfo"|"networkGetVersionInfo"|"tokenGetInfo"|"scheduleGetInfo"|"tokenGetAccountNftInfos"|"tokenGetNftInfo"|"tokenGetNftInfos");

        /**
         * Creates a new Response instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Response instance
         */
        public static create(properties?: proto.IResponse): proto.Response;

        /**
         * Encodes the specified Response message. Does not implicitly {@link proto.Response.verify|verify} messages.
         * @param m Response message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IResponse, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Response message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Response
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.Response;
    }

    /** Transactions and queries for the Crypto Service */
    class CryptoService extends $protobuf.rpc.Service {

        /**
         * Constructs a new CryptoService service.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         */
        constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

        /**
         * Creates new CryptoService service using the specified rpc implementation.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         * @returns RPC service. Useful where requests and/or responses are streamed.
         */
        public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): CryptoService;

        /**
         * Creates a new account by submitting the transaction
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public createAccount(request: proto.ITransaction, callback: proto.CryptoService.createAccountCallback): void;

        /**
         * Creates a new account by submitting the transaction
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public createAccount(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * Updates an account by submitting the transaction
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public updateAccount(request: proto.ITransaction, callback: proto.CryptoService.updateAccountCallback): void;

        /**
         * Updates an account by submitting the transaction
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public updateAccount(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * Initiates a transfer by submitting the transaction
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public cryptoTransfer(request: proto.ITransaction, callback: proto.CryptoService.cryptoTransferCallback): void;

        /**
         * Initiates a transfer by submitting the transaction
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public cryptoTransfer(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * Deletes and account by submitting the transaction
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public cryptoDelete(request: proto.ITransaction, callback: proto.CryptoService.cryptoDeleteCallback): void;

        /**
         * Deletes and account by submitting the transaction
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public cryptoDelete(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * (NOT CURRENTLY SUPPORTED) Adds a livehash
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public addLiveHash(request: proto.ITransaction, callback: proto.CryptoService.addLiveHashCallback): void;

        /**
         * (NOT CURRENTLY SUPPORTED) Adds a livehash
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public addLiveHash(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * (NOT CURRENTLY SUPPORTED) Deletes a livehash
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public deleteLiveHash(request: proto.ITransaction, callback: proto.CryptoService.deleteLiveHashCallback): void;

        /**
         * (NOT CURRENTLY SUPPORTED) Deletes a livehash
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public deleteLiveHash(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * (NOT CURRENTLY SUPPORTED) Retrieves a livehash for an account
         * @param request Query message or plain object
         * @param callback Node-style callback called with the error, if any, and Response
         */
        public getLiveHash(request: proto.IQuery, callback: proto.CryptoService.getLiveHashCallback): void;

        /**
         * (NOT CURRENTLY SUPPORTED) Retrieves a livehash for an account
         * @param request Query message or plain object
         * @returns Promise
         */
        public getLiveHash(request: proto.IQuery): Promise<proto.Response>;

        /**
         * Returns all transactions in the last 180s of consensus time for which the given account was
         * the effective payer <b>and</b> network property <tt>ledger.keepRecordsInState</tt> was
         * <tt>true</tt>.
         * @param request Query message or plain object
         * @param callback Node-style callback called with the error, if any, and Response
         */
        public getAccountRecords(request: proto.IQuery, callback: proto.CryptoService.getAccountRecordsCallback): void;

        /**
         * Returns all transactions in the last 180s of consensus time for which the given account was
         * the effective payer <b>and</b> network property <tt>ledger.keepRecordsInState</tt> was
         * <tt>true</tt>.
         * @param request Query message or plain object
         * @returns Promise
         */
        public getAccountRecords(request: proto.IQuery): Promise<proto.Response>;

        /**
         * Retrieves the balance of an account
         * @param request Query message or plain object
         * @param callback Node-style callback called with the error, if any, and Response
         */
        public cryptoGetBalance(request: proto.IQuery, callback: proto.CryptoService.cryptoGetBalanceCallback): void;

        /**
         * Retrieves the balance of an account
         * @param request Query message or plain object
         * @returns Promise
         */
        public cryptoGetBalance(request: proto.IQuery): Promise<proto.Response>;

        /**
         * Retrieves the metadata of an account
         * @param request Query message or plain object
         * @param callback Node-style callback called with the error, if any, and Response
         */
        public getAccountInfo(request: proto.IQuery, callback: proto.CryptoService.getAccountInfoCallback): void;

        /**
         * Retrieves the metadata of an account
         * @param request Query message or plain object
         * @returns Promise
         */
        public getAccountInfo(request: proto.IQuery): Promise<proto.Response>;

        /**
         * Retrieves the latest receipt for a transaction that is either awaiting consensus, or reached
         * consensus in the last 180 seconds
         * @param request Query message or plain object
         * @param callback Node-style callback called with the error, if any, and Response
         */
        public getTransactionReceipts(request: proto.IQuery, callback: proto.CryptoService.getTransactionReceiptsCallback): void;

        /**
         * Retrieves the latest receipt for a transaction that is either awaiting consensus, or reached
         * consensus in the last 180 seconds
         * @param request Query message or plain object
         * @returns Promise
         */
        public getTransactionReceipts(request: proto.IQuery): Promise<proto.Response>;

        /**
         * (NOT CURRENTLY SUPPORTED) Returns the records of transactions recently funded by an account
         * @param request Query message or plain object
         * @param callback Node-style callback called with the error, if any, and Response
         */
        public getFastTransactionRecord(request: proto.IQuery, callback: proto.CryptoService.getFastTransactionRecordCallback): void;

        /**
         * (NOT CURRENTLY SUPPORTED) Returns the records of transactions recently funded by an account
         * @param request Query message or plain object
         * @returns Promise
         */
        public getFastTransactionRecord(request: proto.IQuery): Promise<proto.Response>;

        /**
         * Retrieves the record of a transaction that is either awaiting consensus, or reached consensus
         * in the last 180 seconds
         * @param request Query message or plain object
         * @param callback Node-style callback called with the error, if any, and Response
         */
        public getTxRecordByTxID(request: proto.IQuery, callback: proto.CryptoService.getTxRecordByTxIDCallback): void;

        /**
         * Retrieves the record of a transaction that is either awaiting consensus, or reached consensus
         * in the last 180 seconds
         * @param request Query message or plain object
         * @returns Promise
         */
        public getTxRecordByTxID(request: proto.IQuery): Promise<proto.Response>;

        /**
         * (NOT CURRENTLY SUPPORTED) Retrieves the stakers for a node by account id
         * @param request Query message or plain object
         * @param callback Node-style callback called with the error, if any, and Response
         */
        public getStakersByAccountID(request: proto.IQuery, callback: proto.CryptoService.getStakersByAccountIDCallback): void;

        /**
         * (NOT CURRENTLY SUPPORTED) Retrieves the stakers for a node by account id
         * @param request Query message or plain object
         * @returns Promise
         */
        public getStakersByAccountID(request: proto.IQuery): Promise<proto.Response>;
    }

    namespace CryptoService {

        /**
         * Callback as used by {@link proto.CryptoService#createAccount}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type createAccountCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.CryptoService#updateAccount}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type updateAccountCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.CryptoService#cryptoTransfer}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type cryptoTransferCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.CryptoService#cryptoDelete}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type cryptoDeleteCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.CryptoService#addLiveHash}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type addLiveHashCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.CryptoService#deleteLiveHash}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type deleteLiveHashCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.CryptoService#getLiveHash}.
         * @param error Error, if any
         * @param [response] Response
         */
        type getLiveHashCallback = (error: (Error|null), response?: proto.Response) => void;

        /**
         * Callback as used by {@link proto.CryptoService#getAccountRecords}.
         * @param error Error, if any
         * @param [response] Response
         */
        type getAccountRecordsCallback = (error: (Error|null), response?: proto.Response) => void;

        /**
         * Callback as used by {@link proto.CryptoService#cryptoGetBalance}.
         * @param error Error, if any
         * @param [response] Response
         */
        type cryptoGetBalanceCallback = (error: (Error|null), response?: proto.Response) => void;

        /**
         * Callback as used by {@link proto.CryptoService#getAccountInfo}.
         * @param error Error, if any
         * @param [response] Response
         */
        type getAccountInfoCallback = (error: (Error|null), response?: proto.Response) => void;

        /**
         * Callback as used by {@link proto.CryptoService#getTransactionReceipts}.
         * @param error Error, if any
         * @param [response] Response
         */
        type getTransactionReceiptsCallback = (error: (Error|null), response?: proto.Response) => void;

        /**
         * Callback as used by {@link proto.CryptoService#getFastTransactionRecord}.
         * @param error Error, if any
         * @param [response] Response
         */
        type getFastTransactionRecordCallback = (error: (Error|null), response?: proto.Response) => void;

        /**
         * Callback as used by {@link proto.CryptoService#getTxRecordByTxID}.
         * @param error Error, if any
         * @param [response] Response
         */
        type getTxRecordByTxIDCallback = (error: (Error|null), response?: proto.Response) => void;

        /**
         * Callback as used by {@link proto.CryptoService#getStakersByAccountID}.
         * @param error Error, if any
         * @param [response] Response
         */
        type getStakersByAccountIDCallback = (error: (Error|null), response?: proto.Response) => void;
    }

    /** Transactions and queries for the file service. */
    class FileService extends $protobuf.rpc.Service {

        /**
         * Constructs a new FileService service.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         */
        constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

        /**
         * Creates new FileService service using the specified rpc implementation.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         * @returns RPC service. Useful where requests and/or responses are streamed.
         */
        public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): FileService;

        /**
         * Creates a file
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public createFile(request: proto.ITransaction, callback: proto.FileService.createFileCallback): void;

        /**
         * Creates a file
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public createFile(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * Updates a file
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public updateFile(request: proto.ITransaction, callback: proto.FileService.updateFileCallback): void;

        /**
         * Updates a file
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public updateFile(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * Deletes a file
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public deleteFile(request: proto.ITransaction, callback: proto.FileService.deleteFileCallback): void;

        /**
         * Deletes a file
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public deleteFile(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * Appends to a file
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public appendContent(request: proto.ITransaction, callback: proto.FileService.appendContentCallback): void;

        /**
         * Appends to a file
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public appendContent(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * Retrieves the file contents
         * @param request Query message or plain object
         * @param callback Node-style callback called with the error, if any, and Response
         */
        public getFileContent(request: proto.IQuery, callback: proto.FileService.getFileContentCallback): void;

        /**
         * Retrieves the file contents
         * @param request Query message or plain object
         * @returns Promise
         */
        public getFileContent(request: proto.IQuery): Promise<proto.Response>;

        /**
         * Retrieves the file information
         * @param request Query message or plain object
         * @param callback Node-style callback called with the error, if any, and Response
         */
        public getFileInfo(request: proto.IQuery, callback: proto.FileService.getFileInfoCallback): void;

        /**
         * Retrieves the file information
         * @param request Query message or plain object
         * @returns Promise
         */
        public getFileInfo(request: proto.IQuery): Promise<proto.Response>;

        /**
         * Deletes a file if the submitting account has network admin privileges
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public systemDelete(request: proto.ITransaction, callback: proto.FileService.systemDeleteCallback): void;

        /**
         * Deletes a file if the submitting account has network admin privileges
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public systemDelete(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * Undeletes a file if the submitting account has network admin privileges
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public systemUndelete(request: proto.ITransaction, callback: proto.FileService.systemUndeleteCallback): void;

        /**
         * Undeletes a file if the submitting account has network admin privileges
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public systemUndelete(request: proto.ITransaction): Promise<proto.TransactionResponse>;
    }

    namespace FileService {

        /**
         * Callback as used by {@link proto.FileService#createFile}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type createFileCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.FileService#updateFile}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type updateFileCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.FileService#deleteFile}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type deleteFileCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.FileService#appendContent}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type appendContentCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.FileService#getFileContent}.
         * @param error Error, if any
         * @param [response] Response
         */
        type getFileContentCallback = (error: (Error|null), response?: proto.Response) => void;

        /**
         * Callback as used by {@link proto.FileService#getFileInfo}.
         * @param error Error, if any
         * @param [response] Response
         */
        type getFileInfoCallback = (error: (Error|null), response?: proto.Response) => void;

        /**
         * Callback as used by {@link proto.FileService#systemDelete}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type systemDeleteCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.FileService#systemUndelete}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type systemUndeleteCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;
    }

    /** The request and responses for freeze service. */
    class FreezeService extends $protobuf.rpc.Service {

        /**
         * Constructs a new FreezeService service.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         */
        constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

        /**
         * Creates new FreezeService service using the specified rpc implementation.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         * @returns RPC service. Useful where requests and/or responses are streamed.
         */
        public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): FreezeService;

        /**
         * Freezes the nodes by submitting the transaction. The grpc server returns the
         * TransactionResponse
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public freeze(request: proto.ITransaction, callback: proto.FreezeService.freezeCallback): void;

        /**
         * Freezes the nodes by submitting the transaction. The grpc server returns the
         * TransactionResponse
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public freeze(request: proto.ITransaction): Promise<proto.TransactionResponse>;
    }

    namespace FreezeService {

        /**
         * Callback as used by {@link proto.FreezeService#freeze}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type freezeCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;
    }

    /**
     * The type of network freeze or upgrade operation to be performed. This type dictates which
     * fields are required.
     */
    enum FreezeType {
        UNKNOWN_FREEZE_TYPE = 0,
        FREEZE_ONLY = 1,
        PREPARE_UPGRADE = 2,
        FREEZE_UPGRADE = 3,
        FREEZE_ABORT = 4,
        TELEMETRY_UPGRADE = 5
    }

    /** Properties of a ConsensusTopicQuery. */
    interface IConsensusTopicQuery {

        /** A required topic ID to retrieve messages for. */
        topicID?: (proto.ITopicID|null);

        /**
         * Include messages which reached consensus on or after this time. Defaults to current time if
         * not set.
         */
        consensusStartTime?: (proto.ITimestamp|null);

        /**
         * Include messages which reached consensus before this time. If not set it will receive
         * indefinitely.
         */
        consensusEndTime?: (proto.ITimestamp|null);

        /**
         * The maximum number of messages to receive before stopping. If not set or set to zero it will
         * return messages indefinitely.
         */
        limit?: (Long|null);
    }

    /** Represents a ConsensusTopicQuery. */
    class ConsensusTopicQuery implements IConsensusTopicQuery {

        /**
         * Constructs a new ConsensusTopicQuery.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IConsensusTopicQuery);

        /** A required topic ID to retrieve messages for. */
        public topicID?: (proto.ITopicID|null);

        /**
         * Include messages which reached consensus on or after this time. Defaults to current time if
         * not set.
         */
        public consensusStartTime?: (proto.ITimestamp|null);

        /**
         * Include messages which reached consensus before this time. If not set it will receive
         * indefinitely.
         */
        public consensusEndTime?: (proto.ITimestamp|null);

        /**
         * The maximum number of messages to receive before stopping. If not set or set to zero it will
         * return messages indefinitely.
         */
        public limit: Long;

        /**
         * Creates a new ConsensusTopicQuery instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ConsensusTopicQuery instance
         */
        public static create(properties?: proto.IConsensusTopicQuery): proto.ConsensusTopicQuery;

        /**
         * Encodes the specified ConsensusTopicQuery message. Does not implicitly {@link proto.ConsensusTopicQuery.verify|verify} messages.
         * @param m ConsensusTopicQuery message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IConsensusTopicQuery, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ConsensusTopicQuery message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ConsensusTopicQuery
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ConsensusTopicQuery;
    }

    /** Properties of a ConsensusTopicResponse. */
    interface IConsensusTopicResponse {

        /** The time at which the transaction reached consensus */
        consensusTimestamp?: (proto.ITimestamp|null);

        /**
         * The message body originally in the ConsensusSubmitMessageTransactionBody. Message size will
         * be less than 6KiB.
         */
        message?: (Uint8Array|null);

        /** The running hash (SHA384) of every message. */
        runningHash?: (Uint8Array|null);

        /** Starts at 1 for first submitted message. Incremented on each submitted message. */
        sequenceNumber?: (Long|null);

        /** Version of the SHA-384 digest used to update the running hash. */
        runningHashVersion?: (Long|null);

        /** Optional information of the current chunk in a fragmented message. */
        chunkInfo?: (proto.IConsensusMessageChunkInfo|null);
    }

    /** Represents a ConsensusTopicResponse. */
    class ConsensusTopicResponse implements IConsensusTopicResponse {

        /**
         * Constructs a new ConsensusTopicResponse.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IConsensusTopicResponse);

        /** The time at which the transaction reached consensus */
        public consensusTimestamp?: (proto.ITimestamp|null);

        /**
         * The message body originally in the ConsensusSubmitMessageTransactionBody. Message size will
         * be less than 6KiB.
         */
        public message: Uint8Array;

        /** The running hash (SHA384) of every message. */
        public runningHash: Uint8Array;

        /** Starts at 1 for first submitted message. Incremented on each submitted message. */
        public sequenceNumber: Long;

        /** Version of the SHA-384 digest used to update the running hash. */
        public runningHashVersion: Long;

        /** Optional information of the current chunk in a fragmented message. */
        public chunkInfo?: (proto.IConsensusMessageChunkInfo|null);

        /**
         * Creates a new ConsensusTopicResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ConsensusTopicResponse instance
         */
        public static create(properties?: proto.IConsensusTopicResponse): proto.ConsensusTopicResponse;

        /**
         * Encodes the specified ConsensusTopicResponse message. Does not implicitly {@link proto.ConsensusTopicResponse.verify|verify} messages.
         * @param m ConsensusTopicResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IConsensusTopicResponse, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ConsensusTopicResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ConsensusTopicResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ConsensusTopicResponse;
    }

    /**
     * The Mirror Service provides the ability to query a stream of Hedera Consensus Service (HCS)
     * messages for an HCS Topic via a specific (possibly open-ended) time range.
     */
    class MirrorConsensusService extends $protobuf.rpc.Service {

        /**
         * Constructs a new MirrorConsensusService service.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         */
        constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

        /**
         * Creates new MirrorConsensusService service using the specified rpc implementation.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         * @returns RPC service. Useful where requests and/or responses are streamed.
         */
        public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): MirrorConsensusService;

        /**
         * Calls subscribeTopic.
         * @param request ConsensusTopicQuery message or plain object
         * @param callback Node-style callback called with the error, if any, and ConsensusTopicResponse
         */
        public subscribeTopic(request: proto.IConsensusTopicQuery, callback: proto.MirrorConsensusService.subscribeTopicCallback): void;

        /**
         * Calls subscribeTopic.
         * @param request ConsensusTopicQuery message or plain object
         * @returns Promise
         */
        public subscribeTopic(request: proto.IConsensusTopicQuery): Promise<proto.ConsensusTopicResponse>;
    }

    namespace MirrorConsensusService {

        /**
         * Callback as used by {@link proto.MirrorConsensusService#subscribeTopic}.
         * @param error Error, if any
         * @param [response] ConsensusTopicResponse
         */
        type subscribeTopicCallback = (error: (Error|null), response?: proto.ConsensusTopicResponse) => void;
    }

    /** The requests and responses for different network services. */
    class NetworkService extends $protobuf.rpc.Service {

        /**
         * Constructs a new NetworkService service.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         */
        constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

        /**
         * Creates new NetworkService service using the specified rpc implementation.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         * @returns RPC service. Useful where requests and/or responses are streamed.
         */
        public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): NetworkService;

        /**
         * Retrieves the active versions of Hedera Services and HAPI proto
         * @param request Query message or plain object
         * @param callback Node-style callback called with the error, if any, and Response
         */
        public getVersionInfo(request: proto.IQuery, callback: proto.NetworkService.getVersionInfoCallback): void;

        /**
         * Retrieves the active versions of Hedera Services and HAPI proto
         * @param request Query message or plain object
         * @returns Promise
         */
        public getVersionInfo(request: proto.IQuery): Promise<proto.Response>;

        /**
         * Submits a "wrapped" transaction to the network, skipping its standard prechecks. (Note that
         * the "wrapper" <tt>UncheckedSubmit</tt> transaction is still subject to normal prechecks,
         * including an authorization requirement that its payer be either the treasury or system admin
         * account.)
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public uncheckedSubmit(request: proto.ITransaction, callback: proto.NetworkService.uncheckedSubmitCallback): void;

        /**
         * Submits a "wrapped" transaction to the network, skipping its standard prechecks. (Note that
         * the "wrapper" <tt>UncheckedSubmit</tt> transaction is still subject to normal prechecks,
         * including an authorization requirement that its payer be either the treasury or system admin
         * account.)
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public uncheckedSubmit(request: proto.ITransaction): Promise<proto.TransactionResponse>;
    }

    namespace NetworkService {

        /**
         * Callback as used by {@link proto.NetworkService#getVersionInfo}.
         * @param error Error, if any
         * @param [response] Response
         */
        type getVersionInfoCallback = (error: (Error|null), response?: proto.Response) => void;

        /**
         * Callback as used by {@link proto.NetworkService#uncheckedSubmit}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type uncheckedSubmitCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;
    }

    /**
     * Transactions and queries for the Schedule Service
     * The Schedule Service allows transactions to be submitted without all the required signatures and
     * allows anyone to provide the required signatures independently after a transaction has already
     * been created.
     * Execution:
     * Scheduled Transactions are executed once all required signatures are collected and witnessed.
     * Every time new signature is provided, a check is performed on the "readiness" of the execution.
     * The Scheduled Transaction will be executed immediately after the transaction that triggered it
     * and will be externalised in a separate Transaction Record.
     * Transaction Record:
     * The timestamp of the Scheduled Transaction will be equal to consensusTimestamp + 1 nano, where
     * consensusTimestamp is the timestamp of the transaction that triggered the execution.
     * The Transaction ID of the Scheduled Transaction will have the scheduled property set to true and
     * inherit the transactionValidStart and accountID from the ScheduleCreate transaction.
     * The scheduleRef property of the transaction record will be populated with the ScheduleID of the
     * Scheduled Transaction.
     * Post execution:
     * Once a given Scheduled Transaction executes, it will be removed from the ledger and any upcoming
     * operation referring the ScheduleID will resolve to INVALID_SCHEDULE_ID.
     * Expiry:
     * Scheduled Transactions have a global expiry time txExpiryTimeSecs (Currently set to 30 minutes).
     * If txExpiryTimeSecs pass and the Scheduled Transaction haven't yet executed, it will be removed
     * from the ledger as if ScheduleDelete operation is executed.
     */
    class ScheduleService extends $protobuf.rpc.Service {

        /**
         * Constructs a new ScheduleService service.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         */
        constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

        /**
         * Creates new ScheduleService service using the specified rpc implementation.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         * @returns RPC service. Useful where requests and/or responses are streamed.
         */
        public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): ScheduleService;

        /**
         * Creates a new Schedule by submitting the transaction
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public createSchedule(request: proto.ITransaction, callback: proto.ScheduleService.createScheduleCallback): void;

        /**
         * Creates a new Schedule by submitting the transaction
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public createSchedule(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * Signs a new Schedule by submitting the transaction
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public signSchedule(request: proto.ITransaction, callback: proto.ScheduleService.signScheduleCallback): void;

        /**
         * Signs a new Schedule by submitting the transaction
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public signSchedule(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * Deletes a new Schedule by submitting the transaction
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public deleteSchedule(request: proto.ITransaction, callback: proto.ScheduleService.deleteScheduleCallback): void;

        /**
         * Deletes a new Schedule by submitting the transaction
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public deleteSchedule(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * Retrieves the metadata of a schedule entity
         * @param request Query message or plain object
         * @param callback Node-style callback called with the error, if any, and Response
         */
        public getScheduleInfo(request: proto.IQuery, callback: proto.ScheduleService.getScheduleInfoCallback): void;

        /**
         * Retrieves the metadata of a schedule entity
         * @param request Query message or plain object
         * @returns Promise
         */
        public getScheduleInfo(request: proto.IQuery): Promise<proto.Response>;
    }

    namespace ScheduleService {

        /**
         * Callback as used by {@link proto.ScheduleService#createSchedule}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type createScheduleCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.ScheduleService#signSchedule}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type signScheduleCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.ScheduleService#deleteSchedule}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type deleteScheduleCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.ScheduleService#getScheduleInfo}.
         * @param error Error, if any
         * @param [response] Response
         */
        type getScheduleInfoCallback = (error: (Error|null), response?: proto.Response) => void;
    }

    /** Transactions and queries for the file service. */
    class SmartContractService extends $protobuf.rpc.Service {

        /**
         * Constructs a new SmartContractService service.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         */
        constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

        /**
         * Creates new SmartContractService service using the specified rpc implementation.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         * @returns RPC service. Useful where requests and/or responses are streamed.
         */
        public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): SmartContractService;

        /**
         * Creates a contract
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public createContract(request: proto.ITransaction, callback: proto.SmartContractService.createContractCallback): void;

        /**
         * Creates a contract
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public createContract(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * Updates a contract with the content
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public updateContract(request: proto.ITransaction, callback: proto.SmartContractService.updateContractCallback): void;

        /**
         * Updates a contract with the content
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public updateContract(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * Calls a contract
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public contractCallMethod(request: proto.ITransaction, callback: proto.SmartContractService.contractCallMethodCallback): void;

        /**
         * Calls a contract
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public contractCallMethod(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * Retrieves the contract information
         * @param request Query message or plain object
         * @param callback Node-style callback called with the error, if any, and Response
         */
        public getContractInfo(request: proto.IQuery, callback: proto.SmartContractService.getContractInfoCallback): void;

        /**
         * Retrieves the contract information
         * @param request Query message or plain object
         * @returns Promise
         */
        public getContractInfo(request: proto.IQuery): Promise<proto.Response>;

        /**
         * Calls a smart contract to be run on a single node
         * @param request Query message or plain object
         * @param callback Node-style callback called with the error, if any, and Response
         */
        public contractCallLocalMethod(request: proto.IQuery, callback: proto.SmartContractService.contractCallLocalMethodCallback): void;

        /**
         * Calls a smart contract to be run on a single node
         * @param request Query message or plain object
         * @returns Promise
         */
        public contractCallLocalMethod(request: proto.IQuery): Promise<proto.Response>;

        /**
         * Retrieves the byte code of a contract
         * @param request Query message or plain object
         * @param callback Node-style callback called with the error, if any, and Response
         */
        public contractGetBytecode(request: proto.IQuery, callback: proto.SmartContractService.ContractGetBytecodeCallback): void;

        /**
         * Retrieves the byte code of a contract
         * @param request Query message or plain object
         * @returns Promise
         */
        public contractGetBytecode(request: proto.IQuery): Promise<proto.Response>;

        /**
         * Retrieves a contract by its Solidity address
         * @param request Query message or plain object
         * @param callback Node-style callback called with the error, if any, and Response
         */
        public getBySolidityID(request: proto.IQuery, callback: proto.SmartContractService.getBySolidityIDCallback): void;

        /**
         * Retrieves a contract by its Solidity address
         * @param request Query message or plain object
         * @returns Promise
         */
        public getBySolidityID(request: proto.IQuery): Promise<proto.Response>;

        /**
         * Always returns an empty record list, as contract accounts are never effective payers for
         * transactions
         * @param request Query message or plain object
         * @param callback Node-style callback called with the error, if any, and Response
         */
        public getTxRecordByContractID(request: proto.IQuery, callback: proto.SmartContractService.getTxRecordByContractIDCallback): void;

        /**
         * Always returns an empty record list, as contract accounts are never effective payers for
         * transactions
         * @param request Query message or plain object
         * @returns Promise
         */
        public getTxRecordByContractID(request: proto.IQuery): Promise<proto.Response>;

        /**
         * Deletes a contract instance and transfers any remaining hbars to a specified receiver
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public deleteContract(request: proto.ITransaction, callback: proto.SmartContractService.deleteContractCallback): void;

        /**
         * Deletes a contract instance and transfers any remaining hbars to a specified receiver
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public deleteContract(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * Deletes a contract if the submitting account has network admin privileges
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public systemDelete(request: proto.ITransaction, callback: proto.SmartContractService.systemDeleteCallback): void;

        /**
         * Deletes a contract if the submitting account has network admin privileges
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public systemDelete(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * Undeletes a contract if the submitting account has network admin privileges
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public systemUndelete(request: proto.ITransaction, callback: proto.SmartContractService.systemUndeleteCallback): void;

        /**
         * Undeletes a contract if the submitting account has network admin privileges
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public systemUndelete(request: proto.ITransaction): Promise<proto.TransactionResponse>;
    }

    namespace SmartContractService {

        /**
         * Callback as used by {@link proto.SmartContractService#createContract}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type createContractCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.SmartContractService#updateContract}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type updateContractCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.SmartContractService#contractCallMethod}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type contractCallMethodCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.SmartContractService#getContractInfo}.
         * @param error Error, if any
         * @param [response] Response
         */
        type getContractInfoCallback = (error: (Error|null), response?: proto.Response) => void;

        /**
         * Callback as used by {@link proto.SmartContractService#contractCallLocalMethod}.
         * @param error Error, if any
         * @param [response] Response
         */
        type contractCallLocalMethodCallback = (error: (Error|null), response?: proto.Response) => void;

        /**
         * Callback as used by {@link proto.SmartContractService#contractGetBytecode}.
         * @param error Error, if any
         * @param [response] Response
         */
        type ContractGetBytecodeCallback = (error: (Error|null), response?: proto.Response) => void;

        /**
         * Callback as used by {@link proto.SmartContractService#getBySolidityID}.
         * @param error Error, if any
         * @param [response] Response
         */
        type getBySolidityIDCallback = (error: (Error|null), response?: proto.Response) => void;

        /**
         * Callback as used by {@link proto.SmartContractService#getTxRecordByContractID}.
         * @param error Error, if any
         * @param [response] Response
         */
        type getTxRecordByContractIDCallback = (error: (Error|null), response?: proto.Response) => void;

        /**
         * Callback as used by {@link proto.SmartContractService#deleteContract}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type deleteContractCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.SmartContractService#systemDelete}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type systemDeleteCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.SmartContractService#systemUndelete}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type systemUndeleteCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;
    }

    /** Properties of a ThrottleGroup. */
    interface IThrottleGroup {

        /** The operations to be throttled */
        operations?: (proto.HederaFunctionality[]|null);

        /**
         * The number of total operations per second across the entire network, multiplied by 1000. So, to
         * choose 3 operations per second (which on a network of 30 nodes is a tenth of an operation per
         * second for each node), set milliOpsPerSec = 3000. And to choose 3.6 ops per second, use
         * milliOpsPerSec = 3600. Minimum allowed value is 1, and maximum allowed value is 9223372.
         */
        milliOpsPerSec?: (Long|null);
    }

    /** A set of operations which should be collectively throttled at a given milli-ops-per-second limit. */
    class ThrottleGroup implements IThrottleGroup {

        /**
         * Constructs a new ThrottleGroup.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IThrottleGroup);

        /** The operations to be throttled */
        public operations: proto.HederaFunctionality[];

        /**
         * The number of total operations per second across the entire network, multiplied by 1000. So, to
         * choose 3 operations per second (which on a network of 30 nodes is a tenth of an operation per
         * second for each node), set milliOpsPerSec = 3000. And to choose 3.6 ops per second, use
         * milliOpsPerSec = 3600. Minimum allowed value is 1, and maximum allowed value is 9223372.
         */
        public milliOpsPerSec: Long;

        /**
         * Creates a new ThrottleGroup instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ThrottleGroup instance
         */
        public static create(properties?: proto.IThrottleGroup): proto.ThrottleGroup;

        /**
         * Encodes the specified ThrottleGroup message. Does not implicitly {@link proto.ThrottleGroup.verify|verify} messages.
         * @param m ThrottleGroup message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IThrottleGroup, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ThrottleGroup message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ThrottleGroup
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ThrottleGroup;
    }

    /** Properties of a ThrottleBucket. */
    interface IThrottleBucket {

        /** A name for this bucket (primarily for use in logs) */
        name?: (string|null);

        /**
         * The number of milliseconds required for this bucket to drain completely when full. The product
         * of this number and the least common multiple of the milliOpsPerSec values in this bucket must
         * not exceed 9223372036.
         */
        burstPeriodMs?: (Long|null);

        /** The throttle groups competing for this bucket */
        throttleGroups?: (proto.IThrottleGroup[]|null);
    }

    /** A list of throttle groups that should all compete for the same internal bucket. */
    class ThrottleBucket implements IThrottleBucket {

        /**
         * Constructs a new ThrottleBucket.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IThrottleBucket);

        /** A name for this bucket (primarily for use in logs) */
        public name: string;

        /**
         * The number of milliseconds required for this bucket to drain completely when full. The product
         * of this number and the least common multiple of the milliOpsPerSec values in this bucket must
         * not exceed 9223372036.
         */
        public burstPeriodMs: Long;

        /** The throttle groups competing for this bucket */
        public throttleGroups: proto.IThrottleGroup[];

        /**
         * Creates a new ThrottleBucket instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ThrottleBucket instance
         */
        public static create(properties?: proto.IThrottleBucket): proto.ThrottleBucket;

        /**
         * Encodes the specified ThrottleBucket message. Does not implicitly {@link proto.ThrottleBucket.verify|verify} messages.
         * @param m ThrottleBucket message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IThrottleBucket, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ThrottleBucket message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ThrottleBucket
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ThrottleBucket;
    }

    /** Properties of a ThrottleDefinitions. */
    interface IThrottleDefinitions {

        /** ThrottleDefinitions throttleBuckets */
        throttleBuckets?: (proto.IThrottleBucket[]|null);
    }

    /**
     * A list of throttle buckets which, simultaneously enforced, define the system's throttling policy.
     * <ol>
     * <li> When an operation appears in more than one throttling bucket, all its buckets must have room
     * or it will be throttled.</li>
     * <li>An operation assigned to no buckets is always throttled.</li>
     * </ol>
     */
    class ThrottleDefinitions implements IThrottleDefinitions {

        /**
         * Constructs a new ThrottleDefinitions.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IThrottleDefinitions);

        /** ThrottleDefinitions throttleBuckets. */
        public throttleBuckets: proto.IThrottleBucket[];

        /**
         * Creates a new ThrottleDefinitions instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ThrottleDefinitions instance
         */
        public static create(properties?: proto.IThrottleDefinitions): proto.ThrottleDefinitions;

        /**
         * Encodes the specified ThrottleDefinitions message. Does not implicitly {@link proto.ThrottleDefinitions.verify|verify} messages.
         * @param m ThrottleDefinitions message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IThrottleDefinitions, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ThrottleDefinitions message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ThrottleDefinitions
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.ThrottleDefinitions;
    }

    /** Transactions and queries for the Token Service */
    class TokenService extends $protobuf.rpc.Service {

        /**
         * Constructs a new TokenService service.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         */
        constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

        /**
         * Creates new TokenService service using the specified rpc implementation.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         * @returns RPC service. Useful where requests and/or responses are streamed.
         */
        public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): TokenService;

        /**
         * Creates a new Token by submitting the transaction
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public createToken(request: proto.ITransaction, callback: proto.TokenService.createTokenCallback): void;

        /**
         * Creates a new Token by submitting the transaction
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public createToken(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * Updates the account by submitting the transaction
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public updateToken(request: proto.ITransaction, callback: proto.TokenService.updateTokenCallback): void;

        /**
         * Updates the account by submitting the transaction
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public updateToken(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * Mints an amount of the token to the defined treasury account
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public mintToken(request: proto.ITransaction, callback: proto.TokenService.mintTokenCallback): void;

        /**
         * Mints an amount of the token to the defined treasury account
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public mintToken(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * Burns an amount of the token from the defined treasury account
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public burnToken(request: proto.ITransaction, callback: proto.TokenService.burnTokenCallback): void;

        /**
         * Burns an amount of the token from the defined treasury account
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public burnToken(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * Deletes a Token
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public deleteToken(request: proto.ITransaction, callback: proto.TokenService.deleteTokenCallback): void;

        /**
         * Deletes a Token
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public deleteToken(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * Wipes the provided amount of tokens from the specified Account ID
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public wipeTokenAccount(request: proto.ITransaction, callback: proto.TokenService.wipeTokenAccountCallback): void;

        /**
         * Wipes the provided amount of tokens from the specified Account ID
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public wipeTokenAccount(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * Freezes the transfer of tokens to or from the specified Account ID
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public freezeTokenAccount(request: proto.ITransaction, callback: proto.TokenService.freezeTokenAccountCallback): void;

        /**
         * Freezes the transfer of tokens to or from the specified Account ID
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public freezeTokenAccount(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * Unfreezes the transfer of tokens to or from the specified Account ID
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public unfreezeTokenAccount(request: proto.ITransaction, callback: proto.TokenService.unfreezeTokenAccountCallback): void;

        /**
         * Unfreezes the transfer of tokens to or from the specified Account ID
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public unfreezeTokenAccount(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * Flags the provided Account ID as having gone through KYC
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public grantKycToTokenAccount(request: proto.ITransaction, callback: proto.TokenService.grantKycToTokenAccountCallback): void;

        /**
         * Flags the provided Account ID as having gone through KYC
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public grantKycToTokenAccount(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * Removes the KYC flag of the provided Account ID
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public revokeKycFromTokenAccount(request: proto.ITransaction, callback: proto.TokenService.revokeKycFromTokenAccountCallback): void;

        /**
         * Removes the KYC flag of the provided Account ID
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public revokeKycFromTokenAccount(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * Associates tokens to an account
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public associateTokens(request: proto.ITransaction, callback: proto.TokenService.associateTokensCallback): void;

        /**
         * Associates tokens to an account
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public associateTokens(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * Dissociates tokens from an account
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public dissociateTokens(request: proto.ITransaction, callback: proto.TokenService.dissociateTokensCallback): void;

        /**
         * Dissociates tokens from an account
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public dissociateTokens(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * Updates the custom fee schedule on a token
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public updateTokenFeeSchedule(request: proto.ITransaction, callback: proto.TokenService.updateTokenFeeScheduleCallback): void;

        /**
         * Updates the custom fee schedule on a token
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public updateTokenFeeSchedule(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * Retrieves the metadata of a token
         * @param request Query message or plain object
         * @param callback Node-style callback called with the error, if any, and Response
         */
        public getTokenInfo(request: proto.IQuery, callback: proto.TokenService.getTokenInfoCallback): void;

        /**
         * Retrieves the metadata of a token
         * @param request Query message or plain object
         * @returns Promise
         */
        public getTokenInfo(request: proto.IQuery): Promise<proto.Response>;

        /**
         * Gets info on NFTs N through M on the list of NFTs associated with a given account
         * @param request Query message or plain object
         * @param callback Node-style callback called with the error, if any, and Response
         */
        public getAccountNftInfos(request: proto.IQuery, callback: proto.TokenService.getAccountNftInfosCallback): void;

        /**
         * Gets info on NFTs N through M on the list of NFTs associated with a given account
         * @param request Query message or plain object
         * @returns Promise
         */
        public getAccountNftInfos(request: proto.IQuery): Promise<proto.Response>;

        /**
         * Retrieves the metadata of an NFT by TokenID and serial number
         * @param request Query message or plain object
         * @param callback Node-style callback called with the error, if any, and Response
         */
        public getTokenNftInfo(request: proto.IQuery, callback: proto.TokenService.getTokenNftInfoCallback): void;

        /**
         * Retrieves the metadata of an NFT by TokenID and serial number
         * @param request Query message or plain object
         * @returns Promise
         */
        public getTokenNftInfo(request: proto.IQuery): Promise<proto.Response>;

        /**
         * Gets info on NFTs N through M on the list of NFTs associated with a given Token of type NON_FUNGIBLE
         * @param request Query message or plain object
         * @param callback Node-style callback called with the error, if any, and Response
         */
        public getTokenNftInfos(request: proto.IQuery, callback: proto.TokenService.getTokenNftInfosCallback): void;

        /**
         * Gets info on NFTs N through M on the list of NFTs associated with a given Token of type NON_FUNGIBLE
         * @param request Query message or plain object
         * @returns Promise
         */
        public getTokenNftInfos(request: proto.IQuery): Promise<proto.Response>;

        /**
         * Pause the token
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public pauseToken(request: proto.ITransaction, callback: proto.TokenService.pauseTokenCallback): void;

        /**
         * Pause the token
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public pauseToken(request: proto.ITransaction): Promise<proto.TransactionResponse>;

        /**
         * Unpause the token
         * @param request Transaction message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionResponse
         */
        public unpauseToken(request: proto.ITransaction, callback: proto.TokenService.unpauseTokenCallback): void;

        /**
         * Unpause the token
         * @param request Transaction message or plain object
         * @returns Promise
         */
        public unpauseToken(request: proto.ITransaction): Promise<proto.TransactionResponse>;
    }

    namespace TokenService {

        /**
         * Callback as used by {@link proto.TokenService#createToken}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type createTokenCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.TokenService#updateToken}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type updateTokenCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.TokenService#mintToken}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type mintTokenCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.TokenService#burnToken}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type burnTokenCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.TokenService#deleteToken}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type deleteTokenCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.TokenService#wipeTokenAccount}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type wipeTokenAccountCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.TokenService#freezeTokenAccount}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type freezeTokenAccountCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.TokenService#unfreezeTokenAccount}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type unfreezeTokenAccountCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.TokenService#grantKycToTokenAccount}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type grantKycToTokenAccountCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.TokenService#revokeKycFromTokenAccount}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type revokeKycFromTokenAccountCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.TokenService#associateTokens}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type associateTokensCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.TokenService#dissociateTokens}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type dissociateTokensCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.TokenService#updateTokenFeeSchedule}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type updateTokenFeeScheduleCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.TokenService#getTokenInfo}.
         * @param error Error, if any
         * @param [response] Response
         */
        type getTokenInfoCallback = (error: (Error|null), response?: proto.Response) => void;

        /**
         * Callback as used by {@link proto.TokenService#getAccountNftInfos}.
         * @param error Error, if any
         * @param [response] Response
         */
        type getAccountNftInfosCallback = (error: (Error|null), response?: proto.Response) => void;

        /**
         * Callback as used by {@link proto.TokenService#getTokenNftInfo}.
         * @param error Error, if any
         * @param [response] Response
         */
        type getTokenNftInfoCallback = (error: (Error|null), response?: proto.Response) => void;

        /**
         * Callback as used by {@link proto.TokenService#getTokenNftInfos}.
         * @param error Error, if any
         * @param [response] Response
         */
        type getTokenNftInfosCallback = (error: (Error|null), response?: proto.Response) => void;

        /**
         * Callback as used by {@link proto.TokenService#pauseToken}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type pauseTokenCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;

        /**
         * Callback as used by {@link proto.TokenService#unpauseToken}.
         * @param error Error, if any
         * @param [response] TransactionResponse
         */
        type unpauseTokenCallback = (error: (Error|null), response?: proto.TransactionResponse) => void;
    }

    /** Properties of a SignedTransaction. */
    interface ISignedTransaction {

        /** TransactionBody serialized into bytes, which needs to be signed */
        bodyBytes?: (Uint8Array|null);

        /** The signatures on the body with the new format, to authorize the transaction */
        sigMap?: (proto.ISignatureMap|null);
    }

    /** Represents a SignedTransaction. */
    class SignedTransaction implements ISignedTransaction {

        /**
         * Constructs a new SignedTransaction.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ISignedTransaction);

        /** TransactionBody serialized into bytes, which needs to be signed */
        public bodyBytes: Uint8Array;

        /** The signatures on the body with the new format, to authorize the transaction */
        public sigMap?: (proto.ISignatureMap|null);

        /**
         * Creates a new SignedTransaction instance using the specified properties.
         * @param [properties] Properties to set
         * @returns SignedTransaction instance
         */
        public static create(properties?: proto.ISignedTransaction): proto.SignedTransaction;

        /**
         * Encodes the specified SignedTransaction message. Does not implicitly {@link proto.SignedTransaction.verify|verify} messages.
         * @param m SignedTransaction message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ISignedTransaction, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SignedTransaction message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns SignedTransaction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.SignedTransaction;
    }

    /** Properties of a TransactionList. */
    interface ITransactionList {

        /** TransactionList transactionList */
        transactionList?: (proto.ITransaction[]|null);
    }

    /**
     * A simple protobuf wrapper to store a list of transactions. This is used by
     * `Transaction.[from|to]Bytes()` in the SDKs. The reason the SDK needs a list of transactions is
     * because it holds onto a transaction per node. So if a transaction is to be submitted to nodes 3
     * and 4 the SDK Transaction type would contain a list of 2 protobuf transactions, one for node 3
     * and one for node 4.
     */
    class TransactionList implements ITransactionList {

        /**
         * Constructs a new TransactionList.
         * @param [p] Properties to set
         */
        constructor(p?: proto.ITransactionList);

        /** TransactionList transactionList. */
        public transactionList: proto.ITransaction[];

        /**
         * Creates a new TransactionList instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TransactionList instance
         */
        public static create(properties?: proto.ITransactionList): proto.TransactionList;

        /**
         * Encodes the specified TransactionList message. Does not implicitly {@link proto.TransactionList.verify|verify} messages.
         * @param m TransactionList message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.ITransactionList, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TransactionList message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TransactionList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.TransactionList;
    }

    /** Properties of a DoubleValue. */
    interface IDoubleValue {

        /** DoubleValue value */
        value?: (number|null);
    }

    /** Represents a DoubleValue. */
    class DoubleValue implements IDoubleValue {

        /**
         * Constructs a new DoubleValue.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IDoubleValue);

        /** DoubleValue value. */
        public value: number;

        /**
         * Creates a new DoubleValue instance using the specified properties.
         * @param [properties] Properties to set
         * @returns DoubleValue instance
         */
        public static create(properties?: proto.IDoubleValue): proto.DoubleValue;

        /**
         * Encodes the specified DoubleValue message. Does not implicitly {@link proto.DoubleValue.verify|verify} messages.
         * @param m DoubleValue message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IDoubleValue, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a DoubleValue message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns DoubleValue
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.DoubleValue;
    }

    /** Properties of a FloatValue. */
    interface IFloatValue {

        /** FloatValue value */
        value?: (number|null);
    }

    /** Represents a FloatValue. */
    class FloatValue implements IFloatValue {

        /**
         * Constructs a new FloatValue.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IFloatValue);

        /** FloatValue value. */
        public value: number;

        /**
         * Creates a new FloatValue instance using the specified properties.
         * @param [properties] Properties to set
         * @returns FloatValue instance
         */
        public static create(properties?: proto.IFloatValue): proto.FloatValue;

        /**
         * Encodes the specified FloatValue message. Does not implicitly {@link proto.FloatValue.verify|verify} messages.
         * @param m FloatValue message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IFloatValue, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a FloatValue message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns FloatValue
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.FloatValue;
    }

    /** Properties of an Int64Value. */
    interface IInt64Value {

        /** Int64Value value */
        value?: (Long|null);
    }

    /** Represents an Int64Value. */
    class Int64Value implements IInt64Value {

        /**
         * Constructs a new Int64Value.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IInt64Value);

        /** Int64Value value. */
        public value: Long;

        /**
         * Creates a new Int64Value instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Int64Value instance
         */
        public static create(properties?: proto.IInt64Value): proto.Int64Value;

        /**
         * Encodes the specified Int64Value message. Does not implicitly {@link proto.Int64Value.verify|verify} messages.
         * @param m Int64Value message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IInt64Value, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Int64Value message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Int64Value
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.Int64Value;
    }

    /** Properties of a UInt64Value. */
    interface IUInt64Value {

        /** UInt64Value value */
        value?: (Long|null);
    }

    /** Represents a UInt64Value. */
    class UInt64Value implements IUInt64Value {

        /**
         * Constructs a new UInt64Value.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IUInt64Value);

        /** UInt64Value value. */
        public value: Long;

        /**
         * Creates a new UInt64Value instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UInt64Value instance
         */
        public static create(properties?: proto.IUInt64Value): proto.UInt64Value;

        /**
         * Encodes the specified UInt64Value message. Does not implicitly {@link proto.UInt64Value.verify|verify} messages.
         * @param m UInt64Value message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IUInt64Value, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a UInt64Value message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns UInt64Value
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.UInt64Value;
    }

    /** Properties of an Int32Value. */
    interface IInt32Value {

        /** Int32Value value */
        value?: (number|null);
    }

    /** Represents an Int32Value. */
    class Int32Value implements IInt32Value {

        /**
         * Constructs a new Int32Value.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IInt32Value);

        /** Int32Value value. */
        public value: number;

        /**
         * Creates a new Int32Value instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Int32Value instance
         */
        public static create(properties?: proto.IInt32Value): proto.Int32Value;

        /**
         * Encodes the specified Int32Value message. Does not implicitly {@link proto.Int32Value.verify|verify} messages.
         * @param m Int32Value message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IInt32Value, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Int32Value message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Int32Value
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.Int32Value;
    }

    /** Properties of a UInt32Value. */
    interface IUInt32Value {

        /** UInt32Value value */
        value?: (number|null);
    }

    /** Represents a UInt32Value. */
    class UInt32Value implements IUInt32Value {

        /**
         * Constructs a new UInt32Value.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IUInt32Value);

        /** UInt32Value value. */
        public value: number;

        /**
         * Creates a new UInt32Value instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UInt32Value instance
         */
        public static create(properties?: proto.IUInt32Value): proto.UInt32Value;

        /**
         * Encodes the specified UInt32Value message. Does not implicitly {@link proto.UInt32Value.verify|verify} messages.
         * @param m UInt32Value message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IUInt32Value, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a UInt32Value message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns UInt32Value
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.UInt32Value;
    }

    /** Properties of a BoolValue. */
    interface IBoolValue {

        /** BoolValue value */
        value?: (boolean|null);
    }

    /** Represents a BoolValue. */
    class BoolValue implements IBoolValue {

        /**
         * Constructs a new BoolValue.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IBoolValue);

        /** BoolValue value. */
        public value: boolean;

        /**
         * Creates a new BoolValue instance using the specified properties.
         * @param [properties] Properties to set
         * @returns BoolValue instance
         */
        public static create(properties?: proto.IBoolValue): proto.BoolValue;

        /**
         * Encodes the specified BoolValue message. Does not implicitly {@link proto.BoolValue.verify|verify} messages.
         * @param m BoolValue message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IBoolValue, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a BoolValue message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns BoolValue
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.BoolValue;
    }

    /** Properties of a StringValue. */
    interface IStringValue {

        /** StringValue value */
        value?: (string|null);
    }

    /** Represents a StringValue. */
    class StringValue implements IStringValue {

        /**
         * Constructs a new StringValue.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IStringValue);

        /** StringValue value. */
        public value: string;

        /**
         * Creates a new StringValue instance using the specified properties.
         * @param [properties] Properties to set
         * @returns StringValue instance
         */
        public static create(properties?: proto.IStringValue): proto.StringValue;

        /**
         * Encodes the specified StringValue message. Does not implicitly {@link proto.StringValue.verify|verify} messages.
         * @param m StringValue message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IStringValue, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a StringValue message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns StringValue
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.StringValue;
    }

    /** Properties of a BytesValue. */
    interface IBytesValue {

        /** BytesValue value */
        value?: (Uint8Array|null);
    }

    /** Represents a BytesValue. */
    class BytesValue implements IBytesValue {

        /**
         * Constructs a new BytesValue.
         * @param [p] Properties to set
         */
        constructor(p?: proto.IBytesValue);

        /** BytesValue value. */
        public value: Uint8Array;

        /**
         * Creates a new BytesValue instance using the specified properties.
         * @param [properties] Properties to set
         * @returns BytesValue instance
         */
        public static create(properties?: proto.IBytesValue): proto.BytesValue;

        /**
         * Encodes the specified BytesValue message. Does not implicitly {@link proto.BytesValue.verify|verify} messages.
         * @param m BytesValue message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: proto.IBytesValue, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a BytesValue message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns BytesValue
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): proto.BytesValue;
    }
}

/** Namespace google. */
export namespace google {

    /** Namespace protobuf. */
    namespace protobuf {

        /** Properties of a DoubleValue. */
        interface IDoubleValue {

            /** DoubleValue value */
            value?: (number|null);
        }

        /** Represents a DoubleValue. */
        class DoubleValue implements IDoubleValue {

            /**
             * Constructs a new DoubleValue.
             * @param [p] Properties to set
             */
            constructor(p?: google.protobuf.IDoubleValue);

            /** DoubleValue value. */
            public value: number;

            /**
             * Creates a new DoubleValue instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DoubleValue instance
             */
            public static create(properties?: google.protobuf.IDoubleValue): google.protobuf.DoubleValue;

            /**
             * Encodes the specified DoubleValue message. Does not implicitly {@link google.protobuf.DoubleValue.verify|verify} messages.
             * @param m DoubleValue message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: google.protobuf.IDoubleValue, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DoubleValue message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns DoubleValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): google.protobuf.DoubleValue;
        }

        /** Properties of a FloatValue. */
        interface IFloatValue {

            /** FloatValue value */
            value?: (number|null);
        }

        /** Represents a FloatValue. */
        class FloatValue implements IFloatValue {

            /**
             * Constructs a new FloatValue.
             * @param [p] Properties to set
             */
            constructor(p?: google.protobuf.IFloatValue);

            /** FloatValue value. */
            public value: number;

            /**
             * Creates a new FloatValue instance using the specified properties.
             * @param [properties] Properties to set
             * @returns FloatValue instance
             */
            public static create(properties?: google.protobuf.IFloatValue): google.protobuf.FloatValue;

            /**
             * Encodes the specified FloatValue message. Does not implicitly {@link google.protobuf.FloatValue.verify|verify} messages.
             * @param m FloatValue message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: google.protobuf.IFloatValue, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a FloatValue message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns FloatValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): google.protobuf.FloatValue;
        }

        /** Properties of an Int64Value. */
        interface IInt64Value {

            /** Int64Value value */
            value?: (Long|null);
        }

        /** Represents an Int64Value. */
        class Int64Value implements IInt64Value {

            /**
             * Constructs a new Int64Value.
             * @param [p] Properties to set
             */
            constructor(p?: google.protobuf.IInt64Value);

            /** Int64Value value. */
            public value: Long;

            /**
             * Creates a new Int64Value instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Int64Value instance
             */
            public static create(properties?: google.protobuf.IInt64Value): google.protobuf.Int64Value;

            /**
             * Encodes the specified Int64Value message. Does not implicitly {@link google.protobuf.Int64Value.verify|verify} messages.
             * @param m Int64Value message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: google.protobuf.IInt64Value, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Int64Value message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns Int64Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): google.protobuf.Int64Value;
        }

        /** Properties of a UInt64Value. */
        interface IUInt64Value {

            /** UInt64Value value */
            value?: (Long|null);
        }

        /** Represents a UInt64Value. */
        class UInt64Value implements IUInt64Value {

            /**
             * Constructs a new UInt64Value.
             * @param [p] Properties to set
             */
            constructor(p?: google.protobuf.IUInt64Value);

            /** UInt64Value value. */
            public value: Long;

            /**
             * Creates a new UInt64Value instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UInt64Value instance
             */
            public static create(properties?: google.protobuf.IUInt64Value): google.protobuf.UInt64Value;

            /**
             * Encodes the specified UInt64Value message. Does not implicitly {@link google.protobuf.UInt64Value.verify|verify} messages.
             * @param m UInt64Value message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: google.protobuf.IUInt64Value, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a UInt64Value message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns UInt64Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): google.protobuf.UInt64Value;
        }

        /** Properties of an Int32Value. */
        interface IInt32Value {

            /** Int32Value value */
            value?: (number|null);
        }

        /** Represents an Int32Value. */
        class Int32Value implements IInt32Value {

            /**
             * Constructs a new Int32Value.
             * @param [p] Properties to set
             */
            constructor(p?: google.protobuf.IInt32Value);

            /** Int32Value value. */
            public value: number;

            /**
             * Creates a new Int32Value instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Int32Value instance
             */
            public static create(properties?: google.protobuf.IInt32Value): google.protobuf.Int32Value;

            /**
             * Encodes the specified Int32Value message. Does not implicitly {@link google.protobuf.Int32Value.verify|verify} messages.
             * @param m Int32Value message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: google.protobuf.IInt32Value, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Int32Value message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns Int32Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): google.protobuf.Int32Value;
        }

        /** Properties of a UInt32Value. */
        interface IUInt32Value {

            /** UInt32Value value */
            value?: (number|null);
        }

        /** Represents a UInt32Value. */
        class UInt32Value implements IUInt32Value {

            /**
             * Constructs a new UInt32Value.
             * @param [p] Properties to set
             */
            constructor(p?: google.protobuf.IUInt32Value);

            /** UInt32Value value. */
            public value: number;

            /**
             * Creates a new UInt32Value instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UInt32Value instance
             */
            public static create(properties?: google.protobuf.IUInt32Value): google.protobuf.UInt32Value;

            /**
             * Encodes the specified UInt32Value message. Does not implicitly {@link google.protobuf.UInt32Value.verify|verify} messages.
             * @param m UInt32Value message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: google.protobuf.IUInt32Value, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a UInt32Value message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns UInt32Value
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): google.protobuf.UInt32Value;
        }

        /** Properties of a BoolValue. */
        interface IBoolValue {

            /** BoolValue value */
            value?: (boolean|null);
        }

        /** Represents a BoolValue. */
        class BoolValue implements IBoolValue {

            /**
             * Constructs a new BoolValue.
             * @param [p] Properties to set
             */
            constructor(p?: google.protobuf.IBoolValue);

            /** BoolValue value. */
            public value: boolean;

            /**
             * Creates a new BoolValue instance using the specified properties.
             * @param [properties] Properties to set
             * @returns BoolValue instance
             */
            public static create(properties?: google.protobuf.IBoolValue): google.protobuf.BoolValue;

            /**
             * Encodes the specified BoolValue message. Does not implicitly {@link google.protobuf.BoolValue.verify|verify} messages.
             * @param m BoolValue message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: google.protobuf.IBoolValue, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a BoolValue message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns BoolValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): google.protobuf.BoolValue;
        }

        /** Properties of a StringValue. */
        interface IStringValue {

            /** StringValue value */
            value?: (string|null);
        }

        /** Represents a StringValue. */
        class StringValue implements IStringValue {

            /**
             * Constructs a new StringValue.
             * @param [p] Properties to set
             */
            constructor(p?: google.protobuf.IStringValue);

            /** StringValue value. */
            public value: string;

            /**
             * Creates a new StringValue instance using the specified properties.
             * @param [properties] Properties to set
             * @returns StringValue instance
             */
            public static create(properties?: google.protobuf.IStringValue): google.protobuf.StringValue;

            /**
             * Encodes the specified StringValue message. Does not implicitly {@link google.protobuf.StringValue.verify|verify} messages.
             * @param m StringValue message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: google.protobuf.IStringValue, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a StringValue message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns StringValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): google.protobuf.StringValue;
        }

        /** Properties of a BytesValue. */
        interface IBytesValue {

            /** BytesValue value */
            value?: (Uint8Array|null);
        }

        /** Represents a BytesValue. */
        class BytesValue implements IBytesValue {

            /**
             * Constructs a new BytesValue.
             * @param [p] Properties to set
             */
            constructor(p?: google.protobuf.IBytesValue);

            /** BytesValue value. */
            public value: Uint8Array;

            /**
             * Creates a new BytesValue instance using the specified properties.
             * @param [properties] Properties to set
             * @returns BytesValue instance
             */
            public static create(properties?: google.protobuf.IBytesValue): google.protobuf.BytesValue;

            /**
             * Encodes the specified BytesValue message. Does not implicitly {@link google.protobuf.BytesValue.verify|verify} messages.
             * @param m BytesValue message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(m: google.protobuf.IBytesValue, w?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a BytesValue message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns BytesValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(r: ($protobuf.Reader|Uint8Array), l?: number): google.protobuf.BytesValue;
        }
    }
}
