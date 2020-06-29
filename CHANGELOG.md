Changelog
=========

This change log is managed by `scripts/cmds/update-versions` but may be manually updated.

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

