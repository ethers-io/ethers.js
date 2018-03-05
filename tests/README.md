Ethers Test Suite
=================

There are a lot of test cases, and it can take a while for them to all run.

Please be patient.


Running Tests
-------------

**Node.js:**

```
# Test everything (in node)
/Users/ricmoo/ethers.js> npm test

# Test everything (in phantomjs)
/Users/ricmoo/ethers.js> npm run-script test-phantomjs


# Test just one specific package

# Test the Solidity ABI coder
# - See tests/contract-interface.json.gz
/Users/ricmoo/ethers.js> ./node_modules/.bin/mocha test-contract-interface.js

# Test HD Wallet derivations
# - See tests/hdnode.json.gz
/Users/ricmoo/ethers.js> ./node_modules/.bin/mocha test-hdnode.js

# Test general utilities
# - See tests/namehash.json.gz
# - See tests/rlp-coder.json.gz
# - See tests/units.json.gz
/Users/ricmoo/ethers.js> ./node_modules/.bin/mocha test-utils.js

# Test accounts and addresses
# - See tests/accounts.json.gz
/Users/ricmoo/ethers.js> ./node_modules/.bin/mocha test-account.js

# Test encrypting/decrypting JSON wallets and transaction parsing/signing
# - See tests/transactions.json.gz
# - See tests/wallets.json.gz
/Users/ricmoo/ethers.js> ./node_modules/.bin/mocha test-wallet.js
```


Test Cases
----------

The testcases take up a large amount of space, so they are gzipped in the
`/tests/tests/` folder. See `/tests/utils.js` for saving and loading.

To dump a test case from the terminal, you can use:

```
/Users/ricmoo/ethers.js> cat ./tests/accounts.json.gz | gunzip
```


Building Testcases
------------------

Each suite of testcases is produced from a variety of sources. Many include a
specific set of test vecotrs as well as procedurally generated tests using known
correct implementations.

The `contract-interface` test cases are created by selecting a (deterministically) random
set of types and values, a solidity contract is then created to represent a contract with
the correct return types and values, which is then compiled and deployed to a local
Ethereum node, then executed once mined.

As a result, genearting the test cases can take quite some time. So, they are generated using
a separate set of files found in make-tests.

- make-accounts
- make-contract-interface
- make-hdnode
- makr-rlpcoder
- make-transaction
- make-wallets

Additional Test Vectors:
- **make-tests/test-mnemonics** -- The trezor test vectors for BIP39
- **make-tests/test-wallets** -- Sample JSON Wallets (crowdsale and Geth)

All generated JSON test files are then placed gzipped in `tests` with the extension '.json.gz'.


Adding Test Cases
-----------------

For any patch, feature upgrade or pull request of any sort, there must be relevant
test cases added and all test cases must pass.

If you report a bug and provide test cases, it will get attention sooner.

