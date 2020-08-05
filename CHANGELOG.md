Changelog
=========

This change log is managed by `scripts/cmds/update-versions` but may be manually updated.

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

