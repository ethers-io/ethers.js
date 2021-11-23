import * as $protobuf from "protobufjs/minimal.js";
import { proto } from "./proto.js";

// re-export protobuf reader and writer for usage by @hashgraph/sdk
import Reader = $protobuf.Reader;
import Writer = $protobuf.Writer;

export { Reader, Writer };

import ITokenUnitBalance = proto.ITokenUnitBalance;
import TokenUnitBalance = proto.TokenUnitBalance;
import ISingleAccountBalances = proto.ISingleAccountBalances;
import SingleAccountBalances = proto.SingleAccountBalances;
import IAllAccountBalances = proto.IAllAccountBalances;
import AllAccountBalances = proto.AllAccountBalances;
import IShardID = proto.IShardID;
import ShardID = proto.ShardID;
import IRealmID = proto.IRealmID;
import RealmID = proto.RealmID;
import IAccountID = proto.IAccountID;
import AccountID = proto.AccountID;
import IFileID = proto.IFileID;
import FileID = proto.FileID;
import IContractID = proto.IContractID;
import ContractID = proto.ContractID;
import ITransactionID = proto.ITransactionID;
import TransactionID = proto.TransactionID;
import IAccountAmount = proto.IAccountAmount;
import AccountAmount = proto.AccountAmount;
import ITransferList = proto.ITransferList;
import TransferList = proto.TransferList;
import INftTransfer = proto.INftTransfer;
import NftTransfer = proto.NftTransfer;
import ITokenTransferList = proto.ITokenTransferList;
import TokenTransferList = proto.TokenTransferList;
import IFraction = proto.IFraction;
import Fraction = proto.Fraction;
import ITopicID = proto.ITopicID;
import TopicID = proto.TopicID;
import ITokenID = proto.ITokenID;
import TokenID = proto.TokenID;
import IScheduleID = proto.IScheduleID;
import ScheduleID = proto.ScheduleID;
import TokenType = proto.TokenType;
import SubType = proto.SubType;
import TokenSupplyType = proto.TokenSupplyType;
import TokenFreezeStatus = proto.TokenFreezeStatus;
import TokenKycStatus = proto.TokenKycStatus;
import IKey = proto.IKey;
import Key = proto.Key;
import IThresholdKey = proto.IThresholdKey;
import ThresholdKey = proto.ThresholdKey;
import IKeyList = proto.IKeyList;
import KeyList = proto.KeyList;
import ISignature = proto.ISignature;
import Signature = proto.Signature;
import IThresholdSignature = proto.IThresholdSignature;
import ThresholdSignature = proto.ThresholdSignature;
import ISignatureList = proto.ISignatureList;
import SignatureList = proto.SignatureList;
import ISignaturePair = proto.ISignaturePair;
import SignaturePair = proto.SignaturePair;
import ISignatureMap = proto.ISignatureMap;
import SignatureMap = proto.SignatureMap;
import HederaFunctionality = proto.HederaFunctionality;
import IFeeComponents = proto.IFeeComponents;
import FeeComponents = proto.FeeComponents;
import ITransactionFeeSchedule = proto.ITransactionFeeSchedule;
import TransactionFeeSchedule = proto.TransactionFeeSchedule;
import IFeeData = proto.IFeeData;
import FeeData = proto.FeeData;
import IFeeSchedule = proto.IFeeSchedule;
import FeeSchedule = proto.FeeSchedule;
import ICurrentAndNextFeeSchedule = proto.ICurrentAndNextFeeSchedule;
import CurrentAndNextFeeSchedule = proto.CurrentAndNextFeeSchedule;
import IServiceEndpoint = proto.IServiceEndpoint;
import ServiceEndpoint = proto.ServiceEndpoint;
import INodeAddress = proto.INodeAddress;
import NodeAddress = proto.NodeAddress;
import INodeAddressBook = proto.INodeAddressBook;
import NodeAddressBook = proto.NodeAddressBook;
import ISemanticVersion = proto.ISemanticVersion;
import SemanticVersion = proto.SemanticVersion;
import ISetting = proto.ISetting;
import Setting = proto.Setting;
import IServicesConfigurationList = proto.IServicesConfigurationList;
import ServicesConfigurationList = proto.ServicesConfigurationList;
import ITokenRelationship = proto.ITokenRelationship;
import TokenRelationship = proto.TokenRelationship;
import ITokenBalance = proto.ITokenBalance;
import TokenBalance = proto.TokenBalance;
import ITokenBalances = proto.ITokenBalances;
import TokenBalances = proto.TokenBalances;
import ITokenAssociation = proto.ITokenAssociation;
import TokenAssociation = proto.TokenAssociation;
import ITimestamp = proto.ITimestamp;
import Timestamp = proto.Timestamp;
import ITimestampSeconds = proto.ITimestampSeconds;
import TimestampSeconds = proto.TimestampSeconds;
import IConsensusCreateTopicTransactionBody = proto.IConsensusCreateTopicTransactionBody;
import ConsensusCreateTopicTransactionBody = proto.ConsensusCreateTopicTransactionBody;
import IDuration = proto.IDuration;
import Duration = proto.Duration;
import IConsensusDeleteTopicTransactionBody = proto.IConsensusDeleteTopicTransactionBody;
import ConsensusDeleteTopicTransactionBody = proto.ConsensusDeleteTopicTransactionBody;
import IConsensusGetTopicInfoQuery = proto.IConsensusGetTopicInfoQuery;
import ConsensusGetTopicInfoQuery = proto.ConsensusGetTopicInfoQuery;
import IConsensusGetTopicInfoResponse = proto.IConsensusGetTopicInfoResponse;
import ConsensusGetTopicInfoResponse = proto.ConsensusGetTopicInfoResponse;
import ResponseType = proto.ResponseType;
import IQueryHeader = proto.IQueryHeader;
import QueryHeader = proto.QueryHeader;
import ITransaction = proto.ITransaction;
import Transaction = proto.Transaction;
import ITransactionBody = proto.ITransactionBody;
import TransactionBody = proto.TransactionBody;
import ISystemDeleteTransactionBody = proto.ISystemDeleteTransactionBody;
import SystemDeleteTransactionBody = proto.SystemDeleteTransactionBody;
import ISystemUndeleteTransactionBody = proto.ISystemUndeleteTransactionBody;
import SystemUndeleteTransactionBody = proto.SystemUndeleteTransactionBody;
import IFreezeTransactionBody = proto.IFreezeTransactionBody;
import FreezeTransactionBody = proto.FreezeTransactionBody;
import IContractCallTransactionBody = proto.IContractCallTransactionBody;
import ContractCallTransactionBody = proto.ContractCallTransactionBody;
import IContractCreateTransactionBody = proto.IContractCreateTransactionBody;
import ContractCreateTransactionBody = proto.ContractCreateTransactionBody;
import IContractUpdateTransactionBody = proto.IContractUpdateTransactionBody;
import ContractUpdateTransactionBody = proto.ContractUpdateTransactionBody;
import ILiveHash = proto.ILiveHash;
import LiveHash = proto.LiveHash;
import ICryptoAddLiveHashTransactionBody = proto.ICryptoAddLiveHashTransactionBody;
import CryptoAddLiveHashTransactionBody = proto.CryptoAddLiveHashTransactionBody;
import ICryptoCreateTransactionBody = proto.ICryptoCreateTransactionBody;
import CryptoCreateTransactionBody = proto.CryptoCreateTransactionBody;
import ICryptoDeleteTransactionBody = proto.ICryptoDeleteTransactionBody;
import CryptoDeleteTransactionBody = proto.CryptoDeleteTransactionBody;
import ICryptoDeleteLiveHashTransactionBody = proto.ICryptoDeleteLiveHashTransactionBody;
import CryptoDeleteLiveHashTransactionBody = proto.CryptoDeleteLiveHashTransactionBody;
import ICryptoTransferTransactionBody = proto.ICryptoTransferTransactionBody;
import CryptoTransferTransactionBody = proto.CryptoTransferTransactionBody;
import ICryptoUpdateTransactionBody = proto.ICryptoUpdateTransactionBody;
import CryptoUpdateTransactionBody = proto.CryptoUpdateTransactionBody;
import IFileAppendTransactionBody = proto.IFileAppendTransactionBody;
import FileAppendTransactionBody = proto.FileAppendTransactionBody;
import IFileCreateTransactionBody = proto.IFileCreateTransactionBody;
import FileCreateTransactionBody = proto.FileCreateTransactionBody;
import IFileDeleteTransactionBody = proto.IFileDeleteTransactionBody;
import FileDeleteTransactionBody = proto.FileDeleteTransactionBody;
import IFileUpdateTransactionBody = proto.IFileUpdateTransactionBody;
import FileUpdateTransactionBody = proto.FileUpdateTransactionBody;
import IContractDeleteTransactionBody = proto.IContractDeleteTransactionBody;
import ContractDeleteTransactionBody = proto.ContractDeleteTransactionBody;
import IConsensusUpdateTopicTransactionBody = proto.IConsensusUpdateTopicTransactionBody;
import ConsensusUpdateTopicTransactionBody = proto.ConsensusUpdateTopicTransactionBody;
import IConsensusMessageChunkInfo = proto.IConsensusMessageChunkInfo;
import ConsensusMessageChunkInfo = proto.ConsensusMessageChunkInfo;
import IConsensusSubmitMessageTransactionBody = proto.IConsensusSubmitMessageTransactionBody;
import ConsensusSubmitMessageTransactionBody = proto.ConsensusSubmitMessageTransactionBody;
import IUncheckedSubmitBody = proto.IUncheckedSubmitBody;
import UncheckedSubmitBody = proto.UncheckedSubmitBody;
import ITokenCreateTransactionBody = proto.ITokenCreateTransactionBody;
import TokenCreateTransactionBody = proto.TokenCreateTransactionBody;
import IFractionalFee = proto.IFractionalFee;
import FractionalFee = proto.FractionalFee;
import IFixedFee = proto.IFixedFee;
import FixedFee = proto.FixedFee;
import IRoyaltyFee = proto.IRoyaltyFee;
import RoyaltyFee = proto.RoyaltyFee;
import ICustomFee = proto.ICustomFee;
import CustomFee = proto.CustomFee;
import IAssessedCustomFee = proto.IAssessedCustomFee;
import AssessedCustomFee = proto.AssessedCustomFee;
import ITokenFreezeAccountTransactionBody = proto.ITokenFreezeAccountTransactionBody;
import TokenFreezeAccountTransactionBody = proto.TokenFreezeAccountTransactionBody;
import ITokenUnfreezeAccountTransactionBody = proto.ITokenUnfreezeAccountTransactionBody;
import TokenUnfreezeAccountTransactionBody = proto.TokenUnfreezeAccountTransactionBody;
import ITokenGrantKycTransactionBody = proto.ITokenGrantKycTransactionBody;
import TokenGrantKycTransactionBody = proto.TokenGrantKycTransactionBody;
import ITokenRevokeKycTransactionBody = proto.ITokenRevokeKycTransactionBody;
import TokenRevokeKycTransactionBody = proto.TokenRevokeKycTransactionBody;
import ITokenDeleteTransactionBody = proto.ITokenDeleteTransactionBody;
import TokenDeleteTransactionBody = proto.TokenDeleteTransactionBody;
import ITokenUpdateTransactionBody = proto.ITokenUpdateTransactionBody;
import TokenUpdateTransactionBody = proto.TokenUpdateTransactionBody;
import ITokenMintTransactionBody = proto.ITokenMintTransactionBody;
import TokenMintTransactionBody = proto.TokenMintTransactionBody;
import ITokenBurnTransactionBody = proto.ITokenBurnTransactionBody;
import TokenBurnTransactionBody = proto.TokenBurnTransactionBody;
import ITokenWipeAccountTransactionBody = proto.ITokenWipeAccountTransactionBody;
import TokenWipeAccountTransactionBody = proto.TokenWipeAccountTransactionBody;
import ITokenAssociateTransactionBody = proto.ITokenAssociateTransactionBody;
import TokenAssociateTransactionBody = proto.TokenAssociateTransactionBody;
import ITokenDissociateTransactionBody = proto.ITokenDissociateTransactionBody;
import TokenDissociateTransactionBody = proto.TokenDissociateTransactionBody;
import ITokenFeeScheduleUpdateTransactionBody = proto.ITokenFeeScheduleUpdateTransactionBody;
import TokenFeeScheduleUpdateTransactionBody = proto.TokenFeeScheduleUpdateTransactionBody;
import IScheduleCreateTransactionBody = proto.IScheduleCreateTransactionBody;
import ScheduleCreateTransactionBody = proto.ScheduleCreateTransactionBody;
import ISchedulableTransactionBody = proto.ISchedulableTransactionBody;
import SchedulableTransactionBody = proto.SchedulableTransactionBody;
import IScheduleDeleteTransactionBody = proto.IScheduleDeleteTransactionBody;
import ScheduleDeleteTransactionBody = proto.ScheduleDeleteTransactionBody;
import IScheduleSignTransactionBody = proto.IScheduleSignTransactionBody;
import ScheduleSignTransactionBody = proto.ScheduleSignTransactionBody;
import IResponseHeader = proto.IResponseHeader;
import ResponseHeader = proto.ResponseHeader;
import ITransactionResponse = proto.ITransactionResponse;
import TransactionResponse = proto.TransactionResponse;
import ResponseCodeEnum = proto.ResponseCodeEnum;
import IConsensusTopicInfo = proto.IConsensusTopicInfo;
import ConsensusTopicInfo = proto.ConsensusTopicInfo;
import ConsensusService = proto.ConsensusService;
import IQuery = proto.IQuery;
import Query = proto.Query;
import IGetByKeyQuery = proto.IGetByKeyQuery;
import GetByKeyQuery = proto.GetByKeyQuery;
import IEntityID = proto.IEntityID;
import EntityID = proto.EntityID;
import IGetByKeyResponse = proto.IGetByKeyResponse;
import GetByKeyResponse = proto.GetByKeyResponse;
import IGetBySolidityIDQuery = proto.IGetBySolidityIDQuery;
import GetBySolidityIDQuery = proto.GetBySolidityIDQuery;
import IGetBySolidityIDResponse = proto.IGetBySolidityIDResponse;
import GetBySolidityIDResponse = proto.GetBySolidityIDResponse;
import IContractLoginfo = proto.IContractLoginfo;
import ContractLoginfo = proto.ContractLoginfo;
import IContractFunctionResult = proto.IContractFunctionResult;
import ContractFunctionResult = proto.ContractFunctionResult;
import IContractCallLocalQuery = proto.IContractCallLocalQuery;
import ContractCallLocalQuery = proto.ContractCallLocalQuery;
import IContractCallLocalResponse = proto.IContractCallLocalResponse;
import ContractCallLocalResponse = proto.ContractCallLocalResponse;
import IContractGetInfoQuery = proto.IContractGetInfoQuery;
import ContractGetInfoQuery = proto.ContractGetInfoQuery;
import IContractGetInfoResponse = proto.IContractGetInfoResponse;
import ContractGetInfoResponse = proto.ContractGetInfoResponse;
import IContractInfo = proto.ContractGetInfoResponse.IContractInfo;
import ContractInfo = proto.ContractGetInfoResponse.ContractInfo;
import IContractGetBytecodeQuery = proto.IContractGetBytecodeQuery;
import ContractGetBytecodeQuery = proto.ContractGetBytecodeQuery;
import IContractGetBytecodeResponse = proto.IContractGetBytecodeResponse;
import ContractGetBytecodeResponse = proto.ContractGetBytecodeResponse;
import IContractGetRecordsQuery = proto.IContractGetRecordsQuery;
import ContractGetRecordsQuery = proto.ContractGetRecordsQuery;
import IContractGetRecordsResponse = proto.IContractGetRecordsResponse;
import ContractGetRecordsResponse = proto.ContractGetRecordsResponse;
import ITransactionRecord = proto.ITransactionRecord;
import TransactionRecord = proto.TransactionRecord;
import ITransactionReceipt = proto.ITransactionReceipt;
import TransactionReceipt = proto.TransactionReceipt;
import IExchangeRate = proto.IExchangeRate;
import ExchangeRate = proto.ExchangeRate;
import IExchangeRateSet = proto.IExchangeRateSet;
import ExchangeRateSet = proto.ExchangeRateSet;
import ICryptoGetAccountBalanceQuery = proto.ICryptoGetAccountBalanceQuery;
import CryptoGetAccountBalanceQuery = proto.CryptoGetAccountBalanceQuery;
import ICryptoGetAccountBalanceResponse = proto.ICryptoGetAccountBalanceResponse;
import CryptoGetAccountBalanceResponse = proto.CryptoGetAccountBalanceResponse;
import ICryptoGetAccountRecordsQuery = proto.ICryptoGetAccountRecordsQuery;
import CryptoGetAccountRecordsQuery = proto.CryptoGetAccountRecordsQuery;
import ICryptoGetAccountRecordsResponse = proto.ICryptoGetAccountRecordsResponse;
import CryptoGetAccountRecordsResponse = proto.CryptoGetAccountRecordsResponse;
import ICryptoGetInfoQuery = proto.ICryptoGetInfoQuery;
import CryptoGetInfoQuery = proto.CryptoGetInfoQuery;
import ICryptoGetInfoResponse = proto.ICryptoGetInfoResponse;
import CryptoGetInfoResponse = proto.CryptoGetInfoResponse;
import IAccountInfo = proto.CryptoGetInfoResponse.IAccountInfo;
import AccountInfo = proto.CryptoGetInfoResponse.AccountInfo;
import ICryptoGetLiveHashQuery = proto.ICryptoGetLiveHashQuery;
import CryptoGetLiveHashQuery = proto.CryptoGetLiveHashQuery;
import ICryptoGetLiveHashResponse = proto.ICryptoGetLiveHashResponse;
import CryptoGetLiveHashResponse = proto.CryptoGetLiveHashResponse;
import ICryptoGetStakersQuery = proto.ICryptoGetStakersQuery;
import CryptoGetStakersQuery = proto.CryptoGetStakersQuery;
import IProxyStaker = proto.IProxyStaker;
import ProxyStaker = proto.ProxyStaker;
import IAllProxyStakers = proto.IAllProxyStakers;
import AllProxyStakers = proto.AllProxyStakers;
import ICryptoGetStakersResponse = proto.ICryptoGetStakersResponse;
import CryptoGetStakersResponse = proto.CryptoGetStakersResponse;
import IFileGetContentsQuery = proto.IFileGetContentsQuery;
import FileGetContentsQuery = proto.FileGetContentsQuery;
import IFileGetContentsResponse = proto.IFileGetContentsResponse;
import FileGetContentsResponse = proto.FileGetContentsResponse;
import IFileContents = proto.FileGetContentsResponse.IFileContents;
import FileContents = proto.FileGetContentsResponse.FileContents;
import IFileGetInfoQuery = proto.IFileGetInfoQuery;
import FileGetInfoQuery = proto.FileGetInfoQuery;
import IFileGetInfoResponse = proto.IFileGetInfoResponse;
import FileGetInfoResponse = proto.FileGetInfoResponse;
import IFileInfo = proto.FileGetInfoResponse.IFileInfo;
import FileInfo = proto.FileGetInfoResponse.FileInfo;
import ITransactionGetReceiptQuery = proto.ITransactionGetReceiptQuery;
import TransactionGetReceiptQuery = proto.TransactionGetReceiptQuery;
import ITransactionGetReceiptResponse = proto.ITransactionGetReceiptResponse;
import TransactionGetReceiptResponse = proto.TransactionGetReceiptResponse;
import ITransactionGetRecordQuery = proto.ITransactionGetRecordQuery;
import TransactionGetRecordQuery = proto.TransactionGetRecordQuery;
import ITransactionGetRecordResponse = proto.ITransactionGetRecordResponse;
import TransactionGetRecordResponse = proto.TransactionGetRecordResponse;
import ITransactionGetFastRecordQuery = proto.ITransactionGetFastRecordQuery;
import TransactionGetFastRecordQuery = proto.TransactionGetFastRecordQuery;
import ITransactionGetFastRecordResponse = proto.ITransactionGetFastRecordResponse;
import TransactionGetFastRecordResponse = proto.TransactionGetFastRecordResponse;
import INetworkGetVersionInfoQuery = proto.INetworkGetVersionInfoQuery;
import NetworkGetVersionInfoQuery = proto.NetworkGetVersionInfoQuery;
import INetworkGetVersionInfoResponse = proto.INetworkGetVersionInfoResponse;
import NetworkGetVersionInfoResponse = proto.NetworkGetVersionInfoResponse;
import ITokenGetInfoQuery = proto.ITokenGetInfoQuery;
import TokenGetInfoQuery = proto.TokenGetInfoQuery;
import ITokenInfo = proto.ITokenInfo;
import TokenInfo = proto.TokenInfo;
import ITokenGetInfoResponse = proto.ITokenGetInfoResponse;
import TokenGetInfoResponse = proto.TokenGetInfoResponse;
import IScheduleGetInfoQuery = proto.IScheduleGetInfoQuery;
import ScheduleGetInfoQuery = proto.ScheduleGetInfoQuery;
import IScheduleInfo = proto.IScheduleInfo;
import ScheduleInfo = proto.ScheduleInfo;
import IScheduleGetInfoResponse = proto.IScheduleGetInfoResponse;
import ScheduleGetInfoResponse = proto.ScheduleGetInfoResponse;
import ITokenGetAccountNftInfosQuery = proto.ITokenGetAccountNftInfosQuery;
import TokenGetAccountNftInfosQuery = proto.TokenGetAccountNftInfosQuery;
import ITokenGetAccountNftInfosResponse = proto.ITokenGetAccountNftInfosResponse;
import TokenGetAccountNftInfosResponse = proto.TokenGetAccountNftInfosResponse;
import INftID = proto.INftID;
import NftID = proto.NftID;
import ITokenGetNftInfoQuery = proto.ITokenGetNftInfoQuery;
import TokenGetNftInfoQuery = proto.TokenGetNftInfoQuery;
import ITokenNftInfo = proto.ITokenNftInfo;
import TokenNftInfo = proto.TokenNftInfo;
import ITokenGetNftInfoResponse = proto.ITokenGetNftInfoResponse;
import TokenGetNftInfoResponse = proto.TokenGetNftInfoResponse;
import ITokenGetNftInfosQuery = proto.ITokenGetNftInfosQuery;
import TokenGetNftInfosQuery = proto.TokenGetNftInfosQuery;
import ITokenGetNftInfosResponse = proto.ITokenGetNftInfosResponse;
import TokenGetNftInfosResponse = proto.TokenGetNftInfosResponse;
import IResponse = proto.IResponse;
import Response = proto.Response;
import CryptoService = proto.CryptoService;
import FileService = proto.FileService;
import FreezeService = proto.FreezeService;
import NetworkService = proto.NetworkService;
import ScheduleService = proto.ScheduleService;
import SmartContractService = proto.SmartContractService;
import IThrottleGroup = proto.IThrottleGroup;
import ThrottleGroup = proto.ThrottleGroup;
import IThrottleBucket = proto.IThrottleBucket;
import ThrottleBucket = proto.ThrottleBucket;
import IThrottleDefinitions = proto.IThrottleDefinitions;
import ThrottleDefinitions = proto.ThrottleDefinitions;
import TokenService = proto.TokenService;
import ISignedTransaction = proto.ISignedTransaction;
import SignedTransaction = proto.SignedTransaction;
import ITransactionList = proto.ITransactionList;
import TransactionList = proto.TransactionList;
import IDoubleValue = proto.IDoubleValue;
import DoubleValue = proto.DoubleValue;
import IFloatValue = proto.IFloatValue;
import FloatValue = proto.FloatValue;
import IInt64Value = proto.IInt64Value;
import Int64Value = proto.Int64Value;
import IUInt64Value = proto.IUInt64Value;
import UInt64Value = proto.UInt64Value;
import IInt32Value = proto.IInt32Value;
import Int32Value = proto.Int32Value;
import IUInt32Value = proto.IUInt32Value;
import UInt32Value = proto.UInt32Value;
import IBoolValue = proto.IBoolValue;
import BoolValue = proto.BoolValue;
import IStringValue = proto.IStringValue;
import StringValue = proto.StringValue;
import IBytesValue = proto.IBytesValue;
import BytesValue = proto.BytesValue;
import IConsensusTopicQuery = proto.IConsensusTopicQuery;
import ConsensusTopicQuery = proto.ConsensusTopicQuery;
import IConsensusTopicResponse = proto.IConsensusTopicResponse;
import ConsensusTopicResponse = proto.ConsensusTopicResponse;
import MirrorConsensusService = proto.MirrorConsensusService;
import ITokenPauseTransactionBody = proto.ITokenPauseTransactionBody;
import TokenPauseTransactionBody = proto.TokenPauseTransactionBody;
import ITokenUnpauseTransactionBody = proto.ITokenUnpauseTransactionBody;
import TokenUnpauseTransactionBody = proto.TokenUnpauseTransactionBody;
import TokenPauseStatus = proto.TokenPauseStatus;
import FreezeType = proto.FreezeType;

