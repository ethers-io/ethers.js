CHANGELOG
=========

ethers/v4.0.40 (2019-11-24 19:58)
---------------------------------

  - Update elliptic package to protect from Minerva timing attack ([#666](https://github.com/ethers-io/ethers.js/issues/666); [20409c0](https://github.com/ethers-io/ethers.js/commit/20409c083cd428c46cba09488ee609cc14ff1d2b)).
  - Do not poll if disabled during the previous event loop. ([7a90f18](https://github.com/ethers-io/ethers.js/commit/7a90f18145931e7ff790cd9e1fd549929fbb9023)).
  - Moved node types to devDependencies ([#663](https://github.com/ethers-io/ethers.js/issues/663); [df1ae61](https://github.com/ethers-io/ethers.js/commit/df1ae611bab0955005b0da6604191b60b34f198f)).
  - Added provider property to Web3Provider ([#641](https://github.com/ethers-io/ethers.js/issues/641); [6009a26](https://github.com/ethers-io/ethers.js/commit/6009a26c89c359ae44ef4b6e8a664ed57db24f67)).

ethers/v4.0.39 (2019-10-30 19:15)
---------------------------------

  - Fix filters by forcing a poll instantly when polling starts to capture the current block. ([#613](https://github.com/ethers-io/ethers.js/issues/613); [d0e0e30](https://github.com/ethers-io/ethers.js/commit/d0e0e30532baf387df6b4a8efe0805986cc265f2))

ethers/v4.0.38 (2019-10-17 01:28)
---------------------------------

  - Fixed TypeScript 3.7-beta import issue. ([#622](https://github.com/ethers-io/ethers.js/issues/622); [0609ea9](https://github.com/ethers-io/ethers.js/commit/0609ea96519bf4afe6badc5f43c0d03ca91b8363))

ethers/v4.0.37 (2019-09-06 19:10)
---------------------------------

  - Added pkg.ethereum key for donations. ([#593](https://github.com/ethers-io/ethers.js/issues/593); [004cb82](https://github.com/ethers-io/ethers.js/commit/004cb826d2441cd5b0770161e66d351b2ba5abb5))
  - Fixed typo in error message. ([#592](https://github.com/ethers-io/ethers.js/issues/592); [bfcf224](https://github.com/ethers-io/ethers.js/commit/bfcf224b2bcfa10ff1a1250c3943d33daa98d6d8))
  - Fixed typo in error message. ([#580](https://github.com/ethers-io/ethers.js/issues/580); [c969fe5](https://github.com/ethers-io/ethers.js/commit/c969fe5a68a0703a892dc5ab6e09a6938ccc9e4c))
  - Fixed typo in error message. ([#574](https://github.com/ethers-io/ethers.js/issues/574); [8737f12](https://github.com/ethers-io/ethers.js/commit/8737f12e1bbeee477413e1d96c4124463256161e))

ethers/v4.0.36 (2019-08-26 16:09)
---------------------------------

  - Updated package-lock for security reasons; dev dependency only. ([11c250f](https://github.com/ethers-io/ethers.js/commit/11c250ff7c78fa6c28c1bc22f91ea214526c467d))
  - Fixed typo in error message. ([#592](https://github.com/ethers-io/ethers.js/issues/592); [c303199](https://github.com/ethers-io/ethers.js/commit/c303199d26d6c5959b1a85a24ca162a1e405c63b))
  - Fixed ENS lookupAddress when the resolver isn't configured. ([#581](https://github.com/ethers-io/ethers.js/issues/581); [760a5ae](https://github.com/ethers-io/ethers.js/commit/760a5aec74cfc2ce7467ae89214606500ed7a762))
  - Allow Secret Storage wallet address to be optional. ([#582](https://github.com/ethers-io/ethers.js/issues/582); [24f243e](https://github.com/ethers-io/ethers.js/commit/24f243e689112048df502e10dbc2935303280c4d))
  - Updated package-lock for lodash security advisory; the package is only a development dependency, so no urgent need to publish, just for developers. ([lodash/lodash#4336](https://github.com/lodash/lodash/pull/4336); [d719064](https://github.com/ethers-io/ethers.js/commit/d7190646280af9bb36352fc502ba7f6e84559026))

ethers/v4.0.33 (2019-07-09 20:17)
---------------------------------

  - Reduce number of HDNode tests which cause TravisCI to timeout. ([a7d0b41](https://github.com/ethers-io/ethers.js/commit/a7d0b41d9865ffb9bdda497f77c316938f44cd46))

ethers/v4.0.32 (2019-07-09 16:56)
---------------------------------

  - Added test cases for case-agnostic mnemonics. ([#557](https://github.com/ethers-io/ethers.js/issues/557); [a34ca6b](https://github.com/ethers-io/ethers.js/commit/a34ca6b3a38d0854d5b57c908d523a98262c0f53))
  - Make mnemonics case-agnostic. ([#557](https://github.com/ethers-io/ethers.js/issues/557); [ef91dcd](https://github.com/ethers-io/ethers.js/commit/ef91dcd757349dfb31ad2fbd0b840abe6a4043be))
  - Added tests for testnet extended private key. ([#553](https://github.com/ethers-io/ethers.js/issues/553); [a5296a9](https://github.com/ethers-io/ethers.js/commit/a5296a9258a475b6d3ebe4c6b848945a77ba4887))

ethers/v4.0.31 (2019-06-28 15:39)
---------------------------------

  - Fixed testnet exteneded private keys. ([#553](https://github.com/ethers-io/ethers.js/issues/553); [fbf15c0](https://github.com/ethers-io/ethers.js/commit/fbf15c0ffe046290749fe307e9d4e8624b81664a))

ethers/v4.0.30 (2019-06-21 19:18)
---------------------------------

  - No longer use hard-coded id of 42 in Web3Provider. ([384fc32](https://github.com/ethers-io/ethers.js/commit/384fc328f2989882bf6027b2af48efa02f2fab53))

ethers/v4.0.29 (2019-06-10 01:58)
---------------------------------

  - Fixed error in throwing an error for ABI decode. ([#539](https://github.com/ethers-io/ethers.js/issues/539); [92c978e](https://github.com/ethers-io/ethers.js/commit/92c978e5c20aca96a4297c7d494e154c3a796e71))

ethers/v4.0.28 (2019-05-24 14:57)
---------------------------------

  - Warn on deprecated INFURA API Token; use Project ID instead. ([#462](https://github.com/ethers-io/ethers.js/issues/462); [19587ee](https://github.com/ethers-io/ethers.js/commit/19587eea3f3fadc301ff4d949646b700ebb4a85b))
  - Fixed typo in error message. ([#470](https://github.com/ethers-io/ethers.js/issues/470); [4a9373e](https://github.com/ethers-io/ethers.js/commit/4a9373e773dd78c62f4f5127f8357001e5940a22))
  - Export poll function. ([#514](https://github.com/ethers-io/ethers.js/issues/514); [2997bae](https://github.com/ethers-io/ethers.js/commit/2997bae93599294935d1e467d8ede2960ee92e50))
  - Fixed error message for unconfigured ENS names. ([#504](https://github.com/ethers-io/ethers.js/issues/504); [7075c8c](https://github.com/ethers-io/ethers.js/commit/7075c8c2352ec306b5679da6fbe7c2ddf7bd65d1))
  - Fixed security recommendations (development deps only; not a problem, but quiets automatic audits). ([a4a532f](https://github.com/ethers-io/ethers.js/commit/a4a532fe8e6a9fd8ef2ff069ea1b6c9ae28c4e5a))

ethers/v4.0.27 (2019-04-18 07:50)
---------------------------------

  - Increment JSON-RPC ID for JsonRpcProviders for environments that unsafely manage callbacks. ([#489](https://github.com/ethers-io/ethers.js/issues/489); [c93b489](https://github.com/ethers-io/ethers.js/commit/c93b48920e4861b4fe35c60be19344abbb19a184))

ethers/v4.0.26 (2019-03-08 14:29)
---------------------------------

  - Added goerli to InfuraProvider. ([#421](https://github.com/ethers-io/ethers.js/issues/421); [16c9745](https://github.com/ethers-io/ethers.js/commit/16c974532603b6ed7e49cedd6ce11f2e92158bf0))

ethers/v4.0.25 (2019-02-15 13:43)
---------------------------------

  - Added fastRetry to polling for JsonRpcSigner to improve polling for sent transactions. ([#402](https://github.com/ethers-io/ethers.js/issues/402); [f318fd9](https://github.com/ethers-io/ethers.js/commit/f318fd9cf1303fe2770f400cbce14c778f77e454))
  - Fix waitForTransaction delay. ([#424](https://github.com/ethers-io/ethers.js/issues/424); [c15a898](https://github.com/ethers-io/ethers.js/commit/c15a89832b2fd8ab06b9ec655487cb50e8ded7c1))
  - Fixed waitForTransaction and removeListener. ([#410](https://github.com/ethers-io/ethers.js/issues/410); [72edcd0](https://github.com/ethers-io/ethers.js/commit/72edcd054fa78c52c82c33bcc7e389d93ff517ec))
  - Updated BIP39 list in readme. ([e4a2f8a](https://github.com/ethers-io/ethers.js/commit/e4a2f8ac6c5c9bb5fc30d5720e1457381c82e608))

ethers/v4.0.24 (2019-02-11 19:22)
---------------------------------

  - Fixed support for calling self-destructed contracts. ([#411](https://github.com/ethers-io/ethers.js/issues/411); [0ed983a](https://github.com/ethers-io/ethers.js/commit/0ed983a264077d74d23da194b580fc702e9139a9))
  - Updated balance address for Goerli test cases. ([8fab48a](https://github.com/ethers-io/ethers.js/commit/8fab48a3803f521a77ad8cfc7176f3b819996f88))
  - Fixed utils test case for phantomjs. ([a2306f7](https://github.com/ethers-io/ethers.js/commit/a2306f7870ab75802af95cc0eab7fa77ca17d8d8))
  - Initial support for EIP-234; filter by blockHash. ([#412](https://github.com/ethers-io/ethers.js/issues/412); [60b75c1](https://github.com/ethers-io/ethers.js/commit/60b75c10d702b5a04ec1e381191fe1cd5a93274c))
  - Fixed out-of-safe-range hexlify values to throw an exception. ([#420](https://github.com/ethers-io/ethers.js/issues/420); [41c2c8a](https://github.com/ethers-io/ethers.js/commit/41c2c8a729816226bc38a5bc0e73e0c573afe25d))
  - Added goerli testnet support. ([#421](https://github.com/ethers-io/ethers.js/issues/421); [9785eed](https://github.com/ethers-io/ethers.js/commit/9785eed8dd227234afbfcb0eef9892e6a7a2b187))
  - Fixed missing TypeArray slice on constrained environments. ([14484e5](https://github.com/ethers-io/ethers.js/commit/14484e566edf60a493acb1128708136d4205e606))
  - Fixed test-hdnode for phantomjs; does not support let keyword. ([429af2c](https://github.com/ethers-io/ethers.js/commit/429af2c40db40dc2ff1fd33409f198c2ab3c9b16))
  - Added xpub and xpriv deserialization. ([#405](https://github.com/ethers-io/ethers.js/issues/405); [af3aed4](https://github.com/ethers-io/ethers.js/commit/af3aed4580da47be1f89fce94c37b91012f92b91))
  - Added xpub and xpriv test cases for HD nodes. ([#405](https://github.com/ethers-io/ethers.js/issues/405); [3a3764b](https://github.com/ethers-io/ethers.js/commit/3a3764bdb4838c81dcd7afbb6eabd2792d3a5b00))
  - Support for xpub and xpriv derivation and generating extended keys; no fromExtendedKey yet. ([#405](https://github.com/ethers-io/ethers.js/issues/405); [18ee2c5](https://github.com/ethers-io/ethers.js/commit/18ee2c518c252a18fa172a8a7092c58cf6c0b7c5))

ethers/v4.0.23 (2019-01-25 19:09)
---------------------------------

  - Fixed duplicate events from triggering. ([#404](https://github.com/ethers-io/ethers.js/issues/404); [908258f](https://github.com/ethers-io/ethers.js/commit/908258f8d4c56b58f6826011a805c2e690d9a4a0))

ethers/v4.0.22 (2019-01-24 16:53)
---------------------------------

  - Ganache does not include from in receipts. ([#400](https://github.com/ethers-io/ethers.js/issues/400); [b5f720a](https://github.com/ethers-io/ethers.js/commit/b5f720ace6ac3e43beb2aaeda774f00f050192f4))
  - Added to and from for Transaction Receipts. ([#398](https://github.com/ethers-io/ethers.js/issues/398); [700dd34](https://github.com/ethers-io/ethers.js/commit/700dd3413718ecfa3800aab361c4c5b91d1a7137))
  - Added v3 INFURA end-points to InfuraProvider. ([#286](https://github.com/ethers-io/ethers.js/issues/286); [f2dd977](https://github.com/ethers-io/ethers.js/commit/f2dd977de4fb6216d6a990d13999644a9be5815d))
  - Fixed long-response bug in IpcProvider. ([#384](https://github.com/ethers-io/ethers.js/issues/384); [5f01321](https://github.com/ethers-io/ethers.js/commit/5f013216c5f51830ef3fd3f725d42272f7ae5c99))

ethers/v4.0.21 (2019-01-17 16:33)
---------------------------------

  - Fixed path for x-ethers metadata and wallet. ([#392](https://github.com/ethers-io/ethers.js/issues/392); [e5bee7e](https://github.com/ethers-io/ethers.js/commit/e5bee7e5a34ba9cfddae8e3c43de10a8060f911a))
  - Fixed contract removeAllListeners which did not clean up the event loop properly. ([#391](https://github.com/ethers-io/ethers.js/issues/391); [6d08968](https://github.com/ethers-io/ethers.js/commit/6d08968b8789976ee5a7ef23e3dd73e73342cf5b))

ethers/v4.0.20 (2018-12-27 15:49)
---------------------------------

  - Added customizable log levels to quiet warnings. ([#379](https://github.com/ethers-io/ethers.js/issues/379); [f3ec27b](https://github.com/ethers-io/ethers.js/commit/f3ec27b95fcb56d521952c708fdc0229f6d6f7f3))

ethers/v4.0.19 (2018-12-14 18:37)
---------------------------------

  - Allow unchecked transactions which will remain unwrapped for the JsonRpcSigner. ([#340](https://github.com/ethers-io/ethers.js/issues/340); [99a2166](https://github.com/ethers-io/ethers.js/commit/99a21660ab5b360cc4cbdba87dc54245c00565b9))
  - Make it easier for sub-classes of Wallet to manage nonces. ([4bc62a1](https://github.com/ethers-io/ethers.js/commit/4bc62a1e8a2c240ff567140b981c6bf9da57594f))

ethers/v4.0.18 (2018-12-12 16:57)
---------------------------------

  - Allow nonce to be a BigNumber. ([#228](https://github.com/ethers-io/ethers.js/issues/228); [bcba17a](https://github.com/ethers-io/ethers.js/commit/bcba17a9e76e9ff7867e3d8e32a508fc1582e003))
  - Fixed typo in error strings. ([#376](https://github.com/ethers-io/ethers.js/issues/376); [918b66b](https://github.com/ethers-io/ethers.js/commit/918b66bc2e176fc3c6f3088cc10b9d03e2df1f6e))
  - Add isHexString to exported utils. ([#367](https://github.com/ethers-io/ethers.js/issues/367); [152d672](https://github.com/ethers-io/ethers.js/commit/152d672278477321d6ff5dab03b2d1e812151f45))
  - Add abs method to BigNumber. ([#375](https://github.com/ethers-io/ethers.js/issues/375); [51fb472](https://github.com/ethers-io/ethers.js/commit/51fb4728091a30d147b7dcd61e08562c6171b372))
  - Better error messages for namehash. ([#364](https://github.com/ethers-io/ethers.js/issues/364); [66440b8](https://github.com/ethers-io/ethers.js/commit/66440b8542e80e056bd96d94a1be9fcbb1c9b2d7))

ethers/v4.0.17 (2018-12-08 18:47)
---------------------------------

  - Fixed function name in parsed transactions. ([#370](https://github.com/ethers-io/ethers.js/issues/370); [6ca1d77](https://github.com/ethers-io/ethers.js/commit/6ca1d772986482b8be467d97fd9cd3107c959ab5))
  - Include request body in web errors. ([4f6748e](https://github.com/ethers-io/ethers.js/commit/4f6748ec4cc432a1bc2097619a25b9e7ce2b2faa))
  - Squashed unhandled promise exception for Providers that are never used. ([#362](https://github.com/ethers-io/ethers.js/issues/362); [f56fc57](https://github.com/ethers-io/ethers.js/commit/f56fc572f159e6375db27caa1b3d464dd67803c7))
  - Added gas estimation back into JsonRpcSigner. ([#365](https://github.com/ethers-io/ethers.js/issues/365); [16fdf6b](https://github.com/ethers-io/ethers.js/commit/16fdf6b621fd45bb1d6ab4e636388d9e7a9028d2))

ethers/v4.0.16 (2018-12-04 17:17)
---------------------------------


ethers/v4.0.15 (2018-12-04 17:14)
---------------------------------

  - Do not fill in implicit values for JSON-RPC based signers. ([#335](https://github.com/ethers-io/ethers.js/issues/335); [2d854bd](https://github.com/ethers-io/ethers.js/commit/2d854bd94c799271ce5a2aa4f5ad17d22c8d8dc0))
  - More relaxed transaction parsing. ([#357](https://github.com/ethers-io/ethers.js/issues/357); [9565c28](https://github.com/ethers-io/ethers.js/commit/9565c28a91b558a96a3895ccfc03975efc639432))
  - Allow any whitespace characters in human-readable ABI. ([#360](https://github.com/ethers-io/ethers.js/issues/360); [bc457bb](https://github.com/ethers-io/ethers.js/commit/bc457bb3bde7f3c3f1ca2e8345cdf1a4e0701454))

ethers/v4.0.14 (2018-11-27 17:33)
---------------------------------

  - Fixed contract proxied tx.wait receipt properties. ([#355](https://github.com/ethers-io/ethers.js/issues/355); [3f76f60](https://github.com/ethers-io/ethers.js/commit/3f76f603d9de66cb38b8c5d2e2fc6f7c6794d234))

ethers/v4.0.13 (2018-11-27 15:60)
---------------------------------

  - Check for partially-working normalize support. ([bb6bc4c](https://github.com/ethers-io/ethers.js/commit/bb6bc4cac330120e691a4a0566ff547342f62c0c))
  - Support for platforms where UTF-8 is only half broken. ([ef8b9c3](https://github.com/ethers-io/ethers.js/commit/ef8b9c36ef42ce79d8b5db390eea3deec55d9a6b))
  - Throw exception instead of returning null for getDefaultProvider. ([#351](https://github.com/ethers-io/ethers.js/issues/351); [31d3ee8](https://github.com/ethers-io/ethers.js/commit/31d3ee899f4331cb75952eceb07b9a8ad7b30e9f))

ethers/v4.0.12 (2018-11-20 15:42)
---------------------------------

  - Added default provider support for Ethereum classic. ([#351](https://github.com/ethers-io/ethers.js/issues/351); [bffc557](https://github.com/ethers-io/ethers.js/commit/bffc557be1b84ae2b69edd5071f7a072c94421e9))

ethers/v4.0.11 (2018-11-13 07:49)
---------------------------------

  - Fixed 0 confirmation waiting. ([#346](https://github.com/ethers-io/ethers.js/issues/346); [048c571](https://github.com/ethers-io/ethers.js/commit/048c571d3d307f6b5a0094865b54106f6d7c5ffa))

ethers/v4.0.10 (2018-11-12 17:23)
---------------------------------

  - Fix spacing in checkArgument errors. ([#318](https://github.com/ethers-io/ethers.js/issues/318); [88f2f51](https://github.com/ethers-io/ethers.js/commit/88f2f51266a66cc8a5934ef5371e0458d08a46e8))
  - Do not replay block events when the provider event block is reset. ([#343](https://github.com/ethers-io/ethers.js/issues/343); [93152ef](https://github.com/ethers-io/ethers.js/commit/93152ef86394720e911aaf98011013e6dae87c77))

ethers/v4.0.9 (2018-11-09 14:37)
--------------------------------

  - Force unorm shim when String.prototype.normalize is broken. ([#338](https://github.com/ethers-io/ethers.js/issues/338); [478aaf9](https://github.com/ethers-io/ethers.js/commit/478aaf9619bd2e75e559ac73f1e007457480cb61))
  - Better error message when normalize is missing. ([fad902b](https://github.com/ethers-io/ethers.js/commit/fad902b438ee86d5ade3adc6bd4cd4e4a6c9348d))
  - Added shims for React-Native support. ([7bfaf29](https://github.com/ethers-io/ethers.js/commit/7bfaf292db90f3e25d5563cff63517ae61f88617))

ethers/v4.0.8 (2018-11-08 16:04)
--------------------------------

  - Updated dist files. ([be0488a](https://github.com/ethers-io/ethers.js/commit/be0488a1a02fffb6a31906a674b4a81da2cffd38))

ethers/v4.0.7 (2018-11-08 16:02)
--------------------------------

  - Fix for when blockTag is specified as a null equivalent value in contract overrides. ([#329](https://github.com/ethers-io/ethers.js/issues/329); [28a52cd](https://github.com/ethers-io/ethers.js/commit/28a52cd485f48599ced1cbf58535e41e179a69bf))
  - Added "debug" event for providers; do not depend on the format as it may change, but this should help debugging in most cases. ([#320](https://github.com/ethers-io/ethers.js/issues/320); [3a19f43](https://github.com/ethers-io/ethers.js/commit/3a19f43844b3161d536455ee0cbb0712263cd061))
  - Fix for Kovan filters without an address. ([#339](https://github.com/ethers-io/ethers.js/issues/339); [4852e83](https://github.com/ethers-io/ethers.js/commit/4852e837d2f47b70038136f3a702e9e127ad6c9c))

ethers/v4.0.6 (2018-10-14 19:02)
--------------------------------

  - Fixed lingering polling timer when no events left to process in a provider. ([d54609a](https://github.com/ethers-io/ethers.js/commit/d54609a4582b96bbf0bcb8395f0e01b8784a1369))
  - Fixed utils.poll from mutating passed variables. ([f682861](https://github.com/ethers-io/ethers.js/commit/f682861e0b420e1dc8123587734600cb00f91f06))
  - Fixed and refactored populating transaction values for signers. ([#306](https://github.com/ethers-io/ethers.js/issues/306); [023a20f](https://github.com/ethers-io/ethers.js/commit/023a20ff470f73a91a72d57bc85dfafd77255d4e))
  - Fixed test cases for phantomjs (must use ES3 syntax). ([e39cd84](https://github.com/ethers-io/ethers.js/commit/e39cd849236bf33f32168cfaaab0faf64e0ba69d))

ethers/v4.0.5 (2018-10-13 17:18)
--------------------------------

  - Fixed filtering with null non-indexed parameters. ([#305](https://github.com/ethers-io/ethers.js/issues/305); [6ac2d92](https://github.com/ethers-io/ethers.js/commit/6ac2d923b75526ab663a677f6a712f5400c2a621))

ethers/v4.0.4 (2018-10-11 16:04)
--------------------------------

  - Added optional blockTag to call; note that this may not behave as expected on all nodes. ([#226](https://github.com/ethers-io/ethers.js/issues/226); [493273d](https://github.com/ethers-io/ethers.js/commit/493273d698b9cc71ce1c0555f9df2bd791cd851e))
  - Check all transaction parameters are valid; protect against typos. ([#299](https://github.com/ethers-io/ethers.js/issues/299); [84344ac](https://github.com/ethers-io/ethers.js/commit/84344ac4c2a2502234373c24c0f02d8912417039))

ethers/v4.0.3 (2018-10-07 01:10)
--------------------------------

  - Added address to HDNode. ([#196](https://github.com/ethers-io/ethers.js/issues/196); [e39e2ed](https://github.com/ethers-io/ethers.js/commit/e39e2ed718364cfccb6921518500dd19f2a479fe))
  - Added French and Spanish to test-hdnode. ([71f781d](https://github.com/ethers-io/ethers.js/commit/71f781d5425f08fe3c88861e23b8a55860b3d074))
  - Mark progressCallback as optional. ([#293](https://github.com/ethers-io/ethers.js/issues/293); [b2db10e](https://github.com/ethers-io/ethers.js/commit/b2db10e216748e4c4d5d359bded904af7bd1128f))

ethers/v4.0.2 (2018-10-04 19:55)
--------------------------------

  - Added automatic event parsing for contract transaction receipts from tx.wait. ([2481581](https://github.com/ethers-io/ethers.js/commit/248158130e437b14f9d42666e0cdefa33a6be74d))
  - Added ability to wait for a specific number of confirmations. ([#229](https://github.com/ethers-io/ethers.js/issues/229); [f5c7ccb](https://github.com/ethers-io/ethers.js/commit/f5c7ccbb80e157ad27a51f310686d4ca3e1db7c8))
  - Fix for geth-etc. (official geth is fine; [24335d0](https://github.com/ethers-io/ethers.js/commit/24335d0dd71d11a2a9088c05728ed8507062434d))
  - Fixed confirmations tests and bootstrap fast blockNumber. ([908c2c1](https://github.com/ethers-io/ethers.js/commit/908c2c1096920c729669d8abc0fad10ad8f5b7e7))
  - Added confirmations to TransactionResponse. ([#156](https://github.com/ethers-io/ethers.js/issues/156); [#238](https://github.com/ethers-io/ethers.js/issues/238); [9797b36](https://github.com/ethers-io/ethers.js/commit/9797b36186add496aafc29c96b44d61fa62b23e3))
  - Fixed nested errors for providers that were masking true error. ([#292](https://github.com/ethers-io/ethers.js/issues/292); [731f189](https://github.com/ethers-io/ethers.js/commit/731f189010f03b22c085fa87f197d77988d7d0c2))
  - Added version to errors. ([99fed75](https://github.com/ethers-io/ethers.js/commit/99fed75202c19b976fa744d7e27c230da12f0f10))
  - Fixed French and Spanish for browsers without Uint8Array.forEach. ([cb5f9f5](https://github.com/ethers-io/ethers.js/commit/cb5f9f576aa6747f4ce85b727ea1c3b62c8fd047))
  - Added French and Spanish includes to phantomjs test page. ([aeac2cd](https://github.com/ethers-io/ethers.js/commit/aeac2cdb867380f3fc321c3b8cc1f5e733bb0d22))
  - Increased timeout for querying npm registry. ([0dafd83](https://github.com/ethers-io/ethers.js/commit/0dafd83033d16b73dc0d744cfd00d045e9623bd6))

ethers/v4.0.1 (2018-10-03 20:02)
--------------------------------

  - Added French and Spanish wordlist dist files. ([b9c07b5](https://github.com/ethers-io/ethers.js/commit/b9c07b549ca23b11bfac9abc147cad75a6db17b5))
  - Added French and Spanish BIP-39 wordlists. ([#191](https://github.com/ethers-io/ethers.js/issues/191); [c34a1f7](https://github.com/ethers-io/ethers.js/commit/c34a1f73c6e05a098bd15e760971f68c0a471770))
  - Added support for JSON serialized BigNumbers in the constructor. ([#288](https://github.com/ethers-io/ethers.js/issues/288); [281bd06](https://github.com/ethers-io/ethers.js/commit/281bd0613d9da2542b519122496387e9e25c51ac))
  - Fixed scrypt for long passwords. ([#223](https://github.com/ethers-io/ethers.js/issues/223); [d936b4c](https://github.com/ethers-io/ethers.js/commit/d936b4cd09126f395d5478b65c076049e560940c))

ethers/v4.0.0 (2018-10-01 17:34)
--------------------------------

  - Initial v4 release

