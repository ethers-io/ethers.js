# HederaProvider

### HederaProvider (inherits **BaseProvider)**

Provides support for connecting to custom network by specifying consensus and mirror node url.

```typescript
const consensusNodeId = '0.0.3';
const consensusNodeUrl = '0.testnet.hedera.com:50211';
const mirrorNodeUrl = 'https://testnet.mirrornode.hedera.com';
const provider1 = new hethers.providers.HederaProvider(consensusNodeId, consensusNodeUrl, mirrorNodeUrl);
```
