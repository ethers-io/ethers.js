declare module 'ethers' {

  class Wallet {
    public constructor(privateKey: SigningKey | string, provider: providers.Provider)

    static createRandom(options?: any): Wallet
    static verifyMessage(message: string, signature: string): string
    static parseTransaction(rawTransaction: any): Transaction
    static isEncryptedWallet(json: JSON): boolean
    static fromEncryptedWallet(json: JSON, password: string, progressCallback?: Function): Promise<Wallet>
    static fromMnemonic(mnemonic: string, path: string): Wallet
    static fromBrainWallet(username: string, password: string, progressCallback?: Function): Promise<Wallet>

    readonly privateKey: string
    readonly address: string

    provider?: providers.Provider
    defaultGasLimit: number

    sign(transaction: Transaction): utils.RLP
    signMessage(message: string): string
    encrypt(password: string, options: any, progressCallback?: Function): Promise<any>

    getAddress(): string
    getBalance(blockTag: string): Promise<number>
    getTransactionCount(blockTag: string): Promise<number>
    estimateGas(transaction: Transaction): Promise<number>
    sendTransaction(transaction: Transaction): Promise<Transaction>
    send(addressOrENSName: string, amountWei: utils.BigNumber, options?: any): Promise<Transaction>
  }

  class SigningKey {
    public constructor(privateKey: any)
    static recover(digest: any, r: string, s: string, recoveryParam: any): SigningKey
    static getPublicKey(value: any, compressed?: boolean): string
    static publicKeyToAddress(publicKey: any): string

    readonly privateKey: string
    readonly publicKey: string
    readonly address: string

    scanDigest(digest: any): any
  }

  class Contract {
    public constructor(addressOrENSName: string, contractInterface: Interface, signerOrProvider: any)

    readonly address: string
    readonly contractInterface: Interface
    readonly signer: any
    readonly provider: providers.JsonRpcProvider
    readonly estimate: {}
    readonly functions: {}
    readonly events: {}

    connect(signerOrProvider: any): Contract
    getDeployTransaction(bytecode: any, contractInterface: Interface): {}
  }

  class Interface {
    public constructor(abi: {})

    static encodeParams(names: any[], types: any[], values: any[]): string
    static decodeParams(names: any[], types: any[], values: any[]): any

    readonly abi: {}
    readonly functions: {}
    readonly events: {}
    readonly deployFunction: Function
  }

  namespace providers {

    export type Network = {
      chainId: number
      ensAddress: string
      name: string
    }

    export type Networks = {[index: string]: Network}

    export type Web3CurrentProvider = {
      sendAsync(request: any, callback: (err: Error, result: any) => void): Promise<any>
    }

    const networks: Networks

    function getDefaultProvider(network?: Network): JsonRpcProvider

    class Provider {
      public constructor(network: Network | string)

      static fetchJSON(url: string, json: JSON, processFunc?: Function): Promise<any>
      static networks: Networks

      chainId: number
      ensAddress: string
      name: string

      waitForTransaction(transactionHash: string, timeout: number): Promise<Transaction>
      getBlockNumber(): Promise<number>
      getGasPrice(): Promise<utils.BigNumber>
      getBalance(addressOrENSName: string, blockTag: string): Promise<utils.BigNumber>
      getTransactionCount(addressOrENSName: string, blockTag: string): Promise<number>
      getCode(addressOrENSName: string, blockTag: string): Promise<string>
      getStorageAt(addressOrENSName: string, position: string, blockTag: string): Promise<string>
      sendTransaction(signedTransaction: string): Promise<string>
      call(transaction: Transaction): Promise<string>
      estimateGas(transaction: Transaction): Promise<utils.BigNumber>
      getBlock(blockHashOrBlockTag: string): Promise<{}>
      getTransaction(transactionHash: string): Promise<Transaction>
      getTransactionReceipt(transactionHash: string): Promise<{}>
      getLogs(filter: any): Promise<string[]>
      getEtherPrice(): Promise<number>
      resolveName(name: string): Promise<string>
      lookupAddress(address: string): Promise<string>
      on(eventName: string, listener: EventListener): void
      once(eventName: string, listener: EventListener): void
      emit(eventName: string): void
      listenerCount(eventName: string): number
      listeners(eventName: string): Promise<EventListener[]>
      removeAllListeners(eventName: string): void
      removeListener(eventName: string, listener: EventListener): void
      resetEventsBlock(blockNumber: number): void
      polling(value?: number)
    }

    class EtherscanProvider extends Provider {
      public constructor(network: Network, apiKey: string)
      perform(method: string, params: string[]): Promise<string>
      getHistory(addressOrENSName: string, startBlock: number, endBlock: number): Promise<any[]>
    }

    class FallbackProvider extends Provider {
      public constructor(providers: Provider[])
      perform(method: string, params: string[]): Promise<string>
    }

    class JsonRpcProvider extends Provider {
      public constructor(url: string, network?: Network | string)
      send(method: string, params: string[]): Promise<string>
      perform(method: string, params: string[]): Promise<string>
    }

    class InfuraProvider extends JsonRpcProvider {
      public constructor(network: Network, apiAccessToken: string)
    }

    class Web3Provider extends JsonRpcProvider {
      public constructor(web3provider: Web3CurrentProvider, network?: Network | string)
      getSigner(address?: string): Web3Signer
      listAccounts(): Promise<string[]>
    }

    class Web3Signer {
      private constructor(provider: Web3Provider, address?: string)

      getAddress(): Promise<string>
      getBalance(blockTag: string): Promise<utils.BigNumber>
      getTransactionCount(blockTag: string): Promise<number>
      sendTransaction(transaction: Transaction): Promise<Transaction>
      signMessage(message: string): Promise<string>
      unlock(password: string): Promise<string>
    }

  }

  export type Transaction = {
    chainId: number
    hash: string
    from: string
    to: string
    data: any
    nounce: utils.BigNumber
    gasPrice: utils.BigNumber
    gasLimit: utils.BigNumber
    value: utils.BigNumber
  }

  namespace utils {
    type RLP = string

    const etherSymbol: string

    function arrayify(hex: string, name?: string): Uint8Array

    function concat(objects: any[]): Uint8Array
    function padZeros(value: any, length: number): Uint8Array
    function stripZeros(value: any): Uint8Array

    function bigNumberify(value: any): BigNumber

    function hexlify(value: any): string

    function toUtf8Bytes(text: string): Uint8Array
    function toUtf8String(bytes: Uint8Array): string

    function namehash(name: string, depth: number): string
    function id(text: string): string

    function getAddress(address: string, generateIcap?: boolean): string
    function getContractAddress(transaction: any): string

    function formatEther(wei: BigNumber, options: any): string
    function parseEther(ether: string): BigNumber

    function keccak256(value: any): string
    function sha256(value: any): string

    function randomBytes(length: number): Uint8Array

    function solidityPack(types: string[], values: any[]): string
    function solidityKeccak256(types: string[], values: any[]): string
    function soliditySha256(types: string[], values: any[]): string

    class BigNumber {
      public constructor(value: any)

      static constantNegativeOne: BigNumber
      static constantZero: BigNumber
      static constantOne: BigNumber
      static constantTwo: BigNumber
      static constantWeiPerEther: BigNumber

      fromTwos(value: any): BigNumber
      toTwos(value: any): BigNumber
      add(other: any): BigNumber
      sub(other: any): BigNumber
      div(other: any): BigNumber
      mul(other: any): BigNumber
      mod(other: any): BigNumber
      pow(other: any): BigNumber
      maskn(value: any): BigNumber
      eq(other: any): boolean
      lt(other: any): boolean
      lte(other: any): boolean
      gt(other: any): boolean
      gte(other: any): boolean
      isZero(): boolean
      toNumber(base?: number): number
      toString(): string
      toHexString(): string
    }

    namespace RLP {
      function encode(object: any): string
      function decode(data: any): any
    }
  }
}
