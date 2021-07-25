-----

Documentation: [html](https://docs.ethers.io/)

-----

ABI Formats
===========

Human-Readable ABI
------------------

```javascript
const humanReadableAbi = [

  // Simple types
  "constructor(string symbol, string name)",
  "function transferFrom(address from, address to, uint value)",
  "function balanceOf(address owner) view returns (uint balance)",
  "event Transfer(address indexed from, address indexed to, address value)",
  "error InsufficientBalance(account owner, uint balance)",

  // Some examples with the struct type, we use the tuple keyword:
  // (note: the tuple keyword is optional, simply using additional
  //        parentheses accomplishes the same thing)
  // struct Person {
  //   string name;
  //   uint16 age;
  // }
  "function addPerson(tuple(string name, uint16 age) person)",
  "function addPeople(tuple(string name, uint16 age)[] person)",
  "function getPerson(uint id) view returns (tuple(string name, uint16 age))",

  "event PersonAdded(uint indexed id, tuple(string name, uint16 age) person)"
];

//_hide: _page.humanReadableAbi = humanReadableAbi;
```

Solidity JSON ABI
-----------------

```javascript
const jsonAbi = `[
  {
    "type": "constructor",
    "payable": false,
    "inputs": [
      { "type": "string", "name": "symbol" },
      { "type": "string", "name": "name" }
    ]
  },
  {
    "type": "function",
    "name": "transferFrom",
    "constant": false,
    "payable": false,
    "inputs": [
      { "type": "address", "name": "from" },
      { "type": "address", "name": "to" },
      { "type": "uint256", "name": "value" }
    ],
    "outputs": [ ]
  },
  {
    "type": "function",
    "name": "balanceOf",
    "constant":true,
    "stateMutability": "view",
    "payable":false, "inputs": [
      { "type": "address", "name": "owner"}
    ],
    "outputs": [
      { "type": "uint256"}
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "Transfer",
    "inputs": [
      { "type": "address", "name": "from", "indexed":true},
      { "type": "address", "name": "to", "indexed":true},
      { "type": "address", "name": "value"}
    ]
  },
  {
    "type": "error",
    "name": "InsufficientBalance",
    "inputs": [
      { "type": "account", "name": "owner"},
      { "type": "uint256", "name": "balance"}
    ]
  },
  {
    "type": "function",
    "name": "addPerson",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "tuple",
        "name": "person",
        "components": [
          { "type": "string", "name": "name" },
          { "type": "uint16", "name": "age" }
        ]
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "addPeople",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "tuple[]",
        "name": "person",
        "components": [
          { "type": "string", "name": "name" },
          { "type": "uint16", "name": "age" }
        ]
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "getPerson",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      { "type": "uint256", "name": "id" }
    ],
    "outputs": [
      {
        "type": "tuple",
        "components": [
          { "type": "string", "name": "name" },
          { "type": "uint16", "name": "age" }
        ]
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "PersonAdded",
    "inputs": [
      { "type": "uint256", "name": "id", "indexed": true },
      {
        "type": "tuple",
        "name": "person",
        "components": [
          { "type": "string", "name": "name", "indexed": false },
          { "type": "uint16", "name": "age", "indexed": false }
        ]
      }
    ]
  }
]`;

//_hide: _page.jsonAbi = jsonAbi;
```

Solidity Object ABI
-------------------

Converting Between Formats
--------------------------

```javascript
//_hide: const Interface = ethers.utils.Interface;
//_hide: const FormatTypes = ethers.utils.FormatTypes;
//_hide: jsonAbi = _page.jsonAbi;

// Using the "full" format will ensure the Result objects
// have named properties, which improves code readability
const iface = new Interface(jsonAbi);
//_result:
iface.format(FormatTypes.full);
//_log:
```

```javascript
//_hide: const Interface = ethers.utils.Interface;
//_hide: const FormatTypes = ethers.utils.FormatTypes;
//_hide: jsonAbi = _page.jsonAbi;

// Using the "minimal" format will save a small amount of
// space, but is generally not worth it as named properties
// on Results will not be available
const iface = new Interface(jsonAbi);
//_result:
iface.format(FormatTypes.minimal);
//_log:
```

```javascript
//_hide: const Interface = ethers.utils.Interface;
//_hide: const FormatTypes = ethers.utils.FormatTypes;
//_hide: humanReadableAbi = _page.humanReadableAbi;

// Sometimes you may need to export a Human-Readable ABI to
// JSON for tools that do not have Human-Readable support

// For compactness, the JSON is kept with minimal white-space
const iface = new Interface(humanReadableAbi);
//_result:
jsonAbi = iface.format(FormatTypes.json);
//_log:

// However it is easy to use JSON.parse and JSON.stringify
// with formatting parameters to assist with readability
//_result:
JSON.stringify(JSON.parse(jsonAbi), null, 2);
//_log:
```

