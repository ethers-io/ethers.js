-----

Documentation: [html](https://docs.ethers.io/)

-----

Testing
=======

Supported Platforms
-------------------

Test Suites
-----------

Test Suites



Test Suite API
--------------

#### *testcases* . **loadTests**( tag ) => *Array< TestCase >*

Load all the given testcases for the *tag*.

A tag is the string in the above list of test case names not including any extension (e.g. `"solidity-hashes"`)


#### *testcases* . *TestCase* . **TEST_NAME**

Most testcases have its schema available as a TypeScript type to make testing each property easier.


### Deterministic Random Numbers (DRNG)

#### *testcases* . **randomBytes**( seed , lower [ , upper ] ) => *Uint8Array*

Return at least *lower* random bytes, up to *upper* (exclusive) if specified, given *seed*. If *upper* is omitted, exactly */lower* bytes are returned.


#### *testcases* . **randomHexString**( seed , lower [ , upper ] ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString) >*

Identical to randomBytes, except returns the value as a [DataHexString](/v5/api/utils/bytes/#DataHexString) instead of a Uint8Array.


#### *testcases* . **randomNumber**( seed , lower , upper ) => *number*

Returns a random number of at least *lower* and less than *upper* given *seed*.


Schemas
-------

### Accounts

Properties



```
{
  "name":            "random-1023",
  "address":         "0x53bff74b9af2e3853f758a8d2bd61cd115d27782",
  "privateKey":      "0x8ab0e165c2ea461b01cdd49aec882d179dccdbdb5c85c3f9c94c448aa65c5ace",
  "checksumAddress": "0x53bFf74b9Af2E3853f758A8D2Bd61CD115d27782",
  "icapAddress":     "XE709S6NUSJR6SXQERCMYENAYYOZ2Y91M6A"
}
```

### Contract Interface

```
{
  "name":             "random-1999",
  "source":           "contract Test {\n    function test() constant returns (address, bool, bytes14[1]) {\n        address a = address(0x061C7F399Ee738c97C7b7cD840892B281bf772B5);\n        bool b = bool(true);\n        bytes14[1] memory c;\n        c[0] = bytes14(0x327621c4abe12d4f21804ed40455);\n        return (a, b, c);\n    }\n}\n",
  "types":            "[\"address\",\"bool\",\"bytes14[1]\"]",
  "interface":        "[{\"constant\":true,\"inputs\":[],\"name\":\"test\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"},{\"name\":\"\",\"type\":\"bool\"},{\"name\":\"\",\"type\":\"bytes14[1]\"}],\"type\":\"function\"}]\n",
  "bytecode":         "0x6060604052610175806100126000396000f360606040526000357c010000000000000000000000000000000000000000000000000000000090048063f8a8fd6d1461003957610037565b005b610046600480505061009d565b604051808473ffffffffffffffffffffffffffffffffffffffff1681526020018315158152602001826001602002808383829060006004602084601f0104600f02600301f150905001935050505060405180910390f35b600060006020604051908101604052806001905b60008152602001906001900390816100b157905050600060006020604051908101604052806001905b60008152602001906001900390816100da5790505073061c7f399ee738c97c7b7cd840892b281bf772b59250600191506d327621c4abe12d4f21804ed404557201000000000000000000000000000000000000028160006001811015610002579090602002019071ffffffffffffffffffffffffffffffffffff191690818152602001505082828295509550955061016d565b50505090919256",
  "result":           "0x000000000000000000000000061c7f399ee738c97c7b7cd840892b281bf772b50000000000000000000000000000000000000000000000000000000000000001327621c4abe12d4f21804ed40455000000000000000000000000000000000000",
  "values":           "[{\"type\":\"string\",\"value\":\"0x061C7F399Ee738c97C7b7cD840892B281bf772B5\"},{\"type\":\"boolean\",\"value\":true},[{\"type\":\"buffer\",\"value\":\"0x327621c4abe12d4f21804ed40455\"}]]",
  "normalizedValues": "[{\"type\":\"string\",\"value\":\"0x061C7F399Ee738c97C7b7cD840892B281bf772B5\"},{\"type\":\"boolean\",\"value\":true},[{\"type\":\"buffer\",\"value\":\"0x327621c4abe12d4f21804ed40455\"}]]",
  "runtimeBytecode":  "0x60606040526000357c010000000000000000000000000000000000000000000000000000000090048063f8a8fd6d1461003957610037565b005b610046600480505061009d565b604051808473ffffffffffffffffffffffffffffffffffffffff1681526020018315158152602001826001602002808383829060006004602084601f0104600f02600301f150905001935050505060405180910390f35b600060006020604051908101604052806001905b60008152602001906001900390816100b157905050600060006020604051908101604052806001905b60008152602001906001900390816100da5790505073061c7f399ee738c97c7b7cd840892b281bf772b59250600191506d327621c4abe12d4f21804ed404557201000000000000000000000000000000000000028160006001811015610002579090602002019071ffffffffffffffffffffffffffffffffffff191690818152602001505082828295509550955061016d565b50505090919256"
}
```

### Contract Signatures

```
{
  "name":      "random-1999",
  "sigHash":   "0xf51e9244",
  "abi":       "[{\"constant\":false,\"inputs\":[{\"name\":\"r0\",\"type\":\"string[2]\"},{\"name\":\"r1\",\"type\":\"uint128\"},{\"components\":[{\"name\":\"a\",\"type\":\"bytes\"},{\"name\":\"b\",\"type\":\"bytes\"},{\"name\":\"c\",\"type\":\"bytes\"}],\"name\":\"r2\",\"type\":\"tuple\"},{\"name\":\"r3\",\"type\":\"bytes\"}],\"name\":\"testSig\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"test\",\"outputs\":[{\"name\":\"r0\",\"type\":\"string[2]\"},{\"name\":\"r1\",\"type\":\"uint128\"},{\"components\":[{\"name\":\"a\",\"type\":\"bytes\"},{\"name\":\"b\",\"type\":\"bytes\"},{\"name\":\"c\",\"type\":\"bytes\"}],\"name\":\"r2\",\"type\":\"tuple\"},{\"name\":\"r3\",\"type\":\"bytes\"}],\"payable\":false,\"stateMutability\":\"pure\",\"type\":\"function\"}]",
  "signature": "testSig(string[2],uint128,(bytes,bytes,bytes),bytes)"
}
```

### Hashes

```
{
  "data":      "0x3718a88ceb214c1480c32a9d",
  "keccak256": "0x82d7d2dc3d384ddb289f41917b8280675bb1283f4fe2b601ac7c8f0a2c2824fa",
  "sha512":    "0xe93462bb1de62ba3e6a980c3cb0b61728d3f771cea9680b0fa947b6f8fb2198a2690a3a837495c753b57f936401258dfe333a819e85f958b7d786fb9ab2b066c",
  "sha256":    "0xe761d897e667aa72141dd729264c393c4ddda5c62312bbd21b0f4d954eba1a8d"
}
```

### Hierarchal Deterministic Node (BIP-32)

```
{
  "name":     "trezor-23",
  "entropy":  "0xf585c11aec520db57dd353c69554b21a89b20fb0650966fa0a9d6f74fd989d8f",
  "mnemonic": "void come effort suffer camp survey warrior heavy shoot primary clutch crush open amazing screen patrol group space point ten exist slush involve unfold",
  "locale":   "en",
  "password": "TREZOR",
  "hdnodes": [
    {
      "path":       "m",
      "address":    "0xfd8eb95169ce57eab52fb69bc6922e9b6454d9aa",
      "privateKey": "0x679bf92c04cf16307053cbed33784f3c4266b362bf5f3d7ee13bed6f2719743c"
    },
    {
      "address":    "0xada964e9f10c4fc9787f9e17f00c63fe188722b0",
      "privateKey": "0xdcbcb48a2b11eef0aab93a8f88d83f60a3aaabb34f9ffdbe939b8f059b30f2b7",
      "path":       "m/8'/8'/2/3/4"
    },
    {
      "privateKey": "0x10fd3776145dbeccb3d6925e4fdc0d58b452fce40cb8760b12f8b4223fafdfa6",
      "address":    "0xf3f6b1ef343d5f5f231a2287e801a46add43eb06",
      "path":       "m/1'/3'"
    },
    {
      "address":    "0xb7b0fdb6e0f79f0529e95400903321e8a601b411",
      "privateKey": "0x093a8ff506c95a2b79d397aed59703f6212ff3084731c2f03089b069ae76e69d",
      "path":       "m/8'/4'/7'"
    },
    {
      "path":       "m/7'/5'/11",
      "privateKey": "0x6bd79da4dfa7dd0abf566a011bdb7cba0d28bba9ca249ba25880d5dabf861b42",
      "address":    "0x1b3ad5fa50ae32875748107f4b2160829cc10536"
    },
    {
      "path":       "m/9'/6'/2'/7'/3'",
      "address":    "0x42eb4bed59f3291d02387cf0fb23098c55d82611",
      "privateKey": "0xfc173acba7bc8bb2c434965d9e99f5a221f81add421bae96a891d08d60be11dd"
    }
  ],
  "seed": "0x01f5bced59dec48e362f2c45b5de68b9fd6c92c6634f44d6d40aab69056506f0e35524a518034ddc1192e1dacd32c1ed3eaa3c3b131c88ed8e7e54c49a5d0998"
}
```

### ENS Namehash

```
{
  "expected": "0x33868cc5c3fd3a9cd3adbc1e868ea133d2218f60dc2660c3bc48d8b1f4961384",
  "name":     "ViTalIk.WALlet.Eth",
  "test":     "mixed case"
}
```

### RLP Coder

```
{
  "name":    "arrayWithNullString3",
  "encoded": "0xc3808080",
  "decoded": [ "0x", "0x", "0x" ]
}
```

### Solidity Hashes

```
{
  "name":      "random-1999",
  "keccak256": "0x7d98f1144a0cd689f720aa2f11f0a73bd52a2da1117175bc4bacd93c130966a1",
  "ripemd160": "0x59384617f8a06efd57ab106c9e0c20c3e64137ac000000000000000000000000",
  "sha256":    "0xf9aeea729ff39f8d372d8552bca81eb2a3c5d433dc8f98140040a03b7d81ac92",
  "values": [
    "0xcdffcb5242e6",
    "0xc1e101b60ebe4688",
    "0x5819f0ef5537796e43bdcd48309f717d6f7ccffa",
    "0xec3f3f9f",
    false,
    true
  ],
  "types": [
    "int184",
    "int176",
    "address",
    "int64",
    "bool",
    "bool"
  ]
}
```

### Transactions

```
{
  "name":                        "random-998",
  "privateKey":                  "0xd16c8076a15f7fb583f05dc12686fe526bc59d298f1eb7b9a237b458133d1dec",
  "signedTransactionChainId5":   "0xf8708391d450848517cfba8736fcf36da03ee4949577303fd4e0acbe72c6c116acab5bf63f0b1e9c8365fdc7827dc82ea059891894eb180cb7c6c45a52f62d2103420d3ad0bc3ba518d0a25ed910842522a0155c0ea2aee2ea82e75843aab297420bad907d46809d046b13d692928f4d78aa",
  "gasLimit":                    "0x36fcf36da03ee4",
  "to":                          "0x9577303fd4e0acbe72c6c116acab5bf63f0b1e9c",
  "data":                        "0x7dc8",
  "accountAddress":              "0x6d4a6aff30ca5ca4b8422eea0ebcb669c7d79859",
  "unsignedTransaction":         "0xed8391d450848517cfba8736fcf36da03ee4949577303fd4e0acbe72c6c116acab5bf63f0b1e9c8365fdc7827dc8",
  "nonce":                       "0x91d450",
  "gasPrice":                    "0x8517cfba",
  "signedTransaction":           "0xf8708391d450848517cfba8736fcf36da03ee4949577303fd4e0acbe72c6c116acab5bf63f0b1e9c8365fdc7827dc81ba05030832331e6be48c95e1569a1ca9505c495486f72d6009b3a30fadfa05d9686a05cd3116b416d2362da1e9b0ca7fb1856c4e591cc22e63b395bd881ce2d3735e6",
  "unsignedTransactionChainId5": "0xf08391d450848517cfba8736fcf36da03ee4949577303fd4e0acbe72c6c116acab5bf63f0b1e9c8365fdc7827dc8058080",
  "value":                       "0x65fdc7"
}
```

### Units

```
{
  "name":          "one-two-three-3",
  "gwei_format":   "-1234567890123456.789012345",
  "ether_format":  "-1234567.890123456789012345",
  "gwei":          "-1234567890123456.789012345",
  "ether":         "-1234567.890123456789012345",
  "finney":        "-1234567890.123456789012345",
  "wei":           "-1234567890123456789012345",
  "finney_format": "-1234567890.123456789012345"
}
```

### Wallets

```
{
  "mnemonic":   null,
  "name":       "secretstorage_password",
  "type":       "secret-storage",
  "password":   "foo",
  "privateKey": "0xf03e581353c794928373fb0893bc731aefc4c4e234e643f3a46998b03cd4d7c5",
  "hasAddress": true,
  "json":       "{\"address\":\"88a5c2d9919e46f883eb62f7b8dd9d0cc45bc290\",\"Crypto\":{\"cipher\":\"aes-128-ctr\",\"ciphertext\":\"10adcc8bcaf49474c6710460e0dc974331f71ee4c7baa7314b4a23d25fd6c406\",\"cipherparams\":{\"iv\":\"1dcdf13e49cea706994ed38804f6d171\"},\"kdf\":\"scrypt\",\"kdfparams\":{\"dklen\":32,\"n\":262144,\"p\":1,\"r\":8,\"salt\":\"bbfa53547e3e3bfcc9786a2cbef8504a5031d82734ecef02153e29daeed658fd\"},\"mac\":\"1cf53b5ae8d75f8c037b453e7c3c61b010225d916768a6b145adf5cf9cb3a703\"},\"id\":\"fb1280c0-d646-4e40-9550-7026b1be504a\",\"version\":3}\n",
  "address":    "0x88a5c2d9919e46f883eb62f7b8dd9d0cc45bc290"
}
```