export {
    ITokenUnitBalance,
    TokenUnitBalance,
    ISingleAccountBalances,
    SingleAccountBalances,
    IAllAccountBalances,
    AllAccountBalances,
    IShardID,
    ShardID,
    IRealmID,
    RealmID,
    IAccountID,
    AccountID,
    IFileID,
    FileID,
    IContractID,
    ContractID,
    ITransactionID,
    TransactionID,
    IAccountAmount,
    AccountAmount,
    ITransferList,
    TransferList,
    INftTransfer,
    NftTransfer,
    ITokenTransferList,
    TokenTransferList,
    IFraction,
    Fraction,
    ITopicID,
    TopicID,
    ITokenID,
    TokenID,
    IScheduleID,
    ScheduleID,
    TokenType,
    SubType,
    TokenSupplyType,
    TokenFreezeStatus,
    TokenKycStatus,
    IKey,
    Key,
    IThresholdKey,
    ThresholdKey,
    IKeyList,
    KeyList,
    ISignature,
    Signature,
    IThresholdSignature,
    ThresholdSignature,
    ISignatureList,
    SignatureList,
    ISignaturePair,
    SignaturePair,
    ISignatureMap,
    SignatureMap,
    HederaFunctionality,
    IFeeComponents,
    FeeComponents,
    ITransactionFeeSchedule,
    TransactionFeeSchedule,
    IFeeData,
    FeeData,
    IFeeSchedule,
    FeeSchedule,
    ICurrentAndNextFeeSchedule,
    CurrentAndNextFeeSchedule,
    IServiceEndpoint,
    ServiceEndpoint,
    INodeAddress,
    NodeAddress,
    INodeAddressBook,
    NodeAddressBook,
    ISemanticVersion,
    SemanticVersion,
    ISetting,
    Setting,
    IServicesConfigurationList,
    ServicesConfigurationList,
    ITokenRelationship,
    TokenRelationship,
    ITokenBalance,
    TokenBalance,
    ITokenBalances,
    TokenBalances,
    ITokenAssociation,
    TokenAssociation,
    ITimestamp,
    Timestamp,
    ITimestampSeconds,
    TimestampSeconds,
    IConsensusCreateTopicTransactionBody,
    ConsensusCreateTopicTransactionBody,
    IDuration,
    Duration,
    IConsensusDeleteTopicTransactionBody,
    ConsensusDeleteTopicTransactionBody,
    IConsensusGetTopicInfoQuery,
    ConsensusGetTopicInfoQuery,
    IConsensusGetTopicInfoResponse,
    ConsensusGetTopicInfoResponse,
    ResponseType,
    IQueryHeader,
    QueryHeader,
    ITransaction,
    Transaction,
    ITransactionBody,
    TransactionBody,
    ISystemDeleteTransactionBody,
    SystemDeleteTransactionBody,
    ISystemUndeleteTransactionBody,
    SystemUndeleteTransactionBody,
    IFreezeTransactionBody,
    FreezeTransactionBody,
    IContractCallTransactionBody,
    ContractCallTransactionBody,
    IContractCreateTransactionBody,
    ContractCreateTransactionBody,
    IContractUpdateTransactionBody,
    ContractUpdateTransactionBody,
    ILiveHash,
    LiveHash,
    ICryptoAddLiveHashTransactionBody,
    CryptoAddLiveHashTransactionBody,
    ICryptoCreateTransactionBody,
    CryptoCreateTransactionBody,
    ICryptoDeleteTransactionBody,
    CryptoDeleteTransactionBody,
    ICryptoDeleteLiveHashTransactionBody,
    CryptoDeleteLiveHashTransactionBody,
    ICryptoTransferTransactionBody,
    CryptoTransferTransactionBody,
    ICryptoUpdateTransactionBody,
    CryptoUpdateTransactionBody,
    IFileAppendTransactionBody,
    FileAppendTransactionBody,
    IFileCreateTransactionBody,
    FileCreateTransactionBody,
    IFileDeleteTransactionBody,
    FileDeleteTransactionBody,
    IFileUpdateTransactionBody,
    FileUpdateTransactionBody,
    IContractDeleteTransactionBody,
    ContractDeleteTransactionBody,
    IConsensusUpdateTopicTransactionBody,
    ConsensusUpdateTopicTransactionBody,
    IConsensusMessageChunkInfo,
    ConsensusMessageChunkInfo,
    IConsensusSubmitMessageTransactionBody,
    ConsensusSubmitMessageTransactionBody,
    IUncheckedSubmitBody,
    UncheckedSubmitBody,
    ITokenCreateTransactionBody,
    TokenCreateTransactionBody,
    IFractionalFee,
    FractionalFee,
    IFixedFee,
    FixedFee,
    IRoyaltyFee,
    RoyaltyFee,
    ICustomFee,
    CustomFee,
    IAssessedCustomFee,
    AssessedCustomFee,
    ITokenFreezeAccountTransactionBody,
    TokenFreezeAccountTransactionBody,
    ITokenUnfreezeAccountTransactionBody,
    TokenUnfreezeAccountTransactionBody,
    ITokenGrantKycTransactionBody,
    TokenGrantKycTransactionBody,
    ITokenRevokeKycTransactionBody,
    TokenRevokeKycTransactionBody,
    ITokenDeleteTransactionBody,
    TokenDeleteTransactionBody,
    ITokenUpdateTransactionBody,
    TokenUpdateTransactionBody,
    ITokenMintTransactionBody,
    TokenMintTransactionBody,
    ITokenBurnTransactionBody,
    TokenBurnTransactionBody,
    ITokenWipeAccountTransactionBody,
    TokenWipeAccountTransactionBody,
    ITokenAssociateTransactionBody,
    TokenAssociateTransactionBody,
    ITokenDissociateTransactionBody,
    TokenDissociateTransactionBody,
    ITokenFeeScheduleUpdateTransactionBody,
    TokenFeeScheduleUpdateTransactionBody,
    IScheduleCreateTransactionBody,
    ScheduleCreateTransactionBody,
    ISchedulableTransactionBody,
    SchedulableTransactionBody,
    IScheduleDeleteTransactionBody,
    ScheduleDeleteTransactionBody,
    IScheduleSignTransactionBody,
    ScheduleSignTransactionBody,
    IResponseHeader,
    ResponseHeader,
    ITransactionResponse,
    TransactionResponse,
    ResponseCodeEnum,
    IConsensusTopicInfo,
    ConsensusTopicInfo,
    ConsensusService,
    IQuery,
    Query,
    IGetByKeyQuery,
    GetByKeyQuery,
    IEntityID,
    EntityID,
    IGetByKeyResponse,
    GetByKeyResponse,
    IGetBySolidityIDQuery,
    GetBySolidityIDQuery,
    IGetBySolidityIDResponse,
    GetBySolidityIDResponse,
    IContractLoginfo,
    ContractLoginfo,
    IContractFunctionResult,
    ContractFunctionResult,
    IContractCallLocalQuery,
    ContractCallLocalQuery,
    IContractCallLocalResponse,
    ContractCallLocalResponse,
    IContractGetInfoQuery,
    ContractGetInfoQuery,
    IContractGetInfoResponse,
    ContractGetInfoResponse,
    IContractInfo,
    ContractInfo,
    IContractGetBytecodeQuery,
    ContractGetBytecodeQuery,
    IContractGetBytecodeResponse,
    ContractGetBytecodeResponse,
    IContractGetRecordsQuery,
    ContractGetRecordsQuery,
    IContractGetRecordsResponse,
    ContractGetRecordsResponse,
    ITransactionRecord,
    TransactionRecord,
    ITransactionReceipt,
    TransactionReceipt,
    IExchangeRate,
    ExchangeRate,
    IExchangeRateSet,
    ExchangeRateSet,
    ICryptoGetAccountBalanceQuery,
    CryptoGetAccountBalanceQuery,
    ICryptoGetAccountBalanceResponse,
    CryptoGetAccountBalanceResponse,
    ICryptoGetAccountRecordsQuery,
    CryptoGetAccountRecordsQuery,
    ICryptoGetAccountRecordsResponse,
    CryptoGetAccountRecordsResponse,
    ICryptoGetInfoQuery,
    CryptoGetInfoQuery,
    ICryptoGetInfoResponse,
    CryptoGetInfoResponse,
    IAccountInfo,
    AccountInfo,
    ICryptoGetLiveHashQuery,
    CryptoGetLiveHashQuery,
    ICryptoGetLiveHashResponse,
    CryptoGetLiveHashResponse,
    ICryptoGetStakersQuery,
    CryptoGetStakersQuery,
    IProxyStaker,
    ProxyStaker,
    IAllProxyStakers,
    AllProxyStakers,
    ICryptoGetStakersResponse,
    CryptoGetStakersResponse,
    IFileGetContentsQuery,
    FileGetContentsQuery,
    IFileGetContentsResponse,
    FileGetContentsResponse,
    IFileContents,
    FileContents,
    IFileGetInfoQuery,
    FileGetInfoQuery,
    IFileGetInfoResponse,
    FileGetInfoResponse,
    IFileInfo,
    FileInfo,
    ITransactionGetReceiptQuery,
    TransactionGetReceiptQuery,
    ITransactionGetReceiptResponse,
    TransactionGetReceiptResponse,
    ITransactionGetRecordQuery,
    TransactionGetRecordQuery,
    ITransactionGetRecordResponse,
    TransactionGetRecordResponse,
    ITransactionGetFastRecordQuery,
    TransactionGetFastRecordQuery,
    ITransactionGetFastRecordResponse,
    TransactionGetFastRecordResponse,
    INetworkGetVersionInfoQuery,
    NetworkGetVersionInfoQuery,
    INetworkGetVersionInfoResponse,
    NetworkGetVersionInfoResponse,
    ITokenGetInfoQuery,
    TokenGetInfoQuery,
    ITokenInfo,
    TokenInfo,
    ITokenGetInfoResponse,
    TokenGetInfoResponse,
    IScheduleGetInfoQuery,
    ScheduleGetInfoQuery,
    IScheduleInfo,
    ScheduleInfo,
    IScheduleGetInfoResponse,
    ScheduleGetInfoResponse,
    ITokenGetAccountNftInfosQuery,
    TokenGetAccountNftInfosQuery,
    ITokenGetAccountNftInfosResponse,
    TokenGetAccountNftInfosResponse,
    INftID,
    NftID,
    ITokenGetNftInfoQuery,
    TokenGetNftInfoQuery,
    ITokenNftInfo,
    TokenNftInfo,
    ITokenGetNftInfoResponse,
    TokenGetNftInfoResponse,
    ITokenGetNftInfosQuery,
    TokenGetNftInfosQuery,
    ITokenGetNftInfosResponse,
    TokenGetNftInfosResponse,
    IResponse,
    Response,
    CryptoService,
    FileService,
    FreezeService,
    NetworkService,
    ScheduleService,
    SmartContractService,
    IThrottleGroup,
    ThrottleGroup,
    IThrottleBucket,
    ThrottleBucket,
    IThrottleDefinitions,
    ThrottleDefinitions,
    TokenService,
    ISignedTransaction,
    SignedTransaction,
    ITransactionList,
    TransactionList,
    IDoubleValue,
    DoubleValue,
    IFloatValue,
    FloatValue,
    IInt64Value,
    Int64Value,
    IUInt64Value,
    UInt64Value,
    IInt32Value,
    Int32Value,
    IUInt32Value,
    UInt32Value,
    IBoolValue,
    BoolValue,
    IStringValue,
    StringValue,
    IBytesValue,
    BytesValue,
    IConsensusTopicQuery,
    ConsensusTopicQuery,
    IConsensusTopicResponse,
    ConsensusTopicResponse,
    MirrorConsensusService,
    ITokenPauseTransactionBody,
    TokenPauseTransactionBody,
    ITokenUnpauseTransactionBody,
    TokenUnpauseTransactionBody,
    TokenPauseStatus,
    FreezeType,
};
