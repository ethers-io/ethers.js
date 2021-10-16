Changelog
=========

This change log is managed by `admin/cmds/update-versions` but may be manually updated.


ethers/v5.5.0 (2021-10-16 02:04)
--------------------------------

  - admin: fixed alias script. ([#1494](https://github.com/ethers-io/ethers.js/issues/1494); [8f3d71d](https://github.com/ethers-io/ethers.js/commit/8f3d71dc5fd0e91407737a4b82c58c31269ed2be))
  - Better errors when non-string address or ENS name is passed into Contracts or provider methods. ([#1051](https://github.com/ethers-io/ethers.js/issues/1051); [a5c6a46](https://github.com/ethers-io/ethers.js/commit/a5c6a468f4a7ad29fb5277e08c6b8b208383a575))
  - Use personal_sign instead of eth_sign for message signing with JsonRpcSigner; added _legacySignMessage for legacy support. ([#1542](https://github.com/ethers-io/ethers.js/issues/1542), [#1840](https://github.com/ethers-io/ethers.js/issues/1840); [8947fd4](https://github.com/ethers-io/ethers.js/commit/8947fd405e3aea07f6db958d89a3ad39abe3a25a))
  - Removed extra wordlists from the dist files. ([#2058](https://github.com/ethers-io/ethers.js/issues/2058), [#2077](https://github.com/ethers-io/ethers.js/issues/2077); [cb43a99](https://github.com/ethers-io/ethers.js/commit/cb43a99405cdc5bdcc875efc1821e00e55447791))
  - Fix issue when Solidity method collises with JavaScript prototype. ([#1432](https://github.com/ethers-io/ethers.js/issues/1432), [#2054](https://github.com/ethers-io/ethers.js/issues/2054), [#2120](https://github.com/ethers-io/ethers.js/issues/2120); [0a8be37](https://github.com/ethers-io/ethers.js/commit/0a8be37b087470d9354f387d7c439cb0166eaf4d))
  - Add support for Cloudflare Workers. ([#1886](https://github.com/ethers-io/ethers.js/issues/1886); [6582ede](https://github.com/ethers-io/ethers.js/commit/6582ede1ce46be0b3abafb120e052b95a2d172b3))
  - Added more information to some invalid argument errors. ([#1130](https://github.com/ethers-io/ethers.js/issues/1130); [f3c6d81](https://github.com/ethers-io/ethers.js/commit/f3c6d819f34b6d93f53d98b9f337ade5aa37a594))
  - Fix compile-time error in new TypeScript version. ([bee76a4](https://github.com/ethers-io/ethers.js/commit/bee76a49b2e5f95ea2eab49aabf5e44cb4ca794b))
  - Adding customData support to transactions to assist L2 chains. ([#1761](https://github.com/ethers-io/ethers.js/issues/1761); [68095a4](https://github.com/ethers-io/ethers.js/commit/68095a48ae19ed06cbcf2f415f1fcbda90d4b2ae))
  - Added some explicit null results to previously implicit null results for ENS. ([#1850](https://github.com/ethers-io/ethers.js/issues/1850); [0e5419e](https://github.com/ethers-io/ethers.js/commit/0e5419ec79cb18d82bab8c47bfa3ab4a21cfd293))
  - Added BigNumber _difficulty to Block results. ([#2001](https://github.com/ethers-io/ethers.js/issues/2001), [#2036](https://github.com/ethers-io/ethers.js/issues/2036); [a48552a](https://github.com/ethers-io/ethers.js/commit/a48552a4fb85a08178d07437a3934db98b7d0736))
  - Removed redundant call to normalizing blockTag (1838). ([d5b41ce](https://github.com/ethers-io/ethers.js/commit/d5b41ce210c0f22dd795749810f6ce798f71a00f))
  - Fixed isBytes check for invalid length or elements. ([#1964](https://github.com/ethers-io/ethers.js/issues/1964); [7a404fb](https://github.com/ethers-io/ethers.js/commit/7a404fb8ed95a99baab8f3b384f438b697fa5d76))
  - Fixed randomBytes not rejecting NaN as a length. ([#1977](https://github.com/ethers-io/ethers.js/issues/1977); [f8adf82](https://github.com/ethers-io/ethers.js/commit/f8adf82e16aaad1a7c1750e7f2e3a9f8073b73e1))
  - Allow any Networkish for getDefaultProvider. ([#2031](https://github.com/ethers-io/ethers.js/issues/2031); [cc250b2](https://github.com/ethers-io/ethers.js/commit/cc250b2060451e0ee6b1cf3edb6b005f9eee9c61))
  - Stop allowing commas in fixed numbers; left over from legacy comma support. ([#2083](https://github.com/ethers-io/ethers.js/issues/2083); [45f3675](https://github.com/ethers-io/ethers.js/commit/45f367512d1d5dccfd06fad9cc8688e4d0cccdb8))
  - Export FallbackProviderConfig. ([#2121](https://github.com/ethers-io/ethers.js/issues/2121); [48c9e0b](https://github.com/ethers-io/ethers.js/commit/48c9e0bf39eec9b5b30ab7cd5685effdccaa1b1a))

ethers/v5.4.7 (2021-09-16 13:17)
--------------------------------

  - Fix parseUints with excess zeros and fix ReDoS issue. ([#2016](https://github.com/ethers-io/ethers.js/issues/2016), [#1975](https://github.com/ethers-io/ethers.js/issues/1975), [#1976](https://github.com/ethers-io/ethers.js/issues/1976); [32a6b2a](https://github.com/ethers-io/ethers.js/commit/32a6b2a362815eb85ce3f3abad5adf92f2b80e10))

ethers/v5.4.6 (2021-08-27 15:34)
--------------------------------

  - Temporarily remove the block miner for clique-based networks from CI testing. ([#1967](https://github.com/ethers-io/ethers.js/issues/1967); [8320d53](https://github.com/ethers-io/ethers.js/commit/8320d534d78173dfa8ecb4def634a00483a6aa9c))
  - More readable errors involving Uint8Arrays. ([b6a061e](https://github.com/ethers-io/ethers.js/commit/b6a061e7bfd14c1f2df1418df37f704275908e8b))
  - Added Deferred Error support to Description objects to extent Interface parse methods. ([#1894](https://github.com/ethers-io/ethers.js/issues/1894); [a662490](https://github.com/ethers-io/ethers.js/commit/a662490e82a9b71b5f6dee0a8242e6fa78409d79))
  - Fix address coder to prepare non-hexdatastring addresses as hexdatastring. ([#1906](https://github.com/ethers-io/ethers.js/issues/1906); [017b1fe](https://github.com/ethers-io/ethers.js/commit/017b1feba2c9dea88f078b299d211cbd58d43b49))
  - Removed temporary code for better errors needed until Alchemy added EIP-1559 support. ([#1893](https://github.com/ethers-io/ethers.js/issues/1893); [accb852](https://github.com/ethers-io/ethers.js/commit/accb85268c92fa894e769ec1dca322e117d33e5f))

ethers/v5.4.5 (2021-08-18 03:05)
--------------------------------

  - Fxied getBlockWithTransactions results (#1858). ([78e4273](https://github.com/ethers-io/ethers.js/commit/78e4273a327d12da9a1ec008d3f2146d97385921))

ethers/v5.4.4 (2021-08-04 01:37)
--------------------------------

  - Fixed Etherscan API key in default provider. ([#1807](https://github.com/ethers-io/ethers.js/issues/1807); [1d27d95](https://github.com/ethers-io/ethers.js/commit/1d27d95670ee3a51879393fed44297128c4a42a3))
  - Adjust default masPriorityFeePerGas to account for MEV-heavy blocks. ([#1817](https://github.com/ethers-io/ethers.js/issues/1817); [7175e2e](https://github.com/ethers-io/ethers.js/commit/7175e2e99c2747e8d2314feb407bf0a0f9371ece))

ethers/v5.4.3 (2021-07-29 23:26)
--------------------------------

  - Fixed JsonRpcProvider for pre-EIP-2930 chains. ([#1766](https://github.com/ethers-io/ethers.js/issues/1766); [7274cd0](https://github.com/ethers-io/ethers.js/commit/7274cd06cf3f6f31c6df3fd6636706d8536b7ee2))
  - Forward some missing EIP-1559 fields to call and estimateGas. ([#1766](https://github.com/ethers-io/ethers.js/issues/1766); [be3854e](https://github.com/ethers-io/ethers.js/commit/be3854e648fdef0478db8a64c26be6d9e90cf453))
  - Fixed possible UnhandledPromiseException for bad ENS names. ([63f8b28](https://github.com/ethers-io/ethers.js/commit/63f8b2822318d1e0fcc41f4662feb6e5ae338f3d))
  - Prevent overriding value for non-payble constructors. ([#1785](https://github.com/ethers-io/ethers.js/issues/1785); [593b488](https://github.com/ethers-io/ethers.js/commit/593b4886ff607d00d656b8131b843933eb48838e))

ethers/v5.4.2 (2021-07-23 17:22)
--------------------------------

  - Fix test case for new transactions responses. ([0aafca7](https://github.com/ethers-io/ethers.js/commit/0aafca71dbc019beb398e1b5a0f24936a4fd215a))
  - Added matic support to INFURA and Alchemy. ([#1546](https://github.com/ethers-io/ethers.js/issues/1546); [576e9b5](https://github.com/ethers-io/ethers.js/commit/576e9b54abc3ff048113f93f765aa3177bf3b819))
  - Added string change to coalesce errors on some clients. ([bc5cc2e](https://github.com/ethers-io/ethers.js/commit/bc5cc2e7e34f6cc69c43c1665be9c18854fb26b8))
  - Added wait to transactions returned by getBlockWithTransactions. ([#971](https://github.com/ethers-io/ethers.js/issues/971); [660e69d](https://github.com/ethers-io/ethers.js/commit/660e69db71d42084b1fe791d864d13f0111f84fb))
  - Fixed floor, ceiling and round for FixedNumber for non-default Formats. ([#1749](https://github.com/ethers-io/ethers.js/issues/1749); [551cfa0](https://github.com/ethers-io/ethers.js/commit/551cfa0062ec1645c9310335e0e6cbd250bb3788))
  - Fixed null confirmations in Wallet transaction. ([#1706](https://github.com/ethers-io/ethers.js/issues/1706); [0f0d0c0](https://github.com/ethers-io/ethers.js/commit/0f0d0c00d3fc14e5454169d42a9286b1d8b0abef))
  - Fixed Etherscan string change and enabled all tests. ([a1f8d18](https://github.com/ethers-io/ethers.js/commit/a1f8d188a7bc0b0d11426b7ef0d018cc1b7b399d))

ethers/v5.4.1 (2021-07-02 01:47)
--------------------------------

  - Added Pocket back into Homestead defaultProvider and skip certain EtherscanProvider tests affected by outage. ([6e8a39e](https://github.com/ethers-io/ethers.js/commit/6e8a39ec35123e681e47807f54ef9b9122635ea0))
  - Fixed EtherscanProvider NONCE_EXPIRED matching string update. ([ecae793](https://github.com/ethers-io/ethers.js/commit/ecae793edff172a885e5ee014a8ad0b28b68c1e5))
  - Fixed explicit EIP-1559 keys for JsonRpcSigner. ([72feee8](https://github.com/ethers-io/ethers.js/commit/72feee8f5841febdab0d15f09baa69539d95e199))

ethers/v5.4.0 (2021-06-26 01:50)
--------------------------------

  - Added EIP-1559 support. ([#1610](https://github.com/ethers-io/ethers.js/issues/1610); [319987e](https://github.com/ethers-io/ethers.js/commit/319987ec3e1d0e8787f98f525e5fc07875bf5570), [91fff14](https://github.com/ethers-io/ethers.js/commit/91fff1449df5e337fd3b4681b5a04b151d92f5a1), [c5bca77](https://github.com/ethers-io/ethers.js/commit/c5bca7767e3f3d43e3d0bd3c9e9420321ee9907a), [5456c35](https://github.com/ethers-io/ethers.js/commit/5456c359245d9eef5d2abdc05ccedb5269576c94), [7a12216](https://github.com/ethers-io/ethers.js/commit/7a12216cfbd3f86b917451924957471b8be21a8b), [e95708e](https://github.com/ethers-io/ethers.js/commit/e95708eedc130aeb92820a2234398970a987c507))
  - Added effectiveGasPrice to receipt. ([ba6854b](https://github.com/ethers-io/ethers.js/commit/ba6854bdd5a912fe873d5da494cb5c62c190adde))
  - Fixed ENS names for JsonRpcSigner. ([1e31b34](https://github.com/ethers-io/ethers.js/commit/1e31b34a5a3a269867a45b519662db85f0c86654))
  - Added EIP-2930 and EIP-1559 transaction tests. ([7deb4c1](https://github.com/ethers-io/ethers.js/commit/7deb4c174a30b75f8419b8661829add4e5cb69d6))
  - Added ConstructorFragment to exports. ([7efc36d](https://github.com/ethers-io/ethers.js/commit/7efc36df294ddd333e37793cad712cbd587bc686))
  - Added error utilities to Interface. ([720bde7](https://github.com/ethers-io/ethers.js/commit/720bde7719d9a2fbc7e859f8952b7918e7164b87), [f053a7a](https://github.com/ethers-io/ethers.js/commit/f053a7ad58866c8192a64e1e335a2613358385be))
  - merged master including transaction type 0 legacy constant. ([#1610](https://github.com/ethers-io/ethers.js/issues/1610); [2a7ce0e](https://github.com/ethers-io/ethers.js/commit/2a7ce0e72a1e0c9469e10392b0329e75e341cf18))
  - Added type to TransactionResponse and TrnsactionReceipt. ([#1687](https://github.com/ethers-io/ethers.js/issues/1687); [d001901](https://github.com/ethers-io/ethers.js/commit/d001901c8c0541c823eb9638b9b309a316b00757))
  - Trap CALL_EXCEPTION errors when resolving ENS entries. ([#1690](https://github.com/ethers-io/ethers.js/issues/1690); [91951dc](https://github.com/ethers-io/ethers.js/commit/91951dc825af42d4440d2d3b43cfa7a601b20342))
  - Fixed transaction serialization with explicit null type. ([#1628](https://github.com/ethers-io/ethers.js/issues/1628); [8277f5a](https://github.com/ethers-io/ethers.js/commit/8277f5a62a6739a05ae6682da6956fb490b81e4a))
  - Fix issue with loading JSON ABI with internalType property. ([#728](https://github.com/ethers-io/ethers.js/issues/728); [e8a0144](https://github.com/ethers-io/ethers.js/commit/e8a0144b7aa95add967578d9629d70bf01fc55cf))

ethers/v5.3.1 (2021-06-10 18:28)
--------------------------------

  - Fixed replacement transaction detection for JsonRpcSigner. ([#1658](https://github.com/ethers-io/ethers.js/issues/1658); [ee82e86](https://github.com/ethers-io/ethers.js/commit/ee82e86ccc439825259d20825a00050217890ad3))
  - Added Matic testnet info to networks. ([#1546](https://github.com/ethers-io/ethers.js/issues/1546); [376cf3c](https://github.com/ethers-io/ethers.js/commit/376cf3cdbf6d2281331d36c5742414a425927318))
  - Match Solidity identifier regex. ([#1657](https://github.com/ethers-io/ethers.js/issues/1657); [a6e128f](https://github.com/ethers-io/ethers.js/commit/a6e128f5cc566d291b722cca1734ba41aae6c548))

ethers/v5.3.0 (2021-05-31 18:41)
--------------------------------

  - Added MinInt256 and MaxInt256 constants. ([#1576](https://github.com/ethers-io/ethers.js/issues/1576); [bfcd05f](https://github.com/ethers-io/ethers.js/commit/bfcd05fcbb132d456d6f22f70c8ac9cf5b1826f7))
  - Version bumps for bn.js and hash.js to match elliptic and fix some build tools. ([#1478](https://github.com/ethers-io/ethers.js/issues/1478); [819b1ac](https://github.com/ethers-io/ethers.js/commit/819b1ace5c9b16e29dc354ad80e0e5b71ac63c52))
  - Removed Hangul checks in shims which crashes Android. ([#1519](https://github.com/ethers-io/ethers.js/issues/1519); [4b33114](https://github.com/ethers-io/ethers.js/commit/4b331148d980e3056ceaabdcd6e50a2aa1beb40d))
  - Fixed ENS namehash with leading and trailing dots. ([#1605](https://github.com/ethers-io/ethers.js/issues/1605); [7adcf3b](https://github.com/ethers-io/ethers.js/commit/7adcf3b154669d9d1a0a66d5e15dabfbf6618180))
  - Fixed broken variable in template string. ([#1624](https://github.com/ethers-io/ethers.js/issues/1624), [#1626](https://github.com/ethers-io/ethers.js/issues/1626); [630656e](https://github.com/ethers-io/ethers.js/commit/630656e949a8ffd940e4b66ec93ec07cd6ec2634))
  - Fixed FixedNumber rounding for non-default formats. ([#1629](https://github.com/ethers-io/ethers.js/issues/1629); [8681cd5](https://github.com/ethers-io/ethers.js/commit/8681cd59698d02d040871aa889fc6ccc8550df98))
  - Update ws dependency version to fix security. ([#1633](https://github.com/ethers-io/ethers.js/issues/1633), [#1634](https://github.com/ethers-io/ethers.js/issues/1634); [470551e](https://github.com/ethers-io/ethers.js/commit/470551e4ee3f1e343a26fc0775f9d9f7489129f8))

ethers/v5.2.0 (2021-05-17 16:18)
--------------------------------

  - More aggresively check for mempool transactions sent from JsonRpcSigner. ([3316468](https://github.com/ethers-io/ethers.js/commit/3316468e3e0a5925cbecad85d894cc7d622394e7))
  - Added initial support for detecting replacement transactions. ([#1477](https://github.com/ethers-io/ethers.js/issues/1477); [987bec8](https://github.com/ethers-io/ethers.js/commit/987bec87afaa365f291290a0136cedbc2b1992f2), [5144acf](https://github.com/ethers-io/ethers.js/commit/5144acf456b51c95bbe3950bd37609abecc7ebc7))
  - Added convenience method for HD path derivation. ([aadc5cd](https://github.com/ethers-io/ethers.js/commit/aadc5cd3d65421e13ebd4e4d7c293ac3ece5e178))
  - Added mnemonicPath option to cli. ([6e08809](https://github.com/ethers-io/ethers.js/commit/6e088099adabd7c5d2e6710062ebc62b316ba0f1))
  - Added some popular Ethereum-compatible chains to networks. ([b6370f1](https://github.com/ethers-io/ethers.js/commit/b6370f13600a0c444342cbf16a83f010a929976b))
  - Added debug event to Web3Provider. ([26464c5](https://github.com/ethers-io/ethers.js/commit/26464c54258f98c321638475d6cf11595186e76d))
  - Abstracted EtherscanProivder to more easily fascilitate other Etherscan-supported chains. ([#1204](https://github.com/ethers-io/ethers.js/issues/1204), [#1473](https://github.com/ethers-io/ethers.js/issues/1473); [37a9c77](https://github.com/ethers-io/ethers.js/commit/37a9c77ab2acb7f75e1fc4cc918810d2fe59dd76))
  - Added Custom Contract Errors. ([#1498](https://github.com/ethers-io/ethers.js/issues/1498); [6519609](https://github.com/ethers-io/ethers.js/commit/65196097f6626401638d85cf19e3d628a6223d5d), [483d67f](https://github.com/ethers-io/ethers.js/commit/483d67f55c15a76bcd853e889a0e35815d9850f7))
  - More flexible FixedNumber input and output for strings with no decimals. ([#1019](https://github.com/ethers-io/ethers.js/issues/1019), [#1291](https://github.com/ethers-io/ethers.js/issues/1291), [#1463](https://github.com/ethers-io/ethers.js/issues/1463); [a9cdbe1](https://github.com/ethers-io/ethers.js/commit/a9cdbe1238c149a7167c6bb1a78f314805b52755))
  - Added hex support for bigint. ([#1472](https://github.com/ethers-io/ethers.js/issues/1472); [4e9abfd](https://github.com/ethers-io/ethers.js/commit/4e9abfdee478a8423da4d55feea8c1aae78a8eb4))
  - Added support for null entries in EventFilter. ([#1499](https://github.com/ethers-io/ethers.js/issues/1499); [3bb5fbf](https://github.com/ethers-io/ethers.js/commit/3bb5fbf533107e880377ecc14f30f314a5028e56))
  - Add bigint to allowed BigNumberish types. ([#1472](https://github.com/ethers-io/ethers.js/issues/1472); [cadccc3](https://github.com/ethers-io/ethers.js/commit/cadccc3060b88ab2ca64aeb302717d2d1c95a897))
  - Minor version bump. ([8e22e02](https://github.com/ethers-io/ethers.js/commit/8e22e0260eb70713c943c9e99ee8d66d71ebe56d))

ethers/v5.1.4 (2021-04-22 06:33)
--------------------------------

  - Do not throw on ABI "error" type. ([#1493](https://github.com/ethers-io/ethers.js/issues/1493), [#1497](https://github.com/ethers-io/ethers.js/issues/1497); [bd05aed](https://github.com/ethers-io/ethers.js/commit/bd05aed070ac9e1421a3e2bff2ceea150bedf9b7))

ethers/v5.1.3 (2021-04-19 21:01)
--------------------------------

  - Fixed JsonRpcProvider event-loop caching when using any network. ([#1484](https://github.com/ethers-io/ethers.js/issues/1484); [58488e7](https://github.com/ethers-io/ethers.js/commit/58488e78f9ef79715693e19b42663335aad88c03))
  - Updated experimental Eip1193Bridge to support final EIP-1193 API. ([2911659](https://github.com/ethers-io/ethers.js/commit/29116593ba6c9c0fa491b13787cca8b233d4218c))
  - Fail early for ABI decoding that will obviously run out of data. ([#1486](https://github.com/ethers-io/ethers.js/issues/1486); [51f0e1a](https://github.com/ethers-io/ethers.js/commit/51f0e1a52fb885e6f146f7b3b70ed487fd1c8f5a))
  - Fixed BigNumber toBigInt return type. ([#1485](https://github.com/ethers-io/ethers.js/issues/1485); [c086962](https://github.com/ethers-io/ethers.js/commit/c0869623024bbf3671938dad03b131ff2ac54345))

ethers/v5.1.2 (2021-04-18 19:31)
--------------------------------

  - Increase provider tests gas price for sending a transaction. ([8eaeba3](https://github.com/ethers-io/ethers.js/commit/8eaeba35f550c3d9aa1ae62eb8d8e0c912818f7f))
  - Fixed run-checking non-filter Contract events. ([#1458](https://github.com/ethers-io/ethers.js/issues/1458); [4a44865](https://github.com/ethers-io/ethers.js/commit/4a44865a8c22adb9c55d5c37a81ee46ebc68228c))

ethers/v5.1.1 (2021-04-18 02:47)
--------------------------------

  - Increased sendTransaction timeout to 15 minutes and pull Pocket from tx tests. ([08adc18](https://github.com/ethers-io/ethers.js/commit/08adc18a68bdc730633bdaaf2329014a84c12b2b))
  - Export Eip1193Bridge in experimental package. ([1fcf4b6](https://github.com/ethers-io/ethers.js/commit/1fcf4b6ce6922d2bcb245375c967da3072f113ed))
  - Prevent non-typed transactions from unsafely ignoring specified access lists. ([#1364](https://github.com/ethers-io/ethers.js/issues/1364); [4577444](https://github.com/ethers-io/ethers.js/commit/4577444c448f41114263077c5b54fbe6af749fd4))
  - Update tests for current EIP-2930 support across backends. ([#1364](https://github.com/ethers-io/ethers.js/issues/1364); [1cb3199](https://github.com/ethers-io/ethers.js/commit/1cb3199e5cb01f5a55eb00ab6c7904606d7ea1dd))
  - Removed underscore from the JsonRpcBatchProvider name. ([#62](https://github.com/ethers-io/ethers.js/issues/62), [#656](https://github.com/ethers-io/ethers.js/issues/656), [#892](https://github.com/ethers-io/ethers.js/issues/892); [ae0d5eb](https://github.com/ethers-io/ethers.js/commit/ae0d5eb7c2e37a003d893671db59c2d5719aea0f))
  - Added better error detection when pre-EIP-155 transactions are disabled. ([b8df000](https://github.com/ethers-io/ethers.js/commit/b8df000c8f0ccd252b6049ac5a32a986d5a8e08d))
  - Fix Android React Native environment shims which crash on normalizing Korean test. ([#1298](https://github.com/ethers-io/ethers.js/issues/1298); [eb1ec2f](https://github.com/ethers-io/ethers.js/commit/eb1ec2f2318e2851073ea1634e5003cdb53f1c1b))
  - Fixed EIP-2930 transactions for EtherscanProvider. ([#1364](https://github.com/ethers-io/ethers.js/issues/1364); [b655089](https://github.com/ethers-io/ethers.js/commit/b65508995ce7d02f109a970ebeb625819beb915a))
  - Re-enable AlchemyProvider Berlin tests. ([bec066b](https://github.com/ethers-io/ethers.js/commit/bec066bcb5ab8b95a7e7ce4848d7b76d7f248ccc))
  - Added experimental _JsonRpcBatchProvider. ([#62](https://github.com/ethers-io/ethers.js/issues/62), [#656](https://github.com/ethers-io/ethers.js/issues/656), [#892](https://github.com/ethers-io/ethers.js/issues/892); [d55ab6d](https://github.com/ethers-io/ethers.js/commit/d55ab6d4e6025c484cc7e64486d927bd54a0772b))
  - Cache JsonRpcProvider requests for certain methods per event loop. ([#1371](https://github.com/ethers-io/ethers.js/issues/1371); [1a7c4e8](https://github.com/ethers-io/ethers.js/commit/1a7c4e89efecc2b8afc8bea4c1f8f75fdaac08c5))

ethers/v5.1.0 (2021-03-30 14:44)
--------------------------------

  - Added BigNumber.toBigInt method. ([#1415](https://github.com/ethers-io/ethers.js/issues/1415); [81fd628](https://github.com/ethers-io/ethers.js/commit/81fd628292b7dde90fe5115074fa68476a872dbf))
  - Abstracted Contract with BaseContract without meta-class properties for easier extensions. ([#1384](https://github.com/ethers-io/ethers.js/issues/1384); [87ceaed](https://github.com/ethers-io/ethers.js/commit/87ceaed4be21283619da74678cf371c228c918b7))
  - Fixed Contract properties that collide with null member properties. ([#1393](https://github.com/ethers-io/ethers.js/issues/1393); [0e1721b](https://github.com/ethers-io/ethers.js/commit/0e1721b13084dacf63089e47116f7d5331be4f36))
  - Added EIP-2930 support. ([#1364](https://github.com/ethers-io/ethers.js/issues/1364); [c47d2eb](https://github.com/ethers-io/ethers.js/commit/c47d2eba4dc741eb5cb754c3ef5064b8ea7ac7cc))
  - Added abstraction for EIP-2718 support. ([1db4ce1](https://github.com/ethers-io/ethers.js/commit/1db4ce12d49e235a7155de24ee153f409e7e7370))

ethers/v5.0.32 (2021-03-07 18:17)
---------------------------------

  - Bumped TypeScript to 4.2.2. ([#1288](https://github.com/ethers-io/ethers.js/issues/1288); [b2ecffb](https://github.com/ethers-io/ethers.js/commit/b2ecffb0c8d44c8ee65199e7866dc744abae4e6e))
  - Fixed shims from not displaying debug information. ([a953f71](https://github.com/ethers-io/ethers.js/commit/a953f717523a844a3a45810a5acc6630383884d3))
  - Force TypedData numbers to be in decimal. ([#1193](https://github.com/ethers-io/ethers.js/issues/1193); [c5a53d6](https://github.com/ethers-io/ethers.js/commit/c5a53d6911d7c41dd03a290b550e80f2919e9379))

ethers/v5.0.31 (2021-02-12 19:04)
---------------------------------

  - Prevent unhandled rejections when passing nullish into Contract constructor. ([#1234](https://github.com/ethers-io/ethers.js/issues/1234); [d937668](https://github.com/ethers-io/ethers.js/commit/d937668dc1d39cc293f64bbd30b99b29614d1607))
  - Better error messaging when provider backends give bogus responses. ([#1243](https://github.com/ethers-io/ethers.js/issues/1243); [8279120](https://github.com/ethers-io/ethers.js/commit/8279120e0ad1cbb7aeabd32c08e168a4228abbec))
  - Prevent unconfigured ENS names from making an init tx. ([#1290](https://github.com/ethers-io/ethers.js/issues/1290); [243beff](https://github.com/ethers-io/ethers.js/commit/243beffa4f83c910f5f1c5e0554531e5dcf3ab93))

ethers/v5.0.30 (2021-02-08 15:22)
---------------------------------

  - When in Status trigger personal_sign instead of eth_sign. ([#1285](https://github.com/ethers-io/ethers.js/issues/1285); [73e9434](https://github.com/ethers-io/ethers.js/commit/73e94349de94d2969ccb21c834119525ddfcb961))
  - Bump elliptic version for CVE-2020-28498. ([#1284](https://github.com/ethers-io/ethers.js/issues/1284); [796954f](https://github.com/ethers-io/ethers.js/commit/796954f8807b0c464c7baa8f7ff299e22685e192))

ethers/v5.0.29 (2021-02-03 14:36)
---------------------------------

  - Fixed typos in JSON ABI formatting. ([#1275](https://github.com/ethers-io/ethers.js/issues/1275); [73b31b3](https://github.com/ethers-io/ethers.js/commit/73b31b371fa47bacc4f5f6bed01d0d1e5d66fa2c))

ethers/v5.0.28 (2021-02-02 17:12)
---------------------------------

  - Added load balancer support to PocketProvider. ([#1052](https://github.com/ethers-io/ethers.js/issues/1052); [27a981c](https://github.com/ethers-io/ethers.js/commit/27a981c84b578feb762fdb37dd5325d9c335bd59))

ethers/v5.0.27 (2021-02-01 15:55)
---------------------------------

  - Added support for networks with slightly incorrect EIP-658 implementations. ([#952](https://github.com/ethers-io/ethers.js/issues/952), [#1251](https://github.com/ethers-io/ethers.js/issues/1251); [e727efc](https://github.com/ethers-io/ethers.js/commit/e727efc33eaa31c3af6adbb64a893caf354d0ba7))
  - Added Pocket network to the default provider. ([#1030](https://github.com/ethers-io/ethers.js/issues/1030), [#1052](https://github.com/ethers-io/ethers.js/issues/1052); [4af2c19](https://github.com/ethers-io/ethers.js/commit/4af2c19f455bb43406d3cc5421c3b3fdda75f78f))
  - Added TypeScript declaration maps. ([#401](https://github.com/ethers-io/ethers.js/issues/401); [3396846](https://github.com/ethers-io/ethers.js/commit/3396846a30a4be0ed58fe449589e7e4e54f3d32e))

ethers/v5.0.26 (2021-01-13 14:47)
---------------------------------

  - Fixed abundant UnhandledRejectErrors in provider polling. ([#1084](https://github.com/ethers-io/ethers.js/issues/1084), [#1208](https://github.com/ethers-io/ethers.js/issues/1208), [#1221](https://github.com/ethers-io/ethers.js/issues/1221), [#1235](https://github.com/ethers-io/ethers.js/issues/1235); [74470de](https://github.com/ethers-io/ethers.js/commit/74470defda5170338735bbbe676c207cdd5cc1cf), [20f6e16](https://github.com/ethers-io/ethers.js/commit/20f6e16394909a43498c1ac6c73152957bd121bd))
  - Fixed non-checksum address comparisons in abstract Signer. ([#1236](https://github.com/ethers-io/ethers.js/issues/1236); [8175c83](https://github.com/ethers-io/ethers.js/commit/8175c83026436b6335800780ca12b7257e1b490f))

ethers/v5.0.25 (2021-01-08 03:31)
---------------------------------

  - Safety check on digest length for signing. ([20335e9](https://github.com/ethers-io/ethers.js/commit/20335e96c2429e851081b72031ea3fd4cd677904))
  - Fixed listenerCount for contract when requesting for all events. ([#1205](https://github.com/ethers-io/ethers.js/issues/1205); [a56a0a3](https://github.com/ethers-io/ethers.js/commit/a56a0a33366ea9276fba5bc45f1e4678dd723fa6))
  - Lock package versions for the ESM builds. ([#1009](https://github.com/ethers-io/ethers.js/issues/1009); [0e6cc9a](https://github.com/ethers-io/ethers.js/commit/0e6cc9a9a8ebceae4529ccbb7c107618eb54490a))

ethers/v5.0.24 (2020-12-08 01:43)
---------------------------------

  - Fixed EIP-712 getPayload dropping EIP712Domain from types for JSON-RPC calls. ([#687](https://github.com/ethers-io/ethers.js/issues/687); [d3b1ac0](https://github.com/ethers-io/ethers.js/commit/d3b1ac046aaf2a46f6c3efbd93c55adb0cb8f16d))
  - Remvoed dead files. ([70c2b1b](https://github.com/ethers-io/ethers.js/commit/70c2b1b3002f44c39f4fd87fc2cfc3f5dc6555ed))

ethers/v5.0.23 (2020-11-25 15:25)
---------------------------------

  - Fix BigNumber when passed something with a length property. ([#1172](https://github.com/ethers-io/ethers.js/issues/1172); [45a2902](https://github.com/ethers-io/ethers.js/commit/45a2902874e828a16396a253548bcb00bceccf95))

ethers/v5.0.22 (2020-11-23 19:16)
---------------------------------

  - Added directory to repo field for each package. ([799896a](https://github.com/ethers-io/ethers.js/commit/799896ac13cce857ce0124d2fb480f5d1eed114c))
  - Add ABI coder function to compute default values. ([#1101](https://github.com/ethers-io/ethers.js/issues/1101); [a8e3380](https://github.com/ethers-io/ethers.js/commit/a8e3380ed547b6368be5fe40b48be6e31b5cdd93))
  - Fix for new versions of Geth which return formatted data on revert rather than standard data. ([#949](https://github.com/ethers-io/ethers.js/issues/949); [4a8d579](https://github.com/ethers-io/ethers.js/commit/4a8d579dcaf026d0c232e20176605d34cba4767d))
  - Addd missing sideEffects flag to some packages. ([20defec](https://github.com/ethers-io/ethers.js/commit/20defec9f1683487b6ea9c8730d2ab7b3745bfa5))
  - Allow base-10 to be passed into BigNumbner.toString and improve errors for other radices. ([#1164](https://github.com/ethers-io/ethers.js/issues/1164); [c8bb77d](https://github.com/ethers-io/ethers.js/commit/c8bb77d8af85d2f9f9df82f1afbe7516ab296e98), [fbbe4ad](https://github.com/ethers-io/ethers.js/commit/fbbe4ad638e06089cdd976a7f4ffd51b85a31558))
  - Allow private keys to Wallet to omit the 0x prefix. ([#1166](https://github.com/ethers-io/ethers.js/issues/1166); [29f6c34](https://github.com/ethers-io/ethers.js/commit/29f6c34343d75fa42023bdcd07632f49a450570c))

ethers/v5.0.21 (2020-11-19 18:52)
---------------------------------

  - Force address to use bignumber package with base36 private functions. ([#1163](https://github.com/ethers-io/ethers.js/issues/1163); [c9e5480](https://github.com/ethers-io/ethers.js/commit/c9e548071e9ed03e3b12f40f0be779c16422a73f))
  - Remove stray console.log in hardware wallets. ([#1136](https://github.com/ethers-io/ethers.js/issues/1136); [cc63e61](https://github.com/ethers-io/ethers.js/commit/cc63e61f73d530c28655f9421506a25fc0a49df0))
  - Added some funding links for the sponsor button. ([2816850](https://github.com/ethers-io/ethers.js/commit/2816850716d4bf2b458f1db4e0c7a5dc09fb14f7))
  - Remove invalid pkg.module reference. ([#1133](https://github.com/ethers-io/ethers.js/issues/1133); [cddc258](https://github.com/ethers-io/ethers.js/commit/cddc258c963ab63de426b89ef190b83aefe6f6cd))

ethers/v5.0.20 (2020-11-17 20:32)
---------------------------------

  - Fix browser ws alias for WebSockets. ([02546b9](https://github.com/ethers-io/ethers.js/commit/02546b9401d8066135b4453da917f7ef49c95ad8))
  - Fixing React Native tests. ([f10977a](https://github.com/ethers-io/ethers.js/commit/f10977ab35f953c3148d99b61799788f47d2a5a2), [fff72ef](https://github.com/ethers-io/ethers.js/commit/fff72ef369f5420bf8283b0808e8fec71f26dd2b))
  - Refactoring dist build process. ([4809325](https://github.com/ethers-io/ethers.js/commit/4809325bee9cbdd269b099d7b12b218f441ac840), [22bd0c7](https://github.com/ethers-io/ethers.js/commit/22bd0c76dddef7134618ec70ac1b084a054e616e), [8933467](https://github.com/ethers-io/ethers.js/commit/8933467c01b64ead547d7c136f22f3c05c85ca1f))

ethers/v5.0.19 (2020-10-22 21:55)
---------------------------------

  - Allow 0x as a numeric value for 0 in Provider formatter. ([#1104](https://github.com/ethers-io/ethers.js/issues/1104); [fe17a29](https://github.com/ethers-io/ethers.js/commit/fe17a295816214d063f3d6bd4f3273e0ce0c3eac))
  - Use POST for long requests in EtherscanProvider. ([#1093](https://github.com/ethers-io/ethers.js/issues/1093); [28f60d5](https://github.com/ethers-io/ethers.js/commit/28f60d5ef83665541c8c1b432f8e173d73cb8227))
  - Added verifyTypedData for EIP-712 typed data. ([#687](https://github.com/ethers-io/ethers.js/issues/687); [550ecf2](https://github.com/ethers-io/ethers.js/commit/550ecf2f25b90f6d8996583489a218dbf2306ebc), [a21202c](https://github.com/ethers-io/ethers.js/commit/a21202c66b392ec6f91296d66551dffca742cf0a))

ethers/v5.0.18 (2020-10-19 01:26)
---------------------------------

  - Fix signTypedData call for JsonRpcSigner. ([#687](https://github.com/ethers-io/ethers.js/issues/687); [15a90af](https://github.com/ethers-io/ethers.js/commit/15a90af5be75806e26f589f0a3f3687c0fb1c672))
  - Added EIP-712 test cases. ([#687](https://github.com/ethers-io/ethers.js/issues/687); [1589353](https://github.com/ethers-io/ethers.js/commit/15893537c3d9c92fe8748a3e9617d133d1d5d6a7))
  - Initial Signer support for EIP-712 signed typed data. ([#687](https://github.com/ethers-io/ethers.js/issues/687); [be4e216](https://github.com/ethers-io/ethers.js/commit/be4e2164e64dfa0697561763e8079120a485a566))
  - Split hash library files up. ([3e676f2](https://github.com/ethers-io/ethers.js/commit/3e676f21b00931ed966f4561e4f28792a1f8f154))
  - Added EIP-712 multi-dimensional array support. ([#687](https://github.com/ethers-io/ethers.js/issues/687); [5a4dd5a](https://github.com/ethers-io/ethers.js/commit/5a4dd5a70377d3e86823d279d6ff466d03767644))
  - Consolidated TypedDataEncoder methods. ([#687](https://github.com/ethers-io/ethers.js/issues/687); [345a830](https://github.com/ethers-io/ethers.js/commit/345a830dc4bc869d5f3edfdc27465797e7663055))
  - Initial EIP-712 utilities. ([#687](https://github.com/ethers-io/ethers.js/issues/687); [cfa6dec](https://github.com/ethers-io/ethers.js/commit/cfa6dec29314fe485df283974612d40550bc4179))
  - Added initial PocketProvider. ([#1052](https://github.com/ethers-io/ethers.js/issues/1052); [a62d20d](https://github.com/ethers-io/ethers.js/commit/a62d20d86f2d545b9a7bcda5418993790b7db91c))

ethers/v5.0.17 (2020-10-07 20:08)
---------------------------------

  - Better error message for parseUnits of non-strings. ([#981](https://github.com/ethers-io/ethers.js/issues/981); [5abc2f3](https://github.com/ethers-io/ethers.js/commit/5abc2f36e20eef79a935961f3dd8133b5528d9e5))
  - Add gzip support to AlchemyProivder and InfuraProvider fetching. ([#1085](https://github.com/ethers-io/ethers.js/issues/1085); [38a068b](https://github.com/ethers-io/ethers.js/commit/38a068bcea3f251c8f3a349a90fcb077a39d23ad))
  - Add gzip support to getUrl in node. ([#1085](https://github.com/ethers-io/ethers.js/issues/1085); [65772a8](https://github.com/ethers-io/ethers.js/commit/65772a8e1a55d663bdb67e3a2b160fecc9f986ef))
  - Added CommunityResourcable to mark Providers as highly throttled. ([a022093](https://github.com/ethers-io/ethers.js/commit/a022093ce03f55db7ba2cac36e365d1af39ac45b))
  - Added debug event info to WebSocketProvider. ([#1018](https://github.com/ethers-io/ethers.js/issues/1018); [8e682cc](https://github.com/ethers-io/ethers.js/commit/8e682cc8481c6051a6f8115b29d78f4996120ccd))

ethers/v5.0.16 (2020-10-05 15:44)
---------------------------------

  - ABI encoding performance additions. ([#1012](https://github.com/ethers-io/ethers.js/issues/1012); [f3e5b0d](https://github.com/ethers-io/ethers.js/commit/f3e5b0ded1b227a377fd4799507653c95c76e353))
  - Export hexConcat in utils. ([#1079](https://github.com/ethers-io/ethers.js/issues/1079); [3d051e4](https://github.com/ethers-io/ethers.js/commit/3d051e454db978f58c7b38ff4484096c3eb85b94))
  - Cache chain ID for WebSocketProvider. ([#1054](https://github.com/ethers-io/ethers.js/issues/1054); [40264ff](https://github.com/ethers-io/ethers.js/commit/40264ff9006156ba8441e6101e5a7149a5cf03f6))

ethers/v5.0.15 (2020-09-26 03:22)
---------------------------------

  - Add more accurate intrinsic gas cost to ABI calls with specified gas property. ([#1058](https://github.com/ethers-io/ethers.js/issues/1058); [f0a5869](https://github.com/ethers-io/ethers.js/commit/f0a5869c53475e55a5f47d8651f609fff45dc9a7))
  - Better errors for unconfigured ENS names. ([#1066](https://github.com/ethers-io/ethers.js/issues/1066); [5cd1668](https://github.com/ethers-io/ethers.js/commit/5cd1668e0d29099c5b7ce1fdc1d0e8a41af1a249))
  - Updated CLI solc to versin 0.7.1. ([4306b35](https://github.com/ethers-io/ethers.js/commit/4306b3563a171baa9d7bf4872475a13c3434f834))

ethers/v5.0.14 (2020-09-16 02:39)
---------------------------------

  - More robust blockchain error detection ([#1047](https://github.com/ethers-io/ethers.js/issues/1047); [49f7157](https://github.com/ethers-io/ethers.js/commit/49f71574f4799d685a5ae8fd24fe1134f752d70a))
  - Forward blockchain errors from Signer during gas estimation. ([#1047](https://github.com/ethers-io/ethers.js/issues/1047); [9ee685d](https://github.com/ethers-io/ethers.js/commit/9ee685df46753c46cbbde12d05d6ea04f2b5ea3f))
  - Improve fetch errors with looser mime-type detection. ([#1047](https://github.com/ethers-io/ethers.js/issues/1047); [263bfe5](https://github.com/ethers-io/ethers.js/commit/263bfe5ce632790e0399d06a0ab660a501997998))

ethers/v5.0.13 (2020-09-11 02:10)
---------------------------------

  - Force content-length in web fetching. ([be92339](https://github.com/ethers-io/ethers.js/commit/be923396962ea76bf0fb566dcf8801e58ccf0e7e))
  - Better error forwarding from FallbackProvider. ([#1021](https://github.com/ethers-io/ethers.js/issues/1021); [bc3eeec](https://github.com/ethers-io/ethers.js/commit/bc3eeeca39adb734f24019d0e942eff2eac6ad4d))
  - Add clamping functions to FixedNumber. ([#1037](https://github.com/ethers-io/ethers.js/issues/1037); [042b74e](https://github.com/ethers-io/ethers.js/commit/042b74e6ee648d4fa37bf674194273d8f4483bfb))

ethers/v5.0.12 (2020-09-07 19:54)
---------------------------------

  - Allow events to use compact bytes ABI coded data for Solidity 0.4 external events. ([#891](https://github.com/ethers-io/ethers.js/issues/891), [#992](https://github.com/ethers-io/ethers.js/issues/992); [4e394fc](https://github.com/ethers-io/ethers.js/commit/4e394fc68019445ae4b4e201e41f95d6793dbe92))

ethers/v5.0.11 (2020-09-05 23:51)
---------------------------------

  - Synced unorm in shims to most recent version. ([bdccf7b](https://github.com/ethers-io/ethers.js/commit/bdccf7b8d352ba400317266a0a37e6e290633e3c))
  - Fixed LedgerSigner sendTransaction. ([#936](https://github.com/ethers-io/ethers.js/issues/936); [cadb28d](https://github.com/ethers-io/ethers.js/commit/cadb28d6b364e68e43a06f7a9b8a31797afbd920))
  - Added BrainWallet to experimental exports. ([72385c2](https://github.com/ethers-io/ethers.js/commit/72385c228783a3158511b3cddc5cb4f9ce1dddae))
  - More readable server errors. ([201e5ce](https://github.com/ethers-io/ethers.js/commit/201e5ced9c38da2de1dd7518ffbf24284d477e80))

ethers/v5.0.10 (2020-09-05 01:21)
---------------------------------

  - Added retry logic to provider tests. ([0558bba](https://github.com/ethers-io/ethers.js/commit/0558bba8eb1b783ef50bb37bcf4c9bae1f86f1e1), [35b64b9](https://github.com/ethers-io/ethers.js/commit/35b64b9a65e2c09ecb63b0eca712b45a3092c204), [681f2a5](https://github.com/ethers-io/ethers.js/commit/681f2a50b26d7954795dba5aec55bede4740e494))
  - Fixed link in docs. ([#1028](https://github.com/ethers-io/ethers.js/issues/1028); [2359a98](https://github.com/ethers-io/ethers.js/commit/2359a98641d99b26cf88ec892e3601a8a2c81c9c))
  - Added memory-like support and new opcodes to asm. ([6fd3bb6](https://github.com/ethers-io/ethers.js/commit/6fd3bb62d10eab1563dc4ddbd88732b4f484ec7a))
  - Added basic ENS resolver functions for contenthash, text and multi-coin addresses. ([#1003](https://github.com/ethers-io/ethers.js/issues/1003); [83db8a6](https://github.com/ethers-io/ethers.js/commit/83db8a6bd1364458dcfeea544de707df41890b4e))
  - Added support for changing Reporter logging function. ([d01d0c8](https://github.com/ethers-io/ethers.js/commit/d01d0c8448df40de52253f9e92889ab7e75c6a97))
  - Initial React Native test harness. ([#993](https://github.com/ethers-io/ethers.js/issues/993); [57eb5b7](https://github.com/ethers-io/ethers.js/commit/57eb5b777e2c67f1f8d74e41d3413e9f0564528d), [d3b473e](https://github.com/ethers-io/ethers.js/commit/d3b473e7c738fdfc65b6f1c8f80bcdacf9827d8a))
  - Updating shims for constrained environments. ([#944](https://github.com/ethers-io/ethers.js/issues/944), [#993](https://github.com/ethers-io/ethers.js/issues/993); [8abdbbb](https://github.com/ethers-io/ethers.js/commit/8abdbbbf633f96fde2346c4ae70e538895fd7829), [240aac5](https://github.com/ethers-io/ethers.js/commit/240aac568303deff14cbb2366b94c8c89cacefc1))

ethers/v5.0.9 (2020-08-25 01:45)
--------------------------------

  - Updated docs for all packages on npm pages. ([#1013](https://github.com/ethers-io/ethers.js/issues/1013); [cb8f4a3](https://github.com/ethers-io/ethers.js/commit/cb8f4a3a4e378a749c6bbbddf46d8d79d35722cc))
  - Added JSON support to BigNumber. ([#1010](https://github.com/ethers-io/ethers.js/issues/1010); [8facc1a](https://github.com/ethers-io/ethers.js/commit/8facc1a5305b1f699aa3afc5a0a692abe7927652))
  - Updated packages for security audit. ([5b5904e](https://github.com/ethers-io/ethers.js/commit/5b5904ea9977ecf8c079a57593b627553f0126a0))
  - Fix emitted error for ABI code array count mismatch. ([#1004](https://github.com/ethers-io/ethers.js/issues/1004); [b0c082d](https://github.com/ethers-io/ethers.js/commit/b0c082d728dc66b0f2a5ec315da44d6295716284))

ethers/v5.0.8 (2020-08-04 20:55)
--------------------------------

  - Abstract fetchJson for data. ([e2d6f28](https://github.com/ethers-io/ethers.js/commit/e2d6f281d5a2bd749bc72549a4e55f2c752a7bd8), [2c49a52](https://github.com/ethers-io/ethers.js/commit/2c49a52a41a30ae844376561de95f0c851d19f73), [e1bbb06](https://github.com/ethers-io/ethers.js/commit/e1bbb064a10d0b4bf5563e0a79396665d83935a1))

ethers/v5.0.7 (2020-07-20 02:22)
--------------------------------

  - Fix Logger setLogLevel with enum case mismatch. ([#947](https://github.com/ethers-io/ethers.js/issues/947); [5443363](https://github.com/ethers-io/ethers.js/commit/5443363de43e92de712e72d55165c3f4d7f652e9), [af10705](https://github.com/ethers-io/ethers.js/commit/af10705632bc1f8203ea50ea7ed3120b01c67122))
  - Removed UUID dependency from json-wallets. ([#966](https://github.com/ethers-io/ethers.js/issues/966); [e3f7426](https://github.com/ethers-io/ethers.js/commit/e3f7426af4d6d7e43db322700d768216b06433e0))
  - Removed unnecessary dependency from BigNumber. ([#951](https://github.com/ethers-io/ethers.js/issues/951); [78b350b](https://github.com/ethers-io/ethers.js/commit/78b350bbc5ea73561bf47038743b9e51049496f7))

ethers/v5.0.6 (2020-07-16 05:54)
--------------------------------

  - Removed unnecessary dependency from BigNumber. ([#951](https://github.com/ethers-io/ethers.js/issues/951); [78b350b](https://github.com/ethers-io/ethers.js/commit/78b350bbc5ea73561bf47038743b9e51049496f7))
  - Longer Etherscan throttle slot interval. ([9f20258](https://github.com/ethers-io/ethers.js/commit/9f20258d5d39cd901d2078275323071eb0f3505b))
  - Fixed ENS overrides for the default provider. ([#959](https://github.com/ethers-io/ethers.js/issues/959); [63dd3d4](https://github.com/ethers-io/ethers.js/commit/63dd3d4682b564445948988243fa9139c598587b))
  - Added Retry-After support and adjustable slot interval to fetchJson. ([7d43545](https://github.com/ethers-io/ethers.js/commit/7d435453039f009b339d835ddee47e35a843711b))
  - Added initial throttling support. ([#139](https://github.com/ethers-io/ethers.js/issues/139), [#904](https://github.com/ethers-io/ethers.js/issues/904), [#926](https://github.com/ethers-io/ethers.js/issues/926); [88c7eae](https://github.com/ethers-io/ethers.js/commit/88c7eaed061ae9a6798733a97e4e87011d36b8e7))
  - Use status code 1000 on WebSocket hangup for compatibility. ([588f64c](https://github.com/ethers-io/ethers.js/commit/588f64c760ee49bfb5109bfbaafb4beafe41c52a))
  - Updated WebSocketProvider to use web-style event listener API. ([57fd6f0](https://github.com/ethers-io/ethers.js/commit/57fd6f06047a1a2a3a46fe8b23ff585293a40062))
  - Normalize formatUnits to simplified decimals. ([79b1da1](https://github.com/ethers-io/ethers.js/commit/79b1da130be50df80c7e5aeb221edc5669fc211e))
  - Prevent zero-padding on Solidity type lengths. ([e128bfc](https://github.com/ethers-io/ethers.js/commit/e128bfcd10e006c920532151598700ca33a2127e))
  - Set sensible defaults for INFURA and AlchemyAPI getWebSocketProvider methods. ([e3d3e60](https://github.com/ethers-io/ethers.js/commit/e3d3e604f299edbafe7d0721c0a3eff5f67c83f4))
  - Added logger assert methods. ([619a888](https://github.com/ethers-io/ethers.js/commit/619a8888ebe08de9956f60c16703fb3543aeacc4))
  - Added initial code coverage testing. ([0c1d55b](https://github.com/ethers-io/ethers.js/commit/0c1d55b6dc9c725c86e849d13b911c8bace9821d))
  - Added destroy to WebSocketProvider. ([d0a79c6](https://github.com/ethers-io/ethers.js/commit/d0a79c6a1362e12f6f102e4af99adfef930092db))
  - Updated packages (security updates). ([c660176](https://github.com/ethers-io/ethers.js/commit/c6601769ada64832b1ce392680a30cb145c3cab9))

ethers/v5.0.5 (2020-07-07 23:18)
--------------------------------

  - Fixed splitSignature when recoveryParam is encoded directly. ([#893](https://github.com/ethers-io/ethers.js/issues/893), [#933](https://github.com/ethers-io/ethers.js/issues/933); [bf65ddb](https://github.com/ethers-io/ethers.js/commit/bf65ddbff0036f6eb8e99c145f30edff157687f5))
  - Fixed BigNumber string validation. ([#935](https://github.com/ethers-io/ethers.js/issues/935); [7e56f3d](https://github.com/ethers-io/ethers.js/commit/7e56f3d392e52815c5c859772b99660e0fc38ef5))

ethers/v5.0.4 (2020-07-04 23:46)
--------------------------------

  - Prevent negative exponents in BigNumber. ([#925](https://github.com/ethers-io/ethers.js/issues/925); [84e253f](https://github.com/ethers-io/ethers.js/commit/84e253f3f9674b52fa2a17b097644e91e6474021))
  - Fixed StaticJsonRpcProvider when auto-detecting network. ([#901](https://github.com/ethers-io/ethers.js/issues/901); [0fd9aa5](https://github.com/ethers-io/ethers.js/commit/0fd9aa5cb6f4a3f9c1bea9b4eeee389700db01fa))
  - Added WebSocket static method to Alchemy provider and updated Alchemy URLs. ([4838874](https://github.com/ethers-io/ethers.js/commit/48388741272df8569315637f21df7c6519f79e2e))

ethers/v5.0.3 (2020-06-29 00:50)
--------------------------------

  - Fixed typo in error string. ([7fe702d](https://github.com/ethers-io/ethers.js/commit/7fe702d59b0b81d2812e407b99a1e98e0e18ba03))
  - Updated elliptic package to address possible malleability issue; which should not affect Ethereum. ([9e14345](https://github.com/ethers-io/ethers.js/commit/9e1434503e2a0280e9918c4eadb4d972b062b3b0))
  - Fixed FixedNumber unguarded constructor and added isZero. ([#898](https://github.com/ethers-io/ethers.js/issues/898); [08c74e9](https://github.com/ethers-io/ethers.js/commit/08c74e9a132f37ab8cc3fb5dab3bd1fd708ee702))
  - Added StaticJsonRpcProvider for reducing calls to chainId in certain cases. ([#901](https://github.com/ethers-io/ethers.js/issues/901); [c53864d](https://github.com/ethers-io/ethers.js/commit/c53864de0af55dd8ec8ca5681e78da380d85250a))
  - Allow getDefaultProvider to accept a URL as a network. ([8c1ff4c](https://github.com/ethers-io/ethers.js/commit/8c1ff4c862b8cecb04c98d71910870e0b73867a0))
  - Make network an optional parameter to WebSocketProvider. ([987b535](https://github.com/ethers-io/ethers.js/commit/987b5354cc18ed41620c43910ac163f358d91b5d))
  - Removed deprecated errors package. ([f9e9347](https://github.com/ethers-io/ethers.js/commit/f9e9347e69133354c3d65c1f47475ddac8a793cf))
  - Updated badges in docs. ([d00362e](https://github.com/ethers-io/ethers.js/commit/d00362eb706cfbf9911611e8d934260061cfbbd2))
  - Create security policy. Create security policy. ([88e6849](https://github.com/ethers-io/ethers.js/commit/88e68495b67d9268ee66362b08c9b691d03ab58a))

ethers/v5.0.2 (2020-06-13 21:36)
--------------------------------

  - Allow provider.ready to stall until the network is available. ([#882](https://github.com/ethers-io/ethers.js/issues/882); [bbb4f40](https://github.com/ethers-io/ethers.js/commit/bbb4f407b34782c36ff93fa528e3b9f793987d4a))
  - Reduce dependencies to squash security issues. ([738d349](https://github.com/ethers-io/ethers.js/commit/738d34969d7c2184242b92f78228ba6a8aed1f3a))
  - Updated admin scripts for publishing prod releases. ([e0e0dbe](https://github.com/ethers-io/ethers.js/commit/e0e0dbef1830572c465670b826a7aa2b403ad2e8))

ethers/v5.0.1 (2020-06-12 23:09)
--------------------------------

  - Fixed embedded package version strings. ([5a69e9c](https://github.com/ethers-io/ethers.js/commit/5a69e9caa882aa5f1b44c4453d67cde43254eafe))

ethers/v5.0.0 (2020-06-12 19:58)
--------------------------------

  - Preserve config canary string. ([7157816](https://github.com/ethers-io/ethers.js/commit/7157816fa53f660d750811b293e3b1d5a2f70bd4))
  - Updated docs. ([9e4c7e6](https://github.com/ethers-io/ethers.js/commit/9e4c7e609d9eeb5f2a11d6a90bfa9d32ee696431))
